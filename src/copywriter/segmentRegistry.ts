/**
 * SnapStak Segment Registry
 * Manages .snapstak/segments.json in the project root.
 * Guarantees globally unique 8-character hex segment IDs across all sessions.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const SNAPSTAK_DIR = '.snapstak';
const REGISTRY_FILE = 'segments.json';

export interface SegmentRecord {
    segmentId: string;  // 8-char hex e.g. "a3f2b1c9"
    path: string;  // structural DOM path e.g. "body/div[1]/section[2]/h2[1]"
    sourceFile: string;  // relative path e.g. "src/components/Hero.jsx"
    tag: string;  // element tag name
    createdAt: string;  // ISO timestamp
}

export interface SegmentRegistry {
    version: number;
    projectId: string;
    segments: Record<string, SegmentRecord>; // keyed by segmentId
}

export class SegmentRegistryManager {

    private registryPath: string;
    private registry: SegmentRegistry;

    constructor(projectRoot: string) {
        const dir = path.join(projectRoot, SNAPSTAK_DIR);
        if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); }
        this.registryPath = path.join(dir, REGISTRY_FILE);
        this.registry = this._load();
    }

    // ── Load ─────────────────────────────────────────────────────

    private _load(): SegmentRegistry {
        if (fs.existsSync(this.registryPath)) {
            try {
                const raw = fs.readFileSync(this.registryPath, 'utf8');
                return JSON.parse(raw) as SegmentRegistry;
            } catch { /* fall through to default */ }
        }
        return {
            version: 1,
            projectId: this._generateProjectId(),
            segments: {}
        };
    }

    private _save(): void {
        fs.writeFileSync(this.registryPath, JSON.stringify(this.registry, null, 2), 'utf8');
    }

    private _generateProjectId(): string {
        return crypto.randomBytes(8).toString('hex');
    }

    // ── ID generation ─────────────────────────────────────────────
    // Generate a unique 8-char hex ID not already in the registry.

    generateUniqueId(): string {
        const existing = new Set(Object.keys(this.registry.segments));
        let id: string;
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
    generateUniqueIds(count: number): string[] {
        const ids: string[] = [];
        for (let i = 0; i < count; i++) {
            // Pass already-generated ids to avoid duplicates within the batch
            const existing = new Set([
                ...Object.keys(this.registry.segments),
                ...ids
            ]);
            let id: string;
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

    hasSegment(segmentId: string): boolean {
        return !!this.registry.segments[segmentId];
    }

    getSegment(segmentId: string): SegmentRecord | undefined {
        return this.registry.segments[segmentId];
    }

    addSegments(records: Omit<SegmentRecord, 'createdAt'>[]): void {
        const now = new Date().toISOString();
        for (const record of records) {
            this.registry.segments[record.segmentId] = {
                ...record,
                createdAt: now
            };
        }
        this._save();
    }

    getAllSegments(): SegmentRecord[] {
        return Object.values(this.registry.segments);
    }

    getSegmentCount(): number {
        return Object.keys(this.registry.segments).length;
    }

    // Check if segments have been injected for this project
    hasSegmentsInjected(): boolean {
        return this.getSegmentCount() > 0;
    }
}