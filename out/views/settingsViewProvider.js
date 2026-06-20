"use strict";
/**
 * SnapStak Settings View Provider
 * Sidebar panel for configuring the local workspace folder.
 * Stored in VS Code globalState so it persists across sessions.
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
exports.SettingsViewProvider = void 0;
const vscode = __importStar(require("vscode"));
class SettingsViewProvider {
    constructor(context, onFolderChanged) {
        this.context = context;
        this.onFolderChanged = onFolderChanged;
    }
    getStoredFolder() {
        return this.context.globalState.get(SettingsViewProvider.FOLDER_KEY);
    }
    async saveFolder(folderPath) {
        if (folderPath) {
            await this.context.globalState.update(SettingsViewProvider.FOLDER_KEY, folderPath);
        }
        else {
            await this.context.globalState.update(SettingsViewProvider.FOLDER_KEY, undefined);
        }
        this.onFolderChanged(folderPath);
    }
    // ─────────────────────────────────────────────────────────
    // WEBVIEW
    // ─────────────────────────────────────────────────────────
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = this.getHtml(this.getStoredFolder());
        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'browseFolder': {
                    const result = await vscode.window.showOpenDialog({
                        canSelectFolders: true,
                        canSelectFiles: false,
                        canSelectMany: false,
                        openLabel: 'Select SnapStak Workspace Folder'
                    });
                    if (result?.length) {
                        const folderPath = result[0].fsPath;
                        await this.saveFolder(folderPath);
                        this._view?.webview.postMessage({ command: 'folderSet', path: folderPath });
                    }
                    break;
                }
                case 'clearFolder': {
                    await this.saveFolder(null);
                    this._view?.webview.postMessage({ command: 'folderCleared' });
                    break;
                }
            }
        });
    }
    // Called externally to refresh the view (e.g. after folder set via command)
    refresh() {
        if (this._view) {
            const current = this.getStoredFolder();
            this._view.webview.postMessage(current
                ? { command: 'folderSet', path: current }
                : { command: 'folderCleared' });
        }
    }
    // ─────────────────────────────────────────────────────────
    // HTML
    // ─────────────────────────────────────────────────────────
    getHtml(currentFolder) {
        const folderDisplay = currentFolder || '';
        const hasFolder = !!currentFolder;
        return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
  <title>SnapStak Settings</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
      padding: 16px;
    }

    .section-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 10px;
    }

    .description {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      line-height: 1.6;
      margin-bottom: 14px;
    }

    .folder-display {
      display: ${hasFolder ? 'flex' : 'none'};
      align-items: center;
      gap: 8px;
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-widget-border);
      border-radius: 3px;
      padding: 8px 10px;
      margin-bottom: 10px;
      font-size: 11px;
      font-family: var(--vscode-editor-font-family);
      color: var(--vscode-foreground);
      word-break: break-all;
      line-height: 1.5;
    }

    .folder-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    .folder-path {
      flex: 1;
    }

    .no-folder {
      display: ${hasFolder ? 'none' : 'block'};
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      font-style: italic;
      margin-bottom: 10px;
      padding: 8px 10px;
      border: 1px dashed var(--vscode-widget-border);
      border-radius: 3px;
      text-align: center;
    }

    .btn {
      width: 100%;
      padding: 8px;
      border: none;
      border-radius: 3px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s;
    }

    .btn:hover { opacity: 0.85; }

    .btn-primary {
      background: #38BDF8;
      color: #ffffff;
    }
    .btn-primary:hover { opacity: 1 !important; background: #0284c7; }

    .divider {
      height: 1px;
      background: var(--vscode-widget-border);
      margin: 16px 0;
    }
  </style>
</head>
<body>

  <div class="section-label">Local Workspace Folder</div>

  <p class="description">
    Select the folder where SnapStak will look for downloaded workspace zip files.
  </p>

  <div class="folder-display" id="folderDisplay">
    <span class="folder-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 6H13V5C13 4.448 12.552 4 12 4H7.414L6.707 3.293C6.52 3.105 6.265 3 6 3H2C1.448 3 1 3.448 1 4V12C1 12.552 1.448 13 2 13H12.342L14.883 7.447C15.085 6.992 14.744 6 14.5 6ZM2 4H6L7 5H12V6H3.5C3.11 6 2.762 6.238 2.618 6.6L2 8.153V4Z" fill="#38BDF8"/></svg></span>
    <span class="folder-path" id="folderPath">${folderDisplay}</span>
  </div>

  <div class="no-folder" id="noFolder">No folder selected</div>

  <button class="btn btn-primary" id="browseBtn">
    ${hasFolder ? 'Change Folder' : 'Select Workspace Folder'}
  </button>

  <script>
    const vscode       = acquireVsCodeApi();
    const folderDisplay = document.getElementById('folderDisplay');
    const folderPath   = document.getElementById('folderPath');
    const noFolder     = document.getElementById('noFolder');
    const browseBtn    = document.getElementById('browseBtn');

    browseBtn.addEventListener('click', () => {
      vscode.postMessage({ command: 'browseFolder' });
    });


    window.addEventListener('message', (event) => {
      const msg = event.data;

      if (msg.command === 'folderSet') {
        folderPath.textContent  = msg.path;
        folderDisplay.style.display = 'flex';
        noFolder.style.display      = 'none';
        browseBtn.textContent       = 'Change Folder';
      }

    });
  </script>
</body>
</html>`;
    }
}
exports.SettingsViewProvider = SettingsViewProvider;
SettingsViewProvider.viewId = 'snapstak.settingsView';
// ─────────────────────────────────────────────────────────
// STORED FOLDER PATH
// ─────────────────────────────────────────────────────────
SettingsViewProvider.FOLDER_KEY = 'snapstak.workspaceFolder';
//# sourceMappingURL=settingsViewProvider.js.map