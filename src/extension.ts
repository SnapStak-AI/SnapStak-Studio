/**
 * SnapStak.ai VS Code Extension
 */

import * as vscode from 'vscode';
import { WorkspacesViewProvider } from './views/workspacesViewProvider';
import { SettingsViewProvider } from './views/settingsViewProvider';
import { ZipViewProvider, ZipItemDecorationProvider } from './views/zipViewProvider';
import { SnapstakPanelProvider } from './views/snapstakPanelProvider';
import { launchDevServer, setBrowserMessageHandler } from './devRunner';
import { openSchemaFile, setProjectRootCallback, setRefreshWorkspacesCallback } from './panels/databaseCanvasPanel';
import { openDrawingCanvasPanel } from './panels/drawingCanvasPanel';
import { openCopywriterPanel, initCopywriter, forwardToCopywriter } from './panels/copywriterPanel';
import { SnapStakClient } from './snapstakClient';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    console.log('[SnapStak] Extension activating...');

    // ── SnapStak API client ───────────────────────────────────
    const client = new SnapStakClient(context.secrets);
    await client.loadStoredSession();

    // Initialise copywriter with context and client so it can auto-open when blocks arrive
    initCopywriter(context, client);

    // Wire browser panel messages → copywriter panel
    setBrowserMessageHandler((msg: any) => {
        if (msg.type === 'COPYWRITER_SELECTION_COMPLETE') {
            // forwardToCopywriter handles both cases:
            // - panel already open: postMessage immediately
            // - panel not open: stores as _pendingMsg, opens panel,
            //   panel reveals and sends _pendingMsg once webview is ready (500ms delay built in)
            forwardToCopywriter({
                type: 'LOAD_BLOCKS',
                blocks: msg.payload,
                isGroupMode: !!(msg.isGroupMode)
            });
        }
        if (msg.type === 'SS_TRACKER_READY') {
            forwardToCopywriter(msg);
        }
    });

    // ── Panel (secondary sidebar) ─────────────────────────────
    const panelProvider = new SnapstakPanelProvider(context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            SnapstakPanelProvider.viewId,
            panelProvider,
            { webviewOptions: { retainContextWhenHidden: true } }
        )
    );

    // ── Workspaces file tree ──────────────────────────────────
    const workspacesProvider = new WorkspacesViewProvider();
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider(
            WorkspacesViewProvider.viewId,
            workspacesProvider
        )
    );

    // Give the database canvas panel access to the active project root
    setProjectRootCallback(() => workspacesProvider.getProjectRoot() ?? undefined);
    setRefreshWorkspacesCallback(() => workspacesProvider.refresh());

    // ── Zip view ──────────────────────────────────────────────
    const zipProvider = new ZipViewProvider(workspacesProvider);
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider(ZipViewProvider.viewId, zipProvider)
    );

    // ── Zip item label colour decoration ─────────────────────────
    context.subscriptions.push(
        vscode.window.registerFileDecorationProvider(new ZipItemDecorationProvider())
    );

    // ── Settings view ─────────────────────────────────────────
    const settingsProvider = new SettingsViewProvider(
        context,
        (folderPath: string | null) => { zipProvider.setFolder(folderPath); }
    );
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            SettingsViewProvider.viewId,
            settingsProvider
        )
    );

    // Init zip view with stored folder
    const storedFolder = settingsProvider.getStoredFolder();
    if (storedFolder) {
        zipProvider.setFolder(storedFolder);
    }

    // ── Commands ──────────────────────────────────────────────

    context.subscriptions.push(
        vscode.commands.registerCommand('snapstak.extractZip', async (zipPath?: string) => {
            if (!zipPath) { vscode.window.showErrorMessage('SnapStak: No zip file selected.'); return; }
            await zipProvider.extractZip(zipPath);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('snapstak.openExtracted', async (extractedPath?: string) => {
            if (!extractedPath) { vscode.window.showErrorMessage('SnapStak: No project selected.'); return; }
            await zipProvider.openExtracted(extractedPath);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('snapstak.refreshZipView', () => { zipProvider.refresh(); })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('snapstak.refreshWorkspaces', () => { workspacesProvider.refresh(); })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('snapstak.openDashboard', () => {
            vscode.env.openExternal(vscode.Uri.parse('https://snapstak.ai'));
        })
    );

    // Run project — detect framework, start dev server, open browser panel
    context.subscriptions.push(
        vscode.commands.registerCommand('snapstak.runProject', async (filePathOrRoot?: string) => {
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

            await launchDevServer(projectRoot, context);
        })
    );

    // Open schema.json in the canvas — triggered when user clicks schema.json in Explorer
    context.subscriptions.push(
        vscode.commands.registerCommand('snapstak.openSchemaFile', async (uri: vscode.Uri) => {
            await openSchemaFile(context, uri);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('snapstak.openDrawingCanvas', () => {
            openDrawingCanvasPanel(context);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('snapstak.openCopywriter', () => {
            const projectRoot = workspacesProvider.getProjectRoot();
            openCopywriterPanel(context, client, projectRoot ?? undefined);
        })
    );

    console.log('[SnapStak] Extension activated ✅');

    // Auto-open both panels
    vscode.commands.executeCommand('snapstak.panelView.focus');
    vscode.commands.executeCommand('workbench.view.extension.snapstak');
}

export function deactivate(): void { }