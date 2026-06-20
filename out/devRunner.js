"use strict";
/**
 * SnapStak Dev Runner
 * Detects framework from package.json, runs the correct dev command,
 * waits for the server to be ready, then opens the shared browser webview.
 *
 * Script injection strategy:
 *   Before launching, ss-tracker.js is copied into the project root
 *   as ss-tracker.js, and a <script src="/ss-tracker.js"> tag is appended
 *   to index.html. The script loads with the page and sits idle until
 *   postToBrowser({ command: 'startTracker' }) wakes it up.
 *   When the browser panel closes, the tag and the copied file are removed.
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
exports.detectFramework = detectFramework;
exports.waitForServer = waitForServer;
exports.setBrowserMessageHandler = setBrowserMessageHandler;
exports.setBrowserPanelOpenHandler = setBrowserPanelOpenHandler;
exports.postToBrowser = postToBrowser;
exports.getBrowserPanel = getBrowserPanel;
exports.launchDevServer = launchDevServer;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const http = __importStar(require("http"));
const https = __importStar(require("https"));
function detectFramework(projectRoot) {
    const pkgPath = path.join(projectRoot, 'package.json');
    if (!fs.existsSync(pkgPath)) {
        return { name: 'Static', command: '', port: 0 };
    }
    let pkg = {};
    try {
        pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    }
    catch {
        return { name: 'Unknown', command: 'npm run dev', port: 3000 };
    }
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const scripts = pkg.scripts || {};
    if (deps['next']) {
        return { name: 'Next.js', command: 'npm run dev', port: 3000 };
    }
    if (deps['@angular/core']) {
        return { name: 'Angular', command: 'npm run start', port: 4200 };
    }
    if (deps['@vue/cli-service'] || scripts['serve']) {
        return { name: 'Vue CLI', command: 'npm run serve', port: 8080 };
    }
    if (deps['nuxt'] || deps['nuxt3']) {
        return { name: 'Nuxt', command: 'npm run dev', port: 3000 };
    }
    if (deps['vite'] || deps['@vitejs/plugin-react'] || deps['@vitejs/plugin-vue']) {
        return { name: 'Vite', command: 'npm run dev', port: 5173 };
    }
    if (deps['react-scripts']) {
        return { name: 'React', command: 'npm start', port: 3000 };
    }
    if (deps['@sveltejs/kit']) {
        return { name: 'SvelteKit', command: 'npm run dev', port: 5173 };
    }
    if (deps['@remix-run/react']) {
        return { name: 'Remix', command: 'npm run dev', port: 3000 };
    }
    if (scripts['dev']) {
        return { name: 'Unknown', command: 'npm run dev', port: 3000 };
    }
    if (scripts['start']) {
        return { name: 'Unknown', command: 'npm start', port: 3000 };
    }
    return { name: 'Static', command: '', port: 0 };
}
// ─────────────────────────────────────────────────────────────
// WAIT FOR SERVER READY
// ─────────────────────────────────────────────────────────────
function waitForServer(port, timeoutMs = 60000) {
    return new Promise((resolve) => {
        const start = Date.now();
        const interval = 500;
        function check() {
            const lib = port === 443 ? https : http;
            const req = lib.get(`http://localhost:${port}`, () => { resolve(true); });
            req.on('error', () => {
                if (Date.now() - start > timeoutMs) {
                    resolve(false);
                }
                else {
                    setTimeout(check, interval);
                }
            });
            req.setTimeout(1000, () => {
                req.destroy();
                if (Date.now() - start > timeoutMs) {
                    resolve(false);
                }
                else {
                    setTimeout(check, interval);
                }
            });
        }
        check();
    });
}
// ─────────────────────────────────────────────────────────────
// INDEX.HTML SCRIPT TAG INJECTION
// ─────────────────────────────────────────────────────────────
const SS_MARKER = '<!-- snapstak-tracker -->';
function injectScriptTag(indexHtmlPath, scriptSrc) {
    if (!fs.existsSync(indexHtmlPath)) {
        return;
    }
    let html = fs.readFileSync(indexHtmlPath, 'utf8');
    if (html.includes(SS_MARKER)) {
        return;
    } // already injected
    const tag = `\n  <script src="${scriptSrc}"></script>${SS_MARKER}`;
    if (html.includes('</body>')) {
        html = html.replace('</body>', `${tag}\n</body>`);
    }
    else if (html.includes('</html>')) {
        html = html.replace('</html>', `${tag}\n</html>`);
    }
    else {
        html += tag;
    }
    fs.writeFileSync(indexHtmlPath, html, 'utf8');
}
function removeScriptTag(indexHtmlPath) {
    if (!fs.existsSync(indexHtmlPath)) {
        return;
    }
    let html = fs.readFileSync(indexHtmlPath, 'utf8');
    if (!html.includes(SS_MARKER)) {
        return;
    }
    html = html.replace(/\n\s*<script src="[^"]*"><\/script><!-- snapstak-tracker -->/g, '');
    fs.writeFileSync(indexHtmlPath, html, 'utf8');
}
// ─────────────────────────────────────────────────────────────
// SHARED BROWSER PANEL STATE
// ─────────────────────────────────────────────────────────────
let browserPanel;
let activeTerminal;
let _activeIndexHtml;
let _activeProjectRoot;
let _onBrowserMessage;
let _onBrowserPanelOpen;
function setBrowserMessageHandler(handler) {
    _onBrowserMessage = handler;
}
function setBrowserPanelOpenHandler(handler) {
    _onBrowserPanelOpen = handler;
}
function postToBrowser(msg) {
    browserPanel?.webview.postMessage(msg);
}
function getBrowserPanel() {
    return browserPanel;
}
// ─────────────────────────────────────────────────────────────
// LAUNCH DEV SERVER
// ─────────────────────────────────────────────────────────────
async function launchDevServer(projectRoot, context) {
    const framework = detectFramework(projectRoot);
    const projectName = path.basename(projectRoot);
    const indexPath = path.join(projectRoot, 'index.html');
    // Source ss-tracker.js from the extension's media folder
    const selectorSrc = path.join(context.extensionPath, 'media', 'copywriter', 'ss-tracker.js');
    if (!fs.existsSync(selectorSrc)) {
        vscode.window.showErrorMessage('SnapStak: ss-tracker.js not found. Ensure media/copywriter/ss-tracker.js is included in the extension package.');
        // Still open the browser panel — tracker just won't be available
    }
    const copyTracker = (dest) => {
        try {
            if (fs.existsSync(selectorSrc)) {
                fs.copyFileSync(selectorSrc, dest);
            }
        }
        catch (e) {
            console.error('[SnapStak] copyTracker failed:', e.message);
        }
    };
    // Static HTML project — load via file:// URL
    if (framework.name === 'Static' || !framework.command) {
        if (fs.existsSync(indexPath)) {
            const trackerDest = path.join(projectRoot, 'ss-tracker.js');
            copyTracker(trackerDest);
            if (fs.existsSync(trackerDest)) {
                injectScriptTag(indexPath, 'ss-tracker.js');
                _activeIndexHtml = indexPath;
                _activeProjectRoot = projectRoot;
            }
            openBrowserPanel(context, `file:///${indexPath.replace(/\\/g, '/')}`, projectName, 0);
        }
        else {
            vscode.window.showErrorMessage('SnapStak: No index.html or package.json found.');
        }
        return;
    }
    // Framework project — dev server serves /ss-tracker.js from project root
    const trackerDest = path.join(projectRoot, 'ss-tracker.js');
    copyTracker(trackerDest);
    if (fs.existsSync(indexPath)) {
        injectScriptTag(indexPath, '/ss-tracker.js');
        _activeIndexHtml = indexPath;
        _activeProjectRoot = projectRoot;
    }
    // Kill existing terminal
    if (activeTerminal) {
        activeTerminal.dispose();
    }
    // Tell snapstakPanelProvider the active project root and framework
    try {
        const provider = require('./views/snapstakPanelProvider');
        provider.setActiveProjectRoot(projectRoot);
        provider.setActiveFramework(framework.name);
    }
    catch (e) { /* ignore if not loaded yet */ }
    activeTerminal = vscode.window.createTerminal({
        name: `SnapStak: ${projectName}`,
        cwd: projectRoot
    });
    activeTerminal.show(false);
    // Run npm install first if node_modules is missing
    const nodeModulesPath = path.join(projectRoot, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
        activeTerminal.sendText('npm install && ' + framework.command);
    }
    else {
        activeTerminal.sendText(framework.command);
    }
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `SnapStak: Starting ${framework.name} dev server...`,
        cancellable: false
    }, async (progress) => {
        progress.report({ message: `Waiting for localhost:${framework.port}` });
        const ready = await waitForServer(framework.port, 60000);
        if (!ready) {
            vscode.window.showErrorMessage(`SnapStak: Dev server did not start on port ${framework.port} within 60 seconds.`);
            return;
        }
        progress.report({ message: 'Opening browser...' });
        await new Promise(r => setTimeout(r, 500));
        openBrowserPanel(context, `http://localhost:${framework.port}`, `${projectName} \u2014 ${framework.name}`, framework.port);
    });
}
// ─────────────────────────────────────────────────────────────
// OPEN / REVEAL BROWSER PANEL
// ─────────────────────────────────────────────────────────────
function openBrowserPanel(context, url, title, port) {
    if (browserPanel) {
        browserPanel.title = title;
        browserPanel.reveal(vscode.ViewColumn.Two);
        // Navigate to new URL without destroying webview context
        browserPanel.webview.postMessage({ command: 'navigate', url: `http://localhost:${port}` });
        return;
    }
    browserPanel = vscode.window.createWebviewPanel('snapstak.browser', title, vscode.ViewColumn.Two, {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: []
    });
    browserPanel.webview.html = getBrowserHtml(url, port);
    // Notify sidebar the browser panel is now open
    setTimeout(() => { if (_onBrowserPanelOpen) {
        _onBrowserPanelOpen();
    } }, 300);
    browserPanel.webview.onDidReceiveMessage((msg) => {
        if (msg.command === 'openExternal') {
            vscode.env.openExternal(vscode.Uri.parse(msg.url));
            return;
        }
        if (_onBrowserMessage) {
            _onBrowserMessage(msg);
        }
    });
    browserPanel.onDidDispose(() => {
        browserPanel = undefined;
        // Remove injected script tag from index.html
        if (_activeIndexHtml) {
            removeScriptTag(_activeIndexHtml);
            _activeIndexHtml = undefined;
        }
        // Remove the temporary ss-tracker.js copy from the project root
        if (_activeProjectRoot) {
            const tempCopy = path.join(_activeProjectRoot, 'ss-tracker.js');
            try {
                if (fs.existsSync(tempCopy)) {
                    fs.unlinkSync(tempCopy);
                }
            }
            catch { /* silent */ }
            _activeProjectRoot = undefined;
        }
    });
}
// ─────────────────────────────────────────────────────────────
// BROWSER HTML
// ─────────────────────────────────────────────────────────────
function getBrowserHtml(initialUrl, port) {
    return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval'; frame-src *;">
  <title>SnapStak Browser</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #111; display: flex; flex-direction: column; height: 100%; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    html { height: 100%; }

    /* ── Main toolbar ── */
    .toolbar {
      display: flex; align-items: center; gap: 5px; width: 100%;
      padding: 5px 8px; background: #1a1a1a;
      border-bottom: 1px solid #2e2e2e; flex-shrink: 0; min-height: 38px;
    }

    /* Nav buttons */
    .nav-btn {
      width: 26px; height: 26px; border-radius: 4px; border: none;
      background: transparent; color: #888; cursor: pointer; font-size: 13px;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s; flex-shrink: 0;
    }
    .nav-btn:hover { background: #2a2a2a; color: #fff; }

    /* URL bar — shorter to leave room for tracker controls */
    .url-bar {
      flex: 1; min-width: 0; height: 26px;
      background: #2a2a2a; border: 1px solid #383838; border-radius: 4px;
      color: #ccc; font-size: 11px; padding: 0 8px; outline: none;
      font-family: 'Courier New', monospace; transition: border-color 0.15s;
    }
    .url-bar:focus { border-color: #38BDF8; color: #eee; }

    .port-badge {
      background: #38BDF8; color: #111; font-size: 10px; font-weight: 700;
      padding: 2px 7px; border-radius: 10px; flex-shrink: 0;
    }

    /* Divider */
    .sep { width: 1px; height: 18px; background: #2e2e2e; flex-shrink: 0; margin: 0 2px; }

    /* Tracker mode buttons — single / multi */
    .track-btn {
      height: 26px; padding: 0 9px; border-radius: 4px; border: none;
      font-size: 11px; font-weight: 600; cursor: pointer; flex-shrink: 0;
      display: flex; align-items: center; gap: 4px;
      background: #2a2a2a; color: #888; transition: background 0.15s, color 0.15s;
    }
    .track-btn:hover { background: #333; color: #ccc; }
    .track-btn.active { background: rgba(56,189,248,0.18); color: #38BDF8; }

    /* Selection count badge */
    .sel-count {
      height: 20px; min-width: 20px; padding: 0 6px;
      border-radius: 10px; background: #38BDF8; color: #111;
      font-size: 10px; font-weight: 700; display: none;
      align-items: center; justify-content: center; flex-shrink: 0;
    }
    .sel-count.visible { display: flex; }

    /* Mode icons */
    .mode-btn {
      width: 28px; height: 26px; border-radius: 4px; border: none;
      font-size: 13px; font-weight: 700; cursor: pointer; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: #2a2a2a; color: #888; transition: background 0.15s, color 0.15s;
    }
    .mode-btn:hover { background: #333; color: #aaa; }
    .mode-btn.active-text  { background: rgba(56,189,248,0.18);  color: #38BDF8; }
    .mode-btn.active-group { background: rgba(56,189,248,0.18);  color: #38BDF8; }
    .mode-btn.active-media { background: rgba(34,197,94,0.18);   color: #22c55e; }
    .mode-btn.active-db    { background: rgba(245,158,11,0.18);  color: #f59e0b; }

    /* Clear button */
    .clear-btn {
      width: 26px; height: 26px; border-radius: 4px; border: none;
      font-size: 12px; font-weight: 700; cursor: pointer; flex-shrink: 0;
      background: transparent; color: #555; display: none; transition: color 0.15s;
    }
    .clear-btn:hover { color: #ef4444; }
    .clear-btn.visible { display: flex; align-items: center; justify-content: center; }

    /* Done button */
    .done-btn {
      height: 26px; padding: 0 12px; border-radius: 4px; border: none;
      font-size: 11px; font-weight: 700; cursor: pointer; flex-shrink: 0;
      background: #38BDF8; color: #111; display: none; transition: background 0.15s;
    }
    .done-btn:hover { background: #5dcffa; }
    .done-btn.visible { display: block; }

    /* Highlighter toggle button */
    .highlight-btn {
      width: 26px; height: 26px; border-radius: 4px; border: none;
      background: transparent; color: #555; cursor: pointer; font-size: 13px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      transition: color 0.15s, background 0.15s;
    }
    .highlight-btn:hover { background: #2a2a2a; color: #aaa; }
    .highlight-btn.on { color: #38BDF8; background: rgba(56,189,248,0.12); }
    .highlight-btn.off { color: #555; }

    .open-btn {
      width: 26px; height: 26px; border-radius: 4px; border: none;
      background: transparent; color: #555; cursor: pointer; font-size: 13px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      transition: color 0.15s;
    }
    .open-btn:hover { color: #38BDF8; }

    .browser-frame { flex: 1; width: 100%; border: none; background: #fff; }

    .loading {
      position: absolute; inset: 38px 0 0 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: #111; gap: 16px; color: #888;
      font-size: 13px; pointer-events: none; transition: opacity 0.3s;
    }
    .loading.hidden { opacity: 0; pointer-events: none; }
    .spinner {
      width: 28px; height: 28px;
      border: 3px solid #333; border-top-color: #38BDF8;
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>

  <div class="toolbar">
    <!-- Navigation -->
    <button class="nav-btn" id="backBtn"   title="Back">&#8592;</button>
    <button class="nav-btn" id="fwdBtn"    title="Forward">&#8594;</button>
    <button class="nav-btn" id="reloadBtn" title="Reload">&#8635;</button>

    <!-- URL bar -->
    <input class="url-bar" id="urlBar" value="${initialUrl}" />
    ${port ? `<span class="port-badge">:${port}</span>` : ''}

    <!-- Tracker controls (shown when tracker is active) -->
    <div class="sep" id="trackerSep"></div>

    <!-- Highlighter on/off toggle -->
    <button class="highlight-btn on" id="btnHighlight" title="Toggle highlighter on/off">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 2h12v12H2z" stroke="currentColor" stroke-width="1.3" stroke-dasharray="3 2" fill="none"/>
        <circle cx="8" cy="8" r="2.5" fill="currentColor"/>
      </svg>
    </button>

    <button class="track-btn" id="btnSingle" title="Single select — each click replaces selection">
      &#9679; Single
    </button>
    <button class="track-btn" id="btnMulti" title="Multi select — each click adds to selection">
      &#8853; Multi
    </button>

    <span class="sel-count" id="selCount">0</span>

    <button class="mode-btn" id="btnModeText"  title="Text mode — select individual headings, paragraphs, buttons">T</button>
    <button class="mode-btn" id="btnModeGroup" title="Group mode — select heading and body text together">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="2" width="14" height="3" rx="1" stroke="currentColor" stroke-width="1.3"/>
        <line x1="1" y1="8"  x2="15" y2="8"  stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        <line x1="1" y1="11" x2="15" y2="11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        <line x1="1" y1="14" x2="10" y2="14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
      </svg>
    </button>
    <button class="mode-btn" id="btnModeMedia" title="Media mode — select images, video, svg, audio">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
        <circle cx="5.5" cy="6.5" r="1.5" fill="currentColor"/>
        <path d="M1 11l3.5-3.5 2.5 2.5 2-2 4 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <button class="mode-btn" id="btnModeDb" title="Database mode — select Stak elements">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="8" cy="4" rx="6" ry="2" stroke="currentColor" stroke-width="1.4"/>
        <path d="M2 4v4c0 1.1 2.686 2 6 2s6-.9 6-2V4" stroke="currentColor" stroke-width="1.4"/>
        <path d="M2 8v4c0 1.1 2.686 2 6 2s6-.9 6-2V8" stroke="currentColor" stroke-width="1.4"/>
      </svg>
    </button>

    <button class="done-btn" id="doneBtn">Done &#10003;</button>
    <button class="clear-btn" id="clearBtn" title="Clear selection">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Open in browser -->
    <button class="open-btn" id="openBtn" title="Open in system browser">&#8599;</button>
  </div>

  <div class="loading" id="loading">
    <div class="spinner"></div>
    <span>Loading project...</span>
  </div>

  <iframe
    class="browser-frame"
    id="frame"
    src="${initialUrl}"
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-pointer-lock"
  ></iframe>

  <script>
    const vscodeApi  = acquireVsCodeApi();
    const frame      = document.getElementById('frame');
    const urlBar     = document.getElementById('urlBar');
    const loading    = document.getElementById('loading');
    const reloadBtn  = document.getElementById('reloadBtn');
    const openBtn    = document.getElementById('openBtn');
    const btnSingle  = document.getElementById('btnSingle');
    const btnMulti   = document.getElementById('btnMulti');
    const selCount   = document.getElementById('selCount');
    const btnModeText  = document.getElementById('btnModeText');
    const btnModeGroup = document.getElementById('btnModeGroup');
    const btnModeMedia = document.getElementById('btnModeMedia');
    const btnModeDb    = document.getElementById('btnModeDb');
    const doneBtn      = document.getElementById('doneBtn');
    const clearBtn     = document.getElementById('clearBtn');
    const trackerSep   = document.getElementById('trackerSep');

    const btnHighlight  = document.getElementById('btnHighlight');

    let highlighterOn = true;

    function setHighlighter(on) {
      highlighterOn = on;
      btnHighlight.classList.toggle('on', on);
      btnHighlight.classList.toggle('off', !on);
      btnHighlight.title = on ? 'Highlighter ON — click to turn off' : 'Highlighter OFF — click to turn on';
      if (on) {
        sendToTracker('ss_start');
      } else {
        sendToTracker('ss_stop');
      }
    }

    btnHighlight.addEventListener('click', () => {
      if (!trackerStarted) { return; }
      setHighlighter(!highlighterOn);
    });
    let currentMode = 'text';

    const MODE_LABELS = { text: 'Send to Copywriter', group: 'Send to Copywriter', media: 'Send to Media', db: 'Send to Database' };

    function updateSelCount(n) {
      selCount.textContent = n;
      selCount.classList.toggle('visible', n > 0);
      // In group mode the extraction fires automatically on click —
      // the Done button must stay hidden so _finish() is never called.
      doneBtn.classList.toggle('visible', n > 0);
      clearBtn.classList.toggle('visible', n > 0);
    }

    function setMultiMode(on) {
      multiMode = on;
      btnSingle.classList.toggle('active', !on);
      btnMulti.classList.toggle('active',   on);
      sendToTracker('ss_set_mode', { multi: on });
    }

    function setMode(mode) {
      currentMode = mode;
      ['active-text','active-group','active-media','active-db'].forEach(c => {
        btnModeText.classList.remove(c);
        btnModeGroup.classList.remove(c);
        btnModeMedia.classList.remove(c);
        btnModeDb.classList.remove(c);
      });
      if (mode === 'text')  { btnModeText.classList.add('active-text'); }
      if (mode === 'group') { btnModeGroup.classList.add('active-group'); }
      if (mode === 'media') { btnModeMedia.classList.add('active-media'); }
      if (mode === 'db')    { btnModeDb.classList.add('active-db'); }
      doneBtn.textContent = MODE_LABELS[mode] + ' ✓';
      sendToTracker('ss_set_content_mode', { mode: mode });
      updateSelCount(0);
    }

    // ── Tracker button state ─────────────────────────────────────
    let trackerStarted = false;

    function disableAllTrackerButtons() {
      [btnSingle, btnMulti, btnModeText, btnModeGroup, btnModeMedia, btnModeDb].forEach(b => {
        b.disabled = true;
        b.style.opacity = '0.3';
        b.style.cursor = 'not-allowed';
        b.classList.remove('active', 'active-text', 'active-group', 'active-media', 'active-db');
      });
      updateSelCount(0);
    }

    function enableButtons(tab) {
      // Enable single/multi
      [btnSingle, btnMulti].forEach(b => {
        b.disabled = false; b.style.opacity = ''; b.style.cursor = '';
      });
      // Enable only the relevant mode button, disable others
      const map = { copywriter: btnModeText, media: btnModeMedia, database: btnModeDb };
      [btnModeText, btnModeMedia, btnModeDb].forEach(b => {
        b.disabled = true; b.style.opacity = '0.3'; b.style.cursor = 'not-allowed';
      });
      if (map[tab]) {
        map[tab].disabled = false; map[tab].style.opacity = '1'; map[tab].style.cursor = '';
      }
      // Group button always enabled alongside text for copywriter tab
      if (tab === 'copywriter') {
        btnModeGroup.disabled = false; btnModeGroup.style.opacity = '1'; btnModeGroup.style.cursor = '';
      }
      // Default to Single. Only reset mode if switching to a different tab
      // — do not override if the user already selected group mode.
      setMultiMode(false);
      const modeMap = { copywriter: 'text', media: 'media', database: 'db' };
      const defaultMode = modeMap[tab] || 'text';
      const validModesForTab = { copywriter: ['text', 'group'], media: ['media'], database: ['db'] };
      const valid = validModesForTab[tab] || [defaultMode];
      if (!valid.includes(currentMode)) { setMode(defaultMode); } else { sendToTracker('ss_set_content_mode', { mode: currentMode }); }
    }

    // Start all buttons disabled
    disableAllTrackerButtons();
    doneBtn.textContent = 'Send to Copywriter ✓';

    // ── Toolbar button events ────────────────────────────────────
    btnSingle.addEventListener('click', () => setMultiMode(false));
    btnMulti.addEventListener('click',  () => setMultiMode(true));

    btnModeText.addEventListener('click',  () => setMode('text'));
    btnModeGroup.addEventListener('click', () => setMode('group'));
    btnModeMedia.addEventListener('click', () => setMode('media'));
    btnModeDb.addEventListener('click',    () => setMode('db'));

    doneBtn.addEventListener('click', () => { sendToTracker('ss_done'); });
    clearBtn.addEventListener('click', () => { sendToTracker('ss_clear'); updateSelCount(0); });

    // ── Send command to ss-tracker.js inside the iframe ─────────
    function sendToTracker(command, data) {
      try {
        frame.contentWindow.postMessage(
          Object.assign({ command: command }, data || {}), '*'
        );
      } catch(e) {}
    }

    // ── Frame load ───────────────────────────────────────────────
    frame.addEventListener('load', () => {
      loading.classList.add('hidden');
      try {
        const src = frame.contentWindow && frame.contentWindow.location.href;
        if (src && src !== 'about:blank') { urlBar.value = src; }
      } catch(e) {}
      if (!trackerStarted) { disableAllTrackerButtons(); }
    });

    reloadBtn.addEventListener('click', () => {
      loading.classList.remove('hidden');
      trackerStarted = false;
      disableAllTrackerButtons();
      frame.src = frame.src;
    });

    urlBar.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { loading.classList.remove('hidden'); frame.src = urlBar.value; }
    });

    openBtn.addEventListener('click', () => {
      vscodeApi.postMessage({ command: 'openExternal', url: urlBar.value });
    });

    // ── Messages from extension host ─────────────────────────────
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (!msg) { return; }

      // Messages FROM the iframe (ss-tracker.js) — identified by type field
      if (msg.type === 'SS_TRACKER_READY') {
        setMode('text');
        vscodeApi.postMessage(msg);
        return;
      }
      if (msg.type === 'SS_SELECTION_CHANGED') {
        updateSelCount(msg.count || 0);
        return;
      }
      if (msg.type === 'SS_GROUP_DEBUG') {
        showGroupDebug(msg.blocks || []);
        return;
      }
      if (msg.type === 'SS_GROUP_DEBUG_CLOSE') {
        removeGroupDebug();
        return;
      }
      if (msg.type === 'COPYWRITER_SELECTION_COMPLETE') {
        vscodeApi.postMessage(msg);
        return;
      }
      // Forward all other typed messages (no command field) to extension host
      if (msg.type && !msg.command) {
        vscodeApi.postMessage(msg);
        return;
      }

      // Deactivate tracker buttons when non-browser tab is active
      if (msg.command === 'deactivateTab') {
        disableAllTrackerButtons();
        return;
      }

      // Activate tracker for a specific tab
      if (msg.command === 'activateTab') {
        if (!trackerStarted) {
          sendToTracker('ss_start');
          trackerStarted = true;
        }
        enableButtons(msg.tab);
        return;
      }

      // Messages FROM extension host (have command field)
      if (msg.command === 'navigate') {
        loading.classList.remove('hidden');
        frame.src = msg.url;
        urlBar.value = msg.url;
        updateSelCount(0);
        return;
      }

      // Forward ss_ commands to iframe
      if (typeof msg.command === 'string' && msg.command.startsWith('ss_')) {
        sendToTracker(msg.command, msg);
        return;
      }
    });

    // ── Group debug window functions ───────────────────────────
    function removeGroupDebug() {
      var w = document.getElementById('ss-group-debug');
      if (w && w.parentNode) { w.parentNode.removeChild(w); }
    }

    function showGroupDebug(groupBlocks) {
      removeGroupDebug();
      var win = document.createElement('div');
      win.id = 'ss-group-debug';
      win.style.cssText = 'position:fixed;top:48px;right:12px;width:380px;max-height:calc(100vh - 60px);overflow-y:auto;z-index:999999;background:#111;border:1.5px solid #38BDF8;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",monospace;font-size:11px;color:#e4e4e7;box-shadow:0 8px 32px rgba(0,0,0,0.8);pointer-events:auto;scrollbar-width:thin;';

      // Header
      var hdr = document.createElement('div');
      hdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid #2e2e2e;position:sticky;top:0;background:#111;z-index:1;';
      var title = document.createElement('span');
      title.style.cssText = 'font-weight:700;color:#38BDF8;letter-spacing:.06em;font-size:10px;text-transform:uppercase;';
      title.textContent = 'Group Debug — ' + groupBlocks.length + ' block' + (groupBlocks.length === 1 ? '' : 's');
      var closeBtn = document.createElement('button');
      closeBtn.textContent = '×';
      closeBtn.style.cssText = 'background:transparent;border:none;color:#71717a;cursor:pointer;font-size:18px;line-height:1;padding:0 4px;';
      closeBtn.onclick = function() { removeGroupDebug(); };
      hdr.appendChild(title);
      hdr.appendChild(closeBtn);
      win.appendChild(hdr);

      // Body
      var body = document.createElement('div');
      body.style.cssText = 'padding:8px;display:flex;flex-direction:column;gap:8px;';

      groupBlocks.forEach(function(gb, idx) {
        var card = document.createElement('div');
        card.style.cssText = 'background:#1a1a1a;border:1px solid #2e2e2e;border-radius:6px;padding:8px 10px;display:flex;flex-direction:column;gap:4px;';

        var blockNum = document.createElement('div');
        blockNum.style.cssText = 'font-size:9px;color:#52525b;letter-spacing:.06em;text-transform:uppercase;margin-bottom:2px;';
        blockNum.textContent = 'Block ' + (idx + 1) + ' of ' + groupBlocks.length + '  ·  ' + gb.blockId;
        card.appendChild(blockNum);

        function makeRow(tierName, node, r, g, b) {
          if (!node) { return; }
          var row = document.createElement('div');
          row.style.cssText = 'display:flex;gap:6px;align-items:flex-start;flex-wrap:wrap;margin-bottom:2px;';
          var tier = document.createElement('span');
          tier.style.cssText = 'font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px;background:rgba(' + r + ',' + g + ',' + b + ',0.12);color:rgb(' + r + ',' + g + ',' + b + ');flex-shrink:0;margin-top:1px;min-width:48px;text-align:center;';
          tier.textContent = tierName;
          var tag = document.createElement('span');
          tag.style.cssText = 'font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px;background:rgba(56,189,248,0.10);color:#38BDF8;flex-shrink:0;margin-top:1px;';
          tag.textContent = node.tag;
          var txt = document.createElement('span');
          txt.style.cssText = 'color:#a1a1aa;line-height:1.4;word-break:break-word;flex:1;';
          txt.textContent = node.text && node.text.length > 80 ? node.text.substring(0, 80) + '…' : (node.text || '');
          row.appendChild(tier);
          row.appendChild(tag);
          row.appendChild(txt);
          if (node.isHidden) {
            var hb = document.createElement('span');
            hb.style.cssText = 'font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px;background:rgba(239,68,68,0.10);color:#ef4444;flex-shrink:0;margin-top:1px;';
            hb.textContent = 'hidden';
            row.appendChild(hb);
          }
          card.appendChild(row);
        }

        makeRow('LABEL',  gb.label,  161, 161, 170);
        makeRow('PARENT', gb.parent, 56,  189, 248);
        if (gb.children && gb.children.length > 0) {
          gb.children.forEach(function(child) { makeRow('CHILD', child, 29, 158, 117); });
        } else {
          var noChild = document.createElement('div');
          noChild.style.cssText = 'font-size:10px;color:#52525b;font-style:italic;padding-left:4px;';
          noChild.textContent = 'no children';
          card.appendChild(noChild);
        }
        body.appendChild(card);
      });

      win.appendChild(body);
      document.body.appendChild(win);
    }
  </script>
</body>
</html>`;
}
//# sourceMappingURL=devRunner.js.map