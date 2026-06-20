"use strict";
/**
 * SnapStak Database Schema View Provider
 * Sidebar view: drag-and-drop schema canvas (Database / Table / Enum).
 * Mirrors DatabaseContainer.jsx from the React app.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseSchemaViewProvider = void 0;
class DatabaseSchemaViewProvider {
    constructor(context) {
        this.context = context;
        // Shared schema state — exposed so PrefsView can read it
        this._schema = { databases: [] };
    }
    // Called by PrefsView to get current schema
    getSchema() { return this._schema; }
    // Called by PrefsView to push stak elements into the canvas (future use)
    postMessage(msg) {
        this._view?.webview.postMessage(msg);
    }
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = this.getHtml();
        webviewView.webview.onDidReceiveMessage((msg) => {
            if (msg.command === 'schemaChanged') {
                this._schema = msg.schema;
            }
        });
    }
    getHtml() {
        // NL trick — no \n in TS template literals
        const NL = String.fromCharCode(10);
        return `<!DOCTYPE html>${NL}<html lang="en">${NL}<head>${NL}` +
            `<meta charset="UTF-8">${NL}` +
            `<meta name="viewport" content="width=device-width,initial-scale=1">${NL}` +
            `<meta http-equiv="Content-Security-Policy" content="default-src 'none';style-src 'unsafe-inline';script-src 'unsafe-inline';">${NL}` +
            `<style>${NL}` + this.getCss() + `${NL}</style>${NL}` +
            `</head>${NL}<body>${NL}` +
            this.getBody() +
            `<script>${NL}(function(){${NL}'use strict';${NL}` + this.getJs() + `${NL}})();${NL}</script>${NL}` +
            `</body>${NL}</html>`;
    }
    getCss() {
        return `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#111;color:#ccc;font-family:var(--vscode-font-family);font-size:var(--vscode-font-size);overflow:hidden}
.root{display:flex;flex-direction:column;height:100vh;overflow:hidden}

/* Toolbar */
.toolbar{display:flex;align-items:center;gap:6px;padding:6px 8px;background:#1a1a1a;border-bottom:1px solid #333;flex-shrink:0;flex-wrap:wrap}
.drag-item{display:flex;flex-direction:column;align-items:center;gap:2px;padding:5px 9px;background:#2a2a2a;border:1px solid #444;border-radius:5px;color:#aaa;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;cursor:grab;user-select:none;transition:all .2s}
.drag-item svg{width:16px;height:16px}
.drag-item:hover{background:#333;border-color:#38BDF8;color:#fff}
.drag-item:active{cursor:grabbing}
.sep{width:1px;height:26px;background:#333;margin:0 2px}
.tbtn{display:flex;align-items:center;gap:5px;padding:4px 9px;background:#2a2a2a;border:1px solid #444;border-radius:4px;color:#aaa;font-size:10px;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap}
.tbtn:hover{background:#333;border-color:#38BDF8;color:#fff}
.tbtn.danger:hover{border-color:#ef4444;color:#ef4444}
.tbtn svg{width:12px;height:12px}
.zoom-lbl{font-size:10px;color:#888;padding:3px 7px;background:#1e1e1e;border:1px solid #333;border-radius:3px;min-width:42px;text-align:center}
.status{margin-left:auto;font-size:9px;color:#555;padding:2px 7px;background:#1e1e1e;border-radius:3px;border:1px solid #2a2a2a}
.status.has-data{color:#4ade80;border-color:#1a3a2a;background:#0d1f14}

/* Canvas */
.canvas-wrap{flex:1;position:relative;overflow:hidden;background:#111;background-image:radial-gradient(#2a2a2a 1px,transparent 0);background-size:20px 20px}
.canvas-wrap.drag-active{outline:2px dashed #38BDF8;outline-offset:-4px}
.svg-canvas{position:absolute;top:0;left:0;overflow:visible}
.drop-hint{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#333;pointer-events:none}
.drop-hint svg{width:44px;height:44px;opacity:.25}
.drop-hint p{font-size:11px;opacity:.4;text-align:center}
.drop-hint.hidden{display:none}

/* JSON panel */
.json-panel{position:absolute;bottom:0;left:0;right:0;background:#0d0d0d;border-top:2px solid #38BDF8;max-height:200px;overflow:hidden;transform:translateY(100%);transition:transform .25s;display:flex;flex-direction:column;z-index:50}
.json-panel.open{transform:translateY(0)}
.json-head{display:flex;align-items:center;justify-content:space-between;padding:5px 10px;background:#1a1a1a;border-bottom:1px solid #222;flex-shrink:0}
.json-head span{font-size:10px;font-weight:700;color:#38BDF8;text-transform:uppercase;letter-spacing:.5px}
.json-acts{display:flex;gap:5px}
.jbtn{padding:2px 8px;border:none;border-radius:3px;font-size:9px;font-weight:700;cursor:pointer;transition:all .15s}
.jbtn-copy{background:#38BDF8;color:#fff}.jbtn-copy:hover{background:#0284c7}
.jbtn-close{background:#333;color:#aaa}.jbtn-close:hover{background:#444;color:#fff}
.json-body{flex:1;overflow-y:auto;padding:8px;font-family:'Courier New',monospace;font-size:10px;color:#9cdcfe;line-height:1.5;white-space:pre}

/* Context menu */
.ctx-menu{display:none;position:fixed;background:#1e1e1e;border:1px solid #444;border-radius:5px;padding:4px;z-index:200;min-width:150px;box-shadow:0 4px 16px rgba(0,0,0,.6)}
.ctx-menu.open{display:block}
.ctx-item{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:3px;font-size:11px;color:#ccc;cursor:pointer;transition:background .1s}
.ctx-item:hover{background:#333;color:#fff}
.ctx-item.danger:hover{background:#3a1515;color:#ef4444}
.ctx-sep{height:1px;background:#333;margin:3px 0}
.ctx-item svg{width:12px;height:12px;flex-shrink:0}

/* Modal */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:300}
.modal-overlay.hidden{display:none}
.modal{background:#1a1a1a;border:1px solid #444;border-radius:8px;padding:18px;width:320px;max-width:90vw}
.modal h4{margin:0 0 14px;font-size:13px;color:#fff;font-weight:700}
.mfield{margin-bottom:11px}
.mfield label{display:block;font-size:11px;color:#888;margin-bottom:3px}
.minput,.mselect{width:100%;padding:6px 8px;background:#111;border:1px solid #333;border-radius:4px;color:#ccc;font-size:11px;outline:none}
.minput:focus,.mselect:focus{border-color:#38BDF8}
.mrow{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:11px}
.mcheck{display:flex;align-items:center;gap:7px;margin-bottom:11px}
.mcheck input{width:14px;height:14px;accent-color:#38BDF8;cursor:pointer}
.mcheck label{font-size:11px;color:#ccc;cursor:pointer}
.mbtns{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}
.mbtn{padding:6px 14px;border:none;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s}
.mbtn-ok{background:#38BDF8;color:#fff}.mbtn-ok:hover{background:#0284c7}.mbtn-ok:disabled{opacity:.4;cursor:not-allowed}
.mbtn-cancel{background:#333;color:#aaa;border:1px solid #444}.mbtn-cancel:hover{background:#444;color:#fff}

/* Toast */
.toast{position:fixed;bottom:12px;left:50%;transform:translateX(-50%) translateY(20px);background:#38BDF8;color:#fff;padding:6px 14px;border-radius:20px;font-size:10px;font-weight:700;opacity:0;transition:all .3s;pointer-events:none;z-index:400;white-space:nowrap}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
`;
    }
    getBody() {
        return `
<div class="toast" id="toast"></div>

<div class="ctx-menu" id="ctxMenu">
  <div class="ctx-item" id="ctx-add-table">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
    Add Table
  </div>
  <div class="ctx-item" id="ctx-add-enum">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
    Add Enum
  </div>
  <div class="ctx-sep"></div>
  <div class="ctx-item danger" id="ctx-delete-db">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
    Delete Database
  </div>
</div>

<div class="modal-overlay hidden" id="modalOverlay">
  <div class="modal">
    <h4 id="modalTitle">Create Database</h4>
    <div class="mfield"><label id="mlabel1">Name *</label><input class="minput" id="minput1" autocomplete="off"/></div>
    <div class="mfield hidden" id="mfield2"><label id="mlabel2">Type</label>
      <select class="mselect" id="mselect2">
        <option>integer</option><option>bigint</option><option>string</option><option>text</option>
        <option>decimal</option><option>float</option><option>boolean</option><option>date</option>
        <option>datetime</option><option>timestamp</option><option>json</option><option>enum</option>
      </select>
    </div>
    <div class="mcheck" id="mcheckRow"><input type="checkbox" id="mcheck"/><label for="mcheck" id="mchecklabel">Enable Authentication</label></div>
    <div class="mbtns">
      <button class="mbtn mbtn-cancel" id="mcancel">Cancel</button>
      <button class="mbtn mbtn-ok" id="mconfirm">Create</button>
    </div>
  </div>
</div>

<div class="root">
  <div class="toolbar">
    <div class="drag-item" draggable="true" data-palette="database" title="Drag to canvas">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
      Database
    </div>
    <div class="drag-item" draggable="true" data-palette="table" title="Drag onto a database">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
      Table
    </div>
    <div class="drag-item" draggable="true" data-palette="enum" title="Drag onto a database">
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
    <button class="tbtn danger" id="btnClear"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>Clear</button>
    <span class="status" id="statusLbl">0 databases</span>
  </div>

  <div class="canvas-wrap" id="canvasWrap">
    <svg class="svg-canvas" id="svgCanvas" width="100%" height="100%"></svg>
    <div class="drop-hint" id="dropHint">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
      <p>Drag a Database here to start<br>or right-click the canvas</p>
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
    getJs() {
        const NL = String.fromCharCode(10);
        // Full schema canvas JS — identical to the original databasePanel IIFE
        return `
const vscodeApi = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;
let _init = false;
if (_init) { return; } _init = true;

// ── State ─────────────────────────────────────────────────
const state = {
  databases: [],
  zoom: 100,
  panX: 0,
  panY: 0,
  dragging: null,
  modalCb: null,
  ctxDbId: null
};

const TW=650,TH=40,RH=48,EW=355,EH=40,TITLE_H=40,PAD=20;
const COL_HEADER='#2D5A6E',COL_BORDER='#4A7BA7';
let uid=0; const id=()=>'id'+(++uid);

// ── Elements ──────────────────────────────────────────────
const canvasWrap  = document.getElementById('canvasWrap');
const svg         = document.getElementById('svgCanvas');
const dropHint    = document.getElementById('dropHint');
const zoomLbl     = document.getElementById('zoomLbl');
const statusLbl   = document.getElementById('statusLbl');
const jsonPanel   = document.getElementById('jsonPanel');
const jsonBody    = document.getElementById('jsonBody');
const ctxMenu     = document.getElementById('ctxMenu');
const modalOverlay= document.getElementById('modalOverlay');
const modalTitle  = document.getElementById('modalTitle');
const mlabel1     = document.getElementById('mlabel1');
const minput1     = document.getElementById('minput1');
const mfield2     = document.getElementById('mfield2');
const mselect2    = document.getElementById('mselect2');
const mcheckRow   = document.getElementById('mcheckRow');
const mcheck      = document.getElementById('mcheck');
const mchecklabel = document.getElementById('mchecklabel');
const mcancel     = document.getElementById('mcancel');
const mconfirm    = document.getElementById('mconfirm');
const toast       = document.getElementById('toast');

// ── Toast ─────────────────────────────────────────────────
let _toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(()=>toast.classList.remove('show'), 2000);
}

// ── Modal ─────────────────────────────────────────────────
function openModal(cfg) {
  modalTitle.textContent   = cfg.title || 'Create';
  mlabel1.textContent      = cfg.label1 || 'Name *';
  minput1.value            = cfg.value1 || '';
  minput1.placeholder      = cfg.placeholder1 || '';
  mfield2.classList.toggle('hidden', !cfg.showType);
  mcheckRow.style.display  = cfg.showCheck ? '' : 'none';
  mcheck.checked           = cfg.checkValue || false;
  mchecklabel.textContent  = cfg.checkLabel || '';
  mconfirm.textContent     = cfg.confirmLabel || 'Create';
  modalOverlay.classList.remove('hidden');
  setTimeout(()=>minput1.focus(),50);
  state.modalCb = cfg.onConfirm;
}

mcancel.addEventListener('click', ()=> modalOverlay.classList.add('hidden'));
mconfirm.addEventListener('click', ()=>{
  const val = minput1.value.trim();
  if (!val) { minput1.style.borderColor='#ef4444'; return; }
  minput1.style.borderColor='';
  modalOverlay.classList.add('hidden');
  if (state.modalCb) state.modalCb({ name: val, type: mselect2.value, checked: mcheck.checked });
});
minput1.addEventListener('keydown', e=>{ if(e.key==='Enter') mconfirm.click(); });

// ── Transform ─────────────────────────────────────────────
function applyTransform() {
  const z = state.zoom/100;
  svg.setAttribute('transform','translate('+state.panX+','+state.panY+') scale('+z+')');
  zoomLbl.textContent = state.zoom+'%';
}

function zoom(delta, cx, cy) {
  const prev = state.zoom;
  state.zoom = Math.min(200, Math.max(25, state.zoom + delta));
  const ratio = state.zoom/prev;
  const rect  = canvasWrap.getBoundingClientRect();
  const ox = cx !== undefined ? cx - rect.left : rect.width/2;
  const oy = cy !== undefined ? cy - rect.top  : rect.height/2;
  state.panX = ox - ratio*(ox - state.panX);
  state.panY = oy - ratio*(oy - state.panY);
  applyTransform();
}

document.getElementById('btnZoomIn').addEventListener('click', ()=> zoom(10));
document.getElementById('btnZoomOut').addEventListener('click', ()=> zoom(-10));
document.getElementById('btnReset').addEventListener('click', ()=>{ state.zoom=100; state.panX=0; state.panY=0; applyTransform(); });

canvasWrap.addEventListener('wheel', e=>{
  e.preventDefault();
  zoom(e.deltaY < 0 ? 8 : -8, e.clientX, e.clientY);
}, { passive:false });

// ── Pan ───────────────────────────────────────────────────
let panning=false, panStart={x:0,y:0}, panOrigin={x:0,y:0};
canvasWrap.addEventListener('mousedown', e=>{
  if (e.altKey) { panning=true; panStart={x:e.clientX,y:e.clientY}; panOrigin={x:state.panX,y:state.panY}; e.preventDefault(); }
});
window.addEventListener('mousemove', e=>{
  if (!panning) return;
  state.panX = panOrigin.x + (e.clientX - panStart.x);
  state.panY = panOrigin.y + (e.clientY - panStart.y);
  applyTransform();
});
window.addEventListener('mouseup', ()=>{ panning=false; });

// ── Helpers ───────────────────────────────────────────────
function escHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function getDb(id){ return state.databases.find(d=>d.id===id)||null; }
function getTable(dbId,tId){ const db=getDb(dbId); return db?(db.tables||[]).find(t=>t.id===tId)||null:null; }
function getEnum(dbId,eId){ const db=getDb(dbId); return db?(db.enums||[]).find(e=>e.id===eId)||null:null; }

function tableHeight(t){
  const colCount = (t.columns||[]).length;
  const keysOpen = t._keysOpen;
  const formOpen = t._formOpen;
  const colRows = colCount * RH;
  const keysH = keysOpen ? 32 + (t.keys||[]).length * 36 + 40 : 0;
  const formH = formOpen ? 280 : 0;
  return TITLE_H + colRows + keysH + formH + PAD*2;
}
function enumHeight(e){
  const rowH = (e.values||[]).length * 32;
  const formH = e._formOpen ? 160 : 0;
  return EH + rowH + formH + PAD*2;
}
function calcBounds(db){
  let maxX=300, maxY=200;
  (db.tables||[]).forEach(t=>{ maxX=Math.max(maxX,t.x+TW+40); maxY=Math.max(maxY,t.y+tableHeight(t)+40); });
  (db.enums||[]).forEach(e=>{ maxX=Math.max(maxX,e.x+EW+40); maxY=Math.max(maxY,e.y+enumHeight(e)+40); });
  return { w:maxX, h:maxY };
}

// ── Render ────────────────────────────────────────────────
function render(){
  // Build all SVG as string and swap innerHTML
  let out = '';

  state.databases.forEach(db=>{
    const bounds = calcBounds(db);
    const w = Math.max(bounds.w, 300);
    const h = Math.max(bounds.h, 200);

    // Database container
    out += '<g class="db-container" data-db="'+db.id+'">';
    out += '<rect x="'+db.x+'" y="'+db.y+'" width="'+w+'" height="'+h+'" rx="8" ry="8" fill="#1a1a2e" stroke="'+COL_BORDER+'" stroke-width="2" class="db-border" style="cursor:move"/>';
    // Header bar
    out += '<rect x="'+db.x+'" y="'+db.y+'" width="'+w+'" height="32" rx="8" ry="8" fill="'+COL_HEADER+'"/>';
    out += '<rect x="'+db.x+'" y="'+(db.y+16)+'" width="'+w+'" height="16" fill="'+COL_HEADER+'"/>';
    // DB name
    out += '<text x="'+(db.x+12)+'" y="'+(db.y+21)+'" font-size="12" font-weight="700" fill="#fff" font-family="monospace">'+escHtml(db.name)+'</text>';
    // Auth badge
    if(db.auth){ out += '<rect x="'+(db.x+w-52)+'" y="'+(db.y+8)+'" width="44" height="16" rx="3" fill="rgba(0,200,100,.15)" stroke="#00c864" stroke-width="1"/>'; out += '<text x="'+(db.x+w-30)+'" y="'+(db.y+20)+'" font-size="9" fill="#4ade80" text-anchor="middle" font-family="monospace">AUTH</text>'; }
    out += '</g>';

    // Tables
    (db.tables||[]).forEach(t=>{
      const th = tableHeight(t);
      const tx = db.x + t.x, ty = db.y + t.y;
      out += '<g class="tbl-container" data-db="'+db.id+'" data-tbl="'+t.id+'">';
      out += '<rect x="'+tx+'" y="'+ty+'" width="'+TW+'" height="'+th+'" rx="5" fill="#0f1923" stroke="'+COL_BORDER+'" stroke-width="1.5"/>';
      out += '<rect x="'+tx+'" y="'+ty+'" width="'+TW+'" height="'+TH+'" rx="5" fill="'+COL_HEADER+'" style="cursor:move" class="tbl-header"/>';
      out += '<rect x="'+tx+'" y="'+(ty+25)+'" width="'+TW+'" height="15" fill="'+COL_HEADER+'"/>';
      out += '<text x="'+(tx+10)+'" y="'+(ty+24)+'" font-size="11" font-weight="700" fill="#fff" font-family="monospace">'+escHtml(t.name)+'</text>';

      // Columns
      (t.columns||[]).forEach((col,i)=>{
        const cy2 = ty + TITLE_H + i*RH;
        out += '<rect x="'+tx+'" y="'+cy2+'" width="'+TW+'" height="'+RH+'" fill="'+(i%2===0?'#0d161f':'#0a1219')+'" class="col-row" data-db="'+db.id+'" data-tbl="'+t.id+'" data-col="'+col.id+'" style="cursor:pointer"/>';
        out += '<text x="'+(tx+12)+'" y="'+(cy2+20)+'" font-size="11" fill="#ccc" font-family="monospace">'+escHtml(col.name)+'</text>';
        out += '<text x="'+(tx+200)+'" y="'+(cy2+20)+'" font-size="10" fill="#4A7BA7" font-family="monospace">'+escHtml(col.type)+'</text>';
        // badges
        const badges=[];
        (t.keys||[]).forEach(k=>{
          if((k.columns||[]).includes(col.name)){
            if(k.type==='primary') badges.push({c:'#f59e0b',l:'PK'});
            if(k.type==='unique')  badges.push({c:'#38BDF8',l:'UQ'});
            if(k.type==='foreign') badges.push({c:'#3b82f6',l:'FK'});
            if(k.type==='index')   badges.push({c:'#06b6d4',l:'IX'});
          }
        });
        badges.forEach((b,bi)=>{
          const bx = tx+TW-12-badges.length*30+bi*30;
          out += '<rect x="'+bx+'" y="'+(cy2+10)+'" width="26" height="14" rx="3" fill="'+b.c+'22" stroke="'+b.c+'" stroke-width="1"/>';
          out += '<text x="'+(bx+13)+'" y="'+(cy2+21)+'" font-size="8" fill="'+b.c+'" text-anchor="middle" font-weight="700" font-family="monospace">'+b.l+'</text>';
        });
        // nullable dot
        if(!col.nullable){ out += '<circle cx="'+(tx+TW-8)+'" cy="'+(cy2+RH/2)+'" r="3" fill="#ef4444"/>'; }
      });

      // Column form (add/edit)
      if(t._formOpen){
        const fy = ty + TITLE_H + (t.columns||[]).length*RH;
        out += '<foreignObject x="'+tx+'" y="'+fy+'" width="'+TW+'" height="280">';
        out += '<div xmlns="http://www.w3.org/1999/xhtml" style="background:#111;border-top:1px solid #2D5A6E;padding:10px;display:flex;flex-direction:column;gap:6px">';
        out += '<div style="font-size:10px;color:#38BDF8;font-weight:700;text-transform:uppercase;letter-spacing:.5px">'+( t._editingColId ? 'Edit Column' : 'Add Column')+'</div>';
        out += '<input id="fColName_'+t.id+'" value="'+escHtml(t._formName||'')+'" placeholder="column_name" style="padding:5px;background:#1a1a1a;border:1px solid #333;border-radius:3px;color:#ccc;font-size:11px;font-family:monospace;outline:none"/>';
        out += '<select id="fColType_'+t.id+'" style="padding:5px;background:#1a1a1a;border:1px solid #333;border-radius:3px;color:#ccc;font-size:11px">';
        ['integer','bigint','string','text','decimal','float','boolean','date','datetime','timestamp','json','enum'].forEach(tp=>{
          out += '<option'+(t._formType===tp?' selected':'')+'>'+tp+'</option>';
        });
        out += '</select>';
        out += '<div style="display:flex;gap:10px;flex-wrap:wrap">';
        out += '<label style="font-size:10px;color:#888;display:flex;align-items:center;gap:4px"><input type="checkbox" id="fUnique_'+t.id+'" '+(t._formUnique?'checked':'')+' style="accent-color:#38BDF8"/> Unique</label>';
        out += '<label style="font-size:10px;color:#888;display:flex;align-items:center;gap:4px"><input type="checkbox" id="fNullable_'+t.id+'" '+(t._formNullable?'checked':'')+' style="accent-color:#38BDF8"/> Nullable</label>';
        out += '<label style="font-size:10px;color:#888;display:flex;align-items:center;gap:4px"><input type="checkbox" id="fSearchable_'+t.id+'" '+(t._formSearchable?'checked':'')+' style="accent-color:#38BDF8"/> Searchable</label>';
        out += '</div>';
        out += '<div style="display:flex;gap:6px">';
        out += '<button id="fSave_'+t.id+'" style="flex:1;padding:5px;background:#38BDF8;border:none;border-radius:3px;color:#fff;font-size:10px;font-weight:700;cursor:pointer">'+(t._editingColId?'Update':'Save')+'</button>';
        out += '<button id="fClose_'+t.id+'" style="padding:5px 10px;background:#333;border:none;border-radius:3px;color:#aaa;font-size:10px;cursor:pointer">✕</button>';
        out += '</div>';
        out += '</div></foreignObject>';
      }

      // Keys panel
      if(t._keysOpen){
        const ky = ty + TITLE_H + (t.columns||[]).length*RH + (t._formOpen?280:0);
        out += '<rect x="'+tx+'" y="'+ky+'" width="'+TW+'" height="32" fill="#0d1923" stroke="'+COL_BORDER+'" stroke-width="1"/>';
        out += '<text x="'+(tx+10)+'" y="'+(ky+21)+'" font-size="10" fill="#4A7BA7" font-weight="700" font-family="monospace">KEYS</text>';
        out += '<text x="'+(tx+TW-60)+'" y="'+(ky+21)+'" font-size="9" fill="#38BDF8" style="cursor:pointer" class="add-key-btn" data-db="'+db.id+'" data-tbl="'+t.id+'">+ Add Key</text>';
        (t.keys||[]).forEach((k,ki)=>{
          const kry = ky+32+ki*36;
          out += '<rect x="'+tx+'" y="'+kry+'" width="'+TW+'" height="36" fill="'+(ki%2===0?'#0a1219':'#080f17')+'"/>';
          out += '<text x="'+(tx+10)+'" y="'+(kry+22)+'" font-size="10" fill="#'+
            (k.type==='primary'?'f59e0b':k.type==='unique'?'9333EA':k.type==='foreign'?'3b82f6':'06b6d4')+
            '" font-weight="700" font-family="monospace">'+k.type.toUpperCase()+'</text>';
          out += '<text x="'+(tx+70)+'" y="'+(kry+22)+'" font-size="10" fill="#666" font-family="monospace">'+escHtml((k.columns||[]).join(', '))+'</text>';
          out += '<text x="'+(tx+TW-18)+'" y="'+(kry+22)+'" font-size="12" fill="#c44" style="cursor:pointer" class="del-key-btn" data-db="'+db.id+'" data-tbl="'+t.id+'" data-kid="'+k.id+'">✕</text>';
        });
      }

      out += '</g>';
    });

    // Enums
    (db.enums||[]).forEach(en=>{
      const eh = enumHeight(en);
      const ex = db.x + en.x, ey = db.y + en.y;
      out += '<g class="enum-container" data-db="'+db.id+'" data-enum="'+en.id+'">';
      out += '<rect x="'+ex+'" y="'+ey+'" width="'+EW+'" height="'+eh+'" rx="5" fill="#060f1c" stroke="#38BDF8" stroke-width="1.5"/>';
      out += '<rect x="'+ex+'" y="'+ey+'" width="'+EW+'" height="'+EH+'" rx="5" fill="#0c1a2e" style="cursor:move" class="enum-header"/>';
      out += '<rect x="'+ex+'" y="'+(ey+25)+'" width="'+EW+'" height="15" fill="#0c1a2e"/>';
      out += '<text x="'+(ex+10)+'" y="'+(ey+24)+'" font-size="11" font-weight="700" fill="#bae6fd" font-family="monospace">ENUM: '+escHtml(en.name)+'</text>';
      (en.values||[]).forEach((v,vi)=>{
        const vy = ey+EH+vi*32;
        out += '<rect x="'+ex+'" y="'+vy+'" width="'+EW+'" height="32" fill="'+(vi%2===0?'#160d26':'#120a20')+'"/>';
        out += '<text x="'+(ex+12)+'" y="'+(vy+20)+'" font-size="11" fill="#bae6fd" font-family="monospace">'+escHtml(v.value)+'</text>';
        if(v.isDefault){ out += '<circle cx="'+(ex+EW-12)+'" cy="'+(vy+16)+'" r="4" fill="#38BDF8"/>'; }
      });
      out += '</g>';
    });
  });

  svg.innerHTML = out;

  // Status
  const dbs = state.databases.length;
  statusLbl.textContent = dbs + ' database'+(dbs!==1?'s':'');
  dropHint.classList.toggle('hidden', dbs>0);

  // Wire form buttons after render
  state.databases.forEach(db=>{
    (db.tables||[]).forEach(t=>{
      if(t._formOpen){
        const fName = document.getElementById('fColName_'+t.id);
        const fType = document.getElementById('fColType_'+t.id);
        const fUniq = document.getElementById('fUnique_'+t.id);
        const fNull = document.getElementById('fNullable_'+t.id);
        const fSrch = document.getElementById('fSearchable_'+t.id);
        const fSave = document.getElementById('fSave_'+t.id);
        const fClose= document.getElementById('fClose_'+t.id);

        if(fName){ fName.addEventListener('input',e=>{ t._formName=e.target.value; }); }
        if(fType){ fType.addEventListener('change',e=>{ t._formType=e.target.value; }); }
        if(fUniq){ fUniq.addEventListener('change',e=>{ t._formUnique=e.target.checked; }); }
        if(fNull){ fNull.addEventListener('change',e=>{ t._formNullable=e.target.checked; }); }
        if(fSrch){ fSrch.addEventListener('change',e=>{ t._formSearchable=e.target.checked; }); }
        if(fSave){ fSave.addEventListener('click',()=> saveColumn(db.id, t.id)); }
        if(fClose){ fClose.addEventListener('click',()=>{ t._formOpen=false; t._editingColId=null; resetForm(t); render(); }); }
      }
    });
  });

  // Wire click events
  svg.querySelectorAll('.col-row').forEach(el=>{
    el.addEventListener('click',()=> openColForm(el.dataset.db, el.dataset.tbl, el.dataset.col));
  });
  svg.querySelectorAll('.add-key-btn').forEach(el=>{
    el.addEventListener('click',()=> openAddKeyModal(el.dataset.db, el.dataset.tbl));
  });
  svg.querySelectorAll('.del-key-btn').forEach(el=>{
    el.addEventListener('click',()=> deleteKey(el.dataset.db, el.dataset.tbl, el.dataset.kid));
  });

  applyTransform();
  broadcastSchema();
}

function resetForm(t){ t._formName=''; t._formType='string'; t._formUnique=false; t._formNullable=true; t._formSearchable=false; }

function saveColumn(dbId, tblId){
  const t = getTable(dbId,tblId);
  if(!t) return;
  const fName = document.getElementById('fColName_'+tblId);
  const name = fName ? fName.value.trim() : t._formName;
  if(!name) return;
  if(t._editingColId){
    const col = (t.columns||[]).find(c=>c.id===t._editingColId);
    if(col){ col.name=name; col.type=t._formType; col.unique=t._formUnique; col.nullable=t._formNullable; col.searchable=t._formSearchable; }
    t._editingColId=null;
  } else {
    if(!t.columns) t.columns=[];
    t.columns.push({ id:id(), name, type:t._formType||'string', unique:!!t._formUnique, nullable:!!t._formNullable!==false, searchable:!!t._formSearchable });
  }
  resetForm(t);
  render();
}

function openColForm(dbId, tblId, colId){
  const t = getTable(dbId,tblId);
  if(!t) return;
  const col = (t.columns||[]).find(c=>c.id===colId);
  if(col){ t._editingColId=colId; t._formName=col.name; t._formType=col.type; t._formUnique=col.unique; t._formNullable=col.nullable; t._formSearchable=col.searchable; }
  t._formOpen=true;
  render();
}

function openAddKeyModal(dbId, tblId){
  openModal({
    title:'Add Key', label1:'Key Type', value1:'primary',
    onConfirm: cfg => {
      const t = getTable(dbId,tblId);
      if(!t) return;
      if(!t.keys) t.keys=[];
      t.keys.push({ id:id(), type:cfg.name||'primary', columns:[] });
      render();
    }
  });
}

function deleteKey(dbId, tblId, keyId){
  const t = getTable(dbId,tblId);
  if(!t) return;
  t.keys = (t.keys||[]).filter(k=>k.id!==keyId);
  render();
}

// ── Context menu ──────────────────────────────────────────
canvasWrap.addEventListener('contextmenu', e=>{
  e.preventDefault();
  // Find if we right-clicked on a db border
  const el = e.target.closest('.db-border');
  state.ctxDbId = el ? el.closest('[data-db]').dataset.db : null;
  if(!state.ctxDbId) return;
  ctxMenu.style.left = e.clientX+'px';
  ctxMenu.style.top  = e.clientY+'px';
  ctxMenu.classList.add('open');
});
document.addEventListener('click', ()=> ctxMenu.classList.remove('open'));

document.getElementById('ctx-add-table').addEventListener('click', ()=>{
  if(!state.ctxDbId) return;
  openModal({
    title:'Add Table', label1:'Table Name',
    onConfirm: cfg => {
      const db = getDb(state.ctxDbId);
      if(!db) return;
      if(!db.tables) db.tables=[];
      const t = { id:id(), name:cfg.name, x:20, y:50+db.tables.length*60, columns:[], keys:[], _formOpen:true };
      resetForm(t);
      db.tables.push(t);
      render();
    }
  });
});
document.getElementById('ctx-add-enum').addEventListener('click', ()=>{
  if(!state.ctxDbId) return;
  openModal({
    title:'Add Enum', label1:'Enum Name',
    onConfirm: cfg => {
      const db = getDb(state.ctxDbId);
      if(!db) return;
      if(!db.enums) db.enums=[];
      db.enums.push({ id:id(), name:cfg.name, x:20, y:50+db.enums.length*80, values:[] });
      render();
    }
  });
});
document.getElementById('ctx-delete-db').addEventListener('click', ()=>{
  if(!state.ctxDbId) return;
  state.databases = state.databases.filter(d=>d.id!==state.ctxDbId);
  state.ctxDbId=null;
  render();
});

// ── Drag from palette ─────────────────────────────────────
let _palItem=null;
document.querySelectorAll('.drag-item').forEach(el=>{
  el.addEventListener('dragstart', e=>{ _palItem=el.dataset.palette; e.dataTransfer.effectAllowed='copy'; });
  el.addEventListener('dragend',   ()=>{ _palItem=null; });
});
canvasWrap.addEventListener('dragover', e=>{ e.preventDefault(); canvasWrap.classList.add('drag-active'); });
canvasWrap.addEventListener('dragleave',()=> canvasWrap.classList.remove('drag-active'));
canvasWrap.addEventListener('drop', e=>{
  e.preventDefault();
  canvasWrap.classList.remove('drag-active');
  if(!_palItem) return;
  const rect = canvasWrap.getBoundingClientRect();
  const z = state.zoom/100;
  const cx = (e.clientX - rect.left - state.panX)/z;
  const cy = (e.clientY - rect.top  - state.panY)/z;
  if(_palItem==='database'){
    openModal({
      title:'Create Database', label1:'Database Name', placeholder1:'e.g. production_db',
      showCheck:true, checkLabel:'Enable Authentication',
      onConfirm: cfg => {
        state.databases.push({ id:id(), name:cfg.name, auth:cfg.checked, x:cx, y:cy, tables:[], enums:[] });
        render();
      }
    });
  } else if(_palItem==='table'){
    // Find db under drop point
    const db = state.databases.find(d=>{ const b=calcBounds(d); return cx>=d.x&&cx<=d.x+b.w&&cy>=d.y&&cy<=d.y+b.h; });
    if(!db){ showToast('Drop Table inside a Database'); return; }
    openModal({
      title:'Add Table', label1:'Table Name',
      onConfirm: cfg => {
        if(!db.tables) db.tables=[];
        const t={ id:id(), name:cfg.name, x:cx-db.x, y:cy-db.y, columns:[], keys:[], _formOpen:true };
        resetForm(t);
        db.tables.push(t);
        render();
      }
    });
  } else if(_palItem==='enum'){
    const db = state.databases.find(d=>{ const b=calcBounds(d); return cx>=d.x&&cx<=d.x+b.w&&cy>=d.y&&cy<=d.y+b.h; });
    if(!db){ showToast('Drop Enum inside a Database'); return; }
    openModal({
      title:'Add Enum', label1:'Enum Name',
      onConfirm: cfg => {
        if(!db.enums) db.enums=[];
        db.enums.push({ id:id(), name:cfg.name, x:cx-db.x, y:cy-db.y, values:[] });
        render();
      }
    });
  }
});

// ── Drag items on canvas ──────────────────────────────────
let drag=null;
svg.addEventListener('mousedown', e=>{
  const dbEl = e.target.closest('.db-border');
  const hdr  = e.target.closest('.tbl-header');
  const ehdr = e.target.closest('.enum-header');
  const z = state.zoom/100;
  const rect = canvasWrap.getBoundingClientRect();
  const mx = (e.clientX-rect.left-state.panX)/z;
  const my = (e.clientY-rect.top -state.panY)/z;
  if(dbEl){
    const g = dbEl.closest('[data-db]');
    const db = getDb(g.dataset.db);
    if(db) drag={ type:'db', id:db.id, ox:mx-db.x, oy:my-db.y };
  } else if(hdr){
    const g = hdr.closest('[data-tbl]');
    const db = getDb(g.dataset.db);
    const t  = getTable(g.dataset.db, g.dataset.tbl);
    if(t) drag={ type:'table', dbId:db.id, id:t.id, ox:mx-db.x-t.x, oy:my-db.y-t.y };
  } else if(ehdr){
    const g = ehdr.closest('[data-enum]');
    const db = getDb(g.dataset.db);
    const en = getEnum(g.dataset.db, g.dataset.enum);
    if(en) drag={ type:'enum', dbId:db.id, id:en.id, ox:mx-db.x-en.x, oy:my-db.y-en.y };
  }
});
window.addEventListener('mousemove', e=>{
  if(!drag || panning) return;
  const z = state.zoom/100;
  const rect = canvasWrap.getBoundingClientRect();
  const mx = (e.clientX-rect.left-state.panX)/z;
  const my = (e.clientY-rect.top -state.panY)/z;
  if(drag.type==='db'){
    const db=getDb(drag.id); if(db){ db.x=mx-drag.ox; db.y=my-drag.oy; }
  } else if(drag.type==='table'){
    const db=getDb(drag.dbId); const t=getTable(drag.dbId,drag.id);
    if(db&&t){ t.x=Math.max(0,mx-db.x-drag.ox); t.y=Math.max(40,my-db.y-drag.oy); }
  } else if(drag.type==='enum'){
    const db=getDb(drag.dbId); const en=getEnum(drag.dbId,drag.id);
    if(db&&en){ en.x=Math.max(0,mx-db.x-drag.ox); en.y=Math.max(40,my-db.y-drag.oy); }
  }
  render();
});
window.addEventListener('mouseup', ()=>{ drag=null; });

// ── Export JSON ───────────────────────────────────────────
document.getElementById('btnExport').addEventListener('click', ()=>{
  const schema = buildSchemaJson();
  jsonBody.textContent = JSON.stringify(schema, null, 2);
  jsonPanel.classList.add('open');
});
document.getElementById('btnCopyJson').addEventListener('click', ()=>{
  navigator.clipboard.writeText(jsonBody.textContent).then(()=> showToast('Copied!')).catch(()=> showToast('Copy failed'));
});
document.getElementById('btnCloseJson').addEventListener('click', ()=> jsonPanel.classList.remove('open'));
document.getElementById('btnClear').addEventListener('click', ()=>{
  state.databases=[];
  render();
});

function buildSchemaJson(){
  const dbs = state.databases;
  if(!dbs.length) return { version:'1.0.0', databases:[] };
  const db = dbs[0];
  return {
    version: '1.0.0',
    database: { name: db.name },
    auth: { enabled: !!db.auth },
    tables: (db.tables||[]).map(t=>({
      name: t.name,
      displayName: t.name,
      timestamps: !!t.timestamps,
      softDelete: !!t.softDelete,
      searchable: (t.columns||[]).filter(c=>c.searchable).map(c=>c.name),
      fields: (t.columns||[]).map(c=>({ name:c.name, type:c.type, nullable:!!c.nullable, unique:!!c.unique })),
      keys: (t.keys||[]).map(k=>({ type:k.type, columns:k.columns||[] }))
    })),
    enums: (db.enums||[]).map(e=>({ name:e.name, values:(e.values||[]).map(v=>v.value), default:(e.values||[]).find(v=>v.isDefault)?.value }))
  };
}

function broadcastSchema(){
  if(vscodeApi) vscodeApi.postMessage({ command:'schemaChanged', schema:{ databases:state.databases } });
}

// ── Resize ────────────────────────────────────────────────
new ResizeObserver(()=> applyTransform()).observe(canvasWrap);

// ── Boot ──────────────────────────────────────────────────
applyTransform();
render();
`;
    }
}
exports.DatabaseSchemaViewProvider = DatabaseSchemaViewProvider;
DatabaseSchemaViewProvider.viewId = 'snapstak.databaseSchemaView';
//# sourceMappingURL=databaseSchemaViewProvider.js.map