"use strict";
/**
 * SnapStak Database Preferences View Provider
 * Sidebar view: stak element assignment to schema tables.
 * Mirrors DatabasePreferencesPanel.jsx from the React app.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabasePrefsViewProvider = void 0;
class DatabasePrefsViewProvider {
    constructor(context, schemaProvider) {
        this.context = context;
        this.schemaProvider = schemaProvider;
    }
    // Called externally to push staks (from canvas/editor)
    setStakElements(elements) {
        this._view?.webview.postMessage({ command: 'stakElements', elements });
    }
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = this.getHtml();
        webviewView.webview.onDidReceiveMessage((msg) => {
            if (msg.command === 'requestSchema') {
                const schema = this.schemaProvider.getSchema();
                this._view?.webview.postMessage({ command: 'schema', schema });
            }
            if (msg.command === 'assignmentChanged') {
                // Persist assignment to globalState for later use
                this.context.globalState.update('snapstak.dbAssignment', msg.assignment);
            }
        });
    }
    getHtml() {
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
html,body{height:100%;background:var(--vscode-sideBar-background);color:var(--vscode-foreground);font-family:var(--vscode-font-family);font-size:var(--vscode-font-size);overflow:hidden}
.root{display:flex;flex-direction:column;height:100vh;overflow:hidden}
.top-bar{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--vscode-widget-border);flex-shrink:0}
.section-lbl{font-size:9px;color:#666;text-transform:uppercase;letter-spacing:.6px;font-weight:700}
.refresh-btn{padding:3px 8px;background:#38BDF8;border:none;border-radius:3px;color:#fff;font-size:9px;font-weight:700;cursor:pointer;transition:background .15s}
.refresh-btn:hover{background:#0284c7}
.body{flex:1;overflow-y:auto;overflow-x:hidden;padding:10px 12px;display:flex;flex-direction:column;gap:10px}

/* Schema selector */
.field-lbl{font-size:9px;color:#666;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;font-weight:700}
.sel{width:100%;padding:6px 8px;background:var(--vscode-input-background);border:1px solid var(--vscode-widget-border);border-radius:4px;color:var(--vscode-foreground);font-size:11px;outline:none;cursor:pointer}
.sel:focus{border-color:#38BDF8}

/* Segment indicator */
.seg-row{padding:6px 10px;background:rgba(74,222,128,.06);border:1px solid rgba(74,222,128,.2);border-radius:4px;font-size:11px;color:#4ade80}

/* Panel blocks */
.panel{background:var(--vscode-sideBar-background);border:1px solid var(--vscode-widget-border);border-radius:5px;overflow:hidden}
.panel-head{display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:var(--vscode-sideBarSectionHeader-background,#1a1a1a);border-bottom:1px solid var(--vscode-widget-border)}
.panel-title{font-size:10px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:.4px}
.panel-count{font-size:9px;color:#666;background:rgba(255,255,255,.06);padding:1px 6px;border-radius:10px}
.list{max-height:200px;overflow-y:auto;padding:4px;display:flex;flex-direction:column;gap:2px}
.empty{font-size:11px;color:#444;text-align:center;padding:16px 0;font-style:italic}

/* Stak item */
.stak-item{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:4px;cursor:pointer;border:1px solid transparent;transition:all .15s;background:var(--vscode-input-background)}
.stak-item:hover{border-color:var(--vscode-widget-border);filter:brightness(1.1)}
.stak-item.selected{border-color:#38BDF8;background:rgba(56,189,248,.1)}
.stak-icon{width:15px;height:15px;color:#666;flex-shrink:0}
.stak-label{flex:1;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.stak-type{font-size:9px;color:#555;flex-shrink:0}
.stak-action{width:15px;height:15px;color:#38BDF8;flex-shrink:0;cursor:pointer;opacity:.6;transition:opacity .15s}
.stak-action:hover{opacity:1}

/* Assigned tree */
.tree-panel{border:1px solid var(--vscode-widget-border);border-radius:5px;overflow:hidden;display:flex;flex-direction:column}
.tree-body{overflow-y:auto;padding:4px;flex:1;max-height:240px}
.tree-parent{margin-bottom:3px}
.tree-parent-lbl{display:flex;align-items:center;gap:6px;padding:5px 8px;background:var(--vscode-sideBarSectionHeader-background,#1a1a1a);border-radius:4px;font-size:10px;color:#888;font-weight:700;border:1px solid var(--vscode-widget-border)}
.tree-parent-lbl svg{width:12px;height:12px;color:#38BDF8;flex-shrink:0}
.tree-children{padding-left:14px;margin-top:2px;display:flex;flex-direction:column;gap:2px}
.tree-child{display:flex;align-items:center;gap:6px;padding:4px 8px;font-size:10px;color:#666;border-radius:3px;background:rgba(255,255,255,.02);border:1px solid transparent}
.tree-child svg{width:11px;height:11px;flex-shrink:0;color:#555}
.tree-trash{color:#c44!important;cursor:pointer;opacity:.5;transition:opacity .15s}
.tree-trash:hover{opacity:1!important}
.no-schema{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 0;gap:8px;color:#444;font-size:11px;text-align:center}
.no-schema svg{width:28px;height:28px;opacity:.25}
`;
    }
    getBody() {
        return `
<div class="root">
  <div class="top-bar">
    <span class="section-lbl">Stak Element Assignment</span>
    <button class="refresh-btn" id="btnRefresh">↺ Refresh Schema</button>
  </div>
  <div class="body">

    <div>
      <div class="field-lbl">Active Database Schema</div>
      <select class="sel" id="schemaSelect">
        <option value="">-- No schema built yet --</option>
      </select>
    </div>

    <div id="segRow" style="display:none">
      <div class="field-lbl">Segment ID Table</div>
      <div class="seg-row" id="segLabel">—</div>
    </div>

    <div class="panel">
      <div class="panel-head">
        <span class="panel-title">Unassigned Stak Elements</span>
        <span class="panel-count" id="unassignedCount">0</span>
      </div>
      <div class="list" id="unassignedList">
        <div class="empty">No stak elements detected yet</div>
      </div>
    </div>

    <div class="tree-panel">
      <div class="panel-head" style="border-bottom:1px solid var(--vscode-widget-border)">
        <span class="panel-title">Assigned Stak Elements</span>
        <span class="panel-count" id="assignedCount">0</span>
      </div>
      <div class="tree-body" id="assignedTree">
        <div class="no-schema">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          Build a schema then assign stak elements
        </div>
      </div>
    </div>

  </div>
</div>
`;
    }
    getJs() {
        return `
const vscodeApi = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;
let _init = false;
if (_init) { return; } _init = true;

let schema      = { databases: [] };
let stakElements= [];
let assignedMap = {};     // { tableId: { elementId: { name, type } } }
let selectedId  = null;

const schemaSelect    = document.getElementById('schemaSelect');
const segRow          = document.getElementById('segRow');
const segLabel        = document.getElementById('segLabel');
const unassignedList  = document.getElementById('unassignedList');
const unassignedCount = document.getElementById('unassignedCount');
const assignedTree    = document.getElementById('assignedTree');
const assignedCount   = document.getElementById('assignedCount');

function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function typeIcon(type) {
  const t=(type||'').toLowerCase();
  if(t==='img'||t==='picture'||t==='svg') return '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>';
  if(t==='p'||t==='span'||t==='h1'||t==='h2'||t==='h3'||t==='h4'||t==='h5'||t==='h6') return '<line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>';
  if(t==='ul'||t==='ol'||t==='dl') return '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>';
  return '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>';
}

function normalize(n){ return (n||'').toLowerCase().replace(/_/g,''); }

function findSegmentTable(db) {
  if(!db) return null;
  for(const t of (db.tables||[])){
    for(const k of (t.keys||[])){
      if(k.type==='primary' && (k.columns||[]).some(c=>normalize(c)==='segmentid')){
        return t;
      }
    }
  }
  return null;
}

function getSelectedDb() {
  return (schema.databases||[]).find(d=>d.id===schemaSelect.value)
    || (schema.databases||[])[0]
    || null;
}

function render() {
  const db = getSelectedDb();

  // Rebuild schema selector
  const prev = schemaSelect.value;
  if(schema.databases && schema.databases.length){
    schemaSelect.innerHTML = schema.databases.map(d=>'<option value="'+esc(d.id)+'">'+esc(d.name)+'</option>').join('');
    if(prev && schema.databases.find(d=>d.id===prev)) schemaSelect.value=prev;
  } else {
    schemaSelect.innerHTML = '<option value="">-- No schema built yet --</option>';
  }

  // Segment ID
  const segTable = findSegmentTable(db);
  if(segTable){
    segRow.style.display='block';
    segLabel.textContent = segTable.name + '  (PK: segmentId)';
  } else {
    segRow.style.display='none';
  }

  // Unassigned
  const allAssigned = new Set(Object.values(assignedMap).flatMap(seg=>Object.keys(seg)));
  const unassigned = stakElements.filter(e=>!allAssigned.has(e.id));
  unassignedCount.textContent = unassigned.length;

  if(!unassigned.length){
    unassignedList.innerHTML = '<div class="empty">'+( stakElements.length ? 'All elements assigned' : 'No stak elements detected yet')+'</div>';
  } else {
    unassignedList.innerHTML='';
    unassigned.forEach(el=>{
      const item = document.createElement('div');
      item.className='stak-item'+(selectedId===el.id?' selected':'');
      item.innerHTML =
        '<svg class="stak-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'+typeIcon(el.type)+'</svg>'+
        '<span class="stak-label">'+esc(el.name||el.id)+'</span>'+
        '<span class="stak-type">'+esc(el.type||'')+'</span>'+
        (segTable ? '<svg class="stak-action" title="Assign to '+esc(segTable.name)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>' : '');
      item.addEventListener('click',()=>{ selectedId=el.id; render(); });
      const action = item.querySelector('.stak-action');
      if(action && segTable){
        action.addEventListener('click', e=>{ e.stopPropagation(); assign(el, segTable); });
      }
      unassignedList.appendChild(item);
    });
  }

  // Assigned tree
  const totalAssigned = Object.values(assignedMap).reduce((s,seg)=>s+Object.keys(seg).length,0);
  assignedCount.textContent = totalAssigned;

  if(!totalAssigned){
    assignedTree.innerHTML='<div class="no-schema"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>No elements assigned yet</div>';
  } else {
    assignedTree.innerHTML='';
    Object.entries(assignedMap).forEach(([tblId, children])=>{
      const tbl = db ? (db.tables||[]).find(t=>t.id===tblId) : null;
      const parentName = tbl ? tbl.name : tblId;
      const parent = document.createElement('div');
      parent.className='tree-parent';
      parent.innerHTML=
        '<div class="tree-parent-lbl">'+
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>'+
          esc(parentName)+
        '</div>';
      const childWrap=document.createElement('div');
      childWrap.className='tree-children';
      Object.entries(children).forEach(([elId,el])=>{
        const child=document.createElement('div');
        child.className='tree-child';
        child.innerHTML=
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'+typeIcon(el.type)+'</svg>'+
          '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(el.name||elId)+'</span>'+
          '<span style="font-size:9px;color:#444;flex-shrink:0">'+esc(el.type||'')+'</span>'+
          '<svg class="tree-trash" title="Unassign" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14H5V6m3-2V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';
        child.querySelector('.tree-trash').addEventListener('click',()=>{
          delete assignedMap[tblId][elId];
          if(!Object.keys(assignedMap[tblId]).length) delete assignedMap[tblId];
          broadcastAssignment();
          render();
        });
        childWrap.appendChild(child);
      });
      parent.appendChild(childWrap);
      assignedTree.appendChild(parent);
    });
  }
}

function assign(el, segTable){
  if(!assignedMap[segTable.id]) assignedMap[segTable.id]={};
  assignedMap[segTable.id][el.id]={ name:el.name, type:el.type };
  selectedId=null;
  broadcastAssignment();
  render();
}

function broadcastAssignment(){
  if(vscodeApi) vscodeApi.postMessage({ command:'assignmentChanged', assignment:assignedMap });
}

// ── Messages from extension ───────────────────────────────
window.addEventListener('message', e=>{
  const msg = e.data;
  if(msg.command==='schema'){
    schema = msg.schema || { databases:[] };
    render();
  }
  if(msg.command==='stakElements'){
    stakElements = msg.elements || [];
    render();
  }
});

// ── Controls ──────────────────────────────────────────────
document.getElementById('btnRefresh').addEventListener('click',()=>{
  if(vscodeApi) vscodeApi.postMessage({ command:'requestSchema' });
});
schemaSelect.addEventListener('change', render);

// ── Boot: request schema ──────────────────────────────────
if(vscodeApi) vscodeApi.postMessage({ command:'requestSchema' });
render();
`;
    }
}
exports.DatabasePrefsViewProvider = DatabasePrefsViewProvider;
DatabasePrefsViewProvider.viewId = 'snapstak.databasePrefsView';
//# sourceMappingURL=databasePrefsViewProvider.js.map