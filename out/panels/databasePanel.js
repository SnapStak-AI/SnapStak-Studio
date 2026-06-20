"use strict";
// ============================================================
// databasePanel.ts  — SnapStak VS Code Extension
// Database tab: Unassigned + Assigned Stak Elements + Schema Tree
// All three sections collapsible. Schema built live from canvas.
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabasePanel = getDatabasePanel;
function getDatabasePanel() {
    return `
    <div class="tab-panel" id="panel-database">
    <style>
      #panel-database { flex-direction:column; overflow:hidden; background:var(--vscode-sideBar-background); }
      #panel-database.active { display:flex !important; height:100%; }

      .dp-panel { display:flex; flex-direction:column; height:100%; overflow-y:auto; overflow-x:hidden; scrollbar-width:thin; }
      .dp-section { display:flex; flex-direction:column; flex-shrink:0; }

      .dp-heading {
        font-size:10px; font-weight:700; color:var(--vscode-foreground);
        text-transform:uppercase; letter-spacing:0.7px; margin:0;
        padding:10px 10px 10px 12px;
        display:flex; align-items:center; gap:6px;
        cursor:pointer; user-select:none; flex-shrink:0; transition:background .12s;
      }
      .dp-heading:hover { background:rgba(255,255,255,0.04); }
      .dp-chevron { width:14px; height:14px; display:flex; align-items:center; justify-content:center; color:var(--vscode-descriptionForeground); transition:transform .2s; flex-shrink:0; }
      .dp-chevron.open { transform:rotate(90deg); }
      .dp-line { width:100%; height:1px; background:var(--vscode-widget-border,#2a2a2a); flex-shrink:0; }

      .dp-body { overflow:hidden; transition:max-height .2s ease; }
      .dp-body.collapsed { max-height:0 !important; }

      .dp-items { display:flex; flex-direction:column; gap:1px; padding:4px 6px; }
      .dp-item { display:flex; align-items:center; justify-content:space-between; font-size:11px; padding:5px 6px; border-radius:4px; cursor:pointer; border:1px solid transparent; transition:background .12s; user-select:none; }
      .dp-item:hover { background:rgba(255,255,255,0.06); }
      .dp-item-content { display:flex; align-items:center; gap:7px; flex:1; min-width:0; }
      .dp-item-icon { flex-shrink:0; color:var(--vscode-descriptionForeground); width:15px; height:15px; }
      .dp-item-label { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--vscode-foreground); }

      .dp-right-icon { flex-shrink:0; color:var(--vscode-descriptionForeground); opacity:0.45; cursor:pointer; padding:2px; border-radius:3px; transition:opacity .15s,color .15s; width:15px; height:15px; }
      .dp-right-icon:hover { opacity:1; color:#38BDF8; background:rgba(56,189,248,0.12); }

      .dp-parent-item { background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.06) !important; cursor:default; }
      .dp-parent-item .dp-item-label { font-weight:700; }
      .dp-parent-icon { color:#38BDF8; width:15px; height:15px; flex-shrink:0; }
      .dp-child-wrap { margin-left:12px; }

      .dp-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:16px 12px; gap:5px; opacity:0.4; text-align:center; }
      .dp-empty svg { width:20px; height:20px; }
      .dp-empty p { font-size:11px; margin:0; }

      /* ── Schema tree ── */
      .st-tree { padding:4px 0 8px; }
      .st-row { display:flex; align-items:center; padding:3px 6px; border-radius:3px; cursor:default; font-size:11px; color:var(--vscode-foreground); transition:background .1s; user-select:none; }
      .st-row:hover { background:rgba(255,255,255,0.05); }
      .st-guide { width:16px; flex-shrink:0; display:flex; justify-content:center; align-items:stretch; }
      .st-guide-line { width:1px; background:rgba(255,255,255,0.1); }
      .st-toggle { width:14px; height:18px; flex-shrink:0; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--vscode-descriptionForeground); border-radius:2px; transition:transform .15s,background .1s; }
      .st-toggle:hover { background:rgba(255,255,255,0.08); }
      .st-toggle.open { transform:rotate(90deg); }
      .st-toggle-ph { width:14px; flex-shrink:0; }
      .st-icon { width:15px; height:15px; flex-shrink:0; margin:0 4px; }
      .st-label { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .st-db    { color:#38BDF8; font-weight:700; }
      .st-tbl   { color:#e2e8f0; font-weight:600; }
      .st-col   { color:#94a3b8; }
      .st-type  { color:#475569; font-size:10px; margin-left:4px; }
      .st-key   { color:#cb8813; font-size:10px; }
      .st-en    { color:#67a270; }
      .st-ev    { color:#67a270; font-size:10px; }
      .st-badge { font-size:9px; font-weight:700; padding:1px 5px; border-radius:8px; margin-left:5px; flex-shrink:0; }
      .bpk { background:rgba(203,136,19,.2); color:#cb8813; border:1px solid rgba(203,136,19,.4); }
      .buq { background:rgba(167,139,250,.15); color:#a78bfa; border:1px solid rgba(167,139,250,.4); }
      .bfk { background:rgba(56,189,248,.2);  color:#38BDF8; border:1px solid rgba(56,189,248,.4); }
      .bix { background:rgba(249,115,22,.15);  color:#f97316; border:1px solid rgba(249,115,22,.4); }
      .ben { background:rgba(103,162,112,.2); color:#67a270; border:1px solid rgba(103,162,112,.4); }
      .st-empty { padding:14px; text-align:center; font-size:11px; opacity:0.4; }
    </style>

    <div class="dp-panel" id="dpPanel">

      <!-- Unassigned -->
      <div class="dp-section">
        <div class="dp-heading" data-target="dpUnassignedBody">
          <span class="dp-chevron open"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></span>
          Unassigned Stak Elements
        </div>
        <div class="dp-line"></div>
        <div class="dp-body" id="dpUnassignedBody" style="max-height:200px">
          <div id="dpUnassigned"><div class="dp-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg><p>No unassigned elements</p></div></div>
        </div>
      </div>

      <!-- Assigned -->
      <div class="dp-section">
        <div class="dp-line"></div>
        <div class="dp-heading" data-target="dpAssignedBody">
          <span class="dp-chevron open"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></span>
          Assigned Stak Elements
        </div>
        <div class="dp-line"></div>
        <div class="dp-body" id="dpAssignedBody" style="max-height:300px">
          <div id="dpAssigned"><div class="dp-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg><p>No assigned elements</p></div></div>
        </div>
      </div>

      <!-- Schema -->
      <div class="dp-section">
        <div class="dp-line"></div>
        <div class="dp-heading" data-target="dpSchemaBody">
          <span class="dp-chevron open"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></span>
          Schema
        </div>
        <div class="dp-line"></div>
        <div class="dp-body" id="dpSchemaBody" style="max-height:9999px">
          <div id="dpSchema"><div class="st-empty">No schema yet. Build on the canvas.</div></div>
        </div>
      </div>

    </div>

    <script>
    (function() {
      'use strict';
      let _init = false; if (_init) return; _init = true;

      const state = {
        stakItems   : [],
        processedIds: new Set(),
        hierarchy   : {},
        schema      : null,
        collapsed   : {}
      };

      const unassignedEl = document.getElementById('dpUnassigned');
      const assignedEl   = document.getElementById('dpAssigned');
      const schemaEl     = document.getElementById('dpSchema');

      const ICO = {
        db     : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
        table  : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>',
        col    : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>',
        key    : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7.5" cy="15.5" r="4.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L21 8l-3-3"/></svg>',
        enumB  : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
        enumV  : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/></svg>',
        chev   : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>',
        dataset: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
        trash  : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',
        defIco : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>'
      };

      const ELEM_LABELS = {
        picture:'Picture: ',img:'Image: ',svg:'SVG: ',video:'Video: ',
        span:'Text: ',p:'Text: ',h1:'Heading: ',h2:'Heading: ',h3:'Heading: ',
        h4:'Heading: ',h5:'Heading: ',h6:'Heading: ',
        ul:'List: ',ol:'Ordered List: ',dl:'Description List: ',select:'Dropdown: '
      };

      function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
      function emptyHtml(msg){ return '<div class="dp-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg><p>'+esc(msg)+'</p></div>'; }
      function elemIcon(type){ return ICO.defIco; }
      function elemLabel(type){ return ELEM_LABELS[type]||'Element: '; }

      // Collapsible section headings
      document.querySelectorAll('.dp-heading[data-target]').forEach(hdr => {
        hdr.addEventListener('click', () => {
          const body    = document.getElementById(hdr.dataset.target);
          const chevron = hdr.querySelector('.dp-chevron');
          if (!body) return;
          const isOpen = !body.classList.contains('collapsed');
          body.classList.toggle('collapsed', isOpen);
          chevron.classList.toggle('open', !isOpen);
        });
      });

      // ── Unassigned ──
      function renderUnassigned() {
        const items = state.stakItems.filter(it => !state.processedIds.has(it.id));
        if (!items.length) { unassignedEl.innerHTML = emptyHtml('No unassigned elements'); return; }
        let o = '<div class="dp-items">';
        items.forEach(it => {
          o += '<div class="dp-item"><div class="dp-item-content">';
          o += '<span class="dp-item-icon">'+elemIcon(it.elementType)+'</span>';
          o += '<span class="dp-item-label">'+esc(elemLabel(it.elementType)+it.label)+'</span>';
          o += '</div><span class="dp-right-icon dp-assign-btn" data-id="'+esc(it.id)+'">'+ICO.dataset+'</span></div>';
        });
        o += '</div>';
        unassignedEl.innerHTML = o;
        unassignedEl.querySelectorAll('.dp-assign-btn').forEach(btn =>
          btn.addEventListener('click', e => { e.stopPropagation(); assignItem(btn.dataset.id); })
        );
      }

      // ── Assigned ──
      function renderAssigned() {
        const parents = Object.keys(state.hierarchy).map(k => state.hierarchy[k]).filter(p => p.children.length);
        if (!parents.length) { assignedEl.innerHTML = emptyHtml('No assigned elements'); return; }
        let o = '<div class="dp-items">';
        parents.forEach(parent => {
          o += '<div class="dp-item dp-parent-item"><div class="dp-item-content">';
          o += '<span class="dp-parent-icon">'+ICO.table+'</span>';
          o += '<span class="dp-item-label">'+esc(parent.name)+'</span>';
          o += '</div></div>';
          parent.children.forEach(child => {
            o += '<div class="dp-child-wrap"><div class="dp-item"><div class="dp-item-content">';
            o += '<span class="dp-item-icon">'+elemIcon(child.elementType)+'</span>';
            o += '<span class="dp-item-label">'+esc(elemLabel(child.elementType)+child.label)+'</span>';
            o += '</div><span class="dp-right-icon dp-trash-btn" data-id="'+esc(child.id)+'">'+ICO.trash+'</span></div></div>';
          });
        });
        o += '</div>';
        assignedEl.innerHTML = o;
        assignedEl.querySelectorAll('.dp-trash-btn').forEach(btn =>
          btn.addEventListener('click', e => { e.stopPropagation(); unassignItem(btn.dataset.id); })
        );
      }

      // ── Schema tree ──
      function renderSchema() {
        const S = state.schema;
        if (!S || !S.dbs || !S.dbs.length) {
          schemaEl.innerHTML = '<div class="st-empty">No schema yet. Build on the canvas.</div>';
          return;
        }

        let o = '<div class="st-tree">';

        S.dbs.forEach(db => {
          const dbId   = 'nd_db_'+db.id;
          const dbOpen = state.collapsed[dbId] !== false;

          o += stRow(0, dbId, dbOpen, ICO.db, 'st-db', esc(db.name||'Database'), null, true);

          if (dbOpen) {
            (db.tables||[]).forEach(t => {
              const tId   = 'nd_tbl_'+t.id;
              const tOpen = state.collapsed[tId] !== false;
              const cols  = t.columns||[];
              const keys  = t.keys||[];

              o += stRow(1, tId, tOpen, ICO.table, 'st-tbl', esc(t.name||'table'), null, true);

              if (tOpen) {
                cols.forEach(col => {
                  const cId      = 'nd_col_'+col.id;
                  const cOpen    = state.collapsed[cId] !== false;
                  const colKeys  = keys.filter(k => (k.columns||[]).indexOf(col.name) > -1);
                  const linkedEn = col.type==='enum' ? (db.enums||[]).find(en => en.linkedColumn===col.id && en.saved) : null;
                  const hasKids  = colKeys.length>0 || !!linkedEn;
                  const colExtra = '<span class="st-type">'+esc(col.type)+'</span>';

                  o += stRow(2, cId, cOpen, ICO.col, 'st-col', esc(col.name)+colExtra, null, hasKids);

                  if (cOpen) {
                    // Keys under this column
                    colKeys.forEach(k => {
                      const bc = k.type==='primary'?'bpk':k.type==='unique'?'buq':k.type==='foreign'?'bfk':'bix';
                      const kCol = k.type==='primary'?'#cb8813':k.type==='unique'?'#a78bfa':k.type==='foreign'?'#38BDF8':'#f97316';
                      const kExtra = '<span class="st-badge '+bc+'">'+esc(k.type.toUpperCase())+'</span>';
                      o += stRow(3, null, false, ICO.key, 'st-key', esc(k.name||k.type)+kExtra, null, false, kCol);
                    });

                    // Enum block under this column
                    if (linkedEn) {
                      const enId   = 'nd_en_'+linkedEn.id;
                      const enOpen = state.collapsed[enId] !== false;
                      const vals   = linkedEn.values||[];
                      const enExtra = '<span class="st-badge ben">ENUM</span>';
                      o += stRow(3, enId, enOpen, ICO.enumB, 'st-en', esc(linkedEn.name||col.name)+enExtra, null, vals.length>0);

                      if (enOpen) {
                        vals.forEach(v => {
                          const def = v.isDefault ? ' <span style="color:#4ade80;margin-left:3px;font-size:11px">&#10003;</span>' : '';
                          o += stRow(4, null, false, ICO.enumV, 'st-ev', esc(v.value||v.name||'')+def, null, false);
                        });
                      }
                    }
                  }
                });
              }
            });
          }
        });

        o += '</div>';
        schemaEl.innerHTML = o;

        schemaEl.querySelectorAll('.st-toggle[data-node]').forEach(btn => {
          btn.addEventListener('click', e => {
            e.stopPropagation();
            const nid = btn.dataset.node;
            // If currently open (default), set collapsed; if collapsed, set open
            state.collapsed[nid] = (state.collapsed[nid] !== false) ? false : true;
            renderSchema();
          });
        });
      }

      function stRow(depth, nodeId, open, icon, labelClass, labelHtml, extra, hasChildren, iconColOverride) {
        let o = '<div class="st-row">';
        // Indent guides
        for (let i=0; i<depth; i++) o += '<div class="st-guide"><div class="st-guide-line"></div></div>';
        // Toggle
        if (hasChildren && nodeId) {
          o += '<span class="st-toggle '+(open?'open':'')+'" data-node="'+esc(nodeId)+'">'+ICO.chev+'</span>';
        } else {
          o += '<span class="st-toggle-ph"></span>';
        }
        // Icon colour: override takes priority, then depth default
        const depthCol = depth===0?'#38BDF8':depth===1?'#38BDF8':depth===2?'#64748b':depth===3?'#cb8813':'#67a270';
        const iconCol  = iconColOverride || depthCol;
        o += '<span class="st-icon" style="color:'+iconCol+'">'+icon+'</span>';
        o += '<span class="st-label '+labelClass+'">'+labelHtml+'</span>';
        o += '</div>';
        return o;
      }

      function render() { renderUnassigned(); renderAssigned(); renderSchema(); }

      function assignItem(itemId) {
        const tableIds = Object.keys(state.hierarchy);
        if (!tableIds.length) return;
        const item = state.stakItems.find(it => it.id===itemId);
        if (!item) return;
        state.processedIds.add(itemId);
        state.hierarchy[tableIds[0]].children.push(item);
        render();
      }

      function unassignItem(itemId) {
        state.processedIds.delete(itemId);
        Object.keys(state.hierarchy).forEach(k => {
          state.hierarchy[k].children = state.hierarchy[k].children.filter(c => c.id!==itemId);
        });
        render();
      }

      window.addEventListener('message', ev => {
        const msg = ev.data;
        if (!msg) return;
        if (msg.command==='setStakElements') {
          state.stakItems = msg.items||[];
          const cur = new Set(state.stakItems.map(it => it.id));
          state.processedIds.forEach(id => { if (!cur.has(id)) state.processedIds.delete(id); });
          Object.keys(state.hierarchy).forEach(k => {
            state.hierarchy[k].children = state.hierarchy[k].children.filter(c => cur.has(c.id));
          });
          render();
        } else if (msg.command==='setSegmentIdTable') {
          if (!state.hierarchy[msg.tableId]) {
            state.hierarchy[msg.tableId] = { name:msg.tableName, children:[] };
          } else {
            state.hierarchy[msg.tableId].name = msg.tableName;
          }
          render();
        } else if (msg.command==='setSchemaState') {
          state.schema = msg.state;
          renderSchema();
        } else if (msg.command==='exportDbSchema') {
          // Canvas triggered an Export DB for a specific database type
          // Surface it visually in the Schema section heading
          const schemaHdr = document.querySelector('#dpSchemaBody');
          if (schemaHdr) {
            const banner = document.createElement('div');
            banner.style.cssText = 'padding:8px 12px;font-size:11px;color:#4ade80;background:rgba(74,222,128,.08);border-bottom:1px solid rgba(74,222,128,.2);';
            banner.textContent = '⏳ Exporting schema for '+msg.dbType+'...';
            schemaHdr.insertBefore(banner, schemaHdr.firstChild);
            setTimeout(function(){ if(banner.parentNode) banner.parentNode.removeChild(banner); }, 4000);
          }
        }
      });

      render();
    })();
    </script>
    </div>
  `;
}
//# sourceMappingURL=databasePanel.js.map