"use strict";
/**
 * SnapStak Database Canvas Panel
 * Opens as a full editor panel (vscode.window.createWebviewPanel)
 * when the user clicks the Database tab in the sidebar.
 * Drag-and-drop schema builder: Database / Table / Enum.
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
exports.setSidebarView = setSidebarView;
exports.setProjectRootCallback = setProjectRootCallback;
exports.setRefreshWorkspacesCallback = setRefreshWorkspacesCallback;
exports.openSchemaFile = openSchemaFile;
exports.openDatabaseCanvasPanel = openDatabaseCanvasPanel;
const vscode = __importStar(require("vscode"));
let _panel;
let _sidebarView;
let _getProjectRoot;
let _refreshWorkspaces;
function setSidebarView(view) {
    _sidebarView = view;
}
function setProjectRootCallback(fn) {
    _getProjectRoot = fn;
}
function setRefreshWorkspacesCallback(fn) {
    _refreshWorkspaces = fn;
}
function pushSchemaToSidebar(state) {
    _sidebarView?.webview.postMessage({ command: 'setSchemaState', state });
}
// ─── DB Script Panel ────────────────────────────────────────────────────────
// Opens a new webview showing the AI-generated database script.
// Calls the SnapStak server POST /api/stak/export with action=database + parameter=dbType.
// ─────────────────────────────────────────────────────────────────────────────
async function openDbScriptPanel(context, dbType, schema, stakCommand) {
    const API_URL = vscode.workspace.getConfiguration('snapstak').get('serverUrl') || 'http://localhost:3001';
    const uid = await context.secrets.get('snapstak.userId') ?? '';
    const wsName = await context.secrets.get('snapstak.workspaceName') ?? '';
    // ── Show loading panel immediately ──────────────────────────────────────────
    const panel = vscode.window.createWebviewPanel('snapstakDbScript', `${dbType} Script`, vscode.ViewColumn.One, { enableScripts: true, retainContextWhenHidden: true });
    panel.webview.html = getDbScriptLoadingHtml(dbType);
    // ── Guard: uid + workspaceName must be set in VS Code settings ──────────────
    if (!uid || !wsName) {
        const missingUid = !uid ? 'User ID (not signed in)' : '';
        const missingWs = !wsName ? 'Workspace (no workspace selected)' : '';
        const missing = [missingUid, missingWs].filter(Boolean).join(' and ');
        panel.webview.html = getDbScriptErrorHtml(dbType, `Cannot export: ${missing}. Please sign in to SnapStak and select a workspace.`);
        vscode.window.showErrorMessage(`SnapStak: ${missing}. Sign in and select a workspace before exporting.`);
        return;
    }
    // ── Call server ─────────────────────────────────────────────────────────────
    try {
        const response = await fetch(`${API_URL}/api/stak/export`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'database',
                parameter: dbType, // database type: MySQL, PostgreSQL, etc.
                schemas: schema,
                uid: uid, // from snapstak.uid VS Code setting
                workspaceName: wsName // from snapstak.workspaceName VS Code setting
            })
        });
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        const result = await response.json();
        // Server returns: { success, generatedScript, fileInfo, ... }
        const script = result.generatedScript || result.script || result.content || result.data || '';
        if (!script) {
            throw new Error(result.error || 'Server returned an empty script.');
        }
        // ── Render script in panel ───────────────────────────────────────────────
        panel.webview.html = getDbScriptHtml(dbType, script, result);
        // ── Auto-save script to <project>/schema/<fileName> ──────────────────────
        try {
            const projectRoot = _getProjectRoot?.() ||
                (vscode.workspace.workspaceFolders?.[0]?.uri.fsPath);
            if (projectRoot) {
                const fileName = result.fileInfo?.fileName || `schema.${dbType.toLowerCase()}.sql`;
                const schemaDir = vscode.Uri.joinPath(vscode.Uri.file(projectRoot), 'schema');
                try {
                    await vscode.workspace.fs.createDirectory(schemaDir);
                }
                catch { }
                const saveUri = vscode.Uri.joinPath(schemaDir, fileName);
                await vscode.workspace.fs.writeFile(saveUri, Buffer.from(script, 'utf8'));
                _refreshWorkspaces?.();
                vscode.window.showInformationMessage(`SnapStak: ${fileName} saved to ${saveUri.fsPath}`);
            }
        }
        catch (saveErr) {
            console.warn(`[SnapStak] Auto-save failed: ${saveErr.message}`);
        }
    }
    catch (err) {
        panel.webview.html = getDbScriptErrorHtml(dbType, err.message);
        vscode.window.showErrorMessage(`SnapStak: Failed to generate ${dbType} script — ${err.message}`);
    }
}
// ─── Loading HTML ────────────────────────────────────────────────────────────
function getDbScriptLoadingHtml(dbType) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    body{margin:0;background:#0d1117;color:#c9d1d9;font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:16px}
    .spinner{width:40px;height:40px;border:3px solid #333;border-top-color:#38BDF8;border-radius:50%;animation:spin 0.8s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    p{color:#8b949e;font-size:14px}
  </style></head><body>
  <div class="spinner"></div>
  <p>Generating <strong style="color:#38BDF8">${dbType}</strong> database script...</p>
  </body></html>`;
}
// ─── Error HTML ───────────────────────────────────────────────────────────────
function getDbScriptErrorHtml(dbType, errorMsg) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    body{margin:0;background:#0d1117;color:#c9d1d9;font-family:'Segoe UI',sans-serif;padding:32px}
    .err{background:#1a0a0a;border:1px solid #5a1a1a;border-radius:8px;padding:20px;color:#f85149;font-size:13px}
    h2{color:#f85149;margin:0 0 12px}
  </style></head><body>
  <h2>❌ Failed to generate ${dbType} script</h2>
  <div class="err">${errorMsg.replace(/</g, '&lt;')}</div>
  </body></html>`;
}
// ─── Script Panel HTML ────────────────────────────────────────────────────────
function getDbScriptHtml(dbType, script, meta) {
    const escaped = script
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    const fileName = meta.fileName || `schema.${dbType.toLowerCase()}.sql`;
    const fileExt = meta.fileExtension || 'sql';
    const savedPath = meta.relativePath || '';
    const lineCount = script.split('\n').length;
    const charCount = script.length;
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    *{box-sizing:border-box}
    body{margin:0;background:#0d1117;color:#c9d1d9;font-family:'Segoe UI',Consolas,monospace;display:flex;flex-direction:column;height:100vh;overflow:hidden}

    /* ── Toolbar ── */
    .toolbar{display:flex;align-items:center;gap:10px;padding:10px 16px;background:#161b22;border-bottom:1px solid #30363d;flex-shrink:0}
    .title{font-size:13px;font-weight:700;color:#e6edf3;flex:1}
    .badge{font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;background:#0c2a3f;color:#38BDF8;border:1px solid #1e4d6b}
    .meta{font-size:11px;color:#8b949e}
    .btn{display:flex;align-items:center;gap:5px;padding:5px 12px;background:#21262d;border:1px solid #30363d;border-radius:5px;color:#c9d1d9;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s}
    .btn:hover{background:#30363d;border-color:#58a6ff;color:#58a6ff}
    .btn.copy:hover{border-color:#3fb950;color:#3fb950}
    .btn.save:hover{border-color:#9333EA;color:#9333EA}
    .btn svg{width:13px;height:13px}

    /* ── Code area ── */
    .code-wrap{flex:1;overflow:auto;padding:20px 24px}
    pre{margin:0;font-family:Consolas,'Courier New',monospace;font-size:12.5px;line-height:1.6;color:#e6edf3;white-space:pre}

    /* ── SQL keyword highlighting ── */
    .kw{color:#ff7b72}    /* CREATE TABLE, ALTER, DROP */
    .typ{color:#ffa657}   /* VARCHAR, INT, BOOLEAN */
    .str{color:#a5d6ff}   /* strings */
    .cmt{color:#8b949e;font-style:italic}  /* -- comments */
    .num{color:#79c0ff}   /* numbers */

    /* ── Footer ── */
    .footer{padding:8px 16px;background:#161b22;border-top:1px solid #30363d;font-size:11px;color:#8b949e;display:flex;gap:16px;flex-shrink:0}
    .footer span{display:flex;align-items:center;gap:4px}
    #copyStatus{font-size:11px;color:#3fb950;opacity:0;transition:opacity .3s}
    #savedPath{color:#58a6ff}
  </style>
  </head><body>

  <div class="toolbar">
    <div class="title">
      <span class="badge">${dbType}</span>&nbsp;&nbsp;${fileName}
    </div>
    <span class="meta">${lineCount} lines &nbsp;·&nbsp; ${charCount} chars</span>
    <button class="btn copy" id="btnCopy" onclick="copyScript()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      Copy
    </button>
    <span id="copyStatus">✓ Copied!</span>
  </div>

  <div class="code-wrap">
    <pre id="codeBlock">${syntaxHighlight(escaped)}</pre>
  </div>

  <div class="footer">
    ${savedPath ? '<span>📁 Saved to: <span id="savedPath">' + savedPath.replace(/</g, '&lt;') + '</span></span>' : ''}
    <span>✅ Generated by SnapStak AI</span>
  </div>

  <script>
    const RAW = document.getElementById('rawScript').value;

    function copyScript(){
      navigator.clipboard.writeText(RAW).then(()=>{
        const s = document.getElementById('copyStatus');
        s.style.opacity='1';
        setTimeout(()=>{ s.style.opacity='0'; }, 2000);
      });
    }

  </script>
  <textarea id="rawScript" style="display:none">${escaped}</textarea>
  </body></html>`;
}
// Minimal SQL syntax highlighter (runs server-side in template string)
function syntaxHighlight(code) {
    return code
        // Comments first
        .replace(/(--[^\n]*)/g, '<span class="cmt">$1</span>')
        // Keywords
        .replace(/\b(CREATE|TABLE|ALTER|DROP|INSERT|UPDATE|DELETE|SELECT|FROM|WHERE|INDEX|UNIQUE|PRIMARY\s+KEY|FOREIGN\s+KEY|REFERENCES|NOT\s+NULL|DEFAULT|AUTO_INCREMENT|AUTOINCREMENT|IF\s+NOT\s+EXISTS|ON\s+DELETE|ON\s+UPDATE|CASCADE|SET\s+NULL|CONSTRAINT|ADD|COLUMN|ENGINE|CHARSET|COLLATE|BEGIN|COMMIT|END|USE|DATABASE|SCHEMA)\b/gi, '<span class="kw">$1</span>')
        // Types
        .replace(/\b(INT|BIGINT|SMALLINT|TINYINT|VARCHAR|CHAR|TEXT|LONGTEXT|MEDIUMTEXT|BOOLEAN|BOOL|FLOAT|DOUBLE|DECIMAL|NUMERIC|DATE|DATETIME|TIMESTAMP|TIME|YEAR|JSON|BLOB|ENUM|SERIAL|UUID|BYTEA|REAL|INTEGER)\b/gi, '<span class="typ">$1</span>')
        // Strings
        .replace(/('(?:[^'\\]|\\.)*')/g, '<span class="str">$1</span>')
        // Numbers
        .replace(/\b(\d+)\b/g, '<span class="num">$1</span>');
}
// Opens the canvas and loads schema.layout.json to reconstruct the visual
async function openSchemaFile(context, schemaUri) {
    const nodePath = require('path');
    const wasOpen = !!_panel;
    openDatabaseCanvasPanel(context);
    try {
        const fsPath = schemaUri.fsPath;
        // Works whether user clicked schema.json OR schema.layout.json
        const dir = fsPath.endsWith('schema.layout.json')
            ? nodePath.dirname(fsPath)
            : nodePath.dirname(fsPath);
        const layoutUri = vscode.Uri.file(nodePath.join(dir, 'schema.layout.json'));
        const layoutBytes = await vscode.workspace.fs.readFile(layoutUri);
        const layout = JSON.parse(Buffer.from(layoutBytes).toString('utf8'));
        // Give the webview time to mount — longer if panel was already visible
        setTimeout(() => {
            _panel?.webview.postMessage({ command: 'loadLayout', layout });
            // Activate the Database tab in the sidebar
            _sidebarView?.webview.postMessage({ command: 'switchTab', tab: 'database' });
        }, wasOpen ? 100 : 500);
    }
    catch (err) {
        console.log(`[SnapStak] No layout file found, opening empty canvas: ${err.message}`);
    }
}
function openDatabaseCanvasPanel(context, getProjectRoot) {
    if (getProjectRoot) {
        _getProjectRoot = getProjectRoot;
    }
    // Reuse if already open
    if (_panel) {
        _panel.reveal(vscode.ViewColumn.One);
        return;
    }
    _panel = vscode.window.createWebviewPanel('snapstak.databaseCanvas', 'Database Schema', vscode.ViewColumn.One, {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: []
    });
    _panel.webview.html = getHtml();
    _panel.webview.onDidReceiveMessage(async (msg) => {
        if (msg.command === 'broadcastSchema') {
            pushSchemaToSidebar(msg.state);
        }
        if (msg.command === 'exportDb') {
            openDbScriptPanel(context, msg.dbType, msg.schema, msg.stakCommand);
        }
        if (msg.command === 'exportDb') {
            openDbScriptPanel(context, msg.dbType, msg.schema, msg.stakCommand);
        }
        if (msg.command === 'saveSchemaJson') {
            try {
                const projectRoot = _getProjectRoot?.() ||
                    (vscode.workspace.workspaceFolders?.[0]?.uri.fsPath);
                if (!projectRoot) {
                    vscode.window.showErrorMessage('SnapStak: No project open. Please open a project first.');
                    return;
                }
                const schemaDir = vscode.Uri.joinPath(vscode.Uri.file(projectRoot), 'schema');
                try {
                    await vscode.workspace.fs.createDirectory(schemaDir);
                }
                catch { }
                // Save schema.json (CMS format)
                await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(schemaDir, 'schema.json'), Buffer.from(msg.content, 'utf8'));
                // Save schema.layout.json (canvas positions, zoom, pan)
                if (msg.layout) {
                    await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(schemaDir, 'schema.layout.json'), Buffer.from(JSON.stringify(msg.layout, null, 2), 'utf8'));
                }
                _refreshWorkspaces?.();
                vscode.window.showInformationMessage(`SnapStak: schema.json saved to ${schemaDir.fsPath}`);
            }
            catch (err) {
                vscode.window.showErrorMessage(`SnapStak: Failed to save schema.json — ${err.message}`);
            }
        }
    });
    _panel.onDidDispose(() => {
        _panel = undefined;
    });
}
function getHtml() {
    const NL = String.fromCharCode(10);
    return [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head>',
        '<meta charset="UTF-8">',
        '<meta name="viewport" content="width=device-width,initial-scale=1">',
        '<meta http-equiv="Content-Security-Policy" content="default-src \'none\';style-src \'unsafe-inline\';script-src \'unsafe-inline\';">',
        '<title>Database Schema</title>',
        '<style>' + getCss() + '</style>',
        '</head>',
        '<body>',
        getBody(),
        '<script>(function(){' + NL + '\'use strict\';' + NL + getJs() + NL + '})();</script>',
        '</body>',
        '</html>'
    ].join(NL);
}
function getCss() {
    return `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#111;color:#ccc;font-family:var(--vscode-font-family,'Segoe UI',sans-serif);font-size:13px;overflow:hidden}
.root{display:flex;flex-direction:column;height:100vh}

.toolbar{display:flex;align-items:center;gap:6px;padding:6px 10px;background:#212121;border-bottom:1px solid #333;flex-shrink:0;flex-wrap:wrap}
.drag-item{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 12px;background:#2a2a2a;border:1px solid #444;border-radius:6px;color:#aaa;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;cursor:grab;user-select:none;touch-action:none;transition:all .2s}
.drag-item svg{width:18px;height:18px}
.drag-item:hover{background:#333;border-color:#38BDF8;color:#fff}
.drag-item.pal-dragging{cursor:grabbing;background:#333;border-color:#38BDF8;color:#fff;opacity:.7}
.sep{width:1px;height:28px;background:#333;margin:0 2px}
.tbtn{display:flex;align-items:center;gap:5px;padding:5px 10px;background:#2a2a2a;border:1px solid #444;border-radius:5px;color:#aaa;font-size:11px;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap}
.tbtn:hover{background:#333;border-color:#38BDF8;color:#fff}
.tbtn.danger:hover{border-color:#ef4444;color:#ef4444}
.tbtn svg{width:13px;height:13px}
.export-db-wrap{position:relative;display:flex;align-items:center}
.tbtn.export-db{background:#0c2a3f;border-color:#1e4d6b;color:#38BDF8;gap:0;padding:0}
.tbtn.export-db:hover:not(.export-db-disabled){background:#0d3352;border-color:#38BDF8}
.export-db-label{display:flex;align-items:center;gap:5px;padding:5px 8px;border-right:1px solid #1e4d6b}
.tbtn.export-db-disabled,.tbtn.export-db-disabled:hover{background:#1a1a1a !important;border-color:#2a2a2a !important;color:#444 !important;cursor:not-allowed !important;opacity:0.5}
.tbtn.tbtn-disabled,.tbtn.tbtn-disabled:hover{background:#1a1a1a !important;border-color:#2a2a2a !important;color:#444 !important;cursor:not-allowed !important;opacity:0.5}
.export-db-arrow{display:flex;align-items:center;padding:5px 6px;cursor:pointer}
.export-db-arrow svg{width:11px;height:11px;transition:transform .2s}
.export-db-arrow.open svg{transform:rotate(180deg)}
.export-db-menu{position:fixed;z-index:9999;background:#0d1520;border:1px solid #38BDF8;border-radius:6px;min-width:160px;box-shadow:0 8px 24px rgba(0,0,0,.6);overflow:hidden;display:none}
.export-db-menu.open{display:block}
.export-db-item{padding:7px 14px;font-size:11px;font-weight:600;color:#94a3b8;cursor:pointer;white-space:nowrap;transition:background .12s,color .12s}
.export-db-item:hover{background:rgba(56,189,248,.12);color:#38BDF8}
.export-db-item.active{color:#4ade80;background:rgba(74,222,128,.08)}
.zoom-lbl{font-size:11px;color:#888;padding:4px 8px;background:#1e1e1e;border:1px solid #333;border-radius:4px;min-width:46px;text-align:center}
.status{margin-left:auto;font-size:10px;color:#555;padding:3px 8px;background:#1e1e1e;border-radius:4px;border:1px solid #2a2a2a}
.status.has-data{color:#4ade80;border-color:#1a3a2a;background:#0d1f14}

/* Canvas: dotted grid - background-size and position updated on pan/zoom so grid tracks stage */
.canvas-wrap{flex:1;position:relative;overflow:hidden;background-color:#212121;background-image:radial-gradient(#555555 1px,transparent 0);background-size:20px 20px}
.canvas-wrap.pal-drag-over{outline:2px dashed #38BDF8;outline-offset:-4px}

.pal-ghost{position:fixed;pointer-events:none;z-index:9999;display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 14px;background:#1e1e2e;border:2px dashed #38BDF8;border-radius:8px;color:#38BDF8;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;opacity:.9;white-space:nowrap;transform:translate(-50%,-50%);box-shadow:0 4px 16px rgba(0,0,0,.5)}
.pal-ghost svg{width:22px;height:22px}
.pal-ghost.invalid{border-color:#ef4444;color:#ef4444}

.canvas-stage{position:absolute;top:0;left:0;transform-origin:0 0;will-change:transform}

.drop-hint{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:#333;pointer-events:none;z-index:0}
.drop-hint svg{width:56px;height:56px;opacity:.2}
.drop-hint p{font-size:13px;opacity:.35;text-align:center;line-height:1.6}
.drop-hint.hidden{display:none}

/* Database block */
.db-block{position:absolute;border:2px solid #4A7BA7;border-radius:8px;background:rgba(26,26,46,0.6);min-width:360px;cursor:default;box-shadow:0 4px 16px rgba(0,0,0,.5)}
.db-block.selected{border-color:#38BDF8}
.db-block.drop-target{border-color:#4ade80;background:#0d1f14}
.db-header{background:#2D5A6E;border-radius:6px 6px 0 0;padding:0 12px;height:40px;display:flex;align-items:center;justify-content:space-between;cursor:move;user-select:none;touch-action:none;flex-shrink:0;gap:8px}
.db-header-name{font-size:13px;font-weight:700;color:#fff;font-family:monospace;cursor:text;padding:2px 4px;border-radius:3px;border:1px solid transparent;transition:border-color .15s;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.db-header-name:hover{border-color:rgba(255,255,255,.3)}
.db-header-name-input{font-size:13px;font-weight:700;color:#fff;font-family:monospace;background:rgba(0,0,0,.3);border:1px solid #38BDF8;border-radius:3px;padding:2px 4px;outline:none;flex:1;min-width:0}
.db-header-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
.db-auth-check{display:flex;align-items:center;gap:4px;cursor:pointer;user-select:none}
.db-auth-check input[type=checkbox]{width:13px;height:13px;accent-color:#4ade80;cursor:pointer;flex-shrink:0;appearance:none;background:#1e3f4e;border:1px solid rgba(255,255,255,.25);border-radius:2px}
.db-auth-check-lbl{font-size:9px;font-weight:700;color:#4ade80;letter-spacing:.4px;text-transform:uppercase}.db-auth-check input[type=checkbox]:checked{background:#1e3f4e;border-color:#4ade80;}.db-auth-check input[type=checkbox]:checked:after{content:"✓";position:absolute;color:#4ade80;font-size:10px;line-height:1;top:-1px;left:1px}.db-auth-check input[type=checkbox]{position:relative}
.db-auth-badge{font-size:9px;font-weight:700;color:#4ade80;border:1px solid #00c864;border-radius:3px;padding:1px 5px;background:rgba(0,200,100,.1)}
/* db-body: free-position canvas, children use absolute left/top */
.db-body{position:relative;min-height:160px;min-width:340px}

/* Table block */
.tbl-block{position:absolute;border:1px solid #2a3a4a;border-radius:4px;background:#0d1520;overflow:hidden;width:max-content;min-width:560px;cursor:default;box-shadow:0 4px 16px rgba(0,0,0,.5)}
.tbl-block.tbl-dragging{opacity:.75;z-index:100}

/* Header: name | Timestamp | SoftDelete | icons */
.tbl-header{background:#1a2535;height:36px;padding:0 8px 0 12px;display:flex;align-items:center;gap:0;cursor:move;user-select:none;touch-action:none;box-sizing:border-box;border-bottom:1px solid #2a3a4a}
.tbl-header-name{font-size:13px;font-weight:700;color:#fff;font-family:monospace;flex:0 0 auto;white-space:nowrap;cursor:text;padding:2px 4px;border-radius:3px;border:1px solid transparent;margin-right:4px}
.tbl-header-name:hover{border-color:rgba(255,255,255,.3)}
.tbl-header-name-input{font-size:13px;font-weight:700;color:#fff;font-family:monospace;background:rgba(0,0,0,.3);border:1px solid #38BDF8;border-radius:3px;padding:2px 6px;outline:none;width:130px;margin-right:4px}
.tbl-header-spacer{flex:1}
.tbl-header-checks{display:flex;align-items:center;gap:6px;flex-shrink:0;margin-right:8px}
.tbl-hdr-chk{display:flex;align-items:center;gap:5px;cursor:pointer;user-select:none;background:#111c2a;border:1px solid #2a3a4a;border-radius:4px;padding:2px 8px;height:22px}
.tbl-hdr-chk input[type=checkbox]{width:12px;height:12px;cursor:pointer;flex-shrink:0;appearance:none;-webkit-appearance:none;background:#111c2a;border:1px solid #4a6070;border-radius:2px;position:relative}.tbl-hdr-chk input[type=checkbox]:checked{background:#111c2a;border-color:#4ade80}.tbl-hdr-chk input[type=checkbox]:checked::after{content:"";position:absolute;left:2px;top:0px;width:5px;height:8px;border:2px solid #4ade80;border-top:none;border-left:none;transform:rotate(45deg)}
.tbl-hdr-chk-lbl{font-size:10px;font-weight:600;color:rgba(255,255,255,.75);white-space:nowrap;letter-spacing:.2px}
.tbl-header-actions{display:flex;align-items:center;gap:2px;flex-shrink:0}
.tbl-hdr-btn{width:24px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:4px;cursor:pointer;color:rgba(255,255,255,.45);transition:all .15s;flex-shrink:0}
.tbl-hdr-btn:hover{background:rgba(255,255,255,.1);color:#fff}
.tbl-hdr-btn.danger:hover{background:rgba(239,68,68,.15);color:#ef4444}
.tbl-hdr-btn svg{width:13px;height:13px;pointer-events:none}

/* Column sub-header labels */
.tbl-col-header{display:flex;align-items:center;height:22px;padding:0 10px;box-sizing:border-box;border-bottom:1px solid #1a2535;background:#0d1520}
.tbl-col-header span{font-size:9px;font-weight:600;color:#4a5a6a;text-transform:uppercase;letter-spacing:.4px;white-space:nowrap}

/* Column data rows */
.tbl-col{display:flex;align-items:center;height:30px;padding:0 10px;cursor:pointer;border-bottom:1px solid #111d2b;font-family:monospace;font-size:11px;box-sizing:border-box;background:#0d1520}
.tbl-col:hover{background:#111d2b}

/* Fixed cell widths — must match sub-header exactly */
.tbl-cell-name{width:130px;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e2e8f0}
.tbl-cell-type{width:80px;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#7aa2c8}
.tbl-cell-len {width:56px;flex-shrink:0;color:#8899aa;font-size:11px}
.tbl-cell-attr{width:64px;flex-shrink:0;font-size:11px;color:#4a5a6a}
.tbl-cell-attr.on{color:#e2e8f0}

/* Inline add-column form — single row */
.col-form{display:flex;align-items:center;gap:6px;padding:6px 10px;background:#111d2b;border-top:1px solid #38BDF8;box-sizing:border-box}
.col-form-inp{background:#0a1219;border:1px solid #2a3a4a;border-radius:3px;color:#e2e8f0;font-size:11px;font-family:monospace;padding:3px 6px;outline:none;box-sizing:border-box}
.col-form-inp:focus{border-color:#38BDF8}
.col-form-name{width:110px}
.col-form-type{width:90px}
.col-form-len {width:48px}
.col-form-chk-wrap{display:flex;align-items:center;gap:3px;cursor:pointer;user-select:none;flex-shrink:0}
.col-form-chk-wrap input[type=checkbox]{width:13px;height:13px;cursor:pointer;appearance:none;-webkit-appearance:none;background:#0a1219;border:1px solid #2a3a4a;border-radius:2px;position:relative;flex-shrink:0}.col-form-chk-wrap input[type=checkbox]:checked{background:#0a1219;border-color:#38BDF8}.col-form-chk-wrap input[type=checkbox]:checked::after{content:"";position:absolute;left:3px;top:0px;width:5px;height:8px;border:2px solid #38BDF8;border-top:none;border-left:none;transform:rotate(45deg)}
.col-form-chk-lbl{font-size:10px;color:#8899aa;white-space:nowrap}
.col-form-chk-wrap input:checked~.col-form-chk-lbl{color:#e2e8f0}
.col-form-save{background:#38BDF8;color:#fff;border:none;border-radius:3px;padding:4px 12px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0}
.col-form-save:hover{background:#0284c7}
.col-form-cancel{background:transparent;color:#8899aa;border:1px solid #2a3a4a;border-radius:3px;padding:4px 10px;font-size:11px;cursor:pointer;white-space:nowrap;flex-shrink:0}
.col-form-cancel:hover{color:#fff;border-color:#4a5a6a}
.badge{font-size:8px;font-weight:700;padding:2px 5px;border-radius:3px;font-family:monospace}
.badge-pk{background:rgba(245,158,11,.15);border:1px solid #f59e0b;color:#f59e0b}
.badge-uq{background:rgba(56,189,248,.15);border:1px solid #38BDF8;color:#38BDF8}
.badge-fk{background:rgba(59,130,246,.15);border:1px solid #3b82f6;color:#3b82f6}
.badge-ix{background:rgba(6,182,212,.15);border:1px solid #06b6d4;color:#06b6d4}
.badge-ai{background:rgba(74,222,128,.1);border:1px solid #4ade80;color:#4ade80}
.col-key-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;margin-left:auto}.db-connectors{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:0}.col-key-dot.pk{background:#cb8813}.col-key-dot.uq{background:#31bdbd}.col-key-dot.fk{background:#38BDF8}.col-key-dot.ix{background:#5a95ae}.col-key-dot.en{background:#67a270}



.keys-section{border-top:1px solid #4A7BA7;background:#0d1923}
.keys-header{height:32px;padding:0 12px;display:flex;align-items:center;justify-content:space-between}
/* Key panel */
.key-panel{background:#0d1520;border-top:2px solid #4A7BA7;padding:10px 12px;box-sizing:border-box}
.key-panel-title{display:flex;align-items:center;justify-content:space-between;font-size:11px;font-weight:700;color:#7aa2c8;margin-bottom:10px;text-transform:none;letter-spacing:0}
.key-panel-close{cursor:pointer;color:#555;font-size:13px;padding:0 2px;border-radius:3px}
.key-panel-close:hover{color:#fff;background:rgba(255,255,255,.1)}
.key-saved-row{display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #111d2b;font-family:monospace;font-size:11px}
.key-saved-name{color:#e2e8f0;flex:0 0 auto;min-width:100px}
.key-saved-badge{font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;color:#fff;flex-shrink:0;text-transform:uppercase}
.key-saved-cols{color:#8899aa;flex:1;font-size:11px}
.key-saved-del{cursor:pointer;color:#555;font-size:11px;flex-shrink:0;padding:0 4px}
.key-saved-del:hover{color:#ef4444}
.key-add-form{margin-top:8px}
.key-add-row2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.key-add-field{display:flex;flex-direction:column;gap:3px}
.key-add-inp{background:#0a1219;border:1px solid #1e3a5f;border-radius:3px;color:#e2e8f0;font-size:11px;font-family:monospace;padding:4px 7px;outline:none;width:100%;box-sizing:border-box}
.key-add-inp:focus{border-color:#4A7BA7}

/* Custom scrollbar */
.db-block *::-webkit-scrollbar{width:4px;height:4px}
.db-block *::-webkit-scrollbar-track{background:transparent}
.db-block *::-webkit-scrollbar-thumb{background:#6a6a7a;border-radius:2px}
.db-block *::-webkit-scrollbar-thumb:hover{background:#9a9aaa}

/* Custom select widget */
.csel{position:relative;display:inline-block;box-sizing:border-box}
.csel-val{background:#0a1219;border:1px solid #2a3a4a;border-left:2px solid #38BDF8;border-radius:3px;color:#e2e8f0;font-size:11px;font-family:monospace;padding:4px 22px 4px 7px;cursor:pointer;user-select:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-sizing:border-box;width:100%}
.csel-val:after{content:"▾";position:absolute;right:6px;top:50%;transform:translateY(-50%);color:#8899aa;font-size:10px;pointer-events:none}
.csel-val:focus{outline:none;border-color:#38BDF8}
.csel-dropdown{position:fixed;background:#0d1520;border:1px solid #38BDF8;border-radius:4px;z-index:99999;overflow-y:auto;max-height:220px;min-width:100px;box-shadow:0 4px 20px rgba(0,0,0,.7);scrollbar-width:thin;scrollbar-color:#6a6a7a transparent}
.csel-dropdown::-webkit-scrollbar{width:4px}
.csel-dropdown::-webkit-scrollbar-thumb{background:#6a6a7a;border-radius:2px}
.csel-opt{padding:5px 10px;font-size:11px;font-family:monospace;color:#e2e8f0;cursor:pointer;border-left:2px solid transparent;white-space:nowrap}
.csel-opt:hover{background:rgba(0,60,100,0.35);border-left-color:#38BDF8}
.csel-opt.selected{background:#38BDF8;color:#fff;border-left-color:#38BDF8}
.key-add-btn{margin-top:10px;background:#38BDF8;color:#fff;border:none;border-radius:3px;padding:5px 14px;font-size:11px;font-weight:700;cursor:pointer}
.key-add-btn:hover{background:#0284c7}
/* Inline saved key rows (panel closed) */
.key-row{display:flex;align-items:center;gap:8px;padding:5px 12px;border-top:1px solid #111d2b;font-family:monospace;font-size:11px;background:#0d1520}
.key-add-link{padding:6px 12px;font-size:11px;color:#38BDF8;cursor:pointer;font-family:monospace;border-top:1px solid #111d2b;background:#0d1520}
.key-add-link:hover{color:#7dd3fc}
.keys-title{font-size:10px;font-weight:700;color:#4A7BA7;font-family:monospace}
.keys-add{font-size:10px;color:#38BDF8;cursor:pointer;padding:2px 6px;border-radius:3px}
.keys-add:hover{background:rgba(56,189,248,.15)}
.key-row{display:flex;align-items:center;height:36px;padding:0 12px;gap:10px;font-family:monospace;font-size:11px;border-top:1px solid #080f17}
.key-row:nth-child(odd){background:#0a1219}
.key-row:nth-child(even){background:#080f17}
.key-type{font-weight:700;min-width:60px}
.key-cols{color:#666;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.key-del{margin-left:auto;color:#c44;cursor:pointer;font-size:14px;line-height:1;padding:2px 5px}
.key-del:hover{color:#ef4444}
/* Inline key form */
.key-form{background:#070d14;border-top:2px solid #4A7BA7;padding:12px 14px;display:flex;flex-direction:column;gap:9px}
.key-form-title{font-size:10px;color:#4A7BA7;font-weight:700;text-transform:uppercase;letter-spacing:.6px;padding-bottom:8px;border-bottom:1px solid #1a2a3a}
.key-form-row{display:flex;flex-direction:column;gap:3px}
.key-form-row-2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.key-form-lbl{font-size:9px;font-weight:700;color:#4A7BA7;text-transform:uppercase;letter-spacing:.5px}
.key-form select,.key-form input[type=text]{padding:5px 8px;background:#0a1420;border:1px solid #1e3a5f;border-radius:4px;color:#ccc;font-size:12px;font-family:monospace;outline:none;width:100%}
.key-form select:focus,.key-form input[type=text]:focus{border-color:#4A7BA7}
.key-form-col-list{display:flex;flex-direction:column;gap:3px;max-height:120px;overflow-y:auto;background:#0a1420;border:1px solid #1e3a5f;border-radius:4px;padding:4px 0}
.key-form-col-item{display:flex;align-items:center;gap:8px;padding:4px 10px;cursor:pointer;font-family:monospace;font-size:12px;color:#ccc;transition:background .1s}
.key-form-col-item:hover{background:#111d2b}
.key-form-col-item input[type=checkbox]{width:13px;height:13px;accent-color:#4A7BA7;cursor:pointer}
.key-form-fk-section{display:flex;flex-direction:column;gap:6px;padding:8px 10px;background:#060e18;border:1px solid #1a3050;border-radius:4px}
.key-form-fk-title{font-size:9px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:.5px}
.key-form-flags{display:flex;gap:0;border:1px solid #1e3a5f;border-radius:5px;overflow:hidden;margin-top:2px}
.key-form-flag{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 4px;cursor:pointer;border-right:1px solid #1e3a5f;transition:background .15s;user-select:none}
.key-form-flag:last-child{border-right:none}
.key-form-flag input[type=checkbox]{width:14px;height:14px;accent-color:#4A7BA7;cursor:pointer}
.key-form-flag-lbl{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:#555;text-align:center;line-height:1.2}
.key-form-flag:hover{background:#111d2b}
.key-form-flag input:checked~.key-form-flag-lbl{color:#4A7BA7}
.key-form-btns{display:flex;gap:7px}
.key-form-btns button{padding:6px 0;border:none;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer;transition:all .15s}
.key-form-save{flex:1;background:#2D5A6E;color:#fff}
.key-form-save:hover{background:#3a7a9a}
.key-form-close{padding:6px 12px !important;background:#1a1a2e;color:#666;border:1px solid #2a2a3e}
.key-form-close:hover{background:#222;color:#aaa}

.tbl-add-col{height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#555;font-size:11px;border-top:1px solid #0d1923;gap:6px;transition:all .15s}
.tbl-add-col:hover{background:#0d161f;color:#38BDF8}

/* Enum block: absolutely positioned inside db-body */
.enum-block{position:absolute;border:1.5px solid #38BDF8;border-radius:5px;background:#060f1c;overflow:hidden;width:max-content;min-width:300px;cursor:default;box-shadow:0 4px 16px rgba(0,0,0,.5)}
.enum-block.tbl-dragging{opacity:.75;z-index:100}
.enum-header{background:#0c1a2e;height:40px;padding:0 8px 0 12px;display:flex;align-items:center;gap:6px;cursor:move;user-select:none;touch-action:none}
.enum-header-name{font-size:12px;font-weight:700;color:#bae6fd;font-family:monospace;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:2px 4px;border-radius:3px}
.enum-header-name-input{font-size:12px;font-weight:700;color:#bae6fd;font-family:monospace;background:rgba(0,0,0,.3);border:1px solid #38BDF8;border-radius:3px;padding:2px 4px;outline:none;flex:1;min-width:0}
.enum-header-actions{display:flex;align-items:center;gap:1px;flex-shrink:0}
.enum-hdr-btn{width:26px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:4px;cursor:pointer;color:rgba(56,189,248,.5);transition:all .15s;flex-shrink:0}
.enum-hdr-btn:hover{background:rgba(56,189,248,.2);color:#bae6fd}
.enum-hdr-btn.danger:hover{background:rgba(239,68,68,.2);color:#ef4444}
.enum-hdr-btn svg{width:13px;height:13px;pointer-events:none}

/* Enum edit form (unsaved) */
.enum-form{padding:10px 12px;display:flex;flex-direction:column;gap:8px;border-top:1px solid #0e2a3a}
.enum-form-lbl{font-size:9px;font-weight:700;color:#38BDF8;letter-spacing:.5px;text-transform:uppercase;margin-bottom:2px}
.enum-form-inp{background:#0a1219;border:1px solid #2a3a4a;border-radius:3px;color:#e2e8f0;font-size:11px;font-family:monospace;padding:5px 8px;outline:none;width:100%;box-sizing:border-box}
.enum-form-inp:focus{border-color:#38BDF8}
.enum-form-row{display:flex;gap:6px;align-items:center}
.enum-val-entry{display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.enum-val-entry-name{flex:1;font-family:monospace;font-size:12px;color:#bae6fd}
.enum-val-default-toggle{display:flex;align-items:center;gap:4px;cursor:pointer;user-select:none;font-size:10px;color:#38BDF8;flex-shrink:0}
.enum-val-default-toggle input[type=radio]{appearance:none;width:12px;height:12px;border:1px solid #1a3a4a;border-radius:50%;background:#060f1c;cursor:pointer;flex-shrink:0;position:relative}
.enum-val-default-toggle input[type=radio]:checked{border-color:#bae6fd;background:#bae6fd}
.enum-val-entry-del{color:#2a4a5a;cursor:pointer;font-size:13px;transition:color .15s;padding:0 4px;flex-shrink:0}
.enum-val-entry-del:hover{color:#ef4444}
.enum-form-save{background:#38BDF8;color:#fff;border:none;border-radius:4px;padding:6px 16px;font-size:11px;font-weight:700;cursor:pointer;align-self:flex-start;margin-top:2px}
.enum-form-save:hover{background:#0284c7}
.enum-form-add-link{color:#38BDF8;font-size:11px;cursor:pointer;display:flex;align-items:center;gap:4px;transition:color .15s}
.enum-form-add-link:hover{color:#bae6fd}

/* Enum saved display */
.enum-col-hdr{display:flex;align-items:center;height:22px;padding:0 12px;background:#060f1c;border-top:1px solid #0e2a3a}
.enum-col-hdr-cell{font-size:9px;font-weight:700;color:#38BDF8;letter-spacing:.4px;text-transform:uppercase}
.enum-val{display:flex;align-items:center;height:30px;padding:0 12px;border-top:1px solid #091520;font-family:monospace;font-size:12px;color:#bae6fd}
.enum-val:nth-child(odd){background:#0d2035}
.enum-val:nth-child(even){background:#071828}
.enum-val-tick{color:#4ade80;font-size:14px;font-weight:700;margin-left:auto;flex-shrink:0;width:18px;text-align:center}
.enum-val-dot{width:9px;height:9px;border-radius:50%;background:#67a270;flex-shrink:0}
.enum-linked-info{padding:5px 12px;background:#060f1c;border-top:1px solid #0e2a3a;font-size:10px;color:#38BDF8;font-family:monospace;display:flex;align-items:center;gap:6px}
.enum-linked-badge{background:rgba(56,189,248,.2);border:1px solid #38BDF8;border-radius:3px;padding:1px 6px;font-size:9px;color:#bae6fd}

.json-panel{position:absolute;bottom:0;left:0;right:0;background:#0d0d0d;border-top:2px solid #38BDF8;max-height:240px;overflow:hidden;transform:translateY(100%);transition:transform .25s;display:flex;flex-direction:column;z-index:50}
.json-panel.open{transform:translateY(0)}
.json-head{display:flex;align-items:center;justify-content:space-between;padding:6px 12px;background:#1a1a1a;border-bottom:1px solid #222;flex-shrink:0}
.json-head span{font-size:11px;font-weight:700;color:#38BDF8;text-transform:uppercase;letter-spacing:.5px}
.json-acts{display:flex;gap:6px}
.jbtn{padding:3px 10px;border:none;border-radius:3px;font-size:10px;font-weight:700;cursor:pointer}
.jbtn-copy{background:#38BDF8;color:#fff}.jbtn-copy:hover{background:#0284c7}
.jbtn-save{background:#9333EA;color:#fff}.jbtn-save:hover{background:#7e22ce}
.jbtn-close{background:#333;color:#aaa}.jbtn-close:hover{background:#444;color:#fff}
.json-body{flex:1;overflow-y:auto;padding:10px 12px;font-family:'Courier New',monospace;font-size:11px;color:#9cdcfe;line-height:1.6;white-space:pre}

.ctx{display:none;position:fixed;background:#1e1e1e;border:1px solid #444;border-radius:6px;padding:4px;z-index:200;min-width:160px;box-shadow:0 6px 20px rgba(0,0,0,.7)}
.ctx.open{display:block}
.ctx-item{display:flex;align-items:center;gap:9px;padding:7px 12px;border-radius:4px;font-size:12px;color:#ccc;cursor:pointer;transition:background .1s}
.ctx-item:hover{background:#333;color:#fff}
.ctx-item.danger:hover{background:#3a1515;color:#ef4444}
.ctx-sep{height:1px;background:#333;margin:3px 0}
.ctx-item svg{width:13px;height:13px;flex-shrink:0}

.overlay{position:absolute;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:300}
.overlay.hidden{display:none}
.modal{background:#1a1a1a;border:1px solid #444;border-radius:10px;padding:22px;width:340px;max-width:92vw}
.modal h4{margin:0 0 16px;font-size:14px;color:#fff;font-weight:700}
.mfield{margin-bottom:13px}
.mfield label{display:block;font-size:11px;color:#888;margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px}
.minput,.mselect{width:100%;padding:7px 9px;background:#111;border:1px solid #333;border-radius:5px;color:#ccc;font-size:12px;outline:none}
.minput:focus,.mselect:focus{border-color:#38BDF8}
.mcheck{display:flex;align-items:center;gap:8px;margin-bottom:13px}
.mcheck input{width:15px;height:15px;accent-color:#38BDF8;cursor:pointer}
.mcheck label{font-size:12px;color:#ccc;cursor:pointer}
.mbtns{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}
.mbtn{padding:7px 16px;border:none;border-radius:5px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s}
.mbtn-ok{background:#38BDF8;color:#fff}.mbtn-ok:hover{background:#0284c7}
.mbtn-cancel{background:#333;color:#aaa;border:1px solid #444}.mbtn-cancel:hover{background:#444;color:#fff}

.toast{position:fixed;bottom:16px;left:50%;transform:translateX(-50%) translateY(20px);background:#38BDF8;color:#fff;padding:7px 16px;border-radius:20px;font-size:11px;font-weight:700;opacity:0;transition:all .3s;pointer-events:none;z-index:400;white-space:nowrap}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
`;
}
function getBody() {
    return `
<div class="toast" id="toast"></div>

<div class="ctx" id="ctx">
  <div class="ctx-item" id="ctxAddTable">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
    Add Table
  </div>
  <div class="ctx-item" id="ctxAddEnum">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
    Add Enum
  </div>
  <div class="ctx-sep"></div>
  <div class="ctx-item danger" id="ctxDeleteDb">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
    Delete Database
  </div>
</div>

<div class="root">
  <div class="toolbar">
    <div class="drag-item" data-palette="database" title="Drag to canvas to create a database">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
      Database
    </div>
    <div class="drag-item" data-palette="table" title="Drag onto a database">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
      Table
    </div>
    <div class="drag-item" data-palette="enum" title="Drag onto a database">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
      Enum
    </div>
    <div class="sep"></div>
    <button class="tbtn" id="btnZoomIn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg></button>
    <span class="zoom-lbl" id="zoomLbl">100%</span>
    <button class="tbtn" id="btnZoomOut"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg></button>
    <button class="tbtn" id="btnReset">Reset</button>
    <div class="sep"></div>
    <button class="tbtn" id="btnExport"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Export JSON</button>
    <div class="sep"></div>
    <div class="export-db-wrap" id="exportDbWrap">
      <button class="tbtn export-db" id="btnExportDb">
        <span class="export-db-label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
          Export DB
        </span>
        <span class="export-db-arrow" id="exportDbArrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </button>
      <div class="export-db-menu" id="exportDbMenu">
        <div class="export-db-item" data-db="MySQL">MySQL</div>
        <div class="export-db-item" data-db="PostgreSQL">PostgreSQL</div>
        <div class="export-db-item" data-db="MongoDB">MongoDB</div>
        <div class="export-db-item" data-db="SQLite">SQLite</div>
        <div class="export-db-item" data-db="MariaDB">MariaDB</div>
        <div class="export-db-item" data-db="Redis">Redis</div>
        <div class="export-db-item" data-db="Cassandra">Cassandra</div>
        <div class="export-db-item" data-db="DynamoDB">DynamoDB</div>
        <div class="export-db-item" data-db="CockroachDB">CockroachDB</div>
        <div class="export-db-item" data-db="MSSQL">MSSQL</div>
        <div class="export-db-item" data-db="Oracle">Oracle</div>
        <div class="export-db-item" data-db="CouchDB">CouchDB</div>
        <div class="export-db-item" data-db="Neo4j">Neo4j</div>
        <div class="export-db-item" data-db="Firestore">Firestore</div>
        <div class="export-db-item" data-db="InfluxDB">InfluxDB</div>
        <div class="export-db-item" data-db="TimescaleDB">TimescaleDB</div>
        <div class="export-db-item" data-db="ArangoDB">ArangoDB</div>
        <div class="export-db-item" data-db="CosmosDB">CosmosDB</div>
      </div>
    </div>
    <button class="tbtn danger" id="btnClear"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>Clear</button>
    <span class="status" id="statusLbl">0 databases</span>
  </div>

  <div class="canvas-wrap" id="canvasWrap">
    <div class="canvas-stage" id="canvasStage"></div>
    <div class="drop-hint" id="dropHint">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
      <p>Drag a <strong>Database</strong> onto the canvas to start<br>or right-click the canvas</p>
    </div>
    <div class="overlay hidden" id="overlay">
      <div class="modal">
        <h4 id="mTitle">Create Database</h4>
        <div class="mfield"><label id="mLabel1">Name</label><input class="minput" id="mInput1" autocomplete="off"/></div>
        <div class="mfield hidden" id="mField2"><label>Type</label>
          <select class="mselect" id="mSel2">
            <option>integer</option><option>bigint</option><option>string</option><option>text</option>
            <option>decimal</option><option>float</option><option>boolean</option><option>date</option>
            <option>datetime</option><option>timestamp</option><option>json</option><option>enum</option>
          </select>
        </div>
        <div class="mcheck hidden" id="mCheckRow"><input type="checkbox" id="mCheck"/><label for="mCheck" id="mCheckLbl">Enable Authentication</label></div>
        <div class="mbtns">
          <button class="mbtn mbtn-cancel" id="mCancel">Cancel</button>
          <button class="mbtn mbtn-ok" id="mConfirm">Create</button>
        </div>
      </div>
    </div>
    <div class="json-panel" id="jsonPanel">
      <div class="json-head">
        <span>Schema JSON</span>
        <div class="json-acts">
          <button class="jbtn jbtn-copy" id="btnCopyJson">Copy</button>
          <button class="jbtn jbtn-close" id="btnCloseJson">Close</button>
        </div>
      </div>
      <div class="json-body" id="jsonBody"></div>
    </div>
  </div>
</div>
`;
}
function getJs() {
    const NL = String.fromCharCode(10);
    return `
// ── State ─────────────────────────────────────────────────────
// db:  { id, name, auth, x, y, tables:[], enums:[] }
// tbl: { id, name, x, y, columns:[], keys:[], _formOpen, ... }
// enm: { id, name, x, y, values:[] }
const vscodeApi = (typeof acquireVsCodeApi !== 'undefined') ? acquireVsCodeApi() : null;
const S={dbs:[],zoom:1,panX:0,panY:0,modalCb:null,ctxDbId:null};
var _saveTimer;
let _uid=0;
const uid=()=>'u'+(++_uid);

// ── Custom select widget ───────────────────────────────────────
// makeSelect(id, options, currentVal, onChange, extraClass)
// options: [{value, label}] or ['val1','val2']
// Returns a .csel div. Dropdown closes on outside click.
var _cselOpen=null;
function makeSelect(id,options,currentVal,onChange,extraClass){
  var wrap=document.createElement('div');
  wrap.className='csel'+(extraClass?' '+extraClass:'');
  wrap.id=id;

  var normOpts=options.map(function(o){
    return typeof o==='string'?{value:o,label:o}:o;
  });

  var val=document.createElement('div');
  val.className='csel-val';
  val.tabIndex=0;
  var cur=normOpts.find(function(o){return o.value===currentVal;})||normOpts[0];
  val.textContent=cur?cur.label:'';
  val._value=cur?cur.value:'';
  wrap.appendChild(val);

  function openDrop(){
    if(_cselOpen&&_cselOpen!==wrap) closeDrop(_cselOpen);
    _cselOpen=wrap;
    var drop=document.createElement('div');
    drop.className='csel-dropdown';
    wrap._drop=drop;

    normOpts.forEach(function(o){
      var opt=document.createElement('div');
      opt.className='csel-opt'+(o.value===val._value?' selected':'');
      opt.textContent=o.label;
      opt.addEventListener('mousedown',function(e){
        e.preventDefault();
        e.stopPropagation();
        val.textContent=o.label;
        val._value=o.value;
        drop.querySelectorAll('.csel-opt').forEach(function(x){x.classList.remove('selected');});
        opt.classList.add('selected');
        closeDrop(wrap);
        onChange(o.value);
      });
      drop.appendChild(opt);
    });

    // Position dropdown using fixed coords
    var rc=val.getBoundingClientRect();
    drop.style.left=rc.left+'px';
    drop.style.top=(rc.bottom+2)+'px';
    drop.style.minWidth=rc.width+'px';
    document.body.appendChild(drop);
  }

  function closeDrop(w){
    if(w._drop&&w._drop.parentNode) w._drop.parentNode.removeChild(w._drop);
    w._drop=null;
    if(_cselOpen===w) _cselOpen=null;
  }

  val.addEventListener('mousedown',function(e){
    e.stopPropagation();
    if(wrap._drop) closeDrop(wrap); else openDrop();
  });
  val.addEventListener('keydown',function(e){
    if(e.key==='Enter'||e.key===' '){e.preventDefault();if(wrap._drop)closeDrop(wrap);else openDrop();}
    if(e.key==='Escape'){closeDrop(wrap);}
  });
  document.addEventListener('mousedown',function(e){
    if(_cselOpen===wrap&&wrap._drop&&!wrap._drop.contains(e.target)&&!val.contains(e.target)){
      closeDrop(wrap);
    }
  });

  // Public API
  wrap.getValue=function(){return val._value;};
  wrap.setValue=function(v){
    val._value=v;
    var o=normOpts.find(function(x){return x.value===v;});
    val.textContent=o?o.label:v;
  };
  return wrap;
}

const wrap      = document.getElementById('canvasWrap');
const stage     = document.getElementById('canvasStage');
const hint      = document.getElementById('dropHint');
const zoomLbl   = document.getElementById('zoomLbl');
const statusLbl = document.getElementById('statusLbl');
const jsonPnl   = document.getElementById('jsonPanel');
const jsonBdy   = document.getElementById('jsonBody');
const ctx       = document.getElementById('ctx');
const overlay   = document.getElementById('overlay');
const toast     = document.getElementById('toast');
const mTitle    = document.getElementById('mTitle');
const mLabel1   = document.getElementById('mLabel1');
const mInput1   = document.getElementById('mInput1');
const mField2   = document.getElementById('mField2');
const mSel2     = document.getElementById('mSel2');
const mCheckRow = document.getElementById('mCheckRow');
const mCheck    = document.getElementById('mCheck');
const mCheckLbl = document.getElementById('mCheckLbl');
const mCancel   = document.getElementById('mCancel');
const mConfirm  = document.getElementById('mConfirm');

// Padding inside db-body around child items
const BODY_PAD = 20;

// ── Toast ─────────────────────────────────────────────────────
let _tt;
function showToast(m){
  toast.textContent=m;
  toast.classList.add('show');
  clearTimeout(_tt);
  _tt=setTimeout(()=>toast.classList.remove('show'),2200);
}

// ── Modal ─────────────────────────────────────────────────────
function modal(cfg){
  mTitle.textContent=cfg.title||'Create';
  mLabel1.textContent=cfg.label1||'Name';
  mInput1.value=cfg.val1||'';
  mInput1.placeholder=cfg.ph1||'';
  mField2.classList.toggle('hidden',!cfg.showType);
  mCheckRow.classList.toggle('hidden',!cfg.showCheck);
  mCheck.checked=cfg.checked||false;
  mCheckLbl.textContent=cfg.chkLbl||'';
  mConfirm.textContent=cfg.ok||'Create';
  overlay.classList.remove('hidden');
  setTimeout(()=>mInput1.focus(),40);
  S.modalCb=cfg.cb;
}
mCancel.addEventListener('click',()=>overlay.classList.add('hidden'));
mConfirm.addEventListener('click',()=>{
  const v=mInput1.value.trim();
  if(!v){mInput1.style.borderColor='#ef4444';return;}
  mInput1.style.borderColor='';
  overlay.classList.add('hidden');
  if(S.modalCb) S.modalCb({name:v,type:mSel2.value,checked:mCheck.checked});
});
mInput1.addEventListener('keydown',e=>{if(e.key==='Enter')mConfirm.click();});

// ── Zoom + Pan ────────────────────────────────────────────────
// The background grid tracks zoom/pan by adjusting background-size and
// background-position on .canvas-wrap, making the grid feel anchored.
function applyXform(){
  stage.style.transform='translate('+S.panX+'px,'+S.panY+'px) scale('+S.zoom+')';
  zoomLbl.textContent=Math.round(S.zoom*100)+'%';
  const gs=Math.round(20*S.zoom);
  wrap.style.backgroundSize=gs+'px '+gs+'px';
  wrap.style.backgroundPosition=(S.panX%gs)+'px '+(S.panY%gs)+'px';
}
function doZoom(delta,cx,cy){
  const prev=S.zoom;
  S.zoom=Math.min(2,Math.max(0.2,S.zoom+delta));
  const r=S.zoom/prev;
  const rc=wrap.getBoundingClientRect();
  const ox=cx!==undefined?cx-rc.left:rc.width/2;
  const oy=cy!==undefined?cy-rc.top:rc.height/2;
  S.panX=ox-r*(ox-S.panX);
  S.panY=oy-r*(oy-S.panY);
  applyXform();
}
document.getElementById('btnZoomIn') .addEventListener('click',()=>doZoom(0.1));
document.getElementById('btnZoomOut').addEventListener('click',()=>doZoom(-0.1));
document.getElementById('btnReset')  .addEventListener('click',()=>{S.zoom=1;S.panX=0;S.panY=0;applyXform();});
wrap.addEventListener('wheel',e=>{e.preventDefault();doZoom(e.deltaY<0?0.08:-0.08,e.clientX,e.clientY);},{passive:false});

// ── Canvas Pan: middle-mouse or Alt+drag ──────────────────────
let _panPid=null,_panS={x:0,y:0},_panO={x:0,y:0};
wrap.addEventListener('pointerdown',e=>{
  if(!(e.button===1||(e.button===0&&e.altKey)))return;
  _panPid=e.pointerId;
  wrap.setPointerCapture(e.pointerId);
  _panS={x:e.clientX,y:e.clientY};
  _panO={x:S.panX,y:S.panY};
  e.preventDefault();
});
wrap.addEventListener('pointermove',e=>{
  if(_panPid===null||e.pointerId!==_panPid)return;
  S.panX=_panO.x+(e.clientX-_panS.x);
  S.panY=_panO.y+(e.clientY-_panS.y);
  applyXform();
});
wrap.addEventListener('pointerup',  e=>{if(e.pointerId===_panPid)_panPid=null;});
wrap.addEventListener('pointercancel',e=>{if(e.pointerId===_panPid)_panPid=null;});

// ── Helpers ───────────────────────────────────────────────────
const esc=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const getDb =(id)=>S.dbs.find(d=>d.id===id)||null;
const getTbl=(dId,tId)=>{const d=getDb(dId);return d?(d.tables||[]).find(t=>t.id===tId)||null:null;};
const getEnm=(dId,eId)=>{const d=getDb(dId);return d?(d.enums||[]).find(e=>e.id===eId)||null:null;};
function resetForm(t){t._fn='';t._ft='string';t._flen='';t._fnl=true;t._fai=false;t._fu=false;t._fdv='';t._fs=false;}
function keyBadgeClass(type){return type==='primary'?'badge-pk':type==='unique'?'badge-uq':type==='foreign'?'badge-fk':'badge-ix';}

// ── DB body auto-resize ───────────────────────────────────────
// Called after any child moves. Measures all children and expands/contracts
// the db-body so it always wraps them with BODY_PAD breathing room.
function resizeDbBody(db){
  const bodyEl=document.getElementById('db_body_'+db.id);
  if(!bodyEl)return;
  var maxRight=0,maxBottom=0;

  // Measure all children and cache their size on state for use in buildDb pre-sizing
  (db.tables||[]).forEach(function(t){
    var el=document.getElementById('tbl_'+t.id);
    if(el&&el.offsetWidth){t._w=el.offsetWidth;t._h=el.offsetHeight;}
    var w=t._w||580; var h=t._h||120;
    var l=t.x||BODY_PAD; var tp=t.y||BODY_PAD;
    if(l+w>maxRight)maxRight=l+w;
    if(tp+h>maxBottom)maxBottom=tp+h;
  });
  (db.enums||[]).forEach(function(en){
    var el=document.getElementById('enum_'+en.id);
    if(el&&el.offsetWidth){en._w=el.offsetWidth;en._h=el.offsetHeight;}
    var w=en._w||320; var h=en._h||300;
    var l=en.x||BODY_PAD; var tp=en.y||BODY_PAD;
    if(l+w>maxRight)maxRight=l+w;
    if(tp+h>maxBottom)maxBottom=tp+h;
  });

  bodyEl.style.width =Math.max(300, maxRight  + BODY_PAD)+'px';
  bodyEl.style.height=Math.max(100, maxBottom + BODY_PAD)+'px';

  // Push enum blocks down if they vertically overlap any table block
  var moved=false;
  (db.enums||[]).forEach(function(en){
    var enW=en._w||320; var enH=en._h||300;
    var enX=en.x||BODY_PAD; var enY=en.y||BODY_PAD;
    (db.tables||[]).forEach(function(t){
      var tW=t._w||580; var tH=t._h||120;
      var tX=t.x||BODY_PAD; var tY=t.y||BODY_PAD;
      // Check horizontal overlap
      var hOverlap=(enX < tX+tW) && (enX+enW > tX);
      // Check vertical overlap
      var vOverlap=(enY < tY+tH) && (enY+enH > tY);
      if(hOverlap && vOverlap){
        // Push enum below the table with BODY_PAD gap
        en.y=tY+tH+BODY_PAD;
        var enEl=document.getElementById('enum_'+en.id);
        if(enEl) enEl.style.top=en.y+'px';
        moved=true;
      }
    });
  });
  // If any enum moved, recalculate body size
  if(moved){
    var mr2=0,mb2=0;
    (db.tables||[]).forEach(function(t){
      var r=(t.x||BODY_PAD)+(t._w||580); var b=(t.y||BODY_PAD)+(t._h||120);
      if(r>mr2)mr2=r; if(b>mb2)mb2=b;
    });
    (db.enums||[]).forEach(function(en){
      var r=(en.x||BODY_PAD)+(en._w||320); var b=(en.y||BODY_PAD)+(en._h||300);
      if(r>mr2)mr2=r; if(b>mb2)mb2=b;
    });
    bodyEl.style.width =Math.max(300,mr2+BODY_PAD)+'px';
    bodyEl.style.height=Math.max(100,mb2+BODY_PAD)+'px';
  }
}

// ── Make table/enum header draggable INSIDE db-body ───────────
// Movement is clamped to x>=0, y>=0 so items stay inside the container.
// resizeDbBody() is called on every move to auto-expand/contract the parent.
function makeChildDraggable(handle,childEl,db,item){
  handle.addEventListener('pointerdown',e=>{
    if(e.button!==0||e.altKey)return;
    e.stopPropagation();
    handle.setPointerCapture(e.pointerId);
    childEl.classList.add('tbl-dragging');
    const startItemX=item.x||0;
    const startItemY=item.y||0;
    const startMouseX=e.clientX;
    const startMouseY=e.clientY;
    const onMove=ev=>{
      const dx=(ev.clientX-startMouseX)/S.zoom;
      const dy=(ev.clientY-startMouseY)/S.zoom;
      item.x=Math.max(BODY_PAD,startItemX+dx);
      item.y=Math.max(BODY_PAD,startItemY+dy);
      childEl.style.left=item.x+'px';
      childEl.style.top =item.y+'px';
      resizeDbBody(db);
      drawConnectors(db);
    };
    const onUp=()=>{
      childEl.classList.remove('tbl-dragging');
      handle.removeEventListener('pointermove',onMove);
      handle.removeEventListener('pointerup',onUp);
      handle.removeEventListener('pointercancel',onUp);
      resizeDbBody(db);
      drawConnectors(db);
    };
    handle.addEventListener('pointermove',onMove);
    handle.addEventListener('pointerup',onUp);
    handle.addEventListener('pointercancel',onUp);
  });
}

// ── Make db-block header draggable on the stage ───────────────
function makeDbDraggable(handle,db){
  handle.addEventListener('pointerdown',e=>{
    if(e.button!==0||e.altKey)return;
    e.stopPropagation();
    handle.setPointerCapture(e.pointerId);
    const sx=e.clientX,sy=e.clientY,ox=db.x,oy=db.y;
    const onMove=ev=>{
      db.x=ox+(ev.clientX-sx)/S.zoom;
      db.y=oy+(ev.clientY-sy)/S.zoom;
      const el=document.getElementById('db_'+db.id);
      if(el){el.style.left=db.x+'px';el.style.top=db.y+'px';}
    };
    const onUp=()=>{
      handle.removeEventListener('pointermove',onMove);
      handle.removeEventListener('pointerup',onUp);
      handle.removeEventListener('pointercancel',onUp);
    };
    handle.addEventListener('pointermove',onMove);
    handle.addEventListener('pointerup',onUp);
    handle.addEventListener('pointercancel',onUp);
  });
}

// ── Build database block ──────────────────────────────────────
function buildDb(db){
  const wrap2=document.createElement('div');
  wrap2.className='db-block';
  wrap2.id='db_'+db.id;
  wrap2.dataset.db=db.id;
  wrap2.style.left=db.x+'px';
  wrap2.style.top=db.y+'px';

  const hdr=document.createElement('div');
  hdr.className='db-header';

  // ── Inline-editable name ──────────────────────────────────
  // Clicking the name replaces it with an input. Blur/Enter commits.
  const nameSpan=document.createElement('span');
  nameSpan.className='db-header-name';
  nameSpan.title='Click to rename';
  nameSpan.textContent=db.name;
  nameSpan.addEventListener('pointerdown',e=>e.stopPropagation()); // don't start drag
  nameSpan.addEventListener('click',e=>{
    e.stopPropagation();
    const input=document.createElement('input');
    input.className='db-header-name-input';
    input.value=db.name;
    hdr.replaceChild(input,nameSpan);
    input.focus();
    input.select();
    const commit=()=>{
      const v=input.value.trim();
      if(v)db.name=v;
      render();
    };
    input.addEventListener('blur',commit);
    input.addEventListener('keydown',ev=>{
      if(ev.key==='Enter'){ev.preventDefault();commit();}
      if(ev.key==='Escape'){render();}
      ev.stopPropagation();
    });
    input.addEventListener('pointerdown',e=>e.stopPropagation());
  });
  hdr.appendChild(nameSpan);

  // ── Right side: auth checkbox + optional badge ────────────
  const right=document.createElement('div');
  right.className='db-header-right';

  const authLabel=document.createElement('label');
  authLabel.className='db-auth-check';
  authLabel.addEventListener('pointerdown',e=>e.stopPropagation());
  authLabel.addEventListener('click',e=>e.stopPropagation());
  const authChk=document.createElement('input');
  authChk.type='checkbox';
  authChk.checked=!!db.auth;
  authChk.addEventListener('change',e=>{
    e.stopPropagation();
    db.auth=authChk.checked;
    // update badge visibility without full re-render
    const badge=wrap2.querySelector('.db-auth-badge');
    if(badge)badge.style.display=db.auth?'':'none';
  });
  const authLbl=document.createElement('span');
  authLbl.className='db-auth-check-lbl';
  authLbl.textContent='Auth';
  authLabel.appendChild(authChk);
  authLabel.appendChild(authLbl);
  right.appendChild(authLabel);

  hdr.appendChild(right);
  makeDbDraggable(hdr,db);
  wrap2.appendChild(hdr);

  const body=document.createElement('div');
  body.className='db-body';
  body.id='db_body_'+db.id;

  (db.tables||[]).forEach(t=>body.appendChild(buildTable(db,t)));
  (db.enums||[]).forEach(e=>body.appendChild(buildEnum(db,e)));

  // Pre-size db-body using cached measurements from last render (or estimates for new items)
  var preMaxR=0,preMaxB=0;
  (db.tables||[]).forEach(function(t){
    var r=(t.x||BODY_PAD)+(t._w||580); var b=(t.y||BODY_PAD)+(t._h||120);
    if(r>preMaxR)preMaxR=r; if(b>preMaxB)preMaxB=b;
  });
  (db.enums||[]).forEach(function(en){
    var r=(en.x||BODY_PAD)+(en._w||320); var b=(en.y||BODY_PAD)+(en._h||300);
    if(r>preMaxR)preMaxR=r; if(b>preMaxB)preMaxB=b;
  });
  body.style.width =Math.max(300,preMaxR+BODY_PAD)+'px';
  body.style.height=Math.max(100,preMaxB+BODY_PAD)+'px';

  wrap2.appendChild(body);
  return wrap2;
}

// ── Build table block ─────────────────────────────────────────
function buildTable(db,t){
  const el=document.createElement('div');
  el.className='tbl-block';
  el.id='tbl_'+t.id;
  el.dataset.db=db.id;
  el.dataset.tbl=t.id;
  el.style.left=(t.x||0)+'px';
  el.style.top =(t.y||0)+'px';

  // ── Header ────────────────────────────────────────────────
  const hdr=document.createElement('div');
  hdr.className='tbl-header';

  // Inline-editable table name
  const nameSpan=document.createElement('span');
  nameSpan.className='tbl-header-name';
  nameSpan.title='Click to rename';
  nameSpan.textContent=t.name;
  nameSpan.addEventListener('pointerdown',e=>e.stopPropagation());
  nameSpan.addEventListener('click',e=>{
    e.stopPropagation();
    const inp=document.createElement('input');
    inp.className='tbl-header-name-input';
    inp.value=t.name;
    hdr.replaceChild(inp,nameSpan);
    inp.focus(); inp.select();
    const commit=()=>{const v=inp.value.trim();if(v)t.name=v;render();};
    inp.addEventListener('blur',commit);
    inp.addEventListener('keydown',ev=>{
      if(ev.key==='Enter'){ev.preventDefault();commit();}
      if(ev.key==='Escape'){render();}
      ev.stopPropagation();
    });
    inp.addEventListener('pointerdown',ev=>ev.stopPropagation());
  });
  hdr.appendChild(nameSpan);

  // Spacer pushes checks + actions to the right
  const spacer=document.createElement('div');
  spacer.className='tbl-header-spacer';
  hdr.appendChild(spacer);

  // Timestamps + SoftDelete checkboxes
  const checks=document.createElement('div');
  checks.className='tbl-header-checks';
  [['ts','Timestamps',!!t.timestamps,function(v){t.timestamps=v;}],
   ['sd','Soft Del',!!t.softDelete,function(v){t.softDelete=v;}]
  ].forEach(function(row){
    var lbl=row[1],checked=row[2],setter=row[3];
    const wrap3=document.createElement('label');
    wrap3.className='tbl-hdr-chk';
    wrap3.addEventListener('pointerdown',e=>e.stopPropagation());
    wrap3.addEventListener('click',e=>e.stopPropagation());
    const chk=document.createElement('input');
    chk.type='checkbox'; chk.checked=checked;
    chk.addEventListener('change',e=>{e.stopPropagation();setter(chk.checked);});
    const span=document.createElement('span');
    span.className='tbl-hdr-chk-lbl';
    span.textContent=lbl;
    wrap3.appendChild(chk); wrap3.appendChild(span);
    checks.appendChild(wrap3);
  });
  hdr.appendChild(checks);

  // Action buttons: Add Column, Add Key, Delete Table
  const actions=document.createElement('div');
  actions.className='tbl-header-actions';

  // Add Column button
  const btnAddCol=document.createElement('div');
  btnAddCol.className='tbl-hdr-btn';
  btnAddCol.title='Add Column';
  btnAddCol.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
  btnAddCol.addEventListener('pointerdown',e=>e.stopPropagation());
  btnAddCol.addEventListener('click',e=>{e.stopPropagation();t._formOpen=true;render();});
  actions.appendChild(btnAddCol);

  // Add Key button
  const btnAddKey=document.createElement('div');
  btnAddKey.className='tbl-hdr-btn';
  btnAddKey.title='Add Key';
  btnAddKey.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>';
  btnAddKey.addEventListener('pointerdown',e=>e.stopPropagation());
  btnAddKey.addEventListener('click',e=>{e.stopPropagation();openKeyModal(db.id,t.id);});
  actions.appendChild(btnAddKey);

  // Delete Table button
  const btnDel=document.createElement('div');
  btnDel.className='tbl-hdr-btn danger';
  btnDel.title='Delete Table';
  btnDel.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';
  btnDel.addEventListener('pointerdown',e=>e.stopPropagation());
  btnDel.addEventListener('click',e=>{
    e.stopPropagation();
    db.tables=(db.tables||[]).filter(x=>x.id!==t.id);
    render();
  });
  actions.appendChild(btnDel);

  hdr.appendChild(actions);
  el.appendChild(hdr);
  makeChildDraggable(hdr,el,db,t);

  // Helper: get the dynamic 4th column label and value based on type
  function col4Label(type){
    if(type==='integer'||type==='bigint'||type==='smallint'||type==='tinyint') return 'AutoInc';
    if(type==='boolean') return 'Default';
    return 'Unique';
  }
  function col4Value(col){
    var tp=col.type||'';
    if(tp==='integer'||tp==='bigint'||tp==='smallint'||tp==='tinyint') return col.autoIncrement?'true':'false';
    if(tp==='boolean') return col.defaultValue||'false';
    return col.unique?'true':'false';
  }
  function col4On(col){
    var tp=col.type||'';
    if(tp==='integer'||tp==='bigint'||tp==='smallint'||tp==='tinyint') return !!col.autoIncrement;
    if(tp==='boolean') return !!(col.defaultValue);
    return !!col.unique;
  }

  // Each column gets its own header row + data row
  (t.columns||[]).forEach(function(col){
    // Per-column sub-header
    var hdrRow=document.createElement('div');
    hdrRow.className='tbl-col-header';
    hdrRow.innerHTML=
      '<span style="width:130px;flex-shrink:0">Name</span>'+
      '<span style="width:80px;flex-shrink:0">Type</span>'+
      '<span style="width:56px;flex-shrink:0">Length</span>'+
      '<span style="width:64px;flex-shrink:0">'+col4Label(col.type)+'</span>'+
      '<span style="width:64px;flex-shrink:0">Nullable</span>'+
      '<span style="width:64px;flex-shrink:0">Search</span>';
    el.appendChild(hdrRow);

    // Column data row
    var row=document.createElement('div');
    row.className='tbl-col';
    row.dataset.col=col.id;
    var v4=col4Value(col);
    var on4=col4On(col);
    // Find key assigned to this column
    var colKey=null;
    (t.keys||[]).forEach(function(k){
      if((k.columns||[]).indexOf(col.name)>-1){ colKey=k.type; }
    });
    var dotHtml='';
    if(colKey==='primary')   dotHtml='<span class="col-key-dot pk" title="Primary Key"></span>';
    else if(colKey==='unique')  dotHtml='<span class="col-key-dot uq" title="Unique"></span>';
    else if(colKey==='foreign') dotHtml='<span class="col-key-dot fk" title="Foreign Key"></span>';
    else if(colKey==='index')   dotHtml='<span class="col-key-dot ix" title="Index"></span>';
    else if(col.type==='enum')  dotHtml='<span class="col-key-dot en" title="Enum"></span>';
    row.innerHTML=
      '<span class="tbl-cell-name">'+esc(col.name)+'</span>'+
      '<span class="tbl-cell-type">'+esc(col.type)+'</span>'+
      '<span class="tbl-cell-len">'+esc(col.length||'')+'</span>'+
      '<span class="tbl-cell-attr'+(on4?' on':'')+'">'+esc(v4)+'</span>'+
      '<span class="tbl-cell-attr'+(col.nullable?' on':'')+'">'+( col.nullable?'true':'false')+'</span>'+
      '<span class="tbl-cell-attr'+(col.searchable?' on':'')+'">'+( col.searchable?'true':'false')+'</span>'+
      dotHtml;
    row.addEventListener('click',function(){openColForm(db.id,t.id,col.id);});
    el.appendChild(row);
  });

  if(t._formOpen){
    const form=document.createElement('div');
    form.className='col-form';
    const isEdit=!!t._editingColId;
    const tid=t.id;

    var typeOpts=['integer','bigint','smallint','tinyint','string','varchar','char','text','mediumtext',
      'decimal','float','double','boolean','date','datetime','timestamp','time','year',
      'json','uuid','binary','blob','enum'].map(function(tp){
      return '<option value="'+tp+'"'+(t._ft===tp?' selected':'')+'>'+tp+'</option>';
    }).join('');

    // Dynamic 4th field label based on type
    var curType=t._ft||'string';
    function getDyn4Label(tp){
      if(tp==='integer'||tp==='bigint'||tp==='smallint'||tp==='tinyint') return 'AutoInc';
      if(tp==='boolean') return 'Default';
      return 'Unique';
    }
    function getDyn4Checked(tp){
      if(tp==='integer'||tp==='bigint'||tp==='smallint'||tp==='tinyint') return !!t._fai;
      if(tp==='boolean') return !!(t._fdv);
      return !!t._fu;
    }

    // Build form via DOM so makeSelect works
    var fcnInp=document.createElement('input');
    fcnInp.type='text'; fcnInp.id='fcn_'+tid; fcnInp.className='col-form-inp col-form-name';
    fcnInp.placeholder='Name'; fcnInp.value=esc(t._fn||'');
    form.appendChild(fcnInp);

    var typeList=['integer','bigint','smallint','tinyint','string','varchar','char','text','mediumtext',
      'decimal','float','double','boolean','date','datetime','timestamp','time','year',
      'json','uuid','binary','blob','enum'];
    var fctSel=makeSelect('fct_'+tid,typeList,curType,function(v){
      t._ft=v; updateDyn4(v);
    },'col-form-inp col-form-type');
    form.appendChild(fctSel);

    var fclenInp=document.createElement('input');
    fclenInp.type='text'; fclenInp.id='fclen_'+tid; fclenInp.className='col-form-inp col-form-len';
    fclenInp.placeholder='0'; fclenInp.value=esc(t._flen||'');
    form.appendChild(fclenInp);

    var dyn4Label=document.createElement('label');
    dyn4Label.className='col-form-chk-wrap'; dyn4Label.id='fcdyn4wrap_'+tid;
    var dyn4Chk=document.createElement('input'); dyn4Chk.type='checkbox'; dyn4Chk.id='fcdyn4_'+tid;
    dyn4Chk.checked=getDyn4Checked(curType);
    var dyn4Span=document.createElement('span'); dyn4Span.className='col-form-chk-lbl'; dyn4Span.id='fcdyn4lbl_'+tid;
    dyn4Span.textContent=getDyn4Label(curType);
    dyn4Label.appendChild(dyn4Chk); dyn4Label.appendChild(dyn4Span); form.appendChild(dyn4Label);

    var nlLabel=document.createElement('label'); nlLabel.className='col-form-chk-wrap';
    var nlChk=document.createElement('input'); nlChk.type='checkbox'; nlChk.id='fcnl_'+tid; nlChk.checked=!!t._fnl;
    var nlSpan=document.createElement('span'); nlSpan.className='col-form-chk-lbl'; nlSpan.textContent='Nullable';
    nlLabel.appendChild(nlChk); nlLabel.appendChild(nlSpan); form.appendChild(nlLabel);

    var srLabel=document.createElement('label'); srLabel.className='col-form-chk-wrap';
    var srChk=document.createElement('input'); srChk.type='checkbox'; srChk.id='fcs_'+tid; srChk.checked=!!t._fs;
    var srSpan=document.createElement('span'); srSpan.className='col-form-chk-lbl'; srSpan.textContent='Search';
    srLabel.appendChild(srChk); srLabel.appendChild(srSpan); form.appendChild(srLabel);

    var saveBtn2=document.createElement('button'); saveBtn2.className='col-form-save'; saveBtn2.id='fcsave_'+tid;
    saveBtn2.textContent=isEdit?'Update':'Save'; form.appendChild(saveBtn2);
    var cancelBtn=document.createElement('button'); cancelBtn.className='col-form-cancel'; cancelBtn.id='fcclose_'+tid;
    cancelBtn.textContent='Cancel'; form.appendChild(cancelBtn);

    el.appendChild(form);

    var fq=function(sel){return form.querySelector(sel);};
    var bindQ=function(sel,key,evtype){
      var el2=fq(sel);if(!el2)return;
      el2.addEventListener(evtype==='cb'?'change':'input',function(ev){
        t[key]=evtype==='cb'?ev.target.checked:ev.target.value;
      });
    };
    bindQ('#fcn_'+tid,'_fn','text');
    bindQ('#fclen_'+tid,'_flen','text');
    bindQ('#fcnl_'+tid,'_fnl','cb');
    bindQ('#fcs_'+tid,'_fs','cb');

    // updateDyn4 — called by makeSelect onChange and also here for init
    var dyn4El=fq('#fcdyn4_'+tid);
    var dyn4Lbl=fq('#fcdyn4lbl_'+tid);
    function updateDyn4(tp){
      if(dyn4Lbl) dyn4Lbl.textContent=getDyn4Label(tp);
      if(dyn4El){
        if(tp==='integer'||tp==='bigint'||tp==='smallint'||tp==='tinyint') dyn4El.checked=!!t._fai;
        else if(tp==='boolean') dyn4El.checked=!!(t._fdv);
        else dyn4El.checked=!!t._fu;
      }
    }
    // 4th checkbox change
    if(dyn4El) dyn4El.addEventListener('change',function(){
      var tp=fctSel.getValue()||'string';
      if(tp==='integer'||tp==='bigint'||tp==='smallint'||tp==='tinyint') t._fai=dyn4El.checked;
      else if(tp==='boolean') t._fdv=dyn4El.checked?'true':'';
      else t._fu=dyn4El.checked;
    });

    var saveBtn=fq('#fcsave_'+tid);
    if(saveBtn) saveBtn.addEventListener('click',function(){saveCol(db.id,t.id);});
    var closeBtn=fq('#fcclose_'+tid);
    if(closeBtn) closeBtn.addEventListener('click',function(){t._formOpen=false;t._editingColId=null;resetForm(t);render();});
    var delBtn=fq('#fcdel_'+tid);
    if(delBtn) delBtn.addEventListener('click',function(){
      t.columns=(t.columns||[]).filter(function(c){return c.id!==t._editingColId;});
      t._formOpen=false;t._editingColId=null;resetForm(t);render();
    });
  }

  // ── Key panel — triggered by header key icon ──────────────────
  if(t._keyFormOpen){
    const kpanel=document.createElement('div');
    kpanel.className='key-panel';

    // Panel title row
    var colSelectOpts=(t.columns||[]).map(function(c){
      return '<option value="'+esc(c.name)+'"'+((t._kCols||[]).includes(c.name)?' selected':'')+'>'+esc(c.name)+'</option>';
    }).join('');

    // Build key panel via DOM
    var kpTitle=document.createElement('div'); kpTitle.className='key-panel-title';
    var kpTitleSpan=document.createElement('span'); kpTitleSpan.textContent='Keys for “'+t.name+'”';
    var kpClose=document.createElement('span'); kpClose.className='key-panel-close'; kpClose.id='kpclose_'+t.id; kpClose.textContent='✕';
    kpTitle.appendChild(kpTitleSpan); kpTitle.appendChild(kpClose); kpanel.appendChild(kpTitle);

    // Saved key rows
    (t.keys||[]).forEach(function(k){
      var bc=k.type==='primary'?'#cb8813':k.type==='unique'?'#31bdbd':k.type==='foreign'?'#38BDF8':'#5a95ae';
      var cols=(k.columns||[]).join(', ');
      var kr=document.createElement('div'); kr.className='key-saved-row';
      kr.innerHTML='<span class="key-saved-name">'+esc(k.name||k.type)+'</span>'+
        '<span class="key-saved-badge" style="background:'+bc+'">'+esc(k.type)+'</span>'+
        '<span class="key-saved-cols">['+esc(cols)+']'+(k.refTable?' &rarr; '+esc(k.refTable+'.'+k.refColumn):'')+'</span>'+
        '<span class="key-saved-del" data-kid="'+k.id+'">✕</span>';
      kpanel.appendChild(kr);
    });

    // Add key form
    var kAddForm=document.createElement('div'); kAddForm.className='key-add-form'; kAddForm.id='kaddform_'+t.id;

    var kRow2=document.createElement('div'); kRow2.className='key-add-row2';
    // Key Name
    var kNameField=document.createElement('div'); kNameField.className='key-add-field';
    var kNameLbl=document.createElement('div'); kNameLbl.className='key-form-lbl'; kNameLbl.textContent='Key Name';
    var kNameInp=document.createElement('input'); kNameInp.type='text'; kNameInp.id='kname_'+t.id;
    kNameInp.className='key-add-inp'; kNameInp.value=esc(t._kName||''); kNameInp.placeholder='e.g. pk_users';
    kNameField.appendChild(kNameLbl); kNameField.appendChild(kNameInp); kRow2.appendChild(kNameField);
    // Type select
    var kTypeField=document.createElement('div'); kTypeField.className='key-add-field';
    var kTypeLbl=document.createElement('div'); kTypeLbl.className='key-form-lbl'; kTypeLbl.textContent='Type';
    var kFkSec=document.createElement('div'); kFkSec.className='key-form-fk-section'; kFkSec.id='kfksec_'+t.id;
    kFkSec.style.display=t._kType==='foreign'?'flex':'none';
    var kTypeSel=makeSelect('ktype_'+t.id,['primary','unique','foreign','index'],t._kType||'primary',function(v){
      t._kType=v;
      kFkSec.style.display=v==='foreign'?'flex':'none';
    },'key-add-inp');
    kTypeField.appendChild(kTypeLbl); kTypeField.appendChild(kTypeSel); kRow2.appendChild(kTypeField);
    kAddForm.appendChild(kRow2);

    // Columns select
    var kColField=document.createElement('div'); kColField.className='key-add-field'; kColField.style.marginTop='8px';
    var kColLbl=document.createElement('div'); kColLbl.className='key-form-lbl'; kColLbl.textContent='Columns';
    var colNames=(t.columns||[]).map(function(c){return c.name;});
    var kColSel2;
    if(colNames.length){
      kColSel2=makeSelect('kcolsel_'+t.id,colNames,t._kCols&&t._kCols[0]||colNames[0],function(v){t._kCols=[v];},'key-add-inp');
    } else {
      kColSel2=document.createElement('div'); kColSel2.className='key-add-inp csel-val'; kColSel2.textContent='-- Add columns first --';
    }
    kColField.appendChild(kColLbl); kColField.appendChild(kColSel2); kAddForm.appendChild(kColField);

    // FK section
    kFkSec.innerHTML=
      '<div class="key-form-fk-title">&#8594; Foreign Key Reference</div>'+
      '<div class="key-form-row-2">'+
        '<div class="key-form-row"><div class="key-form-lbl">Ref Table</div><input type="text" id="kreftbl_'+t.id+'" class="key-add-inp" value="'+esc(t._kRefTable||'')+'" placeholder="e.g. users"/></div>'+
        '<div class="key-form-row"><div class="key-form-lbl">Ref Column</div><input type="text" id="krefcol_'+t.id+'" class="key-add-inp" value="'+esc(t._kRefCol||'')+'" placeholder="e.g. id"/></div>'+
      '</div>';

    // On Delete / On Update custom selects — appended after innerHTML
    var odField=document.createElement('div'); odField.className='key-form-row';
    var odLbl=document.createElement('div'); odLbl.className='key-form-lbl'; odLbl.textContent='On Delete';
    var odSel=makeSelect('kondel_'+t.id,['RESTRICT','CASCADE','SET NULL','SET DEFAULT','NO ACTION'],t._kOnDel||'RESTRICT',function(v){t._kOnDel=v;},'key-add-inp');
    odField.appendChild(odLbl); odField.appendChild(odSel); kFkSec.appendChild(odField);
    var ouField=document.createElement('div'); ouField.className='key-form-row';
    var ouLbl=document.createElement('div'); ouLbl.className='key-form-lbl'; ouLbl.textContent='On Update';
    var ouSel=makeSelect('konupd_'+t.id,['RESTRICT','CASCADE','SET NULL','SET DEFAULT','NO ACTION'],t._kOnUpd||'RESTRICT',function(v){t._kOnUpd=v;},'key-add-inp');
    ouField.appendChild(ouLbl); ouField.appendChild(ouSel); kFkSec.appendChild(ouField);
    kAddForm.appendChild(kFkSec);

    // Add Key button
    var kAddBtn=document.createElement('button'); kAddBtn.className='key-add-btn'; kAddBtn.id='kfsave_'+t.id; kAddBtn.textContent='+ Add Key';
    kAddForm.appendChild(kAddBtn);
    kpanel.appendChild(kAddForm);
    el.appendChild(kpanel);

    // Wire up — no setTimeout needed, all DOM refs are direct
    kpClose.addEventListener('click',function(){t._keyFormOpen=false;resetKeyForm(t);render();});
    kNameInp.addEventListener('input',function(){t._kName=kNameInp.value;});

    // Save key — read values directly from DOM refs (no getElementById needed)
    kAddBtn.addEventListener('click',function(){
      var selColName=kColSel2&&kColSel2.getValue?kColSel2.getValue():'';
      var type=t._kType||'primary';
      var kname=(t._kName||'').trim()||(type+'_'+t.name);
      var rte=document.getElementById('kreftbl_'+t.id); var refTable=rte?rte.value:'';
      var rce=document.getElementById('krefcol_'+t.id); var refColumn=rce?rce.value:'';
      var onDelete=t._kOnDel||'RESTRICT';
      var onUpdate=t._kOnUpd||'RESTRICT';
      if(!t.keys)t.keys=[];
      t.keys.push({id:uid(),name:kname,type:type,columns:selColName?[selColName]:[],refTable:refTable,refColumn:refColumn,onDelete:onDelete,onUpdate:onUpdate});
      t._kName=''; t._kCols=[];
      render();
    });

    kpanel.querySelectorAll('.key-saved-del').forEach(function(btn){
      btn.addEventListener('click',function(){delKey(db.id,t.id,btn.dataset.kid);});
    });

    var rtEl=document.getElementById('kreftbl_'+t.id); var rcEl=document.getElementById('krefcol_'+t.id);
    if(rtEl) rtEl.addEventListener('input',function(){t._kRefTable=rtEl.value;});
    if(rcEl) rcEl.addEventListener('input',function(){t._kRefCol=rcEl.value;});
  }

  // Show saved keys inline (when panel closed) with + Add Key link
  if(!t._keyFormOpen){
    (t.keys||[]).forEach(function(k){
      var kr=document.createElement('div');
      kr.className='key-row';
      var bc=k.type==='primary'?'#cb8813':k.type==='unique'?'#31bdbd':k.type==='foreign'?'#38BDF8':'#5a95ae';
      var cols=(k.columns||[]).join(', ');
      kr.innerHTML=
        '<span class="key-saved-name">'+esc(k.name||k.type)+'</span>'+
        '<span class="key-saved-badge" style="background:'+bc+'">'+esc(k.type)+'</span>'+
        '<span class="key-saved-cols">['+esc(cols)+']'+(k.refTable?' &rarr; '+esc(k.refTable+'.'+k.refColumn):'')+'</span>'+
        '<span class="key-saved-del" data-kid="'+k.id+'">&#x2715;</span>';
      el.appendChild(kr);
    });

    setTimeout(function(){
      el.querySelectorAll('.key-saved-del').forEach(function(btn){
        btn.addEventListener('click',function(){delKey(db.id,t.id,btn.dataset.kid);});
      });
    },0);
  }

  return el;
}

// ── Build enum block ──────────────────────────────────────────
function buildEnum(db,en){
  var el=document.createElement('div');
  el.className='enum-block';
  el.id='enum_'+en.id;
  el.dataset.db=db.id;
  el.dataset.enum=en.id;
  el.style.left=(en.x||0)+'px';
  el.style.top =(en.y||0)+'px';

  // ── Header ────────────────────────────────────────────────
  var hdr=document.createElement('div');
  hdr.className='enum-header';

  var nameSpan=document.createElement('span');
  nameSpan.className='enum-header-name';
  nameSpan.textContent=en.saved?esc(en.name):'ENUM: new';
  hdr.appendChild(nameSpan);

  var actions=document.createElement('div');
  actions.className='enum-header-actions';

  // Edit button (shown in saved mode)
  if(en.saved){
    var btnEdit=document.createElement('div');
    btnEdit.className='enum-hdr-btn'; btnEdit.title='Edit';
    btnEdit.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
    btnEdit.addEventListener('pointerdown',function(e){e.stopPropagation();});
    btnEdit.addEventListener('click',function(e){
      e.stopPropagation();
      en.saved=false;
      render();
    });
    actions.appendChild(btnEdit);
  }

  var btnDel=document.createElement('div');
  btnDel.className='enum-hdr-btn danger'; btnDel.title='Delete Enum';
  btnDel.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';
  btnDel.addEventListener('pointerdown',function(e){e.stopPropagation();});
  btnDel.addEventListener('click',function(e){
    e.stopPropagation();
    db.enums=(db.enums||[]).filter(function(x){return x.id!==en.id;});
    render();
  });
  actions.appendChild(btnDel);
  hdr.appendChild(actions);
  el.appendChild(hdr);
  makeChildDraggable(hdr,el,db,en);

  // ── SAVED DISPLAY MODE ────────────────────────────────────
  if(en.saved){
    // Linked info bar
    var infoBar=document.createElement('div');
    infoBar.className='enum-linked-info';
    var tbl=(db.tables||[]).find(function(t){return t.id===en.linkedTable;});
    var col=tbl&&(tbl.columns||[]).find(function(c){return c.id===en.linkedColumn;});
    if(tbl&&col){
      infoBar.innerHTML='<span style="color:#38BDF8;font-size:9px;text-transform:uppercase;letter-spacing:.4px">Linked:</span>'+
        '<span class="enum-linked-badge">'+esc(tbl.name)+'</span>'+
        '<span style="color:#38BDF8">.</span>'+
        '<span class="enum-linked-badge">'+esc(col.name)+'</span>';
    }
    el.appendChild(infoBar);

    // Column header
    var colHdr=document.createElement('div');
    colHdr.className='enum-col-hdr';
    colHdr.innerHTML=
      '<span class="enum-col-hdr-cell" style="flex:1">Value</span>'+
      '<span class="enum-col-hdr-cell" style="width:40px;text-align:center">Default</span>'+
      '<span style="width:18px"></span>';
    el.appendChild(colHdr);

    // Value rows
    (en.values||[]).forEach(function(v){
      var row=document.createElement('div');
      row.className='enum-val';
      row.innerHTML=
        '<span class="enum-val-dot" style="margin-right:8px;margin-left:0"></span>'+
        '<span style="flex:1;font-family:monospace;font-size:12px;color:#bae6fd">'+esc(v.value)+'</span>'+
        '<span class="enum-val-tick" style="width:40px;text-align:center">'+(v.isDefault?'&#x2713;':'')+'</span>';
      el.appendChild(row);
    });
    return el;
  }

  // ── EDIT MODE ─────────────────────────────────────────────
  var form=document.createElement('div');
  form.className='enum-form';
  form.addEventListener('pointerdown',function(e){e.stopPropagation();});

  // Table dropdown
  var tblField=document.createElement('div');
  var tblLbl=document.createElement('div'); tblLbl.className='enum-form-lbl'; tblLbl.textContent='Table';
  var tblNames=(db.tables||[]).map(function(t){return{value:t.id,label:t.name};});
  var curTblId=en.linkedTable||(tblNames.length?tblNames[0].value:'');
  var tblSel=makeSelect('etbl_'+en.id,tblNames,curTblId,function(v){
    en.linkedTable=v;
    en.linkedColumn='';
    // Rebuild column dropdown
    var colSelEl=document.getElementById('ecol_'+en.id);
    if(colSelEl){
      var t2=(db.tables||[]).find(function(t){return t.id===v;});
      var enumCols=t2?(t2.columns||[]).filter(function(c){return c.type==='enum';}).map(function(c){return{value:c.id,label:c.name};}):[];
      if(colSelEl.setValue&&enumCols.length) colSelEl.setValue(enumCols[0].value);
    }
  },'enum-form-inp');
  tblField.appendChild(tblLbl); tblField.appendChild(tblSel); form.appendChild(tblField);

  // Column dropdown (enum-type columns only)
  var colField=document.createElement('div');
  var colLbl=document.createElement('div'); colLbl.className='enum-form-lbl'; colLbl.textContent='Column (enum type)';
  var curTbl=(db.tables||[]).find(function(t){return t.id===curTblId;});
  var enumCols=curTbl?(curTbl.columns||[]).filter(function(c){return c.type==='enum';}).map(function(c){return{value:c.id,label:c.name};}):[{value:'',label:'-- No enum columns --'}];
  var curColId=en.linkedColumn||(enumCols.length?enumCols[0].value:'');
  var colSel=makeSelect('ecol_'+en.id,enumCols.length?enumCols:[{value:'',label:'-- No enum columns --'}],curColId,function(v){
    en.linkedColumn=v;
  },'enum-form-inp');
  colField.appendChild(colLbl); colField.appendChild(colSel); form.appendChild(colField);

  // Values list
  var valsLbl=document.createElement('div'); valsLbl.className='enum-form-lbl'; valsLbl.textContent='Values';
  form.appendChild(valsLbl);

  var valsList=document.createElement('div');
  valsList.id='evlist_'+en.id;
  if(!en.values)en.values=[];

  function rebuildValsList(){
    valsList.innerHTML='';
    en.values.forEach(function(v){
      var row=document.createElement('div');
      row.className='enum-val-entry';

      // Radio for default
      var toggle=document.createElement('label');
      toggle.className='enum-val-default-toggle';
      toggle.title='Set as default';
      var radio=document.createElement('input');
      radio.type='radio';
      radio.name='enumdef_'+en.id;
      radio.checked=!!v.isDefault;
      radio.addEventListener('change',function(){
        en.values.forEach(function(x){x.isDefault=false;});
        v.isDefault=true;
        rebuildValsList();
      });
      toggle.appendChild(radio);
      row.appendChild(toggle);

      // Value text (inline editable)
      var nameSpn=document.createElement('span');
      nameSpn.className='enum-val-entry-name';
      nameSpn.textContent=v.value;
      nameSpn.title='Click to edit';
      nameSpn.style.cursor='text';
      nameSpn.addEventListener('click',function(){
        var inp=document.createElement('input');
        inp.className='enum-form-inp';
        inp.style.flex='1';
        inp.value=v.value;
        row.replaceChild(inp,nameSpn);
        inp.focus(); inp.select();
        var commit=function(){var val=inp.value.trim();if(val)v.value=val;rebuildValsList();};
        inp.addEventListener('blur',commit);
        inp.addEventListener('keydown',function(ev){
          if(ev.key==='Enter'){ev.preventDefault();commit();}
          if(ev.key==='Escape'){rebuildValsList();}
        });
      });
      row.appendChild(nameSpn);

      // Delete
      var del=document.createElement('span');
      del.className='enum-val-entry-del';
      del.textContent='✕';
      del.addEventListener('click',function(){
        en.values=en.values.filter(function(x){return x.id!==v.id;});
        if(v.isDefault&&en.values.length) en.values[0].isDefault=true;
        rebuildValsList();
      });
      row.appendChild(del);
      valsList.appendChild(row);
    });
  }
  rebuildValsList();
  form.appendChild(valsList);

  // Add value link
  var addLink=document.createElement('div');
  addLink.className='enum-form-add-link';
  addLink.innerHTML='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Value';
  addLink.addEventListener('click',function(){
    var isFirst=en.values.length===0;
    en.values.push({id:uid(),value:'value_'+(en.values.length+1),isDefault:isFirst});
    rebuildValsList();
    resizeDbBody(db);
  });
  form.appendChild(addLink);

  // Save button
  var saveBtn=document.createElement('button');
  saveBtn.className='enum-form-save';
  saveBtn.textContent='Save';
  saveBtn.addEventListener('click',function(){
    var tblId=tblSel.getValue();
    var colId=colSel.getValue();
    if(!tblId||!colId)return;
    var t=(db.tables||[]).find(function(x){return x.id===tblId;});
    var c=t&&(t.columns||[]).find(function(x){return x.id===colId;});
    if(!t||!c)return;
    en.linkedTable=tblId;
    en.linkedColumn=colId;
    en.name=t.name+'_'+c.name;
    en.saved=true;
    c.enumId=en.id;
    render();
  });
  form.appendChild(saveBtn);
  el.appendChild(form);

  return el;
}

// ── Full render ───────────────────────────────────────────────
// ── Draw connector lines between FK columns and PK targets, enum cols and enum blocks ──
function drawConnectors(db){
  var bodyEl=document.getElementById('db_body_'+db.id);
  if(!bodyEl)return;

  // Remove existing SVG overlay
  var existing=bodyEl.querySelector('.db-connectors');
  if(existing)existing.parentNode.removeChild(existing);

  var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','db-connectors');
  svg.style.width=bodyEl.offsetWidth+'px';
  svg.style.height=bodyEl.offsetHeight+'px';

  var zoom=S.zoom||1;
  function getBodyRc(){return bodyEl.getBoundingClientRect();}

  function getDotPos(dotEl){
    if(!dotEl)return null;
    var rc=dotEl.getBoundingClientRect();
    var br=getBodyRc();
    return{
      x:(rc.left-br.left+rc.width/2)/zoom,
      y:(rc.top -br.top +rc.height/2)/zoom
    };
  }

  function makeLine(x1,y1,x2,y2,color,dots){
    var path=document.createElementNS('http://www.w3.org/2000/svg','line');
    path.setAttribute('x1',x1); path.setAttribute('y1',y1);
    path.setAttribute('x2',x2); path.setAttribute('y2',y2);
    path.setAttribute('stroke',color);
    path.setAttribute('stroke-width','1.5');
    path.setAttribute('stroke-dasharray','4 3');
    path.setAttribute('opacity','0.7');
    svg.appendChild(path);
    if(dots){
      [['x1','y1'],['x2','y2']].forEach(function(pair){
        var cx=path.getAttribute(pair[0]);
        var cy=path.getAttribute(pair[1]);
        var c=document.createElementNS('http://www.w3.org/2000/svg','circle');
        c.setAttribute('cx',cx); c.setAttribute('cy',cy);
        c.setAttribute('r','4');
        c.setAttribute('fill',color);
        c.setAttribute('opacity','0.9');
        svg.appendChild(c);
      });
    }
  }

  // ── FK connections ─────────────────────────────────────────
  (db.tables||[]).forEach(function(t){
    (t.keys||[]).forEach(function(k){
      if(k.type!=='foreign'||!k.refTable||!k.columns||!k.columns.length)return;
      // Find source dot: the FK column row dot in this table
      var tblEl=document.getElementById('tbl_'+t.id);
      if(!tblEl)return;
      var srcDot=null;
      tblEl.querySelectorAll('.col-key-dot.fk').forEach(function(d){
        // Match by checking the column row it belongs to
        var colRow=d.closest('[data-col]');
        if(colRow){
          var colId=colRow.dataset.col;
          var col=(t.columns||[]).find(function(c){return c.id===colId;});
          if(col&&k.columns.indexOf(col.name)>-1) srcDot=d;
        }
      });
      if(!srcDot)return;
      // Find target: PK dot on the referenced table
      var tgtDot=null;
      (db.tables||[]).forEach(function(rt){
        if(rt.name!==k.refTable)return;
        var rtEl=document.getElementById('tbl_'+rt.id);
        if(!rtEl)return;
        var pkDot=rtEl.querySelector('.col-key-dot.pk');
        if(pkDot) tgtDot=pkDot;
      });
      if(!tgtDot)return;
      var p1=getDotPos(srcDot);
      var p2=getDotPos(tgtDot);
      if(p1&&p2) makeLine(p1.x,p1.y,p2.x,p2.y,'#38BDF8');
    });
  });

  // ── Enum connections ───────────────────────────────────────
  (db.enums||[]).forEach(function(en){
    if(!en.saved||!en.linkedTable||!en.linkedColumn)return;
    var tblEl=document.getElementById('tbl_'+en.linkedTable);
    if(!tblEl)return;
    var colRow=tblEl.querySelector('[data-col="'+en.linkedColumn+'"]');
    if(!colRow)return;
    // p1: exact centre of the .en dot on this column row — same method as FK connector
    var enumDot=colRow.querySelector('.col-key-dot.en');
    var p1=getDotPos(enumDot);
    if(!p1)return;
    // p2: top-centre of enum block header
    var enumEl=document.getElementById('enum_'+en.id);
    if(!enumEl)return;
    var enumHdr=enumEl.querySelector('.enum-header');
    var enumRc=(enumHdr||enumEl).getBoundingClientRect();
    var br2=getBodyRc();
    var p2={x:(enumRc.left-br2.left+enumRc.width/2)/zoom, y:(enumRc.top-br2.top+enumRc.height/2)/zoom};
    // p1 already has an HTML .en dot — only draw SVG circle at p2 (enum header centre)
    makeLine(p1.x,p1.y,p2.x,p2.y,'#67a270',false);
    var c2=document.createElementNS('http://www.w3.org/2000/svg','circle');
    c2.setAttribute('cx',p2.x); c2.setAttribute('cy',p2.y);
    c2.setAttribute('r','4'); c2.setAttribute('fill','#67a270'); c2.setAttribute('opacity','0.9');
    svg.appendChild(c2);
  });

  if(svg.children.length>0) bodyEl.appendChild(svg);
}

function render(){
  stage.innerHTML='';
  S.dbs.forEach(db=>stage.appendChild(buildDb(db)));
  const n=S.dbs.length;
  statusLbl.textContent=n+' database'+(n!==1?'s':'');
  statusLbl.classList.toggle('has-data',n>0);
  hint.classList.toggle('hidden',n>0);

  // ── Disable Export buttons when no tables exist on canvas ────
  var hasTables=S.dbs.some(function(d){return (d.tables||[]).length>0;});
  var btnExp=document.getElementById('btnExport');
  var btnExpDb=document.getElementById('btnExportDb');
  var expArr=document.getElementById('exportDbArrow');
  if(btnExp){
    btnExp.disabled=!hasTables;
    btnExp.classList.toggle('tbtn-disabled',!hasTables);
    btnExp.style.pointerEvents=hasTables?'':'none';
    btnExp.title=hasTables?'':'Add a table to a database first';
  }
  if(btnExpDb){
    btnExpDb.classList.toggle('export-db-disabled',!hasTables);
    btnExpDb.style.pointerEvents=hasTables?'':'none';
    btnExpDb.title=hasTables?'':'Add a table to a database first';
  }
  if(expArr){
    expArr.style.pointerEvents=hasTables?'':'none';
  }

  applyXform();
  // Broadcast schema state to the Database panel sidebar
  try{
    vscodeApi && vscodeApi.postMessage({command:'broadcastSchema',state:JSON.parse(JSON.stringify(S))});
  }catch(e){}

  // rAF 1: resize after first paint
  requestAnimationFrame(function(){
    S.dbs.forEach(function(db){resizeDbBody(db);});
    // rAF 2: resize again after browser has reflowed, then draw connectors
    requestAnimationFrame(function(){
      S.dbs.forEach(function(db){resizeDbBody(db);});
      requestAnimationFrame(function(){
        S.dbs.forEach(function(db){drawConnectors(db);});
      });
    });
  });
}

// ── Column form actions ───────────────────────────────────────
function saveCol(dbId,tId){
  const t=getTbl(dbId,tId); if(!t)return;
  const el=document.getElementById('fcn_'+tId);
  const name=(el?el.value.trim():t._fn)||''; if(!name)return;
  var tp=t._ft||'string';
  var isInt=(tp==='integer'||tp==='bigint'||tp==='smallint'||tp==='tinyint');
  var isBool=(tp==='boolean');
  const colData={
    name,
    type:tp,
    length:t._flen||'',
    defaultValue:isBool?(t._fdv||''):'',
    collation:'',
    primaryKey:false,
    foreignKey:false,
    unique:(!isInt&&!isBool)?!!t._fu:false,
    index:false,
    nullable:!!t._fnl,
    autoIncrement:isInt?!!t._fai:false,
    searchable:!!t._fs
  };
  if(t._editingColId){
    const col=(t.columns||[]).find(c=>c.id===t._editingColId);
    if(col){
      col.name=colData.name; col.type=colData.type; col.length=colData.length;
      col.defaultValue=colData.defaultValue; col.collation=colData.collation;
      col.primaryKey=colData.primaryKey; col.foreignKey=colData.foreignKey;
      col.unique=colData.unique; col.index=colData.index;
      col.nullable=colData.nullable; col.autoIncrement=colData.autoIncrement;
      col.searchable=colData.searchable;
    }
    t._editingColId=null;
  }else{
    if(!t.columns)t.columns=[];
    t.columns.push({
      id:uid(),
      name:colData.name, type:colData.type, length:colData.length,
      defaultValue:colData.defaultValue, collation:colData.collation,
      primaryKey:colData.primaryKey, foreignKey:colData.foreignKey,
      unique:colData.unique, index:colData.index,
      nullable:colData.nullable, autoIncrement:colData.autoIncrement,
      searchable:colData.searchable
    });
  }
  resetForm(t); render();
}
function openColForm(dbId,tId,colId){
  const t=getTbl(dbId,tId); if(!t)return;
  const col=(t.columns||[]).find(c=>c.id===colId);
  if(col){
    t._editingColId=colId;
    t._fn=col.name;
    t._ft=col.type;
    t._flen=col.length||'';
    t._fdv=col.defaultValue||'';
    t._fcol=col.collation||'';
    t._fpk=!!col.primaryKey;
    t._ffk=!!col.foreignKey;
    t._fu=!!col.unique;
    t._fix=!!col.index;
    t._fnl=!!col.nullable;
    t._fai=!!col.autoIncrement;
    t._fs=!!col.searchable;
  }
  t._formOpen=true; render();
}
function resetKeyForm(t){t._kType='primary';t._kName='';t._kCols=[];t._kRefTable='';t._kRefCol='';t._kOnDel='RESTRICT';t._kOnUpd='RESTRICT';}
function openKeyModal(dbId,tId){
  const t=getTbl(dbId,tId); if(!t)return;
  t._keyFormOpen=true;
  resetKeyForm(t);
  render();
}
function delKey(dbId,tId,kId){
  const t=getTbl(dbId,tId);
  if(!t)return;
  t.keys=(t.keys||[]).filter(k=>k.id!==kId);
  render();
}

// ── Context menu ──────────────────────────────────────────────
wrap.addEventListener('contextmenu',e=>{
  e.preventDefault();
  const hdr=e.target.closest('.db-header');
  S.ctxDbId=hdr?hdr.closest('[data-db]').dataset.db:null;
  if(!S.ctxDbId)return;
  ctx.style.left=e.clientX+'px';
  ctx.style.top=e.clientY+'px';
  ctx.classList.add('open');
});
document.addEventListener('click',()=>ctx.classList.remove('open'));

document.getElementById('ctxAddTable').addEventListener('click',()=>{
  if(!S.ctxDbId)return;
  const db=getDb(S.ctxDbId);
  if(!db)return;
  if(!db.tables)db.tables=[];
  const n=db.tables.length+1;
  const t={id:uid(),name:'table_'+n,x:BODY_PAD,y:BODY_PAD+(db.tables.length*24),columns:[],keys:[],_formOpen:false};
  resetForm(t);
  db.tables.push(t);
  render();
});

document.getElementById('ctxAddEnum').addEventListener('click',()=>{
  if(!S.ctxDbId)return;
  const db=getDb(S.ctxDbId);
  if(!db)return;
  if(!db.enums)db.enums=[];
  const n=db.enums.length+1;
  // Place enum to the right of all existing tables and enums
  var enumOffX=BODY_PAD;
  (db.tables||[]).forEach(function(t){
    var tblEl=document.getElementById('tbl_'+t.id);
    var w=tblEl?tblEl.offsetWidth:560;
    enumOffX=Math.max(enumOffX,(t.x||BODY_PAD)+w+30);
  });
  (db.enums||[]).forEach(function(e){
    var eEl=document.getElementById('enum_'+e.id);
    var w=eEl?eEl.offsetWidth:300;
    enumOffX=Math.max(enumOffX,(e.x||BODY_PAD)+w+20);
  });
  db.enums.push({id:uid(),name:'enum_'+n,x:enumOffX,y:BODY_PAD,values:[]});
  render();
});

document.getElementById('ctxDeleteDb').addEventListener('click',()=>{
  if(!S.ctxDbId)return;
  S.dbs=S.dbs.filter(d=>d.id!==S.ctxDbId);
  S.ctxDbId=null;
  render();
});

// ── Palette drag (Pointer Events) ─────────────────────────────
// VS Code disables HTML5 drag events inside webview iframes.
// Pointer events bypass this restriction reliably.
let _palGhost=null;
let _palType=null;
let _palActive=false;

function _palDragStart(e,el){
  if(e.button!==0)return;
  _palType=el.dataset.palette;
  _palActive=true;
  el.setPointerCapture(e.pointerId);
  el.classList.add('pal-dragging');
  _palGhost=document.createElement('div');
  _palGhost.className='pal-ghost';
  // Clone the SVG icon from the palette item for the ghost
  const srcSvg=el.querySelector('svg');
  if(srcSvg) _palGhost.appendChild(srcSvg.cloneNode(true));
  const lbl=document.createElement('span');
  lbl.textContent=_palType.charAt(0).toUpperCase()+_palType.slice(1);
  _palGhost.appendChild(lbl);
  document.body.appendChild(_palGhost);
  _movePalGhost(e.clientX,e.clientY);
  e.preventDefault();
}

function _getDbUnderCursor(cx,cy){
  return S.dbs.find(d=>{
    const dbEl=document.getElementById('db_'+d.id);
    if(!dbEl)return false;
    const r=dbEl.getBoundingClientRect();
    return cx>=r.left&&cx<=r.right&&cy>=r.top&&cy<=r.bottom;
  })||null;
}

function _movePalGhost(cx,cy){
  if(!_palGhost)return;
  _palGhost.style.left=cx+'px';
  _palGhost.style.top =cy+'px';
  const rc=wrap.getBoundingClientRect();
  const overCanvas=cx>=rc.left&&cx<=rc.right&&cy>=rc.top&&cy<=rc.bottom;

  if(_palType==='database'){
    wrap.classList.toggle('pal-drag-over',overCanvas);
    _palGhost.classList.remove('invalid');
  } else {
    // Table / Enum must drop onto a DB container
    wrap.classList.remove('pal-drag-over');
    const overDb=_getDbUnderCursor(cx,cy)!==null;
    _palGhost.classList.toggle('invalid',overCanvas&&!overDb);
    // Highlight the DB block the cursor is over
    S.dbs.forEach(d=>{
      const dbEl=document.getElementById('db_'+d.id);
      if(dbEl){
        const r=dbEl.getBoundingClientRect();
        dbEl.classList.toggle('drop-target',cx>=r.left&&cx<=r.right&&cy>=r.top&&cy<=r.bottom);
      }
    });
  }
}

function _clearPalState(el){
  _palActive=false;
  el.classList.remove('pal-dragging');
  wrap.classList.remove('pal-drag-over');
  S.dbs.forEach(d=>{const dbEl=document.getElementById('db_'+d.id);if(dbEl)dbEl.classList.remove('drop-target');});
  if(_palGhost){_palGhost.remove();_palGhost=null;}
}

function _palDragEnd(e,el){
  if(!_palActive)return;
  _clearPalState(el);

  const rc=wrap.getBoundingClientRect();
  const overCanvas=e.clientX>=rc.left&&e.clientX<=rc.right&&e.clientY>=rc.top&&e.clientY<=rc.bottom;
  if(!overCanvas)return;

  // Convert screen coords to canvas stage coords (pan + zoom)
  const cx=(e.clientX-rc.left-S.panX)/S.zoom;
  const cy=(e.clientY-rc.top -S.panY)/S.zoom;

  if(_palType==='database'){
    // Drop database directly - default name, user clicks title to rename
    const n=S.dbs.length+1;
    S.dbs.push({id:uid(),name:'Database_'+n,auth:false,x:cx,y:cy,tables:[],enums:[]});
    render();

  } else if(_palType==='table'){
    const db=_getDbUnderCursor(e.clientX,e.clientY);
    if(!db){showToast('Drop Table inside a Database');return;}
    const bodyEl=document.getElementById('db_body_'+db.id);
    const bodyRc=bodyEl?bodyEl.getBoundingClientRect():{left:0,top:0};
    const lx=Math.max(BODY_PAD,(e.clientX-bodyRc.left)/S.zoom);
    const ly=Math.max(BODY_PAD,(e.clientY-bodyRc.top)/S.zoom);
    if(!db.tables)db.tables=[];
    const n=db.tables.length+1;
    const t={id:uid(),name:'table_'+n,x:lx,y:ly,columns:[],keys:[],_formOpen:false};
    resetForm(t);db.tables.push(t);render();

  } else if(_palType==='enum'){
    const db=_getDbUnderCursor(e.clientX,e.clientY);
    if(!db){showToast('Drop Enum inside a Database');return;}
    const bodyEl=document.getElementById('db_body_'+db.id);
    const bodyRc=bodyEl?bodyEl.getBoundingClientRect():{left:0,top:0};
    const lx=Math.max(BODY_PAD,(e.clientX-bodyRc.left)/S.zoom);
    const ly=Math.max(BODY_PAD,(e.clientY-bodyRc.top)/S.zoom);
    if(!db.enums)db.enums=[];
    const n=db.enums.length+1;
    db.enums.push({id:uid(),name:'enum_'+n,x:lx,y:ly,values:[]});render();
  }
}

document.querySelectorAll('.drag-item').forEach(el=>{
  el.addEventListener('pointerdown', e=>_palDragStart(e,el));
  el.addEventListener('pointermove', e=>{if(_palActive)_movePalGhost(e.clientX,e.clientY);});
  el.addEventListener('pointerup',   e=>{if(_palActive)_palDragEnd(e,el);});
  el.addEventListener('pointercancel',e=>{if(_palActive)_clearPalState(el);});
});

// ── Export JSON ───────────────────────────────────────────────
function buildJson(){
  if(!S.dbs.length)return{version:'1.0.0',databases:[]};
  const db=S.dbs[0];

  // Build a lookup: enumId -> enum block (only saved enums)
  const enumById={};
  (db.enums||[]).forEach(function(en){ if(en.saved)enumById[en.id]=en; });

  // Build a lookup: columnId -> enum block (via linkedColumn)
  const enumByColId={};
  (db.enums||[]).forEach(function(en){
    if(en.saved && en.linkedColumn)enumByColId[en.linkedColumn]=en;
  });

  return{
    version:'1.0.0',
    database:{name:db.name},
    auth:{enabled:!!db.auth},
    tables:(db.tables||[]).map(function(t){

      // Build fields
      const fields=(t.columns||[]).map(function(c){
        const f={name:c.name,type:c.type};

        // length
        if(c.length && Number(c.length)>0) f.length=Number(c.length);

        // enum inline values
        if(c.type==='enum'){
          const en=enumByColId[c.id];
          f.values=en?(en.values||[]).map(function(v){return v.value||v.name||'';}) : [];
        }

        // default
        if(c.defaultValue!==undefined && c.defaultValue!==null && c.defaultValue!==''){
          // Try to coerce booleans and numbers
          const dv=c.defaultValue;
          if(dv==='true')  f.default=true;
          else if(dv==='false') f.default=false;
          else if(!isNaN(Number(dv)) && dv!=='') f.default=Number(dv);
          else f.default=dv;
        }

        // nullable — always emit, default false
        f.nullable = (c.nullable !== undefined && c.nullable !== null) ? !!c.nullable : false;

        // unique — always emit, default false
        f.unique = !!c.unique;

        // searchable — always emit, default false
        f.searchable = !!c.searchable;

        return f;
      });

      // Build keys
      const keys=(t.keys||[]).map(function(k){
        const out={name:k.name||k.type,type:k.type,columns:k.columns||[]};
        if(k.type==='foreign'){
          // refTable and refColumn are stored on the key
          out.references={table:k.refTable||'',column:k.refColumn||''};
          if(k.onDelete) out.onDelete=k.onDelete;
          if(k.onUpdate) out.onUpdate=k.onUpdate;
        }
        return out;
      });

      const searchable=(t.columns||[]).filter(function(c){return !!c.searchable;}).map(function(c){return c.name;});

      return{
        name:t.name,
        displayName:t.name,
        timestamps:!!t.timestamps,
        softDelete:!!t.softDelete,
        searchable:searchable,
        fields:fields,
        keys:keys
      };
    })
  };
}
document.getElementById('btnExport').addEventListener('click',()=>{
  var json = JSON.stringify(buildJson(),null,2);
  jsonBdy.textContent = json;
  jsonPnl.classList.add('open');
  // Auto-save to workspace/schema/schema.json
  if(vscodeApi) vscodeApi.postMessage({
    command: 'saveSchemaJson',
    content: json,
    layout: { zoom: S.zoom, panX: S.panX, panY: S.panY, dbs: S.dbs }
  });
});
document.getElementById('btnCopyJson').addEventListener('click',()=>{
  navigator.clipboard.writeText(jsonBdy.textContent)
    .then(()=>showToast('Copied!'))
    .catch(()=>showToast('Copy failed'));
});
document.getElementById('btnCloseJson').addEventListener('click',()=>jsonPnl.classList.remove('open'));
document.getElementById('btnClear').addEventListener('click',()=>{S.dbs=[];render();});

// ── Export DB button + dropdown ────────────────────────────────────────────
(function(){
  var dbWrap    = document.getElementById('exportDbWrap');
  var dbMenu    = document.getElementById('exportDbMenu');
  var dbArrow   = document.getElementById('exportDbArrow');
  var dbLabel   = document.getElementById('btnExportDb').querySelector('.export-db-label');
  var dbSelected = null;
  if(!dbWrap||!dbMenu||!dbArrow||!dbLabel) return;

  function dbOpenMenu(){
    var rc = dbWrap.getBoundingClientRect();
    dbMenu.style.left = rc.left+'px';
    dbMenu.style.top  = (rc.bottom+4)+'px';
    dbMenu.classList.add('open');
    dbArrow.classList.add('open');
  }
  function dbCloseMenu(){
    dbMenu.classList.remove('open');
    dbArrow.classList.remove('open');
  }
  function dbToggleMenu(){ dbMenu.classList.contains('open') ? dbCloseMenu() : dbOpenMenu(); }

  function dbIsDisabled(){ return document.getElementById('btnExportDb').classList.contains('export-db-disabled'); }

  dbArrow.addEventListener('click', function(e){ e.stopPropagation(); if(dbIsDisabled())return; dbToggleMenu(); });

  dbLabel.addEventListener('click', function(e){
    e.stopPropagation();
    if(dbIsDisabled())return;
    if(!dbSelected){ dbToggleMenu(); return; }
    dbDoExport(dbSelected);
  });

  dbMenu.querySelectorAll('.export-db-item').forEach(function(item){
    item.addEventListener('click', function(e){
      e.stopPropagation();
      dbSelected = item.dataset.db;
      dbMenu.querySelectorAll('.export-db-item').forEach(function(i){ i.classList.remove('active'); });
      item.classList.add('active');
      dbCloseMenu();
      dbDoExport(dbSelected);
    });
  });

  function dbDoExport(dbType){
    if(!S.dbs.length){ showToast('No databases on canvas to export.'); return; }
    vscodeApi && vscodeApi.postMessage({
      command:'exportDb',
      dbType:dbType,
      schema:buildJson(),
      stakCommand:'@stak /generate \\\\'+dbType
    });
    showToast('Exporting schema for '+dbType+'...');
  }
})();
applyXform();

// ── Load from saved layout (schema.layout.json) ────────────────────────────
function loadFromLayout(layout){
  if(!layout||!layout.dbs) return;
  S.dbs  = layout.dbs;
  S.zoom = layout.zoom  || 1;
  S.panX = layout.panX  || 0;
  S.panY = layout.panY  || 0;
  applyXform();
  render();
}

// Listen for loadLayout message from extension host (sent when schema.json is opened)
window.addEventListener('message',function(e){
  var msg=e.data;
  if(!msg||!msg.command) return;
  if(msg.command==='loadLayout' && msg.layout){
    loadFromLayout(msg.layout);
  }
});

render();

`;
}
//# sourceMappingURL=databaseCanvasPanel.js.map