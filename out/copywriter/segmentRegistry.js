"use strict";
/**
 * SnapStak Segment Registry
 * Manages .snapstak/segments.json in the project root.
 * Guarantees globally unique 8-character hex segment IDs across all sessions.
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
exports.SegmentRegistryManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const SNAPSTAK_DIR = '.snapstak';
const REGISTRY_FILE = 'segments.json';
class SegmentRegistryManager {
    constructor(projectRoot) {
        const dir = path.join(projectRoot, SNAPSTAK_DIR);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        this.registryPath = path.join(dir, REGISTRY_FILE);
        this.registry = this._load();
    }
    // ── Load ─────────────────────────────────────────────────────
    _load() {
        if (fs.existsSync(this.registryPath)) {
            try {
                const raw = fs.readFileSync(this.registryPath, 'utf8');
                return JSON.parse(raw);
            }
            catch { /* fall through to default */ }
        }
        return {
            version: 1,
            projectId: this._generateProjectId(),
            segments: {}
        };
    }
    _save() {
        fs.writeFileSync(this.registryPath, JSON.stringify(this.registry, null, 2), 'utf8');
    }
    _generateProjectId() {
        return crypto.randomBytes(8).toString('hex');
    }
    // ── ID generation ─────────────────────────────────────────────
    // Generate a unique 8-char hex ID not already in the registry.
    generateUniqueId() {
        const existing = new Set(Object.keys(this.registry.segments));
        let id;
        let attempts = 0;
        do {
            id = crypto.randomBytes(4).toString('hex'); // 4 bytes = 8 hex chars
            attempts++;
            if (attempts > 10000) {
                // Extremely unlikely — add timestamp salt if needed
                id = crypto.createHash('md5')
                    .update(Date.now().toString() + Math.random().toString())
                    .digest('hex')
                    .substring(0, 8);
            }
        } while (existing.has(id));
        return id;
    }
    // Generate multiple unique IDs at once — batch allocation
    generateUniqueIds(count) {
        const ids = [];
        for (let i = 0; i < count; i++) {
            // Pass already-generated ids to avoid duplicates within the batch
            const existing = new Set([
                ...Object.keys(this.registry.segments),
                ...ids
            ]);
            let id;
            let attempts = 0;
            do {
                id = crypto.randomBytes(4).toString('hex');
                attempts++;
                if (attempts > 10000) {
                    id = crypto.createHash('md5')
                        .update(Date.now().toString() + Math.random().toString() + i)
                        .digest('hex')
                        .substring(0, 8);
                }
            } while (existing.has(id));
            ids.push(id);
        }
        return ids;
    }
    // ── Registry operations ───────────────────────────────────────
    hasSegment(segmentId) {
        return !!this.registry.segments[segmentId];
    }
    getSegment(segmentId) {
        return this.registry.segments[segmentId];
    }
    addSegments(records) {
        const now = new Date().toISOString();
        for (const record of records) {
            this.registry.segments[record.segmentId] = {
                ...record,
                createdAt: now
            };
        }
        this._save();
    }
    getAllSegments() {
        return Object.values(this.registry.segments);
    }
    getSegmentCount() {
        return Object.keys(this.registry.segments).length;
    }
    // Check if segments have been injected for this project
    hasSegmentsInjected() {
        return this.getSegmentCount() > 0;
    }
}
exports.SegmentRegistryManager = SegmentRegistryManager;
//# sourceMappingURL=segmentRegistry.js.map