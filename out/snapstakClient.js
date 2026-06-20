"use strict";
/**
 * SnapStak API Client
 * Handles HMAC-signed authentication and all communication with the SnapStak server.
 *
 * Auth flow:
 *   1. POST /api/plugin/auth  (HMAC signed) → receives 8h session JWT
 *   2. All subsequent calls   (Bearer JWT)  → fast, no re-signing
 *   3. On 401                              → re-authenticate transparently
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapStakClient = void 0;
const crypto = __importStar(require("crypto"));
const vscode = __importStar(require("vscode"));
class SnapStakClient {
    constructor(secretStorage) {
        this.sessionToken = null;
        this.secretStorage = secretStorage;
    }
    // ─────────────────────────────────────────────────────────
    // SERVER URL
    // ─────────────────────────────────────────────────────────
    getServerUrl() {
        const config = vscode.workspace.getConfiguration('snapstak');
        return config.get('serverUrl', 'http://localhost:3001');
    }
    // ─────────────────────────────────────────────────────────
    // HMAC SIGNING
    // Signs: HMAC-SHA256( apiKey, "machineId:timestamp:nonce" )
    // ─────────────────────────────────────────────────────────
    buildSecurityHeaders(apiKey) {
        const machineId = vscode.env.machineId;
        const timestamp = Date.now().toString();
        const nonce = crypto.randomUUID();
        const payload = `${machineId}:${timestamp}:${nonce}`;
        const signature = crypto
            .createHmac('sha256', apiKey)
            .update(payload)
            .digest('hex');
        return {
            'x-snapstak-key': apiKey,
            'x-machine-id': machineId,
            'x-machine-label': `VS Code ${vscode.version}`,
            'x-timestamp': timestamp,
            'x-nonce': nonce,
            'x-signature': signature,
            'Content-Type': 'application/json'
        };
    }
    // ─────────────────────────────────────────────────────────
    // SESSION TOKEN (stored in VS Code SecretStorage)
    // ─────────────────────────────────────────────────────────
    async loadStoredSession() {
        const token = await this.secretStorage.get(SnapStakClient.TOKEN_KEY);
        if (token) {
            this.sessionToken = token;
            return true;
        }
        return false;
    }
    async saveSession(token, userId) {
        this.sessionToken = token;
        await this.secretStorage.store(SnapStakClient.TOKEN_KEY, token);
        await this.secretStorage.store(SnapStakClient.USER_ID_KEY, userId.toString());
    }
    async clearSession() {
        this.sessionToken = null;
        await this.secretStorage.delete(SnapStakClient.TOKEN_KEY);
        await this.secretStorage.delete(SnapStakClient.API_KEY_KEY);
        await this.secretStorage.delete(SnapStakClient.USER_ID_KEY);
        await this.secretStorage.delete(SnapStakClient.WORKSPACE_NAME_KEY);
        await this.secretStorage.delete('snapstak.userName');
        await this.secretStorage.delete('snapstak.userEmail');
    }
    async getStoredApiKey() {
        return this.secretStorage.get(SnapStakClient.API_KEY_KEY);
    }
    async storeApiKey(apiKey) {
        await this.secretStorage.store(SnapStakClient.API_KEY_KEY, apiKey);
    }
    async getStoredUserId() {
        return this.secretStorage.get(SnapStakClient.USER_ID_KEY);
    }
    async getStoredWorkspaceName() {
        return this.secretStorage.get(SnapStakClient.WORKSPACE_NAME_KEY);
    }
    async storeWorkspaceName(workspaceName) {
        await this.secretStorage.store(SnapStakClient.WORKSPACE_NAME_KEY, workspaceName);
    }
    isAuthenticated() {
        return this.sessionToken !== null;
    }
    // ─────────────────────────────────────────────────────────
    // AUTHENTICATE (HMAC → JWT session token)
    // ─────────────────────────────────────────────────────────
    async authenticate(apiKey) {
        const url = `${this.getServerUrl()}/api/plugin/auth`;
        const headers = this.buildSecurityHeaders(apiKey);
        const response = await fetch(url, {
            method: 'POST',
            headers: headers
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.error || `Authentication failed (${response.status})`);
        }
        // Store API key and session token
        await this.storeApiKey(apiKey);
        await this.saveSession(data.sessionToken, data.userId);
        // Fetch real name from DB via /api/plugin/me — auth response never includes name
        await this.fetchAndStoreUserProfile();
        return data;
    }
    // ─────────────────────────────────────────────────────────
    // AUTHENTICATED REQUESTS (Bearer JWT)
    // Auto re-authenticates on 401
    // ─────────────────────────────────────────────────────────
    async request(method, path, body) {
        if (!this.sessionToken) {
            throw new Error('Not authenticated. Please enter your SnapStak API key.');
        }
        const url = `${this.getServerUrl()}${path}`;
        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${this.sessionToken}`,
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : undefined
        });
        // Token expired — try to re-authenticate transparently
        if (response.status === 401) {
            const storedKey = await this.getStoredApiKey();
            if (storedKey) {
                await this.authenticate(storedKey);
                return this.request(method, path, body); // Retry once
            }
            throw new Error('Session expired. Please re-enter your SnapStak API key.');
        }
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || `Request failed (${response.status})`);
        }
        return response.json();
    }
    // ─────────────────────────────────────────────────────────
    // API METHODS
    // ─────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    // FETCH USER PROFILE — called after every authentication
    // Hits /api/plugin/me (plugin-scoped JWT) to get the real
    // name from the database. This is what goes into billing
    // records and workspace creation — must be correct.
    // ─────────────────────────────────────────────────────────
    async fetchAndStoreUserProfile() {
        try {
            const data = await this.request('GET', '/api/plugin/me');
            const name = data.name || data.email || '';
            if (name) {
                await this.secretStorage.store('snapstak.userName', name);
                console.log(`[SnapStak] User name stored from DB: ${name}`);
            }
        }
        catch (err) {
            console.warn(`[SnapStak] Could not fetch user profile: ${err.message}`);
        }
    }
    // ─────────────────────────────────────────────────────────
    // CREATE WORKSPACE
    // Called when user opens a zip — creates the workspace on the
    // SnapStak server using the zip filename as the workspace name.
    // ─────────────────────────────────────────────────────────
    async createWorkspace(workspaceName) {
        const uid = await this.secretStorage.get(SnapStakClient.USER_ID_KEY) ?? '';
        const userName = await this.secretStorage.get('snapstak.userName') ?? uid;
        if (!uid) {
            throw new Error('Not signed in. Please enter your SnapStak API key first.');
        }
        // Sanitize: replace underscores with hyphens, strip anything not letter/number/hyphen
        const sanitizedName = workspaceName
            .replace(/_/g, '-')
            .replace(/[^a-zA-Z0-9-]/g, '')
            .replace(/-{2,}/g, '-') // collapse consecutive hyphens
            .replace(/^-|-$/g, ''); // trim leading/trailing hyphens
        const result = await this.request('POST', '/api/workspaces/create', {
            workspaceName: sanitizedName,
            uid,
            userName
        });
        // Persist the sanitized workspace name so databaseCanvasPanel can read it
        await this.storeWorkspaceName(sanitizedName);
        return result;
    }
    async getWorkspaces() {
        const data = await this.request('GET', '/api/plugin/workspaces');
        return data.workspaces;
    }
    async getWorkspace(workspaceId) {
        const data = await this.request('GET', `/api/plugin/workspace/${workspaceId}`);
        return data.workspace;
    }
    async signOut() {
        try {
            await this.request('POST', '/api/plugin/deregister');
        }
        catch {
            // Best effort — clear local session regardless
        }
        await this.clearSession();
    }
    // ─────────────────────────────────────────────────────────
    // COPYWRITER AI CALLS
    // All route through SnapStak server via existing Bearer JWT auth
    // ─────────────────────────────────────────────────────────
    async copywriterGenerateDescription(keywords) {
        const uid = await this.secretStorage.get(SnapStakClient.USER_ID_KEY) ?? '';
        if (!uid) {
            throw new Error('Not signed in. Please enter your SnapStak API key first.');
        }
        const data = await this.request('POST', '/api/copywriter/generate-description', { uid, keywords });
        return data.description;
    }
    async copywriterGenerateHeading(blockId, originalHeading, headingTag, wordCount, businessDescription, keywords) {
        const uid = await this.secretStorage.get(SnapStakClient.USER_ID_KEY) ?? '';
        if (!uid) {
            throw new Error('Not signed in. Please enter your SnapStak API key first.');
        }
        const data = await this.request('POST', '/api/copywriter/generate-heading', { uid, blockId, originalHeading, headingTag, wordCount, businessDescription, keywords });
        return data.heading;
    }
    async copywriterGenerateAllHeadings(blocks, businessDescription) {
        const uid = await this.secretStorage.get(SnapStakClient.USER_ID_KEY) ?? '';
        if (!uid) {
            throw new Error('Not signed in. Please enter your SnapStak API key first.');
        }
        const data = await this.request('POST', '/api/copywriter/generate-headings', { uid, blocks, businessDescription });
        return data.headings;
    }
    async copywriterRewriteBody(blockId, confirmedHeading, originalText, wordCountTarget, businessDescription, retryContext) {
        const data = await this.request('POST', '/api/copywriter/rewrite-body', { blockId, confirmedHeading, originalText, wordCountTarget, businessDescription, retryContext });
        return data;
    }
}
exports.SnapStakClient = SnapStakClient;
// Storage keys
SnapStakClient.TOKEN_KEY = 'snapstak.sessionToken';
SnapStakClient.API_KEY_KEY = 'snapstak.apiKey';
SnapStakClient.USER_ID_KEY = 'snapstak.userId';
SnapStakClient.WORKSPACE_NAME_KEY = 'snapstak.workspaceName';
//# sourceMappingURL=snapstakClient.js.map