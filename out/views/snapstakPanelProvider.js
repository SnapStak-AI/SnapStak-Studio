"use strict";
/**
 * SnapStak Panel Provider
 * Secondary sidebar — 8-tab AI panel with prompt input.
 *
 * Browser webview integration:
 *   Media, Copywriter and Database tabs share the browser webview as their
 *   live interaction canvas. Clicking any of those tabs reveals the browser
 *   panel if it is already open. Script injection and result routing all
 *   flow through devRunner.postToBrowser() and setBrowserMessageHandler().
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
exports.SnapstakPanelProvider = void 0;
const vscode = __importStar(require("vscode"));
const mediaPanel_1 = require("../panels/mediaPanel");
const copywriterPanelTab_1 = require("../panels/copywriterPanelTab");
const actionsPanel_1 = require("../panels/actionsPanel");
const formPanel_1 = require("../panels/formPanel");
const animationPanel_1 = require("../panels/animationPanel");
const databasePanel_1 = require("../panels/databasePanel");
const canvasPanel_1 = require("../panels/canvasPanel");
const libraryPanel_1 = require("../panels/libraryPanel");
const databaseCanvasPanel_1 = require("../panels/databaseCanvasPanel");
const drawingCanvasPanel_1 = require("../panels/drawingCanvasPanel");
const devRunner_1 = require("../devRunner");
const copywriterPanel_1 = require("../panels/copywriterPanel");
// Browser tab identifiers — only these three share the browser webview
const BROWSER_TABS = new Set(['media', 'copywriter', 'database']);
class SnapstakPanelProvider {
    constructor(context) {
        this.context = context;
        // Register the browser message router once, at construction time.
        // All messages forwarded from the browser webview land here and get
        // dispatched to the correct tab handler based on their `type` field.
        (0, devRunner_1.setBrowserMessageHandler)((msg) => {
            this.routeBrowserMessage(msg);
        });
        (0, devRunner_1.setBrowserPanelOpenHandler)(() => {
            this._view?.webview.postMessage({ command: 'browserPanelOpen' });
        });
        (0, copywriterPanel_1.setCopywriterMessageHandler)((msg) => {
            if (msg.type === 'SHOW_BLOCK_PROPERTIES') {
                this._view?.webview.postMessage({ command: 'switchTab', tab: 'copywriter' });
                this._view?.webview.postMessage({ command: 'loadBlockProperties', block: msg.block });
            }
        });
    }
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        (0, databaseCanvasPanel_1.setSidebarView)(webviewView);
        (0, drawingCanvasPanel_1.setDrawingCanvasSidebarView)(webviewView);
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = this.getHtml();
        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'prompt':
                    await this.handlePrompt(message.text, message.tab);
                    break;
                case 'applyAnimation':
                    this.handleApplyAnimation(message);
                    break;
                case 'openDashboard':
                    vscode.env.openExternal(vscode.Uri.parse('https://snapstak.ai'));
                    break;
                case 'openDatabaseCanvas':
                    (0, databaseCanvasPanel_1.openDatabaseCanvasPanel)(this.context);
                    break;
                case 'openDrawingCanvas':
                    (0, drawingCanvasPanel_1.openDrawingCanvasPanel)(this.context);
                    break;
                case 'openCopywriter':
                    vscode.commands.executeCommand('snapstak.openCopywriter');
                    break;
                // Reveal the browser panel when a browser-enabled tab is clicked
                case 'revealBrowser': {
                    const panel = (0, devRunner_1.getBrowserPanel)();
                    if (panel) {
                        panel.reveal(vscode.ViewColumn.Two);
                        panel.webview.postMessage({ command: 'activateTab', tab: message.tab });
                    }
                    break;
                }
                // Forward activateTab from sidebar to browser panel
                case 'activateTab': {
                    const panel = (0, devRunner_1.getBrowserPanel)();
                    if (panel) {
                        panel.webview.postMessage({ command: 'activateTab', tab: message.tab });
                    }
                    break;
                }
                // Disable tracker buttons when non-browser tab is active
                case 'deactivateTab': {
                    const panel = (0, devRunner_1.getBrowserPanel)();
                    if (panel) {
                        panel.webview.postMessage({ command: 'deactivateTab' });
                    }
                    break;
                }
                // Drawing canvas props
                case 'setToolMode':
                    (0, drawingCanvasPanel_1.postToDrawingCanvas)({ command: 'setToolMode', tool: message.tool });
                    break;
                case 'rectProps':
                    (0, drawingCanvasPanel_1.postToDrawingCanvas)({ command: 'rectProps', props: message.props });
                    break;
                case 'ellipseProps':
                    (0, drawingCanvasPanel_1.postToDrawingCanvas)({ command: 'ellipseProps', props: message.props });
                    break;
                case 'polygonProps':
                    (0, drawingCanvasPanel_1.postToDrawingCanvas)({ command: 'polygonProps', props: message.props });
                    break;
                case 'lineProps':
                    (0, drawingCanvasPanel_1.postToDrawingCanvas)({ command: 'lineProps', props: message.props });
                    break;
                case 'penProps':
                    (0, drawingCanvasPanel_1.postToDrawingCanvas)({ command: 'penProps', props: message.props });
                    break;
                case 'bezierProps':
                    (0, drawingCanvasPanel_1.postToDrawingCanvas)({ command: 'bezierProps', props: message.props });
                    break;
                case 'textProps':
                    (0, drawingCanvasPanel_1.postToDrawingCanvas)({ command: 'textProps', props: message.props });
                    break;
                case 'requestLayers':
                    (0, drawingCanvasPanel_1.postToDrawingCanvas)({ command: 'requestLayers' });
                    break;
                case 'selectObject':
                    (0, drawingCanvasPanel_1.postToDrawingCanvas)({ command: 'selectObject', uid: message.uid });
                    break;
                case 'deleteObject':
                    (0, drawingCanvasPanel_1.postToDrawingCanvas)({ command: 'deleteObject', uid: message.uid });
                    break;
                case 'renameObject':
                    (0, drawingCanvasPanel_1.postToDrawingCanvas)({ command: 'renameObject', uid: message.uid, name: message.name });
                    break;
                case 'reorderObject':
                    (0, drawingCanvasPanel_1.postToDrawingCanvas)({ command: 'reorderObject', uid: message.uid, targetUid: message.targetUid, position: message.position });
                    break;
                // broadcastSchema handled directly in databaseCanvasPanel via setSidebarView
            }
        });
    }
    // ─────────────────────────────────────────────────────────
    // BROWSER MESSAGE ROUTER
    // Receives all messages forwarded from the browser webview
    // and dispatches them to the correct tab handler.
    // ─────────────────────────────────────────────────────────
    routeBrowserMessage(msg) {
        if (!msg?.type) {
            return;
        }
        switch (msg.type) {
            // Copywriter — tracker ready
            case 'SS_TRACKER_READY': {
                (0, copywriterPanel_1.forwardToCopywriter)({ type: 'SS_TRACKER_READY' });
                break;
            }
            case 'COPYWRITER_SELECTION_COMPLETE': {
                if (msg.isGroupMode === true) {
                    const rawGroup = msg.payload || [];
                    const cwGroupBlocks = rawGroup.map((item) => ({
                        blockId: item.blockId,
                        isGroup: true,
                        label: item.label ? {
                            tag: item.label.tag, text: item.label.text,
                            wordCount: item.label.wordCount, outerHTML: item.label.outerHTML,
                            typography: item.label.typography, isHidden: !!item.label.isHidden
                        } : null,
                        heading: item.parent ? {
                            tag: item.parent.tag, text: item.parent.text,
                            wordCount: item.parent.wordCount, outerHTML: item.parent.outerHTML,
                            typography: item.parent.typography, isHidden: !!item.parent.isHidden
                        } : null,
                        bodyText: (item.children || []).map((c) => ({
                            tag: c.tag, text: c.text, wordCount: c.wordCount,
                            outerHTML: c.outerHTML, typography: c.typography,
                            isHidden: !!c.isHidden, isGroup: true
                        })),
                        buttons: [],
                        links: []
                    }));
                    (0, copywriterPanel_1.forwardToCopywriter)({ type: 'LOAD_BLOCKS', blocks: cwGroupBlocks, isGroupMode: true, rootLabel: msg.rootLabel || null });
                    break;
                }
                const HEADING_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);
                const BUTTON_TAGS = new Set(['BUTTON', 'INPUT']);
                const LINK_TAGS = new Set(['A']);
                const raw = msg.payload || [];
                const cwBlocks = [];
                let current = null;
                for (const item of raw) {
                    const tag = (item.tag || '').toUpperCase();
                    const isGroup = !!item.isGroup;
                    if (HEADING_TAGS.has(tag)) {
                        current = { blockId: item.blockId, isGroup, heading: { tag, text: item.text, wordCount: item.wordCount, outerHTML: item.outerHTML, typography: item.typography }, bodyText: [], buttons: [], links: [] };
                        cwBlocks.push(current);
                    }
                    else if (BUTTON_TAGS.has(tag)) {
                        if (current) {
                            current.buttons.push({ tag, text: item.text, wordCount: item.wordCount, outerHTML: item.outerHTML, typography: item.typography });
                        }
                        else {
                            cwBlocks.push({ blockId: item.blockId, isGroup, heading: { tag, text: item.text, wordCount: item.wordCount, outerHTML: item.outerHTML, typography: item.typography }, bodyText: [], buttons: [], links: [] });
                        }
                    }
                    else if (LINK_TAGS.has(tag)) {
                        if (current) {
                            current.links.push({ tag, text: item.text, wordCount: item.wordCount, outerHTML: item.outerHTML, typography: item.typography });
                        }
                        else {
                            cwBlocks.push({ blockId: item.blockId, isGroup, heading: { tag, text: item.text, wordCount: item.wordCount, outerHTML: item.outerHTML, typography: item.typography }, bodyText: [], buttons: [], links: [] });
                        }
                    }
                    else {
                        if (current) {
                            current.bodyText.push({ tag, text: item.text, wordCount: item.wordCount, outerHTML: item.outerHTML, typography: item.typography, isGroup });
                        }
                        else {
                            current = { blockId: item.blockId, isGroup, heading: { tag, text: item.text, wordCount: item.wordCount, outerHTML: item.outerHTML, typography: item.typography }, bodyText: [], buttons: [], links: [] };
                            cwBlocks.push(current);
                        }
                    }
                }
                (0, copywriterPanel_1.forwardToCopywriter)({ type: 'LOAD_BLOCKS', blocks: cwBlocks });
                break;
            }
            // Media — selection complete (handler to be added in mediaPanel)
            case 'MEDIA_SELECTION_COMPLETE': {
                this._view?.webview.postMessage({ command: 'mediaSelectionComplete', payload: msg.payload });
                break;
            }
            // Database — Stak IDs updated (handler to be added in databasePanel)
            case 'DATABASE_STAK_IDS_UPDATED': {
                this._view?.webview.postMessage({ command: 'stakIdsUpdated', payload: msg.payload });
                break;
            }
            default: {
                // Forward unknown browser messages to the sidebar as-is
                // so future tab handlers can pick them up without touching this file
                this._view?.webview.postMessage(msg);
                break;
            }
        }
    }
    // ─────────────────────────────────────────────────────────
    // PROMPT
    // ─────────────────────────────────────────────────────────
    getServerUrl() {
        return vscode.workspace.getConfiguration('snapstak').get('serverUrl', 'http://localhost:3001');
    }
    async getSessionToken() {
        return this.context.secrets.get('snapstak.sessionToken');
    }
    async handlePrompt(text, tab) {
        if (!text?.trim()) {
            return;
        }
        const token = await this.getSessionToken();
        if (!token) {
            this._view?.webview.postMessage({ command: 'response', error: 'Not authenticated. Please enter your SnapStak API key.' });
            return;
        }
        this._view?.webview.postMessage({ command: 'thinking', thinking: true });
        try {
            const res = await fetch(`${this.getServerUrl()}/api/plugin/prompt`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: text, tab, context: 'vscode' })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || `Server error (${res.status})`);
            }
            this._view?.webview.postMessage({ command: 'response', text: data.response || data.result || JSON.stringify(data), tab });
        }
        catch (err) {
            this._view?.webview.postMessage({ command: 'response', error: err.message || 'Request failed.' });
        }
        finally {
            this._view?.webview.postMessage({ command: 'thinking', thinking: false });
        }
    }
    // ─────────────────────────────────────────────────────────
    // ANIMATION APPLY
    // ─────────────────────────────────────────────────────────
    handleApplyAnimation(message) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('SnapStak: Open a file to inject animation code.');
            return;
        }
        const snippet = new vscode.SnippetString(`\n${message.code}\n`);
        editor.insertSnippet(snippet, editor.selection.active);
        vscode.window.showInformationMessage(`SnapStak: ${message.type} animation injected.`);
    }
    // ─────────────────────────────────────────────────────────
    // HTML SHELL
    // ─────────────────────────────────────────────────────────
    getHtml() {
        return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src *;">
  <title>SnapStak</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --blue       : #38BDF8;
      --blue-dim   : #0284c7;
      --blue-glow  : rgba(56,189,248,0.15);
      --border     : var(--vscode-widget-border, #3a3a3a);
      --bg         : var(--vscode-sideBar-background);
      --bg-input   : var(--vscode-input-background);
      --fg         : var(--vscode-foreground);
      --fg-dim     : var(--vscode-descriptionForeground);
      --tab-h      : 36px;
    }

    html, body { height: 100%; background: var(--bg); color: var(--fg); font-family: var(--vscode-font-family); font-size: var(--vscode-font-size); overflow: hidden; }

    .panel { display: flex; flex-direction: column; height: 100vh; }

    /* ── TABS ── */
    .tabs { display: grid; grid-template-columns: repeat(4, 1fr); border-bottom: 1px solid var(--border); flex-shrink: 0; }
    .tab { height: var(--tab-h); padding: 0 6px; border: none; border-bottom: 2px solid transparent; background: transparent; color: var(--fg-dim); font-family: var(--vscode-font-family); font-size: 11px; font-weight: 600; letter-spacing: 0.4px; text-transform: uppercase; cursor: pointer; transition: color 0.15s, border-color 0.15s; white-space: nowrap; text-align: center; display: inline-flex; align-items: center; justify-content: center; }
    .tab:nth-child(-n+4) { border-bottom: 1px solid var(--border); }
    .tab:hover { color: var(--fg); }
    .tab.active { color: var(--blue); border-bottom-color: var(--blue) !important; }

    /* Browser-connected tab indicator */
    .tab-inner { display: inline-flex; align-items: center; gap: 5px; }
    .tab-dot { display: none; width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
    .tab.active.browser-live[data-tab="media"]      .tab-dot { display: inline-block; background: #22c55e; }
    .tab.active.browser-live[data-tab="copywriter"] .tab-dot { display: inline-block; background: #38BDF8; }
    .tab.active.browser-live[data-tab="database"]   .tab-dot { display: inline-block; background: #f59e0b; }

    /* ── CONTENT ── */
    .content { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 0; scrollbar-width: thin; min-height: 0; }
    .content.db-active { overflow: hidden; display: flex; flex-direction: column; }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }
    #panel-canvas.active { display: flex; }

    /* ── PLACEHOLDER ── */
    .placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 160px; gap: 10px; opacity: 0.4; }
    .placeholder-icon { font-size: 32px; line-height: 1; }
    .placeholder-label { font-size: 12px; color: var(--fg-dim); text-align: center; line-height: 1.5; }

    /* ── RESPONSES ── */
    .response-area { margin-top: 12px; flex-shrink: 0; }
    #panel-canvas .response-area { margin-top: 0; }
    #panel-canvas .thinking { flex-shrink: 0; }
    .response-bubble { background: var(--blue-glow); border: 1px solid var(--blue); border-radius: 6px; padding: 10px 12px; font-size: 12px; line-height: 1.6; color: var(--fg); white-space: pre-wrap; word-break: break-word; }
    .response-bubble.error { background: var(--vscode-inputValidation-errorBackground, rgba(180,30,30,0.15)); border-color: var(--vscode-inputValidation-errorBorder, #be1100); color: var(--vscode-errorForeground, #f48771); }
    .response-meta { font-size: 10px; color: var(--fg-dim); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }

    /* ── THINKING ── */
    .thinking { display: none; align-items: center; gap: 8px; padding: 10px 0; font-size: 12px; color: var(--blue); }
    .thinking.visible { display: flex; }
    .thinking-dots span { display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: var(--blue); animation: dot-bounce 1.2s infinite; }
    .thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
    .thinking-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dot-bounce { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-5px);opacity:1} }

    /* ── PROMPT BAR ── */
    .prompt-bar { flex-shrink: 0; border-top: 1px solid var(--border); padding: 10px; background: var(--bg); }
    .prompt-bar.hidden { display: none; }
    .prompt-wrap { display: flex; align-items: flex-end; gap: 6px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; transition: border-color 0.15s; }
    .prompt-wrap:focus-within { border-color: var(--blue); }
    .prompt-input { flex: 1; background: transparent; border: none; outline: none; resize: none; color: var(--fg); font-family: var(--vscode-font-family); font-size: 12px; line-height: 1.5; max-height: 120px; min-height: 20px; overflow-y: auto; scrollbar-width: thin; }
    .prompt-input::placeholder { color: var(--fg-dim); opacity: 0.7; }
    .send-btn { flex-shrink: 0; width: 26px; height: 26px; border-radius: 5px; border: none; background: var(--blue); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s, opacity 0.15s; padding: 0; }
    .send-btn:hover:not(:disabled) { background: var(--blue-dim); }
    .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .send-btn svg { width: 14px; height: 14px; fill: currentColor; }
    .prompt-hint { font-size: 10px; color: var(--fg-dim); margin-top: 5px; text-align: center; opacity: 0.6; }
  </style>
</head>
<body>

<div class="panel">

  <div class="tabs" id="tabs">
    <button class="tab active browser-tab" data-tab="media"><span class="tab-inner"><span class="tab-dot"></span>Media</span></button>
    <button class="tab browser-tab"        data-tab="copywriter"><span class="tab-inner"><span class="tab-dot"></span>Copywriter</span></button>
    <button class="tab"                    data-tab="actions">Actions</button>
    <button class="tab"                    data-tab="form">Form</button>
    <button class="tab"                    data-tab="animation">Animation</button>
    <button class="tab browser-tab"        data-tab="database"><span class="tab-inner"><span class="tab-dot"></span>Database</span></button>
    <button class="tab"                    data-tab="canvas">Canvas</button>
    <button class="tab"                    data-tab="library">Library</button>
  </div>

  <div class="content" id="content">
    ${(0, mediaPanel_1.getMediaPanel)()}
    ${(0, copywriterPanelTab_1.getCopywriterPanel)()}
    ${(0, actionsPanel_1.getActionsPanel)()}
    ${(0, formPanel_1.getFormPanel)()}
    ${(0, animationPanel_1.getAnimationPanel)()}
    ${(0, databasePanel_1.getDatabasePanel)()}
    ${(0, canvasPanel_1.getCanvasPanel)()}
    ${(0, libraryPanel_1.getLibraryPanel)()}
  </div>

  <div class="prompt-bar" id="promptBar">
    <div class="prompt-wrap">
      <textarea class="prompt-input" id="promptInput" placeholder="Ask SnapStak AI..." rows="1"></textarea>
      <button class="send-btn" id="sendBtn" title="Send (Enter)">
        <svg viewBox="0 0 16 16"><path d="M1.5 2L14.5 8L1.5 14V9.5L10.5 8L1.5 6.5V2Z"/></svg>
      </button>
    </div>
    <div class="prompt-hint">Enter to send &nbsp;·&nbsp; Shift+Enter for new line</div>
  </div>

</div>

<script>
  window.vscodeApi = acquireVsCodeApi();
  const promptInput = document.getElementById('promptInput');
  const sendBtn     = document.getElementById('sendBtn');
  const BROWSER_TABS = new Set(['media', 'copywriter', 'database']);
  let activeTab = 'media';

  // Tab switching
  document.getElementById('tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab');
    if (!btn) { return; }
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    activeTab = btn.dataset.tab;
    document.getElementById('panel-' + activeTab).classList.add('active');
    document.getElementById('content').classList.toggle('db-active', activeTab === 'database' || activeTab === 'canvas');
    document.getElementById('promptBar').classList.toggle('hidden', activeTab === 'database');

    // Special panel commands
    if (activeTab === 'database') { window.vscodeApi.postMessage({ command: 'openDatabaseCanvas' }); }
    if (activeTab === 'canvas')   { window.vscodeApi.postMessage({ command: 'openDrawingCanvas' });  }

    // Reveal the browser panel if this tab uses it and the browser is already open
    if (BROWSER_TABS.has(activeTab)) {
      window.vscodeApi.postMessage({ command: 'revealBrowser', tab: activeTab });
    } else {
      window.vscodeApi.postMessage({ command: 'deactivateTab' });
    }

    promptInput.placeholder = \`Ask SnapStak AI about \${btn.textContent.trim()}...\`;
    promptInput.focus();
  });

  // Auto-resize textarea
  promptInput.addEventListener('input', () => {
    promptInput.style.height = 'auto';
    promptInput.style.height = Math.min(promptInput.scrollHeight, 120) + 'px';
  });

  // Send on Enter
  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  sendBtn.addEventListener('click', send);

  function send() {
    const text = promptInput.value.trim();
    if (!text) { return; }
    window.vscodeApi.postMessage({ command: 'prompt', text, tab: activeTab });
    promptInput.value = '';
    promptInput.style.height = 'auto';
  }

  // Messages from extension
  window.addEventListener('message', (event) => {
    const msg = event.data;
    switch (msg.command) {
      case 'thinking': {
        const el = document.getElementById('thinking-' + activeTab);
        if (el) { el.classList.toggle('visible', msg.thinking); }
        sendBtn.disabled = msg.thinking;
        break;
      }
      case 'response': {
        sendBtn.disabled = false;
        const area = document.getElementById('response-' + (msg.tab || activeTab));
        if (!area) { break; }
        const meta   = document.createElement('div');
        meta.className   = 'response-meta';
        meta.textContent = new Date().toLocaleTimeString();
        const bubble = document.createElement('div');
        bubble.className   = 'response-bubble' + (msg.error ? ' error' : '');
        bubble.textContent = msg.error || msg.text;
        area.prepend(bubble);
        area.prepend(meta);
        document.getElementById('content').scrollTop = 0;
        break;
      }
      case 'switchTab': {
        const target = document.querySelector('.tab[data-tab="' + msg.tab + '"]');
        if (target) { target.click(); }
        break;
      }
      // Light up browser-tab indicator dots when browser panel is open
      case 'browserPanelOpen': {
        document.querySelectorAll('.browser-tab').forEach(t => t.classList.add('browser-live'));
        // Activate tracker for whichever browser tab is currently active
        if (BROWSER_TABS.has(activeTab)) {
          window.vscodeApi.postMessage({ command: 'activateTab', tab: activeTab });
        }
        break;
      }
      case 'browserPanelClosed': {
        document.querySelectorAll('.browser-tab').forEach(t => t.classList.remove('browser-live'));
        break;
      }
    }
  });

  // Boot animation panel
  if (window.animPanel) { window.animPanel.init(); }

  promptInput.focus();
</script>
</body>
</html>`;
    }
}
exports.SnapstakPanelProvider = SnapstakPanelProvider;
SnapstakPanelProvider.viewId = 'snapstak.panelView';
//# sourceMappingURL=snapstakPanelProvider.js.map