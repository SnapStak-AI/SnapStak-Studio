"use strict";
/**
 * SnapStak Zip View Provider
 * Lists all .zip files in the configured workspace folder.
 * - Unextracted zips: orange zip icon → click to extract + npm install
 * - Already extracted: green folder icon → click to load file tree in Workspaces panel
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
exports.ZipItemDecorationProvider = exports.ZipViewProvider = exports.ZipMessageItem = exports.ZipItem = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const cp = __importStar(require("child_process"));
const util = __importStar(require("util"));
const workspacesViewProvider_1 = require("./workspacesViewProvider");
const exec = util.promisify(cp.exec);
// ─────────────────────────────────────────────────────────────
// TREE ITEMS
// ─────────────────────────────────────────────────────────────
class ZipItem extends vscode.TreeItem {
    constructor(zipPath, label) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.zipPath = zipPath;
        this.label = label;
        this.extractedPath = zipPath.replace(/\.zip$/i, '');
        this.isExtracted = fs.existsSync(this.extractedPath) &&
            fs.statSync(this.extractedPath).isDirectory();
        // Set resourceUri so FileDecorationProvider can colour the label
        this.resourceUri = vscode.Uri.parse(this.isExtracted
            ? `snapstak-extracted:${encodeURIComponent(zipPath)}`
            : `snapstak-zip:${encodeURIComponent(zipPath)}`);
        if (this.isExtracted) {
            this.contextValue = 'zipFileExtracted';
            this.iconPath = new vscode.ThemeIcon('folder-opened', new vscode.ThemeColor('terminal.ansiCyan'));
            this.description = '✓ ready';
            this.tooltip = `Click to browse: ${this.extractedPath}`;
            this.command = {
                command: 'snapstak.openExtracted',
                title: 'Browse Project',
                arguments: [this.extractedPath]
            };
        }
        else {
            this.contextValue = 'zipFile';
            this.iconPath = new vscode.ThemeIcon('file-zip');
            this.description = this.getFileSizeLabel(zipPath);
            this.tooltip = `Click to extract: ${zipPath}`;
            this.command = {
                command: 'snapstak.extractZip',
                title: 'Extract & Open',
                arguments: [this.zipPath]
            };
        }
    }
    getFileSizeLabel(filePath) {
        try {
            const bytes = fs.statSync(filePath).size;
            if (bytes < 1024)
                return `${bytes} B`;
            if (bytes < 1024 * 1024)
                return `${(bytes / 1024).toFixed(1)} KB`;
            return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        }
        catch {
            return '';
        }
    }
}
exports.ZipItem = ZipItem;
class ZipMessageItem extends vscode.TreeItem {
    constructor(message, icon = 'info') {
        super(message, vscode.TreeItemCollapsibleState.None);
        this.iconPath = new vscode.ThemeIcon(icon);
        this.contextValue = 'message';
    }
}
exports.ZipMessageItem = ZipMessageItem;
// ─────────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────────
class ZipViewProvider {
    constructor(workspacesProvider, client) {
        this.workspacesProvider = workspacesProvider;
        this.client = client;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.folderPath = null;
    }
    setFolder(folderPath) {
        this.folderPath = folderPath;
        this.refresh();
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren() {
        if (!this.folderPath) {
            return [new ZipMessageItem('Set a workspace folder in Settings', 'gear')];
        }
        if (!fs.existsSync(this.folderPath)) {
            return [new ZipMessageItem('Workspace folder not found', 'error')];
        }
        let files;
        try {
            files = fs.readdirSync(this.folderPath);
        }
        catch {
            return [new ZipMessageItem('Cannot read workspace folder', 'error')];
        }
        const zips = files
            .filter(f => f.toLowerCase().endsWith('.zip'))
            .sort((a, b) => {
            try {
                const statA = fs.statSync(path.join(this.folderPath, a)).mtimeMs;
                const statB = fs.statSync(path.join(this.folderPath, b)).mtimeMs;
                return statB - statA;
            }
            catch {
                return a.localeCompare(b);
            }
        });
        if (zips.length === 0) {
            return [new ZipMessageItem('No zip files in workspace folder', 'info')];
        }
        return zips.map(f => new ZipItem(path.join(this.folderPath, f), f));
    }
    // ─────────────────────────────────────────────────────────
    // OPEN ALREADY-EXTRACTED — load into Workspaces panel
    // ─────────────────────────────────────────────────────────
    async openExtracted(extractedPath) {
        const projectRoot = this.findProjectRoot(extractedPath) || extractedPath;
        this.workspacesProvider.setProject(projectRoot);
        // Focus the workspaces panel
        vscode.commands.executeCommand(`${workspacesViewProvider_1.WorkspacesViewProvider.viewId}.focus`);
    }
    // ─────────────────────────────────────────────────────────
    // EXTRACT ZIP → npm install → load into Workspaces panel
    // ─────────────────────────────────────────────────────────
    async extractZip(zipPath) {
        const zipName = path.basename(zipPath, '.zip');
        const targetDir = path.join(path.dirname(zipPath), zipName);
        const platform = process.platform;
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `SnapStak: Extracting "${zipName}"`,
            cancellable: false
        }, async (progress) => {
            // ── Step 1: Create target directory ───────────────
            progress.report({ message: 'Creating folder...' });
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            // ── Step 1b: Create workspace on SnapStak server ──
            if (this.client?.isAuthenticated()) {
                try {
                    await this.client.createWorkspace(zipName);
                    console.log(`[SnapStak] Workspace '${zipName}' created on server`);
                }
                catch (err) {
                    // Non-fatal: workspace may already exist — continue extraction
                    console.warn(`[SnapStak] Workspace creation skipped: ${err.message}`);
                }
            }
            // ── Step 2: Unzip ─────────────────────────────────
            progress.report({ message: 'Extracting zip...' });
            try {
                if (platform === 'win32') {
                    await exec(`powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${targetDir}' -Force"`);
                }
                else {
                    await exec(`unzip -o "${zipPath}" -d "${targetDir}"`);
                }
            }
            catch (err) {
                vscode.window.showErrorMessage(`SnapStak: Extraction failed — ${err.message}`);
                return;
            }
            // Refresh zip list so icon turns green immediately
            this.refresh();
            // ── Step 3: Detect package.json ───────────────────
            progress.report({ message: 'Checking for package.json...' });
            const projectRoot = this.findProjectRoot(targetDir);
            if (!projectRoot) {
                // No package.json — just load into workspaces panel
                this.workspacesProvider.setProject(targetDir);
                vscode.commands.executeCommand(`${workspacesViewProvider_1.WorkspacesViewProvider.viewId}.focus`);
                return;
            }
            // ── Step 4: npm install ───────────────────────────
            progress.report({ message: 'Running npm install...' });
            const outputChannel = vscode.window.createOutputChannel('SnapStak: npm install');
            outputChannel.show(true);
            outputChannel.appendLine(`> cd "${projectRoot}"`);
            outputChannel.appendLine(`> npm install\n`);
            try {
                const { stdout, stderr } = await exec('npm install', {
                    cwd: projectRoot,
                    timeout: 5 * 60 * 1000
                });
                if (stdout)
                    outputChannel.appendLine(stdout);
                if (stderr)
                    outputChannel.appendLine(stderr);
                outputChannel.appendLine('\n✅ npm install complete.');
            }
            catch (err) {
                outputChannel.appendLine(`\n❌ npm install failed:\n${err.message}`);
                vscode.window.showErrorMessage(`SnapStak: npm install failed. Check the output panel.`);
                return;
            }
            // ── Step 5: Load into Workspaces panel ────────────
            progress.report({ message: 'Loading project...' });
            this.workspacesProvider.setProject(projectRoot);
            vscode.commands.executeCommand(`${workspacesViewProvider_1.WorkspacesViewProvider.viewId}.focus`);
        });
    }
    // ─────────────────────────────────────────────────────────
    // FIND PROJECT ROOT
    // ─────────────────────────────────────────────────────────
    findProjectRoot(dir) {
        if (fs.existsSync(path.join(dir, 'package.json'))) {
            return dir;
        }
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const sub = path.join(dir, entry.name);
                    if (fs.existsSync(path.join(sub, 'package.json'))) {
                        return sub;
                    }
                }
            }
        }
        catch {
            // ignore
        }
        return null;
    }
}
exports.ZipViewProvider = ZipViewProvider;
ZipViewProvider.viewId = 'snapstak.zipView';
// ─────────────────────────────────────────────────────────────
// FILE DECORATION PROVIDER — colours TreeItem label text
// Register in extension.ts:
//   context.subscriptions.push(
//     vscode.window.registerFileDecorationProvider(new ZipItemDecorationProvider())
//   );
// ─────────────────────────────────────────────────────────────
class ZipItemDecorationProvider {
    provideFileDecoration(uri) {
        if (uri.scheme === 'snapstak-extracted') {
            return { color: new vscode.ThemeColor('terminal.ansiCyan') };
        }
        if (uri.scheme === 'snapstak-zip') {
            return undefined;
        }
        return undefined;
    }
}
exports.ZipItemDecorationProvider = ZipItemDecorationProvider;
//# sourceMappingURL=zipViewProvider.js.map