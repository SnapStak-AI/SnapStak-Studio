"use strict";
/**
 * SnapStak Auth View Provider
 * Shows the API key entry panel in the sidebar when the user is not authenticated.
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
exports.AuthViewProvider = void 0;
const vscode = __importStar(require("vscode"));
class AuthViewProvider {
    constructor(context, client, onAuthenticated) {
        this.context = context;
        this.client = client;
        this.onAuthenticated = onAuthenticated;
    }
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true
        };
        webviewView.webview.html = this.getHtml();
        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'authenticate':
                    await this.handleAuthenticate(message.apiKey);
                    break;
                case 'openDashboard':
                    vscode.env.openExternal(vscode.Uri.parse('https://snapstak.ai'));
                    break;
            }
        });
    }
    async handleAuthenticate(apiKey) {
        if (!apiKey?.trim()) {
            this._view?.webview.postMessage({ command: 'error', message: 'Please enter your SnapStak API key.' });
            return;
        }
        // Show loading state
        this._view?.webview.postMessage({ command: 'loading', loading: true });
        try {
            await this.client.authenticate(apiKey.trim());
            // Notify extension that auth succeeded
            this.onAuthenticated();
            vscode.window.showInformationMessage('✅ SnapStak connected successfully!');
        }
        catch (err) {
            this._view?.webview.postMessage({
                command: 'error',
                message: err.message || 'Authentication failed. Please check your API key.'
            });
            this._view?.webview.postMessage({ command: 'loading', loading: false });
        }
    }
    getHtml() {
        return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
  <title>SnapStak Login</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
      padding: 16px;
    }

    .logo-wrap {
      text-align: center;
      padding: 20px 0 16px;
    }

    .logo-title {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: var(--vscode-foreground);
    }

    .logo-sub {
      font-size: 10px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--vscode-descriptionForeground);
      margin-top: 3px;
    }

    .divider {
      height: 1px;
      background: var(--vscode-widget-border);
      margin: 16px 0;
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
      margin-bottom: 16px;
    }

    .input-wrap {
      position: relative;
      margin-bottom: 10px;
    }

    input[type="password"],
    input[type="text"] {
      width: 100%;
      padding: 7px 36px 7px 10px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border, var(--vscode-widget-border));
      border-radius: 3px;
      font-size: 12px;
      font-family: var(--vscode-editor-font-family);
      outline: none;
      transition: border-color 0.15s;
    }

    input:focus {
      border-color: var(--vscode-focusBorder);
    }

    .toggle-visibility {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: var(--vscode-descriptionForeground);
      padding: 2px;
      font-size: 13px;
      line-height: 1;
    }

    .toggle-visibility:hover {
      color: var(--vscode-foreground);
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

    .btn:hover:not(:disabled) {
      opacity: 0.85;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .btn-secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      margin-top: 8px;
    }

    .error-box {
      display: none;
      background: var(--vscode-inputValidation-errorBackground);
      border: 1px solid var(--vscode-inputValidation-errorBorder);
      border-radius: 3px;
      padding: 8px 10px;
      font-size: 11px;
      color: var(--vscode-inputValidation-errorForeground, var(--vscode-foreground));
      margin-bottom: 10px;
      line-height: 1.5;
    }

    .error-box.visible {
      display: block;
    }

    .spinner {
      display: none;
      text-align: center;
      padding: 6px 0;
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
    }

    .spinner.visible {
      display: block;
    }

    .help-link {
      display: block;
      text-align: center;
      font-size: 11px;
      color: var(--vscode-textLink-foreground);
      text-decoration: none;
      margin-top: 14px;
      cursor: pointer;
    }

    .help-link:hover {
      text-decoration: underline;
    }

    .secure-note {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      margin-top: 12px;
      justify-content: center;
    }
  </style>
</head>
<body>

  <div class="logo-wrap">
    <div class="logo-title">SnapStak.ai</div>
    <div class="logo-sub">Deconstructing the Web</div>
  </div>

  <div class="divider"></div>

  <div class="section-label">Connect Your Account</div>

  <p class="description">
    Enter your SnapStak API key to connect this machine to your account and access your workspaces.
  </p>

  <div class="error-box" id="errorBox"></div>
  <div class="spinner" id="spinner">⏳ Connecting to SnapStak...</div>

  <div class="input-wrap">
    <input
      type="password"
      id="apiKeyInput"
      placeholder="ssk_xxxxxxxxxxxxxxxxxxxxxxxx"
      autocomplete="off"
      spellcheck="false"
    />
    <button class="toggle-visibility" id="toggleBtn" title="Show/hide key">👁</button>
  </div>

  <button class="btn btn-primary" id="connectBtn">Connect to SnapStak</button>
  <button class="btn btn-secondary" id="dashboardBtn">Get API Key at snapstak.ai</button>

  <div class="secure-note">
    🔒 Stored securely in VS Code SecretStorage
  </div>

  <a class="help-link" id="helpLink">Need help? Visit snapstak.ai/docs</a>

  <script>
    const vscode    = acquireVsCodeApi();
    const input     = document.getElementById('apiKeyInput');
    const connectBtn= document.getElementById('connectBtn');
    const toggleBtn = document.getElementById('toggleBtn');
    const errorBox  = document.getElementById('errorBox');
    const spinner   = document.getElementById('spinner');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const helpLink  = document.getElementById('helpLink');

    // Toggle visibility
    toggleBtn.addEventListener('click', () => {
      input.type = input.type === 'password' ? 'text' : 'password';
      toggleBtn.textContent = input.type === 'password' ? '👁' : '🙈';
    });

    // Connect button
    connectBtn.addEventListener('click', () => {
      submitKey();
    });

    // Enter key
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitKey();
    });

    // Dashboard link
    dashboardBtn.addEventListener('click', () => {
      vscode.postMessage({ command: 'openDashboard' });
    });

    helpLink.addEventListener('click', () => {
      vscode.postMessage({ command: 'openDashboard' });
    });

    function submitKey() {
      const apiKey = input.value.trim();
      clearError();
      vscode.postMessage({ command: 'authenticate', apiKey });
    }

    function clearError() {
      errorBox.textContent = '';
      errorBox.classList.remove('visible');
    }

    // Handle messages from extension
    window.addEventListener('message', (event) => {
      const msg = event.data;

      switch (msg.command) {
        case 'error':
          errorBox.textContent = msg.message;
          errorBox.classList.add('visible');
          setLoading(false);
          break;

        case 'loading':
          setLoading(msg.loading);
          break;
      }
    });

    function setLoading(loading) {
      connectBtn.disabled = loading;
      input.disabled      = loading;
      spinner.classList.toggle('visible', loading);
      if (loading) clearError();
    }

    // Auto-focus input
    input.focus();
  </script>
</body>
</html>`;
    }
}
exports.AuthViewProvider = AuthViewProvider;
AuthViewProvider.viewId = 'snapstak.authView';
//# sourceMappingURL=authViewProvider.js.map