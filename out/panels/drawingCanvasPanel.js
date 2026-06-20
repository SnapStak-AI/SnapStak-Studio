"use strict";
/**
 * SnapStak Drawing Canvas Panel
 * Full editor panel — rectangle draw / select / resize / move.
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
exports.setDrawingCanvasSidebarView = setDrawingCanvasSidebarView;
exports.postToDrawingCanvas = postToDrawingCanvas;
exports.openDrawingCanvasPanel = openDrawingCanvasPanel;
const vscode = __importStar(require("vscode"));
let _panel;
let _sidebarView;
function setDrawingCanvasSidebarView(view) {
    _sidebarView = view;
    if (view) {
        view.webview.onDidReceiveMessage((msg) => {
            if (msg.command === 'iconDragStart' || msg.command === 'iconProps') {
                _panel?.webview.postMessage(msg);
            }
            // ── Forward image props to drawing canvas ──
            if (msg.command === 'imageProps') {
                _panel?.webview.postMessage(msg);
            }
            // ── Shared file-open helper ──────────────────────────────────────
            function openImageFile(callback) {
                vscode.window.showOpenDialog({
                    canSelectFiles: true,
                    canSelectFolders: false,
                    canSelectMany: false,
                    filters: { 'Images': ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'] }
                }).then(uris => {
                    if (!uris || uris.length === 0) {
                        return;
                    }
                    const uri = uris[0];
                    const fs = require('fs');
                    const path = require('path');
                    try {
                        const buf = fs.readFileSync(uri.fsPath);
                        const ext = path.extname(uri.fsPath).slice(1).toLowerCase();
                        const mimeMap = {
                            png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
                            gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
                            bmp: 'image/bmp'
                        };
                        const src = 'data:' + (mimeMap[ext] || 'image/png') + ';base64,' + buf.toString('base64');
                        let w = 0, h = 0;
                        try {
                            const sizeOf = require('image-size');
                            const dims = sizeOf(uri.fsPath);
                            w = dims.width || 0;
                            h = dims.height || 0;
                        }
                        catch (_) { /* image-size optional — canvas will measure */ }
                        callback(src, w, h, path.basename(uri.fsPath));
                    }
                    catch (err) {
                        console.error('[SnapStak] openImageFile error:', err);
                    }
                });
            }
            // ── File dialog: freestanding image tool ─────────────────────────
            if (msg.command === 'imagePickFile') {
                openImageFile((src, w, h, fileName) => {
                    const payload = { command: 'imageReady', src, w, h, fileName };
                    view.webview.postMessage(payload); // sidebar: update filename/W/H
                    _panel?.webview.postMessage(payload); // canvas: start ghost drop
                });
            }
            // ── File dialog: shape image fill (rect / ellipse / polygon) ─────
            if (msg.command === 'shapeFillPickFile') {
                openImageFile((src, w, h, fileName) => {
                    // Tell sidebar so it can show the filename
                    view.webview.postMessage({ command: 'shapeFillReady', uid: msg.uid, src, w, h, fileName });
                    // Tell canvas to apply fill directly to the shape
                    _panel?.webview.postMessage({ command: 'shapeFillReady', uid: msg.uid, src, shadow: msg.shadow || null });
                });
            }
            // ── Lucide icon fetches — sidebar → extension host → server ──
            if (msg.command === 'fetchLucideTags') {
                const serverUrl = vscode.workspace.getConfiguration('snapstak').get('serverUrl', 'http://localhost:3001');
                fetch(`${serverUrl}/api/lucide/tags`)
                    .then(r => r.json())
                    .then(tags => view.webview.postMessage({ command: 'lucideTags', tags }))
                    .catch(err => console.error('[SnapStak] fetchLucideTags error:', err));
            }
            if (msg.command === 'fetchLucideIcon') {
                const name = (msg.name || '').replace(/[^a-z0-9\-]/g, '');
                if (!name) {
                    return;
                }
                const serverUrl = vscode.workspace.getConfiguration('snapstak').get('serverUrl', 'http://localhost:3001');
                fetch(`${serverUrl}/api/lucide/icon/${name}`)
                    .then(r => r.text())
                    .then(svgText => {
                    const inner = svgText.replace(/<svg[^>]*>/i, '').replace(/<\/svg>/i, '').trim();
                    view.webview.postMessage({ command: 'lucideIcon', name, svgInner: inner });
                })
                    .catch(err => console.error(`[SnapStak] fetchLucideIcon(${name}) error:`, err));
            }
        });
    }
}
function postToDrawingCanvas(msg) {
    _panel?.webview.postMessage(msg);
}
function openDrawingCanvasPanel(context) {
    if (_panel) {
        _panel.reveal(vscode.ViewColumn.One);
        return;
    }
    _panel = vscode.window.createWebviewPanel('snapstak.drawingCanvas', 'Drawing Canvas', vscode.ViewColumn.One, {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: []
    });
    _panel.webview.html = getHtml();
    _panel.webview.onDidReceiveMessage((msg) => {
        if (msg.command === 'setToolMode') {
            _sidebarView?.webview.postMessage({ command: 'toolModeChanged', tool: msg.tool });
        }
        // ── Image: canvas signals shape selected / deselected / resized ──
        // (removed — shape fill is now triggered from sidebar, not image tool)
        if (msg.command === 'canvasReady') {
            console.log('[SnapStak] Drawing canvas ready.');
        }
        if (msg.command === 'layersUpdate') {
            _sidebarView?.webview.postMessage({ command: 'layersUpdate', layers: msg.layers });
        }
        if (msg.command === 'imagePlaced') {
            _sidebarView?.webview.postMessage(msg);
        }
        if (msg.command === 'ellipseResized') {
            _sidebarView?.webview.postMessage(msg);
        }
        if (msg.command === 'ellipseSelected') {
            _sidebarView?.webview.postMessage(msg);
        }
        if (msg.command === 'rectSelected') {
            _sidebarView?.webview.postMessage(msg);
        }
        if (msg.command === 'rectResized') {
            _sidebarView?.webview.postMessage(msg);
        }
        if (msg.command === 'polySelected') {
            _sidebarView?.webview.postMessage(msg);
        }
        if (msg.command === 'polyResized') {
            _sidebarView?.webview.postMessage(msg);
        }
    });
    _panel.onDidDispose(() => { _panel = undefined; });
}
// ─────────────────────────────────────────────────────────────
// HTML
// ─────────────────────────────────────────────────────────────
function getHtml() {
    const NL = '\n';
    return [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head>',
        '<meta charset="UTF-8">',
        '<meta name="viewport" content="width=device-width,initial-scale=1">',
        '<meta http-equiv="Content-Security-Policy" content="default-src \'none\';style-src \'unsafe-inline\';script-src \'unsafe-inline\';img-src data: blob:;">',
        '<title>Drawing Canvas</title>',
        '<style>' + getCss() + '</style>',
        '</head>',
        '<body>',
        getBody(),
        '<script>(function(){\n\'use strict\';\n' + getJs() + '\n})();</script>',
        '</body>',
        '</html>'
    ].join(NL);
}
// ─────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────
function getCss() {
    return `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#111;color:#ccc;font-family:var(--vscode-font-family,'Segoe UI',sans-serif);font-size:13px;overflow:hidden}
.root{display:flex;flex-direction:column;height:100vh}

/* ── TOOLBAR ── */
.toolbar{display:flex;align-items:center;gap:6px;padding:6px 10px;background:#212121;border-bottom:1px solid #333;flex-shrink:0;flex-wrap:wrap}
.sep{width:1px;height:28px;background:#333;margin:0 2px}
.tbtn{display:flex;align-items:center;gap:5px;padding:5px 10px;background:#2a2a2a;border:1px solid #444;border-radius:5px;color:#aaa;font-size:11px;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap}
.tbtn:hover{background:#333;border-color:#38BDF8;color:#fff}
.tbtn svg{width:13px;height:13px}
.zoom-lbl{font-size:11px;color:#888;padding:4px 8px;background:#1e1e1e;border:1px solid #333;border-radius:4px;min-width:46px;text-align:center}

/* ── THEME BAR ── */
.theme-group{display:flex;align-items:center;gap:6px;margin-left:auto}
.theme-lbl{font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:#555;margin-right:2px}
.component-name-input{height:24px;padding:0 8px;background:#1e1e1e;border:1px solid #333;border-radius:4px;color:#ccc;font-size:11px;font-family:var(--vscode-font-family,'Segoe UI',sans-serif);outline:none;width:140px;margin-right:6px;}
.component-name-input::placeholder{color:#555}
.component-name-input:focus{border-color:#38BDF8;color:#fff}
.theme-btn{width:18px;height:18px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:border-color .15s,transform .1s;flex-shrink:0;position:relative;padding:0;background:none}
.theme-btn:hover{transform:scale(1.2)}
.theme-btn.active{border-color:#38BDF8}
.theme-btn-white{background:#ffffff}
.theme-btn-grey {background:#888888}
.theme-btn-black{background:#111111;outline:1px solid #555;outline-offset:1px}
.theme-btn-color{background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red);overflow:hidden}
.theme-btn-color input[type=color]{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;border:none;padding:0}

/* ── CANVAS VIEWPORT ── */
.canvas-wrap{flex:1;position:relative;overflow:hidden;background-color:#ffffff;}
.canvas-stage{position:absolute;top:0;left:0;transform-origin:0 0;will-change:transform}

/* Cursor coords badge */
.coords{font-size:10px;color:#555;padding:3px 8px;background:#1e1e1e;border-radius:4px;border:1px solid #2a2a2a;font-family:monospace;min-width:100px}

/* ── RECT ELEMENTS ── */
.dc-rect{position:absolute;cursor:move;box-sizing:border-box;}
.dc-rect.selected{outline:none;}

/* Selection overlay — dashed purple border drawn via SVG */
.dc-sel-svg{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;}

/* Resize handles */
.dc-handle{
  position:absolute;
  width:10px;height:10px;
  background:#ffffff;
  border:1.5px solid #9333ea;
  border-radius:2px;
  box-sizing:border-box;
  z-index:10;
  cursor:nwse-resize;
}
.dc-handle[data-h="tl"]{top:-5px;  left:-5px;  cursor:nw-resize;}
.dc-handle[data-h="tr"]{top:-5px;  right:-5px; cursor:ne-resize;}
.dc-handle[data-h="bl"]{bottom:-5px;left:-5px;  cursor:sw-resize;}
.dc-handle[data-h="br"]{bottom:-5px;right:-5px; cursor:se-resize;}

/* ── ELLIPSE ELEMENTS ── */
.dc-ellipse{position:absolute;cursor:move;box-sizing:border-box;overflow:visible;}
.dc-ellipse.selected{outline:none;}
/* ── POLYGON ELEMENTS ── */
.dc-polygon{position:absolute;cursor:move;box-sizing:border-box;overflow:visible;}
.dc-polygon.selected{outline:none;}
/* ── LINE ELEMENTS ── */
.dc-line{position:absolute;cursor:move;box-sizing:border-box;overflow:visible;pointer-events:visibleStroke;}
.dc-line.selected{outline:none;}
/* ── PEN ELEMENTS ── */
.dc-pen{position:absolute;cursor:move;box-sizing:border-box;overflow:visible;pointer-events:visibleStroke;}
.dc-pen.selected{outline:none;}
/* ── BEZIER ELEMENTS ── */
.dc-bezier{position:absolute;cursor:move;box-sizing:border-box;overflow:visible;pointer-events:visibleStroke;}
.dc-bezier.selected{outline:none;}
/* ── TEXT ELEMENTS ── */
/* dc-text: the permanent display div shown when not editing */
.dc-text{position:absolute;cursor:move;box-sizing:border-box;white-space:pre-wrap;word-break:break-word;outline:none;pointer-events:all;user-select:none;}
.dc-text.selected{outline:1.5px dashed #9333ea;}
/* dc-text-editor: the textarea shown ONLY while editing, positioned over the display div */
.dc-text-editor{
  position:fixed;
  box-sizing:border-box;
  resize:none;
  overflow:hidden;
  border:1.5px dashed #9333ea;
  outline:none;
  background:#ffffff;
  padding:2px 4px;
  margin:0;
  z-index:10002;
  white-space:pre-wrap;
  word-break:break-word;
  cursor:text;
  caret-color:#9333ea;
  border-radius:0;
  box-shadow:0 0 0 2px rgba(147,51,234,0.15);
}
/* dc-text-drag-ghost: rectangle shown while dragging to define text box size */
.dc-text-ghost{position:absolute;pointer-events:none;box-sizing:border-box;outline:1.5px dashed #9333ea;background:rgba(147,51,234,0.05);}
/* dc-text-resize: bottom-right resize handle on fixed text boxes */
.dc-text-resize{position:absolute;width:9px;height:9px;background:#fff;border:1.5px solid #9333ea;border-radius:2px;cursor:nwse-resize;z-index:10001;pointer-events:all;}
/* ── BEZIER CONTROL ARM ── */
.dc-bez-arm{position:absolute;pointer-events:none;overflow:visible;z-index:9998;}
/* ── BEZIER CONTROL HANDLE (circular) ── */
.dc-bez-ctrl{
  position:absolute;
  width:8px;height:8px;
  background:#ffffff;
  border:1.5px solid #38BDF8;
  border-radius:50%;
  box-sizing:border-box;
  transform:translate(-50%,-50%);
  z-index:10001;
  cursor:crosshair;
  pointer-events:all;
}
/* ── NODE TOOL HANDLES ── */
.dc-node-handle{
  position:absolute;
  width:9px;height:9px;
  background:#38BDF8;
  border:1.5px solid #0ea5e9;
  transform:translate(-50%,-50%) rotate(45deg);
  box-sizing:border-box;
  z-index:10000;
  cursor:crosshair;
  pointer-events:all;
}
.dc-node-handle:hover{ background:#ffffff; border-color:#38BDF8; }
/* ── IMAGE ELEMENTS ── */
.dc-image{position:absolute;cursor:move;box-sizing:border-box;overflow:hidden;}
.dc-image.selected{outline:none;}
.dc-image img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;pointer-events:none;display:block;}
/* Ghost preview for freestanding image drop */
.dc-image-ghost{position:absolute;pointer-events:none;box-sizing:border-box;outline:1.5px dashed #9333ea;background:rgba(147,51,234,0.06);display:flex;align-items:center;justify-content:center;z-index:99998;}
.dc-image-ghost svg{opacity:0.35;}
`;
}
// ─────────────────────────────────────────────────────────────
// BODY
// ─────────────────────────────────────────────────────────────
function getBody() {
    return `
<div class="root">
  <div class="toolbar" id="toolbar">
    <button class="tbtn" id="btnZoomIn" title="Zoom in">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="7" cy="7" r="5"/>
        <line x1="7" y1="4" x2="7" y2="10"/>
        <line x1="4" y1="7" x2="10" y2="7"/>
        <line x1="11" y1="11" x2="14" y2="14"/>
      </svg>
    </button>
    <span class="zoom-lbl" id="zoomLbl">100%</span>
    <button class="tbtn" id="btnZoomOut" title="Zoom out">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="7" cy="7" r="5"/>
        <line x1="4" y1="7" x2="10" y2="7"/>
        <line x1="11" y1="11" x2="14" y2="14"/>
      </svg>
    </button>
    <button class="tbtn" id="btnReset" title="Reset view">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M3 8a5 5 0 1 0 1-3"/>
        <polyline points="1,3 3,8 8,6"/>
      </svg>
      Reset
    </button>
    <div class="sep"></div>
    <span class="coords" id="coords">X: &mdash; &nbsp; Y: &mdash;</span>
    <div class="theme-group">
      <input type="text" class="component-name-input" id="componentNameInput" placeholder="Component name" title="Component name">
      <span class="theme-lbl">Background</span>
      <button class="theme-btn theme-btn-white active" data-theme="white" title="White"></button>
      <button class="theme-btn theme-btn-grey"         data-theme="grey"  title="Grey"></button>
      <button class="theme-btn theme-btn-black"        data-theme="black" title="Black"></button>
      <button class="theme-btn theme-btn-color"        data-theme="custom" title="Custom">
        <input type="color" id="bgColorPicker" value="#ffffff" tabindex="-1">
      </button>
    </div>
  </div>
  <div class="canvas-wrap" id="canvasWrap">
    <div class="canvas-stage" id="canvasStage"></div>
  </div>
</div>

`;
}
// ─────────────────────────────────────────────────────────────
// JAVASCRIPT
// ─────────────────────────────────────────────────────────────
function getJs() {
    return `
var vscodeApi = (typeof acquireVsCodeApi !== 'undefined') ? acquireVsCodeApi() : null;

// ── DEBUG LOGGER ─────────────────────────────────────────────


// ── Global state ──────────────────────────────────────────────
var S = { zoom:1, panX:0, panY:0, tool:'rect', bgColor:'#ffffff' };
var ZOOM_MIN = 0.1, ZOOM_MAX = 5;

// Current rect properties received from sidebar
var PROPS = {
  fill    : { color:'#ffffff', opacity:1 },
  stroke  : { color:'#000000', opacity:1, weight:1, style:'solid' },
  radius  : 0,
  gradient: null,
  shadow  : null
};

// Current ellipse properties received from sidebar
var EPROPS = {
  fill    : { color:'#ffffff', opacity:1 },
  stroke  : { color:'#000000', opacity:1, weight:1, style:'solid' },
  gradient: null,
  shadow  : null
};

// Current polygon properties received from sidebar
var PPROPS = {
  fill    : { color:'#ffffff', opacity:1 },
  stroke  : { color:'#000000', opacity:1, weight:1, style:'solid' },
  sides   : 6,
  radius  : 0,
  gradient: null,
  shadow  : null
};

// Current line properties received from sidebar
var LPROPS = {
  stroke : { color:'#000000', opacity:1, weight:2, style:'solid' },
  shadow : null
};

// Current pen properties received from sidebar
var PENPROPS = {
  stroke : { color:'#000000', opacity:1, weight:2, style:'solid' },
  shadow : null
};

// Current bezier properties received from sidebar
var BEZPROPS = {
  stroke : { color:'#000000', opacity:1, weight:2, style:'solid' },
  shadow : null
};

// ── Object naming & layer registry ───────────────────────────
var _nameCounters = { rect:0, ellipse:0, polygon:0, line:0, pen:0, bezier:0, text:0, icon:0, image:0 };

var ICONPROPS = { color:'#000000', colorOpacity:1, w:48, h:48, stroke:null, shadow:null };

// Current image properties received from sidebar
var IMGPROPS = { mode:'free', clipUid:null, src:null, aiTool:null, w:200, h:150, r:0, shadow:null };
function nextName(type) {
  _nameCounters[type] = (_nameCounters[type] || 0) + 1;
  var label = type.charAt(0).toUpperCase() + type.slice(1);
  return label + ' ' + _nameCounters[type];
}

function broadcastLayers() {
  if (!vscodeApi) { return; }
  var items = [];
  var children = canvasStage ? Array.from(canvasStage.children) : [];
  for (var i = children.length - 1; i >= 0; i--) {
    var el = children[i];
    if (el.classList.contains('dc-rect') || el.classList.contains('dc-ellipse') || el.classList.contains('dc-polygon') || el.classList.contains('dc-line') || el.classList.contains('dc-pen') || el.classList.contains('dc-bezier') || el.classList.contains('dc-text') || el.classList.contains('dc-icon') || el.classList.contains('dc-image')) {
      items.push({ uid: el._uid, name: el._name || el._uid, type: el._type, selected: !!el._selected });
    }
  }
  vscodeApi.postMessage({ command: 'layersUpdate', layers: items });
}

function findByUid(uid) {
  if (!canvasStage) { return null; }
  var children = Array.from(canvasStage.children);
  for (var i = 0; i < children.length; i++) {
    if (children[i]._uid === uid) { return children[i]; }
  }
  return null;
}

// ── DOM refs ──────────────────────────────────────────────────
var canvasWrap  = document.getElementById('canvasWrap');
var canvasStage = document.getElementById('canvasStage');
var zoomLbl     = document.getElementById('zoomLbl');
var coordsEl    = document.getElementById('coords');
var bgPicker    = document.getElementById('bgColorPicker');

// ── Pan/zoom ──────────────────────────────────────────────────
function applyXform() {
  canvasStage.style.transform = 'translate('+S.panX+'px,'+S.panY+'px) scale('+S.zoom+')';
  zoomLbl.textContent = Math.round(S.zoom * 100) + '%';
}
function zoomAt(cx, cy, delta) {
  var nz = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, S.zoom * delta));
  var sc = nz / S.zoom;
  S.panX = cx - sc*(cx - S.panX);
  S.panY = cy - sc*(cy - S.panY);
  S.zoom = nz;
  applyXform();
}
canvasWrap.addEventListener('wheel', function(e) {
  e.preventDefault();
  var rc = canvasWrap.getBoundingClientRect();
  zoomAt(e.clientX - rc.left, e.clientY - rc.top, e.deltaY < 0 ? 1.1 : 1/1.1);
}, { passive:false });

document.getElementById('btnZoomIn').addEventListener('click', function() {
  var rc = canvasWrap.getBoundingClientRect();
  zoomAt(rc.width/2, rc.height/2, 1.25);
});
document.getElementById('btnZoomOut').addEventListener('click', function() {
  var rc = canvasWrap.getBoundingClientRect();
  zoomAt(rc.width/2, rc.height/2, 1/1.25);
});
document.getElementById('btnReset').addEventListener('click', function() {
  S.zoom=1; S.panX=0; S.panY=0; applyXform();
});

// ── Pan (middle-mouse or Space+drag) ─────────────────────────
var _pan = { active:false, sx:0, sy:0, ox:0, oy:0 };
var _space = false;

document.addEventListener('keydown', function(e){ if(e.code==='Space'){ _space=true;  canvasWrap.style.cursor='grab'; }});
document.addEventListener('keyup',   function(e){ if(e.code==='Space'){ _space=false; canvasWrap.style.cursor=''; }});

// ── Canvas coordinate helper ──────────────────────────────────
// Cached rect for drag operations - set once on pointerdown, never during pointermove
var _dragRc = null;

function toCanvas(clientX, clientY) {
  var rc = canvasWrap.getBoundingClientRect();
  return {
    x: (clientX - rc.left - S.panX) / S.zoom,
    y: (clientY - rc.top  - S.panY) / S.zoom
  };
}

// Use cached rect during active drag - eliminates drift from repeated getBoundingClientRect calls
function toCanvasCached(clientX, clientY) {
  var rc = _dragRc || canvasWrap.getBoundingClientRect();
  return {
    x: (clientX - rc.left - S.panX) / S.zoom,
    y: (clientY - rc.top  - S.panY) / S.zoom
  };
}

// ── Helpers: colour with opacity ──────────────────────────────
function colorWithOpacity(hex, opacity) {
  if (!hex || hex === 'none' || hex === 'transparent') { return 'transparent'; }
  // hex may be rgb(...) from computed style — handle both
  if (hex.startsWith('rgb')) {
    var parts = hex.match(/\\d+/g);
    if (parts && parts.length >= 3) {
      return 'rgba('+parts[0]+','+parts[1]+','+parts[2]+','+(opacity||1)+')';
    }
  }
  // parse 6-digit hex
  var r = parseInt(hex.slice(1,3),16);
  var g = parseInt(hex.slice(3,5),16);
  var b = parseInt(hex.slice(5,7),16);
  if (isNaN(r)) { return hex; }
  return 'rgba('+r+','+g+','+b+','+(opacity||1)+')';
}

function buildStrokeDash(style, weight) {
  if (style === 'dashed') { return String(weight*4)+','+String(weight*3); }
  if (style === 'dotted') { return String(weight)+','+String(weight*2); }
  return 'none';
}

function buildBoxShadow(shadow) {
  if (!shadow) { return 'none'; }
  var off     = shadow.offset  || 0;
  var blur    = shadow.feather || 0;
  var spread  = shadow.size    || 0;
  return off+'px '+off+'px '+blur+'px '+spread+'px '+colorWithOpacity(shadow.color, shadow.opacity);
}

function buildBackground(fill, gradient) {
  if (gradient) {
    var stops = gradient.stops.map(function(s) {
      return colorWithOpacity(s.color, s.opacity) + ' ' + s.pos + '%';
    }).join(',');
    if (gradient.type === 'linear') {
      return 'linear-gradient('+gradient.angle+'deg,'+stops+')';
    }
    if (gradient.type === 'radial') {
      return 'radial-gradient(circle at 50% 50%,'+stops+')';
    }
    if (gradient.type === 'diamond') {
      return 'radial-gradient(ellipse 60% 100% at 50% 50%,'+stops+')';
    }
    if (gradient.type === 'square') {
      return 'radial-gradient(ellipse farthest-corner at 50% 50%,'+stops+')';
    }
  }
  return colorWithOpacity(fill.color, fill.opacity);
}


// ── Apply visual props to a rect element ─────────────────────
function applyPropsToRect(el, props) {
  el.style.background   = buildBackground(props.fill, props.gradient);
  el.style.borderRadius = (props.radius || 0) + 'px';
  el.style.boxShadow    = buildBoxShadow(props.shadow);

  // stroke via outline (so it doesn't affect layout)
  if (props.stroke && props.stroke.color !== 'none' && props.stroke.color !== 'transparent' && props.stroke.weight > 0) {
    var sc    = colorWithOpacity(props.stroke.color, props.stroke.opacity);
    var sw    = props.stroke.weight;
    var dash  = buildStrokeDash(props.stroke.style, sw);
    if (dash !== 'none') {
      // Use SVG overlay for dashed stroke
      el.style.outline = 'none';
      ensureStrokeSvg(el, sc, sw, dash, props.radius || 0);
    } else {
      el.style.outline = sw + 'px solid ' + sc;
      el.style.outlineOffset = '-' + sw + 'px';
      removeStrokeSvg(el);
    }
  } else {
    el.style.outline = 'none';
    removeStrokeSvg(el);
  }
}

function ensureStrokeSvg(el, color, weight, dash, radius) {
  var svg = el.querySelector('.dc-stroke-svg');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class','dc-stroke-svg');
    svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;';
    el.insertBefore(svg, el.firstChild);
  }
  var rect = svg.querySelector('rect');
  if (!rect) {
    rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    svg.appendChild(rect);
  }
  var w = el.offsetWidth  || 100;
  var h = el.offsetHeight || 100;
  var hw = weight / 2;
  rect.setAttribute('x', String(hw));
  rect.setAttribute('y', String(hw));
  rect.setAttribute('width',  String(Math.max(1, w - weight)));
  rect.setAttribute('height', String(Math.max(1, h - weight)));
  rect.setAttribute('rx', String(radius));
  rect.setAttribute('fill', 'none');
  rect.setAttribute('stroke', color);
  rect.setAttribute('stroke-width', String(weight));
  rect.setAttribute('stroke-dasharray', dash);
}

function removeStrokeSvg(el) {
  var svg = el.querySelector('.dc-stroke-svg');
  if (svg) { svg.remove(); }
}

// ── Selection overlay ─────────────────────────────────────────
var _selected = null;   // currently selected rect element

function selectRect(el) {
  deselectAll();
  _selected = el;
  el._selected = true;
  el.classList.add('selected');
  addHandles(el);
  addSelectionBorder(el);
  if (vscodeApi) { vscodeApi.postMessage({ command: 'rectSelected', w: el._rw, h: el._rh }); }
  broadcastLayers();
}

function deselectAll() {
  // If a text editor is open, commit it first
  if (_activeTextEditor) { commitTextEditor(); }
  if (_selected) {
    _selected._selected = false;
    _selected.classList.remove('selected');
    removeHandles(_selected);
    removeSelectionBorder(_selected);
    _selected = null;
  }
  deselectAllEllipses();
  deselectAllPolygons();
  deselectAllLines();
  deselectAllPens();
  deselectAllBez();
  deselectAllTexts();
  deselectAllIcons();
  deselectAllImages();
  clearAllNodeHandles();
}

function addSelectionBorder(el) {
  removeSelectionBorder(el);
  var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','dc-sel-svg');
  var rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
  var r = el._props ? (el._props.radius || 0) : 0;
  rect.setAttribute('x','2'); rect.setAttribute('y','2');
  rect.setAttribute('width','calc(100% - 4px)'); // fallback below
  rect.setAttribute('fill','none');
  rect.setAttribute('stroke','#9333ea');
  rect.setAttribute('stroke-width','1.5');
  rect.setAttribute('stroke-dasharray','6,4');
  rect.setAttribute('rx', String(r));
  svg.appendChild(rect);
  el.appendChild(svg);
  // set actual width/height after layout
  requestAnimationFrame(function() {
    rect.setAttribute('width',  String(Math.max(1, el.offsetWidth  - 4)));
    rect.setAttribute('height', String(Math.max(1, el.offsetHeight - 4)));
  });
}

function removeSelectionBorder(el) {
  var svg = el.querySelector('.dc-sel-svg');
  if (svg) { svg.remove(); }
}

function addHandles(el) {
  removeHandles(el);
  ['tl','tr','bl','br'].forEach(function(pos) {
    var h = document.createElement('div');
    h.className = 'dc-handle';
    h.dataset.h = pos;
    el.appendChild(h);
    wireHandle(el, h);
  });
}

function removeHandles(el) {
  el.querySelectorAll('.dc-handle').forEach(function(h){ h.remove(); });
}

// ── Handle resize ─────────────────────────────────────────────
function wireHandle(el, handle) {
  handle.addEventListener('pointerdown', function(e) {
    e.stopPropagation();
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    _dragRc = canvasWrap.getBoundingClientRect();

    var startClient = { x: e.clientX, y: e.clientY };
    var startRect   = { x: el._rx, y: el._ry, w: el._rw, h: el._rh };
    var pos         = handle.dataset.h;

    function onMove(ev) {
      var dx = (ev.clientX - startClient.x) / S.zoom;
      var dy = (ev.clientY - startClient.y) / S.zoom;
      var nx = startRect.x, ny = startRect.y, nw = startRect.w, nh = startRect.h;

      if (pos === 'tl') { nx += dx; ny += dy; nw -= dx; nh -= dy; }
      if (pos === 'tr') {            ny += dy; nw += dx; nh -= dy; }
      if (pos === 'bl') { nx += dx;            nw -= dx; nh += dy; }
      if (pos === 'br') {                       nw += dx; nh += dy; }

      // Shift: constrain to square
      if (ev.shiftKey) {
        var s = Math.max(10, Math.min(nw, nh));
        if (pos === 'tl') { nx = startRect.x + startRect.w - s; ny = startRect.y + startRect.h - s; }
        if (pos === 'tr') { ny = startRect.y + startRect.h - s; }
        if (pos === 'bl') { nx = startRect.x + startRect.w - s; }
        nw = s; nh = s;
      }

      // minimum size
      if (nw < 10) { nw = 10; if (pos==='tl'||pos==='bl') { nx = startRect.x + startRect.w - 10; } }
      if (nh < 10) { nh = 10; if (pos==='tl'||pos==='tr') { ny = startRect.y + startRect.h - 10; } }

      el._rx = nx; el._ry = ny; el._rw = nw; el._rh = nh;
      positionRect(el);
      // Update sel border
      var selRect = el.querySelector('.dc-sel-svg rect');
      if (selRect) {
        selRect.setAttribute('width',  String(Math.max(1, nw - 4)));
        selRect.setAttribute('height', String(Math.max(1, nh - 4)));
      }
      // Update stroke svg if present
      var strokeSvg = el.querySelector('.dc-stroke-svg rect');
      if (strokeSvg && el._props) {
        var sw = el._props.stroke ? el._props.stroke.weight : 1;
        var hw = sw / 2;
        strokeSvg.setAttribute('width',  String(Math.max(1, nw - sw)));
        strokeSvg.setAttribute('height', String(Math.max(1, nh - sw)));
      }
    }
    function onUp() {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup',   onUp);
      _dragRc = null;
      if (vscodeApi) { vscodeApi.postMessage({ command: 'rectResized', w: el._rw, h: el._rh }); }
    }
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup',   onUp);
  });
}

// ── Rect positioning ──────────────────────────────────────────
function positionRect(el) {
  el.style.left   = el._rx + 'px';
  el.style.top    = el._ry + 'px';
  el.style.width  = el._rw + 'px';
  el.style.height = el._rh + 'px';
}

// ── Draw rect on canvas ───────────────────────────────────────
var _draw = { active:false, sx:0, sy:0, ghost:null };

function startDraw(canvasX, canvasY) {
  _draw.active = true;
  _draw.sx = canvasX;
  _draw.sy = canvasY;

  // Ghost preview element
  var g = document.createElement('div');
  g.className = 'dc-rect';
  g.style.cssText = 'pointer-events:none;outline:1.5px dashed #9333ea;background:rgba(147,51,234,0.08);';
  g.style.left = canvasX + 'px';
  g.style.top  = canvasY + 'px';
  g.style.width  = '0px';
  g.style.height = '0px';
  canvasStage.appendChild(g);
  _draw.ghost = g;
}

function updateDraw(canvasX, canvasY, shift) {
  if (!_draw.active || !_draw.ghost) { return; }
  var x = Math.min(canvasX, _draw.sx);
  var y = Math.min(canvasY, _draw.sy);
  var w = Math.abs(canvasX - _draw.sx);
  var h = Math.abs(canvasY - _draw.sy);
  if (shift) {
    var s = Math.min(w, h);
    x = canvasX < _draw.sx ? _draw.sx - s : _draw.sx;
    y = canvasY < _draw.sy ? _draw.sy - s : _draw.sy;
    w = s; h = s;
  }
  _draw.ghost.style.left   = x + 'px';
  _draw.ghost.style.top    = y + 'px';
  _draw.ghost.style.width  = w + 'px';
  _draw.ghost.style.height = h + 'px';

  // Cursor follows the expanding corner
  var goingRight = canvasX >= _draw.sx;
  var goingDown  = canvasY >= _draw.sy;
  canvasWrap.style.cursor = (goingRight === goingDown) ? 'nwse-resize' : 'nesw-resize';
}

function finishDraw(canvasX, canvasY, shift) {
  if (!_draw.active) { return; }
  _draw.active = false;

  var x = Math.min(canvasX, _draw.sx);
  var y = Math.min(canvasY, _draw.sy);
  var w = Math.abs(canvasX - _draw.sx);
  var h = Math.abs(canvasY - _draw.sy);
  if (shift) {
    var s = Math.min(w, h);
    x = canvasX < _draw.sx ? _draw.sx - s : _draw.sx;
    y = canvasY < _draw.sy ? _draw.sy - s : _draw.sy;
    w = s; h = s;
  }

  if (_draw.ghost) { _draw.ghost.remove(); _draw.ghost = null; }
  canvasWrap.style.cursor = 'crosshair';

  // Minimum meaningful size
  if (w < 4 || h < 4) { return; }

  // Create the real rect
  var el = document.createElement('div');
  el.className = 'dc-rect';
  el._rx = x; el._ry = y; el._rw = w; el._rh = h;
  el._props = JSON.parse(JSON.stringify(PROPS));
  el._uid  = 'r' + Date.now() + Math.random().toString(36).slice(2,5);
  el._name = nextName('rect');
  el._type = 'rect';
  positionRect(el);
  applyPropsToRect(el, el._props);
  canvasStage.appendChild(el);

  // Wire move
  wireMove(el);

  // Select it
  selectRect(el);
  broadcastLayers();
}

// ── Move rect ─────────────────────────────────────────────────
function wireMove(el) {
  el.addEventListener('pointerdown', function(e) {
    // Ignore handle clicks
    if (e.target.classList.contains('dc-handle')) { return; }
    if (e.button !== 0 || _space) { return; }
    e.stopPropagation();

    selectRect(el);
    el.setPointerCapture(e.pointerId);

    var startClient = { x: e.clientX, y: e.clientY };
    var startPos    = { x: el._rx, y: el._ry };

    function onMove(ev) {
      var dx = (ev.clientX - startClient.x) / S.zoom;
      var dy = (ev.clientY - startClient.y) / S.zoom;
      el._rx = startPos.x + dx;
      el._ry = startPos.y + dy;
      positionRect(el);
    }
    function onUp() {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup',   onUp);
    }
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup',   onUp);
  });
}

// ── ELLIPSE DRAW ENGINE ───────────────────────────────────────
var _edraw = { active:false, sx:0, sy:0, ghost:null };

function startEllipse(canvasX, canvasY) {
  _edraw.active = true;
  _edraw.sx = canvasX;
  _edraw.sy = canvasY;
  var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.style.cssText = 'position:absolute;top:0;left:0;overflow:visible;pointer-events:none;';
  svg.style.left = canvasX + 'px';
  svg.style.top  = canvasY + 'px';
  svg.setAttribute('width','0');
  svg.setAttribute('height','0');
  var el = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
  el.setAttribute('cx','0'); el.setAttribute('cy','0');
  el.setAttribute('rx','0'); el.setAttribute('ry','0');
  el.setAttribute('fill','rgba(147,51,234,0.08)');
  el.setAttribute('stroke','#9333ea');
  el.setAttribute('stroke-width','1.5');
  el.setAttribute('stroke-dasharray','6,4');
  svg.appendChild(el);
  canvasStage.appendChild(svg);
  _edraw.ghost = svg;
}

function updateEllipse(canvasX, canvasY, shift) {
  if (!_edraw.active || !_edraw.ghost) { return; }
  var x  = Math.min(canvasX, _edraw.sx);
  var y  = Math.min(canvasY, _edraw.sy);
  var w  = Math.abs(canvasX - _edraw.sx);
  var h  = Math.abs(canvasY - _edraw.sy);
  if (shift) {
    var s = Math.min(w, h);
    x = canvasX < _edraw.sx ? _edraw.sx - s : _edraw.sx;
    y = canvasY < _edraw.sy ? _edraw.sy - s : _edraw.sy;
    w = s; h = s;
  }
  var rx = w / 2;
  var ry = h / 2;
  _edraw.ghost.style.left = x + 'px';
  _edraw.ghost.style.top  = y + 'px';
  _edraw.ghost.setAttribute('width',  String(w));
  _edraw.ghost.setAttribute('height', String(h));
  var el = _edraw.ghost.querySelector('ellipse');
  el.setAttribute('cx', String(rx)); el.setAttribute('cy', String(ry));
  el.setAttribute('rx', String(rx)); el.setAttribute('ry', String(ry));

  // Cursor follows the expanding corner
  var goingRight = canvasX >= _edraw.sx;
  var goingDown  = canvasY >= _edraw.sy;
  canvasWrap.style.cursor = (goingRight === goingDown) ? 'nwse-resize' : 'nesw-resize';
}

function finishEllipse(canvasX, canvasY, shift) {
  if (!_edraw.active) { return; }
  _edraw.active = false;
  var x = Math.min(canvasX, _edraw.sx);
  var y = Math.min(canvasY, _edraw.sy);
  var w = Math.abs(canvasX - _edraw.sx);
  var h = Math.abs(canvasY - _edraw.sy);
  if (shift) {
    var s = Math.min(w, h);
    x = canvasX < _edraw.sx ? _edraw.sx - s : _edraw.sx;
    y = canvasY < _edraw.sy ? _edraw.sy - s : _edraw.sy;
    w = s; h = s;
  }
  if (_edraw.ghost) { _edraw.ghost.remove(); _edraw.ghost = null; }
  canvasWrap.style.cursor = 'crosshair';
  if (w < 4 || h < 4) { return; }

  var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','dc-ellipse');
  svg.setAttribute('width',  String(w));
  svg.setAttribute('height', String(h));
  svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
  svg.style.left          = x + 'px';
  svg.style.top           = y + 'px';
  svg.style.width         = w + 'px';
  svg.style.height        = h + 'px';
  svg.style.position      = 'absolute';
  svg.style.overflow      = 'visible';
  svg.style.pointerEvents = 'all';

  svg._rx = x; svg._ry = y; svg._rw = w; svg._rh = h;
  svg._props = JSON.parse(JSON.stringify(EPROPS));
  svg._uid  = 'e' + Date.now() + Math.random().toString(36).slice(2,5);
  svg._name = nextName('ellipse');
  svg._type = 'ellipse';

  buildEllipseSvg(svg, w, h, svg._props);
  canvasStage.appendChild(svg);
  wireEllipseMove(svg);
  selectEllipse(svg);
  broadcastLayers();
}

// ── POLYGON DRAW ENGINE ───────────────────────────────────────
var _pdraw = { active:false, sx:0, sy:0, ghost:null };
var _selectedPoly = null;

function polyVertices(cx, cy, rx, ry, sides) {
  var pts = [];
  for (var i = 0; i < sides; i++) {
    var angle = (Math.PI * 2 * i / sides) - Math.PI / 2;
    pts.push({ x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) });
  }
  return pts;
}

function polyPoints(cx, cy, rx, ry, sides) {
  return polyVertices(cx, cy, rx, ry, sides).map(function(p){ return p.x.toFixed(2)+','+p.y.toFixed(2); }).join(' ');
}

function polyPath(cx, cy, rx, ry, sides, radius) {
  var pts = polyVertices(cx, cy, rx, ry, sides);
  if (!radius || radius <= 0) {
    return 'M'+pts.map(function(p){ return p.x.toFixed(2)+','+p.y.toFixed(2); }).join('L')+'Z';
  }
  var n = pts.length;
  var d = '';
  for (var i = 0; i < n; i++) {
    var prev = pts[(i + n - 1) % n];
    var curr = pts[i];
    var next = pts[(i + 1) % n];
    var dx1 = prev.x - curr.x; var dy1 = prev.y - curr.y;
    var dx2 = next.x - curr.x; var dy2 = next.y - curr.y;
    var len1 = Math.sqrt(dx1*dx1 + dy1*dy1);
    var len2 = Math.sqrt(dx2*dx2 + dy2*dy2);
    var r = Math.min(radius, len1 / 2, len2 / 2);
    var ax = curr.x + (dx1 / len1) * r; var ay = curr.y + (dy1 / len1) * r;
    var bx = curr.x + (dx2 / len2) * r; var by = curr.y + (dy2 / len2) * r;
    if (i === 0) { d += 'M'+ax.toFixed(2)+','+ay.toFixed(2); }
    else         { d += 'L'+ax.toFixed(2)+','+ay.toFixed(2); }
    d += 'Q'+curr.x.toFixed(2)+','+curr.y.toFixed(2)+' '+bx.toFixed(2)+','+by.toFixed(2);
  }
  return d + 'Z';
}

function startPolygon(canvasX, canvasY) {
  _pdraw.active = true;
  _pdraw.sx = canvasX;
  _pdraw.sy = canvasY;
  var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.style.cssText = 'position:absolute;overflow:visible;pointer-events:none;';
  svg.style.left = canvasX + 'px';
  svg.style.top  = canvasY + 'px';
  svg.setAttribute('width','0');
  svg.setAttribute('height','0');
  var poly = document.createElementNS('http://www.w3.org/2000/svg','polygon');
  poly.setAttribute('fill','rgba(147,51,234,0.08)');
  poly.setAttribute('stroke','#9333ea');
  poly.setAttribute('stroke-width','1.5');
  poly.setAttribute('stroke-dasharray','6,4');
  svg.appendChild(poly);
  canvasStage.appendChild(svg);
  _pdraw.ghost = svg;
}

function updatePolygon(canvasX, canvasY, shift) {
  if (!_pdraw.active || !_pdraw.ghost) { return; }
  var x = Math.min(canvasX, _pdraw.sx);
  var y = Math.min(canvasY, _pdraw.sy);
  var w = Math.abs(canvasX - _pdraw.sx);
  var h = Math.abs(canvasY - _pdraw.sy);
  if (shift) {
    var s = Math.min(w, h);
    x = canvasX < _pdraw.sx ? _pdraw.sx - s : _pdraw.sx;
    y = canvasY < _pdraw.sy ? _pdraw.sy - s : _pdraw.sy;
    w = s; h = s;
  }
  var rx = w / 2; var ry = h / 2;
  _pdraw.ghost.style.left = x + 'px';
  _pdraw.ghost.style.top  = y + 'px';
  _pdraw.ghost.setAttribute('width',  String(w));
  _pdraw.ghost.setAttribute('height', String(h));
  var poly = _pdraw.ghost.querySelector('polygon');
  poly.setAttribute('points', polyPoints(rx, ry, rx, ry, PPROPS.sides || 6));
  var goingRight = canvasX >= _pdraw.sx;
  var goingDown  = canvasY >= _pdraw.sy;
  canvasWrap.style.cursor = (goingRight === goingDown) ? 'nwse-resize' : 'nesw-resize';
}

function finishPolygon(canvasX, canvasY, shift) {
  if (!_pdraw.active) { return; }
  _pdraw.active = false;
  var x = Math.min(canvasX, _pdraw.sx);
  var y = Math.min(canvasY, _pdraw.sy);
  var w = Math.abs(canvasX - _pdraw.sx);
  var h = Math.abs(canvasY - _pdraw.sy);
  if (shift) {
    var s = Math.min(w, h);
    x = canvasX < _pdraw.sx ? _pdraw.sx - s : _pdraw.sx;
    y = canvasY < _pdraw.sy ? _pdraw.sy - s : _pdraw.sy;
    w = s; h = s;
  }
  if (_pdraw.ghost) { _pdraw.ghost.remove(); _pdraw.ghost = null; }
  canvasWrap.style.cursor = 'crosshair';
  if (w < 4 || h < 4) { return; }

  var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','dc-polygon');
  svg.setAttribute('width',  String(w));
  svg.setAttribute('height', String(h));
  svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
  svg.style.left = x + 'px'; svg.style.top = y + 'px';
  svg.style.width = w + 'px'; svg.style.height = h + 'px';
  svg.style.position = 'absolute'; svg.style.overflow = 'visible';
  svg._rx = x; svg._ry = y; svg._rw = w; svg._rh = h;
  svg._props = JSON.parse(JSON.stringify(PPROPS));
  svg._uid  = 'p' + Date.now() + Math.random().toString(36).slice(2,5);
  svg._name = nextName('polygon');
  svg._type = 'polygon';
  buildPolygonSvg(svg, w, h, svg._props);
  canvasStage.appendChild(svg);
  wirePolyMove(svg);
  selectPolygon(svg);
  broadcastLayers();
}

function buildPolygonSvg(svg, w, h, props) {
  var savedImgSrc = svg._imageSrc || null;
  while (svg.firstChild) { svg.removeChild(svg.firstChild); }
  svg.setAttribute('width',  String(w));
  svg.setAttribute('height', String(h));
  svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);

  var sides  = props.sides  || 6;
  var radius = props.radius || 0;
  var rx = w / 2; var ry = h / 2;
  var sw = (props.stroke && props.stroke.weight > 0) ? props.stroke.weight : 0;
  var uid = svg._uid || (svg._uid = 'p' + Math.random().toString(36).slice(2,7));
  var defs = document.createElementNS('http://www.w3.org/2000/svg','defs');

  // Fill
  var fillAttr = colorWithOpacity(props.fill.color, props.fill.opacity);
  if (props.gradient && props.gradient.stops) {
    var gradId = uid + '_grad';
    var gradEl;
    if (props.gradient.type === 'radial') {
      gradEl = document.createElementNS('http://www.w3.org/2000/svg','radialGradient');
      gradEl.setAttribute('id', gradId);
      gradEl.setAttribute('cx','50%'); gradEl.setAttribute('cy','50%'); gradEl.setAttribute('r','50%');
    } else {
      var angle = props.gradient.angle || 90;
      var rad = angle * Math.PI / 180;
      gradEl = document.createElementNS('http://www.w3.org/2000/svg','linearGradient');
      gradEl.setAttribute('id', gradId);
      gradEl.setAttribute('x1', (0.5 - 0.5 * Math.cos(rad)).toFixed(3));
      gradEl.setAttribute('y1', (0.5 - 0.5 * Math.sin(rad)).toFixed(3));
      gradEl.setAttribute('x2', (0.5 + 0.5 * Math.cos(rad)).toFixed(3));
      gradEl.setAttribute('y2', (0.5 + 0.5 * Math.sin(rad)).toFixed(3));
      gradEl.setAttribute('gradientUnits','objectBoundingBox');
    }
    props.gradient.stops.forEach(function(s) {
      var stop = document.createElementNS('http://www.w3.org/2000/svg','stop');
      stop.setAttribute('offset', s.pos + '%');
      stop.setAttribute('stop-color', colorWithOpacity(s.color, s.opacity));
      gradEl.appendChild(stop);
    });
    defs.appendChild(gradEl);
    fillAttr = 'url(#' + gradId + ')';
  }

  // Shadow filter
  if (props.shadow) {
    var sh = props.shadow;
    var fid = uid + '_shadow';
    var filt = document.createElementNS('http://www.w3.org/2000/svg','filter');
    filt.setAttribute('id', fid);
    filt.setAttribute('x','-50%'); filt.setAttribute('y','-50%');
    filt.setAttribute('width','200%'); filt.setAttribute('height','200%');
    var fds = document.createElementNS('http://www.w3.org/2000/svg','feDropShadow');
    fds.setAttribute('dx', String(sh.offset||0)); fds.setAttribute('dy', String(sh.offset||0));
    fds.setAttribute('stdDeviation', String(sh.feather||0));
    fds.setAttribute('flood-color', colorWithOpacity(sh.color, sh.opacity));
    fds.setAttribute('flood-opacity','1');
    filt.appendChild(fds);
    defs.appendChild(filt);
    svg.appendChild(defs);
    var shadowPoly = document.createElementNS('http://www.w3.org/2000/svg','path');
    shadowPoly.setAttribute('d', polyPath(rx, ry, rx+(sh.size||0), ry+(sh.size||0), sides, radius));
    shadowPoly.setAttribute('fill', colorWithOpacity(sh.color, sh.opacity));
    shadowPoly.setAttribute('filter', 'url(#'+fid+')');
    svg.appendChild(shadowPoly);
  } else {
    svg.appendChild(defs);
  }

  // Fill path
  var fillPoly = document.createElementNS('http://www.w3.org/2000/svg','path');
  fillPoly.setAttribute('d', polyPath(rx, ry, rx, ry, sides, radius));
  fillPoly.setAttribute('fill', fillAttr);
  fillPoly.setAttribute('stroke','none');
  svg.appendChild(fillPoly);

  // Stroke polygon
  if (sw > 0 && props.stroke && props.stroke.color !== 'none' && props.stroke.color !== 'transparent') {
    var sc = colorWithOpacity(props.stroke.color, props.stroke.opacity);
    var dash = buildStrokeDash(props.stroke.style, sw);
    var strokePoly = document.createElementNS('http://www.w3.org/2000/svg','path');
    strokePoly.setAttribute('d', polyPath(rx, ry, Math.max(1, rx - sw/2), Math.max(1, ry - sw/2), sides, radius));
    strokePoly.setAttribute('fill','none');
    strokePoly.setAttribute('stroke', sc);
    strokePoly.setAttribute('stroke-width', String(sw));
    if (dash !== 'none') { strokePoly.setAttribute('stroke-dasharray', dash); }
    svg.appendChild(strokePoly);
  }

  // Selection border
  if (svg._selected) {
    var sel = document.createElementNS('http://www.w3.org/2000/svg','path');
    sel.setAttribute('class','dc-poly-sel');
    sel.setAttribute('d', polyPath(rx, ry, Math.max(1, rx - 2), Math.max(1, ry - 2), sides, radius));
    sel.setAttribute('fill','none');
    sel.setAttribute('stroke','#9333ea');
    sel.setAttribute('stroke-width','1.5');
    sel.setAttribute('stroke-dasharray','6,4');
    sel.style.pointerEvents = 'none';
    svg.appendChild(sel);
  }

  // Re-apply image fill after every rebuild — keeps fill visible when selected or deselected
  if (savedImgSrc) { svg._imageSrc = savedImgSrc; applyImageFillToShape(svg, savedImgSrc, props.shadow); }
}

function selectPolygon(svg) {
  deselectAll();
  _selectedPoly = svg;
  svg._selected = true;
  svg.classList.add('selected');
  buildPolygonSvg(svg, svg._rw, svg._rh, svg._props);
  addPolyHandles(svg);
  if (vscodeApi) { vscodeApi.postMessage({ command: 'polySelected', w: svg._rw, h: svg._rh }); }
  broadcastLayers();
}

function deselectAllPolygons() {
  if (_selectedPoly) {
    _selectedPoly._selected = false;
    _selectedPoly.classList.remove('selected');
    removePolyHandles(_selectedPoly);
    buildPolygonSvg(_selectedPoly, _selectedPoly._rw, _selectedPoly._rh, _selectedPoly._props);
    _selectedPoly = null;
  }
}

function addPolyHandles(svg) {
  svg._polyHandles = {};
  ['tl','tr','bl','br'].forEach(function(pos) {
    var h = document.createElement('div');
    h.className = 'dc-handle';
    h.dataset.h = pos;
    positionPolyHandle(h, pos, svg._rx, svg._ry, svg._rw, svg._rh);
    canvasStage.appendChild(h);
    svg._polyHandles[pos] = h;
    wirePolyHandle(svg, h);
  });
}

function positionPolyHandle(h, pos, rx, ry, rw, rh) {
  var hx, hy;
  if (pos === 'tl') { hx = rx - 5;      hy = ry - 5; }
  if (pos === 'tr') { hx = rx + rw - 5; hy = ry - 5; }
  if (pos === 'bl') { hx = rx - 5;      hy = ry + rh - 5; }
  if (pos === 'br') { hx = rx + rw - 5; hy = ry + rh - 5; }
  h.style.left = hx + 'px';
  h.style.top  = hy + 'px';
}

function removePolyHandles(svg) {
  if (svg._polyHandles) {
    Object.keys(svg._polyHandles).forEach(function(p) { svg._polyHandles[p].remove(); });
    svg._polyHandles = null;
  }
}

function wirePolyHandle(svg, handle) {
  handle.addEventListener('pointerdown', function(e) {
    e.stopPropagation(); e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    _dragRc = canvasWrap.getBoundingClientRect();
    var startClient = { x: e.clientX, y: e.clientY };
    var startRect   = { x: svg._rx, y: svg._ry, w: svg._rw, h: svg._rh };
    var pos         = handle.dataset.h;
    function onMove(ev) {
      var dx = (ev.clientX - startClient.x) / S.zoom;
      var dy = (ev.clientY - startClient.y) / S.zoom;
      var nx = startRect.x, ny = startRect.y, nw = startRect.w, nh = startRect.h;
      if (pos === 'tl') { nx += dx; ny += dy; nw -= dx; nh -= dy; }
      if (pos === 'tr') {            ny += dy; nw += dx; nh -= dy; }
      if (pos === 'bl') { nx += dx;            nw -= dx; nh += dy; }
      if (pos === 'br') {                       nw += dx; nh += dy; }
      if (ev.shiftKey) {
        var s = Math.max(10, Math.min(nw, nh));
        if (pos === 'tl') { nx = startRect.x + startRect.w - s; ny = startRect.y + startRect.h - s; }
        if (pos === 'tr') { ny = startRect.y + startRect.h - s; }
        if (pos === 'bl') { nx = startRect.x + startRect.w - s; }
        nw = s; nh = s;
      }
      if (nw < 10) { nw = 10; if (pos==='tl'||pos==='bl') { nx = startRect.x + startRect.w - 10; } }
      if (nh < 10) { nh = 10; if (pos==='tl'||pos==='tr') { ny = startRect.y + startRect.h - 10; } }
      svg._rx = nx; svg._ry = ny; svg._rw = nw; svg._rh = nh;
      svg.style.left = nx+'px'; svg.style.top = ny+'px';
      svg.style.width = nw+'px'; svg.style.height = nh+'px';
      buildPolygonSvg(svg, nw, nh, svg._props);
      Object.keys(svg._polyHandles).forEach(function(p) { positionPolyHandle(svg._polyHandles[p], p, nx, ny, nw, nh); });
    }
    function onUp() { handle.removeEventListener('pointermove', onMove); handle.removeEventListener('pointerup', onUp); _dragRc = null; if (vscodeApi) { vscodeApi.postMessage({ command: 'polyResized', w: svg._rw, h: svg._rh }); } }
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup',   onUp);
  });
}

function wirePolyMove(svg) {
  svg.addEventListener('pointerdown', function(e) {
    if (e.button !== 0 || _space) { return; }
    e.stopPropagation();
    selectPolygon(svg);
    svg.setPointerCapture(e.pointerId);
    var startClient = { x: e.clientX, y: e.clientY };
    var startPos    = { x: svg._rx, y: svg._ry };
    function onMove(ev) {
      var dx = (ev.clientX - startClient.x) / S.zoom;
      var dy = (ev.clientY - startClient.y) / S.zoom;
      svg._rx = startPos.x + dx; svg._ry = startPos.y + dy;
      svg.style.left = svg._rx+'px'; svg.style.top = svg._ry+'px';
      if (svg._polyHandles) {
        Object.keys(svg._polyHandles).forEach(function(p) { positionPolyHandle(svg._polyHandles[p], p, svg._rx, svg._ry, svg._rw, svg._rh); });
      }
    }
    function onUp() { svg.removeEventListener('pointermove', onMove); svg.removeEventListener('pointerup', onUp); }
    svg.addEventListener('pointermove', onMove);
    svg.addEventListener('pointerup',   onUp);
  });
}

// ── Build / rebuild SVG internals ─────────────────────────────
function buildEllipseSvg(svg, w, h, props) {
  var savedImgSrc = svg._imageSrc || null;
  while (svg.firstChild) { svg.removeChild(svg.firstChild); }
  svg.setAttribute('width',   String(w));
  svg.setAttribute('height',  String(h));
  svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
  var rx = w / 2;
  var ry = h / 2;
  var sw = (props.stroke && props.stroke.weight > 0) ? props.stroke.weight : 0;
  var uid = svg._uid || (svg._uid = 'e' + Math.random().toString(36).slice(2,7));

  var defs = document.createElementNS('http://www.w3.org/2000/svg','defs');

  // Gradient
  var fillAttr = buildEllipseFill(props.fill, props.gradient, uid, defs, rx, ry, w, h);

  // Shadow filter
  if (props.shadow) {
    var sh = props.shadow;
    var fid = uid + '_shadow';
    var filt = document.createElementNS('http://www.w3.org/2000/svg','filter');
    filt.setAttribute('id', fid);
    filt.setAttribute('x','-50%'); filt.setAttribute('y','-50%');
    filt.setAttribute('width','200%'); filt.setAttribute('height','200%');
    var fds = document.createElementNS('http://www.w3.org/2000/svg','feDropShadow');
    fds.setAttribute('dx', String(sh.offset  || 0));
    fds.setAttribute('dy', String(sh.offset  || 0));
    fds.setAttribute('stdDeviation', String(sh.feather || 0));
    fds.setAttribute('flood-color', colorWithOpacity(sh.color, sh.opacity));
    fds.setAttribute('flood-opacity','1');
    filt.appendChild(fds);
    defs.appendChild(filt);
    var shadowEl = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
    shadowEl.setAttribute('cx', String(rx)); shadowEl.setAttribute('cy', String(ry));
    shadowEl.setAttribute('rx', String(Math.max(1, rx + (sh.size || 0))));
    shadowEl.setAttribute('ry', String(Math.max(1, ry + (sh.size || 0))));
    shadowEl.setAttribute('fill', colorWithOpacity(sh.color, sh.opacity));
    shadowEl.setAttribute('filter', 'url(#' + fid + ')');
    svg.appendChild(defs);
    svg.appendChild(shadowEl);
  } else {
    svg.appendChild(defs);
  }

  // Fill ellipse
  var fillEl = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
  fillEl.setAttribute('cx', String(rx)); fillEl.setAttribute('cy', String(ry));
  fillEl.setAttribute('rx', String(rx)); fillEl.setAttribute('ry', String(ry));
  fillEl.setAttribute('fill', fillAttr);
  fillEl.setAttribute('stroke','none');
  svg.appendChild(fillEl);

  // Stroke ellipse
  if (sw > 0 && props.stroke.color !== 'none' && props.stroke.color !== 'transparent') {
    var sc   = colorWithOpacity(props.stroke.color, props.stroke.opacity);
    var dash = buildStrokeDash(props.stroke.style, sw);
    var strokeEl = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
    strokeEl.setAttribute('cx', String(rx)); strokeEl.setAttribute('cy', String(ry));
    strokeEl.setAttribute('rx', String(Math.max(1, rx - sw / 2)));
    strokeEl.setAttribute('ry', String(Math.max(1, ry - sw / 2)));
    strokeEl.setAttribute('fill','none');
    strokeEl.setAttribute('stroke', sc);
    strokeEl.setAttribute('stroke-width', String(sw));
    if (dash !== 'none') { strokeEl.setAttribute('stroke-dasharray', dash); }
    svg.appendChild(strokeEl);
  }

  // Selection border
  if (svg._selected) {
    var sel = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
    sel.setAttribute('class','dc-ell-sel');
    sel.setAttribute('cx', String(rx)); sel.setAttribute('cy', String(ry));
    sel.setAttribute('rx', String(Math.max(1, rx - 2)));
    sel.setAttribute('ry', String(Math.max(1, ry - 2)));
    sel.setAttribute('fill','none');
    sel.setAttribute('stroke','#9333ea');
    sel.setAttribute('stroke-width','1.5');
    sel.setAttribute('stroke-dasharray','6,4');
    sel.style.pointerEvents = 'none';
    svg.appendChild(sel);
  }

  // Re-apply image fill after every rebuild — keeps fill visible when selected or deselected
  if (savedImgSrc) { svg._imageSrc = savedImgSrc; applyImageFillToShape(svg, savedImgSrc, props.shadow); }
}

function buildEllipseFill(fill, grad, uid, defs, rx, ry, w, h) {
  if (!grad) { return colorWithOpacity(fill.color, fill.opacity); }
  var gid = uid + '_grad';
  var gradEl;
  var stops = grad.stops.map(function(s) {
    var stop = document.createElementNS('http://www.w3.org/2000/svg','stop');
    stop.setAttribute('offset', s.pos + '%');
    stop.setAttribute('stop-color', colorWithOpacity(s.color, s.opacity));
    return stop;
  });
  if (grad.type === 'linear') {
    gradEl = document.createElementNS('http://www.w3.org/2000/svg','linearGradient');
    gradEl.setAttribute('id', gid);
    gradEl.setAttribute('gradientTransform','rotate(' + (grad.angle || 90) + ',' + rx + ',' + ry + ')');
    gradEl.setAttribute('gradientUnits','userSpaceOnUse');
    gradEl.setAttribute('x1','0'); gradEl.setAttribute('y1', String(ry));
    gradEl.setAttribute('x2', String(w)); gradEl.setAttribute('y2', String(ry));
  } else {
    gradEl = document.createElementNS('http://www.w3.org/2000/svg','radialGradient');
    gradEl.setAttribute('id', gid);
    gradEl.setAttribute('cx','50%'); gradEl.setAttribute('cy','50%');
    gradEl.setAttribute('r','50%');
    gradEl.setAttribute('gradientUnits','objectBoundingBox');
  }
  stops.forEach(function(s) { gradEl.appendChild(s); });
  defs.appendChild(gradEl);
  return 'url(#' + gid + ')';
}

// ── Ellipse selection ─────────────────────────────────────────
var _selectedEll = null;

function selectEllipse(svg) {
  deselectAll();
  _selectedEll = svg;
  svg._selected = true;
  svg.classList.add('selected');
  addEllipseHandles(svg);
  buildEllipseSvg(svg, svg._rw, svg._rh, svg._props);
  if (vscodeApi) { vscodeApi.postMessage({ command: 'ellipseSelected', w: svg._rw, h: svg._rh }); }
  broadcastLayers();
}

function deselectAllEllipses() {
  if (_selectedEll) {
    _selectedEll._selected = false;
    _selectedEll.classList.remove('selected');
    removeEllipseHandles(_selectedEll);
    buildEllipseSvg(_selectedEll, _selectedEll._rw, _selectedEll._rh, _selectedEll._props);
    _selectedEll = null;
  }
}

// ── Ellipse handles ───────────────────────────────────────────
function addEllipseHandles(svg) {
  removeEllipseHandles(svg);
  svg._handles = {};
  ['tl','tr','bl','br'].forEach(function(pos) {
    var h = document.createElement('div');
    h.className = 'dc-handle';
    h.dataset.h = pos;
    positionEllipseHandle(h, pos, svg._rx, svg._ry, svg._rw, svg._rh);
    canvasStage.appendChild(h);
    svg._handles[pos] = h;
    wireEllipseHandle(svg, h);
  });
}

function positionEllipseHandle(h, pos, rx, ry, rw, rh) {
  var hx, hy;
  if (pos === 'tl') { hx = rx - 5;      hy = ry - 5; }
  if (pos === 'tr') { hx = rx + rw - 5; hy = ry - 5; }
  if (pos === 'bl') { hx = rx - 5;      hy = ry + rh - 5; }
  if (pos === 'br') { hx = rx + rw - 5; hy = ry + rh - 5; }
  h.style.left = hx + 'px';
  h.style.top  = hy + 'px';
}

function removeEllipseHandles(svg) {
  if (svg._handles) {
    Object.keys(svg._handles).forEach(function(p) { svg._handles[p].remove(); });
    svg._handles = null;
  }
}

function wireEllipseHandle(svg, handle) {
  handle.addEventListener('pointerdown', function(e) {
    e.stopPropagation();
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    _dragRc = canvasWrap.getBoundingClientRect();
    var startClient = { x: e.clientX, y: e.clientY };
    var startRect   = { x: svg._rx, y: svg._ry, w: svg._rw, h: svg._rh };
    var pos         = handle.dataset.h;
    function onMove(ev) {
      var dx = (ev.clientX - startClient.x) / S.zoom;
      var dy = (ev.clientY - startClient.y) / S.zoom;
      var nx = startRect.x, ny = startRect.y, nw = startRect.w, nh = startRect.h;
      if (pos === 'tl') { nx += dx; ny += dy; nw -= dx; nh -= dy; }
      if (pos === 'tr') {            ny += dy; nw += dx; nh -= dy; }
      if (pos === 'bl') { nx += dx;            nw -= dx; nh += dy; }
      if (pos === 'br') {                       nw += dx; nh += dy; }

      // Shift: constrain to circle
      if (ev.shiftKey) {
        var s = Math.max(10, Math.min(nw, nh));
        if (pos === 'tl') { nx = startRect.x + startRect.w - s; ny = startRect.y + startRect.h - s; }
        if (pos === 'tr') { ny = startRect.y + startRect.h - s; }
        if (pos === 'bl') { nx = startRect.x + startRect.w - s; }
        nw = s; nh = s;
      }

      if (nw < 10) { nw = 10; if (pos==='tl'||pos==='bl') { nx = startRect.x + startRect.w - 10; } }
      if (nh < 10) { nh = 10; if (pos==='tl'||pos==='tr') { ny = startRect.y + startRect.h - 10; } }
      svg._rx = nx; svg._ry = ny; svg._rw = nw; svg._rh = nh;
      svg.style.left   = nx + 'px';
      svg.style.top    = ny + 'px';
      svg.style.width  = nw + 'px';
      svg.style.height = nh + 'px';
      buildEllipseSvg(svg, nw, nh, svg._props);
      Object.keys(svg._handles).forEach(function(p) {
        positionEllipseHandle(svg._handles[p], p, nx, ny, nw, nh);
      });
    }
    function onUp() {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup',   onUp);
      _dragRc = null;
      if (vscodeApi) { vscodeApi.postMessage({ command: 'ellipseResized', w: svg._rw, h: svg._rh }); }
    }
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup',   onUp);
  });
}

function wireEllipseMove(svg) {
  svg.addEventListener('pointerdown', function(e) {
    if (e.button !== 0 || _space) { return; }
    e.stopPropagation();
    svg.setPointerCapture(e.pointerId);
    selectEllipse(svg);
    var startClient = { x: e.clientX, y: e.clientY };
    var startPos    = { x: svg._rx, y: svg._ry };
    function onMove(ev) {
      var dx = (ev.clientX - startClient.x) / S.zoom;
      var dy = (ev.clientY - startClient.y) / S.zoom;
      svg._rx = startPos.x + dx;
      svg._ry = startPos.y + dy;
      svg.style.left = svg._rx + 'px';
      svg.style.top  = svg._ry + 'px';
      if (svg._handles) {
        Object.keys(svg._handles).forEach(function(p) {
          positionEllipseHandle(svg._handles[p], p, svg._rx, svg._ry, svg._rw, svg._rh);
        });
      }
    }
    function onUp() {
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerup',   onUp);
    }
    svg.addEventListener('pointermove', onMove);
    svg.addEventListener('pointerup',   onUp);
  });
}

// ═══════════════════════════════════════════════════════════
// LINE TOOL
// ═══════════════════════════════════════════════════════════
var _ldraw = { active:false, sx:0, sy:0, ghost:null };
var _selectedLine = null;

function buildLineSvg(svg) {
  while (svg.firstChild) { svg.removeChild(svg.firstChild); }
  var x1 = svg._x1, y1 = svg._y1, x2 = svg._x2, y2 = svg._y2;
  var props = svg._props;
  var sw = props.stroke ? (props.stroke.weight || 2) : 2;
  var pad = sw * 4 + 10;  // padding so shadow/thick strokes are not clipped

  // Compute bounding box with padding
  var minX = Math.min(x1, x2) - pad;
  var minY = Math.min(y1, y2) - pad;
  var maxX = Math.max(x1, x2) + pad;
  var maxY = Math.max(y1, y2) + pad;
  var w = maxX - minX;
  var h = maxY - minY;

  // Position the SVG at the bounding box origin
  svg.style.left   = minX + 'px';
  svg.style.top    = minY + 'px';
  svg.style.width  = w + 'px';
  svg.style.height = h + 'px';
  svg.setAttribute('viewBox', minX + ' ' + minY + ' ' + w + ' ' + h);
  svg.setAttribute('width',  String(w));
  svg.setAttribute('height', String(h));

  var uid = svg._uid;
  var defs = document.createElementNS('http://www.w3.org/2000/svg','defs');

  // Shadow filter
  if (props.shadow) {
    var sh = props.shadow;
    var fid = uid + '_shadow';
    var filt = document.createElementNS('http://www.w3.org/2000/svg','filter');
    filt.setAttribute('id', fid);
    filt.setAttribute('x','-50%'); filt.setAttribute('y','-50%');
    filt.setAttribute('width','200%'); filt.setAttribute('height','200%');
    var fds = document.createElementNS('http://www.w3.org/2000/svg','feDropShadow');
    fds.setAttribute('dx', String(sh.offset || 0));
    fds.setAttribute('dy', String(sh.offset || 0));
    fds.setAttribute('stdDeviation', String(sh.feather || 0));
    fds.setAttribute('flood-color', colorWithOpacity(sh.color, sh.opacity));
    fds.setAttribute('flood-opacity','1');
    filt.appendChild(fds);
    defs.appendChild(filt);
  }
  svg.appendChild(defs);

  // Main stroke line
  if (props.stroke && props.stroke.color !== 'none') {
    var sc   = colorWithOpacity(props.stroke.color, props.stroke.opacity);
    var dash = buildStrokeDash(props.stroke.style, sw);
    var line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', String(x1)); line.setAttribute('y1', String(y1));
    line.setAttribute('x2', String(x2)); line.setAttribute('y2', String(y2));
    line.setAttribute('stroke', sc);
    line.setAttribute('stroke-width', String(sw));
    line.setAttribute('stroke-linecap', 'round');
    if (dash !== 'none') { line.setAttribute('stroke-dasharray', dash); }
    if (props.shadow) { line.setAttribute('filter', 'url(#' + uid + '_shadow)'); }
    svg.appendChild(line);
  }

  // No selection overlay — handles indicate selection
}

function startLineDraw(cx, cy) {
  _ldraw.active = true;
  _ldraw.sx = cx; _ldraw.sy = cy;

  // Ghost dashed preview line — SVG covers full canvas space so line is never clipped
  var g = document.createElementNS('http://www.w3.org/2000/svg','svg');
  g.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;overflow:visible;';
  g.setAttribute('width',  '10000');
  g.setAttribute('height', '10000');
  g.setAttribute('viewBox', '0 0 10000 10000');
  var gl = document.createElementNS('http://www.w3.org/2000/svg','line');
  gl.setAttribute('x1', String(cx)); gl.setAttribute('y1', String(cy));
  gl.setAttribute('x2', String(cx)); gl.setAttribute('y2', String(cy));
  gl.setAttribute('stroke', '#38BDF8');
  gl.setAttribute('stroke-width', '1.5');
  gl.setAttribute('stroke-dasharray', '6,4');
  gl.setAttribute('stroke-linecap', 'round');
  g.appendChild(gl);
  canvasStage.appendChild(g);
  _ldraw.ghost = g;
  _ldraw.ghostLine = gl;
}

function updateLineDraw(cx, cy, shift) {
  if (!_ldraw.active || !_ldraw.ghostLine) { return; }
  var ex = cx, ey = cy;
  if (shift) {
    var dx = cx - _ldraw.sx, dy = cy - _ldraw.sy;
    if (Math.abs(dx) > Math.abs(dy)) { ey = _ldraw.sy; } else { ex = _ldraw.sx; }
  }
  _ldraw.ghostLine.setAttribute('x1', String(_ldraw.sx)); _ldraw.ghostLine.setAttribute('y1', String(_ldraw.sy));
  _ldraw.ghostLine.setAttribute('x2', String(ex));        _ldraw.ghostLine.setAttribute('y2', String(ey));
}

function finishLineDraw(cx, cy, shift) {
  if (!_ldraw.active) { return; }
  if (_ldraw.ghost) { _ldraw.ghost.remove(); _ldraw.ghost = null; _ldraw.ghostLine = null; }
  _ldraw.active = false;

  var ex = cx, ey = cy;
  if (shift) {
    var dx = cx - _ldraw.sx, dy = cy - _ldraw.sy;
    if (Math.abs(dx) > Math.abs(dy)) { ey = _ldraw.sy; } else { ex = _ldraw.sx; }
  }

  // Skip if zero length
  if (Math.abs(ex - _ldraw.sx) < 2 && Math.abs(ey - _ldraw.sy) < 2) { return; }

  var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','dc-line');
  svg._uid   = 'l' + Math.random().toString(36).slice(2,9);
  svg._name  = nextName('line');
  svg._type  = 'line';
  svg._x1    = _ldraw.sx; svg._y1 = _ldraw.sy;
  svg._x2    = ex;        svg._y2 = ey;
  svg._props = JSON.parse(JSON.stringify(LPROPS));
  svg.style.position = 'absolute';
  svg.style.overflow = 'visible';
  buildLineSvg(svg);
  canvasStage.appendChild(svg);

  wireLineMove(svg);
  wireLineHandles(svg);
  selectLine(svg);
  broadcastLayers();
}

function selectLine(svg) {
  deselectAll();
  _selectedLine = svg;
  svg._selected = true;
  svg.classList.add('selected');
  buildLineSvg(svg);
  addLineHandles(svg);
}

function deselectAllLines() {
  if (_selectedLine) {
    _selectedLine._selected = false;
    _selectedLine.classList.remove('selected');
    removeLineHandles(_selectedLine);
    buildLineSvg(_selectedLine);
    _selectedLine = null;
  }
}

// Line endpoint handles
function addLineHandles(svg) {
  removeLineHandles(svg);
  svg._lineHandles = {};
  ['a','b'].forEach(function(p) {
    var h = document.createElement('div');
    h.className = 'dc-handle';
    h.dataset.h = p;
    h.style.cssText = 'width:10px;height:10px;border-radius:50%;background:#111;border:2px solid #38BDF8;position:absolute;transform:translate(-50%,-50%);cursor:crosshair;z-index:9999;';
    positionLineHandle(h, p, svg);
    canvasStage.appendChild(h);
    svg._lineHandles[p] = h;
    wireLineHandle(svg, h);
  });
}

function positionLineHandle(h, p, svg) {
  var x = (p === 'a') ? svg._x1 : svg._x2;
  var y = (p === 'a') ? svg._y1 : svg._y2;
  h.style.left = x + 'px';
  h.style.top  = y + 'px';
}

function removeLineHandles(svg) {
  if (svg._lineHandles) {
    Object.keys(svg._lineHandles).forEach(function(p) { svg._lineHandles[p].remove(); });
    svg._lineHandles = null;
  }
}

function wireLineHandle(svg, handle) {
  handle.addEventListener('pointerdown', function(e) {
    e.stopPropagation(); e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    _dragRc = canvasWrap.getBoundingClientRect();
    var pos = handle.dataset.h;
    function onMove(ev) {
      var pt = toCanvasCached(ev.clientX, ev.clientY);
      var ex = pt.x, ey = pt.y;
      if (ev.shiftKey) {
        var ox = (pos === 'a') ? svg._x2 : svg._x1;
        var oy = (pos === 'a') ? svg._y2 : svg._y1;
        var ddx = pt.x - ox, ddy = pt.y - oy;
        if (Math.abs(ddx) > Math.abs(ddy)) { ey = oy; } else { ex = ox; }
      }
      if (pos === 'a') { svg._x1 = ex; svg._y1 = ey; } else { svg._x2 = ex; svg._y2 = ey; }
      buildLineSvg(svg);
      positionLineHandle(svg._lineHandles['a'], 'a', svg);
      positionLineHandle(svg._lineHandles['b'], 'b', svg);
    }
    function onUp() { handle.removeEventListener('pointermove', onMove); handle.removeEventListener('pointerup', onUp); _dragRc = null; }
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup',   onUp);
  });
}

function wireLineMove(svg) {
  svg.addEventListener('pointerdown', function(e) {
    if (e.button !== 0 || _space) { return; }
    e.stopPropagation();
    selectLine(svg);
    svg.setPointerCapture(e.pointerId);
    _dragRc = canvasWrap.getBoundingClientRect();
    var startClient = { x: e.clientX, y: e.clientY };
    var startCoords = { x1:svg._x1, y1:svg._y1, x2:svg._x2, y2:svg._y2 };
    function onMove(ev) {
      var dx = (ev.clientX - startClient.x) / S.zoom;
      var dy = (ev.clientY - startClient.y) / S.zoom;
      svg._x1 = startCoords.x1 + dx; svg._y1 = startCoords.y1 + dy;
      svg._x2 = startCoords.x2 + dx; svg._y2 = startCoords.y2 + dy;
      buildLineSvg(svg);
      if (svg._lineHandles) {
        positionLineHandle(svg._lineHandles['a'], 'a', svg);
        positionLineHandle(svg._lineHandles['b'], 'b', svg);
      }
    }
    function onUp() { svg.removeEventListener('pointermove', onMove); svg.removeEventListener('pointerup', onUp); _dragRc = null; broadcastLayers(); }
    svg.addEventListener('pointermove', onMove);
    svg.addEventListener('pointerup',   onUp);
  });
}

// ═══════════════════════════════════════════════════════════
// PEN TOOL
// ═══════════════════════════════════════════════════════════
var _pendraw = { active:false, points:[], ghost:null, ghostLine:null, freehand:false };
var _selectedPen = null;

function penPathD(points) {
  if (!points || points.length < 2) { return ''; }
  var d = 'M ' + points[0].x + ' ' + points[0].y;
  for (var i = 1; i < points.length; i++) {
    d += ' L ' + points[i].x + ' ' + points[i].y;
  }
  return d;
}

function buildPenSvg(svg) {
  while (svg.firstChild) { svg.removeChild(svg.firstChild); }
  var points = svg._points;
  if (!points || points.length < 2) { return; }
  var props = svg._props;
  var sw = props.stroke ? (props.stroke.weight || 2) : 2;
  var pad = sw * 4 + 10;

  // Compute bounding box
  var xs = points.map(function(p) { return p.x; });
  var ys = points.map(function(p) { return p.y; });
  var minX = Math.min.apply(null, xs) - pad;
  var minY = Math.min.apply(null, ys) - pad;
  var maxX = Math.max.apply(null, xs) + pad;
  var maxY = Math.max.apply(null, ys) + pad;
  var w = maxX - minX;
  var h = maxY - minY;

  svg.style.left   = minX + 'px';
  svg.style.top    = minY + 'px';
  svg.style.width  = w + 'px';
  svg.style.height = h + 'px';
  svg.setAttribute('viewBox', minX + ' ' + minY + ' ' + w + ' ' + h);
  svg.setAttribute('width',  String(w));
  svg.setAttribute('height', String(h));

  var uid = svg._uid;
  var defs = document.createElementNS('http://www.w3.org/2000/svg','defs');

  // Shadow filter
  if (props.shadow) {
    var sh = props.shadow;
    var fid = uid + '_shadow';
    var filt = document.createElementNS('http://www.w3.org/2000/svg','filter');
    filt.setAttribute('id', fid);
    filt.setAttribute('x','-50%'); filt.setAttribute('y','-50%');
    filt.setAttribute('width','200%'); filt.setAttribute('height','200%');
    var fds = document.createElementNS('http://www.w3.org/2000/svg','feDropShadow');
    fds.setAttribute('dx', String(sh.offset || 0));
    fds.setAttribute('dy', String(sh.offset || 0));
    fds.setAttribute('stdDeviation', String(sh.feather || 0));
    fds.setAttribute('flood-color', colorWithOpacity(sh.color, sh.opacity));
    fds.setAttribute('flood-opacity','1');
    filt.appendChild(fds);
    defs.appendChild(filt);
  }
  svg.appendChild(defs);

  var d = penPathD(points);
  if (props.stroke && props.stroke.color !== 'none') {
    var sc   = colorWithOpacity(props.stroke.color, props.stroke.opacity);
    var dash = buildStrokeDash(props.stroke.style, sw);
    var path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', sc);
    path.setAttribute('stroke-width', String(sw));
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    if (dash !== 'none') { path.setAttribute('stroke-dasharray', dash); }
    if (props.shadow) { path.setAttribute('filter', 'url(#' + uid + '_shadow)'); }
    svg.appendChild(path);
  }

  // No selection overlay — handles indicate selection
}

function startPenDraw(cx, cy) {
  if (!_pendraw.active) {
    // Brand new pen stroke
    _pendraw.active   = true;
    _pendraw.freehand = false;
    _pendraw.points   = [{ x:cx, y:cy }];
    _pendraw.moved    = false;

    // Ghost SVG for preview — large fixed viewport so line/path never clips
    var g = document.createElementNS('http://www.w3.org/2000/svg','svg');
    g.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;overflow:visible;';
    g.setAttribute('width',  '10000');
    g.setAttribute('height', '10000');
    g.setAttribute('viewBox', '0 0 10000 10000');
    var gl = document.createElementNS('http://www.w3.org/2000/svg','line');
    gl.setAttribute('x1', String(cx)); gl.setAttribute('y1', String(cy));
    gl.setAttribute('x2', String(cx)); gl.setAttribute('y2', String(cy));
    gl.setAttribute('stroke', '#38BDF8');
    gl.setAttribute('stroke-width', '1.5');
    gl.setAttribute('stroke-dasharray', '5,4');
    gl.setAttribute('stroke-linecap', 'round');
    g.appendChild(gl);
    canvasStage.appendChild(g);
    _pendraw.ghost = g;
    _pendraw.ghostLine = gl;
  } else {
    // Continuing: this click extends the path — handled by commitPenPoint on pointerup
    _pendraw.moved = false;
  }
  _pendraw.lastX = cx;
  _pendraw.lastY = cy;
}

function updatePenDraw(cx, cy, buttonDown) {
  if (!_pendraw.active) { return; }

  // Detect if user is holding button and dragging = freehand mode
  if (buttonDown && !_pendraw.freehand) {
    var dx = cx - _pendraw.lastX, dy = cy - _pendraw.lastY;
    if (Math.abs(dx) + Math.abs(dy) > 3) {
      _pendraw.freehand = true;
    }
  }

  if (_pendraw.freehand && buttonDown) {
    // Freehand: accumulate points while dragging
    var last = _pendraw.points[_pendraw.points.length - 1];
    var ddx = cx - last.x, ddy = cy - last.y;
    if (ddx*ddx + ddy*ddy > 4) { // throttle to every ~2px
      _pendraw.points.push({ x:cx, y:cy });
      _pendraw.moved = true;
      // Update ghost to show current path
      updatePenGhostPath();
    }
  } else if (!_pendraw.freehand) {
    // Click mode: ghost preview follows cursor from the last committed point.
    // May be a <line> element (first segment) or a <path> element (2+ segments committed).
    var last = _pendraw.points[_pendraw.points.length - 1];
    if (_pendraw.ghostLine) {
      // Still on the first segment — update the <line> endpoints
      _pendraw.ghostLine.setAttribute('x1', String(last.x)); _pendraw.ghostLine.setAttribute('y1', String(last.y));
      _pendraw.ghostLine.setAttribute('x2', String(cx));     _pendraw.ghostLine.setAttribute('y2', String(cy));
    } else if (_pendraw.ghost) {
      // 2+ committed points — ghost is a <path>. Rebuild it with cursor as the trailing point.
      while (_pendraw.ghost.firstChild) { _pendraw.ghost.removeChild(_pendraw.ghost.firstChild); }
      var previewPts = _pendraw.points.concat([{ x:cx, y:cy }]);
      var d = penPathD(previewPts);
      var pEl = document.createElementNS('http://www.w3.org/2000/svg','path');
      pEl.setAttribute('d', d);
      pEl.setAttribute('fill', 'none');
      pEl.setAttribute('stroke', '#38BDF8');
      pEl.setAttribute('stroke-width', '1.5');
      pEl.setAttribute('stroke-dasharray', '5,4');
      pEl.setAttribute('stroke-linecap', 'round');
      pEl.setAttribute('stroke-linejoin', 'round');
      _pendraw.ghost.appendChild(pEl);
    }
  }
}

function updatePenGhostPath() {
  // Replace ghost line with a path showing full stroke so far
  if (!_pendraw.ghost) { return; }
  while (_pendraw.ghost.firstChild) { _pendraw.ghost.removeChild(_pendraw.ghost.firstChild); }
  var pts = _pendraw.points;
  if (pts.length < 2) { return; }
  var d = penPathD(pts);
  var p = document.createElementNS('http://www.w3.org/2000/svg','path');
  p.setAttribute('d', d);
  p.setAttribute('fill', 'none');
  p.setAttribute('stroke', '#38BDF8');
  p.setAttribute('stroke-width', '1.5');
  p.setAttribute('stroke-dasharray', '5,4');
  p.setAttribute('stroke-linecap', 'round');
  p.setAttribute('stroke-linejoin', 'round');
  _pendraw.ghost.appendChild(p);
  // viewBox stays at '0 0 10000 10000' — no recalculation needed
  _pendraw.ghostLine = null; // now using a path element, not a line element
}

function commitPenPoint(cx, cy) {
  // Called on pointerup in click mode: add this point to the path
  if (!_pendraw.active || _pendraw.freehand) { return; }
  var last = _pendraw.points[_pendraw.points.length - 1];
  var dx = cx - last.x, dy = cy - last.y;
  if (dx*dx + dy*dy > 4) { // only add if cursor moved
    _pendraw.points.push({ x:cx, y:cy });
    updatePenGhostPath();
  }
}

function finishPenDraw() {
  if (!_pendraw.active) { return; }
  if (_pendraw.ghost) { _pendraw.ghost.remove(); _pendraw.ghost = null; _pendraw.ghostLine = null; }
  _pendraw.active = false;
  _pendraw.freehand = false;
  canvasWrap.style.cursor = 'crosshair';

  var pts = _pendraw.points;
  if (!pts || pts.length < 2) { _pendraw.points = []; return; }

  var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','dc-pen');
  svg._uid    = 'pn' + Math.random().toString(36).slice(2,9);
  svg._name   = nextName('pen');
  svg._type   = 'pen';
  svg._points = pts.slice();
  svg._props  = JSON.parse(JSON.stringify(PENPROPS));
  svg.style.position = 'absolute';
  svg.style.overflow = 'visible';
  buildPenSvg(svg);
  canvasStage.appendChild(svg);

  wirePenMove(svg);
  selectPen(svg);
  broadcastLayers();
  _pendraw.points = [];
}

function selectPen(svg) {
  deselectAll();
  _selectedPen = svg;
  svg._selected = true;
  svg.classList.add('selected');
  buildPenSvg(svg);
  addPenHandles(svg);
}

function deselectAllPens() {
  if (_selectedPen) {
    _selectedPen._selected = false;
    _selectedPen.classList.remove('selected');
    removePenHandles(_selectedPen);
    buildPenSvg(_selectedPen);
    _selectedPen = null;
  }
}

function addPenHandles(svg) {
  removePenHandles(svg);
  svg._penHandles = [];
  svg._points.forEach(function(pt, i) {
    var h = document.createElement('div');
    h.className = 'dc-handle';
    h.dataset.hi = String(i);
    h.style.cssText = 'width:10px;height:10px;border-radius:50%;background:#111;border:2px solid #38BDF8;position:absolute;transform:translate(-50%,-50%);cursor:crosshair;z-index:9999;';
    h.style.left = pt.x + 'px';
    h.style.top  = pt.y + 'px';
    canvasStage.appendChild(h);
    svg._penHandles.push(h);
    wirePenHandle(svg, h, i);
  });
}

function removePenHandles(svg) {
  if (svg._penHandles) {
    svg._penHandles.forEach(function(h) { h.remove(); });
    svg._penHandles = null;
  }
}

function positionPenHandles(svg) {
  if (!svg._penHandles) { return; }
  svg._points.forEach(function(pt, i) {
    if (svg._penHandles[i]) {
      svg._penHandles[i].style.left = pt.x + 'px';
      svg._penHandles[i].style.top  = pt.y + 'px';
    }
  });
}

function wirePenHandle(svg, handle, idx) {
  handle.addEventListener('pointerdown', function(e) {
    e.stopPropagation(); e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    _dragRc = canvasWrap.getBoundingClientRect();
    var startPt = { x: svg._points[idx].x, y: svg._points[idx].y };
    function onMove(ev) {
      var pt = toCanvasCached(ev.clientX, ev.clientY);
      svg._points[idx] = { x: pt.x, y: pt.y };
      buildPenSvg(svg);
      positionPenHandles(svg);
    }
    function onUp() {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      _dragRc = null;
    }
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup',   onUp);
  });
}

function wirePenMove(svg) {
  svg.addEventListener('pointerdown', function(e) {
    if (e.button !== 0 || _space) { return; }
    e.stopPropagation();
    selectPen(svg);
    svg.setPointerCapture(e.pointerId);
    _dragRc = canvasWrap.getBoundingClientRect();
    var startClient = { x: e.clientX, y: e.clientY };
    var startPts = svg._points.map(function(p) { return { x:p.x, y:p.y }; });
    function onMove(ev) {
      var dx = (ev.clientX - startClient.x) / S.zoom;
      var dy = (ev.clientY - startClient.y) / S.zoom;
      svg._points = startPts.map(function(p) { return { x:p.x+dx, y:p.y+dy }; });
      buildPenSvg(svg);
      positionPenHandles(svg);
    }
    function onUp() { svg.removeEventListener('pointermove', onMove); svg.removeEventListener('pointerup', onUp); _dragRc = null; broadcastLayers(); }
    svg.addEventListener('pointermove', onMove);
    svg.addEventListener('pointerup',   onUp);
  });
}

// ═══════════════════════════════════════════════════════════
// BEZIER TOOL
// Each anchor point stores: { x, y, cp1:{x,y}, cp2:{x,y} }
// cp1 = incoming control point, cp2 = outgoing control point
// For the first point only cp2 matters; for last only cp1.
// ═══════════════════════════════════════════════════════════
var _bezdraw = { active:false, points:[], ghost:null, ghostLine:null };
var _selectedBez = null;
var _bezCtrlHandles = []; // active control-point divs for selected bezier

// ── Bezier path D string from anchors ────────────────────────
function bezPathD(pts) {
  if (!pts || pts.length < 2) { return ''; }
  var d = 'M ' + pts[0].x + ' ' + pts[0].y;
  for (var i = 1; i < pts.length; i++) {
    var prev = pts[i-1];
    var cur  = pts[i];
    // outgoing CP from previous, incoming CP to current
    var c1x = prev.cp2 ? prev.cp2.x : prev.x;
    var c1y = prev.cp2 ? prev.cp2.y : prev.y;
    var c2x = cur.cp1  ? cur.cp1.x  : cur.x;
    var c2y = cur.cp1  ? cur.cp1.y  : cur.y;
    d += ' C ' + c1x + ' ' + c1y + ' ' + c2x + ' ' + c2y + ' ' + cur.x + ' ' + cur.y;
  }
  return d;
}

// ── Default control points for a new anchor ──────────────────
function makeBezAnchor(x, y, prevAnchor) {
  // cp2 = outgoing handle (points right/forward by default)
  // cp1 = incoming handle (mirror of previous anchor's cp2 toward this point)
  var offset = 40;
  var cp2 = { x: x + offset, y: y };
  var cp1 = { x: x - offset, y: y };
  if (prevAnchor) {
    // Align incoming handle along the direction from prev to this point
    var dx = x - prevAnchor.x, dy = y - prevAnchor.y;
    var len = Math.sqrt(dx*dx + dy*dy) || 1;
    var ux = dx/len, uy = dy/len;
    cp1 = { x: x - ux*offset, y: y - uy*offset };
    cp2 = { x: x + ux*offset, y: y + uy*offset };
    // Also set the outgoing handle of prev to point toward this new anchor
    prevAnchor.cp2 = { x: prevAnchor.x + ux*offset, y: prevAnchor.y + uy*offset };
  }
  return { x:x, y:y, cp1:cp1, cp2:cp2 };
}

// ── Build the SVG element from anchor data ────────────────────
function buildBezSvg(svg) {
  while (svg.firstChild) { svg.removeChild(svg.firstChild); }
  var pts = svg._points;
  if (!pts || pts.length < 2) { return; }
  var props = svg._props;
  var sw  = props.stroke ? (props.stroke.weight || 2) : 2;
  var pad = sw * 4 + 50; // extra pad for control arms

  // Bounding box includes all control points
  var allX = [], allY = [];
  pts.forEach(function(p) {
    allX.push(p.x); allY.push(p.y);
    if (p.cp1) { allX.push(p.cp1.x); allY.push(p.cp1.y); }
    if (p.cp2) { allX.push(p.cp2.x); allY.push(p.cp2.y); }
  });
  var minX = Math.min.apply(null,allX) - pad;
  var minY = Math.min.apply(null,allY) - pad;
  var maxX = Math.max.apply(null,allX) + pad;
  var maxY = Math.max.apply(null,allY) + pad;
  var w = maxX - minX, h = maxY - minY;

  svg.style.left   = minX + 'px'; svg.style.top    = minY + 'px';
  svg.style.width  = w + 'px';    svg.style.height = h + 'px';
  svg.setAttribute('viewBox', minX + ' ' + minY + ' ' + w + ' ' + h);
  svg.setAttribute('width',  String(w));
  svg.setAttribute('height', String(h));

  var uid = svg._uid;
  var defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
  if (props.shadow) {
    var sh = props.shadow, fid = uid + '_shadow';
    var filt = document.createElementNS('http://www.w3.org/2000/svg','filter');
    filt.setAttribute('id', fid);
    filt.setAttribute('x','-50%'); filt.setAttribute('y','-50%');
    filt.setAttribute('width','200%'); filt.setAttribute('height','200%');
    var fds = document.createElementNS('http://www.w3.org/2000/svg','feDropShadow');
    fds.setAttribute('dx', String(sh.offset||0)); fds.setAttribute('dy', String(sh.offset||0));
    fds.setAttribute('stdDeviation', String(sh.feather||0));
    fds.setAttribute('flood-color', colorWithOpacity(sh.color, sh.opacity));
    fds.setAttribute('flood-opacity','1');
    filt.appendChild(fds); defs.appendChild(filt);
  }
  svg.appendChild(defs);

  var d = bezPathD(pts);
  if (props.stroke && props.stroke.color !== 'none') {
    var sc   = colorWithOpacity(props.stroke.color, props.stroke.opacity);
    var dash = buildStrokeDash(props.stroke.style, sw);
    var path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', sc);
    path.setAttribute('stroke-width', String(sw));
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    if (dash !== 'none') { path.setAttribute('stroke-dasharray', dash); }
    if (props.shadow) { path.setAttribute('filter', 'url(#' + uid + '_shadow)'); }
    svg.appendChild(path);
  }
  // No selection overlay — node handles indicate selection
}

// ── Ghost preview path during drawing ────────────────────────
function updateBezGhostPath(cursorX, cursorY) {
  if (!_bezdraw.ghost) { return; }
  while (_bezdraw.ghost.firstChild) { _bezdraw.ghost.removeChild(_bezdraw.ghost.firstChild); }
  var pts = _bezdraw.points;
  var pEl = document.createElementNS('http://www.w3.org/2000/svg','path');
  if (pts.length >= 2) {
    // Draw committed segments
    pEl.setAttribute('d', bezPathD(pts));
  }
  pEl.setAttribute('fill', 'none');
  pEl.setAttribute('stroke', '#38BDF8');
  pEl.setAttribute('stroke-width', '1.5');
  pEl.setAttribute('stroke-dasharray', '5,4');
  pEl.setAttribute('stroke-linecap', 'round');
  _bezdraw.ghost.appendChild(pEl);

  // Trailing ghost line from last point to cursor
  if (pts.length >= 1 && cursorX !== undefined) {
    var last = pts[pts.length-1];
    var gl = document.createElementNS('http://www.w3.org/2000/svg','line');
    gl.setAttribute('x1', String(last.x)); gl.setAttribute('y1', String(last.y));
    gl.setAttribute('x2', String(cursorX)); gl.setAttribute('y2', String(cursorY));
    gl.setAttribute('stroke', '#38BDF8');
    gl.setAttribute('stroke-width', '1');
    gl.setAttribute('stroke-dasharray', '4,4');
    gl.setAttribute('stroke-linecap', 'round');
    _bezdraw.ghost.appendChild(gl);
  }
}

// ── Start / extend bezier draw ────────────────────────────────
function startBezDraw(cx, cy) {
  if (!_bezdraw.active) {
    _bezdraw.active = true;
    _bezdraw.points = [makeBezAnchor(cx, cy, null)];

    var g = document.createElementNS('http://www.w3.org/2000/svg','svg');
    g.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;overflow:visible;';
    g.setAttribute('width','10000'); g.setAttribute('height','10000');
    g.setAttribute('viewBox','0 0 10000 10000');
    canvasStage.appendChild(g);
    _bezdraw.ghost = g;
    _bezdraw.ghostLine = null;
    updateBezGhostPath(cx, cy);
  }
  // Additional clicks handled by commitBezPoint on pointerup
}

function updateBezDraw(cx, cy) {
  if (!_bezdraw.active) { return; }
  updateBezGhostPath(cx, cy);
}

function commitBezPoint(cx, cy) {
  if (!_bezdraw.active) { return; }
  var last = _bezdraw.points[_bezdraw.points.length - 1];
  var dx = cx - last.x, dy = cy - last.y;
  if (dx*dx + dy*dy < 9) { return; } // too close — ignore
  var prev = _bezdraw.points[_bezdraw.points.length - 1];
  _bezdraw.points.push(makeBezAnchor(cx, cy, prev));
  updateBezGhostPath(cx, cy);
}

function finishBezDraw() {
  if (!_bezdraw.active) { return; }
  if (_bezdraw.ghost) { _bezdraw.ghost.remove(); _bezdraw.ghost = null; }
  _bezdraw.active = false;
  canvasWrap.style.cursor = 'crosshair';

  var pts = _bezdraw.points;
  if (!pts || pts.length < 2) { _bezdraw.points = []; return; }

  var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','dc-bezier');
  svg._uid    = 'bz' + Math.random().toString(36).slice(2,9);
  svg._name   = nextName('bezier');
  svg._type   = 'bezier';
  svg._points = pts.slice();
  svg._props  = JSON.parse(JSON.stringify(BEZPROPS));
  svg.style.position = 'absolute';
  svg.style.overflow = 'visible';
  buildBezSvg(svg);
  canvasStage.appendChild(svg);
  wireBezMove(svg);
  selectBez(svg);
  broadcastLayers();
  _bezdraw.points = [];
}

// ── Selection & handles ───────────────────────────────────────
function selectBez(svg) {
  deselectAll();
  _selectedBez = svg;
  svg._selected = true;
  svg.classList.add('selected');
  buildBezSvg(svg);
  addBezHandles(svg);
}

function deselectAllBez() {
  if (_selectedBez) {
    _selectedBez._selected = false;
    _selectedBez.classList.remove('selected');
    removeBezHandles(_selectedBez);
    buildBezSvg(_selectedBez);
    _selectedBez = null;
  }
}

// Square anchor handles + circular control handles with arms
function addBezHandles(svg) {
  removeBezHandles(svg);
  svg._bezHandles     = []; // anchor divs
  svg._bezCtrlHandles = []; // control-point divs
  svg._bezArmSvgs    = []; // SVG arm lines

  svg._points.forEach(function(pt, i) {
    // ── Anchor handle (square) ──
    var ah = document.createElement('div');
    ah.className = 'dc-handle';
    ah.dataset.bi = String(i);
    ah.style.cssText = 'width:10px;height:10px;background:#111;border:2px solid #38BDF8;position:absolute;transform:translate(-50%,-50%);cursor:move;z-index:10000;border-radius:2px;';
    ah.style.left = pt.x + 'px';
    ah.style.top  = pt.y + 'px';
    canvasStage.appendChild(ah);
    svg._bezHandles.push(ah);
    wireBezAnchorHandle(svg, ah, i);

    // ── Control handles (circles) + arm lines ──
    ['cp1','cp2'].forEach(function(cpKey) {
      // First anchor has no cp1; last anchor has no cp2 — still show both for editing
      if (!pt[cpKey]) { return; }
      var cp = pt[cpKey];

      // SVG arm line (anchor → control point) — fixed large viewport, class via setAttribute
      var armSvg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      armSvg.setAttribute('class','dc-bez-arm');
      armSvg.style.cssText = 'position:absolute;left:0;top:0;width:10000px;height:10000px;pointer-events:none;overflow:visible;z-index:9998;';
      armSvg.setAttribute('viewBox','0 0 10000 10000');
      var armLine = document.createElementNS('http://www.w3.org/2000/svg','line');
      armLine.setAttribute('stroke','#38BDF8');
      armLine.setAttribute('stroke-width','1');
      armLine.setAttribute('stroke-dasharray','3,3');
      armLine.setAttribute('x1', String(pt.x)); armLine.setAttribute('y1', String(pt.y));
      armLine.setAttribute('x2', String(cp.x)); armLine.setAttribute('y2', String(cp.y));
      armSvg.appendChild(armLine);
      canvasStage.appendChild(armSvg);
      svg._bezArmSvgs.push({ svg:armSvg, line:armLine, anchorIdx:i, cpKey:cpKey });

      // Circular control handle
      var ch = document.createElement('div');
      ch.className = 'dc-bez-ctrl';
      ch.dataset.bi   = String(i);
      ch.dataset.cpKey = cpKey;
      ch.style.left = cp.x + 'px';
      ch.style.top  = cp.y + 'px';
      canvasStage.appendChild(ch);
      svg._bezCtrlHandles.push({ div:ch, anchorIdx:i, cpKey:cpKey });
      wireBezCtrlHandle(svg, ch, i, cpKey);
    });
  });
}

function removeBezHandles(svg) {
  if (svg._bezHandles) {
    svg._bezHandles.forEach(function(h) { h.remove(); });
    svg._bezHandles = null;
  }
  if (svg._bezCtrlHandles) {
    svg._bezCtrlHandles.forEach(function(c) { c.div.remove(); });
    svg._bezCtrlHandles = null;
  }
  if (svg._bezArmSvgs) {
    svg._bezArmSvgs.forEach(function(a) { a.svg.remove(); });
    svg._bezArmSvgs = null;
  }
}

function repositionBezHandles(svg) {
  if (!svg._bezHandles) { return; }
  // Anchors
  svg._bezHandles.forEach(function(ah, i) {
    var pt = svg._points[i];
    ah.style.left = pt.x + 'px'; ah.style.top = pt.y + 'px';
  });
  // Arms + ctrl handles
  if (svg._bezArmSvgs) {
    svg._bezArmSvgs.forEach(function(a) {
      var pt = svg._points[a.anchorIdx];
      var cp = pt[a.cpKey];
      if (!cp) { return; }
      a.line.setAttribute('x1', String(pt.x)); a.line.setAttribute('y1', String(pt.y));
      a.line.setAttribute('x2', String(cp.x)); a.line.setAttribute('y2', String(cp.y));
    });
  }
  if (svg._bezCtrlHandles) {
    svg._bezCtrlHandles.forEach(function(c) {
      var pt = svg._points[c.anchorIdx];
      var cp = pt[c.cpKey];
      if (!cp) { return; }
      c.div.style.left = cp.x + 'px'; c.div.style.top = cp.y + 'px';
    });
  }
}

// Drag anchor — moves the anchor AND its control points together
function wireBezAnchorHandle(svg, handle, idx) {
  handle.addEventListener('pointerdown', function(e) {
    e.stopPropagation(); e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    _dragRc = canvasWrap.getBoundingClientRect();
    var startPt = { x: svg._points[idx].x, y: svg._points[idx].y };
    var startCp1 = svg._points[idx].cp1 ? { x:svg._points[idx].cp1.x, y:svg._points[idx].cp1.y } : null;
    var startCp2 = svg._points[idx].cp2 ? { x:svg._points[idx].cp2.x, y:svg._points[idx].cp2.y } : null;
    function onMove(ev) {
      var pt = toCanvasCached(ev.clientX, ev.clientY);
      var dx = pt.x - startPt.x, dy = pt.y - startPt.y;
      svg._points[idx].x = pt.x; svg._points[idx].y = pt.y;
      if (startCp1 && svg._points[idx].cp1) { svg._points[idx].cp1 = { x:startCp1.x+dx, y:startCp1.y+dy }; }
      if (startCp2 && svg._points[idx].cp2) { svg._points[idx].cp2 = { x:startCp2.x+dx, y:startCp2.y+dy }; }
      buildBezSvg(svg);
      repositionBezHandles(svg);
    }
    function onUp() { handle.removeEventListener('pointermove', onMove); handle.removeEventListener('pointerup', onUp); _dragRc = null; }
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup',   onUp);
  });
}

// Drag control handle — moves only that CP, mirrors opposite CP for smooth tangent
function wireBezCtrlHandle(svg, handle, anchorIdx, cpKey) {
  handle.addEventListener('pointerdown', function(e) {
    e.stopPropagation(); e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    _dragRc = canvasWrap.getBoundingClientRect();
    function onMove(ev) {
      var pt = toCanvasCached(ev.clientX, ev.clientY);
      var anchor = svg._points[anchorIdx];
      anchor[cpKey] = { x: pt.x, y: pt.y };
      // Mirror opposite control point for smooth (C1 continuous) tangent
      var oppositeKey = (cpKey === 'cp1') ? 'cp2' : 'cp1';
      if (anchor[oppositeKey]) {
        var dx = anchor.x - pt.x, dy = anchor.y - pt.y;
        anchor[oppositeKey] = { x: anchor.x + dx, y: anchor.y + dy };
      }
      buildBezSvg(svg);
      repositionBezHandles(svg);
    }
    function onUp() { handle.removeEventListener('pointermove', onMove); handle.removeEventListener('pointerup', onUp); _dragRc = null; }
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup',   onUp);
  });
}

// Move entire bezier path
function wireBezMove(svg) {
  svg.addEventListener('pointerdown', function(e) {
    if (e.button !== 0 || _space) { return; }
    e.stopPropagation();
    selectBez(svg);
    svg.setPointerCapture(e.pointerId);
    _dragRc = canvasWrap.getBoundingClientRect();
    var startClient = { x: e.clientX, y: e.clientY };
    var startPts = svg._points.map(function(p) {
      return { x:p.x, y:p.y,
               cp1: p.cp1 ? { x:p.cp1.x, y:p.cp1.y } : null,
               cp2: p.cp2 ? { x:p.cp2.x, y:p.cp2.y } : null };
    });
    function onMove(ev) {
      var dx = (ev.clientX - startClient.x) / S.zoom;
      var dy = (ev.clientY - startClient.y) / S.zoom;
      svg._points = startPts.map(function(p) {
        return {
          x: p.x+dx, y: p.y+dy,
          cp1: p.cp1 ? { x:p.cp1.x+dx, y:p.cp1.y+dy } : null,
          cp2: p.cp2 ? { x:p.cp2.x+dx, y:p.cp2.y+dy } : null
        };
      });
      buildBezSvg(svg);
      repositionBezHandles(svg);
    }
    function onUp() { svg.removeEventListener('pointermove', onMove); svg.removeEventListener('pointerup', onUp); _dragRc = null; broadcastLayers(); }
    svg.addEventListener('pointermove', onMove);
    svg.addEventListener('pointerup',   onUp);
  });
}

// ── Node tool support for bezier ─────────────────────────────
function showBezNodeHandles(svg) {
  // Reuse selectBez which already shows anchor + ctrl handles
  selectBez(svg);
}

// ── BEZIER TOOL

// ═══════════════════════════════════════════════════════════
// TEXT TOOL
// ═══════════════════════════════════════════════════════════
/*
 * ARCHITECTURE (Excalidraw-proven pattern):
 *
 * Each text object has TWO DOM elements:
 *   1. el  — a permanent div (.dc-text) on canvasStage: handles selection/move/display
 *   2. ta  — a temporary <textarea> (.dc-text-editor) added to canvasWrap during editing
 *            Removed on commit. Textarea gets focus natively — no webview focus tricks needed.
 *
 * The textarea is sized/positioned in SCREEN space (accounts for pan+zoom).
 * The display div is positioned in CANVAS space (inside canvasStage which has the transform).
 *
 * Click  → inline text, auto-width
 * Drag   → fixed text box, user-defined width/height
 */

var TEXTPROPS = {
  family      : 'Inter',
  weight      : 400,
  size        : 16,
  unit        : 'px',
  antialias   : 'antialiased',
  lineHeight  : 1.4,
  letterSpacing: 0,
  align       : 'left',
  italic      : false,
  underline   : false,
  strikethrough: false,
  color       : '#000000',
  colorOpacity: 1,
  shadow      : null
};

var _selectedText = null;
var _activeTextEditor = null;   // the live textarea while editing
var _activeTextEl     = null;   // the dc-text div being edited
var _suppressBlur     = false;  // true while sidebar prop change is in flight
var _txtDragState = { down:false, moved:false, sx:0, sy:0, ghost:null };

function colorWithAlpha(hex, opacity) {
  if (typeof colorWithOpacity === 'function') { return colorWithOpacity(hex, opacity); }
  if (opacity >= 1) { return hex; }
  var r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return 'rgba('+r+','+g+','+b+','+opacity+')';
}

function applyTextProps(el, props) {
  var p = props || TEXTPROPS;
  el.style.fontFamily     = "'"+p.family+"', sans-serif";
  el.style.fontWeight     = String(p.weight||400);
  el.style.fontSize       = (p.size||16)+(p.unit||'px');
  el.style.fontStyle      = p.italic ? 'italic' : 'normal';
  el.style.lineHeight     = String(p.lineHeight||1.4);
  el.style.letterSpacing  = (p.letterSpacing||0)+'px';
  el.style.textAlign      = p.align||'left';
  el.style.color          = colorWithAlpha(p.color||'#000000', p.colorOpacity!==undefined?p.colorOpacity:1);
  el.style.webkitFontSmoothing = (p.antialias==='antialiased')?'antialiased':(p.antialias==='none')?'none':'subpixel-antialiased';
  var dec=[];
  if(p.underline)     { dec.push('underline'); }
  if(p.strikethrough) { dec.push('line-through'); }
  el.style.textDecoration = dec.length ? dec.join(' ') : 'none';
  if(p.shadow) {
    var sh=p.shadow;
    el.style.textShadow=(sh.offset||0)+'px '+(sh.offset||0)+'px '+(sh.feather||4)+'px '+colorWithAlpha(sh.color||'#000000',sh.opacity!==undefined?sh.opacity:0.75);
  } else {
    el.style.textShadow='none';
  }
}

// ── Apply font/visual props to the live textarea (zoom-aware) ──
// All font sizes are multiplied by S.zoom so the textarea visually matches
// the canvas display div at the current zoom level.
// NOTE: fontSize is the ONE property that must be zoom-scaled.
// Everything else (color, weight, style, decoration) is zoom-independent.
function applyTextPropsToEditor(ta, props) {
  var p = props || TEXTPROPS;
  var rawSize   = p.size   || 16;
  var unit      = p.unit   || 'px';
  // Convert to px if needed, then scale by zoom
  var pxSize    = (unit === 'px') ? rawSize : rawSize * 16; // treat em/rem as ×16 baseline
  var scaledSize = pxSize * S.zoom;

  ta.style.setProperty('font-family',   "'"+p.family+"', Inter, sans-serif", 'important');
  ta.style.setProperty('font-weight',   String(p.weight || 400),             'important');
  ta.style.setProperty('font-size',     scaledSize + 'px',                   'important');
  ta.style.setProperty('font-style',    p.italic ? 'italic' : 'normal',      'important');
  ta.style.setProperty('line-height',   String(p.lineHeight || 1.4),         'important');
  ta.style.setProperty('letter-spacing',(p.letterSpacing || 0) + 'px',       'important');
  ta.style.setProperty('text-align',    p.align || 'left',                   'important');
  ta.style.setProperty('color',         colorWithAlpha(p.color || '#000000', p.colorOpacity !== undefined ? p.colorOpacity : 1), 'important');
  ta.style.webkitFontSmoothing = (p.antialias === 'antialiased') ? 'antialiased' : (p.antialias === 'none') ? 'none' : 'subpixel-antialiased';

  var dec = [];
  if (p.underline)      { dec.push('underline'); }
  if (p.strikethrough)  { dec.push('line-through'); }
  ta.style.textDecoration = dec.length ? dec.join(' ') : 'none';

  if (p.shadow) {
    var sh = p.shadow;
    // Shadow offsets are in canvas units — scale by zoom for screen display
    var sOff = (sh.offset || 0) * S.zoom;
    var sBlur = (sh.feather || 4) * S.zoom;
    ta.style.textShadow = sOff + 'px ' + sOff + 'px ' + sBlur + 'px ' + colorWithAlpha(sh.color || '#000000', sh.opacity !== undefined ? sh.opacity : 0.75);
  } else {
    ta.style.textShadow = 'none';
  }

  // After applying props, set the inline textarea to exactly one line height.
  // height:auto collapses a textarea to zero — must use explicit px height.
  if (ta._isInline) {
    var oneLine = Math.ceil(scaledSize * (p.lineHeight || 1.4));
    ta.style.height    = oneLine + 'px';
    ta.style.minHeight = oneLine + 'px';
    ta.style.maxHeight = oneLine + 'px';
  }
}

// ── Position and size the textarea over its canvas element (geometry only) ──
// This function sets ONLY: left, top, width, height, whitespace mode, padding.
// It does NOT set any font/color/style properties — those are owned exclusively
// by applyTextPropsToEditor(). Separating concerns prevents them overwriting each other.
function positionEditor(ta, el) {
  var rc      = canvasWrap.getBoundingClientRect();
  var elLeft  = parseFloat(el.style.left) || 0;
  var elTop   = parseFloat(el.style.top)  || 0;

  // Canvas → fixed screen coords
  var cx = elLeft * S.zoom + S.panX + rc.left;
  var cy = elTop  * S.zoom + S.panY + rc.top;

  ta.style.position = 'fixed';  // MUST be fixed — canvasStage has CSS transform
  ta.style.left   = cx + 'px';
  ta.style.top    = cy + 'px';
  ta.style.padding = '0';
  ta.style.margin  = '0';

  if (el._isBox) {
    var elW = parseFloat(el.style.width  || '200') || 200;
    var elH = parseFloat(el.style.height || '100') || 100;
    ta.style.width      = (elW * S.zoom) + 'px';
    ta.style.height     = (elH * S.zoom) + 'px';
    ta.style.minWidth   = '';
    ta.style.minHeight  = '';
    ta.style.maxHeight  = '';
    ta.style.whiteSpace = 'pre-wrap';
    ta.style.wordBreak  = 'break-word';
    ta.style.overflowY  = 'auto';
    ta._isInline        = false;
  } else {
    // Inline click mode: one-line textarea, grows horizontally as user types
    ta.style.width      = 'auto';
    ta.style.minWidth   = '8px';
    ta.style.height     = '';    // height set by applyTextPropsToEditor
    ta.style.maxHeight  = '';
    ta.style.whiteSpace = 'pre';
    ta.style.wordBreak  = 'normal';
    ta.style.overflowY  = 'hidden';
    ta._isInline        = true;
  }
}

// ── Open editor on an element ──────────────────────────────────
function openTextEditor(el) {
  closeTextEditor();  // close any existing one first

  // Hide display div while editing
  el.style.visibility = 'hidden';

  // Create textarea — MUST be position:fixed on document.body.
  // canvasStage has a CSS transform which breaks fixed positioning for children.
  var ta = document.createElement('textarea');
  ta.className     = 'dc-text-editor';
  ta.spellcheck    = false;
  ta.setAttribute('autocorrect', 'off');
  ta.setAttribute('autocapitalize', 'off');
  ta.value         = el._text || '';

  // Position first (sets _isInline flag and geometry), then font props
  positionEditor(ta, el);
  applyTextPropsToEditor(ta, el._props);

  // Append to document.body — outside all CSS transforms
  document.body.appendChild(ta);

  _activeTextEditor = ta;
  _activeTextEl     = el;
  _selectedText     = el;   // ensure textProps handler can update the open editor

  // Focus with multi-level fallback (rAF alone is swallowed in Electron webviews)
  function tryFocus() {
    if (!ta.parentNode) { return; }
    ta.focus({ preventScroll: true });
    ta.setSelectionRange(ta.value.length, ta.value.length);
  }
  requestAnimationFrame(function() {
    tryFocus();
    if (document.activeElement !== ta) {
      setTimeout(function() {
        tryFocus();
        if (document.activeElement !== ta) {
          setTimeout(function() {
            tryFocus();
            if (document.activeElement !== ta) { setTimeout(tryFocus, 150); }
          }, 16);
        }
      }, 0);
    }
  });

  // Auto-grow width for inline (click) mode
  if (!el._isBox) {
    ta.addEventListener('input', function() {
      ta.style.width = '4px';
      ta.style.width = Math.max(4, ta.scrollWidth) + 'px';
      el.style.width = ta.style.width;
    });
  }

  // Commit on blur — but NOT when focus left the canvas webview entirely.
  // Clicking the VSCode sidebar is a separate webview: the canvas document loses
  // focus (document.hasFocus() === false). In that case we do NOT refocus here —
  // that would steal focus back and close any open dropdown. Instead we just
  // suppress the commit. The textProps message handler will refocus after applying.
  ta.addEventListener('blur', function() {
    setTimeout(function() {
      if (!ta.parentNode) { return; }  // already removed

      // Sidebar click (different VSCode webview) — suppress commit, do NOT refocus here.
      // Refocusing here would immediately close sidebar dropdowns.
      if (!document.hasFocus()) { return; }

      // Focus stayed inside this document — check _suppressBlur set by textProps handler
      if (_suppressBlur) {
        ta.focus({ preventScroll: true });
        return;
      }

      // Focus genuinely moved to something else inside the canvas
      commitTextEditor();
    }, 80);
  });

  // Keyboard shortcuts
  ta.addEventListener('keydown', function(ev) {
    if (ev.key === 'Escape') {
      ev.preventDefault();
      ev.stopPropagation();
      commitTextEditor();
      return;
    }
    if (ev.key === 'Enter' && ev.ctrlKey) {
      ev.preventDefault();
      commitTextEditor();
    }
  });
}

// ── Commit: copy textarea value to display div, remove textarea ──
function commitTextEditor() {
  if (!_activeTextEditor || !_activeTextEl) { return; }
  var ta  = _activeTextEditor;
  var el  = _activeTextEl;
  _activeTextEditor = null;
  _activeTextEl     = null;

  var text = ta.value;
  ta.remove();
  el.style.visibility = '';

  if (!text.trim()) {
    el.remove();
    if (_selectedText === el) {
      _selectedText = null;
      _removeTextResizeHandle(el);
    }
    broadcastLayers();
    return;
  }

  el._text       = text;
  el.textContent = text;
  applyTextProps(el, el._props);

  // For inline text, sync width to actual rendered width
  if (!el._isBox) {
    el.style.width  = '';   // let it be natural
    el.style.height = '';
  }

  selectText(el);
  broadcastLayers();
}

// ── Close editor without committing (cancel) ──────────────────
function closeTextEditor() {
  if (!_activeTextEditor) { return; }
  _activeTextEditor.remove();
  if (_activeTextEl) { _activeTextEl.style.visibility = ''; }
  _activeTextEditor = null;
  _activeTextEl     = null;
}

// ── Create a new text element ──────────────────────────────────
// boxW/boxH = null  → click mode (inline, auto-width)
// boxW/boxH = num   → drag mode (fixed text box)
function createTextObject(cx, cy, boxW, boxH) {
  var isBox = (boxW != null);

  // Create the display div
  var el = document.createElement('div');
  el.className  = 'dc-text';
  el._uid       = 'tx'+Math.random().toString(36).slice(2,9);
  el._name      = nextName('text');
  el._type      = 'text';
  el._isBox     = isBox;
  el._text      = '';
  el._props     = JSON.parse(JSON.stringify(TEXTPROPS));
  el._selected  = false;

  el.style.position  = 'absolute';
  el.style.left      = cx + 'px';
  el.style.top       = cy + 'px';
  el.style.padding   = '0';
  el.style.boxSizing = 'border-box';

  applyTextProps(el, el._props);

  if (isBox) {
    el.style.width    = boxW + 'px';
    el.style.height   = boxH + 'px';
    el.style.overflow = 'hidden';
    el.style.whiteSpace = 'pre-wrap';
    el.style.wordBreak  = 'break-word';
  } else {
    // Click mode: height = exactly one line (fontSize * lineHeight), width grows as user types
    var fontSize   = (el._props.size || 16);
    var lineHeight = (el._props.lineHeight || 1.4);
    var unit       = (el._props.unit || 'px');
    var oneLineH   = (unit === 'px') ? fontSize * lineHeight : (fontSize * 1.333) * lineHeight; // em/rem approx
    el.style.width     = 'auto';
    el.style.height    = Math.ceil(oneLineH) + 'px';
    el.style.overflow  = 'visible';
    el.style.whiteSpace = 'pre';
    el.style.wordBreak  = 'normal';
  }

  canvasStage.appendChild(el);
  wireTextMove(el);
  broadcastLayers();

  // Open the editor immediately
  openTextEditor(el);

  return el;
}

// ── Selection ──────────────────────────────────────────────────
function selectText(el) {
  deselectAll();
  _selectedText   = el;
  el._selected    = true;
  el.style.outline = '1.5px dashed #9333ea';
  el.classList.add('selected');
  if (el._isBox) { _addTextResizeHandle(el); }
}

function deselectAllTexts() {
  if (!_selectedText) { return; }
  _selectedText._selected  = false;
  _selectedText.classList.remove('selected');
  _selectedText.style.outline = 'none';
  _removeTextResizeHandle(_selectedText);
  _selectedText = null;
}

// ── Resize handle (text box only) ──────────────────────────────
function _addTextResizeHandle(el) {
  _removeTextResizeHandle(el);
  var h = document.createElement('div');
  h.className = 'dc-text-resize';
  function _pos() {
    h.style.left = (parseFloat(el.style.left) + parseFloat(el.style.width||'0'))  + 'px';
    h.style.top  = (parseFloat(el.style.top)  + parseFloat(el.style.height||'0')) + 'px';
  }
  _pos();
  canvasStage.appendChild(h);
  el._resizeHandle = h;

  h.addEventListener('pointerdown', function(e) {
    e.stopPropagation(); e.preventDefault();
    h.setPointerCapture(e.pointerId);
    _dragRc = canvasWrap.getBoundingClientRect();
    var sw = parseFloat(el.style.width)||el.offsetWidth;
    var sh = parseFloat(el.style.height)||el.offsetHeight;
    var sx = e.clientX, sy = e.clientY;
    function onMove(ev) {
      el.style.width  = Math.max(60,  sw+(ev.clientX-sx)/S.zoom)+'px';
      el.style.height = Math.max(30, sh+(ev.clientY-sy)/S.zoom)+'px';
      _pos();
    }
    function onUp() { h.removeEventListener('pointermove',onMove); h.removeEventListener('pointerup',onUp); _dragRc=null; }
    h.addEventListener('pointermove', onMove);
    h.addEventListener('pointerup',   onUp);
  });
}

function _removeTextResizeHandle(el) {
  if (el && el._resizeHandle) { el._resizeHandle.remove(); el._resizeHandle = null; }
}

// ── Wire move + double-click-to-edit on display div ───────────
function wireTextMove(el) {
  el.addEventListener('pointerdown', function(e) {
    if (e.button !== 0 || _space) { return; }
    e.stopPropagation();
    selectText(el);
    el.setPointerCapture(e.pointerId);
    _dragRc = canvasWrap.getBoundingClientRect();
    var sx=e.clientX, sy=e.clientY;
    var ox=parseFloat(el.style.left), oy=parseFloat(el.style.top);
    var moved=false;
    function onMove(ev) {
      var dx=(ev.clientX-sx)/S.zoom, dy=(ev.clientY-sy)/S.zoom;
      if(Math.abs(dx)+Math.abs(dy)>2){moved=true;}
      el.style.left=(ox+dx)+'px'; el.style.top=(oy+dy)+'px';
      if(el._resizeHandle){
        el._resizeHandle.style.left=(parseFloat(el.style.left)+parseFloat(el.style.width||'0'))+'px';
        el._resizeHandle.style.top =(parseFloat(el.style.top) +parseFloat(el.style.height||'0'))+'px';
      }
    }
    function onUp() {
      el.removeEventListener('pointermove',onMove); el.removeEventListener('pointerup',onUp); _dragRc=null;
      if(moved){broadcastLayers();}
    }
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup',   onUp);
  });

  // Double-click re-opens editor
  el.addEventListener('dblclick', function(e) {
    e.stopPropagation();
    openTextEditor(el);
  });
}




var _nodeHandles  = [];     // array of handle divs currently on screen
var _nodeTarget   = null;

function clearAllNodeHandles() {
  _nodeHandles.forEach(function(h) { h.remove(); });
  _nodeHandles = [];
  _nodeTarget = null;
}

function showNodeHandles(svg) {
  clearAllNodeHandles();
  _nodeTarget = svg;

  var isLine = svg.classList.contains('dc-line');
  var isPen  = svg.classList.contains('dc-pen');
  if (!isLine && !isPen) { return; }

  var points = isLine
    ? [{ x: svg._x1, y: svg._y1 }, { x: svg._x2, y: svg._y2 }]
    : svg._points;

  points.forEach(function(pt, i) {
    var h = document.createElement('div');
    h.className = 'dc-node-handle';
    h.dataset.ni = String(i);
    h.style.left = pt.x + 'px';
    h.style.top  = pt.y + 'px';
    canvasStage.appendChild(h);
    _nodeHandles.push(h);
    wireNodeHandle(svg, h, i, isLine);
  });
}

function wireNodeHandle(svg, handle, idx, isLine) {
  handle.addEventListener('pointerdown', function(e) {
    e.stopPropagation(); e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    _dragRc = canvasWrap.getBoundingClientRect();

    function onMove(ev) {
      var pt = toCanvasCached(ev.clientX, ev.clientY);
      if (isLine) {
        if (idx === 0) { svg._x1 = pt.x; svg._y1 = pt.y; }
        else           { svg._x2 = pt.x; svg._y2 = pt.y; }
        buildLineSvg(svg);
        // Reposition all node handles from updated coords
        var newPts = [{ x: svg._x1, y: svg._y1 }, { x: svg._x2, y: svg._y2 }];
        _nodeHandles.forEach(function(h, i) {
          h.style.left = newPts[i].x + 'px';
          h.style.top  = newPts[i].y + 'px';
        });
      } else {
        svg._points[idx] = { x: pt.x, y: pt.y };
        buildPenSvg(svg);
        // Reposition all node handles from updated points
        _nodeHandles.forEach(function(h, i) {
          h.style.left = svg._points[i].x + 'px';
          h.style.top  = svg._points[i].y + 'px';
        });
      }
    }
    function onUp() {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      _dragRc = null;
    }
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup',   onUp);
  });
}

// ── Main canvas pointer events ────────────────────────────────
canvasWrap.addEventListener('pointerdown', function(e) {
  // Pan
  if (e.button === 1 || _space) {
    _pan.active = true;
    _pan.sx = e.clientX; _pan.sy = e.clientY;
    _pan.ox = S.panX;    _pan.oy = S.panY;
    canvasWrap.setPointerCapture(e.pointerId);
    canvasWrap.style.cursor = 'grabbing';
    e.preventDefault();
    return;
  }
  // Deselect when clicking bare canvas (not a shape or handle)
  // BUT: for text tool, never call deselectAll() on pointerdown — that would
  // commit/close any open editor before pointerup even fires. Text tool handles
  // deselection itself inside createTextObject → openTextEditor.
  if (e.button === 0 && (e.target === canvasWrap || e.target === canvasStage) && S.tool !== 'text') {
    deselectAll();
    broadcastLayers();
  }
  // Draw rect
  if (e.button === 0 && S.tool === 'rect' && !e.target.classList.contains('dc-handle') && !e.target.classList.contains('dc-rect')) {
    _dragRc = canvasWrap.getBoundingClientRect();
    var pt = toCanvasCached(e.clientX, e.clientY);
    canvasWrap.setPointerCapture(e.pointerId);
    startDraw(pt.x, pt.y);
    e.preventDefault();
  }
  // Draw ellipse
  if (e.button === 0 && S.tool === 'ellipse' && !e.target.classList.contains('dc-handle') && !e.target.classList.contains('dc-ellipse')) {
    _dragRc = canvasWrap.getBoundingClientRect();
    var pt = toCanvasCached(e.clientX, e.clientY);
    canvasWrap.setPointerCapture(e.pointerId);
    startEllipse(pt.x, pt.y);
    e.preventDefault();
  }
  // Draw polygon
  if (e.button === 0 && S.tool === 'polygon' && !e.target.classList.contains('dc-handle') && !e.target.classList.contains('dc-polygon')) {
    _dragRc = canvasWrap.getBoundingClientRect();
    var pt = toCanvasCached(e.clientX, e.clientY);
    canvasWrap.setPointerCapture(e.pointerId);
    startPolygon(pt.x, pt.y);
    e.preventDefault();
  }
  // Draw line
  if (e.button === 0 && S.tool === 'line' && !e.target.classList.contains('dc-handle') && !e.target.classList.contains('dc-line')) {
    _dragRc = canvasWrap.getBoundingClientRect();
    var pt = toCanvasCached(e.clientX, e.clientY);
    canvasWrap.setPointerCapture(e.pointerId);
    startLineDraw(pt.x, pt.y);
    e.preventDefault();
  }
  // Pen: click to add waypoint, or hold+drag for freehand
  if (e.button === 0 && S.tool === 'pen' && !e.target.classList.contains('dc-handle') && !e.target.classList.contains('dc-pen')) {
    _dragRc = canvasWrap.getBoundingClientRect();
    var pt = toCanvasCached(e.clientX, e.clientY);
    canvasWrap.setPointerCapture(e.pointerId);
    startPenDraw(pt.x, pt.y);
    e.preventDefault();
  }
  // Bezier tool: click to add anchor points, Escape to finish
  if (e.button === 0 && S.tool === 'bezier' && !e.target.classList.contains('dc-handle') && !e.target.classList.contains('dc-bez-ctrl') && !e.target.classList.contains('dc-bezier')) {
    _dragRc = canvasWrap.getBoundingClientRect();
    var pt = toCanvasCached(e.clientX, e.clientY);
    canvasWrap.setPointerCapture(e.pointerId);
    startBezDraw(pt.x, pt.y);
    e.preventDefault();
  }
  // Text tool: pointerdown — start drag detection
  if (e.button === 0 && S.tool === 'text' && !e.target.classList.contains('dc-text') && !e.target.classList.contains('dc-text-resize') && !e.target.classList.contains('dc-text-editor')) {
    _dragRc = canvasWrap.getBoundingClientRect(); // cache BEFORE toCanvasCached
    var pt = toCanvasCached(e.clientX, e.clientY);
    // Commit any open editor first (clicking elsewhere = done editing)
    if (_activeTextEditor) { commitTextEditor(); }
    _txtDragState.down  = true;
    _txtDragState.moved = false;
    _txtDragState.sx    = pt.x;
    _txtDragState.sy    = pt.y;
    _txtDragState.ghost = null;
    _txtDragState.pid   = e.pointerId;
    // NOTE: No setPointerCapture and no preventDefault here.
    // setPointerCapture would route pointerup to canvasWrap which steals focus.
    // preventDefault blocks browser focus wiring for the textarea.
  }
  // Node tool: click line, pen, or bezier to show nodes, click empty to clear
  if (e.button === 0 && S.tool === 'node' && !e.target.classList.contains('dc-node-handle') && !e.target.classList.contains('dc-bez-ctrl') && !e.target.classList.contains('dc-handle')) {
    var t = e.target.closest('.dc-line, .dc-pen, .dc-bezier');
    if (t) {
      if (t.classList.contains('dc-bezier')) {
        showBezNodeHandles(t);
      } else {
        showNodeHandles(t);
      }
    } else {
      clearAllNodeHandles();
    }
    e.preventDefault();
  }
});

canvasWrap.addEventListener('pointermove', function(e) {
  var rc = _dragRc || canvasWrap.getBoundingClientRect();
  var x  = Math.round((e.clientX - rc.left - S.panX) / S.zoom);
  var y  = Math.round((e.clientY - rc.top  - S.panY) / S.zoom);
  coordsEl.innerHTML = 'X: '+x+'&nbsp;&nbsp;Y: '+y;

  if (_pan.active) {
    S.panX = _pan.ox + (e.clientX - _pan.sx);
    S.panY = _pan.oy + (e.clientY - _pan.sy);
    applyXform();
    return;
  }
  if (_draw.active) {
    var pt = toCanvasCached(e.clientX, e.clientY);
    updateDraw(pt.x, pt.y, e.shiftKey);
  }
  if (_edraw.active) {
    var pt = toCanvasCached(e.clientX, e.clientY);
    updateEllipse(pt.x, pt.y, e.shiftKey);
  }
  if (_pdraw.active) {
    var pt = toCanvasCached(e.clientX, e.clientY);
    updatePolygon(pt.x, pt.y, e.shiftKey);
  }
  if (_ldraw.active) {
    var pt = toCanvasCached(e.clientX, e.clientY);
    updateLineDraw(pt.x, pt.y, e.shiftKey);
  }
  if (_pendraw.active) {
    var pt = toCanvasCached(e.clientX, e.clientY);
    updatePenDraw(pt.x, pt.y, e.buttons === 1);
  }
  if (_bezdraw.active) {
    var pt = toCanvasCached(e.clientX, e.clientY);
    updateBezDraw(pt.x, pt.y);
  }
  // Text tool: show ghost rectangle while dragging
  if (_txtDragState.down && S.tool === 'text') {
    var pt = toCanvasCached(e.clientX, e.clientY);
    var dx = pt.x - _txtDragState.sx, dy = pt.y - _txtDragState.sy;
    if (!_txtDragState.moved && (Math.abs(dx)+Math.abs(dy)) > 6) {
      _txtDragState.moved = true;
      // Create ghost rectangle
      var g = document.createElement('div');
      g.className = 'dc-text-ghost';
      canvasStage.appendChild(g);
      _txtDragState.ghost = g;
    }
    if (_txtDragState.ghost) {
      var gx = Math.min(pt.x, _txtDragState.sx);
      var gy = Math.min(pt.y, _txtDragState.sy);
      var gw = Math.abs(dx);
      var gh = Math.abs(dy);
      _txtDragState.ghost.style.left   = gx+'px';
      _txtDragState.ghost.style.top    = gy+'px';
      _txtDragState.ghost.style.width  = gw+'px';
      _txtDragState.ghost.style.height = gh+'px';
    }
  }
});

canvasWrap.addEventListener('pointerup', function(e) {
  if (_pan.active) {
    _pan.active = false;
    canvasWrap.style.cursor = _space ? 'grab' : '';
    _dragRc = null;
    return;
  }
  if (_draw.active) {
    var pt = toCanvasCached(e.clientX, e.clientY);
    finishDraw(pt.x, pt.y, e.shiftKey);
  }
  if (_edraw.active) {
    var pt = toCanvasCached(e.clientX, e.clientY);
    finishEllipse(pt.x, pt.y, e.shiftKey);
  }
  if (_pdraw.active) {
    var pt = toCanvasCached(e.clientX, e.clientY);
    finishPolygon(pt.x, pt.y, e.shiftKey);
  }
  if (_ldraw.active) {
    var pt = toCanvasCached(e.clientX, e.clientY);
    finishLineDraw(pt.x, pt.y, e.shiftKey);
  }
  if (_pendraw.active && !_pendraw.freehand) {
    // click-to-place: pointerup adds point but keeps drawing
    var pt = toCanvasCached(e.clientX, e.clientY);
    commitPenPoint(pt.x, pt.y);
  }
  if (_pendraw.active && _pendraw.freehand) {
    // freehand release: stop freehand stroke, finalize
    finishPenDraw();
  }
  if (_bezdraw.active) {
    var pt = toCanvasCached(e.clientX, e.clientY);
    commitBezPoint(pt.x, pt.y);
  }
  // Text tool: pointerup — decide click vs drag-to-box
  if (_txtDragState.down && S.tool === 'text') {
    _txtDragState.down = false;
    if (_txtDragState.ghost) { _txtDragState.ghost.remove(); _txtDragState.ghost = null; }
    var pt = toCanvasCached(e.clientX, e.clientY);
    if (_txtDragState.moved) {
      // Drag: create fixed text box
      var bx = Math.min(pt.x, _txtDragState.sx);
      var by = Math.min(pt.y, _txtDragState.sy);
      var bw = Math.max(60,  Math.abs(pt.x - _txtDragState.sx));
      var bh = Math.max(30, Math.abs(pt.y - _txtDragState.sy));
      createTextObject(bx, by, bw, bh);
    } else {
      // Click: create inline auto-size text
      createTextObject(_txtDragState.sx, _txtDragState.sy, null, null);
    }
    _txtDragState.moved = false;
    _dragRc = null;
    return; // Don't fall through to the _dragRc = null at end
  }
  _dragRc = null;
});

canvasWrap.addEventListener('mouseleave', function() {
  coordsEl.innerHTML = 'X: &mdash;&nbsp;&nbsp;Y: &mdash;';
});

// ── Keyboard: Delete / Copy / Paste ──────────────────────────
canvasWrap.setAttribute('tabindex', '0');
canvasWrap.addEventListener('pointerdown', function() {
  // Don't steal focus when text tool is active — the text div needs focus
  if (S.tool !== 'text') { canvasWrap.focus(); }
});

var _clipboard = null;  // { type: 'rect'|'ellipse', rx, ry, rw, rh, props }
var _pasteOffset = 0;

document.addEventListener('keydown', function(e) {
  // Escape: stop pen or bezier drawing in progress
  if (e.key === 'Escape' && _pendraw.active) {
    finishPenDraw();
    e.preventDefault();
    return;
  }
  if (e.key === 'Escape' && _bezdraw.active) {
    finishBezDraw();
    e.preventDefault();
    return;
  }
  // Delete
  if ((e.key === 'Delete' || e.key === 'Backspace') && (_selected || _selectedEll || _selectedPoly || _selectedLine || _selectedPen || _selectedBez || _selectedText || _selectedImage)) {
    if (_selected)      { _selected.remove(); _selected = null; }
    if (_selectedEll)   { removeEllipseHandles(_selectedEll); _selectedEll.remove(); _selectedEll = null; }
    if (_selectedPoly)  { removePolyHandles(_selectedPoly); _selectedPoly.remove(); _selectedPoly = null; }
    if (_selectedLine)  { removeLineHandles(_selectedLine); _selectedLine.remove(); _selectedLine = null; }
    if (_selectedPen)   { removePenHandles(_selectedPen); _selectedPen.remove(); _selectedPen = null; }
    if (_selectedBez)   { removeBezHandles(_selectedBez); _selectedBez.remove(); _selectedBez = null; }
    if (_selectedText && _selectedText.contentEditable !== 'true') { _selectedText.remove(); _selectedText = null; }
    if (_selectedImage) { if (_selectedImage._removeImageHandles) { _selectedImage._removeImageHandles(); } _selectedImage.remove(); _selectedImage = null; }
    broadcastLayers();
  }

  // Copy
  if (e.ctrlKey && e.key === 'c') {
    if (_selected) {
      _clipboard = { type:'rect', rx:_selected._rx, ry:_selected._ry, rw:_selected._rw, rh:_selected._rh, props:JSON.parse(JSON.stringify(_selected._props)) };
      _pasteOffset = 0;
    } else if (_selectedEll) {
      _clipboard = { type:'ellipse', rx:_selectedEll._rx, ry:_selectedEll._ry, rw:_selectedEll._rw, rh:_selectedEll._rh, props:JSON.parse(JSON.stringify(_selectedEll._props)) };
      _pasteOffset = 0;
    } else if (_selectedPoly) {
      _clipboard = { type:'polygon', rx:_selectedPoly._rx, ry:_selectedPoly._ry, rw:_selectedPoly._rw, rh:_selectedPoly._rh, props:JSON.parse(JSON.stringify(_selectedPoly._props)) };
      _pasteOffset = 0;
    }
  }

  // Paste
  if (e.ctrlKey && e.key === 'v') {
    if (!_clipboard) { return; }
    _pasteOffset += 20;
    var ox = _clipboard.rx + _pasteOffset;
    var oy = _clipboard.ry + _pasteOffset;

    if (_clipboard.type === 'rect') {
      var el = document.createElement('div');
      el.className = 'dc-rect';
      el._rx = ox; el._ry = oy; el._rw = _clipboard.rw; el._rh = _clipboard.rh;
      el._props = JSON.parse(JSON.stringify(_clipboard.props));
      positionRect(el);
      applyPropsToRect(el, el._props);
      canvasStage.appendChild(el);
      wireMove(el);
      selectRect(el);
    } else if (_clipboard.type === 'ellipse') {
      var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('class','dc-ellipse');
      svg.style.left     = ox + 'px';
      svg.style.top      = oy + 'px';
      svg.style.width    = _clipboard.rw + 'px';
      svg.style.height   = _clipboard.rh + 'px';
      svg.style.position = 'absolute';
      svg.style.overflow = 'visible';
      svg._rx = ox; svg._ry = oy; svg._rw = _clipboard.rw; svg._rh = _clipboard.rh;
      svg._props = JSON.parse(JSON.stringify(_clipboard.props));
      buildEllipseSvg(svg, _clipboard.rw, _clipboard.rh, svg._props);
      canvasStage.appendChild(svg);
      wireEllipseMove(svg);
      selectEllipse(svg);
    } else if (_clipboard.type === 'polygon') {
      var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('class','dc-polygon');
      svg.style.left = ox + 'px'; svg.style.top = oy + 'px';
      svg.style.width = _clipboard.rw + 'px'; svg.style.height = _clipboard.rh + 'px';
      svg.style.position = 'absolute'; svg.style.overflow = 'visible';
      svg._rx = ox; svg._ry = oy; svg._rw = _clipboard.rw; svg._rh = _clipboard.rh;
      svg._props = JSON.parse(JSON.stringify(_clipboard.props));
      buildPolygonSvg(svg, _clipboard.rw, _clipboard.rh, svg._props);
      canvasStage.appendChild(svg);
      wirePolyMove(svg);
      selectPolygon(svg);
    }
  }
});

// ── Theme bar ─────────────────────────────────────────────────
var THEMES = { white:'#ffffff', grey:'#888888', black:'#111111' };
document.querySelectorAll('.theme-btn[data-theme]').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var t = btn.dataset.theme;
    if (t === 'custom') { return; }
    document.querySelectorAll('.theme-btn').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    applyBg(THEMES[t]);
  });
});
bgPicker.addEventListener('input', function(e) {
  document.querySelectorAll('.theme-btn').forEach(function(b){ b.classList.remove('active'); });
  document.querySelector('[data-theme="custom"]').classList.add('active');
  applyBg(e.target.value);
});
function applyBg(color) {
  S.bgColor = color;
  canvasWrap.style.backgroundColor = color;
}

// ── Messages from sidebar ─────────────────────────────────────
window.addEventListener('message', function(e) {
  var msg = e.data;
  if (!msg || !msg.command) { return; }
  if (msg.command === 'setToolMode') {
    cancelIconDropPending();
    cancelImageDropPending();
    S.tool = msg.tool;
    canvasWrap.style.cursor = (msg.tool === 'rect' || msg.tool === 'ellipse' || msg.tool === 'polygon' || msg.tool === 'line' || msg.tool === 'pen' || msg.tool === 'bezier') ? 'crosshair' : (msg.tool === 'text' ? 'text' : (msg.tool === 'icon' ? 'copy' : (msg.tool === 'image' ? 'copy' : 'default')));
    if (msg.tool !== 'node') { clearAllNodeHandles(); }
  }
  if (msg.command === 'requestLayers') {
    broadcastLayers();
  }
  if (msg.command === 'rectProps') {
    PROPS = msg.props;
    if (_selected) {
      _selected._props = JSON.parse(JSON.stringify(PROPS));
      applyPropsToRect(_selected, _selected._props);
    }
  }
  if (msg.command === 'ellipseProps') {
    EPROPS = msg.props;
    if (_selectedEll) {
      _selectedEll._props = JSON.parse(JSON.stringify(EPROPS));
      buildEllipseSvg(_selectedEll, _selectedEll._rw, _selectedEll._rh, _selectedEll._props);
    }
  }
  if (msg.command === 'polygonProps') {
    PPROPS = msg.props;
    if (_selectedPoly) {
      _selectedPoly._props = JSON.parse(JSON.stringify(PPROPS));
      buildPolygonSvg(_selectedPoly, _selectedPoly._rw, _selectedPoly._rh, _selectedPoly._props);
    }
  }
  if (msg.command === 'lineProps') {
    LPROPS = msg.props;
    if (_selectedLine) {
      _selectedLine._props = JSON.parse(JSON.stringify(LPROPS));
      buildLineSvg(_selectedLine);
    }
  }
  if (msg.command === 'penProps') {
    PENPROPS = msg.props;
    if (_selectedPen) {
      _selectedPen._props = JSON.parse(JSON.stringify(PENPROPS));
      buildPenSvg(_selectedPen);
    }
  }
  if (msg.command === 'bezierProps') {
    BEZPROPS = msg.props;
    if (_selectedBez) {
      _selectedBez._props = JSON.parse(JSON.stringify(BEZPROPS));
      buildBezSvg(_selectedBez);
    }
  }
  if (msg.command === 'textProps') {
    TEXTPROPS = msg.props;
    if (_selectedText) {
      var oldSize = _selectedText._props ? _selectedText._props.size : 16;
      _selectedText._props = JSON.parse(JSON.stringify(TEXTPROPS));
      applyTextProps(_selectedText, _selectedText._props);

      if (_activeTextEditor && _activeTextEl === _selectedText) {
        var ta = _activeTextEditor;

        // Suppress blur-commit while the sidebar click has stolen focus
        _suppressBlur = true;

        // Save cursor position
        var selStart = ta.selectionStart;
        var selEnd   = ta.selectionEnd;

        applyTextPropsToEditor(ta, _selectedText._props);

        if (_selectedText._props.size !== oldSize) {
          positionEditor(ta, _selectedText);
        }

        // Restore cursor position and focus, then lift suppression
        requestAnimationFrame(function() {
          if (ta.parentNode) {
            try { ta.setSelectionRange(selStart, selEnd); } catch(e) {}
            ta.focus({ preventScroll: true });
          }
          _suppressBlur = false;
        });
      }
    }
  }
  if (msg.command === 'iconDragStart') {
    ICONPROPS = Object.assign(ICONPROPS, msg.props || {});
    S.tool = 'icon';
    startIconDropPending(msg.name, msg.svgInner, ICONPROPS);
  }
  if (msg.command === 'iconProps') {
    ICONPROPS = msg.props;
    if (_selectedIcon) {
      _selectedIcon._props = JSON.parse(JSON.stringify(ICONPROPS));
      applyPropsToIcon(_selectedIcon, _selectedIcon._props);
    }
  }
  if (msg.command === 'imageProps') {
    IMGPROPS = msg.props || IMGPROPS;
    if (_selectedImage) {
      _selectedImage._props = JSON.parse(JSON.stringify(IMGPROPS));
      applyPropsToImage(_selectedImage, _selectedImage._props);
    }
  }
  if (msg.command === 'imageReady') {
    IMGPROPS.src = msg.src;
    if (msg.w) { IMGPROPS.w = msg.w; }
    if (msg.h) { IMGPROPS.h = msg.h; }
    startImageDropPending(msg.src, msg.w || 200, msg.h || 150);
  }
  if (msg.command === 'shapeFillReady') {
    // Shape fill resolved — apply image fill directly to the target shape by uid
    var fillTarget = findByUid(msg.uid);
    if (fillTarget) { applyImageFillToShape(fillTarget, msg.src, msg.shadow || null); }
  }
  // ── Layer panel commands ──────────────────────────────────
  if (msg.command === 'selectObject') {
    var found = findByUid(msg.uid);
    if (found) {
      if (found.classList.contains('dc-rect'))         { selectRect(found); }
      else if (found.classList.contains('dc-ellipse')) { selectEllipse(found); }
      else if (found.classList.contains('dc-polygon')) { selectPolygon(found); }
      else if (found.classList.contains('dc-line'))    { selectLine(found); }
      else if (found.classList.contains('dc-pen'))     { selectPen(found); }
      else if (found.classList.contains('dc-bezier'))  { selectBez(found); }
      else if (found.classList.contains('dc-text'))    { selectText(found); }
      else if (found.classList.contains('dc-icon'))    { selectIcon(found); }
      else if (found.classList.contains('dc-image'))   { selectImage(found); }
      broadcastLayers();
    }
  }
  if (msg.command === 'deleteObject') {
    var found = findByUid(msg.uid);
    if (found) {
      if (found === _selected)     { _selected = null; }
      if (found === _selectedEll)  { removeEllipseHandles(found); _selectedEll = null; }
      if (found === _selectedPoly) { removePolyHandles(found); _selectedPoly = null; }
      if (found === _selectedLine) { removeLineHandles(found); _selectedLine = null; }
      if (found === _selectedPen)  { removePenHandles(found); _selectedPen = null; }
      if (found === _selectedBez)  { removeBezHandles(found); _selectedBez = null; }
      if (found === _selectedText) { _selectedText = null; }
      if (found === _selectedIcon) { if (found._removeIconHandles) { found._removeIconHandles(); } _selectedIcon = null; }
      if (found === _selectedImage) { if (found._removeImageHandles) { found._removeImageHandles(); } _selectedImage = null; }
      found.remove();
      broadcastLayers();
    }
  }
  if (msg.command === 'renameObject') {
    var found = findByUid(msg.uid);
    if (found) { found._name = msg.name; broadcastLayers(); }
  }
  if (msg.command === 'reorderObject') {
    var el = findByUid(msg.uid);
    var target = findByUid(msg.targetUid);
    if (!el || !target) { broadcastLayers(); return; }
    // Panel is shown in REVERSE DOM order (last DOM child = top of panel).
    // So panel 'before' (higher in panel = higher z-order) = later in DOM = after target.
    // And panel 'after' (lower in panel = lower z-order) = earlier in DOM = before target.
    if (msg.position === 'before') {
      // Move el to just AFTER target in DOM (= above target in panel)
      canvasStage.insertBefore(el, target.nextSibling);
    } else {
      // Move el to just BEFORE target in DOM (= below target in panel)
      canvasStage.insertBefore(el, target);
    }
    broadcastLayers();
  }
});


// ══════════════════════════════════════════════════════════════
//  ICON TOOL ENGINE
// ══════════════════════════════════════════════════════════════

var _selectedIcon    = null;
var _iconDropPending = null;
var _iconGhost       = null;

(function(){
  var s = document.createElement('style');
  s.textContent =
    '.dc-icon{position:absolute;cursor:move;box-sizing:border-box;overflow:visible;' +
               'display:flex;align-items:center;justify-content:center;}' +
    '.dc-icon.selected{outline:1.5px dashed #9333ea;}' +
    '.dc-icon svg{width:100%;height:100%;display:block;overflow:visible;}';
  document.head.appendChild(s);
})();

function applyPropsToIcon(el, props) {
  if (!el || !props) { return; }
  el._rw = props.w || 48; el._rh = props.h || 48;
  el.style.width  = el._rw + 'px';
  el.style.height = el._rh + 'px';
  var svg = el.querySelector('svg');
  if (!svg) { return; }
  var col = props.color || '#000000';
  svg.setAttribute('stroke', col);
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke-width', props.stroke ? String(props.stroke.weight || 2) : '2');
  svg.style.opacity = String(props.colorOpacity !== undefined ? props.colorOpacity : 1);
  if (props.shadow) {
    var sh = props.shadow;
    svg.style.filter = 'drop-shadow(' + (sh.offset||2) + 'px ' + (sh.offset||2) + 'px ' + (sh.feather||4) + 'px ' + (sh.color||'#000000') + ')';
  } else { svg.style.filter = ''; }
}

function placeIcon(cx, cy, iconName, svgInner, props) {
  var p = JSON.parse(JSON.stringify(props || ICONPROPS));
  var w = p.w || 48, h = p.h || 48;

  var el = document.createElement('div');
  el.className = 'dc-icon';
  el._uid      = 'ic' + Math.random().toString(36).slice(2,9);
  el._name     = nextName('icon');
  el._type     = 'icon';
  el._iconName = iconName;
  el._svgInner = svgInner;
  el._props    = p;
  el._rx = cx - w/2; el._ry = cy - h/2;
  el._rw = w;        el._rh = h;
  el._selected = false;
  el.style.left = el._rx+'px'; el.style.top  = el._ry+'px';
  el.style.width= w+'px';      el.style.height= h+'px';

  var svgEl = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svgEl.setAttribute('viewBox','0 0 24 24');
  svgEl.setAttribute('fill','none');
  svgEl.setAttribute('stroke', p.color||'#000000');
  svgEl.setAttribute('stroke-width','2');
  svgEl.setAttribute('stroke-linecap','round');
  svgEl.setAttribute('stroke-linejoin','round');
  svgEl.innerHTML = svgInner;
  el.appendChild(svgEl);
  applyPropsToIcon(el, p);
  canvasStage.appendChild(el);

  // ── Move ──
  el.addEventListener('pointerdown', function(e) {
    if (e.target.classList.contains('dc-handle')) { return; }
    if (e.button!==0||_space) { return; }
    if (S.tool!=='select'&&S.tool!=='icon') { return; }
    e.stopPropagation();
    selectIcon(el);
    el.setPointerCapture(e.pointerId);
    _dragRc = canvasWrap.getBoundingClientRect();
    var sx=e.clientX, sy=e.clientY, ox=el._rx, oy=el._ry;
    function onMove(ev) {
      el._rx = ox+(ev.clientX-sx)/S.zoom;
      el._ry = oy+(ev.clientY-sy)/S.zoom;
      el.style.left=el._rx+'px'; el.style.top=el._ry+'px';
    }
    function onUp() {
      el.removeEventListener('pointermove',onMove);
      el.removeEventListener('pointerup',onUp);
      _dragRc=null; broadcastLayers();
    }
    el.addEventListener('pointermove',onMove);
    el.addEventListener('pointerup',onUp);
  });

  // ── Resize handles — children of el, move with icon automatically ──
  function addIconHandles(iconEl) {
    removeIconHandles(iconEl);
    [
      {pos:'tl',l:'-4px', t:'-4px', ml:'',     mt:'',     cur:'nwse-resize'},
      {pos:'tr',l:'100%', t:'-4px', ml:'-4px', mt:'',     cur:'nesw-resize'},
      {pos:'bl',l:'-4px', t:'100%', ml:'',     mt:'-4px', cur:'nesw-resize'},
      {pos:'br',l:'100%', t:'100%', ml:'-4px', mt:'-4px', cur:'nwse-resize'}
    ].forEach(function(def){
      var h = document.createElement('div');
      h.className='dc-handle'; h.dataset.h=def.pos;
      h.style.cssText='position:absolute;width:8px;height:8px;background:#fff;border:1.5px solid #9333ea;border-radius:2px;z-index:10001;pointer-events:all;cursor:'+def.cur+';left:'+def.l+';top:'+def.t+';';
      if(def.ml){h.style.marginLeft=def.ml;} if(def.mt){h.style.marginTop=def.mt;}
      h.addEventListener('pointerdown',function(ev){
        ev.stopPropagation(); ev.preventDefault();
        h.setPointerCapture(ev.pointerId);
        _dragRc=canvasWrap.getBoundingClientRect();
        var sx2=ev.clientX, sy2=ev.clientY;
        var sr={x:iconEl._rx,y:iconEl._ry,w:iconEl._rw,h:iconEl._rh};
        var pos=def.pos;
        function onMv(e2){
          var dx=(e2.clientX-sx2)/S.zoom, dy=(e2.clientY-sy2)/S.zoom;
          var nx=sr.x,ny=sr.y,nw=sr.w,nh=sr.h;
          if(pos==='tl'){nx+=dx;ny+=dy;nw-=dx;nh-=dy;}
          if(pos==='tr'){         ny+=dy;nw+=dx;nh-=dy;}
          if(pos==='bl'){nx+=dx;         nw-=dx;nh+=dy;}
          if(pos==='br'){                nw+=dx;nh+=dy;}
          if(e2.shiftKey){var s2=Math.max(8,Math.max(nw,nh));nw=s2;nh=s2;}
          if(nw<8){nw=8;if(pos==='tl'||pos==='bl'){nx=sr.x+sr.w-8;}}
          if(nh<8){nh=8;if(pos==='tl'||pos==='tr'){ny=sr.y+sr.h-8;}}
          iconEl._rx=nx;iconEl._ry=ny;iconEl._rw=nw;iconEl._rh=nh;
          iconEl.style.left=nx+'px';iconEl.style.top=ny+'px';
          iconEl.style.width=nw+'px';iconEl.style.height=nh+'px';
          if(iconEl._props){iconEl._props.w=nw;iconEl._props.h=nh;}
        }
        function onUp2(){h.removeEventListener('pointermove',onMv);h.removeEventListener('pointerup',onUp2);_dragRc=null;broadcastLayers();}
        h.addEventListener('pointermove',onMv);
        h.addEventListener('pointerup',onUp2);
      });
      iconEl.appendChild(h);
    });
  }
  function removeIconHandles(iconEl){iconEl.querySelectorAll('.dc-handle').forEach(function(h){h.remove();});}

  el._addIconHandles    = function(){ addIconHandles(el); };
  el._removeIconHandles = function(){ removeIconHandles(el); };

  broadcastLayers();
  selectIcon(el);
  return el;
}

function selectIcon(el) {
  deselectAll();
  _selectedIcon=el; el._selected=true; el.classList.add('selected');
  addSelectionBorder(el);
  if(el._addIconHandles){el._addIconHandles();}
  broadcastLayers();
}

function deselectAllIcons() {
  if(!_selectedIcon){return;}
  _selectedIcon._selected=false; _selectedIcon.classList.remove('selected');
  removeSelectionBorder(_selectedIcon);
  if(_selectedIcon._removeIconHandles){_selectedIcon._removeIconHandles();}
  _selectedIcon=null;
}

function startIconDropPending(name, svgInner, props) {
  cancelIconDropPending();
  var p = props || ICONPROPS;
  var ghost = document.createElement('div');
  ghost.style.cssText='position:absolute;pointer-events:none;z-index:99999;opacity:0.55;width:'+(p.w||48)+'px;height:'+(p.h||48)+'px;display:none;';
  ghost.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="'+(p.color||'#000000')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;">'+svgInner+'</svg>';
  canvasStage.appendChild(ghost);
  _iconGhost=ghost;
  _iconDropPending={name:name,svgInner:svgInner,props:p};
  canvasWrap.style.cursor='copy';

  function onMove(ev) {
    if(!_iconGhost){return;}
    _iconGhost.style.display='block';
    var rc=canvasWrap.getBoundingClientRect();
    _iconGhost.style.left=((ev.clientX-rc.left-S.panX)/S.zoom-(p.w||48)/2)+'px';
    _iconGhost.style.top =((ev.clientY-rc.top -S.panY)/S.zoom-(p.h||48)/2)+'px';
  }
  function onLeave() {
    if(_iconGhost){_iconGhost.style.display='none';}
  }
  function onDown(ev) {
    if(ev.button!==0||!_iconDropPending){return;}
    var tgt=ev.target;
    var hitExisting=tgt.classList.contains('dc-handle')||
      !!tgt.closest('.dc-icon,.dc-text,.dc-rect,.dc-ellipse,.dc-polygon,.dc-line,.dc-pen,.dc-bezier');
    if(hitExisting){cancelIconDropPending();return;}
    ev.stopPropagation();ev.preventDefault();
    var pending=_iconDropPending;
    cancelIconDropPending();
    var rc=canvasWrap.getBoundingClientRect();
    placeIcon((ev.clientX-rc.left-S.panX)/S.zoom,(ev.clientY-rc.top-S.panY)/S.zoom,pending.name,pending.svgInner,pending.props);
    S.tool = 'select';
    canvasWrap.style.cursor = 'default';
    if (vscodeApi) { vscodeApi.postMessage({ command: 'toolModeChanged', tool: 'select' }); }
  }
  function onKey(ev){if(ev.key==='Escape'){cancelIconDropPending();}}

  canvasWrap.addEventListener('pointermove',onMove);
  canvasWrap.addEventListener('pointerleave',onLeave);
  canvasWrap.addEventListener('pointerdown',onDown,{capture:true});
  document.addEventListener('keydown',onKey);
  _iconDropPending._onMove=onMove;
  _iconDropPending._onLeave=onLeave;
  _iconDropPending._onDown=onDown;
  _iconDropPending._onKey=onKey;
}

function cancelIconDropPending() {
  if(_iconGhost){_iconGhost.remove();_iconGhost=null;}
  if(!_iconDropPending){return;}
  if(_iconDropPending._onMove){canvasWrap.removeEventListener('pointermove',_iconDropPending._onMove);}
  if(_iconDropPending._onLeave){canvasWrap.removeEventListener('pointerleave',_iconDropPending._onLeave);}
  if(_iconDropPending._onDown){canvasWrap.removeEventListener('pointerdown',_iconDropPending._onDown,{capture:true});}
  if(_iconDropPending._onKey){document.removeEventListener('keydown',_iconDropPending._onKey);}
  _iconDropPending=null;
  var t=S.tool;
  canvasWrap.style.cursor=(t==='rect'||t==='ellipse'||t==='polygon'||t==='line'||t==='pen'||t==='bezier')?'crosshair':(t==='text'?'text':(t==='icon'?'copy':'default'));
}


// ══════════════════════════════════════════════════════════════
//  IMAGE TOOL ENGINE
// ══════════════════════════════════════════════════════════════

var _selectedImage    = null;
var _imageDropPending = null;
var _imageGhost       = null;

// ── Apply shadow to a freestanding image element ─────────────
function applyPropsToImage(el, props) {
  if (!el || !props) { return; }
  if (props.shadow) {
    var sh = props.shadow;
    el.style.boxShadow = (sh.offset||2)+'px '+(sh.offset||2)+'px '+(sh.feather||4)+'px '+(sh.size||0)+'px '+colorWithOpacity(sh.color||'#000000', sh.opacity||0.75);
  } else {
    el.style.boxShadow = 'none';
  }
  if (props.w) { el._rw = props.w; el.style.width  = props.w + 'px'; }
  if (props.h) { el._rh = props.h; el.style.height = props.h + 'px'; }
  // Border radius — clips corners of the image and its inner <img>
  var r = props.r || 0;
  el.style.borderRadius = r ? r + 'px' : '';
  var inner = el.querySelector('img');
  if (inner) { inner.style.borderRadius = r ? r + 'px' : ''; }
}

// ── Apply image as fill to an existing shape (clipped mode) ──
// Handles both HTML div (rect) and SVG elements (ellipse, polygon)
function applyImageFillToShape(shapeEl, src, shadow) {
  if (!shapeEl || !src) { return; }
  shapeEl._imageSrc = src;

  var cls       = (shapeEl.getAttribute ? shapeEl.getAttribute('class') : shapeEl.className) || '';
  var isRect    = cls.indexOf('dc-rect')    !== -1;
  var isEllipse = cls.indexOf('dc-ellipse') !== -1;
  var isPolygon = cls.indexOf('dc-polygon') !== -1;

  // ── RECT (HTML div) ─────────────────────────────────────────
  if (isRect) {
    shapeEl.style.overflow = 'hidden';
    var existing = shapeEl.querySelector('.dc-shape-img');
    if (existing) { existing.remove(); }
    var img = document.createElement('img');
    img.className = 'dc-shape-img';
    img.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;pointer-events:none;display:block;border-radius:inherit;';
    img.src = src;
    shapeEl.insertBefore(img, shapeEl.firstChild);
    if (shadow) {
      var sh = shadow;
      shapeEl.style.boxShadow = (sh.offset||2)+'px '+(sh.offset||2)+'px '+(sh.feather||4)+'px '+(sh.size||0)+'px '+colorWithOpacity(sh.color||'#000000', sh.opacity||0.75);
    }
    return;
  }

  // ── ELLIPSE or POLYGON (SVG element) ────────────────────────
  // We inject an SVG <image> clipped to the shape's geometry into
  // the existing SVG's <defs> + a clipPath, placed behind stroke/selection.
  if (!isEllipse && !isPolygon) { return; }

  var w   = shapeEl._rw || 100;
  var h   = shapeEl._rh || 100;
  var uid = shapeEl._uid || 'sh';
  var clipId  = uid + '_imgclip';
  var imageId = uid + '_imgfill';

  // Remove previous image fill if any
  var oldImg  = shapeEl.querySelector('[data-img-fill]');
  if (oldImg) { oldImg.remove(); }
  // Remove previous clipPath from defs
  var defs = shapeEl.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    shapeEl.insertBefore(defs, shapeEl.firstChild);
  }
  var oldClip = defs.querySelector('#' + clipId);
  if (oldClip) { oldClip.remove(); }

  // Build clipPath matching the shape's exact geometry
  var clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
  clipPath.setAttribute('id', clipId);

  if (isEllipse) {
    var rx = w / 2; var ry = h / 2;
    var clipEl = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    clipEl.setAttribute('cx', String(rx));
    clipEl.setAttribute('cy', String(ry));
    clipEl.setAttribute('rx', String(rx));
    clipEl.setAttribute('ry', String(ry));
    clipPath.appendChild(clipEl);
  } else {
    // Polygon — use the same path generation
    var sides  = (shapeEl._props && shapeEl._props.sides)  || 6;
    var radius = (shapeEl._props && shapeEl._props.radius) || 0;
    var clipShape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    clipShape.setAttribute('d', polyPath(w/2, h/2, w/2, h/2, sides, radius));
    clipPath.appendChild(clipShape);
  }
  defs.appendChild(clipPath);

  // Create SVG <image> element sized to fill the shape
  var svgImg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
  svgImg.setAttribute('data-img-fill', '1');
  svgImg.setAttribute('href', src);
  svgImg.setAttribute('x', '0');
  svgImg.setAttribute('y', '0');
  svgImg.setAttribute('width',  String(w));
  svgImg.setAttribute('height', String(h));
  svgImg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svgImg.setAttribute('clip-path', 'url(#' + clipId + ')');
  svgImg.style.pointerEvents = 'none';

  // Insert image after defs, remove the fill ellipse entirely (image replaces it)
  var insertBefore = null;
  var fillEl = null;
  var children = Array.from(shapeEl.childNodes);
  for (var ci = 0; ci < children.length; ci++) {
    var cn = children[ci];
    if (cn.nodeName === 'defs') { continue; }
    if (cn.getAttribute && cn.getAttribute('filter')) { continue; }
    fillEl = cn;
    insertBefore = cn.nextSibling;
    break;
  }
  if (fillEl) { fillEl.remove(); }
  if (insertBefore) {
    shapeEl.insertBefore(svgImg, insertBefore);
  } else {
    shapeEl.appendChild(svgImg);
  }
  // Hit-area — transparent fill so SVG hit-testing works (pointer-events:visibleFill)
  var oldHit = shapeEl.querySelector('[data-hit-area]');
  if (oldHit) { oldHit.remove(); }
  var hw = shapeEl._rw || parseFloat(shapeEl.getAttribute('width')) || 100;
  var hh = shapeEl._rh || parseFloat(shapeEl.getAttribute('height')) || 100;
  var hitEl;
  if (isPolygon) {
    var hSides  = (shapeEl._props && shapeEl._props.sides)  || 6;
    var hRadius = (shapeEl._props && shapeEl._props.radius) || 0;
    hitEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    hitEl.setAttribute('d', polyPath(hw/2, hh/2, hw/2, hh/2, hSides, hRadius));
  } else {
    hitEl = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    hitEl.setAttribute('cx', String(hw / 2));
    hitEl.setAttribute('cy', String(hh / 2));
    hitEl.setAttribute('rx', String(hw / 2));
    hitEl.setAttribute('ry', String(hh / 2));
  }
  hitEl.setAttribute('fill', 'rgba(0,0,0,0.001)');
  hitEl.setAttribute('data-hit-area', '1');
  shapeEl.appendChild(hitEl);
}

// ── Place freestanding image at canvas coords ─────────────────
function placeImage(cx, cy, src, naturalW, naturalH, props) {
  var p = JSON.parse(JSON.stringify(props || IMGPROPS));
  var w = naturalW || p.w || 200;
  var h = naturalH || p.h || 150;

  var el = document.createElement('div');
  el.className = 'dc-image';
  el._uid   = 'img' + Math.random().toString(36).slice(2,9);
  el._name  = nextName('image');
  el._type  = 'image';
  el._rx    = cx - w/2;
  el._ry    = cy - h/2;
  el._rw    = w;
  el._rh    = h;
  el._props = p;
  el._selected = false;

  el.style.left   = el._rx + 'px';
  el.style.top    = el._ry + 'px';
  el.style.width  = w + 'px';
  el.style.height = h + 'px';

  var img = document.createElement('img');
  img.src = src;
  img.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;pointer-events:none;display:block;';
  el.appendChild(img);

  applyPropsToImage(el, p);
  canvasStage.appendChild(el);

  // ── Move ──
  el.addEventListener('pointerdown', function(e) {
    if (e.target.classList.contains('dc-handle')) { return; }
    if (e.button !== 0 || _space) { return; }
    if (S.tool !== 'select' && S.tool !== 'image') { return; }
    e.stopPropagation();
    selectImage(el);
    el.setPointerCapture(e.pointerId);
    _dragRc = canvasWrap.getBoundingClientRect();
    var sx = e.clientX, sy = e.clientY, ox = el._rx, oy = el._ry;
    function onMove(ev) {
      el._rx = ox + (ev.clientX - sx) / S.zoom;
      el._ry = oy + (ev.clientY - sy) / S.zoom;
      el.style.left = el._rx + 'px';
      el.style.top  = el._ry + 'px';
    }
    function onUp() {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup',   onUp);
      _dragRc = null;
      broadcastLayers();
    }
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup',   onUp);
  });

  // ── Resize handles — same pattern as icon ──
  function addImageHandles(imgEl) {
    removeImageHandles(imgEl);
    [
      {pos:'tl', l:'-4px', t:'-4px', ml:'',     mt:'',     cur:'nwse-resize'},
      {pos:'tr', l:'100%', t:'-4px', ml:'-4px', mt:'',     cur:'nesw-resize'},
      {pos:'bl', l:'-4px', t:'100%', ml:'',     mt:'-4px', cur:'nesw-resize'},
      {pos:'br', l:'100%', t:'100%', ml:'-4px', mt:'-4px', cur:'nwse-resize'}
    ].forEach(function(def) {
      var h = document.createElement('div');
      h.className = 'dc-handle';
      h.dataset.h = def.pos;
      h.style.cssText = 'position:absolute;width:8px;height:8px;background:#fff;border:1.5px solid #9333ea;border-radius:2px;z-index:10001;pointer-events:all;cursor:'+def.cur+';left:'+def.l+';top:'+def.t+';';
      if (def.ml) { h.style.marginLeft = def.ml; }
      if (def.mt) { h.style.marginTop  = def.mt; }
      h.addEventListener('pointerdown', function(ev) {
        ev.stopPropagation(); ev.preventDefault();
        h.setPointerCapture(ev.pointerId);
        _dragRc = canvasWrap.getBoundingClientRect();
        var sx2 = ev.clientX, sy2 = ev.clientY;
        var sr  = { x: imgEl._rx, y: imgEl._ry, w: imgEl._rw, h: imgEl._rh };
        var pos = def.pos;
        function onMv(e2) {
          var dx = (e2.clientX - sx2) / S.zoom;
          var dy = (e2.clientY - sy2) / S.zoom;
          var nx = sr.x, ny = sr.y, nw = sr.w, nh = sr.h;
          if (pos === 'tl') { nx += dx; ny += dy; nw -= dx; nh -= dy; }
          if (pos === 'tr') {           ny += dy; nw += dx; nh -= dy; }
          if (pos === 'bl') { nx += dx;           nw -= dx; nh += dy; }
          if (pos === 'br') {                      nw += dx; nh += dy; }
          if (e2.shiftKey) { var s2 = Math.max(10, Math.max(nw, nh)); nw = s2; nh = s2; }
          if (nw < 10) { nw = 10; if (pos === 'tl' || pos === 'bl') { nx = sr.x + sr.w - 10; } }
          if (nh < 10) { nh = 10; if (pos === 'tl' || pos === 'tr') { ny = sr.y + sr.h - 10; } }
          imgEl._rx = nx; imgEl._ry = ny; imgEl._rw = nw; imgEl._rh = nh;
          imgEl.style.left = nx + 'px'; imgEl.style.top  = ny + 'px';
          imgEl.style.width = nw + 'px'; imgEl.style.height = nh + 'px';
          if (imgEl._props) { imgEl._props.w = nw; imgEl._props.h = nh; }
          // Update selection border
          var selRect = imgEl.querySelector('.dc-sel-svg rect');
          if (selRect) {
            selRect.setAttribute('width',  String(Math.max(1, nw - 4)));
            selRect.setAttribute('height', String(Math.max(1, nh - 4)));
          }
        }
        function onUp2() {
          h.removeEventListener('pointermove', onMv);
          h.removeEventListener('pointerup',   onUp2);
          _dragRc = null;
          if (vscodeApi) { vscodeApi.postMessage({ command: 'imagePlaced', w: imgEl._rw, h: imgEl._rh }); }
          broadcastLayers();
        }
        h.addEventListener('pointermove', onMv);
        h.addEventListener('pointerup',   onUp2);
      });
      imgEl.appendChild(h);
    });
  }
  function removeImageHandles(imgEl) {
    imgEl.querySelectorAll('.dc-handle').forEach(function(h) { h.remove(); });
  }

  el._addImageHandles    = function() { addImageHandles(el); };
  el._removeImageHandles = function() { removeImageHandles(el); };

  broadcastLayers();
  selectImage(el);
  return el;
}

function selectImage(el) {
  deselectAll();
  _selectedImage = el;
  el._selected   = true;
  el.classList.add('selected');
  addSelectionBorder(el);
  if (el._addImageHandles) { el._addImageHandles(); }
  broadcastLayers();
}

function deselectAllImages() {
  if (!_selectedImage) { return; }
  _selectedImage._selected = false;
  _selectedImage.classList.remove('selected');
  removeSelectionBorder(_selectedImage);
  if (_selectedImage._removeImageHandles) { _selectedImage._removeImageHandles(); }
  _selectedImage = null;
}

// ── Ghost drop system — mirrors icon ghost exactly ────────────
function startImageDropPending(src, naturalW, naturalH) {
  cancelImageDropPending();

  var w = naturalW || 200;
  var h = naturalH || 150;

  var ghost = document.createElement('div');
  ghost.className = 'dc-image-ghost';
  ghost.style.width   = w + 'px';
  ghost.style.height  = h + 'px';
  ghost.style.display = 'none';
  ghost.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#9333ea" stroke-width="1.5" width="32" height="32"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>';
  canvasStage.appendChild(ghost);
  _imageGhost = ghost;

  _imageDropPending = { src: src, w: w, h: h };
  canvasWrap.style.cursor = 'cell';

  function onMove(ev) {
    if (!_imageGhost) { return; }
    _imageGhost.style.display = 'block';
    var rc = canvasWrap.getBoundingClientRect();
    _imageGhost.style.left = ((ev.clientX - rc.left - S.panX) / S.zoom - w / 2) + 'px';
    _imageGhost.style.top  = ((ev.clientY - rc.top  - S.panY) / S.zoom - h / 2) + 'px';
  }
  function onLeave() {
    if (_imageGhost) { _imageGhost.style.display = 'none'; }
  }
  function onDown(ev) {
    if (ev.button !== 0 || !_imageDropPending) { return; }
    var tgt = ev.target;
    var hitExisting = tgt.classList.contains('dc-handle') ||
      !!tgt.closest('.dc-icon,.dc-image,.dc-text,.dc-rect,.dc-ellipse,.dc-polygon,.dc-line,.dc-pen,.dc-bezier');
    if (hitExisting) { cancelImageDropPending(); return; }
    ev.stopPropagation(); ev.preventDefault();
    var pending = _imageDropPending;
    cancelImageDropPending();
    var rc = canvasWrap.getBoundingClientRect();
    var cx = (ev.clientX - rc.left - S.panX) / S.zoom;
    var cy = (ev.clientY - rc.top  - S.panY) / S.zoom;
    placeImage(cx, cy, pending.src, pending.w, pending.h, IMGPROPS);
    if (vscodeApi) { vscodeApi.postMessage({ command: 'imagePlaced', w: pending.w || IMGPROPS.w, h: pending.h || IMGPROPS.h }); }
    S.tool = 'select';
    canvasWrap.style.cursor = 'default';
    if (vscodeApi) { vscodeApi.postMessage({ command: 'toolModeChanged', tool: 'select' }); }
  }
  function onKey(ev) { if (ev.key === 'Escape') { cancelImageDropPending(); } }

  canvasWrap.addEventListener('pointermove',  onMove);
  canvasWrap.addEventListener('pointerleave', onLeave);
  canvasWrap.addEventListener('pointerdown',  onDown, { capture: true });
  document.addEventListener('keydown', onKey);

  _imageDropPending._onMove  = onMove;
  _imageDropPending._onLeave = onLeave;
  _imageDropPending._onDown  = onDown;
  _imageDropPending._onKey   = onKey;
}

function cancelImageDropPending() {
  if (_imageGhost) { _imageGhost.remove(); _imageGhost = null; }
  if (!_imageDropPending) { return; }
  if (_imageDropPending._onMove)  { canvasWrap.removeEventListener('pointermove',  _imageDropPending._onMove); }
  if (_imageDropPending._onLeave) { canvasWrap.removeEventListener('pointerleave', _imageDropPending._onLeave); }
  if (_imageDropPending._onDown)  { canvasWrap.removeEventListener('pointerdown',  _imageDropPending._onDown, { capture: true }); }
  if (_imageDropPending._onKey)   { document.removeEventListener('keydown', _imageDropPending._onKey); }
  _imageDropPending = null;
  var t = S.tool;
  canvasWrap.style.cursor = (t === 'rect' || t === 'ellipse' || t === 'polygon' || t === 'line' || t === 'pen' || t === 'bezier') ? 'crosshair' : (t === 'text' ? 'text' : (t === 'icon' ? 'copy' : (t === 'image' ? 'copy' : 'default')));
}

// ── Init ──────────────────────────────────────────────────────
applyXform();
canvasWrap.style.cursor = 'crosshair';

if (vscodeApi) { vscodeApi.postMessage({ command: 'canvasReady' }); }
`;
}
//# sourceMappingURL=drawingCanvasPanel.js.map