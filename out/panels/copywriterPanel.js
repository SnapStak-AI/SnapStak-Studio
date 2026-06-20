"use strict";
/**
 * SnapStak Copywriter Panel
 * AI-powered copywriting — full editor panel.
 * All HTML, CSS and JS are inlined — no external media files.
 * Follows the exact same pattern as drawingCanvasPanel.ts.
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
exports.setCopywriterMessageHandler = setCopywriterMessageHandler;
exports.initCopywriter = initCopywriter;
exports.openCopywriterPanel = openCopywriterPanel;
exports.forwardToCopywriter = forwardToCopywriter;
const vscode = __importStar(require("vscode"));
const injection_1 = require("../copywriter/injection");
const devRunner_1 = require("../devRunner");
let currentPanel;
let _storedContext;
let _storedClient;
let _pendingMsg;
let _onCopywriterMessage;
function setCopywriterMessageHandler(handler) {
    _onCopywriterMessage = handler;
}
function initCopywriter(context, client) {
    _storedContext = context;
    _storedClient = client;
}
function openCopywriterPanel(context, client, projectRoot) {
    _storedContext = context;
    _storedClient = client;
    if (currentPanel) {
        currentPanel.reveal(vscode.ViewColumn.One);
        if (_pendingMsg) {
            setTimeout(() => { currentPanel?.webview.postMessage(_pendingMsg); _pendingMsg = undefined; }, 300);
        }
        return;
    }
    currentPanel = vscode.window.createWebviewPanel('snapstakCopywriter', 'SnapStak Copywriter', vscode.ViewColumn.One, {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: []
    });
    currentPanel.webview.html = getHtml();
    if (_pendingMsg) {
        setTimeout(() => { currentPanel?.webview.postMessage(_pendingMsg); _pendingMsg = undefined; }, 500);
    }
    // ── Message bridge ──────────────────────────────────────────
    currentPanel.webview.onDidReceiveMessage(async (msg) => {
        switch (msg.type) {
            case 'SHOW_BLOCK_PROPERTIES': {
                if (_onCopywriterMessage) {
                    _onCopywriterMessage(msg);
                }
                break;
            }
            case 'CLOSE_COPYWRITER': {
                currentPanel?.dispose();
                break;
            }
            case 'clearTracker': {
                (0, devRunner_1.postToBrowser)({ command: 'ss_clear' });
                // Tracker was destroyed by _finish() — restart it so user can reselect.
                setTimeout(() => {
                    (0, devRunner_1.postToBrowser)({ command: 'ss_start' });
                    // Restore group mode if that was the active mode
                    setTimeout(() => { (0, devRunner_1.postToBrowser)({ command: 'ss_set_content_mode', mode: msg.contentMode || 'text' }); }, 100);
                }, 100);
                break;
            }
            case 'COPYWRITER_SELECTION_COMPLETE': {
                currentPanel?.webview.postMessage({
                    type: 'LOAD_BLOCKS',
                    blocks: msg.payload,
                    isGroupMode: !!(msg.isGroupMode)
                });
                break;
            }
            case 'GENERATE_DESCRIPTION': {
                try {
                    const description = await client.copywriterGenerateDescription(msg.keywords);
                    currentPanel?.webview.postMessage({ type: 'DESCRIPTION_GENERATED', description });
                }
                catch (err) {
                    currentPanel?.webview.postMessage({ type: 'AI_ERROR', message: err.message });
                }
                break;
            }
            case 'GENERATE_HEADING': {
                try {
                    const heading = await client.copywriterGenerateHeading(msg.blockId, msg.originalHeading, msg.headingTag, msg.wordCount, msg.businessDescription, msg.keywords);
                    currentPanel?.webview.postMessage({
                        type: 'HEADING_GENERATED', blockId: msg.blockId, heading
                    });
                }
                catch (err) {
                    currentPanel?.webview.postMessage({ type: 'AI_ERROR', message: err.message });
                }
                break;
            }
            case 'GENERATE_ALL_HEADINGS': {
                try {
                    const headings = await client.copywriterGenerateAllHeadings(msg.blocks, msg.businessDescription);
                    currentPanel?.webview.postMessage({ type: 'ALL_HEADINGS_GENERATED', headings });
                }
                catch (err) {
                    currentPanel?.webview.postMessage({ type: 'AI_ERROR', message: err.message });
                }
                break;
            }
            case 'REWRITE_BODY_BATCH': {
                const results = {};
                try {
                    await Promise.all(msg.blocks
                        .filter(b => b.bodyText.length > 0)
                        .map(async (block) => {
                        const confirmedHeading = msg.confirmedHeadings[block.blockId];
                        results[block.blockId] = await Promise.all(block.bodyText.map(node => client.copywriterRewriteBody(block.blockId, confirmedHeading, node.text, node.wordCount, msg.businessDescription)));
                    }));
                    currentPanel?.webview.postMessage({ type: 'BODY_REWRITE_COMPLETE', results });
                }
                catch (err) {
                    currentPanel?.webview.postMessage({ type: 'AI_ERROR', message: err.message });
                }
                break;
            }
            case 'REWRITE_BODY_SINGLE': {
                try {
                    const result = await client.copywriterRewriteBody(msg.blockId, msg.confirmedHeading, msg.originalText, msg.wordCountTarget, msg.businessDescription, msg.retryContext);
                    currentPanel?.webview.postMessage({
                        type: 'SINGLE_BODY_REWRITE_COMPLETE',
                        blockId: msg.blockId,
                        nodeIndex: msg.nodeIndex,
                        result
                    });
                }
                catch (err) {
                    currentPanel?.webview.postMessage({ type: 'AI_ERROR', message: err.message });
                }
                break;
            }
            case 'INJECT_CONTENT': {
                if (!projectRoot) {
                    vscode.window.showErrorMessage('SnapStak Copywriter: No project loaded.');
                    break;
                }
                try {
                    const injectionMap = (0, injection_1.buildInjectionMap)(msg.blocks, msg.state);
                    await (0, injection_1.writeInjectedContent)(projectRoot, injectionMap);
                    currentPanel?.webview.postMessage({ type: 'INJECTION_COMPLETE' });
                    vscode.window.showInformationMessage('SnapStak Copywriter: Content injected successfully.');
                }
                catch (err) {
                    vscode.window.showErrorMessage(`SnapStak Copywriter: Injection failed. ${err.message}`);
                }
                break;
            }
        }
    }, undefined, context.subscriptions);
    currentPanel.onDidDispose(() => {
        currentPanel = undefined;
    }, null, context.subscriptions);
}
function forwardToCopywriter(msg) {
    if (currentPanel) {
        // For LOAD_BLOCKS, always delay slightly to ensure the webview is
        // focused and ready — sending immediately when revealing can lose the message.
        if (msg.type === 'LOAD_BLOCKS') {
            currentPanel.reveal(vscode.ViewColumn.One);
            setTimeout(() => { currentPanel?.webview.postMessage(msg); }, 400);
        }
        else {
            currentPanel.webview.postMessage(msg);
        }
        return;
    }
    _pendingMsg = msg;
    if (_storedContext && _storedClient) {
        openCopywriterPanel(_storedContext, _storedClient);
    }
}
// ─────────────────────────────────────────────────────────────
// HTML
// ─────────────────────────────────────────────────────────────
function getHtml() {
    return [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head>',
        '<meta charset="UTF-8">',
        '<meta name="viewport" content="width=device-width,initial-scale=1">',
        '<meta http-equiv="Content-Security-Policy" content="default-src \'none\';style-src \'unsafe-inline\';script-src \'unsafe-inline\';">',
        '<title>SnapStak Copywriter</title>',
        '<style>' + getCss() + '</style>',
        '</head>',
        '<body>',
        getBody(),
        '<script>(function(){\n\'use strict\';\n' + getJs() + '\n})();</script>',
        '</body>',
        '</html>'
    ].join('\n');
}
// ─────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────
function getCss() {
    return `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#111111;--bg-card:#1a1a1a;--bg-input:#1e1e1e;--bg-hover:#222222;
  --border:#2e2e2e;--border-hi:#3a3a3a;
  --blue:#38BDF8;--blue-dim:#0284c7;--blue-glow:rgba(56,189,248,0.12);
  --green:#1D9E75;--green-glow:rgba(29,158,117,0.12);
  --amber:#f59e0b;--red:#ef4444;
  --fg:#e4e4e7;--fg-dim:#71717a;--fg-muted:#52525b;
  --radius:6px;--radius-lg:10px;
}
html,body{height:100%;background:var(--bg);color:var(--fg);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;overflow:hidden;}
.cw-root{display:flex;flex-direction:column;height:100vh;overflow:hidden;}

/* HEADER */
.cw-header{flex-shrink:0;padding:14px 20px 0;border-bottom:1px solid var(--border);background:var(--bg);}
.cw-logo{display:flex;align-items:center;gap:6px;margin-bottom:14px;font-family:'Courier New',monospace;font-weight:700;font-size:11px;letter-spacing:.12em;}
.cw-logo-snap{color:var(--blue);}
.cw-logo-stak{color:var(--fg);}
.cw-logo-divider{width:1px;height:12px;background:var(--border-hi);margin:0 4px;}
.cw-logo-feature{color:var(--fg-dim);font-size:10px;letter-spacing:.14em;}
.cw-phase-track{display:flex;align-items:center;padding-bottom:14px;}
.cw-phase-step{display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;}
.cw-step-num{width:22px;height:22px;border-radius:50%;background:var(--bg-card);border:1.5px solid var(--border-hi);color:var(--fg-muted);font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;transition:all .2s;}
.cw-step-label{font-size:9px;color:var(--fg-muted);letter-spacing:.04em;text-transform:uppercase;transition:color .2s;}
.cw-phase-step.active .cw-step-num{background:var(--blue);border-color:var(--blue);color:#fff;}
.cw-phase-step.active .cw-step-label{color:var(--blue);}
.cw-phase-step.done .cw-step-num{background:var(--green);border-color:var(--green);color:#fff;}
.cw-phase-step.done .cw-step-label{color:var(--green);}
.cw-phase-line{flex:1;height:1px;background:var(--border);margin:0 4px 16px;min-width:8px;}

/* BODY */
.cw-body{flex:1;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;scrollbar-color:var(--border-hi) transparent;}
.cw-phase-panel{display:none;padding:20px;animation:fadeIn .2s ease;}
.cw-phase-panel.active{display:block;}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.cw-phase-title{font-size:15px;font-weight:700;color:var(--fg);margin-bottom:6px;letter-spacing:-.01em;}
.cw-phase-desc{font-size:12px;color:var(--fg-dim);line-height:1.6;margin-bottom:20px;}

/* BUTTONS */
.cw-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:var(--radius);border:none;font-size:12px;font-weight:600;cursor:pointer;transition:background .15s,transform .1s;letter-spacing:.01em;white-space:nowrap;font-family:inherit;}
.cw-btn:active:not(:disabled){transform:scale(.97);}
.cw-btn:disabled{opacity:.38;cursor:not-allowed;}
.cw-btn-primary{background:var(--blue);color:#fff;}
.cw-btn-primary:hover:not(:disabled){background:var(--blue-dim);}
.cw-btn-secondary{background:var(--bg-card);color:var(--fg-dim);border:1px solid var(--border-hi);}
.cw-btn-secondary:hover:not(:disabled){background:var(--bg-hover);color:var(--fg);}
.cw-btn-ghost{background:transparent;color:var(--fg-dim);border:1px solid var(--border);}
.cw-btn-ghost:hover:not(:disabled){background:var(--bg-hover);color:var(--fg);}
.cw-btn-sm{padding:5px 10px;font-size:11px;}
.cw-btn-inject{background:var(--green);color:#fff;width:100%;justify-content:center;padding:10px 20px;font-size:13px;margin-top:16px;}
.cw-btn-inject:hover:not(:disabled){background:#178a63;}

/* INPUTS */
.cw-field-group{margin-bottom:18px;}
.cw-label{display:block;font-size:11px;font-weight:600;color:var(--fg-dim);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;}
.cw-label-hint{font-weight:400;text-transform:none;font-size:10px;color:var(--fg-muted);}
.cw-required{color:var(--blue);}
.cw-input,.cw-textarea{width:100%;background:var(--bg-input);border:1px solid var(--border-hi);border-radius:var(--radius);color:var(--fg);font-family:inherit;font-size:12px;padding:8px 10px;outline:none;resize:none;transition:border-color .15s;}
.cw-input:focus,.cw-textarea:focus{border-color:var(--blue);}
.cw-input::placeholder,.cw-textarea::placeholder{color:var(--fg-muted);}
.cw-char-count{font-size:10px;color:var(--fg-muted);text-align:right;margin-top:4px;}

/* PHASE 1 — SELECTION BASKET */
.cw-basket-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.cw-basket-summary{font-size:12px;color:var(--fg-dim);}
.cw-basket-clear{background:transparent;border:1px solid var(--border-hi);color:var(--fg-muted);font-size:11px;padding:4px 10px;border-radius:var(--radius);cursor:pointer;font-family:inherit;transition:all .15s;}
.cw-basket-clear:hover{border-color:var(--red);color:var(--red);}
.cw-basket-list{display:flex;flex-direction:column;gap:6px;margin-bottom:16px;}
.cw-basket-item{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;}
.cw-basket-item-header{display:flex;align-items:center;gap:8px;padding:9px 12px;}
.cw-basket-item-tag{font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;background:var(--blue-glow);color:var(--blue);letter-spacing:.06em;flex-shrink:0;}
.cw-basket-item-tag.root{background:rgba(56,189,248,0.15);color:var(--blue);}
.cw-basket-item-name{font-size:12px;color:var(--fg);font-weight:500;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cw-basket-item-badge{font-size:10px;color:var(--fg-muted);background:var(--bg-hover);padding:2px 8px;border-radius:10px;flex-shrink:0;}
.cw-basket-remove{background:transparent;border:none;color:var(--fg-muted);cursor:pointer;font-size:14px;padding:0 4px;line-height:1;flex-shrink:0;transition:color .15s;}
.cw-basket-remove:hover{color:var(--red);}
.cw-basket-children{border-top:1px solid var(--border);padding:6px 12px 8px;display:flex;flex-direction:column;gap:3px;}
.cw-basket-child{display:flex;align-items:center;gap:8px;padding:3px 0;}
.cw-basket-child-tag{font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px;background:rgba(167,139,250,0.12);color:#a78bfa;letter-spacing:.05em;flex-shrink:0;}
.cw-basket-child-name{font-size:11px;color:var(--fg-dim);flex:1;}
.cw-basket-child-badge{font-size:10px;color:var(--fg-muted);background:var(--bg-hover);padding:1px 6px;border-radius:8px;flex-shrink:0;}
.cw-basket-confirm-row{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);cursor:pointer;font-size:12px;color:var(--fg-dim);user-select:none;transition:border-color .15s;}
.cw-basket-confirm-row:hover{border-color:var(--blue);color:var(--fg);}
.cw-basket-confirm-row input[type="checkbox"]{accent-color:var(--blue);width:14px;height:14px;cursor:pointer;}

/* PHASE 1 BASKET */
.cw-basket-toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.cw-basket-summary{font-size:11px;color:var(--fg-dim);}
.cw-basket-list{display:flex;flex-direction:column;gap:6px;}
.cw-basket-item{display:flex;align-items:center;gap:8px;padding:9px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);}
.cw-basket-item-tag{font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;background:rgba(56,189,248,0.12);color:var(--blue);letter-spacing:.06em;flex-shrink:0;}
.cw-basket-item-tag.group{background:rgba(56,189,248,0.12);color:var(--blue);}
.cw-basket-item-text{font-size:12px;color:var(--fg);font-weight:500;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cw-basket-item-badge{font-size:10px;color:var(--fg-muted);flex-shrink:0;}
.cw-basket-remove{background:transparent;border:none;color:var(--fg-muted);cursor:pointer;font-size:14px;padding:0 2px;line-height:1;flex-shrink:0;transition:color .15s;}
.cw-basket-remove:hover{color:var(--red);}
.cw-basket-group-root{border:1px solid rgba(56,189,248,0.25);border-radius:var(--radius-lg);overflow:hidden;background:#0d1c26;margin-bottom:2px;}
.cw-basket-group-header{display:flex;align-items:center;gap:8px;padding:9px 12px;background:rgba(56,189,248,0.08);border-bottom:1px solid rgba(56,189,248,0.18);}
.cw-basket-group-label{font-size:12px;color:var(--blue);font-weight:600;flex:1;}
.cw-basket-group-children{display:flex;flex-direction:column;gap:4px;padding:8px 10px;}
.cw-basket-group-child{display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);}

/* PHASE 1 — SELECTOR HINT */
.cw-selector-hint{font-size:11px;color:var(--fg-muted);line-height:1.5;padding:8px 10px;background:var(--bg-card);border-radius:var(--radius);border-left:2px solid var(--blue);margin-bottom:12px;}

/* PHASE 3 — TWO COLUMN COMPARISON */
.cw-selector-actions{margin-bottom:20px;}
.cw-selector-hint{font-size:11px;color:var(--fg-muted);line-height:1.5;padding:8px 10px;background:var(--bg-card);border-radius:var(--radius);border-left:2px solid var(--blue);margin-bottom:12px;}
.cw-empty-state{display:flex;flex-direction:column;align-items:center;gap:10px;padding:40px 20px;opacity:.5;}
.cw-empty-label{font-size:12px;color:var(--fg-dim);}

.cw-compare-wrap{border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;}
.cw-compare-header{display:grid;grid-template-columns:1fr 1fr;background:var(--bg);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10;}
.cw-compare-header-cell{padding:6px 12px;font-size:9px;font-weight:700;color:var(--fg-muted);text-transform:uppercase;letter-spacing:.08em;}
.cw-compare-header-cell:first-child{border-right:1px solid var(--border);}

.cw-compare-rows{display:flex;flex-direction:column;}
.cw-compare-row{display:grid;grid-template-columns:1fr 1fr;cursor:pointer;border-bottom:1px solid var(--border);transition:filter .15s;}
.cw-compare-row:last-child{border-bottom:none;}
.cw-compare-row:hover .cw-col-original,.cw-compare-row:hover .cw-col-rewrite{background:var(--bg-hover);}
.cw-compare-row.selected .cw-col-original,.cw-compare-row.selected .cw-col-rewrite{background:var(--blue-glow);}

.cw-col-original{padding:10px 12px;min-height:56px;border-right:1px solid var(--border);background:var(--bg-card);}
.cw-col-rewrite{padding:10px 12px;min-height:56px;background:var(--bg-card);position:relative;}
.cw-col-rewrite.applied{background:rgba(56,189,248,0.06);}

.cw-col-tag{font-size:9px;font-weight:700;padding:2px 5px;border-radius:3px;background:var(--blue-glow);color:var(--blue);letter-spacing:.06em;display:inline-block;margin-bottom:5px;}
.cw-col-text{font-size:12px;color:var(--fg);line-height:1.5;word-break:break-word;}
.cw-col-text.empty{color:var(--fg-muted);font-style:italic;font-size:11px;}
.cw-col-status{position:absolute;top:8px;right:8px;width:8px;height:8px;border-radius:50%;background:var(--fg-muted);}
.cw-col-status.complete{background:var(--green);}
.cw-col-clear{position:absolute;bottom:6px;right:6px;width:16px;height:16px;border:none;background:transparent;color:var(--fg-muted);cursor:pointer;font-size:11px;display:none;align-items:center;justify-content:center;border-radius:3px;padding:0;}
.cw-col-clear:hover{color:var(--red);background:rgba(239,68,68,.1);}
.cw-col-rewrite.applied .cw-col-clear{display:flex;}
.cw-col-label{font-size:10px;color:var(--fg-muted);font-style:italic;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cw-col-body-chip{display:inline-flex;align-items:center;gap:3px;margin-top:5px;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;background:rgba(56,189,248,0.10);color:var(--blue);letter-spacing:.04em;}
.cw-col-body-chip.applied-chip{background:rgba(29,158,117,0.10);color:var(--green);}
.cw-col-hidden-badge{font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px;background:rgba(239,68,68,0.10);color:var(--red);letter-spacing:.04em;margin-left:4px;}

/* PHASE 3 */
.cw-heading-actions{margin-bottom:16px;}
.cw-heading-blocks{display:flex;flex-direction:column;gap:12px;}
.cw-heading-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:14px;}
.cw-heading-card-top{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
.cw-heading-original{font-size:11px;color:var(--fg-muted);font-style:italic;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;}
.cw-heading-input-row{display:flex;align-items:center;gap:8px;}
.cw-heading-input{flex:1;background:var(--bg-input);border:1px solid var(--border-hi);border-radius:var(--radius);color:var(--fg);font-size:12px;padding:7px 10px;outline:none;font-family:inherit;transition:border-color .15s;}
.cw-heading-input:focus{border-color:var(--blue);}
.cw-wc-badge{font-size:10px;padding:3px 7px;border-radius:3px;font-weight:600;flex-shrink:0;}
.cw-wc-badge.match{background:var(--green-glow);color:var(--green);}
.cw-wc-badge.mismatch{background:rgba(239,68,68,.12);color:var(--red);}
.cw-wc-badge.empty{background:var(--bg-hover);color:var(--fg-muted);}
.cw-node-list{margin-top:10px;border-top:1px solid var(--border);padding-top:10px;display:flex;flex-direction:column;gap:6px;}
.cw-node-row{display:flex;align-items:center;gap:8px;}
.cw-node-type{font-size:9px;color:var(--fg-muted);text-transform:uppercase;letter-spacing:.06em;width:38px;flex-shrink:0;}
.cw-node-input{flex:1;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius);color:var(--fg);font-size:11px;padding:5px 8px;outline:none;font-family:inherit;transition:border-color .15s;}
.cw-node-input:focus{border-color:var(--blue);}

/* PHASE 4 */
.cw-confirm-blocks{display:flex;flex-direction:column;gap:10px;margin-bottom:16px;}
.cw-confirm-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:12px 14px;}
.cw-confirm-original{font-size:11px;color:var(--fg-muted);font-style:italic;margin-bottom:4px;}
.cw-confirm-arrow{font-size:11px;color:var(--fg-muted);margin-bottom:4px;}
.cw-confirm-new{font-size:13px;font-weight:600;color:var(--fg);}
.cw-confirm-checkbox-row{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);cursor:pointer;font-size:12px;color:var(--fg-dim);user-select:none;transition:border-color .15s;}
.cw-confirm-checkbox-row:hover{border-color:var(--blue);color:var(--fg);}
.cw-confirm-checkbox-row input[type="checkbox"]{accent-color:var(--blue);width:14px;height:14px;cursor:pointer;}

/* PHASE 5 */
.cw-spinner-row{display:flex;align-items:center;gap:10px;padding:20px;color:var(--fg-dim);font-size:12px;}
.cw-spinner-row.hidden{display:none;}
.cw-spinner{width:20px;height:20px;border:2px solid var(--border-hi);border-top-color:var(--blue);border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0;}
@keyframes spin{to{transform:rotate(360deg)}}
.cw-body-blocks{display:flex;flex-direction:column;gap:14px;}
.cw-body-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:14px;}
.cw-body-card.needs-review{border-color:var(--amber);}
.cw-body-card-header{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
.cw-review-badge{font-size:9px;padding:2px 7px;border-radius:3px;background:rgba(245,158,11,.15);color:var(--amber);font-weight:700;letter-spacing:.06em;text-transform:uppercase;}
.cw-body-node{margin-bottom:8px;}
.cw-body-node:last-child{margin-bottom:0;}
.cw-body-node-label{font-size:10px;color:var(--fg-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;}
.cw-body-text-display{font-size:12px;color:var(--fg);line-height:1.6;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius);padding:8px 10px;}
.cw-body-text-display.review{border-color:var(--amber);background:rgba(245,158,11,.05);}
.cw-body-node-actions{display:flex;gap:6px;margin-top:6px;}

/* PHASE 6 */
.cw-inject-summary{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:14px;margin-bottom:16px;}
.cw-inject-stat{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--fg-dim);padding:4px 0;border-bottom:1px solid var(--border);}
.cw-inject-stat:last-child{border-bottom:none;}
.cw-inject-stat strong{color:var(--fg);}
.cw-inject-warning{display:flex;align-items:center;gap:8px;padding:10px 12px;background:rgba(245,158,11,.07);border:1px solid rgba(245,158,11,.25);border-radius:var(--radius);font-size:11px;color:var(--amber);line-height:1.5;}
.cw-inject-result{margin-top:14px;font-size:12px;color:var(--green);text-align:center;display:none;}
.cw-inject-result.visible{display:block;}

/* FOOTER */
.cw-footer{flex-shrink:0;border-top:1px solid var(--border);background:var(--bg);padding:10px 20px;}
.cw-nav-row{display:flex;align-items:center;justify-content:space-between;gap:12px;}
.cw-phase-label{font-size:11px;color:var(--fg-muted);font-weight:600;letter-spacing:.04em;}

/* AI STATUS */
.cw-ai-status{font-size:11px;color:var(--blue);display:flex;align-items:center;gap:6px;min-height:20px;margin-top:8px;}
.cw-ai-status.error{color:var(--red);}
.cw-ai-error{font-size:11px;color:var(--red);min-height:18px;margin-bottom:6px;padding:0 2px;}
.cw-spinner-inline{width:12px;height:12px;border:1.5px solid var(--border-hi);border-top-color:var(--blue);border-radius:50%;animation:spin .7s linear infinite;display:inline-block;flex-shrink:0;}

/* GROUP MODE */
.cw-group-root{border:1px solid rgba(56,189,248,0.25);border-radius:var(--radius-lg);overflow:hidden;background:#0d1c26;}
.cw-group-root-header{background:rgba(56,189,248,0.08);border-bottom:1px solid rgba(56,189,248,0.18);padding:10px 14px;display:flex;align-items:center;gap:8px;}
.cw-group-root-tag{font-size:9px;font-weight:700;padding:2px 7px;border-radius:3px;background:rgba(56,189,248,0.15);color:var(--blue);letter-spacing:.06em;border:1px solid rgba(56,189,248,0.25);}
.cw-group-root-name{font-size:13px;color:var(--blue);font-weight:600;flex:1;}
.cw-group-root-meta{font-size:11px;color:rgba(56,189,248,0.45);}
.cw-group-child-list{padding:10px 12px;display:flex;flex-direction:column;gap:6px;}
.cw-group-col-labels{display:grid;grid-template-columns:1fr 1fr;padding:0 2px 6px;}
.cw-group-col-label{font-size:9px;color:var(--fg-muted);text-transform:uppercase;letter-spacing:.08em;font-weight:700;}
.cw-group-child{border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;background:var(--bg-card);}
.cw-group-child-header{display:grid;grid-template-columns:1fr 1fr;}
.cw-group-child-orig{padding:9px 12px;display:flex;align-items:center;gap:8px;border-right:1px solid var(--border);}
.cw-group-child-rewrite{padding:9px 12px;display:flex;align-items:center;gap:8px;}
.cw-group-child-tag{font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;background:rgba(167,139,250,0.12);color:#a78bfa;letter-spacing:.05em;border:1px solid rgba(167,139,250,0.2);flex-shrink:0;}
.cw-group-child-name{font-size:12px;color:var(--fg);font-weight:500;flex:1;}
.cw-group-expand-btn{background:var(--bg-hover);border:1px solid var(--border-hi);color:var(--fg-dim);font-size:10px;padding:3px 10px;border-radius:4px;cursor:pointer;white-space:nowrap;font-family:inherit;flex-shrink:0;}
.cw-group-expand-btn:hover{background:#2a2a2a;color:var(--fg);}
.cw-group-rewrite-ph{font-size:12px;color:var(--fg-muted);font-style:italic;flex:1;}
.cw-group-status-dot{width:7px;height:7px;border-radius:50%;background:var(--border-hi);flex-shrink:0;margin-left:auto;}
.cw-group-status-dot.done{background:var(--green);}
.cw-group-hidden-section{display:none;}
.cw-group-child.open .cw-group-hidden-section{display:block;}
.cw-group-hidden-count{font-size:9px;color:var(--fg-muted);text-transform:uppercase;letter-spacing:.07em;padding:5px 12px 3px;border-top:1px solid var(--border);}
.cw-group-hidden-node{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid rgba(46,46,46,0.6);}
.cw-group-hidden-node:hover .cw-group-hn-orig,.cw-group-hidden-node:hover .cw-group-hn-rewrite{background:var(--bg-hover);}
.cw-group-hn-orig{padding:5px 12px;display:flex;align-items:center;gap:8px;border-right:1px solid rgba(46,46,46,0.6);}
.cw-group-hn-rewrite{padding:5px 12px;display:flex;align-items:center;gap:8px;}
.cw-group-hidden-badge{font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px;background:rgba(245,158,11,0.10);color:var(--amber);letter-spacing:.05em;border:1px solid rgba(245,158,11,0.2);flex-shrink:0;}
.cw-group-hn-text{font-size:12px;color:var(--fg-muted);flex:1;}
.cw-group-hn-wc{font-size:10px;color:#2e2e2e;margin-left:auto;}
.cw-group-hn-ph{font-size:12px;color:#2a2a2a;font-style:italic;flex:1;}

.cw-group-child-header.cw-group-selected .cw-group-child-orig,
.cw-group-child-header.cw-group-selected .cw-group-child-rewrite{background:rgba(56,189,248,0.08)!important;}
.cw-group-hidden-node:hover .cw-group-hn-orig,.cw-group-hidden-node:hover .cw-group-hn-rewrite{background:rgba(56,189,248,0.06);}

/* SCROLLBAR */
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--border-hi);border-radius:2px;}
`;
}
// ─────────────────────────────────────────────────────────────
// BODY HTML
// ─────────────────────────────────────────────────────────────
function getBody() {
    return `
<div class="cw-root" id="cwRoot">

  <div class="cw-header" id="cwHeader">
    <div class="cw-logo">
      <span class="cw-logo-snap">SNAP</span><span class="cw-logo-stak">STAK</span>
      <span class="cw-logo-divider"></span>
      <span class="cw-logo-feature">COPYWRITER</span>
    </div>
    <div class="cw-phase-track" id="phaseTrack">
      <div class="cw-phase-step active" data-step="1"><span class="cw-step-num">1</span><span class="cw-step-label">Select</span></div>
      <div class="cw-phase-line"></div>
      <div class="cw-phase-step" data-step="2"><span class="cw-step-num">2</span><span class="cw-step-label">Describe</span></div>
      <div class="cw-phase-line"></div>
      <div class="cw-phase-step" data-step="3"><span class="cw-step-num">3</span><span class="cw-step-label">Review</span></div>
      <div class="cw-phase-line"></div>
      <div class="cw-phase-step" data-step="4"><span class="cw-step-num">4</span><span class="cw-step-label">Confirm</span></div>
      <div class="cw-phase-line"></div>
      <div class="cw-phase-step" data-step="5"><span class="cw-step-num">5</span><span class="cw-step-label">Body</span></div>
      <div class="cw-phase-line"></div>
      <div class="cw-phase-step" data-step="6"><span class="cw-step-num">6</span><span class="cw-step-label">Inject</span></div>
    </div>
  </div>

  <div class="cw-body" id="cwBody">

    <div class="cw-phase-panel active" id="phase1">
      <div class="cw-phase-title">Confirm selection</div>
      <div class="cw-phase-desc">Review what was captured from the browser. Remove any blocks you don't need, then confirm to proceed.</div>

      <div class="cw-empty-state" id="emptyBlocks">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="6" width="24" height="20" rx="2" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="4 2"/><path d="M10 12h12M10 16h8M10 20h10" stroke="#38BDF8" stroke-width="1.5" stroke-linecap="round"/></svg>
        <div class="cw-empty-label">No blocks selected yet. Use the browser panel to select content.</div>
      </div>

      <div id="basketWrap" style="display:none">
        <div class="cw-basket-toolbar">
          <span class="cw-basket-summary" id="basketSummary"></span>
          <button class="cw-btn cw-btn-ghost cw-btn-sm" id="btnClearAll">Clear all</button>
        </div>
        <div class="cw-basket-list" id="basketList"></div>
        <label class="cw-confirm-checkbox-row" id="basketConfirmRow" style="margin-top:14px">
          <input type="checkbox" id="basketConfirmCheck">
          <span>I confirm the selected blocks are correct</span>
        </label>
      </div>
    </div>

    <div class="cw-phase-panel" id="phase2">
      <div class="cw-phase-title">Describe your business</div>
      <div class="cw-phase-desc">Tell the AI what your business does. Be specific — this anchors all generated copy to your domain.</div>
      <div class="cw-field-group">
        <label class="cw-label">Keywords <span class="cw-label-hint">(comma-separated, optional)</span></label>
        <input class="cw-input" id="keywordsInput" type="text" placeholder="e.g. truck racing, motorsport, off-road, speed">
        <button class="cw-btn cw-btn-primary" id="btnGenerateDesc" style="margin-top:8px" disabled>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          Generate from keywords
        </button>
      </div>
      <div class="cw-field-group">
        <label class="cw-label">Business description <span class="cw-required">*</span></label>
        <textarea class="cw-textarea" id="businessDescInput" rows="18" placeholder="e.g. We run South Africa's premier truck racing championship, hosting 6 events per year at venues across the country."></textarea>
        <div class="cw-char-count" id="descCharCount">0 words</div>
      </div>
      <div class="cw-ai-status" id="descAiStatus"></div>
    </div>

    <div class="cw-phase-panel" id="phase3">
      <div class="cw-selector-hint" style="margin-bottom:16px">Click any row to edit its typography and content in the sidebar.</div>
      <div id="blocksPreview">
        <div id="blocksList"></div>
      </div>
      <div class="cw-heading-actions" style="margin-top:16px">
        <button class="cw-btn cw-btn-primary" id="btnGenerateAllHeadings">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          Generate all headings
        </button>
      </div>
      <div class="cw-heading-blocks" id="headingBlocks"></div>
      <div class="cw-ai-status" id="headingAiStatus"></div>
    </div>

    <div class="cw-phase-panel" id="phase4">
      <div class="cw-phase-title">Confirm headings</div>
      <div class="cw-phase-desc">Review all generated headings. These anchor the body text rewrites. Once confirmed, body rewriting begins.</div>
      <div class="cw-confirm-blocks" id="confirmBlocks"></div>
      <label class="cw-confirm-checkbox-row" id="confirmRow">
        <input type="checkbox" id="confirmHeadingsCheck">
        <span>I confirm these headings are correct</span>
      </label>
    </div>

    <div class="cw-phase-panel" id="phase5">
      <div class="cw-phase-title">Body text rewrite</div>
      <div class="cw-phase-desc">AI rewrites all body text in context of the confirmed heading. Blocks flagged for review need manual attention.</div>
      <div class="cw-spinner-row" id="bodySpinnerRow">
        <div class="cw-spinner"></div>
        <span>Rewriting content...</span>
      </div>
      <div class="cw-body-blocks" id="bodyBlocks"></div>
    </div>

    <div class="cw-phase-panel" id="phase6">
      <div class="cw-phase-title">Inject content</div>
      <div class="cw-phase-desc">All content is ready. SnapStak finds each original text string in your project files and replaces it with new copy.</div>
      <div class="cw-inject-summary" id="injectSummary"></div>
      <div class="cw-inject-warning">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1L15 14H1L8 1Z" stroke="#f59e0b" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 6v4M8 11.5v.5" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/></svg>
        This modifies your project files directly. Ensure you have version control or a backup before proceeding.
      </div>
      <button class="cw-btn cw-btn-inject" id="btnInjectContent">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 8L6 12L14 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Inject into project files
      </button>
      <div class="cw-inject-result" id="injectResult"></div>
    </div>

  </div>

  <div class="cw-footer" id="cwFooter">
    <div class="cw-ai-error" id="aiError"></div>
    <div class="cw-nav-row">
      <button class="cw-btn cw-btn-ghost" id="btnBack" disabled>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Back
      </button>
      <div class="cw-phase-label" id="phaseLabel">Phase 1 of 6</div>
      <button class="cw-btn cw-btn-primary" id="btnNext" disabled>
        Next
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
  </div>

</div>`;
}
// ─────────────────────────────────────────────────────────────
// JS
// ─────────────────────────────────────────────────────────────
function getJs() {
    return `
const vscode = acquireVsCodeApi();

let state = {
  phase: 1, blocks: [], isGroupMode: false, rootLabel: null, basketConfirmed: false,
  businessDescription: '', keywords: [],
  activeBlockIndex: 0, newHeadings: {}, newButtons: {}, newLinks: {},
  newBodyText: {}, confirmedHeadings: false, appliedBlocks: new Set()
};

const btnBack              = document.getElementById('btnBack');
const btnNext              = document.getElementById('btnNext');
const phaseLabel           = document.getElementById('phaseLabel');
const aiError              = document.getElementById('aiError');
const emptyBlocks          = document.getElementById('emptyBlocks');
const blocksList           = document.getElementById('blocksList');
const basketWrap           = document.getElementById('basketWrap');
const basketList           = document.getElementById('basketList');
const basketSummary        = document.getElementById('basketSummary');
const basketConfirmCheck   = document.getElementById('basketConfirmCheck');
const btnClearAll          = document.getElementById('btnClearAll');
const keywordsInput        = document.getElementById('keywordsInput');
const businessDescInput    = document.getElementById('businessDescInput');
const descCharCount        = document.getElementById('descCharCount');
const btnGenerateDesc      = document.getElementById('btnGenerateDesc');
const descAiStatus         = document.getElementById('descAiStatus');
const btnGenerateAllHeadings = document.getElementById('btnGenerateAllHeadings');
const headingBlocks        = document.getElementById('headingBlocks');
const headingAiStatus      = document.getElementById('headingAiStatus');
const confirmBlocks        = document.getElementById('confirmBlocks');
const confirmHeadingsCheck = document.getElementById('confirmHeadingsCheck');
const bodySpinnerRow       = document.getElementById('bodySpinnerRow');
const bodyBlocks           = document.getElementById('bodyBlocks');
const injectSummary        = document.getElementById('injectSummary');
const btnInjectContent     = document.getElementById('btnInjectContent');
const injectResult         = document.getElementById('injectResult');

function countWords(t) { return t.trim().split(/\\s+/).filter(Boolean).length; }
function wcStatus(t, target) { if (!t || !t.trim()) { return 'empty'; } return countWords(t) === target ? 'match' : 'mismatch'; }
function escHtml(s) { if (!s) { return ''; } return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function setError(m) { aiError.textContent = m || ''; }
function setStatus(el, m, isErr) { el.textContent = m; el.className = 'cw-ai-status' + (isErr ? ' error' : ''); }

function deriveBlockStatus(block) {
  if (state.appliedBlocks && state.appliedBlocks.has(block.blockId)) { return 'complete'; }
  const newH = state.newHeadings[block.blockId];
  if (!newH) { return 'untouched'; }
  const hOk = countWords(newH) === block.heading.wordCount;
  const bOk = block.buttons.every((b,i) => { const t = (state.newButtons[block.blockId]||[])[i]; return t && countWords(t) === b.wordCount; });
  const lOk = block.links.every((l,i)   => { const t = (state.newLinks[block.blockId]||[])[i];   return t && countWords(t) === l.wordCount; });
  return (hOk && bOk && lOk) ? 'complete' : 'partial';
}

function canAdvance() {
  switch (state.phase) {
    case 1:
      return state.blocks.length > 0 && state.basketConfirmed;
    case 2: return state.businessDescription.trim().length > 0;
    case 3: return state.blocks.every(b => !!state.newHeadings[b.blockId]);
    case 4: return state.confirmedHeadings;
    case 5: return state.blocks.filter(b => b.bodyText.length > 0).every(b => { const r = state.newBodyText[b.blockId]; return r && r.length === b.bodyText.length; });
    case 6: return true;
    default: return false;
  }
}

function renderPhase() {
  document.querySelectorAll('.cw-phase-panel').forEach((p,i) => p.classList.toggle('active', i+1 === state.phase));
  document.querySelectorAll('.cw-phase-step').forEach(step => {
    const n = parseInt(step.dataset.step);
    step.classList.remove('active','done');
    if (n === state.phase) { step.classList.add('active'); }
    if (n < state.phase)   { step.classList.add('done'); }
  });
  phaseLabel.textContent = 'Phase ' + state.phase + ' of 6';
  btnBack.disabled = state.phase === 1;
  btnNext.disabled = !canAdvance();
  if (state.phase === 6) {
    btnNext.innerHTML = 'Done <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M2 8L6 12L14 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  } else {
    btnNext.innerHTML = 'Next <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  setError('');
}

basketConfirmCheck.addEventListener('change', function() {
  state.basketConfirmed = basketConfirmCheck.checked;
  btnNext.disabled = !canAdvance();
});

btnClearAll.addEventListener('click', function() {
  state.blocks = [];
  state.rootLabel = null;
  state.isGroupMode = false;
  state.basketConfirmed = false;
  basketConfirmCheck.checked = false;
  renderSelectionBasket();
  btnNext.disabled = !canAdvance();
  try { vscode.postMessage({ type: 'clearTracker', contentMode: state.isGroupMode ? 'group' : 'text' }); } catch(e) {}
});

function renderSelectionBasket() {
  if (state.blocks.length === 0) {
    emptyBlocks.style.display = 'flex';
    basketWrap.style.display  = 'none';
    return;
  }
  emptyBlocks.style.display = 'none';
  basketWrap.style.display  = 'block';
  basketList.innerHTML = '';

  if (state.isGroupMode) {
    // Group mode — ROOT card with removable children
    var totalHidden = state.blocks.reduce(function(acc, gb) { return acc + (gb.bodyText ? gb.bodyText.length : 0); }, 0);
    basketSummary.textContent = state.blocks.length + ' block' + (state.blocks.length === 1 ? '' : 's') + ' \u00b7 ' + totalHidden + ' hidden nodes';

    var rootDiv = document.createElement('div');
    rootDiv.className = 'cw-basket-group-root';
    var rootHdr = document.createElement('div');
    rootHdr.className = 'cw-basket-group-header';
    rootHdr.innerHTML =
      '<span class="cw-basket-item-tag group">ROOT</span>' +
      '<span class="cw-basket-group-label">' + escHtml((state.rootLabel && state.rootLabel.text) || '') + '</span>' +
      '<span class="cw-basket-item-badge">' + state.blocks.length + ' children</span>';
    rootDiv.appendChild(rootHdr);

    var childrenDiv = document.createElement('div');
    childrenDiv.className = 'cw-basket-group-children';

    state.blocks.forEach(function(gb, idx) {
      var childDiv = document.createElement('div');
      childDiv.className = 'cw-basket-group-child';
      var hiddenCount = gb.bodyText ? gb.bodyText.length : 0;
      childDiv.innerHTML =
        '<span class="cw-basket-item-tag">' + escHtml((gb.heading && gb.heading.tag) || 'DIV') + '</span>' +
        '<span class="cw-basket-item-text">' + escHtml((gb.heading && gb.heading.text) || '') + '</span>' +
        (hiddenCount > 0 ? '<span class="cw-basket-item-badge">' + hiddenCount + ' hidden</span>' : '') +
        '<button class="cw-basket-remove" title="Remove">\u00d7</button>';
      childDiv.querySelector('.cw-basket-remove').addEventListener('click', function() {
        state.blocks.splice(idx, 1);
        state.basketConfirmed = false;
        basketConfirmCheck.checked = false;
        renderSelectionBasket();
        btnNext.disabled = !canAdvance();
      });
      childrenDiv.appendChild(childDiv);
    });

    rootDiv.appendChild(childrenDiv);
    basketList.appendChild(rootDiv);

  } else {
    // Single/multiple mode — flat list
    basketSummary.textContent = state.blocks.length + ' block' + (state.blocks.length === 1 ? '' : 's') + ' selected';
    state.blocks.forEach(function(block, idx) {
      var item = document.createElement('div');
      item.className = 'cw-basket-item';
      item.innerHTML =
        '<span class="cw-basket-item-tag">' + escHtml(block.heading ? block.heading.tag : '') + '</span>' +
        '<span class="cw-basket-item-text">' + escHtml(block.heading ? block.heading.text : '') + '</span>' +
        '<span class="cw-basket-item-badge">' + (block.heading ? block.heading.wordCount + 'w' : '') + '</span>' +
        '<button class="cw-basket-remove" title="Remove">\u00d7</button>';
      item.querySelector('.cw-basket-remove').addEventListener('click', function() {
        state.blocks.splice(idx, 1);
        state.basketConfirmed = false;
        basketConfirmCheck.checked = false;
        renderSelectionBasket();
        btnNext.disabled = !canAdvance();
      });
      basketList.appendChild(item);
    });
  }
}

function renderBlocksPreview() {
  blocksList.innerHTML = '';
  if (state.blocks.length === 0) { return; }

  if (state.isGroupMode) {
    renderGroupBlocksPreview();
    return;
  }

  // Build wrapper with header + rows
  const wrap = document.createElement('div');
  wrap.className = 'cw-compare-wrap';

  // Header
  const header = document.createElement('div');
  header.className = 'cw-compare-header';
  header.innerHTML =
    '<div class="cw-compare-header-cell">Original</div>' +
    '<div class="cw-compare-header-cell">Rewrite</div>';
  wrap.appendChild(header);

  // Rows
  const rows = document.createElement('div');
  rows.className = 'cw-compare-rows';

  state.blocks.forEach(function(block) {
    const rewrite = state.newHeadings[block.blockId] || '';
    const applied = state.appliedBlocks && state.appliedBlocks.has(block.blockId);

    const row = document.createElement('div');
    row.className = 'cw-compare-row';
    row.dataset.blockId = block.blockId;

    // Left column — original
    // For group blocks: show label tier (if present) + heading + body chip
    const left = document.createElement('div');
    left.className = 'cw-col-original';
    const labelHtml = (block.label && block.label.text)
      ? '<div class="cw-col-label">' + escHtml(block.label.text) + (block.label.isHidden ? '<span class="cw-col-hidden-badge">hidden</span>' : '') + '</div>'
      : '';
    const headingTag  = block.heading ? block.heading.tag  : '';
    const headingText = block.heading ? block.heading.text : '';
    const bodyCount   = block.bodyText ? block.bodyText.length : 0;
    const bodyChipHtml = (block.isGroup && bodyCount > 0)
      ? '<div class="cw-col-body-chip">' + bodyCount + ' body paragraph' + (bodyCount === 1 ? '' : 's') + '</div>'
      : '';
    left.innerHTML =
      labelHtml +
      '<span class="cw-col-tag">' + headingTag + '</span>' +
      '<div class="cw-col-text">' + escHtml(headingText) + '</div>' +
      bodyChipHtml;

    // Right column — rewrite
    // For group blocks: dot is green only when heading AND all body paragraphs applied.
    const bodyApplied = (block.isGroup && bodyCount > 0)
      ? !!(state.newBodyText && state.newBodyText[block.blockId] && state.newBodyText[block.blockId].length === bodyCount)
      : true;
    const fullyApplied = applied && bodyApplied;
    const bodyPreview  = (block.isGroup && bodyCount > 0 && state.newBodyText && state.newBodyText[block.blockId] && state.newBodyText[block.blockId].length > 0)
      ? '<div class="cw-col-body-chip applied-chip">✓ ' + state.newBodyText[block.blockId].length + ' body paragraph' + (state.newBodyText[block.blockId].length === 1 ? '' : 's') + ' applied</div>'
      : (block.isGroup && bodyCount > 0 ? '<div class="cw-col-body-chip">' + bodyCount + ' body paragraph' + (bodyCount === 1 ? '' : 's') + ' pending</div>' : '');
    const right = document.createElement('div');
    right.className = 'cw-col-rewrite' + (applied ? ' applied' : '');
    right.innerHTML =
      '<div class="cw-col-status' + (fullyApplied ? ' complete' : '') + '"></div>' +
      '<div class="cw-col-text' + (applied ? '' : ' empty') + '">' +
        (applied ? escHtml(rewrite) : 'Not yet rewritten') +
      '</div>' +
      (applied ? bodyPreview : '') +
      '<button class="cw-col-clear" title="Clear rewrite">✕</button>';

    // Clear button
    right.querySelector('.cw-col-clear').addEventListener('click', function(e) {
      e.stopPropagation();
      delete state.newHeadings[block.blockId];
      if (state.appliedBlocks) { state.appliedBlocks.delete(block.blockId); }
      renderBlocksPreview();
      btnNext.disabled = !canAdvance();
    });

    // Row click — select and send to sidebar
    row.addEventListener('click', function() {
      rows.querySelectorAll('.cw-compare-row').forEach(function(r){ r.classList.remove('selected'); });
      row.classList.add('selected');
      vscode.postMessage({ type: 'SHOW_BLOCK_PROPERTIES', block: block, businessDescription: state.businessDescription });
    });

    row.appendChild(left);
    row.appendChild(right);
    rows.appendChild(row);
  });

  wrap.appendChild(rows);
  blocksList.appendChild(wrap);
  btnNext.disabled = !canAdvance();
}

function renderGroupBlocksPreview() {
  var totalChildren = state.blocks.length;
  var totalHidden = state.blocks.reduce(function(acc, gb) { return acc + (gb.bodyText ? gb.bodyText.length : 0); }, 0);

  var root = document.createElement('div');
  root.className = 'cw-group-root';

  var rootText = (state.rootLabel && state.rootLabel.text)
    ? state.rootLabel.text
    : (state.blocks[0] && state.blocks[0].heading) ? state.blocks[0].heading.text : '';
  var hdr = document.createElement('div');
  hdr.className = 'cw-group-root-header';
  hdr.style.cursor = 'pointer';
  hdr.innerHTML =
    '<span class="cw-group-root-tag">ROOT</span>' +
    '<span class="cw-group-root-name">' + escHtml(rootText) + '</span>' +
    '<span class="cw-group-root-meta">' + totalChildren + ' children \u00b7 ' + totalHidden + ' hidden nodes</span>';

  // Click root header → load rootLabel into tab editor
  if (state.rootLabel && state.rootLabel.text) {
    hdr.addEventListener('click', function() {
      var rootBlock = {
        blockId: 'root_label',
        isGroup: false,
        label: null,
        heading: {
          tag: state.rootLabel.tag || 'H3',
          text: state.rootLabel.text,
          wordCount: (state.rootLabel.text.match(/ /g) || []).length + 1,
          outerHTML: '',
          typography: state.rootLabel.typography || {},
          isHidden: false
        },
        bodyText: [],
        buttons: [],
        links: []
      };
      vscode.postMessage({ type: 'SHOW_BLOCK_PROPERTIES', block: rootBlock, businessDescription: state.businessDescription });
    });
  }
  root.appendChild(hdr);

  var list = document.createElement('div');
  list.className = 'cw-group-child-list';

  var colLabels = document.createElement('div');
  colLabels.className = 'cw-group-col-labels';
  colLabels.innerHTML = '<span class="cw-group-col-label">Original</span><span class="cw-group-col-label">Rewrite</span>';
  list.appendChild(colLabels);

  state.blocks.forEach(function(gb, idx) {
    var childId = 'cwgc-' + idx;
    var parentNode = gb.heading || {};
    var children = gb.bodyText || [];
    var rewrite = state.newHeadings[gb.blockId] || '';
    var applied = !!(rewrite);

    var card = document.createElement('div');
    card.className = 'cw-group-child';
    card.id = childId;

    var childHdr = document.createElement('div');
    childHdr.className = 'cw-group-child-header';
    childHdr.style.cursor = 'pointer';

    // Click on child row → load block in tab
    childHdr.addEventListener('click', function(e) {
      if (e.target && e.target.classList && e.target.classList.contains('cw-group-expand-btn')) { return; }
      rows.querySelectorAll && rows.querySelectorAll('.cw-group-child-header').forEach(function(h) { h.classList.remove('cw-group-selected'); });
      childHdr.classList.add('cw-group-selected');
      vscode.postMessage({ type: 'SHOW_BLOCK_PROPERTIES', block: gb, businessDescription: state.businessDescription });
    });

    var origCol = document.createElement('div');
    origCol.className = 'cw-group-child-orig';
    origCol.innerHTML =
      '<span class="cw-group-child-tag">' + escHtml(parentNode.tag || 'DIV') + '</span>' +
      '<span class="cw-group-child-name">' + escHtml(parentNode.text || '') + '</span>';

    if (children.length > 0) {
      var expandBtn = document.createElement('button');
      expandBtn.className = 'cw-group-expand-btn';
      expandBtn.textContent = idx === 0 ? '\u25b2 collapse' : '\u25bc expand';
      (function(c, b) {
        b.addEventListener('click', function(e) {
          e.stopPropagation();
          var isOpen = c.classList.toggle('open');
          b.textContent = isOpen ? '\u25b2 collapse' : '\u25bc expand';
        });
      })(card, expandBtn);
      origCol.appendChild(expandBtn);
    }

    var rewriteCol = document.createElement('div');
    rewriteCol.className = 'cw-group-child-rewrite';
    rewriteCol.innerHTML =
      '<span class="cw-group-rewrite-ph">' + (applied ? escHtml(rewrite) : 'Not yet rewritten') + '</span>' +
      '<span class="cw-group-status-dot' + (applied ? ' done' : '') + '"></span>';

    childHdr.appendChild(origCol);
    childHdr.appendChild(rewriteCol);
    card.appendChild(childHdr);

    if (children.length > 0) {
      var hiddenSec = document.createElement('div');
      hiddenSec.className = 'cw-group-hidden-section';
      var countLabel = document.createElement('div');
      countLabel.className = 'cw-group-hidden-count';
      countLabel.textContent = children.length + ' hidden node' + (children.length === 1 ? '' : 's');
      hiddenSec.appendChild(countLabel);

      children.forEach(function(child, ci) {
        var nodeRow = document.createElement('div');
        nodeRow.className = 'cw-group-hidden-node';
        nodeRow.style.cursor = 'pointer';
        nodeRow.innerHTML =
          '<div class="cw-group-hn-orig">' +
            '<span class="cw-group-hidden-badge">HIDDEN</span>' +
            '<span class="cw-group-hn-text">' + escHtml(child.text || '') + '</span>' +
            '<span class="cw-group-hn-wc">' + (child.wordCount || 0) + ' wd</span>' +
          '</div>' +
          '<div class="cw-group-hn-rewrite">' +
            '<span class="cw-group-hn-ph">Not yet rewritten</span>' +
            '<span class="cw-group-status-dot"></span>' +
          '</div>';

        // Click on hidden node → load a synthetic block for the tab
        nodeRow.addEventListener('click', (function(ch, parentGb) {
          return function() {
            var syntheticBlock = {
              blockId: parentGb.blockId + '_child_' + ci,
              isGroup: false,
              label: null,
              heading: {
                tag: ch.tag || 'BUTTON',
                text: ch.text || '',
                wordCount: ch.wordCount || 0,
                outerHTML: ch.outerHTML || '',
                typography: ch.typography || {},
                isHidden: true
              },
              bodyText: [],
              buttons: [],
              links: []
            };
            vscode.postMessage({ type: 'SHOW_BLOCK_PROPERTIES', block: syntheticBlock, businessDescription: state.businessDescription });
          };
        })(child, gb));

        hiddenSec.appendChild(nodeRow);
      });

      card.appendChild(hiddenSec);
      if (idx === 0) { card.classList.add('open'); }
    }

    list.appendChild(card);
  });

  // Need rows ref for selected state clearing — use list
  var rows = list;

  root.appendChild(list);
  blocksList.appendChild(root);
  btnNext.disabled = !canAdvance();
}

function renderHeadingBlocks() {
  headingBlocks.innerHTML = '';
  state.blocks.forEach(block => {
    const card = document.createElement('div');
    card.className = 'cw-heading-card';
    card.dataset.blockId = block.blockId;
    const newH = state.newHeadings[block.blockId] || '';
    const wcs = wcStatus(newH, block.heading.wordCount);
    let nodesHtml = '';
    if (block.buttons.length > 0 || block.links.length > 0) {
      const rows = [
        ...block.buttons.map((b,i) => {
          const val = (state.newButtons[block.blockId]||[])[i] || '';
          const ws = wcStatus(val, b.wordCount);
          return '<div class="cw-node-row"><span class="cw-node-type">Button</span><input class="cw-node-input" data-node-type="button" data-block="' + block.blockId + '" data-idx="' + i + '" placeholder="' + escHtml(b.text) + ' (' + b.wordCount + 'w)" value="' + escHtml(val) + '"><span class="cw-wc-badge ' + ws + '">' + (val ? countWords(val)+'/'+b.wordCount : b.wordCount+'w') + '</span></div>';
        }),
        ...block.links.map((l,i) => {
          const val = (state.newLinks[block.blockId]||[])[i] || '';
          const ws = wcStatus(val, l.wordCount);
          return '<div class="cw-node-row"><span class="cw-node-type">Link</span><input class="cw-node-input" data-node-type="link" data-block="' + block.blockId + '" data-idx="' + i + '" placeholder="' + escHtml(l.text) + ' (' + l.wordCount + 'w)" value="' + escHtml(val) + '"><span class="cw-wc-badge ' + ws + '">' + (val ? countWords(val)+'/'+l.wordCount : l.wordCount+'w') + '</span></div>';
        })
      ].join('');
      nodesHtml = '<div class="cw-node-list">' + rows + '</div>';
    }
    card.innerHTML =
      '<div class="cw-heading-card-top">' +
        '<span class="cw-block-tag">' + block.heading.tag + '</span>' +
        '<span class="cw-heading-original">' + escHtml(block.heading.text) + '</span>' +
        '<button class="cw-btn cw-btn-secondary cw-btn-sm heading-gen-btn" data-block="' + block.blockId + '"><span class="btn-label">✦ Generate</span></button>' +
      '</div>' +
      '<div class="cw-heading-input-row">' +
        '<input class="cw-heading-input" data-block="' + block.blockId + '" placeholder="New heading (' + block.heading.wordCount + ' words)" value="' + escHtml(newH) + '">' +
        '<span class="cw-wc-badge ' + wcs + '">' + (newH ? countWords(newH)+'/'+block.heading.wordCount : block.heading.wordCount+'w') + '</span>' +
      '</div>' + nodesHtml;
    headingBlocks.appendChild(card);
  });

  headingBlocks.querySelectorAll('.cw-heading-input').forEach(input => {
    input.addEventListener('input', function(e) {
      const blockId = e.target.dataset.block;
      state.newHeadings[blockId] = e.target.value;
      const block = state.blocks.find(b => b.blockId === blockId);
      const badge = e.target.nextElementSibling;
      const wcs = wcStatus(e.target.value, block.heading.wordCount);
      badge.className = 'cw-wc-badge ' + wcs;
      badge.textContent = e.target.value ? countWords(e.target.value)+'/'+block.heading.wordCount : block.heading.wordCount+'w';
      btnNext.disabled = !canAdvance();
    });
  });

  headingBlocks.querySelectorAll('.cw-node-input').forEach(input => {
    input.addEventListener('input', function(e) {
      const nodeType = e.target.dataset.nodeType;
      const blockId  = e.target.dataset.block;
      const i = parseInt(e.target.dataset.idx);
      const mapKey = nodeType === 'button' ? 'newButtons' : 'newLinks';
      if (!state[mapKey][blockId]) { state[mapKey][blockId] = []; }
      state[mapKey][blockId][i] = e.target.value;
      const blockDef = state.blocks.find(b => b.blockId === blockId);
      const arr = nodeType === 'button' ? blockDef.buttons : blockDef.links;
      const target = arr[i].wordCount;
      const badge = e.target.nextElementSibling;
      const wcs = wcStatus(e.target.value, target);
      badge.className = 'cw-wc-badge ' + wcs;
      badge.textContent = e.target.value ? countWords(e.target.value)+'/'+target : target+'w';
      btnNext.disabled = !canAdvance();
    });
  });

  headingBlocks.querySelectorAll('.heading-gen-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const blockId = btn.dataset.block;
      const block = state.blocks.find(b => b.blockId === blockId);
      btn.querySelector('.btn-label').innerHTML = '<span class="cw-spinner-inline"></span>';
      btn.disabled = true;
      setStatus(headingAiStatus, 'Generating heading...', false);
      vscode.postMessage({ type: 'GENERATE_HEADING', blockId, originalHeading: block.heading.text, headingTag: block.heading.tag, wordCount: block.heading.wordCount, businessDescription: state.businessDescription });
    });
  });
}

function renderConfirmBlocks() {
  confirmBlocks.innerHTML = '';
  state.blocks.forEach(block => {
    const card = document.createElement('div');
    card.className = 'cw-confirm-card';
    card.innerHTML = '<div class="cw-confirm-original">' + escHtml(block.heading.text) + '</div><div class="cw-confirm-arrow">→</div><div class="cw-confirm-new">' + escHtml(state.newHeadings[block.blockId] || '') + '</div>';
    confirmBlocks.appendChild(card);
  });
  confirmHeadingsCheck.checked = state.confirmedHeadings;
  btnNext.disabled = !canAdvance();
}

function renderBodyBlocks() {
  bodyBlocks.innerHTML = '';
  const hasBody = state.blocks.some(b => b.bodyText.length > 0);
  if (!hasBody) {
    bodyBlocks.innerHTML = '<div style="padding:20px;text-align:center;color:var(--fg-muted);font-size:12px">No body text blocks to rewrite.</div>';
    btnNext.disabled = !canAdvance();
    return;
  }
  state.blocks.filter(b => b.bodyText.length > 0).forEach(block => {
    const rewrites = state.newBodyText[block.blockId] || [];
    const hasReview = rewrites.some(r => r.needsReview);
    const card = document.createElement('div');
    card.className = 'cw-body-card' + (hasReview ? ' needs-review' : '');
    let nodesHtml = '';
    block.bodyText.forEach((node, i) => {
      const rewrite = rewrites[i];
      if (!rewrite) {
        nodesHtml += '<div class="cw-body-node"><div class="cw-body-node-label">' + node.tag.toLowerCase() + ' · ' + node.wordCount + 'w target</div><div class="cw-body-text-display" style="opacity:.4;font-style:italic">Pending...</div></div>';
      } else {
        nodesHtml += '<div class="cw-body-node"><div class="cw-body-node-label">' + node.tag.toLowerCase() + ' · ' + rewrite.wordCount + '/' + node.wordCount + 'w ' + (rewrite.needsReview ? '⚠ review' : '✓') + '</div><div class="cw-body-text-display' + (rewrite.needsReview ? ' review' : '') + '">' + escHtml(rewrite.text) + '</div>' + (rewrite.needsReview ? '<div class="cw-body-node-actions"><button class="cw-btn cw-btn-secondary cw-btn-sm" data-retry-block="' + block.blockId + '" data-retry-idx="' + i + '">↺ Retry</button></div>' : '') + '</div>';
      }
    });
    card.innerHTML =
      '<div class="cw-body-card-header"><span class="cw-block-tag">' + block.heading.tag + '</span><span style="font-size:12px;font-weight:600;color:var(--fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1">' + escHtml(state.newHeadings[block.blockId] || block.heading.text) + '</span>' + (hasReview ? '<span class="cw-review-badge">Review</span>' : '') + '</div>' + nodesHtml;
    bodyBlocks.appendChild(card);
  });
  bodyBlocks.querySelectorAll('[data-retry-block]').forEach(btn => {
    btn.addEventListener('click', function() {
      const blockId = btn.dataset.retryBlock;
      const idx = parseInt(btn.dataset.retryIdx);
      const block = state.blocks.find(b => b.blockId === blockId);
      const node = block.bodyText[idx];
      const existing = (state.newBodyText[blockId]||[])[idx];
      btn.disabled = true; btn.textContent = '...';
      vscode.postMessage({ type: 'REWRITE_BODY_SINGLE', blockId, nodeIndex: idx, confirmedHeading: state.newHeadings[blockId], originalText: node.text, wordCountTarget: node.wordCount, businessDescription: state.businessDescription, retryContext: existing ? 'Previous attempt was ' + existing.wordCount + ' words, target is ' + node.wordCount + ' words.' : undefined });
    });
  });
  btnNext.disabled = !canAdvance();
}

function renderInjectSummary() {
  let h=0,b=0,bt=0,l=0;
  state.blocks.forEach(block => {
    if (state.newHeadings[block.blockId]) { h++; }
    b  += (state.newBodyText[block.blockId]||[]).filter(r => !r.needsReview).length;
    bt += (state.newButtons[block.blockId]||[]).filter(Boolean).length;
    l  += (state.newLinks[block.blockId]||[]).filter(Boolean).length;
  });
  injectSummary.innerHTML =
    '<div class="cw-inject-stat"><span>Headings</span><strong>' + h + '</strong></div>' +
    '<div class="cw-inject-stat"><span>Body text nodes</span><strong>' + b + '</strong></div>' +
    '<div class="cw-inject-stat"><span>Buttons</span><strong>' + bt + '</strong></div>' +
    '<div class="cw-inject-stat"><span>Links</span><strong>' + l + '</strong></div>' +
    '<div class="cw-inject-stat"><span>Total replacements</span><strong>' + (h+b+bt+l) + '</strong></div>';
}

function goToPhase(n) {
  state.phase = n; setError(''); renderPhase();
  if (n===1) { renderSelectionBasket(); }
  if (n===3) { renderBlocksPreview(); }
  if (n===4) { renderConfirmBlocks(); }
  if (n===5) { startBodyRewrite(); }
  if (n===6) { renderInjectSummary(); }
}

function startBodyRewrite() {
  bodySpinnerRow.classList.remove('hidden');
  bodyBlocks.innerHTML = '';
  btnNext.disabled = true;
  vscode.postMessage({ type: 'REWRITE_BODY_BATCH', blocks: state.blocks, confirmedHeadings: state.newHeadings, businessDescription: state.businessDescription });
}

btnNext.addEventListener('click', function() {
  if (!canAdvance()) { return; }
  if (state.phase < 6) {
    goToPhase(state.phase + 1);
  } else {
    // Phase 6 — Done: close the copywriter panel
    vscode.postMessage({ type: 'CLOSE_COPYWRITER' });
  }
});
btnBack.addEventListener('click', function() { if (state.phase > 1) { goToPhase(state.phase - 1); } });


businessDescInput.addEventListener('input', function() {
  state.businessDescription = businessDescInput.value;
  const wc = countWords(state.businessDescription);
  descCharCount.textContent = wc + ' word' + (wc === 1 ? '' : 's');
  btnNext.disabled = !canAdvance();
});

keywordsInput.addEventListener('input', function() {
  btnGenerateDesc.disabled = !keywordsInput.value.trim();
});

btnGenerateDesc.addEventListener('click', function() {
  const raw = keywordsInput.value.trim();
  if (!raw) { setStatus(descAiStatus, 'Enter at least one keyword first.', true); return; }
  state.keywords = raw.split(',').map(k => k.trim()).filter(Boolean);
  businessDescInput.value = '';
  state.businessDescription = '';
  descCharCount.textContent = '0 words';
  btnNext.disabled = !canAdvance();
  btnGenerateDesc.disabled = true;
  btnGenerateDesc._orig = btnGenerateDesc.innerHTML;
  btnGenerateDesc.innerHTML = '<span class="cw-spinner-inline"></span> Generating...';
  vscode.postMessage({ type: 'GENERATE_DESCRIPTION', keywords: state.keywords });
});

btnGenerateAllHeadings.addEventListener('click', function() {
  if (!state.businessDescription.trim()) { setStatus(headingAiStatus, 'Business description required. Go back to Phase 2.', true); return; }
  btnGenerateAllHeadings.disabled = true;
  btnGenerateAllHeadings.innerHTML = '<span class="cw-spinner-inline"></span> Generating all...';
  setStatus(headingAiStatus, 'Generating headings...', false);
  vscode.postMessage({ type: 'GENERATE_ALL_HEADINGS', blocks: state.blocks, businessDescription: state.businessDescription });
});

confirmHeadingsCheck.addEventListener('change', function() {
  state.confirmedHeadings = confirmHeadingsCheck.checked;
  btnNext.disabled = !canAdvance();
});

btnInjectContent.addEventListener('click', function() {
  btnInjectContent.disabled = true;
  btnInjectContent.innerHTML = '<span class="cw-spinner-inline"></span> Injecting...';
  injectResult.classList.remove('visible');
  vscode.postMessage({ type: 'INJECT_CONTENT', blocks: state.blocks, state: { newHeadings: state.newHeadings, newButtons: state.newButtons, newLinks: state.newLinks, newBodyText: state.newBodyText } });
});

const STAR_SVG = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

window.addEventListener('message', function(event) {
  const msg = event.data;
  switch (msg.type) {

    case 'SS_TRACKER_READY': {
      const el = document.getElementById('emptyBlocks');
      if (el) {
        el.innerHTML = '<div style="color:#38BDF8;font-size:12px;font-weight:600;text-align:center;padding:20px">✓ Page Tracker is active. Click elements to select them.</div>';
      }
      break;
    }

    case 'LOAD_BLOCKS':
      state.blocks = msg.blocks || [];
      state.isGroupMode = !!(msg.isGroupMode);
      state.rootLabel = msg.rootLabel || null;
      state.basketConfirmed = false;
      state.phase = 1;
      if (basketConfirmCheck) { basketConfirmCheck.checked = false; }
      renderPhase();
      renderSelectionBasket();
      btnNext.disabled = !canAdvance();
      break;

    case 'APPLY_BLOCK_REWRITE':
      if (msg.blockId && msg.text) {
        state.newHeadings[msg.blockId] = msg.text;
        state.appliedBlocks.add(msg.blockId);
        renderBlocksPreview();
        // Re-select the row
        const row = blocksList.querySelector('[data-block-id="' + msg.blockId + '"]');
        if (row) { row.classList.add('selected'); }
        btnNext.disabled = !canAdvance();
      }
      break;

    case 'DESCRIPTION_GENERATED':
      businessDescInput.value = msg.description || '';
      state.businessDescription = businessDescInput.value;
      const wc2 = countWords(state.businessDescription);
      descCharCount.textContent = wc2 + ' word' + (wc2===1?'':'s');
      setStatus(descAiStatus, 'Description generated.', false);
      btnGenerateDesc.disabled = !keywordsInput.value.trim();
      if (btnGenerateDesc._orig) { btnGenerateDesc.innerHTML = btnGenerateDesc._orig; }
      btnNext.disabled = !canAdvance();
      break;

    case 'HEADING_GENERATED': {
      const { blockId, heading } = msg;
      state.newHeadings[blockId] = heading;
      const inp = headingBlocks.querySelector('.cw-heading-input[data-block="' + blockId + '"]');
      if (inp) {
        inp.value = heading;
        const block = state.blocks.find(b => b.blockId === blockId);
        const badge = inp.nextElementSibling;
        badge.className = 'cw-wc-badge ' + wcStatus(heading, block.heading.wordCount);
        badge.textContent = countWords(heading) + '/' + block.heading.wordCount;
      }
      const genBtn = headingBlocks.querySelector('.heading-gen-btn[data-block="' + blockId + '"]');
      if (genBtn) { genBtn.querySelector('.btn-label').textContent = '✦ Generate'; genBtn.disabled = false; }
      setStatus(headingAiStatus, 'Heading generated.', false);
      btnNext.disabled = !canAdvance();
      break;
    }

    case 'ALL_HEADINGS_GENERATED': {
      const headings = msg.headings || {};
      Object.assign(state.newHeadings, headings);
      btnGenerateAllHeadings.disabled = false;
      btnGenerateAllHeadings.innerHTML = STAR_SVG + ' Generate all headings';
      setStatus(headingAiStatus, 'Generated ' + Object.keys(headings).length + ' heading' + (Object.keys(headings).length!==1?'s':'') + '.', false);
      renderBlocksPreview();
      btnNext.disabled = !canAdvance();
      break;
    }

    case 'BODY_REWRITE_COMPLETE':
      Object.assign(state.newBodyText, msg.results || {});
      bodySpinnerRow.classList.add('hidden');
      renderBodyBlocks();
      break;

    case 'SINGLE_BODY_REWRITE_COMPLETE':
      if (!state.newBodyText[msg.blockId]) { state.newBodyText[msg.blockId] = []; }
      state.newBodyText[msg.blockId][msg.nodeIndex] = msg.result;
      renderBodyBlocks();
      break;

    case 'INJECTION_COMPLETE':
      btnInjectContent.disabled = false;
      btnInjectContent.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 8L6 12L14 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Inject into project files';
      injectResult.textContent = '✓ Content injected successfully into project files.';
      injectResult.classList.add('visible');
      break;

    case 'AI_ERROR':
      setError(msg.message || 'An error occurred.');
      btnGenerateDesc.disabled = !keywordsInput.value.trim();
      if (btnGenerateDesc._orig) { btnGenerateDesc.innerHTML = btnGenerateDesc._orig; }
      btnGenerateAllHeadings.disabled = false;
      btnGenerateAllHeadings.innerHTML = STAR_SVG + ' Generate all headings';
      bodySpinnerRow.classList.add('hidden');
      btnInjectContent.disabled = false;
      btnInjectContent.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 8L6 12L14 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Inject into project files';
      document.querySelectorAll('.heading-gen-btn').forEach(function(b) {
        b.disabled = false;
        const lbl = b.querySelector('.btn-label');
        if (lbl) { lbl.textContent = '✦ Generate'; }
      });
      break;
  }
});

renderPhase();
`;
}
//# sourceMappingURL=copywriterPanel.js.map