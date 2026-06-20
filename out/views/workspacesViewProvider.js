"use strict";
/**
 * SnapStak Workspaces View Provider
 * Shows the file tree of the currently selected extracted project.
 * Clicking index.html always opens the shared browser webview panel,
 * regardless of which sidebar tab is active.
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
exports.WorkspacesViewProvider = exports.WorkspaceMessageItem = exports.FileItem = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ─────────────────────────────────────────────────────────────
// TREE ITEMS
// ─────────────────────────────────────────────────────────────
class FileItem extends vscode.TreeItem {
    constructor(filePath, isDirectory) {
        super(path.basename(filePath), isDirectory
            ? vscode.TreeItemCollapsibleState.Collapsed
            : vscode.TreeItemCollapsibleState.None);
        this.filePath = filePath;
        this.isDirectory = isDirectory;
        this.resourceUri = vscode.Uri.file(filePath);
        this.iconPath = isDirectory ? vscode.ThemeIcon.Folder : vscode.ThemeIcon.File;
        const fileName = path.basename(filePath).toLowerCase();
        if (!isDirectory) {
            // index.html — always opens the shared browser webview
            if (fileName === 'index.html') {
                this.contextValue = 'indexFile';
                this.command = {
                    command: 'snapstak.runProject',
                    title: 'Run Project',
                    arguments: [filePath]
                };
                this.iconPath = new vscode.ThemeIcon('play-circle', new vscode.ThemeColor('terminal.ansiGreen'));
                // schema.layout.json — opens the database canvas
            }
            else if (fileName === 'schema.layout.json') {
                this.contextValue = 'schemaLayout';
                this.iconPath = new vscode.ThemeIcon('database');
                this.command = {
                    command: 'snapstak.openSchemaFile',
                    title: 'Open Schema Canvas',
                    arguments: [vscode.Uri.file(filePath)]
                };
                // all other files — open in VS Code editor
            }
            else {
                this.contextValue = 'file';
                this.command = {
                    command: 'vscode.open',
                    title: 'Open File',
                    arguments: [vscode.Uri.file(filePath)]
                };
            }
        }
        else {
            this.contextValue = 'folder';
        }
    }
}
exports.FileItem = FileItem;
class WorkspaceMessageItem extends vscode.TreeItem {
    constructor(message, icon = 'info') {
        super(message, vscode.TreeItemCollapsibleState.None);
        this.iconPath = new vscode.ThemeIcon(icon);
        this.contextValue = 'message';
    }
}
exports.WorkspaceMessageItem = WorkspaceMessageItem;
// ─────────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────────
const SKIP_FOLDERS = new Set([
    'node_modules', '.git', '.vscode', 'dist', 'out', 'build', '.next', '.cache'
]);
class WorkspacesViewProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.projectRoot = null;
    }
    setProject(projectRoot) {
        this.projectRoot = projectRoot;
        this._onDidChangeTreeData.fire();
    }
    getProjectRoot() {
        return this.projectRoot;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!this.projectRoot) {
            return [new WorkspaceMessageItem('Click an extracted project in Local Projects', 'folder')];
        }
        if (!fs.existsSync(this.projectRoot)) {
            return [new WorkspaceMessageItem('Project folder not found', 'error')];
        }
        const dirToRead = element instanceof FileItem && element.isDirectory
            ? element.filePath
            : this.projectRoot;
        let entries;
        try {
            entries = fs.readdirSync(dirToRead, { withFileTypes: true });
        }
        catch {
            return [new WorkspaceMessageItem('Cannot read folder', 'error')];
        }
        const folders = entries
            .filter(e => e.isDirectory() && !SKIP_FOLDERS.has(e.name))
            .sort((a, b) => a.name.localeCompare(b.name));
        const files = entries
            .filter(e => e.isFile())
            .sort((a, b) => {
            if (a.name.toLowerCase() === 'index.html') {
                return -1;
            }
            if (b.name.toLowerCase() === 'index.html') {
                return 1;
            }
            return a.name.localeCompare(b.name);
        });
        return [...folders, ...files].map(e => new FileItem(path.join(dirToRead, e.name), e.isDirectory()));
    }
}
exports.WorkspacesViewProvider = WorkspacesViewProvider;
WorkspacesViewProvider.viewId = 'snapstak.workspacesView';
//# sourceMappingURL=workspacesViewProvider.js.map