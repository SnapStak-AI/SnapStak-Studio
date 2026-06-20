/**
 * SnapStak API Client
 * Handles HMAC-signed authentication and all communication with the SnapStak server.
 * 
 * Auth flow:
 *   1. POST /api/plugin/auth  (HMAC signed) → receives 8h session JWT
 *   2. All subsequent calls   (Bearer JWT)  → fast, no re-signing
 *   3. On 401                              → re-authenticate transparently
 */

import * as crypto from 'crypto';
import * as vscode from 'vscode';

export interface PluginAuthResult {
    success: boolean;
    userId: number;
    sessionToken: string;
    expiresIn: string;
    userName: string;
    userEmail: string;
}

export interface Workspace {
    id: number;
    name: string;
    workspace_path: string;
    created_at: string;
    updated_at: string;
}

export interface CreateWorkspaceResult {
    success: boolean;
    workspaceId: number;
    workspaceName: string;
    domain: string;
}

export interface CopywriterContentNode {
    text: string;
    wordCount: number;
    tag: string;
    type: 'bodyText' | 'button' | 'link';
}

export interface CopywriterBlock {
    blockId: string;
    heading: {
        tag: 'H1' | 'H2' | 'H3';
        text: string;
        wordCount: number;
    };
    bodyText: CopywriterContentNode[];
    buttons: CopywriterContentNode[];
    links: CopywriterContentNode[];
}

export class SnapStakClient {

    private sessionToken: string | null = null;
    private readonly secretStorage: vscode.SecretStorage;

    // Storage keys
    private static readonly TOKEN_KEY = 'snapstak.sessionToken';
    private static readonly API_KEY_KEY = 'snapstak.apiKey';
    private static readonly USER_ID_KEY = 'snapstak.userId';
    private static readonly WORKSPACE_NAME_KEY = 'snapstak.workspaceName';

    constructor(secretStorage: vscode.SecretStorage) {
        this.secretStorage = secretStorage;
    }

    // ─────────────────────────────────────────────────────────
    // SERVER URL
    // ─────────────────────────────────────────────────────────

    private getServerUrl(): string {
        const config = vscode.workspace.getConfiguration('snapstak');
        return config.get<string>('serverUrl', 'http://localhost:3001');
    }

    // ─────────────────────────────────────────────────────────
    // HMAC SIGNING
    // Signs: HMAC-SHA256( apiKey, "machineId:timestamp:nonce" )
    // ─────────────────────────────────────────────────────────

    private buildSecurityHeaders(apiKey: string): Record<string, string> {
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

    async loadStoredSession(): Promise<boolean> {
        const token = await this.secretStorage.get(SnapStakClient.TOKEN_KEY);
        if (token) {
            this.sessionToken = token;
            return true;
        }
        return false;
    }

    private async saveSession(token: string, userId: number): Promise<void> {
        this.sessionToken = token;
        await this.secretStorage.store(SnapStakClient.TOKEN_KEY, token);
        await this.secretStorage.store(SnapStakClient.USER_ID_KEY, userId.toString());
    }

    async clearSession(): Promise<void> {
        this.sessionToken = null;
        await this.secretStorage.delete(SnapStakClient.TOKEN_KEY);
        await this.secretStorage.delete(SnapStakClient.API_KEY_KEY);
        await this.secretStorage.delete(SnapStakClient.USER_ID_KEY);
        await this.secretStorage.delete(SnapStakClient.WORKSPACE_NAME_KEY);
        await this.secretStorage.delete('snapstak.userName');
        await this.secretStorage.delete('snapstak.userEmail');
    }

    async getStoredApiKey(): Promise<string | undefined> {
        return this.secretStorage.get(SnapStakClient.API_KEY_KEY);
    }

    async storeApiKey(apiKey: string): Promise<void> {
        await this.secretStorage.store(SnapStakClient.API_KEY_KEY, apiKey);
    }

    async getStoredUserId(): Promise<string | undefined> {
        return this.secretStorage.get(SnapStakClient.USER_ID_KEY);
    }

    async getStoredWorkspaceName(): Promise<string | undefined> {
        return this.secretStorage.get(SnapStakClient.WORKSPACE_NAME_KEY);
    }

    async storeWorkspaceName(workspaceName: string): Promise<void> {
        await this.secretStorage.store(SnapStakClient.WORKSPACE_NAME_KEY, workspaceName);
    }

    isAuthenticated(): boolean {
        return this.sessionToken !== null;
    }

    // ─────────────────────────────────────────────────────────
    // AUTHENTICATE (HMAC → JWT session token)
    // ─────────────────────────────────────────────────────────

    async authenticate(apiKey: string): Promise<PluginAuthResult> {
        const url = `${this.getServerUrl()}/api/plugin/auth`;
        const headers = this.buildSecurityHeaders(apiKey);

        const response = await fetch(url, {
            method: 'POST',
            headers: headers
        });

        const data = await response.json() as PluginAuthResult;

        if (!response.ok || !data.success) {
            throw new Error((data as any).error || `Authentication failed (${response.status})`);
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

    private async request<T>(
        method: string,
        path: string,
        body?: unknown
    ): Promise<T> {
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
                return this.request<T>(method, path, body); // Retry once
            }
            throw new Error('Session expired. Please re-enter your SnapStak API key.');
        }

        if (!response.ok) {
            const err = await response.json().catch(() => ({})) as any;
            throw new Error(err.error || `Request failed (${response.status})`);
        }

        return response.json() as Promise<T>;
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

    async fetchAndStoreUserProfile(): Promise<void> {
        try {
            const data = await this.request<{ success: boolean; name?: string; email?: string }>(
                'GET', '/api/plugin/me'
            );
            const name = data.name || data.email || '';
            if (name) {
                await this.secretStorage.store('snapstak.userName', name);
                console.log(`[SnapStak] User name stored from DB: ${name}`);
            }
        } catch (err: any) {
            console.warn(`[SnapStak] Could not fetch user profile: ${err.message}`);
        }
    }

    // ─────────────────────────────────────────────────────────
    // CREATE WORKSPACE
    // Called when user opens a zip — creates the workspace on the
    // SnapStak server using the zip filename as the workspace name.
    // ─────────────────────────────────────────────────────────

    async createWorkspace(workspaceName: string): Promise<CreateWorkspaceResult> {
        const uid = await this.secretStorage.get(SnapStakClient.USER_ID_KEY) ?? '';
        const userName = await this.secretStorage.get('snapstak.userName') ?? uid;

        if (!uid) {
            throw new Error('Not signed in. Please enter your SnapStak API key first.');
        }

        // Sanitize: replace underscores with hyphens, strip anything not letter/number/hyphen
        const sanitizedName = workspaceName
            .replace(/_/g, '-')
            .replace(/[^a-zA-Z0-9-]/g, '')
            .replace(/-{2,}/g, '-')   // collapse consecutive hyphens
            .replace(/^-|-$/g, '');   // trim leading/trailing hyphens

        const result = await this.request<CreateWorkspaceResult>('POST', '/api/workspaces/create', {
            workspaceName: sanitizedName,
            uid,
            userName
        });

        // Persist the sanitized workspace name so databaseCanvasPanel can read it
        await this.storeWorkspaceName(sanitizedName);

        return result;
    }

    async getWorkspaces(): Promise<Workspace[]> {
        const data = await this.request<{ success: boolean; workspaces: Workspace[] }>(
            'GET', '/api/plugin/workspaces'
        );
        return data.workspaces;
    }

    async getWorkspace(workspaceId: number): Promise<Workspace> {
        const data = await this.request<{ success: boolean; workspace: Workspace }>(
            'GET', `/api/plugin/workspace/${workspaceId}`
        );
        return data.workspace;
    }

    async signOut(): Promise<void> {
        try {
            await this.request('POST', '/api/plugin/deregister');
        } catch {
            // Best effort — clear local session regardless
        }
        await this.clearSession();
    }

    // ─────────────────────────────────────────────────────────
    // COPYWRITER AI CALLS
    // All route through SnapStak server via existing Bearer JWT auth
    // ─────────────────────────────────────────────────────────

    async copywriterGenerateDescription(keywords: string[]): Promise<string> {
        const uid = await this.secretStorage.get(SnapStakClient.USER_ID_KEY) ?? '';
        if (!uid) {
            throw new Error('Not signed in. Please enter your SnapStak API key first.');
        }
        const data = await this.request<{ success: boolean; description: string }>(
            'POST', '/api/copywriter/generate-description', { uid, keywords }
        );
        return data.description;
    }

    async copywriterGenerateHeading(
        blockId: string,
        originalHeading: string,
        headingTag: string,
        wordCount: number,
        businessDescription: string,
        keywords?: string
    ): Promise<string> {
        const uid = await this.secretStorage.get(SnapStakClient.USER_ID_KEY) ?? '';
        if (!uid) { throw new Error('Not signed in. Please enter your SnapStak API key first.'); }
        const data = await this.request<{ heading: string }>(
            'POST', '/api/copywriter/generate-heading',
            { uid, blockId, originalHeading, headingTag, wordCount, businessDescription, keywords }
        );
        return data.heading;
    }

    async copywriterGenerateAllHeadings(
        blocks: CopywriterBlock[],
        businessDescription: string
    ): Promise<Record<string, string>> {
        const uid = await this.secretStorage.get(SnapStakClient.USER_ID_KEY) ?? '';
        if (!uid) { throw new Error('Not signed in. Please enter your SnapStak API key first.'); }
        const data = await this.request<{ headings: Record<string, string> }>(
            'POST', '/api/copywriter/generate-headings',
            { uid, blocks, businessDescription }
        );
        return data.headings;
    }

    async copywriterRewriteBody(
        blockId: string,
        confirmedHeading: string,
        originalText: string,
        wordCountTarget: number,
        businessDescription: string,
        retryContext?: string
    ): Promise<{ text: string; wordCount: number; needsReview: boolean }> {
        const data = await this.request<{
            success: boolean;
            text: string;
            wordCount: number;
            needsReview: boolean;
        }>(
            'POST', '/api/copywriter/rewrite-body',
            { blockId, confirmedHeading, originalText, wordCountTarget, businessDescription, retryContext }
        );
        return data;
    }
}