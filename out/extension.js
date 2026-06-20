"use strict";
/**
 * SnapStak.ai VS Code Extension
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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const workspacesViewProvider_1 = require("./views/workspacesViewProvider");
const settingsViewProvider_1 = require("./views/settingsViewProvider");
const zipViewProvider_1 = require("./views/zipViewProvider");
const snapstakPanelProvider_1 = require("./views/snapstakPanelProvider");
const devRunner_1 = require("./devRunner");
const databaseCanvasPanel_1 = require("./panels/databaseCanvasPanel");
const drawingCanvasPanel_1 = require("./panels/drawingCanvasPanel");
const copywriterPanel_1 = require("./panels/copywriterPanel");
const snapstakClient_1 = require("./snapstakClient");
async function activate(context) {
    console.log('[SnapStak] Extension activating...');
    // ── SnapStak API client ───────────────────────────────────
    const client = new snapstakClient_1.SnapStakClient(context.secrets);
    await client.loadStoredSession();
    // Initialise copywriter with context and client so it can auto-open when blocks arrive
    (0, copywriterPanel_1.initCopywriter)(context, client);
    // Wire browser panel messages → copywriter panel
    (0, devRunner_1.setBrowserMessageHandler)((msg) => {
        if (msg.type === 'COPYWRITER_SELECTION_COMPLETE') {
            // forwardToCopywriter handles both cases:
            // - panel already open: postMessage immediately
            // - panel not open: stores as _pendingMsg, opens panel,
            //   panel reveals and sends _pendingMsg once webview is ready (500ms delay built in)
            (0, copywriterPanel_1.forwardToCopywriter)({
                type: 'LOAD_BLOCKS',
                blocks: msg.payload,
                isGroupMode: !!(msg.isGroupMode)
            });
        }
        if (msg.type === 'SS_TRACKER_READY') {
            (0, copywriterPanel_1.forwardToCopywriter)(msg);
        }
    });
    // ── Panel (secondary sidebar) ─────────────────────────────
    const panelProvider = new snapstakPanelProvider_1.SnapstakPanelProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(snapstakPanelProvider_1.SnapstakPanelProvider.viewId, panelProvider, { webviewOptions: { retainContextWhenHidden: true } }));
    // ── Workspaces file tree ──────────────────────────────────
    const workspacesProvider = new workspacesViewProvider_1.WorkspacesViewProvider();
    context.subscriptions.push(vscode.window.registerTreeDataProvider(workspacesViewProvider_1.WorkspacesViewProvider.viewId, workspacesProvider));
    // Give the database canvas panel access to the active project root
    (0, databaseCanvasPanel_1.setProjectRootCallback)(() => workspacesProvider.getProjectRoot() ?? undefined);
    (0, databaseCanvasPanel_1.setRefreshWorkspacesCallback)(() => workspacesProvider.refresh());
    // ── Zip view ──────────────────────────────────────────────
    const zipProvider = new zipViewProvider_1.ZipViewProvider(workspacesProvider);
    context.subscriptions.push(vscode.window.registerTreeDataProvider(zipViewProvider_1.ZipViewProvider.viewId, zipProvider));
    // ── Zip item label colour decoration ─────────────────────────
    context.subscriptions.push(vscode.window.registerFileDecorationProvider(new zipViewProvider_1.ZipItemDecorationProvider()));
    // ── Settings view ─────────────────────────────────────────
    const settingsProvider = new settingsViewProvider_1.SettingsViewProvider(context, (folderPath) => { zipProvider.setFolder(folderPath); });
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(settingsViewProvider_1.SettingsViewProvider.viewId, settingsProvider));
    // Init zip view with stored folder
    const storedFolder = settingsProvider.getStoredFolder();
    if (storedFolder) {
        zipProvider.setFolder(storedFolder);
    }
    // ── Commands ──────────────────────────────────────────────
    context.subscriptions.push(vscode.commands.registerCommand('snapstak.extractZip', async (zipPath) => {
        if (!zipPath) {
            vscode.window.showErrorMessage('SnapStak: No zip file selected.');
            return;
        }
        await zipProvider.extractZip(zipPath);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('snapstak.openExtracted', async (extractedPath) => {
        if (!extractedPath) {
            vscode.window.showErrorMessage('SnapStak: No project selected.');
            return;
        }
        await zipProvider.openExtracted(extractedPath);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('snapstak.refreshZipView', () => { zipProvider.refresh(); }));
    context.subscriptions.push(vscode.commands.registerCommand('snapstak.refreshWorkspaces', () => { workspacesProvider.refresh(); }));
    context.subscriptions.push(vscode.commands.registerCommand('snapstak.openDashboard', () => {
        vscode.env.openExternal(vscode.Uri.parse('https://snapstak.ai'));
    }));
    // Run project — detect framework, start dev server, open browser panel
    context.subscriptions.push(vscode.commands.registerCommand('snapstak.runProject', async (filePathOrRoot) => {
        // Can be called from index.html click (filePath) or run button (projectRoot)
        let projectRoot = workspacesProvider.getProjectRoot();
        if (filePathOrRoot) {
            // If it's an index.html path, use its parent as root
            const stat = require('fs').statSync(filePathOrRoot);
            projectRoot = stat.isDirectory() ? filePathOrRoot : require('path').dirname(filePathOrRoot);
        }
        if (!projectRoot) {
            vscode.window.showErrorMessage('SnapStak: No project loaded. Click a project in Local Projects first.');
            return;
        }
        await (0, devRunner_1.launchDevServer)(projectRoot, context);
    }));
    // Open schema.json in the canvas — triggered when user clicks schema.json in Explorer
    context.subscriptions.push(vscode.commands.registerCommand('snapstak.openSchemaFile', async (uri) => {
        await (0, databaseCanvasPanel_1.openSchemaFile)(context, uri);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('snapstak.openDrawingCanvas', () => {
        (0, drawingCanvasPanel_1.openDrawingCanvasPanel)(context);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('snapstak.openCopywriter', () => {
        const projectRoot = workspacesProvider.getProjectRoot();
        (0, copywriterPanel_1.openCopywriterPanel)(context, client, projectRoot ?? undefined);
    }));
    console.log('[SnapStak] Extension activated ✅');
    // Auto-open both panels
    vscode.commands.executeCommand('snapstak.panelView.focus');
    vscode.commands.executeCommand('workbench.view.extension.snapstak');
}
function deactivate() { }
//# sourceMappingURL=extension.js.map