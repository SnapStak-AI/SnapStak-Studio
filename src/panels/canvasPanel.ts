export function getCanvasPanel(): string {
    return /* html */`
    <div class="tab-panel" id="panel-canvas">

      <div class="cv-shell">

        <!-- ═══════════════════════════════════════════════
             LEFT: Vertical icon toolbar
        ════════════════════════════════════════════════ -->
        <div class="cv-toolbar" id="cvToolbar">

          <!-- SELECT tool -->
          <div class="cv-group">
            <button class="cv-tool" data-tool="select" title="Select / Layers">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" width="16" height="16">
                <path d="M3 2 L3 13 L6.5 10 L8.5 14.5 L10 13.8 L8 9.3 L12 9.3 Z" fill="currentColor" stroke="none"/>
              </svg>
            </button>
            <button class="cv-tool" data-tool="node" title="Node — edit points">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" width="16" height="16">
                <path d="M3 2 L3 13 L6.5 10 L8.5 14.5 L10 13.8 L8 9.3 L12 9.3 Z" fill="none" stroke="currentColor" stroke-width="1.3"/>
                <rect x="5.5" y="5.5" width="5" height="5" transform="rotate(45 8 8)" fill="currentColor" stroke="none"/>
              </svg>
            </button>
          </div>

          <div class="cv-sep"></div>

          <!-- GROUP 1: Shape tools -->
          <div class="cv-group">
            <button class="cv-tool active" data-tool="rect" title="Rectangle">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
                <rect x="2" y="3" width="12" height="10" rx="1"/>
              </svg>
            </button>
            <button class="cv-tool" data-tool="ellipse" title="Ellipse">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
                <ellipse cx="8" cy="8" rx="6" ry="5"/>
              </svg>
            </button>
            <button class="cv-tool" data-tool="polygon" title="Polygon">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
                <polygon points="8,2 14,6 14,11 8,14 2,11 2,6"/>
              </svg>
            </button>
            <button class="cv-tool" data-tool="line" title="Line">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
                <line x1="2" y1="14" x2="14" y2="2"/>
              </svg>
            </button>
          </div>

          <div class="cv-sep"></div>

          <!-- GROUP 2: Content tools -->
          <div class="cv-group">
            <button class="cv-tool" data-tool="text" title="Text">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 3h12v2H9v8H7V5H2V3z"/>
              </svg>
            </button>
            <button class="cv-tool" data-tool="image" title="Image">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
                <rect x="2" y="3" width="12" height="10" rx="1"/>
                <circle cx="5.5" cy="6.5" r="1.2"/>
                <polyline points="2,11 5,8 7.5,10.5 10,8 14,13"/>
              </svg>
            </button>
            <button class="cv-tool" data-tool="icon" title="Icon">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
                <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10 5 12l.5-3.5L3 6l3.5-.5z"/>
              </svg>
            </button>
          </div>

          <div class="cv-sep"></div>

          <!-- GROUP 3: Path tools -->
          <div class="cv-group">
            <button class="cv-tool" data-tool="pen" title="Pen">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
                <path d="M3 13L6 10L11 5L13 3L10 6L5 11Z"/>
                <line x1="13" y1="3" x2="11" y2="5"/>
                <circle cx="6" cy="10" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </button>
            <button class="cv-tool" data-tool="bezier" title="Bezier">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
                <path d="M2 13 C4 4, 12 4, 14 13"/>
                <circle cx="2"  cy="13" r="1.2" fill="currentColor" stroke="none"/>
                <circle cx="14" cy="13" r="1.2" fill="currentColor" stroke="none"/>
                <circle cx="4"  cy="4"  r="1"   stroke="currentColor" stroke-width="1" fill="none"/>
                <circle cx="12" cy="4"  r="1"   stroke="currentColor" stroke-width="1" fill="none"/>
              </svg>
            </button>
          </div>

        </div><!-- /cv-toolbar -->


        <!-- ═══════════════════════════════════════════════
             RIGHT: Tool options only
        ════════════════════════════════════════════════ -->
        <div class="cv-right">

          <!-- ── TOOL OPTIONS ── -->
          <div class="cv-options" id="cvOptions">

            <!-- ═══════════════════════════════════════════
                 RECT / ELLIPSE / POLYGON — shared Figma-style sections
            ════════════════════════════════════════════ -->

            <!-- SELECT / LAYERS -->
            <div class="cv-opts-panel" data-opts="select">
              <div class="cv-layers-panel">
                <div class="cv-layers-hdr">
                  <span class="cv-layers-title">Layers</span>
                </div>
                <div class="cv-layers-list" id="cvLayersList">
                  <div class="cv-layers-empty">No objects on canvas</div>
                </div>
              </div>
            </div>

            <!-- NODE -->
            <div class="cv-opts-panel" data-opts="node">
              <div class="cv-section-panel">
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Node Tool</span>
                  </div>
                  <div class="cv-section-row" style="padding:8px 0 4px;">
                    <span style="font-size:10px;color:#555;line-height:1.5;">Click a line or pen path to show its nodes. Drag any node to reposition it.</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- RECT -->
            <div class="cv-opts-panel active" data-opts="rect">
              <div class="cv-section-panel">

                <!-- ── FILL ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Fill</span>
                    <label class="cv-toggle-label">
                      <input type="checkbox" class="cv-toggle-cb cv-fill-toggle" checked>
                      <span class="cv-toggle-pill"></span>
                    </label>
                  </div>
                  <div class="cv-section-row">
                    <div class="cv-swatch-row">
                      <div class="cv-swatch-wrap">
                        <div class="cv-swatch filled cv-fill-swatch" id="rectFill" style="background:#ffffff;"></div>
                        <input type="color" class="cv-hidden-color" value="#ffffff" data-target="rectFill">
                      </div>
                      
                      <span class="cv-unit">%</span>
                      <input type="number" class="cv-opacity-input" value="100" min="0" max="100" title="Opacity %">
                    </div>
                    <div class="cv-alpha-row"><input type="range" class="cv-alpha-slider" min="0" max="100" value="100" title="Fill opacity"></div>
                  </div>
                </div>

                <!-- ── STROKE ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Stroke</span>
                    <label class="cv-toggle-label">
                      <input type="checkbox" class="cv-toggle-cb cv-stroke-toggle" checked>
                      <span class="cv-toggle-pill"></span>
                    </label>
                  </div>
                  <div class="cv-section-row">
                    <div class="cv-swatch-row">
                      <div class="cv-swatch-wrap">
                        <div class="cv-swatch none cv-stroke-swatch cv-stroke-on" id="rectStroke"></div>
                        <input type="color" class="cv-hidden-color" value="#000000" data-target="rectStroke">
                      </div>
                      <select class="cv-select cv-select-sm" title="Stroke weight">
                        <option>1 pt</option><option>2 pt</option><option>3 pt</option>
                        <option>4 pt</option><option>6 pt</option><option>8 pt</option>
                      </select>
                      <select class="cv-select cv-select-md" title="Stroke style">
                        <option value="solid">——</option>
                        <option value="dashed">- - -</option>
                        <option value="dotted">· · ·</option>
                      </select>
                    </div>
                    <div class="cv-alpha-row"><input type="range" class="cv-alpha-slider" min="0" max="100" value="100" title="Stroke opacity"></div>
                  </div>
                </div>

                <!-- ── GEOMETRY ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Geometry</span>
                  </div>
                  <div class="cv-section-row cv-row-geo">
                    <div class="cv-field"><span class="cv-field-lbl">W</span><input type="number" class="cv-input" id="rectW" placeholder="—" readonly></div>
                    <div class="cv-field"><span class="cv-field-lbl">H</span><input type="number" class="cv-input" id="rectH" placeholder="—" readonly></div>
                    <div class="cv-field"><span class="cv-field-lbl">R</span><input type="number" class="cv-input" value="0" min="0" max="999" title="Corner radius"></div>
                  </div>
                </div>

                <!-- ── GRADIENT ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Gradient</span>
                    <label class="cv-toggle-label">
                      <input type="checkbox" class="cv-toggle-cb" data-grad="rectGrad">
                      <span class="cv-toggle-pill"></span>
                    </label>
                  </div>
                  <div class="cv-grad-editor" id="rectGrad" style="display:none;">
                    <!-- Type icons -->
                    <div class="cv-grad-types">
                      <button class="cv-grad-type active" data-type="linear" title="Linear">
                        <svg viewBox="0 0 20 20" width="16" height="16"><defs><linearGradient id="lg1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#888"/></linearGradient></defs><rect width="20" height="20" fill="url(#lg1)"/></svg>
                      </button>
                      <button class="cv-grad-type" data-type="radial" title="Radial (Sphere)">
                        <svg viewBox="0 0 20 20" width="16" height="16"><defs><radialGradient id="rg1"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#888"/></radialGradient></defs><rect width="20" height="20" fill="url(#rg1)"/></svg>
                      </button>
                      <button class="cv-grad-type" data-type="diamond" title="Diamond">
                        <svg viewBox="0 0 20 20" width="16" height="16"><defs><radialGradient id="dg1" gradientTransform="scale(1,0.6)"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#888"/></radialGradient></defs><rect width="20" height="20" fill="url(#dg1)"/><polygon points="10,2 18,10 10,18 2,10" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/></svg>
                      </button>
                      <button class="cv-grad-type" data-type="square" title="Square">
                        <svg viewBox="0 0 20 20" width="16" height="16"><defs><radialGradient id="sg1" gradientTransform="scale(0.7,0.7) translate(2,2)"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#888"/></radialGradient></defs><rect width="20" height="20" fill="url(#sg1)"/><rect x="3" y="3" width="14" height="14" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/></svg>
                      </button>
                    </div>
                    <!-- Angle (linear only) -->
                    <div class="cv-grad-row cv-grad-angle-row">
                      <span class="cv-field-lbl">Angle</span>
                      <input type="number" class="cv-input cv-input-sm" value="90" min="0" max="360">
                      <span class="cv-unit">°</span>
                    </div>
                    <!-- Gradient track -->
                    <div class="cv-grad-track-wrap">
                      <div class="cv-grad-track" id="rectGradTrack">
                        <div class="cv-grad-stop" data-stop="0"  style="left:0%">  <div class="cv-stop-thumb" style="background:#ffffff;"></div></div>
                        <div class="cv-grad-stop" data-stop="1"  style="left:50%"> <div class="cv-stop-thumb" style="background:#9333ea;"></div></div>
                        <div class="cv-grad-stop" data-stop="2"  style="left:100%"><div class="cv-stop-thumb" style="background:#000000;"></div></div>
                      </div>
                    </div>
                    <!-- Stop editors -->
                    <div class="cv-stop-rows">
                      <div class="cv-stop-row">
                        <span class="cv-field-lbl">Start</span>
                        <div class="cv-swatch-wrap cv-stop-swatch">
                          <div class="cv-swatch filled" style="background:#ffffff;" data-stop-swatch="rectStop0"></div>
                          <input type="color" class="cv-hidden-color" value="#ffffff" data-stop-target="rectStop0">
                        </div>
                        <input type="number" class="cv-input cv-input-sm" value="0"  min="0" max="100" title="Position %">
                        <span class="cv-unit">%</span>
                        <input type="number" class="cv-input cv-input-sm" value="0"  min="0" max="100" title="Feather">
                        <span class="cv-unit-lbl">fth</span><input type="range" class="cv-alpha-slider cv-stop-alpha" min="0" max="100" value="100" title="Stop opacity">
                      </div>
                      <div class="cv-stop-row">
                        <span class="cv-field-lbl">Mid</span>
                        <div class="cv-swatch-wrap cv-stop-swatch">
                          <div class="cv-swatch filled" style="background:#9333ea;" data-stop-swatch="rectStop1"></div>
                          <input type="color" class="cv-hidden-color" value="#9333ea" data-stop-target="rectStop1">
                        </div>
                        <input type="number" class="cv-input cv-input-sm" value="50" min="0" max="100" title="Position %">
                        <span class="cv-unit">%</span>
                        <input type="number" class="cv-input cv-input-sm" value="0"  min="0" max="100" title="Feather">
                        <span class="cv-unit-lbl">fth</span><input type="range" class="cv-alpha-slider cv-stop-alpha" min="0" max="100" value="100" title="Stop opacity">
                      </div>
                      <div class="cv-stop-row">
                        <span class="cv-field-lbl">End</span>
                        <div class="cv-swatch-wrap cv-stop-swatch">
                          <div class="cv-swatch filled" style="background:#000000;" data-stop-swatch="rectStop2"></div>
                          <input type="color" class="cv-hidden-color" value="#000000" data-stop-target="rectStop2">
                        </div>
                        <input type="number" class="cv-input cv-input-sm" value="100" min="0" max="100" title="Position %">
                        <span class="cv-unit">%</span>
                        <input type="number" class="cv-input cv-input-sm" value="0"   min="0" max="100" title="Feather">
                        <span class="cv-unit-lbl">fth</span><input type="range" class="cv-alpha-slider cv-stop-alpha" min="0" max="100" value="100" title="Stop opacity">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ── IMAGE FILL ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Image Fill</span>
                  </div>
                  <div class="cv-section-row">
                    <button class="cv-img-btn" data-shape-fill="rect">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" width="13" height="13"><rect x="2" y="3" width="12" height="10" rx="1"/><circle cx="5.5" cy="6.5" r="1.2"/><polyline points="2,11 5,8 7.5,10.5 10,8 14,13"/></svg>
                      Choose Image
                    </button>
                  </div>
                </div>

                <!-- ── SHADOW ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Shadow</span>
                    <label class="cv-toggle-label">
                      <input type="checkbox" class="cv-toggle-cb">
                      <span class="cv-toggle-pill"></span>
                    </label>
                  </div>
                  <div class="cv-section-row cv-shadow-row">
                    <div class="cv-swatch-wrap">
                      <div class="cv-swatch none cv-shadow-swatch" id="rectShadowColor"></div>
                      <input type="color" class="cv-hidden-color" value="#000000" data-target="rectShadowColor">
                    </div>
                    <div class="cv-field cv-field-sm">
                      <span class="cv-field-lbl">Size</span>
                      <input type="number" class="cv-input" value="0" min="0" max="100">
                    </div>
                    <div class="cv-field cv-field-sm">
                      <span class="cv-field-lbl">Offset</span>
                      <input type="number" class="cv-input" value="2" min="-100" max="100">
                    </div>
                    <div class="cv-field cv-field-sm">
                      <span class="cv-field-lbl">Feather</span>
                      <input type="number" class="cv-input" value="4" min="0" max="100">
                    </div>
                    <div class="cv-field cv-field-grow"><input type="range" class="cv-alpha-slider cv-shadow-opacity" min="0" max="100" value="75" title="Shadow opacity"></div>
                  </div>
                </div>

              </div>
            </div>

            <!-- ELLIPSE -->
            <div class="cv-opts-panel" data-opts="ellipse">
              <div class="cv-section-panel">

                <div class="cv-section">
                  <div class="cv-section-hdr"><span class="cv-section-title">Fill</span><label class="cv-toggle-label"><input type="checkbox" class="cv-toggle-cb cv-fill-toggle" checked><span class="cv-toggle-pill"></span></label></div>
                  <div class="cv-section-row">
                    <div class="cv-swatch-row">
                      <div class="cv-swatch-wrap">
                        <div class="cv-swatch filled cv-fill-swatch" id="ellFill" style="background:#ffffff;"></div>
                        <input type="color" class="cv-hidden-color" value="#ffffff" data-target="ellFill">
                      </div>
                      
                      <span class="cv-unit">%</span>
                      <input type="number" class="cv-opacity-input" value="100" min="0" max="100">
                    <div class="cv-alpha-row"><input type="range" class="cv-alpha-slider" min="0" max="100" value="100" title="Fill opacity"></div>
                    </div>
                  </div>
                </div>

                <div class="cv-section">
                  <div class="cv-section-hdr"><span class="cv-section-title">Stroke</span><label class="cv-toggle-label"><input type="checkbox" class="cv-toggle-cb cv-stroke-toggle" checked><span class="cv-toggle-pill"></span></label></div>
                  <div class="cv-section-row">
                    <div class="cv-swatch-row">
                      <div class="cv-swatch-wrap">
                        <div class="cv-swatch none cv-stroke-swatch cv-stroke-on" id="ellStroke"></div>
                        <input type="color" class="cv-hidden-color" value="#000000" data-target="ellStroke">
                      </div>
                      <select class="cv-select cv-select-sm"><option>1 pt</option><option>2 pt</option><option>3 pt</option><option>4 pt</option><option>6 pt</option><option>8 pt</option></select>
                      <select class="cv-select cv-select-md"><option value="solid">——</option><option value="dashed">- - -</option><option value="dotted">· · ·</option></select>
                    </div>
                    <div class="cv-alpha-row"><input type="range" class="cv-alpha-slider" min="0" max="100" value="100" title="Stroke opacity"></div>
                  </div>
                </div>

                <div class="cv-section">
                  <div class="cv-section-hdr"><span class="cv-section-title">Geometry</span></div>
                  <div class="cv-section-row cv-row-geo">
                    <div class="cv-field"><span class="cv-field-lbl">W</span><input type="number" class="cv-input" id="ellW" placeholder="—" readonly></div>
                    <div class="cv-field"><span class="cv-field-lbl">H</span><input type="number" class="cv-input" id="ellH" placeholder="—" readonly></div>
                    <div style="flex:1;"></div>
                  </div>
                </div>

                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Gradient</span>
                    <label class="cv-toggle-label"><input type="checkbox" class="cv-toggle-cb" data-grad="ellGrad"><span class="cv-toggle-pill"></span></label>
                  </div>
                  <div class="cv-grad-editor" id="ellGrad" style="display:none;">
                    <div class="cv-grad-types">
                      <button class="cv-grad-type active" data-type="linear" title="Linear"><svg viewBox="0 0 20 20" width="16" height="16"><defs><linearGradient id="lg2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#888"/></linearGradient></defs><rect width="20" height="20" fill="url(#lg2)"/></svg></button>
                      <button class="cv-grad-type" data-type="radial" title="Radial"><svg viewBox="0 0 20 20" width="16" height="16"><defs><radialGradient id="rg2"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#888"/></radialGradient></defs><rect width="20" height="20" fill="url(#rg2)"/></svg></button>
                      <button class="cv-grad-type" data-type="diamond" title="Diamond"><svg viewBox="0 0 20 20" width="16" height="16"><defs><radialGradient id="dg2" gradientTransform="scale(1,0.6)"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#888"/></radialGradient></defs><rect width="20" height="20" fill="url(#dg2)"/><polygon points="10,2 18,10 10,18 2,10" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/></svg></button>
                      <button class="cv-grad-type" data-type="square" title="Square"><svg viewBox="0 0 20 20" width="16" height="16"><defs><radialGradient id="sg2" gradientTransform="scale(0.7,0.7) translate(2,2)"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#888"/></radialGradient></defs><rect width="20" height="20" fill="url(#sg2)"/><rect x="3" y="3" width="14" height="14" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/></svg></button>
                    </div>
                    <div class="cv-grad-row cv-grad-angle-row">
                      <span class="cv-field-lbl">Angle</span>
                      <input type="number" class="cv-input cv-input-sm" value="90" min="0" max="360">
                      <span class="cv-unit">°</span>
                    </div>
                    <div class="cv-grad-track-wrap">
                      <div class="cv-grad-track" id="ellGradTrack">
                        <div class="cv-grad-stop" data-stop="0"  style="left:0%">  <div class="cv-stop-thumb" style="background:#ffffff;"></div></div>
                        <div class="cv-grad-stop" data-stop="1"  style="left:50%"> <div class="cv-stop-thumb" style="background:#9333ea;"></div></div>
                        <div class="cv-grad-stop" data-stop="2"  style="left:100%"><div class="cv-stop-thumb" style="background:#000000;"></div></div>
                      </div>
                    </div>
                    <div class="cv-stop-rows">
                      <div class="cv-stop-row"><span class="cv-field-lbl">Start</span><div class="cv-swatch-wrap cv-stop-swatch"><div class="cv-swatch filled" style="background:#ffffff;" data-stop-swatch="ellStop0"></div><input type="color" class="cv-hidden-color" value="#ffffff" data-stop-target="ellStop0"></div><input type="number" class="cv-input cv-input-sm" value="0" min="0" max="100"><span class="cv-unit">%</span><input type="number" class="cv-input cv-input-sm" value="0" min="0" max="100"><span class="cv-unit-lbl">fth</span><input type="range" class="cv-alpha-slider cv-stop-alpha" min="0" max="100" value="100" title="Stop opacity"></div>
                      <div class="cv-stop-row"><span class="cv-field-lbl">Mid</span>  <div class="cv-swatch-wrap cv-stop-swatch"><div class="cv-swatch filled" style="background:#9333ea;" data-stop-swatch="ellStop1"></div><input type="color" class="cv-hidden-color" value="#9333ea" data-stop-target="ellStop1"></div><input type="number" class="cv-input cv-input-sm" value="50" min="0" max="100"><span class="cv-unit">%</span><input type="number" class="cv-input cv-input-sm" value="0" min="0" max="100"><span class="cv-unit-lbl">fth</span><input type="range" class="cv-alpha-slider cv-stop-alpha" min="0" max="100" value="100" title="Stop opacity"></div>
                      <div class="cv-stop-row"><span class="cv-field-lbl">End</span>  <div class="cv-swatch-wrap cv-stop-swatch"><div class="cv-swatch filled" style="background:#000000;" data-stop-swatch="ellStop2"></div><input type="color" class="cv-hidden-color" value="#000000" data-stop-target="ellStop2"></div><input type="number" class="cv-input cv-input-sm" value="100" min="0" max="100"><span class="cv-unit">%</span><input type="number" class="cv-input cv-input-sm" value="0" min="0" max="100"><span class="cv-unit-lbl">fth</span><input type="range" class="cv-alpha-slider cv-stop-alpha" min="0" max="100" value="100" title="Stop opacity"></div>
                    </div>
                  </div>
                </div>

                <div class="cv-section">
                  <div class="cv-section-hdr"><span class="cv-section-title">Image Fill</span></div>
                  <div class="cv-section-row"><button class="cv-img-btn" data-shape-fill="ellipse"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" width="13" height="13"><rect x="2" y="3" width="12" height="10" rx="1"/><circle cx="5.5" cy="6.5" r="1.2"/><polyline points="2,11 5,8 7.5,10.5 10,8 14,13"/></svg>Choose Image</button></div>
                </div>

                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Shadow</span>
                    <label class="cv-toggle-label"><input type="checkbox" class="cv-toggle-cb"><span class="cv-toggle-pill"></span></label>
                  </div>
                  <div class="cv-section-row cv-shadow-row">
                    <div class="cv-swatch-wrap"><div class="cv-swatch none cv-shadow-swatch" id="ellShadowColor"></div><input type="color" class="cv-hidden-color" value="#000000" data-target="ellShadowColor"></div>
                    <div class="cv-field cv-field-sm"><span class="cv-field-lbl">Size</span><input type="number" class="cv-input" value="0" min="0" max="100"></div>
                    <div class="cv-field cv-field-sm"><span class="cv-field-lbl">Offset</span><input type="number" class="cv-input" value="2" min="-100" max="100"></div>
                    <div class="cv-field cv-field-sm"><span class="cv-field-lbl">Feather</span><input type="number" class="cv-input" value="4" min="0" max="100"></div>
                    <div class="cv-field cv-field-grow"><input type="range" class="cv-alpha-slider cv-shadow-opacity" min="0" max="100" value="75" title="Shadow opacity"></div>
                  </div>
                </div>

              </div>
            </div>

            <!-- POLYGON -->
            <div class="cv-opts-panel" data-opts="polygon">
              <div class="cv-section-panel">

                <div class="cv-section">
                  <div class="cv-section-hdr"><span class="cv-section-title">Fill</span><label class="cv-toggle-label"><input type="checkbox" class="cv-toggle-cb cv-fill-toggle" checked><span class="cv-toggle-pill"></span></label></div>
                  <div class="cv-section-row">
                    <div class="cv-swatch-row">
                      <div class="cv-swatch-wrap">
                        <div class="cv-swatch filled cv-fill-swatch" id="polyFill" style="background:#ffffff;"></div>
                        <input type="color" class="cv-hidden-color" value="#ffffff" data-target="polyFill">
                      </div>
                      
                      <span class="cv-unit">%</span>
                      <input type="number" class="cv-opacity-input" value="100" min="0" max="100">
                    <div class="cv-alpha-row"><input type="range" class="cv-alpha-slider" min="0" max="100" value="100" title="Fill opacity"></div>
                    </div>
                  </div>
                </div>

                <div class="cv-section">
                  <div class="cv-section-hdr"><span class="cv-section-title">Stroke</span><label class="cv-toggle-label"><input type="checkbox" class="cv-toggle-cb cv-stroke-toggle" checked><span class="cv-toggle-pill"></span></label></div>
                  <div class="cv-section-row">
                    <div class="cv-swatch-row">
                      <div class="cv-swatch-wrap">
                        <div class="cv-swatch none cv-stroke-swatch cv-stroke-on" id="polyStroke"></div>
                        <input type="color" class="cv-hidden-color" value="#000000" data-target="polyStroke">
                      </div>
                      <select class="cv-select cv-select-sm"><option>1 pt</option><option>2 pt</option><option>3 pt</option><option>4 pt</option><option>6 pt</option><option>8 pt</option></select>
                      <select class="cv-select cv-select-md"><option value="solid">——</option><option value="dashed">- - -</option><option value="dotted">· · ·</option></select>
                    </div>
                    <div class="cv-alpha-row"><input type="range" class="cv-alpha-slider" min="0" max="100" value="100" title="Stroke opacity"></div>
                  </div>
                </div>

                <div class="cv-section">
                  <div class="cv-section-hdr"><span class="cv-section-title">Geometry</span></div>
                  <div class="cv-section-row cv-row-geo">
                    <div class="cv-field"><span class="cv-field-lbl">W</span><input type="number" class="cv-input" id="polyW" placeholder="—" readonly></div>
                    <div class="cv-field"><span class="cv-field-lbl">H</span><input type="number" class="cv-input" id="polyH" placeholder="—" readonly></div>
                    <div class="cv-field"><span class="cv-field-lbl">R</span><input type="number" class="cv-input" id="polyRadius" value="0" min="0"></div>
                    <div class="cv-field"><span class="cv-field-lbl">Sides</span><input type="number" class="cv-input" id="polySides" value="6" min="3" max="32"></div>
                  </div>
                </div>

                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Gradient</span>
                    <label class="cv-toggle-label"><input type="checkbox" class="cv-toggle-cb" data-grad="polyGrad"><span class="cv-toggle-pill"></span></label>
                  </div>
                  <div class="cv-grad-editor" id="polyGrad" style="display:none;">
                    <div class="cv-grad-types">
                      <button class="cv-grad-type active" data-type="linear" title="Linear"><svg viewBox="0 0 20 20" width="16" height="16"><defs><linearGradient id="lg3" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#888"/></linearGradient></defs><rect width="20" height="20" fill="url(#lg3)"/></svg></button>
                      <button class="cv-grad-type" data-type="radial" title="Radial"><svg viewBox="0 0 20 20" width="16" height="16"><defs><radialGradient id="rg3"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#888"/></radialGradient></defs><rect width="20" height="20" fill="url(#rg3)"/></svg></button>
                      <button class="cv-grad-type" data-type="diamond" title="Diamond"><svg viewBox="0 0 20 20" width="16" height="16"><defs><radialGradient id="dg3" gradientTransform="scale(1,0.6)"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#888"/></radialGradient></defs><rect width="20" height="20" fill="url(#dg3)"/><polygon points="10,2 18,10 10,18 2,10" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/></svg></button>
                      <button class="cv-grad-type" data-type="square" title="Square"><svg viewBox="0 0 20 20" width="16" height="16"><defs><radialGradient id="sg3" gradientTransform="scale(0.7,0.7) translate(2,2)"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#888"/></radialGradient></defs><rect width="20" height="20" fill="url(#sg3)"/><rect x="3" y="3" width="14" height="14" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/></svg></button>
                    </div>
                    <div class="cv-grad-row cv-grad-angle-row">
                      <span class="cv-field-lbl">Angle</span>
                      <input type="number" class="cv-input cv-input-sm" value="90" min="0" max="360">
                      <span class="cv-unit">°</span>
                    </div>
                    <div class="cv-grad-track-wrap">
                      <div class="cv-grad-track" id="polyGradTrack">
                        <div class="cv-grad-stop" data-stop="0"  style="left:0%">  <div class="cv-stop-thumb" style="background:#ffffff;"></div></div>
                        <div class="cv-grad-stop" data-stop="1"  style="left:50%"> <div class="cv-stop-thumb" style="background:#9333ea;"></div></div>
                        <div class="cv-grad-stop" data-stop="2"  style="left:100%"><div class="cv-stop-thumb" style="background:#000000;"></div></div>
                      </div>
                    </div>
                    <div class="cv-stop-rows">
                      <div class="cv-stop-row"><span class="cv-field-lbl">Start</span><div class="cv-swatch-wrap cv-stop-swatch"><div class="cv-swatch filled" style="background:#ffffff;" data-stop-swatch="polyStop0"></div><input type="color" class="cv-hidden-color" value="#ffffff" data-stop-target="polyStop0"></div><input type="number" class="cv-input cv-input-sm" value="0" min="0" max="100"><span class="cv-unit">%</span><input type="number" class="cv-input cv-input-sm" value="0" min="0" max="100"><span class="cv-unit-lbl">fth</span><input type="range" class="cv-alpha-slider cv-stop-alpha" min="0" max="100" value="100" title="Stop opacity"></div>
                      <div class="cv-stop-row"><span class="cv-field-lbl">Mid</span>  <div class="cv-swatch-wrap cv-stop-swatch"><div class="cv-swatch filled" style="background:#9333ea;" data-stop-swatch="polyStop1"></div><input type="color" class="cv-hidden-color" value="#9333ea" data-stop-target="polyStop1"></div><input type="number" class="cv-input cv-input-sm" value="50" min="0" max="100"><span class="cv-unit">%</span><input type="number" class="cv-input cv-input-sm" value="0" min="0" max="100"><span class="cv-unit-lbl">fth</span><input type="range" class="cv-alpha-slider cv-stop-alpha" min="0" max="100" value="100" title="Stop opacity"></div>
                      <div class="cv-stop-row"><span class="cv-field-lbl">End</span>  <div class="cv-swatch-wrap cv-stop-swatch"><div class="cv-swatch filled" style="background:#000000;" data-stop-swatch="polyStop2"></div><input type="color" class="cv-hidden-color" value="#000000" data-stop-target="polyStop2"></div><input type="number" class="cv-input cv-input-sm" value="100" min="0" max="100"><span class="cv-unit">%</span><input type="number" class="cv-input cv-input-sm" value="0" min="0" max="100"><span class="cv-unit-lbl">fth</span><input type="range" class="cv-alpha-slider cv-stop-alpha" min="0" max="100" value="100" title="Stop opacity"></div>
                    </div>
                  </div>
                </div>

                <div class="cv-section">
                  <div class="cv-section-hdr"><span class="cv-section-title">Image Fill</span></div>
                  <div class="cv-section-row"><button class="cv-img-btn" data-shape-fill="polygon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" width="13" height="13"><rect x="2" y="3" width="12" height="10" rx="1"/><circle cx="5.5" cy="6.5" r="1.2"/><polyline points="2,11 5,8 7.5,10.5 10,8 14,13"/></svg>Choose Image</button></div>
                </div>

                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Shadow</span>
                    <label class="cv-toggle-label"><input type="checkbox" class="cv-toggle-cb"><span class="cv-toggle-pill"></span></label>
                  </div>
                  <div class="cv-section-row cv-shadow-row">
                    <div class="cv-swatch-wrap"><div class="cv-swatch none cv-shadow-swatch" id="polyShadowColor"></div><input type="color" class="cv-hidden-color" value="#000000" data-target="polyShadowColor"></div>
                    <div class="cv-field cv-field-sm"><span class="cv-field-lbl">Size</span><input type="number" class="cv-input" value="0" min="0" max="100"></div>
                    <div class="cv-field cv-field-sm"><span class="cv-field-lbl">Offset</span><input type="number" class="cv-input" value="2" min="-100" max="100"></div>
                    <div class="cv-field cv-field-sm"><span class="cv-field-lbl">Feather</span><input type="number" class="cv-input" value="4" min="0" max="100"></div>
                    <div class="cv-field cv-field-grow"><input type="range" class="cv-alpha-slider cv-shadow-opacity" min="0" max="100" value="75" title="Shadow opacity"></div>
                  </div>
                </div>

              </div>
            </div>


            <!-- LINE -->
            <div class="cv-opts-panel" data-opts="line">
              <div class="cv-section-panel">

                <!-- ── STROKE ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Stroke</span>
                  </div>
                  <div class="cv-section-row">
                    <div class="cv-swatch-row">
                      <div class="cv-swatch-wrap">
                        <div class="cv-swatch filled" id="lineStroke" style="background:#000000;"></div>
                        <input type="color" class="cv-hidden-color" value="#000000" data-target="lineStroke">
                      </div>
                      <select class="cv-select cv-select-sm" id="lineWeight" title="Stroke weight">
                        <option value="1">1 pt</option><option value="2">2 pt</option><option value="3">3 pt</option>
                        <option value="4">4 pt</option><option value="6">6 pt</option><option value="8">8 pt</option>
                      </select>
                      <select class="cv-select cv-select-md" id="lineStyle" title="Stroke style">
                        <option value="solid">——</option>
                        <option value="dashed">- - -</option>
                        <option value="dotted">· · ·</option>
                      </select>
                    </div>
                    <div class="cv-alpha-row"><input type="range" class="cv-alpha-slider" id="lineOpacity" min="0" max="100" value="100" title="Stroke opacity"></div>
                  </div>
                </div>

                <!-- ── SHADOW ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Shadow</span>
                    <label class="cv-toggle-label">
                      <input type="checkbox" class="cv-toggle-cb cv-line-shadow-toggle">
                      <span class="cv-toggle-pill"></span>
                    </label>
                  </div>
                  <div class="cv-section-row cv-shadow-row">
                    <div class="cv-swatch-wrap">
                      <div class="cv-swatch none cv-shadow-swatch" id="lineShadowColor"></div>
                      <input type="color" class="cv-hidden-color" value="#000000" data-target="lineShadowColor">
                    </div>
                    <div class="cv-field cv-field-sm"><span class="cv-field-lbl">Size</span><input type="number" class="cv-input" value="0" min="0" max="100"></div>
                    <div class="cv-field cv-field-sm"><span class="cv-field-lbl">Offset</span><input type="number" class="cv-input" value="2" min="-100" max="100"></div>
                    <div class="cv-field cv-field-sm"><span class="cv-field-lbl">Feather</span><input type="number" class="cv-input" value="4" min="0" max="100"></div>
                    <div class="cv-field cv-field-grow"><input type="range" class="cv-alpha-slider cv-shadow-opacity" min="0" max="100" value="75" title="Shadow opacity"></div>
                  </div>
                </div>

              </div>
            </div>

            <!-- TEXT -->
            <div class="cv-opts-panel" data-opts="text">
              <div class="cv-section-panel">

                <!-- ── FONT ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Font</span>
                  </div>

                  <!-- Row 1: Family + Weight -->
                  <div class="cv-section-row" style="gap:5px;">
                    <select class="cv-select" id="txtFamily" style="flex:1;min-width:0;" title="Font family">
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Nunito">Nunito</option>
                      <option value="Raleway">Raleway</option>
                      <option value="Oswald">Oswald</option>
                      <option value="Source Sans Pro">Source Sans Pro</option>
                      <option value="Merriweather">Merriweather</option>
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="PT Serif">PT Serif</option>
                      <option value="Lora">Lora</option>
                      <option value="Ubuntu">Ubuntu</option>
                      <option value="Noto Sans">Noto Sans</option>
                      <option value="Fira Sans">Fira Sans</option>
                      <option value="DM Sans">DM Sans</option>
                      <option value="Space Grotesk">Space Grotesk</option>
                      <option value="JetBrains Mono">JetBrains Mono</option>
                    </select>
                    <select class="cv-select" id="txtWeight" style="width:72px;flex-shrink:0;" title="Font weight">
                      <option value="100">Thin</option>
                      <option value="200">Extra Light</option>
                      <option value="300">Light</option>
                      <option value="400" selected>Regular</option>
                      <option value="500">Medium</option>
                      <option value="600">Semi Bold</option>
                      <option value="700">Bold</option>
                      <option value="800">Extra Bold</option>
                      <option value="900">Black</option>
                    </select>
                  </div>

                  <!-- Row 2: Size + Unit + Antialias -->
                  <div class="cv-section-row" style="gap:5px;margin-top:5px;">
                    <div style="display:flex;align-items:center;gap:3px;flex-shrink:0;">
                      <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.3" style="opacity:0.5;flex-shrink:0;"><path d="M2 12 L7 2 L12 12"/><line x1="4" y1="8" x2="10" y2="8"/></svg>
                      <input type="number" class="cv-input" id="txtSize" value="16" min="6" max="400" style="width:40px;" title="Font size">
                      <select class="cv-select" id="txtUnit" style="width:38px;" title="Size unit">
                        <option value="px" selected>px</option>
                        <option value="pt">pt</option>
                        <option value="rem">rem</option>
                      </select>
                    </div>
                    <select class="cv-select" id="txtAntialias" style="flex:1;" title="Anti-aliasing">
                      <option value="auto">Auto</option>
                      <option value="antialiased" selected>Smooth</option>
                      <option value="subpixel-antialiased">Subpixel</option>
                      <option value="none">Sharp</option>
                    </select>
                  </div>

                  <!-- Row 3: Style toggles (I B U S) -->
                  <div class="cv-section-row" style="gap:4px;margin-top:5px;">
                    <button class="cv-style-btn" id="txtItalic"     title="Italic"        style="font-style:italic;">I</button>
                    <button class="cv-style-btn" id="txtUnderline"  title="Underline"     style="text-decoration:underline;">U</button>
                    <button class="cv-style-btn" id="txtStrikethrough" title="Strikethrough" style="text-decoration:line-through;">S</button>
                    <div style="flex:1;"></div>
                    <!-- Alignment -->
                    <button class="cv-align-btn active" id="txtAlignLeft"    data-align="left"    title="Align left">
                      <svg viewBox="0 0 14 12" width="13" height="11" fill="currentColor"><rect x="0" y="0" width="14" height="2" rx="1"/><rect x="0" y="4" width="10" height="2" rx="1"/><rect x="0" y="8" width="14" height="2" rx="1"/><rect x="0" y="12" width="8"  height="2" rx="1"/></svg>
                    </button>
                    <button class="cv-align-btn" id="txtAlignCenter" data-align="center" title="Align center">
                      <svg viewBox="0 0 14 12" width="13" height="11" fill="currentColor"><rect x="0" y="0" width="14" height="2" rx="1"/><rect x="2" y="4" width="10" height="2" rx="1"/><rect x="0" y="8" width="14" height="2" rx="1"/><rect x="3" y="12" width="8"  height="2" rx="1"/></svg>
                    </button>
                    <button class="cv-align-btn" id="txtAlignRight"  data-align="right"  title="Align right">
                      <svg viewBox="0 0 14 12" width="13" height="11" fill="currentColor"><rect x="0" y="0" width="14" height="2" rx="1"/><rect x="4" y="4" width="10" height="2" rx="1"/><rect x="0" y="8" width="14" height="2" rx="1"/><rect x="6" y="12" width="8"  height="2" rx="1"/></svg>
                    </button>
                    <button class="cv-align-btn" id="txtAlignJustify" data-align="justify" title="Justify">
                      <svg viewBox="0 0 14 12" width="13" height="11" fill="currentColor"><rect x="0" y="0" width="14" height="2" rx="1"/><rect x="0" y="4" width="14" height="2" rx="1"/><rect x="0" y="8" width="14" height="2" rx="1"/><rect x="0" y="12" width="14" height="2" rx="1"/></svg>
                    </button>
                  </div>

                  <!-- Row 4: Line height + Letter spacing -->
                  <div class="cv-section-row" style="gap:5px;margin-top:5px;">
                    <div style="display:flex;align-items:center;gap:3px;flex:1;">
                      <svg viewBox="0 0 12 14" width="11" height="13" fill="none" stroke="currentColor" stroke-width="1.2" style="opacity:0.5;flex-shrink:0;"><line x1="6" y1="1" x2="6" y2="13"/><polyline points="3,3.5 6,1 9,3.5"/><polyline points="3,10.5 6,13 9,10.5"/></svg>
                      <input type="number" class="cv-input" id="txtLineHeight" value="1.4" min="0.5" max="5" step="0.1" style="width:46px;" title="Line height">
                      <span class="cv-unit">lh</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:3px;flex:1;">
                      <svg viewBox="0 0 14 10" width="13" height="9" fill="none" stroke="currentColor" stroke-width="1.2" style="opacity:0.5;flex-shrink:0;"><line x1="1" y1="1" x2="1" y2="9"/><line x1="13" y1="1" x2="13" y2="9"/><line x1="3" y1="5" x2="11" y2="5"/><polyline points="5,3 3,5 5,7"/><polyline points="9,3 11,5 9,7"/></svg>
                      <input type="number" class="cv-input" id="txtLetterSpacing" value="0" min="-20" max="100" step="0.5" style="width:46px;" title="Letter spacing">
                      <span class="cv-unit">px</span>
                    </div>
                  </div>
                </div>

                <!-- ── COLOR ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Color</span>
                  </div>
                  <div class="cv-section-row">
                    <div class="cv-swatch-wrap">
                      <div class="cv-swatch filled" id="txtColor" style="background:#000000;"></div>
                      <input type="color" class="cv-hidden-color" value="#000000" data-target="txtColor">
                    </div>
                    <div style="flex:1;">
                      <input type="range" class="cv-alpha-slider" id="txtColorOpacity" min="0" max="100" value="100" title="Color opacity">
                    </div>
                  </div>
                </div>

                <!-- ── SHADOW ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Shadow</span>
                    <label class="cv-toggle-label">
                      <input type="checkbox" class="cv-toggle-cb cv-txt-shadow-toggle">
                      <span class="cv-toggle-pill"></span>
                    </label>
                  </div>
                  <div class="cv-section-row cv-shadow-row">
                    <div class="cv-swatch-wrap">
                      <div class="cv-swatch none cv-shadow-swatch" id="txtShadowColor"></div>
                      <input type="color" class="cv-hidden-color" value="#000000" data-target="txtShadowColor">
                    </div>
                    <div class="cv-field cv-field-sm"><span class="cv-field-lbl">Size</span><input type="number" class="cv-input" value="0" min="0" max="100"></div>
                    <div class="cv-field cv-field-sm"><span class="cv-field-lbl">Offset</span><input type="number" class="cv-input" value="2" min="-100" max="100"></div>
                    <div class="cv-field cv-field-sm"><span class="cv-field-lbl">Feather</span><input type="number" class="cv-input" value="4" min="0" max="100"></div>
                    <div class="cv-field cv-field-grow"><input type="range" class="cv-alpha-slider cv-shadow-opacity" min="0" max="100" value="75" title="Shadow opacity"></div>
                  </div>
                </div>

              </div>
            </div>

            <!-- IMAGE -->
            <div class="cv-opts-panel" data-opts="image">
              <div class="cv-section-panel">

                <!-- ── AI TOOLS ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">AI Tools</span>
                  </div>
                  <div class="cv-section-row cv-img-ai-grid">
                    <button class="cv-img-ai-btn" data-ai="generate" title="Generate image from text prompt">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" width="13" height="13">
                        <path d="M8 2v4M8 10v4M2 8h4M10 8h4M4.5 4.5l2.8 2.8M8.7 8.7l2.8 2.8M4.5 11.5l2.8-2.8M8.7 7.3l2.8-2.8"/>
                      </svg>
                      Generate
                    </button>
                    <button class="cv-img-ai-btn" data-ai="inpaint" title="Edit a specific region of the image">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" width="13" height="13">
                        <rect x="2" y="2" width="12" height="12" rx="1"/>
                        <path d="M5 9 Q8 5 11 9" stroke-dasharray="2 1.5"/>
                        <circle cx="8" cy="9" r="1.5" fill="currentColor" stroke="none"/>
                      </svg>
                      Inpainting
                    </button>
                    <button class="cv-img-ai-btn" data-ai="remove-bg" title="Remove image background">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" width="13" height="13">
                        <rect x="2" y="2" width="12" height="12" rx="1" stroke-dasharray="3 2"/>
                        <circle cx="8" cy="8" r="3" fill="currentColor" stroke="none"/>
                      </svg>
                      Remove BG
                    </button>
                    <button class="cv-img-ai-btn" data-ai="remove-obj" title="Remove an object from the image">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" width="13" height="13">
                        <rect x="2" y="2" width="12" height="12" rx="1"/>
                        <line x1="5" y1="5" x2="11" y2="11"/>
                        <line x1="11" y1="5" x2="5" y2="11"/>
                      </svg>
                      Remove Obj
                    </button>
                    <button class="cv-img-ai-btn" data-ai="outpaint" title="Extend image beyond its borders">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" width="13" height="13">
                        <rect x="4" y="4" width="8" height="8" rx="1"/>
                        <path d="M2 4V2h2M14 2h2v2M2 12v2h2M14 14h2v-2"/>
                      </svg>
                      Outpaint
                    </button>
                    <button class="cv-img-ai-btn" data-ai="upscale" title="Increase image resolution">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" width="13" height="13">
                        <rect x="2" y="6" width="8" height="8" rx="1"/>
                        <path d="M10 2h4v4"/>
                        <path d="M14 2L9 7"/>
                      </svg>
                      Upscale
                    </button>
                    <button class="cv-img-ai-btn" data-ai="style" title="Apply style from a reference image">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" width="13" height="13">
                        <circle cx="5" cy="8" r="3"/>
                        <path d="M8 8h5M10 5.5l3 2.5-3 2.5"/>
                        <circle cx="13" cy="8" r="1.5" fill="currentColor" stroke="none"/>
                      </svg>
                      Style
                    </button>
                  </div>
                </div>

                <!-- ── SOURCE ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Source</span>
                  </div>
                  <div class="cv-section-row">
                    <button class="cv-img-btn" id="imgImportBtn">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" width="13" height="13">
                        <rect x="2" y="3" width="12" height="10" rx="1"/>
                        <circle cx="5.5" cy="6.5" r="1.2"/>
                        <polyline points="2,11 5,8 7.5,10.5 10,8 14,13"/>
                      </svg>
                      Import Image
                    </button>
                  </div>
                  <div class="cv-section-row" id="imgFileNameRow" style="display:none;margin-top:4px;">
                    <span class="cv-img-filename" id="imgFileName">—</span>
                  </div>
                </div>

                <!-- ── GEOMETRY ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Geometry</span>
                  </div>
                  <div class="cv-section-row cv-row-geo">
                    <div class="cv-field">
                      <span class="cv-field-lbl">W</span>
                      <input type="number" class="cv-input" id="imgW" placeholder="—" min="1">
                    </div>
                    <div class="cv-field">
                      <span class="cv-field-lbl">H</span>
                      <input type="number" class="cv-input" id="imgH" placeholder="—" min="1">
                    </div>
                    <div class="cv-field">
                      <span class="cv-field-lbl">R</span>
                      <input type="number" class="cv-input" id="imgR" placeholder="0" min="0" max="999" value="0">
                    </div>
                  </div>
                </div>

                <!-- ── SHADOW ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Shadow</span>
                    <label class="cv-toggle-label">
                      <input type="checkbox" class="cv-toggle-cb cv-img-shadow-toggle">
                      <span class="cv-toggle-pill"></span>
                    </label>
                  </div>
                  <div class="cv-section-row cv-shadow-row">
                    <div class="cv-swatch-wrap">
                      <div class="cv-swatch none cv-shadow-swatch" id="imgShadowColor"></div>
                      <input type="color" class="cv-hidden-color" value="#000000" data-target="imgShadowColor">
                    </div>
                    <div class="cv-field cv-field-sm">
                      <span class="cv-field-lbl">Size</span>
                      <input type="number" class="cv-input" value="0" min="0" max="100">
                    </div>
                    <div class="cv-field cv-field-sm">
                      <span class="cv-field-lbl">Offset</span>
                      <input type="number" class="cv-input cv-shadow-offset" value="2" min="-100" max="100">
                    </div>
                    <div class="cv-field cv-field-sm">
                      <span class="cv-field-lbl">Feather</span>
                      <input type="number" class="cv-input cv-shadow-feather" value="4" min="0" max="100">
                    </div>
                    <div class="cv-field cv-field-grow">
                      <input type="range" class="cv-alpha-slider cv-shadow-opacity" min="0" max="100" value="75" title="Shadow opacity">
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- ICON -->
            <div class="cv-opts-panel" data-opts="icon">
              <div class="cv-section-panel">

                <!-- ── ICON BROWSER ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Icon</span>
                  </div>
                  <div class="cv-section-row" style="flex-direction:column;gap:5px;">
                    <select id="iconCategory" class="cv-select" style="width:100%;">
                      <option value="">Loading categories...</option>
                    </select>
                    <input id="iconSearch" type="text" class="cv-input" placeholder="Search icons..." style="width:100%;text-align:left;">
                    <div id="iconLoading" style="font-size:10px;color:#666;padding:4px 0;text-align:center;display:none;">Loading icons...</div>
                    <div id="iconGrid" style="display:grid;grid-template-columns:repeat(9,1fr);gap:4px;max-height:176px;overflow-y:auto;padding:2px 0;"></div>
                    <div style="font-size:9px;color:#555;text-align:center;">Click icon then click canvas to place</div>
                  </div>
                </div>

                <!-- ── FILL ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Fill</span>
                    <label class="cv-toggle-label">
                      <input type="checkbox" class="cv-toggle-cb cv-icon-fill-toggle" checked>
                      <span class="cv-toggle-pill"></span>
                    </label>
                  </div>
                  <div class="cv-section-row">
                    <div class="cv-swatch-row">
                      <div class="cv-swatch-wrap">
                        <div class="cv-swatch filled" id="iconColor" style="background:#000000;"></div>
                        <input type="color" class="cv-hidden-color" value="#000000" data-target="iconColor">
                      </div>
                      <span class="cv-unit">%</span>
                      <input type="number" id="iconColorOpacity" class="cv-opacity-input" value="100" min="0" max="100" title="Opacity %">
                    </div>
                    <div class="cv-alpha-row"><input type="range" class="cv-alpha-slider" min="0" max="100" value="100" title="Color opacity"></div>
                  </div>
                </div>

                <!-- ── SIZE ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Size</span>
                  </div>
                  <div class="cv-section-row cv-row-geo">
                    <div class="cv-field">
                      <span class="cv-field-lbl">W</span>
                      <input type="number" id="iconW" class="cv-input" value="48" min="8" max="2000">
                    </div>
                    <div style="flex:0 0 auto;display:flex;align-self:flex-end;">
                      <button id="iconAspectLock" class="cv-style-btn active" title="Lock aspect" style="color:#ffffff;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></button>
                    </div>
                    <div class="cv-field">
                      <span class="cv-field-lbl">H</span>
                      <input type="number" id="iconH" class="cv-input" value="48" min="8" max="2000">
                    </div>
                  </div>
                </div>

                <!-- ── STROKE ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Stroke</span>
                    <label class="cv-toggle-label">
                      <input type="checkbox" class="cv-toggle-cb cv-icon-stroke-toggle">
                      <span class="cv-toggle-pill"></span>
                    </label>
                  </div>
                  <div class="cv-section-row">
                    <div class="cv-swatch-row">
                      <div class="cv-swatch-wrap">
                        <div class="cv-swatch filled" id="iconStrokeColor" style="background:#000000;"></div>
                        <input type="color" class="cv-hidden-color" value="#000000" data-target="iconStrokeColor">
                      </div>
                      <select class="cv-select cv-select-sm" id="iconStrokeWeight" title="Stroke weight">
                        <option value="1">1 pt</option><option value="2">2 pt</option><option value="3">3 pt</option>
                        <option value="4">4 pt</option><option value="6">6 pt</option><option value="8">8 pt</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- ── SHADOW ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Shadow</span>
                    <label class="cv-toggle-label">
                      <input type="checkbox" class="cv-toggle-cb cv-icon-shadow-toggle">
                      <span class="cv-toggle-pill"></span>
                    </label>
                  </div>
                  <div class="cv-section-row cv-shadow-row">
                    <div class="cv-swatch-wrap">
                      <div class="cv-swatch none cv-shadow-swatch" id="iconShadowColor"></div>
                      <input type="color" class="cv-hidden-color" value="#000000" data-target="iconShadowColor">
                    </div>
                    <div class="cv-field cv-field-sm"><span class="cv-field-lbl">Offset</span><input type="number" class="cv-input cv-shadow-offset" value="2" min="0" max="50"></div>
                    <div class="cv-field cv-field-sm"><span class="cv-field-lbl">Feather</span><input type="number" class="cv-input cv-shadow-feather" value="4" min="0" max="50"></div>
                    <div class="cv-field cv-field-grow"><input type="range" class="cv-alpha-slider cv-shadow-opacity" min="0" max="100" value="75" title="Shadow opacity"></div>
                  </div>
                </div>

              </div>
            </div>

            <!-- PEN -->
            <div class="cv-opts-panel" data-opts="pen">
              <div class="cv-section-panel">

                <!-- ── STROKE ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Stroke</span>
                  </div>
                  <div class="cv-section-row">
                    <div class="cv-swatch-row">
                      <div class="cv-swatch-wrap">
                        <div class="cv-swatch filled" id="penStroke" style="background:#000000;"></div>
                        <input type="color" class="cv-hidden-color" value="#000000" data-target="penStroke">
                      </div>
                      <select class="cv-select cv-select-sm" id="penWeight" title="Stroke weight">
                        <option value="1">1 pt</option><option value="2">2 pt</option><option value="3">3 pt</option>
                        <option value="4">4 pt</option><option value="6">6 pt</option><option value="8">8 pt</option>
                      </select>
                      <select class="cv-select cv-select-md" id="penStyle" title="Stroke style">
                        <option value="solid">——</option>
                        <option value="dashed">- - -</option>
                        <option value="dotted">· · ·</option>
                      </select>
                    </div>
                    <div class="cv-alpha-row"><input type="range" class="cv-alpha-slider" id="penOpacity" min="0" max="100" value="100" title="Stroke opacity"></div>
                  </div>
                </div>

                <!-- ── SHADOW ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Shadow</span>
                    <label class="cv-toggle-label">
                      <input type="checkbox" class="cv-toggle-cb cv-pen-shadow-toggle">
                      <span class="cv-toggle-pill"></span>
                    </label>
                  </div>
                  <div class="cv-section-row cv-shadow-row">
                    <div class="cv-swatch-wrap">
                      <div class="cv-swatch none cv-shadow-swatch" id="penShadowColor"></div>
                      <input type="color" class="cv-hidden-color" value="#000000" data-target="penShadowColor">
                    </div>
                    <div class="cv-field cv-field-sm"><span class="cv-field-lbl">Size</span><input type="number" class="cv-input" value="0" min="0" max="100"></div>
                    <div class="cv-field cv-field-sm"><span class="cv-field-lbl">Offset</span><input type="number" class="cv-input" value="2" min="-100" max="100"></div>
                    <div class="cv-field cv-field-sm"><span class="cv-field-lbl">Feather</span><input type="number" class="cv-input" value="4" min="0" max="100"></div>
                    <div class="cv-field cv-field-grow"><input type="range" class="cv-alpha-slider cv-shadow-opacity" min="0" max="100" value="75" title="Shadow opacity"></div>
                  </div>
                </div>

              </div>
            </div>

            <!-- BEZIER -->
            <div class="cv-opts-panel" data-opts="bezier">
              <div class="cv-section-panel">

                <!-- ── STROKE ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Stroke</span>
                  </div>
                  <div class="cv-section-row">
                    <div class="cv-swatch-row">
                      <div class="cv-swatch-wrap">
                        <div class="cv-swatch filled" id="bezStroke" style="background:#000000;"></div>
                        <input type="color" class="cv-hidden-color" value="#000000" data-target="bezStroke">
                      </div>
                      <select class="cv-select cv-select-sm" id="bezWeight" title="Stroke weight">
                        <option value="1">1 pt</option><option value="2" selected>2 pt</option><option value="3">3 pt</option>
                        <option value="4">4 pt</option><option value="6">6 pt</option><option value="8">8 pt</option>
                      </select>
                      <select class="cv-select cv-select-md" id="bezStyle" title="Stroke style">
                        <option value="solid">——</option>
                        <option value="dashed">- - -</option>
                        <option value="dotted">· · ·</option>
                      </select>
                    </div>
                    <div class="cv-alpha-row"><input type="range" class="cv-alpha-slider" id="bezOpacity" min="0" max="100" value="100" title="Stroke opacity"></div>
                  </div>
                </div>

                <!-- ── SHADOW ── -->
                <div class="cv-section">
                  <div class="cv-section-hdr">
                    <span class="cv-section-title">Shadow</span>
                    <label class="cv-toggle-label">
                      <input type="checkbox" class="cv-toggle-cb cv-bez-shadow-toggle">
                      <span class="cv-toggle-pill"></span>
                    </label>
                  </div>
                  <div class="cv-section-row cv-shadow-row">
                    <div class="cv-swatch-wrap">
                      <div class="cv-swatch none cv-shadow-swatch" id="bezShadowColor"></div>
                      <input type="color" class="cv-hidden-color" value="#000000" data-target="bezShadowColor">
                    </div>
                    <div class="cv-field cv-field-sm"><span class="cv-field-lbl">Size</span><input type="number" class="cv-input" value="0" min="0" max="100"></div>
                    <div class="cv-field cv-field-sm"><span class="cv-field-lbl">Offset</span><input type="number" class="cv-input" value="2" min="-100" max="100"></div>
                    <div class="cv-field cv-field-sm"><span class="cv-field-lbl">Feather</span><input type="number" class="cv-input" value="4" min="0" max="100"></div>
                    <div class="cv-field cv-field-grow"><input type="range" class="cv-alpha-slider cv-shadow-opacity" min="0" max="100" value="75" title="Shadow opacity"></div>
                  </div>
                </div>

              </div>
            </div>

          </div><!-- /cv-options -->

        </div><!-- /cv-right -->

      </div><!-- /cv-shell -->

      <!-- AI thinking + response -->
      <div class="thinking" id="thinking-canvas">
        <div class="thinking-dots"><span></span><span></span><span></span></div>
        SnapStak is thinking...
      </div>
      <div class="response-area" id="response-canvas"></div>

    </div><!-- /panel-canvas -->

    <style>
      /* ════════════════════════════════
         PANEL SHELL
      ════════════════════════════════ */
      #panel-canvas {
        display: none;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        --cv-border: var(--vscode-widget-border, #3a3a3a);
        --cv-blue: #38BDF8;
      }
      #panel-canvas.active { display: flex; }

      .cv-shell {
        display: flex;
        flex: 1;
        height: 100%;
        min-height: 0;
        overflow: hidden;
        align-items: stretch;
      }

      /* ════════════════════════════════
         LEFT TOOLBAR
      ════════════════════════════════ */
      .cv-toolbar {
        width: 36px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 6px 0;
        background: var(--vscode-sideBar-background);
        overflow-y: auto;
        scrollbar-width: none;
        align-self: stretch;
      }
      .cv-toolbar::-webkit-scrollbar { display: none; }

      .cv-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1px;
        width: 100%;
      }

      .cv-sep {
        width: 20px;
        height: 1px;
        background: var(--cv-border);
        margin: 5px 0;
        flex-shrink: 0;
      }

      .cv-tool {
        width: 32px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        border-radius: 4px;
        color: var(--vscode-foreground);
        opacity: 0.45;
        cursor: pointer;
        transition: opacity 0.12s, background 0.12s, color 0.12s;
        padding: 0;
        flex-shrink: 0;
      }
      .cv-tool svg { width: 14px; height: 14px; pointer-events: none; }
      .cv-tool:hover { opacity: 1; background: var(--vscode-toolbar-hoverBackground, rgba(255,255,255,0.07)); }
      .cv-tool.active { opacity: 1; color: var(--cv-blue); background: rgba(56,189,248,0.12); }

      /* ════════════════════════════════
         RIGHT COLUMN
      ════════════════════════════════ */
      .cv-right {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
        border-left: 1px solid var(--cv-border);
      }

      /* ════════════════════════════════
         TOOL OPTIONS — fills right column
      ════════════════════════════════ */
      .cv-options {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 8px 10px;
        scrollbar-width: thin;
        background: var(--vscode-sideBar-background);
      }

      .cv-opts-panel         { display: none; }
      .cv-opts-panel.active  { display: block; }

      /* ── Layers panel ── */
      .cv-layers-panel   { display: flex; flex-direction: column; height: 100%; }
      .cv-layers-hdr     { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px 6px; border-bottom: 1px solid var(--cv-border); }
      .cv-layers-title   { font-size: 10px; font-weight: 700; color: var(--cv-label); text-transform: uppercase; letter-spacing: .06em; }
      .cv-layers-list    { flex: 1; overflow-y: auto; padding: 4px 0; }
      .cv-layers-empty   { font-size: 11px; color: #555; text-align: center; padding: 24px 12px; }
      .cv-layer-row      { display: flex; align-items: center; gap: 6px; padding: 5px 10px; cursor: pointer; user-select: none; border-radius: 4px; margin: 1px 4px; position: relative; }
      .cv-layer-row:hover { background: #2a2a2a; }
      .cv-layer-row.selected { background: rgba(56,189,248,0.12); }
      .cv-layer-name-input { flex: 1; font-size: 11px; color: #eee; background: #1a1a2e; border: 1px solid #38BDF8; border-radius: 3px; padding: 1px 4px; outline: none; min-width: 0; user-select: text !important; -webkit-user-select: text !important; }
      .cv-layer-drag     { cursor: grab; color: #555; flex-shrink: 0; display: flex; align-items: center; }
      .cv-layer-drag:active { cursor: grabbing; }
      .cv-layer-icon     { flex-shrink: 0; color: #777; display: flex; align-items: center; }
      .cv-layer-name     { flex: 1; font-size: 11px; color: #ccc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .cv-layer-del      { flex-shrink: 0; background: none; border: none; color: #555; cursor: pointer; padding: 2px 4px; border-radius: 3px; font-size: 13px; line-height: 1; opacity: 0; transition: opacity .15s, color .15s; }
      .cv-layer-row:hover .cv-layer-del { opacity: 1; }
      .cv-layer-del:hover { color: #e05; }
      .cv-layer-row.dragging { opacity: 0.4; }
      .cv-layer-drop-indicator { height: 2px; background: #38BDF8; border-radius: 1px; margin: 0 4px; display: none; }

      .cv-opts-label {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        color: var(--cv-blue);
        margin-bottom: 8px;
        padding-bottom: 4px;
        border-bottom: 1px solid var(--cv-border);
      }

      .cv-opts-row {
        display: flex;
        gap: 8px;
        margin-bottom: 6px;
      }

      .cv-opt-group {
        display: flex;
        flex-direction: column;
        gap: 3px;
        flex: 1;
        min-width: 0;
      }
      .cv-opt-group.full { flex: 1 1 100%; }

      .cv-opt-label {
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        color: var(--vscode-descriptionForeground);
        opacity: 0.65;
        white-space: nowrap;
      }

      .cv-opt-ph {
        height: 20px;
        background: var(--vscode-input-background, rgba(255,255,255,0.04));
        border: 1px solid var(--cv-border);
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
        opacity: 0.35;
      }

      /* ════════════════════════════════
         FIGMA-STYLE SECTION PANELS
         (rect / ellipse / polygon)
      ════════════════════════════════ */

      .cv-section-panel { display: flex; flex-direction: column; }

      /* Each named section */
      .cv-section {
        border-bottom: 1px solid var(--cv-border);
        padding: 8px 10px;
      }
      .cv-section:last-child { border-bottom: none; }

      /* Section header: title left, toggle right */
      .cv-section-hdr {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 7px;
      }
      .cv-section-title {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        color: var(--cv-blue);
      }

      /* Content row inside a section */
      .cv-section-row { display: flex; align-items: center; gap: 6px; }

      /* Swatch + label + opacity row (Fill / Stroke) */
      .cv-swatch-row {
        display: flex;
        align-items: center;
        gap: 7px;
        width: 100%;
      }
      .cv-swatch-label {
        flex: 1;
        font-size: 11px;
        color: var(--vscode-foreground);
        opacity: 0.75;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .cv-opacity-input {
        width: 48px;
        height: 22px;
        background: var(--vscode-input-background, rgba(255,255,255,0.06));
        border: 1px solid var(--cv-border);
        border-radius: 3px;
        color: var(--vscode-foreground);
        font-size: 11px;
        text-align: center;
        outline: none;
        padding: 0 2px;
      }
      .cv-opacity-input:focus { border-color: var(--cv-blue); }

      /* Colour swatch */
      .cv-swatch-wrap {
        position: relative;
        width: 22px;
        height: 22px;
        flex-shrink: 0;
      }
      .cv-swatch {
        width: 22px;
        height: 22px;
        border-radius: 3px;
        cursor: pointer;
        transition: opacity 0.12s;
        border: 1px solid rgba(255,255,255,0.15);
      }
      .cv-swatch:hover { opacity: 0.75; }
      .cv-swatch.none {
        background: transparent;
        border: 1px solid var(--cv-border);
        position: relative;
      }
      .cv-swatch.none::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to bottom right,
          transparent calc(50% - 0.5px),
          #e53e3e calc(50% - 0.5px),
          #e53e3e calc(50% + 0.5px),
          transparent calc(50% + 0.5px)
        );
      }

      /* Hidden colour input overlay */
      .cv-hidden-color {
        position: absolute;
        inset: 0;
        opacity: 0;
        width: 100%;
        height: 100%;
        cursor: pointer;
        border: none;
        padding: 0;
      }

      /* Selects (stroke weight / style) */
      .cv-select {
        height: 22px;
        background: var(--vscode-input-background, rgba(255,255,255,0.06));
        border: 1px solid var(--cv-border);
        border-radius: 3px;
        color: var(--vscode-foreground);
        font-size: 10px;
        padding: 0 3px;
        outline: none;
        cursor: pointer;
        flex-shrink: 0;
      }
      .cv-select:focus { border-color: var(--cv-blue); }
      .cv-select-sm { width: 50px; }
      .cv-select-md { width: 52px; }

      /* Geometry row: W / H / R fields */
      .cv-row-geo { display: flex; gap: 6px; }
      .cv-field {
        display: flex;
        flex-direction: column;
        gap: 3px;
        flex: 1;
      }
      .cv-field-lbl {
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        color: var(--vscode-descriptionForeground);
        opacity: 0.55;
        white-space: nowrap;
      }

      /* Number inputs */
      .cv-input {
        width: 100%;
        height: 22px;
        background: var(--vscode-input-background, rgba(255,255,255,0.06));
        border: 1px solid var(--cv-border);
        border-radius: 3px;
        color: var(--vscode-foreground);
        font-size: 11px;
        font-family: var(--vscode-font-family);
        padding: 0 4px;
        text-align: center;
        outline: none;
        box-sizing: border-box;
      }
      .cv-input:focus { border-color: var(--cv-blue); }
      .cv-input::-webkit-inner-spin-button,
      .cv-input::-webkit-outer-spin-button { -webkit-appearance: none; }
      .cv-input-sm { width: 38px; flex-shrink: 0; }

      /* Unit labels */
      .cv-unit     { font-size: 10px; color: var(--vscode-descriptionForeground); opacity: 0.5; flex-shrink: 0; }
      .cv-unit-lbl { font-size: 9px;  color: var(--vscode-descriptionForeground); opacity: 0.45; flex-shrink: 0; text-transform: uppercase; letter-spacing: 0.3px; }

      /* Image fill button */
      .cv-img-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        height: 26px;
        padding: 0 10px;
        background: var(--vscode-input-background, rgba(255,255,255,0.06));
        border: 1px solid var(--cv-border);
        border-radius: 4px;
        color: var(--vscode-foreground);
        font-size: 11px;
        cursor: pointer;
        transition: border-color 0.12s;
      }
      .cv-img-btn:hover { border-color: var(--cv-blue); color: var(--cv-blue); }

      /* Image tool — AI buttons 2-column grid */
      .cv-img-ai-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px;
        align-items: start;
      }
      .cv-img-ai-btn {
        display: flex;
        align-items: center;
        gap: 5px;
        height: 26px;
        padding: 0 8px;
        background: var(--vscode-input-background, rgba(255,255,255,0.06));
        border: 1px solid var(--cv-border);
        border-radius: 4px;
        color: var(--vscode-foreground);
        font-size: 10px;
        cursor: pointer;
        transition: border-color 0.12s, color 0.12s, background 0.12s;
        white-space: nowrap;
        overflow: hidden;
      }
      .cv-img-ai-btn:hover  { border-color: var(--cv-blue); color: var(--cv-blue); }
      .cv-img-ai-btn.active { border-color: var(--cv-blue); color: var(--cv-blue); background: rgba(56,189,248,0.12); }

      /* Image filename label */
      .cv-img-filename {
        font-size: 10px;
        color: #666;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;
      }

      /* Toggle pill */
      .cv-toggle-label { cursor: pointer; display: flex; align-items: center; flex-shrink: 0; }

      /* Text style toggle buttons (I U S) */
      .cv-style-btn {
        width: 22px; height: 22px;
        background: var(--vscode-input-background, rgba(255,255,255,0.06));
        border: 1px solid var(--cv-border);
        border-radius: 3px;
        color: var(--vscode-foreground);
        font-size: 12px;
        font-family: serif;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        transition: border-color 0.12s, background 0.12s;
        padding: 0;
      }
      .cv-style-btn:hover { border-color: var(--cv-blue); }
      .cv-style-btn.active { background: rgba(56,189,248,0.15); border-color: var(--cv-blue); color: var(--cv-blue); }

      /* Alignment buttons */
      .cv-align-btn {
        width: 22px; height: 22px;
        background: var(--vscode-input-background, rgba(255,255,255,0.06));
        border: 1px solid var(--cv-border);
        border-radius: 3px;
        color: var(--vscode-foreground);
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        transition: border-color 0.12s, background 0.12s;
        padding: 0;
        opacity: 0.6;
      }
      .cv-align-btn:hover { border-color: var(--cv-blue); opacity: 1; }
      .cv-align-btn.active { background: rgba(56,189,248,0.15); border-color: var(--cv-blue); color: var(--cv-blue); opacity: 1; }
      .cv-toggle-cb { display: none; }
      .cv-toggle-pill {
        width: 28px;
        height: 14px;
        border-radius: 7px;
        background: rgba(255,255,255,0.12);
        position: relative;
        transition: background 0.15s;
        display: block;
      }
      .cv-toggle-pill::after {
        content: '';
        position: absolute;
        top: 2px; left: 2px;
        width: 10px; height: 10px;
        border-radius: 50%;
        background: #666;
        transition: transform 0.15s, background 0.15s;
      }
      .cv-toggle-cb:checked ~ .cv-toggle-pill { background: var(--cv-blue); }
      .cv-toggle-cb:checked ~ .cv-toggle-pill::after { transform: translateX(14px); background: #fff; }

      /* ════════════════════════════════
         GRADIENT EDITOR
      ════════════════════════════════ */
      .cv-grad-editor {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      /* Type icon buttons */
      .cv-grad-types {
        display: flex;
        gap: 4px;
      }
      .cv-grad-type {
        width: 28px;
        height: 28px;
        padding: 2px;
        border: 1.5px solid var(--cv-border);
        border-radius: 4px;
        cursor: pointer;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        transition: border-color 0.12s;
        flex-shrink: 0;
      }
      .cv-grad-type:hover  { border-color: rgba(56,189,248,0.5); }
      .cv-grad-type.active { border-color: var(--cv-blue); box-shadow: 0 0 0 1px var(--cv-blue); }
      .cv-grad-type svg    { border-radius: 2px; display: block; }

      /* Angle row */
      .cv-grad-row {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      /* Gradient colour track */
      .cv-grad-track-wrap {
        padding: 0 6px;
      }
      .cv-grad-track {
        position: relative;
        height: 16px;
        border-radius: 8px;
        background: linear-gradient(to right, #ffffff 0%, #9333ea 50%, #000000 100%);
        border: 1px solid rgba(255,255,255,0.15);
      }

      /* Colour stop handles on track */
      .cv-grad-stop {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        cursor: ew-resize;
      }
      .cv-stop-thumb {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0 1px 4px rgba(0,0,0,0.6);
        transition: transform 0.1s;
      }
      .cv-stop-thumb:hover { transform: scale(1.2); }

      /* Stop colour / position / feather rows */
      .cv-stop-rows {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .cv-stop-row {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .cv-stop-row .cv-field-lbl {
        width: 28px;
        flex-shrink: 0;
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        color: var(--vscode-descriptionForeground);
        opacity: 0.55;
      }
      .cv-stop-swatch {
        flex-shrink: 0;
      }

      /* ════════════════════════════════
         OPACITY SLIDERS
      ════════════════════════════════ */
      .cv-alpha-row {
        width: 100%;
        display: flex;
        align-items: center;
        padding-top: 4px;
      }
      .cv-alpha-slider {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 6px;
        border-radius: 3px;
        outline: none;
        cursor: pointer;
        background: linear-gradient(to right,
          transparent 0%,
          var(--cv-blue) 100%),
          repeating-conic-gradient(#555 0% 25%, #333 0% 50%) 0 0 / 8px 8px;
        border: 1px solid var(--cv-border);
      }
      .cv-alpha-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #ffffff;
        border: 2px solid rgba(0,0,0,0.4);
        box-shadow: 0 1px 3px rgba(0,0,0,0.5);
        cursor: pointer;
      }
      .cv-alpha-slider::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #ffffff;
        border: 2px solid rgba(0,0,0,0.4);
        box-shadow: 0 1px 3px rgba(0,0,0,0.5);
        cursor: pointer;
      }
      /* Stop alpha — compact inline version */
      .cv-stop-alpha {
        width: 44px;
        flex-shrink: 0;
      }
      /* Shadow row — matches stroke row layout */
      .cv-shadow-row { display:flex; align-items:flex-end; gap:6px; }
      .cv-shadow-row .cv-swatch-wrap { flex-shrink:0; width:22px; height:22px; margin-bottom:0; }
      .cv-shadow-row .cv-swatch      { width:22px; height:22px; }
      .cv-field-sm   { flex:0 0 44px; }
      .cv-field-sm .cv-input { width:100%; }
      .cv-field-grow { flex:1; min-width:0; }
      .cv-field-grow .cv-alpha-slider { width:100%; }

      /* Fill swatch: red slash when fill is OFF */
      .cv-fill-swatch.cv-fill-off::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to bottom right,
          transparent calc(50% - 0.5px),
          #e53e3e calc(50% - 0.5px),
          #e53e3e calc(50% + 0.5px),
          transparent calc(50% + 0.5px)
        );
      }

      /* Shadow swatch: red slash hidden when shadow is ON */
      .cv-shadow-swatch.cv-shadow-on::after { display: none; }

      /* Stroke swatch: red slash hidden when stroke is ON */
      .cv-stroke-swatch.cv-stroke-on::after { display: none; }
    </style>

    <script>
      (function() {
        const toolbar   = document.getElementById('cvToolbar');
        const optPanels = document.querySelectorAll('#panel-canvas .cv-opts-panel');

        // ── Tool switching ──────────────────────────────────
        if (toolbar) {
          toolbar.addEventListener('click', (e) => {
            const btn = e.target.closest('.cv-tool');
            if (!btn) { return; }
            const tool = btn.dataset.tool;
            toolbar.querySelectorAll('.cv-tool').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            optPanels.forEach(p => p.classList.toggle('active', p.dataset.opts === tool));
            if (window.vscodeApi) {
              window.vscodeApi.postMessage({ command: 'setToolMode', tool });
              if (tool === 'select') {
                window.vscodeApi.postMessage({ command: 'requestLayers' });
              }
            }
          });
        }

        // ── Swatch click → open hidden colour input ─────────
        document.querySelectorAll('#panel-canvas .cv-swatch.filled').forEach(swatch => {
          swatch.addEventListener('click', () => {
            const input = swatch.parentElement.querySelector('.cv-hidden-color');
            if (input) { input.click(); }
          });
        });
        document.querySelectorAll('#panel-canvas .cv-swatch.none').forEach(swatch => {
          swatch.addEventListener('click', () => {
            const input = swatch.parentElement.querySelector('.cv-hidden-color');
            if (input) { input.click(); }
          });
        });

        // ── Colour input → update swatch + slider colour ────
        document.querySelectorAll('#panel-canvas .cv-hidden-color').forEach(input => {
          input.addEventListener('input', () => {
            const tid = input.dataset.target;
            if (tid) {
              const t = document.getElementById(tid);
              if (t) {
                t.style.background = input.value;
                const row = input.closest('.cv-section-row, .cv-field, .cv-stop-row');
                if (row) {
                  const slider = row.querySelector('.cv-alpha-slider');
                  if (slider) { updateSliderBg(slider, input.value); }
                }
              }
            }
            const stopTid = input.dataset.stopTarget;
            if (stopTid) {
              const swatches = document.querySelectorAll('[data-stop-swatch="' + stopTid + '"]');
              swatches.forEach(s => {
                s.style.background = input.value;
                const row = s.closest('.cv-stop-row');
                if (row) {
                  const slider = row.querySelector('.cv-stop-alpha');
                  if (slider) { updateSliderBg(slider, input.value); }
                }
              });
              const panel = input.closest('.cv-grad-editor');
              if (panel) { updateTrack(panel); }
            }
          });
          // VSCode webview native OS colour picker only fires 'change' (not 'input').
          // Add a change listener that updates the swatch then syncs — order guaranteed.
          input.addEventListener('change', () => {
            const tid = input.dataset.target;
            if (tid) {
              const t = document.getElementById(tid);
              if (t) {
                t.style.background = input.value;
                const row = input.closest('.cv-section-row, .cv-field, .cv-stop-row');
                if (row) {
                  const slider = row.querySelector('.cv-alpha-slider');
                  if (slider) { updateSliderBg(slider, input.value); }
                }
              }
            }
            const stopTid = input.dataset.stopTarget;
            if (stopTid) {
              const swatches = document.querySelectorAll('[data-stop-swatch="' + stopTid + '"]');
              swatches.forEach(s => {
                s.style.background = input.value;
                const row = s.closest('.cv-stop-row');
                if (row) {
                  const slider = row.querySelector('.cv-stop-alpha');
                  if (slider) { updateSliderBg(slider, input.value); }
                }
              });
              const panel = input.closest('.cv-grad-editor');
              if (panel) { updateTrack(panel); }
            }
            syncProps();
          });
        });

        // ── Stop swatch click → open hidden colour input ─────
        document.querySelectorAll('#panel-canvas [data-stop-swatch]').forEach(swatch => {
          swatch.addEventListener('click', () => {
            const id   = swatch.dataset.stopSwatch;
            const input = swatch.parentElement.querySelector('.cv-hidden-color[data-stop-target="' + id + '"]');
            if (input) { input.click(); }
          });
        });

        // ── Shadow toggle → show/hide red slash on swatch ────
        document.querySelectorAll('#panel-canvas .cv-toggle-cb').forEach(cb => {
          if (cb.dataset.grad) { return; }
          cb.addEventListener('change', () => {
            const section = cb.closest('.cv-section');
            if (!section) { return; }
            // Shadow
            const shadowSwatch = section.querySelector('.cv-shadow-swatch');
            if (shadowSwatch) { shadowSwatch.classList.toggle('cv-shadow-on', cb.checked); }
            // Fill
            const fillSwatch = section.querySelector('.cv-fill-swatch');
            if (fillSwatch) { fillSwatch.classList.toggle('cv-fill-off', !cb.checked); }
            // Stroke
            const strokeSwatch = section.querySelector('.cv-stroke-swatch');
            if (strokeSwatch) { strokeSwatch.classList.toggle('cv-stroke-on', cb.checked); }
          });
        });

        // ── Gradient toggle ──────────────────────────────────
        document.querySelectorAll('#panel-canvas .cv-toggle-cb[data-grad]').forEach(cb => {
          cb.addEventListener('change', () => {
            const editor = document.getElementById(cb.dataset.grad);
            if (editor) { editor.style.display = cb.checked ? 'flex' : 'none'; }
          });
        });

        // ── Gradient type buttons ────────────────────────────
        document.querySelectorAll('#panel-canvas .cv-grad-types').forEach(group => {
          group.addEventListener('click', (e) => {
            const btn = e.target.closest('.cv-grad-type');
            if (!btn) { return; }
            group.querySelectorAll('.cv-grad-type').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const gradEditor = group.closest('.cv-grad-editor');
            const angleRow = gradEditor ? gradEditor.querySelector('.cv-grad-angle-row') : null;
            if (angleRow) { angleRow.style.display = btn.dataset.type === 'linear' ? 'flex' : 'none'; }
            if (gradEditor) { updateTrack(gradEditor); }
            syncProps();
          });
        });

        // ── Update track gradient from stop colours ──────────
        function updateTrack(editor) {
          const track  = editor.querySelector('.cv-grad-track');
          const thumbs = editor.querySelectorAll('.cv-stop-thumb');
          const rows   = editor.querySelectorAll('.cv-stop-row');
          if (!track || rows.length < 3) { return; }
          const activeType = editor.querySelector('.cv-grad-type.active');
          const type = activeType ? activeType.dataset.type : 'linear';
          const stops = Array.from(rows).map((row, i) => {
            const swatch = row.querySelector('.cv-swatch');
            const posIn  = row.querySelectorAll('.cv-input-sm')[0];
            const color  = swatch ? getComputedStyle(swatch).backgroundColor : '#888';
            const pos    = posIn ? posIn.value : (i * 50);
            if (thumbs[i]) { thumbs[i].style.background = swatch ? swatch.style.background : '#888'; }
            const stopEl = track.querySelectorAll('.cv-grad-stop')[i];
            if (stopEl) { stopEl.style.left = pos + '%'; }
            return { color: swatch ? swatch.style.background : '#888', pos };
          });
          const stopStr = stops.map(s => s.color + ' ' + s.pos + '%').join(', ');
          if (type === 'radial') {
            track.style.background = 'radial-gradient(circle at 50% 50%, ' + stopStr + ')';
          } else if (type === 'diamond') {
            track.style.background = 'radial-gradient(ellipse 60% 100% at 50% 50%, ' + stopStr + ')';
          } else if (type === 'square') {
            track.style.background = 'radial-gradient(ellipse farthest-corner at 50% 50%, ' + stopStr + ')';
          } else {
            track.style.background = 'linear-gradient(to right, ' + stopStr + ')';
          }
        }

        // ── Slider background tracks colour ──────────────────
        function updateSliderBg(slider, hexColor) {
          slider.style.background = 'linear-gradient(to right, transparent 0%, ' + hexColor + ' 100%), ' +
            'repeating-conic-gradient(#555 0% 25%, #333 0% 50%) 0 0 / 8px 8px';
        }

        // Init sliders with their initial swatch colour
        document.querySelectorAll('#panel-canvas .cv-alpha-row').forEach(row => {
          const slider = row.querySelector('.cv-alpha-slider');
          if (!slider) { return; }
          const section = row.closest('.cv-section-row, .cv-field');
          if (!section) { return; }
          const swatch = section.querySelector('.cv-swatch');
          if (swatch && swatch.style.background) {
            updateSliderBg(slider, swatch.style.background);
          }
        });
        document.querySelectorAll('#panel-canvas .cv-stop-row').forEach(row => {
          const slider = row.querySelector('.cv-stop-alpha');
          const swatch = row.querySelector('.cv-swatch');
          if (slider && swatch && swatch.style.background) {
            updateSliderBg(slider, swatch.style.background);
          }
        });

        // ── Two-way bind: Fill opacity input box ↔ fill alpha slider ──────────
        document.querySelectorAll('#panel-canvas .cv-opacity-input').forEach(function(numInput) {
          var sectionRow = numInput.closest('.cv-section-row');
          if (!sectionRow) { return; }
          var slider = sectionRow.querySelector('.cv-alpha-slider:not(.cv-shadow-opacity):not(.cv-stop-alpha)');
          if (!slider) { return; }
          slider.addEventListener('input', function() { numInput.value = slider.value; });
          numInput.addEventListener('input', function() {
            var v = Math.min(100, Math.max(0, parseInt(numInput.value) || 0));
            slider.value = v;
          });
        });

        // Update track when position inputs change
        document.querySelectorAll('#panel-canvas .cv-stop-row .cv-input-sm').forEach(input => {
          input.addEventListener('input', () => {
            const editor = input.closest('.cv-grad-editor');
            if (editor) { updateTrack(editor); }
          });
        });

        // ── Sync rect properties to drawing canvas ───────────
        function getRectProps() {
          const panel = document.querySelector('#panel-canvas .cv-opts-panel[data-opts="rect"]');
          if (!panel) { return {}; }

          // Fill
          const fillToggle   = panel.querySelector('.cv-fill-toggle');
          const fillOn       = fillToggle ? fillToggle.checked : true;
          const fillSwatch   = panel.querySelector('#rectFill');
          const fillOpacity  = panel.querySelectorAll('.cv-opacity-input')[0];
          const fillColor    = fillOn ? (fillSwatch ? fillSwatch.style.background || '#ffffff' : '#ffffff') : 'none';
          const fillAlpha    = fillOpacity ? parseFloat(fillOpacity.value) / 100 : 1;

          // Stroke
          const strokeToggle  = panel.querySelector('.cv-stroke-toggle');
          const strokeOn      = strokeToggle ? strokeToggle.checked : true;
          const strokeSwatch  = panel.querySelector('#rectStroke');
          const strokeColor   = strokeOn ? (strokeSwatch ? (strokeSwatch.style.background || '#000000') : '#000000') : 'none';
          const strokeWeightEl = panel.querySelectorAll('.cv-select')[0];
          const strokeStyleEl  = panel.querySelectorAll('.cv-select')[1];
          const strokeWeight  = strokeWeightEl ? parseFloat(strokeWeightEl.value) : 1;
          const strokeStyle   = strokeStyleEl  ? strokeStyleEl.value : 'solid';
          const strokeAlphaEl = panel.querySelectorAll('.cv-alpha-slider')[1];
          const strokeAlpha   = strokeAlphaEl  ? parseFloat(strokeAlphaEl.value) / 100 : 1;

          // Geometry
          const geoInputs = panel.querySelectorAll('.cv-row-geo .cv-input');
          const geoW = geoInputs[0] ? parseFloat(geoInputs[0].value) || 0 : 0;
          const geoH = geoInputs[1] ? parseFloat(geoInputs[1].value) || 0 : 0;
          const geoR = geoInputs[2] ? parseFloat(geoInputs[2].value) || 0 : 0;

          // Gradient
          const gradToggle = panel.querySelector('.cv-toggle-cb[data-grad="rectGrad"]');
          const gradOn     = gradToggle ? gradToggle.checked : false;
          const gradEditor = document.getElementById('rectGrad');
          let grad = null;
          if (gradOn && gradEditor) {
            const activeType = gradEditor.querySelector('.cv-grad-type.active');
            const angleInput = gradEditor.querySelector('.cv-grad-angle-row .cv-input-sm');
            const stopRows   = gradEditor.querySelectorAll('.cv-stop-row');
            const stops = Array.from(stopRows).map(row => {
              const sw  = row.querySelector('.cv-swatch');
              const pos = row.querySelectorAll('.cv-input-sm')[0];
              const fth = row.querySelectorAll('.cv-input-sm')[1];
              const opa = row.querySelector('.cv-stop-alpha');
              return {
                color   : sw  ? sw.style.background  || '#000' : '#000',
                pos     : pos ? parseFloat(pos.value) : 0,
                feather : fth ? parseFloat(fth.value) : 0,
                opacity : opa ? parseFloat(opa.value) / 100 : 1
              };
            });
            grad = {
              type  : activeType ? activeType.dataset.type : 'linear',
              angle : angleInput  ? parseFloat(angleInput.value) : 90,
              stops
            };
          }

          // Shadow
          const shadowToggle = panel.querySelector('.cv-section:last-child .cv-toggle-cb');
          const shadowOn     = shadowToggle ? shadowToggle.checked : false;
          const shadowColorEl = panel.querySelector('#rectShadowColor');
          const shadowFields  = panel.querySelectorAll('.cv-section:last-child .cv-input');
          const shadowColor   = shadowColorEl ? (shadowColorEl.style.background || '#000000') : '#000000';
          const shadowSize    = shadowFields[0] ? parseFloat(shadowFields[0].value) : 0;
          const shadowOffset  = shadowFields[1] ? parseFloat(shadowFields[1].value) : 2;
          const shadowFeather = shadowFields[2] ? parseFloat(shadowFields[2].value) : 4;
          const shadowAlphaEl = panel.querySelector('.cv-section:last-child .cv-alpha-slider');
          const shadowAlpha   = shadowAlphaEl  ? parseFloat(shadowAlphaEl.value) / 100 : 0.75;

          return {
            fill      : { color: fillColor,   opacity: fillAlpha },
            stroke    : { color: strokeColor, opacity: strokeAlpha, weight: strokeWeight, style: strokeStyle },
            radius    : geoR,
            gradient  : grad,
            shadow    : shadowOn ? { color: shadowColor, size: shadowSize, offset: shadowOffset, feather: shadowFeather, opacity: shadowAlpha } : null
          };
        }

        function syncProps() {
          if (!window.vscodeApi) { return; }
          window.vscodeApi.postMessage({ command: 'rectProps', props: getRectProps() });
        }

        // Fire syncProps on any property change inside the rect panel
        const rectPanel = document.querySelector('#panel-canvas .cv-opts-panel[data-opts="rect"]');
        if (rectPanel) {
          rectPanel.addEventListener('input',  syncProps);
          rectPanel.addEventListener('change', syncProps);
        }

        // ── Sync ellipse properties ────────────────────────────
        function getEllipseProps() {
          const panel = document.querySelector('#panel-canvas .cv-opts-panel[data-opts="ellipse"]');
          if (!panel) { return {}; }
          const fillToggle   = panel.querySelector('.cv-fill-toggle');
          const fillOn       = fillToggle ? fillToggle.checked : true;
          const fillSwatch   = panel.querySelector('#ellFill');
          const fillOpacity  = panel.querySelectorAll('.cv-opacity-input')[0];
          const fillColor    = fillOn ? (fillSwatch ? fillSwatch.style.background || '#ffffff' : '#ffffff') : 'none';
          const fillAlpha    = fillOpacity ? parseFloat(fillOpacity.value) / 100 : 1;
          const strokeToggle   = panel.querySelector('.cv-stroke-toggle');
          const strokeOn       = strokeToggle ? strokeToggle.checked : true;
          const strokeSwatch   = panel.querySelector('#ellStroke');
          const strokeColor    = strokeOn ? (strokeSwatch ? strokeSwatch.style.background || '#000000' : '#000000') : 'none';
          const strokeWeightEl = panel.querySelectorAll('.cv-select')[0];
          const strokeStyleEl  = panel.querySelectorAll('.cv-select')[1];
          const strokeWeight   = strokeWeightEl ? parseFloat(strokeWeightEl.value) : 1;
          const strokeStyle    = strokeStyleEl  ? strokeStyleEl.value : 'solid';
          const strokeAlphaEl  = panel.querySelectorAll('.cv-alpha-slider')[1];
          const strokeAlpha    = strokeAlphaEl  ? parseFloat(strokeAlphaEl.value) / 100 : 1;
          const gradToggle = panel.querySelector('.cv-toggle-cb[data-grad="ellGrad"]');
          const gradOn     = gradToggle ? gradToggle.checked : false;
          const gradEditor = document.getElementById('ellGrad');
          let grad = null;
          if (gradOn && gradEditor) {
            const activeType = gradEditor.querySelector('.cv-grad-type.active');
            const angleInput = gradEditor.querySelector('.cv-grad-angle-row .cv-input-sm');
            const stopRows   = gradEditor.querySelectorAll('.cv-stop-row');
            const stops = Array.from(stopRows).map(row => {
              const sw  = row.querySelector('.cv-swatch');
              const pos = row.querySelectorAll('.cv-input-sm')[0];
              const fth = row.querySelectorAll('.cv-input-sm')[1];
              const opa = row.querySelector('.cv-stop-alpha');
              return { color: sw ? sw.style.background || '#000' : '#000', pos: pos ? parseFloat(pos.value) : 0, feather: fth ? parseFloat(fth.value) : 0, opacity: opa ? parseFloat(opa.value) / 100 : 1 };
            });
            grad = { type: activeType ? activeType.dataset.type : 'linear', angle: angleInput ? parseFloat(angleInput.value) : 90, stops };
          }
          const shadowToggle  = panel.querySelector('.cv-section:last-child .cv-toggle-cb');
          const shadowOn      = shadowToggle ? shadowToggle.checked : false;
          const shadowColorEl = panel.querySelector('#ellShadowColor');
          const shadowFields  = panel.querySelectorAll('.cv-section:last-child .cv-input');
          const shadowColor   = shadowColorEl ? (shadowColorEl.style.background || '#000000') : '#000000';
          const shadowSize    = shadowFields[0] ? parseFloat(shadowFields[0].value) : 0;
          const shadowOffset  = shadowFields[1] ? parseFloat(shadowFields[1].value) : 2;
          const shadowFeather = shadowFields[2] ? parseFloat(shadowFields[2].value) : 4;
          const shadowAlphaEl = panel.querySelector('.cv-section:last-child .cv-alpha-slider');
          const shadowAlpha   = shadowAlphaEl  ? parseFloat(shadowAlphaEl.value) / 100 : 0.75;
          return { fill: { color: fillColor, opacity: fillAlpha }, stroke: { color: strokeColor, opacity: strokeAlpha, weight: strokeWeight, style: strokeStyle }, gradient: grad, shadow: shadowOn ? { color: shadowColor, size: shadowSize, offset: shadowOffset, feather: shadowFeather, opacity: shadowAlpha } : null };
        }
        function syncEllipseProps() {
          if (!window.vscodeApi) { return; }
          window.vscodeApi.postMessage({ command: 'ellipseProps', props: getEllipseProps() });
        }
        const ellPanel = document.querySelector('#panel-canvas .cv-opts-panel[data-opts="ellipse"]');
        if (ellPanel) { ellPanel.addEventListener('input', syncEllipseProps); ellPanel.addEventListener('change', syncEllipseProps); }

        // ── Sync polygon properties ────────────────────────────
        function getPolyProps() {
          const panel = document.querySelector('#panel-canvas .cv-opts-panel[data-opts="polygon"]');
          if (!panel) { return {}; }
          const fillToggle   = panel.querySelector('.cv-fill-toggle');
          const fillOn       = fillToggle ? fillToggle.checked : true;
          const fillSwatch   = panel.querySelector('#polyFill');
          const fillOpacity  = panel.querySelectorAll('.cv-opacity-input')[0];
          const fillColor    = fillOn ? (fillSwatch ? fillSwatch.style.background || '#ffffff' : '#ffffff') : 'none';
          const fillAlpha    = fillOpacity ? parseFloat(fillOpacity.value) / 100 : 1;
          const strokeToggle   = panel.querySelector('.cv-stroke-toggle');
          const strokeOn       = strokeToggle ? strokeToggle.checked : true;
          const strokeSwatch   = panel.querySelector('#polyStroke');
          const strokeColor    = strokeOn ? (strokeSwatch ? strokeSwatch.style.background || '#000000' : '#000000') : 'none';
          const strokeWeightEl = panel.querySelectorAll('.cv-select')[0];
          const strokeStyleEl  = panel.querySelectorAll('.cv-select')[1];
          const strokeWeight   = strokeWeightEl ? parseFloat(strokeWeightEl.value) : 1;
          const strokeStyle    = strokeStyleEl  ? strokeStyleEl.value : 'solid';
          const strokeAlphaEl  = panel.querySelectorAll('.cv-alpha-slider')[1];
          const strokeAlpha    = strokeAlphaEl  ? parseFloat(strokeAlphaEl.value) / 100 : 1;
          const sidesEl  = panel.querySelector('#polySides');
          const radiusEl = panel.querySelector('#polyRadius');
          const sides    = sidesEl  ? Math.max(3, parseInt(sidesEl.value)  || 6) : 6;
          const geoR     = radiusEl ? Math.max(0, parseFloat(radiusEl.value) || 0) : 0;
          const gradToggle = panel.querySelector('.cv-toggle-cb[data-grad="polyGrad"]');
          const gradOn     = gradToggle ? gradToggle.checked : false;
          const gradEditor = document.getElementById('polyGrad');
          let grad = null;
          if (gradOn && gradEditor) {
            const activeType = gradEditor.querySelector('.cv-grad-type.active');
            const angleInput = gradEditor.querySelector('.cv-grad-angle-row .cv-input-sm');
            const stopRows   = gradEditor.querySelectorAll('.cv-stop-row');
            const stops = Array.from(stopRows).map(row => {
              const sw  = row.querySelector('.cv-swatch');
              const pos = row.querySelectorAll('.cv-input-sm')[0];
              const fth = row.querySelectorAll('.cv-input-sm')[1];
              const opa = row.querySelector('.cv-stop-alpha');
              return { color: sw ? sw.style.background || '#000' : '#000', pos: pos ? parseFloat(pos.value) : 0, feather: fth ? parseFloat(fth.value) : 0, opacity: opa ? parseFloat(opa.value) / 100 : 1 };
            });
            grad = { type: activeType ? activeType.dataset.type : 'linear', angle: angleInput ? parseFloat(angleInput.value) : 90, stops };
          }
          const shadowToggle  = panel.querySelector('.cv-section:last-child .cv-toggle-cb');
          const shadowOn      = shadowToggle ? shadowToggle.checked : false;
          const shadowColorEl = panel.querySelector('#polyShadowColor');
          const shadowFields  = panel.querySelectorAll('.cv-section:last-child .cv-input');
          const shadowColor   = shadowColorEl ? (shadowColorEl.style.background || '#000000') : '#000000';
          const shadowSize    = shadowFields[0] ? parseFloat(shadowFields[0].value) : 0;
          const shadowOffset  = shadowFields[1] ? parseFloat(shadowFields[1].value) : 2;
          const shadowFeather = shadowFields[2] ? parseFloat(shadowFields[2].value) : 4;
          const shadowAlphaEl = panel.querySelector('.cv-section:last-child .cv-alpha-slider');
          const shadowAlpha   = shadowAlphaEl  ? parseFloat(shadowAlphaEl.value) / 100 : 0.75;
          return { fill: { color: fillColor, opacity: fillAlpha }, stroke: { color: strokeColor, opacity: strokeAlpha, weight: strokeWeight, style: strokeStyle }, sides, radius: geoR, gradient: grad, shadow: shadowOn ? { color: shadowColor, size: shadowSize, offset: shadowOffset, feather: shadowFeather, opacity: shadowAlpha } : null };
        }
        function syncPolyProps() {
          if (!window.vscodeApi) { return; }
          window.vscodeApi.postMessage({ command: 'polygonProps', props: getPolyProps() });
        }
        const polyPanel = document.querySelector('#panel-canvas .cv-opts-panel[data-opts="polygon"]');
        if (polyPanel) { polyPanel.addEventListener('input', syncPolyProps); polyPanel.addEventListener('change', syncPolyProps); }

        // ── Sync line properties ───────────────────────────────
        function getLineProps() {
          const panel = document.querySelector('#panel-canvas .cv-opts-panel[data-opts="line"]');
          if (!panel) { return {}; }
          const strokeSwatch  = panel.querySelector('#lineStroke');
          const strokeColor   = strokeSwatch ? (strokeSwatch.style.background || '#000000') : '#000000';
          const weightEl      = panel.querySelector('#lineWeight');
          const styleEl       = panel.querySelector('#lineStyle');
          const opacityEl     = panel.querySelector('#lineOpacity');
          const strokeWeight  = weightEl  ? parseFloat(weightEl.value)  : 1;
          const strokeStyle   = styleEl   ? styleEl.value               : 'solid';
          const strokeAlpha   = opacityEl ? parseFloat(opacityEl.value) / 100 : 1;
          const shadowToggle  = panel.querySelector('.cv-line-shadow-toggle');
          const shadowOn      = shadowToggle ? shadowToggle.checked : false;
          const shadowColorEl = panel.querySelector('#lineShadowColor');
          const shadowFields  = panel.querySelectorAll('.cv-shadow-row .cv-input');
          const shadowColor   = shadowColorEl ? (shadowColorEl.style.background || '#000000') : '#000000';
          const shadowSize    = shadowFields[0] ? parseFloat(shadowFields[0].value) : 0;
          const shadowOffset  = shadowFields[1] ? parseFloat(shadowFields[1].value) : 2;
          const shadowFeather = shadowFields[2] ? parseFloat(shadowFields[2].value) : 4;
          const shadowAlphaEl = panel.querySelector('.cv-shadow-opacity');
          const shadowAlpha   = shadowAlphaEl ? parseFloat(shadowAlphaEl.value) / 100 : 0.75;
          return {
            stroke : { color: strokeColor, opacity: strokeAlpha, weight: strokeWeight, style: strokeStyle },
            shadow : shadowOn ? { color: shadowColor, size: shadowSize, offset: shadowOffset, feather: shadowFeather, opacity: shadowAlpha } : null
          };
        }
        function syncLineProps() {
          if (!window.vscodeApi) { return; }
          window.vscodeApi.postMessage({ command: 'lineProps', props: getLineProps() });
        }
        const linePanel = document.querySelector('#panel-canvas .cv-opts-panel[data-opts="line"]');
        if (linePanel) { linePanel.addEventListener('input', syncLineProps); linePanel.addEventListener('change', syncLineProps); }

        // ── Sync pen properties ────────────────────────────────
        function getPenProps() {
          const panel = document.querySelector('#panel-canvas .cv-opts-panel[data-opts="pen"]');
          if (!panel) { return {}; }
          const strokeSwatch  = panel.querySelector('#penStroke');
          const strokeColor   = strokeSwatch ? (strokeSwatch.style.background || '#000000') : '#000000';
          const weightEl      = panel.querySelector('#penWeight');
          const styleEl       = panel.querySelector('#penStyle');
          const opacityEl     = panel.querySelector('#penOpacity');
          const strokeWeight  = weightEl  ? parseFloat(weightEl.value)  : 1;
          const strokeStyle   = styleEl   ? styleEl.value               : 'solid';
          const strokeAlpha   = opacityEl ? parseFloat(opacityEl.value) / 100 : 1;
          const shadowToggle  = panel.querySelector('.cv-pen-shadow-toggle');
          const shadowOn      = shadowToggle ? shadowToggle.checked : false;
          const shadowColorEl = panel.querySelector('#penShadowColor');
          const shadowFields  = panel.querySelectorAll('.cv-shadow-row .cv-input');
          const shadowColor   = shadowColorEl ? (shadowColorEl.style.background || '#000000') : '#000000';
          const shadowSize    = shadowFields[0] ? parseFloat(shadowFields[0].value) : 0;
          const shadowOffset  = shadowFields[1] ? parseFloat(shadowFields[1].value) : 2;
          const shadowFeather = shadowFields[2] ? parseFloat(shadowFields[2].value) : 4;
          const shadowAlphaEl = panel.querySelector('.cv-shadow-opacity');
          const shadowAlpha   = shadowAlphaEl ? parseFloat(shadowAlphaEl.value) / 100 : 0.75;
          return {
            stroke : { color: strokeColor, opacity: strokeAlpha, weight: strokeWeight, style: strokeStyle },
            shadow : shadowOn ? { color: shadowColor, size: shadowSize, offset: shadowOffset, feather: shadowFeather, opacity: shadowAlpha } : null
          };
        }
        function syncPenProps() {
          if (!window.vscodeApi) { return; }
          window.vscodeApi.postMessage({ command: 'penProps', props: getPenProps() });
        }
        const penPanel = document.querySelector('#panel-canvas .cv-opts-panel[data-opts="pen"]');
        if (penPanel) { penPanel.addEventListener('input', syncPenProps); penPanel.addEventListener('change', syncPenProps); }

        // ── Sync bezier properties ─────────────────────────────
        function getBezProps() {
          const panel = document.querySelector('#panel-canvas .cv-opts-panel[data-opts="bezier"]');
          if (!panel) { return {}; }
          const strokeSwatch  = panel.querySelector('#bezStroke');
          const strokeColor   = strokeSwatch ? (strokeSwatch.style.background || '#000000') : '#000000';
          const weightEl      = panel.querySelector('#bezWeight');
          const styleEl       = panel.querySelector('#bezStyle');
          const opacityEl     = panel.querySelector('#bezOpacity');
          const strokeWeight  = weightEl  ? parseFloat(weightEl.value)  : 2;
          const strokeStyle   = styleEl   ? styleEl.value               : 'solid';
          const strokeAlpha   = opacityEl ? parseFloat(opacityEl.value) / 100 : 1;
          const shadowToggle  = panel.querySelector('.cv-bez-shadow-toggle');
          const shadowOn      = shadowToggle ? shadowToggle.checked : false;
          const shadowColorEl = panel.querySelector('#bezShadowColor');
          const shadowFields  = panel.querySelectorAll('.cv-shadow-row .cv-input');
          const shadowColor   = shadowColorEl ? (shadowColorEl.style.background || '#000000') : '#000000';
          const shadowSize    = shadowFields[0] ? parseFloat(shadowFields[0].value) : 0;
          const shadowOffset  = shadowFields[1] ? parseFloat(shadowFields[1].value) : 2;
          const shadowFeather = shadowFields[2] ? parseFloat(shadowFields[2].value) : 4;
          const shadowAlphaEl = panel.querySelector('.cv-shadow-opacity');
          const shadowAlpha   = shadowAlphaEl ? parseFloat(shadowAlphaEl.value) / 100 : 0.75;
          return {
            stroke : { color: strokeColor, opacity: strokeAlpha, weight: strokeWeight, style: strokeStyle },
            shadow : shadowOn ? { color: shadowColor, size: shadowSize, offset: shadowOffset, feather: shadowFeather, opacity: shadowAlpha } : null
          };
        }
        function syncBezProps() {
          if (!window.vscodeApi) { return; }
          window.vscodeApi.postMessage({ command: 'bezierProps', props: getBezProps() });
        }
        const bezPanel = document.querySelector('#panel-canvas .cv-opts-panel[data-opts="bezier"]');
        if (bezPanel) { bezPanel.addEventListener('input', syncBezProps); bezPanel.addEventListener('change', syncBezProps); }

        // ── Load Google Fonts for text tool preview ────────────
        (function loadGoogleFonts() {
          const families = [
            'Inter','Roboto','Open+Sans','Lato','Montserrat','Poppins','Nunito','Raleway',
            'Oswald','Source+Sans+Pro','Merriweather','Playfair+Display','PT+Serif','Lora',
            'Ubuntu','Noto+Sans','Fira+Sans','DM+Sans','Space+Grotesk','JetBrains+Mono'
          ];
          const link = document.createElement('link');
          link.rel  = 'stylesheet';
          link.href = 'https://fonts.googleapis.com/css2?family=' + families.map(f => f + ':wght@100;200;300;400;500;600;700;800;900').join('&family=') + '&display=swap';
          document.head.appendChild(link);
        })();

        // ── Sync text properties ───────────────────────────────
        function getTextProps() {
          const panel = document.querySelector('#panel-canvas .cv-opts-panel[data-opts="text"]');
          if (!panel) { return {}; }

          const family       = (panel.querySelector('#txtFamily') || {}).value || 'Inter';
          const weight       = parseInt((panel.querySelector('#txtWeight') || {}).value || '400');
          const size         = parseFloat((panel.querySelector('#txtSize') || {}).value || '16');
          const unit         = (panel.querySelector('#txtUnit') || {}).value || 'px';
          const antialias    = (panel.querySelector('#txtAntialias') || {}).value || 'antialiased';
          const lineHeight   = parseFloat((panel.querySelector('#txtLineHeight') || {}).value || '1.4');
          const letterSpacing = parseFloat((panel.querySelector('#txtLetterSpacing') || {}).value || '0');
          const align        = panel.querySelector('.cv-align-btn.active')?.getAttribute('data-align') || 'left';

          const italic        = panel.querySelector('#txtItalic')?.classList.contains('active') || false;
          const underline     = panel.querySelector('#txtUnderline')?.classList.contains('active') || false;
          const strikethrough = panel.querySelector('#txtStrikethrough')?.classList.contains('active') || false;

          const colorSwatch  = panel.querySelector('#txtColor');
          const color        = colorSwatch ? (colorSwatch.style.background || '#000000') : '#000000';
          const colorOpacity = parseFloat((panel.querySelector('#txtColorOpacity') || {}).value || '100') / 100;

          const shadowToggle  = panel.querySelector('.cv-txt-shadow-toggle');
          const shadowOn      = shadowToggle ? shadowToggle.checked : false;
          const shadowColorEl = panel.querySelector('#txtShadowColor');
          const shadowFields  = panel.querySelectorAll('.cv-shadow-row .cv-input');
          const shadowColor   = shadowColorEl ? (shadowColorEl.style.background || '#000000') : '#000000';
          const shadowSize    = shadowFields[0] ? parseFloat(shadowFields[0].value) : 0;
          const shadowOffset  = shadowFields[1] ? parseFloat(shadowFields[1].value) : 2;
          const shadowFeather = shadowFields[2] ? parseFloat(shadowFields[2].value) : 4;
          const shadowAlphaEl = panel.querySelector('.cv-shadow-opacity');
          const shadowAlpha   = shadowAlphaEl ? parseFloat(shadowAlphaEl.value) / 100 : 0.75;

          return {
            family, weight, size, unit, antialias,
            lineHeight, letterSpacing, align,
            italic, underline, strikethrough,
            color, colorOpacity,
            shadow: shadowOn ? { color: shadowColor, size: shadowSize, offset: shadowOffset, feather: shadowFeather, opacity: shadowAlpha } : null
          };
        }

        function syncTextProps() {
          if (!window.vscodeApi) { return; }
          window.vscodeApi.postMessage({ command: 'textProps', props: getTextProps() });
        }

        // Wire text panel input/change
        const textPanel = document.querySelector('#panel-canvas .cv-opts-panel[data-opts="text"]');
        if (textPanel) {
          textPanel.addEventListener('input',  syncTextProps);
          textPanel.addEventListener('change', syncTextProps);

          // Alignment button group — single active
          textPanel.querySelectorAll('.cv-align-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              textPanel.querySelectorAll('.cv-align-btn').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              syncTextProps();
            });
          });

          // Style toggle buttons (italic / underline / strikethrough)
          textPanel.querySelectorAll('.cv-style-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              btn.classList.toggle('active');
              syncTextProps();
            });
          });
        }

        // ── Icon picker ───────────────────────────────────────────────
        var _iconSearchTimer  = null;
        var _selectedIconName = null;

        // ── Live Lucide index — populated from server via lucideTags message ──
        var _lucideTags   = {};   // { iconName: [tag, tag, ...] }
        var _svgCache     = {};   // { iconName: svgInner } — filled as server responds
        var _pendingCells = {};   // { iconName: [cellEl, ...] } — cells waiting for SVG

        // Hardcoded data replaced by live index. Placeholder retained below as offline fallback.
        var _LUCIDE_DATA_PLACEHOLDER = {
          arrows: {
            'arrow-up':'<path d="M12 19V5M5 12l7-7 7 7"/>',
            'arrow-down':'<path d="M12 5v14M5 12l7 7 7-7"/>',
            'arrow-left':'<path d="M19 12H5M12 5l-7 7 7 7"/>',
            'arrow-right':'<path d="M5 12h14M12 5l7 7-7 7"/>',
            'arrow-up-right':'<path d="M7 17L17 7M7 7h10v10"/>',
            'arrow-up-left':'<path d="M17 17L7 7M17 7H7v10"/>',
            'arrow-down-right':'<path d="M7 7l10 10M17 7v10H7"/>',
            'arrow-down-left':'<path d="M17 7L7 17M7 7v10h10"/>',
            'chevron-up':'<path d="M18 15l-6-6-6 6"/>',
            'chevron-down':'<path d="M6 9l6 6 6-6"/>',
            'chevron-left':'<path d="M15 18l-6-6 6-6"/>',
            'chevron-right':'<path d="M9 18l6-6-6-6"/>',
            'chevrons-up':'<path d="M17 11l-5-5-5 5M17 18l-5-5-5 5"/>',
            'chevrons-down':'<path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>',
            'move':'<path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>',
            'rotate-cw':'<path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
            'rotate-ccw':'<path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
            'refresh-cw':'<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.67 9A9 9 0 0 1 21 12a9 9 0 0 1-3.15 6.78M20.33 15A9 9 0 0 1 3 12a9 9 0 0 1 3.15-6.78"/>',
            'corner-up-left':'<path d="M9 14l-5-5 5-5"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>',
            'corner-up-right':'<path d="M15 14l5-5-5-5"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/>'
          },
          communication: {
            'mail':'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
            'send':'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
            'message-circle':'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
            'message-square':'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
            'phone':'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.46 13.5 19.79 19.79 0 0 1 1.39 4.87a2 2 0 0 1 1.95-2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6 6l.72-.72a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
            'bell':'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
            'wifi':'<path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>',
            'at-sign':'<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>',
            'hash':'<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>'
          },
          development: {
            'code':'<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
            'terminal':'<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
            'git-branch':'<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
            'git-commit':'<circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17.01" y1="12" x2="22.96" y2="12"/>',
            'github':'<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S9 17.44 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
            'database':'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
            'server':'<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
            'cpu':'<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="2" x2="9" y2="4"/><line x1="15" y1="2" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="22"/><line x1="15" y1="20" x2="15" y2="22"/><line x1="2" y1="9" x2="4" y2="9"/><line x1="2" y1="15" x2="4" y2="15"/><line x1="20" y1="9" x2="22" y2="9"/><line x1="20" y1="15" x2="22" y2="15"/>',
            'layers':'<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
            'monitor':'<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>'
          },
          files: {
            'file':'<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>',
            'file-text':'<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>',
            'folder':'<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
            'folder-open':'<path d="M6 14l1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/>',
            'download':'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
            'upload':'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
            'save':'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13"/><polyline points="7 3 7 8 15 8"/>',
            'clipboard':'<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
            'copy':'<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'
          },
          finance: {
            'credit-card':'<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
            'dollar-sign':'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6"/>',
            'trending-up':'<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
            'trending-down':'<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>',
            'bar-chart':'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
            'pie-chart':'<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
            'shopping-cart':'<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
            'wallet':'<path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/>',
            'receipt':'<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="M16 8H8M16 12H8M12 16H8"/>'
          },
          layout: {
            'layout':'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
            'grid':'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
            'list':'<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
            'maximize':'<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>',
            'minimize':'<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>',
            'columns':'<path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18"/>',
            'sidebar':'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>',
            'panel-left':'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>',
            'table':'<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"/><path d="M3 9h18M3 15h18M12 3v18"/>'
          },
          media: {
            'play':'<polygon points="5 3 19 12 5 21 5 3"/>',
            'pause':'<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
            'stop-circle':'<circle cx="12" cy="12" r="10"/><rect x="9" y="9" width="6" height="6"/>',
            'volume-2':'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>',
            'music':'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
            'mic':'<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>',
            'camera':'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
            'video':'<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
            'image':'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
            'headphones':'<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>'
          },
          navigation: {
            'home':'<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
            'map-pin':'<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
            'compass':'<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
            'globe':'<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
            'search':'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
            'menu':'<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
            'bookmark':'<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
            'navigation':'<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
            'zoom-in':'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>',
            'external-link':'<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>'
          },
          science: {
            'activity':'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
            'heart':'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
            'thermometer':'<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>',
            'eye':'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
            'atom':'<circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>',
            'microscope':'<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>',
            'dna':'<path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M17 8c-1.799 1.997-2.518 3.995-2.807 5.993"/>',
            'pill':'<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>'
          },
          security: {
            'lock':'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
            'unlock':'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
            'key':'<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
            'shield':'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
            'shield-check':'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
            'eye-off':'<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>',
            'link':'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
            'log-in':'<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>',
            'alert-triangle':'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'
          },
          shapes: {
            'circle':'<circle cx="12" cy="12" r="10"/>',
            'square':'<rect x="3" y="3" width="18" height="18" rx="2"/>',
            'triangle':'<path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>',
            'hexagon':'<polygon points="21 16 21 8 12 3 3 8 3 16 12 21 21 16"/>',
            'octagon':'<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>',
            'star':'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
            'diamond':'<path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z"/>',
            'disc':'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>'
          },
          social: {
            'users':'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
            'user':'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
            'user-plus':'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>',
            'share-2':'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
            'thumbs-up':'<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
            'smile':'<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
            'heart':'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>'
          },
          text: {
            'type':'<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>',
            'bold':'<path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/>',
            'italic':'<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>',
            'underline':'<path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" y1="20" x2="20" y2="20"/>',
            'heading':'<path d="M6 12h12"/><path d="M6 20V4"/><path d="M18 20V4"/>',
            'quote':'<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>',
            'align-left':'<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>',
            'align-center':'<line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>'
          },
          weather: {
            'sun':'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
            'moon':'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
            'cloud':'<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
            'cloud-rain':'<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6M8 14v6M12 16v6"/>',
            'cloud-snow':'<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 15h.01M8 19h.01M12 17h.01M12 21h.01M16 15h.01M16 19h.01"/>',
            'cloud-lightning':'<path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/>',
            'wind':'<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>',
            'umbrella':'<path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/>',
            'snowflake':'<line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/><path d="m20 16-4-4 4-4M4 8l4 4-4 4m12-12-4 4-4-4m0 16 4-4 4 4"/>'
          },
          accessibility: {
            'accessibility':'<circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1M5 8l6-2 2 4"/><path d="m8.5 14.5 2 4.5 4-2"/><path d="M5 8l2 8"/>',
            'eye':'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
            'ear':'<path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 0 1-7 0"/><path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4"/>',
            'brain':'<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.6A3 3 0 0 1 4 11c0-.56.15-1.09.42-1.54a2.5 2.5 0 0 1 .68-4.9A2.5 2.5 0 0 1 9.5 2Z"/>',
            'hand':'<path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>'
          },
          account: {
            'user-circle':'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>',
            'user-check':'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>',
            'log-out':'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
            'settings':'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
            'crown':'<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>'
          },
          brands: {
            'github':'<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S9 17.44 9 18v4"/>',
            'twitter':'<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>',
            'linkedin':'<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
            'youtube':'<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
            'instagram':'<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>',
            'facebook':'<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
            'slack':'<rect x="13" y="2" width="3" height="8" rx="1.5"/><path d="M19 8.5V10h1.5A1.5 1.5 0 1 0 19 8.5"/><rect x="8" y="14" width="3" height="8" rx="1.5"/><path d="M5 15.5V14H3.5A1.5 1.5 0 1 0 5 15.5"/><rect x="14" y="13" width="8" height="3" rx="1.5"/><path d="M15.5 19H14v1.5a1.5 1.5 0 1 0 1.5-1.5"/><rect x="2" y="8" width="8" height="3" rx="1.5"/><path d="M8.5 5H10V3.5A1.5 1.5 0 1 0 8.5 5"/>',
            'figma':'<path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"/><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"/><path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"/><path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"/><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"/>'
          },
          buildings: {
            'building':'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M16 10h.01M8 10h.01M12 14h.01M16 14h.01M8 14h.01"/>',
            'building-2':'<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/>',
            'store':'<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/>',
            'landmark':'<line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
            'school':'<path d="M14 22v-4a2 2 0 0 0-4 0v4"/><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/><path d="M18 5v17M6 5v17"/><path d="m4 6 8-4 8 4"/><circle cx="12" cy="9" r="2"/>'
          },
          charts: {
            'bar-chart-2':'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
            'line-chart':'<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>',
            'area-chart':'<path d="M3 3v18h18"/><path d="M7 12v5h12V8l-5 5-4-4z"/>',
            'pie-chart':'<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
            'activity':'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'
          },
          connectivity: {
            'wifi':'<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>',
            'bluetooth':'<polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>',
            'rss':'<path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>',
            'cast':'<path d="M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"/><path d="M2 15h10"/><path d="m2 20 3-3-3-3"/>',
            'share':'<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>'
          },
          cursors: {
            'mouse-pointer':'<path d="m4 4 7.07 17 2.51-7.39L21 11.07z"/>',
            'mouse-pointer-2':'<path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"/>',
            'mouse':'<rect x="5" y="2" width="14" height="20" rx="7"/><path d="M12 6v4"/>',
            'pointer':'<path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>'
          },
          devices: {
            'smartphone':'<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
            'tablet':'<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
            'laptop':'<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>',
            'monitor':'<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
            'keyboard':'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10"/>',
            'watch':'<circle cx="12" cy="12" r="6"/><polyline points="12 10 12 12 13 13"/><path d="m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05"/><path d="m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05"/>'
          },
          editing: {
            'pencil':'<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
            'pen-tool':'<path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
            'edit':'<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
            'scissors':'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>',
            'crop':'<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>',
            'sliders':'<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>'
          },
          emoji: {
            'smile':'<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
            'frown':'<circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
            'meh':'<circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
            'laugh':'<circle cx="12" cy="12" r="10"/><path d="M18 13a6 6 0 0 1-6 5 6 6 0 0 1-6-5h12Z"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
            'heart':'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
            'star':'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
          },
          food: {
            'coffee':'<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>',
            'pizza':'<path d="M15 11h.01"/><path d="M11 15h.01"/><path d="M16 16h.01"/><path d="m2 16 20 6-6-20A20 20 0 0 0 2 16"/>',
            'apple':'<path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06z"/><path d="M10 2c1 .5 2 2 2 5"/>',
            'utensils':'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>'
          },
          gaming: {
            'gamepad-2':'<line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>',
            'trophy':'<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
            'swords':'<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" y1="14" x2="9" y2="18"/>',
            'puzzle':'<path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.98.98 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 2c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02z"/>'
          },
          home: {
            'home':'<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
            'sofa':'<path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5H6V11a2 2 0 0 0-4 0z"/><path d="M4 18v2M20 18v2M12 4v9"/>',
            'tv':'<rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/>',
            'lamp':'<path d="M8 2h8l4 10H4L8 2z"/><path d="M12 12v6"/><path d="M8 22h8"/>',
            'door-open':'<path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561z"/>'
          },
          maps: {
            'map':'<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>',
            'map-pin':'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
            'navigation':'<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
            'compass':'<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
            'route':'<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
            'locate':'<line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><circle cx="12" cy="12" r="7"/>'
          },
          math: {
            'plus':'<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
            'minus':'<line x1="5" y1="12" x2="19" y2="12"/>',
            'x':'<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
            'divide':'<circle cx="12" cy="6" r="1"/><line x1="5" y1="12" x2="19" y2="12"/><circle cx="12" cy="18" r="1"/>',
            'percent':'<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
            'calculator':'<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8.01" y2="10"/><line x1="12" y1="10" x2="12.01" y2="10"/><line x1="16" y1="10" x2="16.01" y2="10"/><line x1="8" y1="14" x2="8.01" y2="14"/><line x1="12" y1="14" x2="12.01" y2="14"/><line x1="16" y1="14" x2="16.01" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/><line x1="16" y1="18" x2="16.01" y2="18"/>'
          },
          medical: {
            'heart-pulse':'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l1.5-1.5 2 2.5 1.5-2 1.5 2h5.27"/>',
            'pill':'<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
            'thermometer':'<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>',
            'stethoscope':'<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>'
          },
          nature: {
            'leaf':'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
            'mountain':'<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
            'waves':'<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
            'sun':'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
            'flower':'<path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3H9m7.5 0H15m-3 4.5V15"/><circle cx="12" cy="12" r="3"/>'
          },
          notifications: {
            'bell':'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
            'bell-off':'<path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5"/><path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><line x1="2" y1="2" x2="22" y2="22"/>',
            'alert-circle':'<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
            'info':'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'
          },
          people: {
            'users':'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
            'user-plus':'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>',
            'user-minus':'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="22" y1="11" x2="16" y2="11"/>',
            'contact':'<path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2"/><rect x="3" y="4" width="18" height="18" rx="2"/><circle cx="12" cy="10" r="2"/><line x1="8" y1="2" x2="8" y2="4"/><line x1="16" y1="2" x2="16" y2="4"/>'
          },
          shopping: {
            'shopping-cart':'<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
            'shopping-bag':'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
            'gift':'<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
            'tag':'<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
            'percent':'<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>'
          },
          sports: {
            'dumbbell':'<path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/>',
            'bike':'<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
            'trophy':'<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
            'timer':'<line x1="10" y1="2" x2="14" y2="2"/><line x1="12" y1="14" x2="12" y2="8"/><path d="M4.93 4.93A10 10 0 1 0 19.07 4.93"/>'
          },
          time: {
            'clock':'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
            'alarm-clock':'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/>',
            'calendar':'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
            'hourglass':'<path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
            'timer-reset':'<path d="M10 2h4M12 14v-4M4.93 4.93A10 10 0 1 0 16 4.05"/>'
          },
          tools: {
            'wrench':'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
            'hammer':'<path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91"/>',
            'settings-2':'<path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
            'ruler':'<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"/>',
            'pipette':'<path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/>'
          },
          transportation: {
            'car':'<path d="M19 17H5"/><path d="M15 5H9l-3 8h12l-3-8z"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>',
            'truck':'<path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a1 1 0 0 1 1 1v3"/><rect x="9" y="11" width="14" height="10" rx="1"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>',
            'plane':'<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
            'train':'<rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16M12 3v8"/><circle cx="8.5" cy="19" r="1.5"/><path d="m9.5 19 5 0"/><circle cx="15.5" cy="19" r="1.5"/>',
            'bike':'<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>'
          },
          travel: {
            'luggage':'<path d="M6 20a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2"/><path d="M8 18V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14"/><path d="M10 20h4"/><circle cx="16" cy="20" r="2"/><circle cx="8" cy="20" r="2"/>',
            'camera':'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
            'ticket':'<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>',
            'hotel':'<path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/><path d="m9 16 .348-.24c1.465-1.013 3.84-1.013 5.304 0L15 16"/><path d="M8 7h.01M16 7h.01M12 7h.01M12 11h.01M8 11h.01M16 11h.01"/>',
            'map-pin':'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'
          }
        };
        // _LUCIDE_DATA_PLACEHOLDER above kept only as reference — primary source is _lucideTags

        // _lucideTags shape: { categoryName: [iconName, ...] }  (from /api/lucide/tags → categories.json)
        // Build a names list for a category
        function getNamesForCategory(category) {
          var names = _lucideTags[category];
          return Array.isArray(names) ? names.slice().sort() : [];
        }

        function renderIconGrid(category, query) {
          var grid    = document.getElementById('iconGrid');
          var loading = document.getElementById('iconLoading');
          if (!grid) { return; }

          // Tags not loaded yet — show spinner and request them
          if (!Object.keys(_lucideTags).length) {
            if (loading) { loading.style.display = 'block'; }
            grid.innerHTML = '';
            if (window.vscodeApi) { window.vscodeApi.postMessage({ command: 'fetchLucideTags' }); }
            return;
          }

          if (loading) { loading.style.display = 'none'; }
          grid.innerHTML = '';
          _pendingCells  = {};

          var names;
          if (query) {
            var q = query.toLowerCase();
            var allNames = {};
            Object.keys(_lucideTags).forEach(function(cat) {
              (_lucideTags[cat] || []).forEach(function(n) { allNames[n] = true; });
            });
            names = Object.keys(allNames).filter(function(n){ return n.indexOf(q) !== -1; }).sort();
          } else {
            names = getNamesForCategory(category);
          }

          if (!names.length) {
            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;font-size:10px;color:#555;padding:8px 0;">No icons found</div>';
            return;
          }

          names.forEach(function(name) {
            var cell = document.createElement('div');
            cell.title = name; cell.dataset.iconName = name;
            cell.style.cssText = 'display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:4px;cursor:pointer;background:rgba(255,255,255,0.05);border:1px solid '+(name===_selectedIconName?'#38BDF8':'transparent')+';';

            var inner = _svgCache[name] || null;
            cell.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">'+(inner||'')+'</svg>';

            if (!inner) {
              if (!_pendingCells[name]) { _pendingCells[name] = []; }
              _pendingCells[name].push(cell);
              if (window.vscodeApi) { window.vscodeApi.postMessage({ command: 'fetchLucideIcon', name: name }); }
            }

            cell.addEventListener('pointerdown', function(ev) {
              if (ev.button !== 0) { return; }
              grid.querySelectorAll('[data-icon-name]').forEach(function(c){ c.style.borderColor = 'transparent'; });
              cell.style.borderColor = '#38BDF8';
              _selectedIconName = name;
              var svgInner = _svgCache[name] || '';
              if (window.vscodeApi) {
                window.vscodeApi.postMessage({ command: 'iconDragStart', name: name, svgInner: svgInner, props: getIconProps() });
              }
            });
            grid.appendChild(cell);
          });
        }

        function refreshIconGrid() {
          var catEl=document.getElementById('iconCategory');
          var srchEl=document.getElementById('iconSearch');
          renderIconGrid(catEl?catEl.value:'arrows', srchEl?srchEl.value:'');
        }

        // ── getIconProps / syncIconProps ──────────────────────────────
        function getIconProps() {
          var panel = document.querySelector('#panel-canvas .cv-opts-panel[data-opts="icon"]');
          if (!panel) { return {}; }
          var fillTog   = panel.querySelector('.cv-icon-fill-toggle');
          var fillOn    = fillTog ? fillTog.checked : true;
          var colorEl   = panel.querySelector('#iconColor');
          var color     = fillOn ? (colorEl ? colorEl.style.background : '#000000') : 'none';
          var colorOp   = parseFloat((panel.querySelector('#iconColorOpacity')||{}).value||'100')/100;
          var w         = parseFloat((panel.querySelector('#iconW')||{}).value||'48');
          var h         = parseFloat((panel.querySelector('#iconH')||{}).value||'48');
          var stTog     = panel.querySelector('.cv-icon-stroke-toggle');
          var shTog     = panel.querySelector('.cv-icon-shadow-toggle');
          var stOn      = stTog&&stTog.checked;
          var shOn      = shTog&&shTog.checked;
          var stColEl   = panel.querySelector('#iconStrokeColor');
          var shColEl   = panel.querySelector('#iconShadowColor');
          return {
            color: color, colorOpacity: colorOp, w: w, h: h,
            stroke: stOn ? { color:(stColEl?stColEl.style.background:'#000000'), weight:parseFloat((panel.querySelector('#iconStrokeWeight')||{}).value||'1') } : null,
            shadow: shOn ? { color:(shColEl?shColEl.style.background:'#000000'), offset:parseFloat((panel.querySelector('.cv-shadow-offset')||{}).value||'2'), feather:parseFloat((panel.querySelector('.cv-shadow-feather')||{}).value||'4') } : null
          };
        }

        function syncIconProps() {
          if (!window.vscodeApi) { return; }
          window.vscodeApi.postMessage({ command:'iconProps', props:getIconProps() });
        }

        // Wire icon panel
        (function() {
          var iconPanel = document.querySelector('#panel-canvas .cv-opts-panel[data-opts="icon"]');
          if (!iconPanel) { return; }
          iconPanel.addEventListener('input',  syncIconProps);
          iconPanel.addEventListener('change', syncIconProps);

          var catEl  = document.getElementById('iconCategory');
          var srchEl = document.getElementById('iconSearch');
          if (catEl)  { catEl.addEventListener('change', refreshIconGrid); }
          if (srchEl) {
            srchEl.addEventListener('input', function() {
              clearTimeout(_iconSearchTimer);
              _iconSearchTimer = setTimeout(refreshIconGrid, 200);
            });
          }

          // Stroke / Shadow toggles fire syncIconProps (fields always visible, toggle controls application)

          // Aspect lock
          var wEl=iconPanel.querySelector('#iconW'), hEl=iconPanel.querySelector('#iconH'), lockBtn=iconPanel.querySelector('#iconAspectLock');
          if (wEl&&hEl&&lockBtn) {
            lockBtn.addEventListener('click', function(){ lockBtn.classList.toggle('active'); });
            wEl.addEventListener('input', function(){ if(lockBtn.classList.contains('active')){hEl.value=wEl.value;} });
            hEl.addEventListener('input', function(){ if(lockBtn.classList.contains('active')){wEl.value=hEl.value;} });
          }

          // Auto-load grid when panel first activates
          var loaded = false;
          var obs = new MutationObserver(function(){
            if (iconPanel.classList.contains('active') && !loaded) {
              loaded = true;
              if (Object.keys(_lucideTags).length) {
                refreshIconGrid();   // tags already arrived — render immediately
              } else if (window.vscodeApi) {
                document.getElementById('iconLoading') && (document.getElementById('iconLoading').style.display = 'block');
                window.vscodeApi.postMessage({ command: 'fetchLucideTags' });
              }
            }
          });
          obs.observe(iconPanel, { attributes:true, attributeFilter:['class'] });
        })();

        // ══════════════════════════════════════════════════════════════
        // IMAGE PANEL
        // ══════════════════════════════════════════════════════════════

        var _imgSrc     = null;     // base64 data URL of current image

        // ── getImageProps ─────────────────────────────────────────────
        function getImageProps() {
          var panel = document.querySelector('#panel-canvas .cv-opts-panel[data-opts="image"]');
          if (!panel) { return {}; }

          var activeAi = panel.querySelector('.cv-img-ai-btn.active');
          var aiTool   = activeAi ? activeAi.getAttribute('data-ai') : null;

          var wEl = panel.querySelector('#imgW');
          var hEl = panel.querySelector('#imgH');
          var rEl = panel.querySelector('#imgR');
          var w   = wEl ? (parseFloat(wEl.value) || null) : null;
          var h   = hEl ? (parseFloat(hEl.value) || null) : null;
          var r   = rEl ? (parseFloat(rEl.value) || 0)    : 0;

          var shTog    = panel.querySelector('.cv-img-shadow-toggle');
          var shOn     = shTog && shTog.checked;
          var shColEl  = panel.querySelector('#imgShadowColor');
          var shFields = panel.querySelectorAll('.cv-shadow-row .cv-input');
          var shAlphaEl = panel.querySelector('.cv-shadow-opacity');

          return {
            mode    : 'free',
            src     : _imgSrc,
            aiTool  : aiTool,
            w       : w,
            h       : h,
            r       : r,
            shadow  : shOn ? {
              color   : shColEl ? (shColEl.style.background || '#000000') : '#000000',
              size    : shFields[0] ? parseFloat(shFields[0].value) : 0,
              offset  : shFields[1] ? parseFloat(shFields[1].value) : 2,
              feather : shFields[2] ? parseFloat(shFields[2].value) : 4,
              opacity : shAlphaEl  ? parseFloat(shAlphaEl.value) / 100 : 0.75
            } : null
          };
        }

        function syncImageProps() {
          if (!window.vscodeApi) { return; }
          window.vscodeApi.postMessage({ command: 'imageProps', props: getImageProps() });
        }

        // ── Wire image panel ──────────────────────────────────────────
        (function () {
          var imgPanel = document.querySelector('#panel-canvas .cv-opts-panel[data-opts="image"]');
          if (!imgPanel) { return; }

          // General input/change → sync
          imgPanel.addEventListener('input',  syncImageProps);
          imgPanel.addEventListener('change', syncImageProps);

          // Shadow toggle → red-slash on swatch
          var shTog = imgPanel.querySelector('.cv-img-shadow-toggle');
          if (shTog) {
            shTog.addEventListener('change', function () {
              var swatch = imgPanel.querySelector('#imgShadowColor');
              if (swatch) { swatch.classList.toggle('cv-shadow-on', shTog.checked); }
              syncImageProps();
            });
          }

          // Shadow swatch click → open colour picker
          var shSwatch = imgPanel.querySelector('#imgShadowColor');
          if (shSwatch) {
            shSwatch.addEventListener('click', function () {
              var picker = shSwatch.parentElement.querySelector('.cv-hidden-color');
              if (picker) { picker.click(); }
            });
          }

          // AI tool buttons — single active (click again to deselect)
          imgPanel.querySelectorAll('.cv-img-ai-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
              var wasActive = btn.classList.contains('active');
              imgPanel.querySelectorAll('.cv-img-ai-btn').forEach(function (b) { b.classList.remove('active'); });
              if (!wasActive) { btn.classList.add('active'); }
              syncImageProps();
            });
          });

          // Import button → freestanding image, no shape uid
          var importBtn = document.getElementById('imgImportBtn');
          if (importBtn) {
            importBtn.addEventListener('click', function () {
              if (window.vscodeApi) {
                window.vscodeApi.postMessage({ command: 'imagePickFile' });
              }
            });
          }
        })();

        // ── Wire shape image-fill buttons (rect / ellipse / polygon panels) ──
        (function () {
          document.querySelectorAll('#panel-canvas .cv-img-btn[data-shape-fill]').forEach(function (btn) {
            btn.addEventListener('click', function () {
              if (!window.vscodeApi) { return; }
              var shapeType = btn.getAttribute('data-shape-fill'); // 'rect' | 'ellipse' | 'polygon'
              // Find the currently selected shape of this type from the layers list
              var uid = null;
              var match = _currentLayers.filter(function (l) { return l.type === shapeType && l.selected; })[0];
              if (match) { uid = match.uid; }
              window.vscodeApi.postMessage({ command: 'shapeFillPickFile', uid: uid, shadow: null });
            });
          });
        })();

        var _layerDragUid   = null;
        var _layerDragY     = 0;
        var _layerPointerY  = 0;
        var _currentLayers  = [];

        function layerTypeIcon(type) {
          if (type === 'rect')    return '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" width="13" height="13"><rect x="1" y="2" width="12" height="10" rx="1"/></svg>';
          if (type === 'ellipse') return '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" width="13" height="13"><ellipse cx="7" cy="7" rx="5.5" ry="4.5"/></svg>';
          if (type === 'polygon') return '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" width="13" height="13"><polygon points="7,1 13,5 13,10 7,13 1,10 1,5"/></svg>';
          if (type === 'line')    return '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><line x1="1" y1="13" x2="13" y2="1"/></svg>';
          if (type === 'pen')     return '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" width="13" height="13"><path d="M2 12 L5 9 L10 3 L11 5 L5 9"/><circle cx="11" cy="3" r="1.5" fill="currentColor" stroke="none"/></svg>';
          if (type === 'bezier')  return '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" width="13" height="13"><path d="M2 12 C3 6, 10 6, 12 2" stroke-linecap="round"/><circle cx="2" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="2" r="1.5" fill="currentColor" stroke="none"/></svg>';
          if (type === 'text')    return '<svg viewBox="0 0 14 14" fill="currentColor" width="13" height="13"><path d="M1 2h12v2H8v8H6V4H1V2z"/></svg>';
          if (type === 'icon')    return '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" width="13" height="13"><circle cx="7" cy="6" r="3"/><path d="M4 11c0-1.7 1.3-3 3-3s3 1.3 3 3"/></svg>';
          if (type === 'image')   return '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" width="13" height="13"><rect x="1" y="2" width="12" height="10" rx="1"/><circle cx="4.5" cy="5.5" r="1"/><polyline points="1,10 4,7 6.5,9.5 9,7 13,11"/></svg>';
          return '';
        }

        function clearDropIndicators() {
          document.querySelectorAll('#cvLayersList .cv-layer-drop-indicator').forEach(function(el) {
            el.style.display = 'none';
          });
        }

        function showDropIndicatorAt(y) {
          clearDropIndicators();
          var list = document.getElementById('cvLayersList');
          if (!list) { return null; }
          var rows = Array.from(list.querySelectorAll('.cv-layer-row'));
          if (rows.length === 0) { return null; }

          // Find which row the pointer is over, or if it's past the last
          for (var i = 0; i < rows.length; i++) {
            var r = rows[i].getBoundingClientRect();
            var mid = r.top + r.height / 2;
            // Above midpoint of this row → insert before it
            if (y < mid) {
              var ind = document.getElementById('ind-before-' + rows[i].dataset.uid);
              if (ind) { ind.style.display = 'block'; }
              return { targetUid: rows[i].dataset.uid, position: 'before' };
            }
            // Below midpoint but within this row → insert after it
            if (y < r.bottom) {
              var ind = document.getElementById('ind-after-' + rows[i].dataset.uid);
              if (ind) { ind.style.display = 'block'; }
              return { targetUid: rows[i].dataset.uid, position: 'after' };
            }
          }
          // Below all rows → insert after the last row
          var lastRow = rows[rows.length - 1];
          var ind = document.getElementById('ind-after-' + lastRow.dataset.uid);
          if (ind) { ind.style.display = 'block'; }
          return { targetUid: lastRow.dataset.uid, position: 'after' };
        }

        var _renamingUid = null; // guard: don't rebuild list while renaming

        function buildLayerRow(layer) {
          var row = document.createElement('div');
          row.className = 'cv-layer-row' + (layer.selected ? ' selected' : '');
          row.dataset.uid = layer.uid;
          row.innerHTML =
            '<div class="cv-layer-drag" title="Drag to reorder">' +
              '<svg viewBox="0 0 10 14" fill="currentColor" width="8" height="11"><circle cx="3" cy="3" r="1.2"/><circle cx="7" cy="3" r="1.2"/><circle cx="3" cy="7" r="1.2"/><circle cx="7" cy="7" r="1.2"/><circle cx="3" cy="11" r="1.2"/><circle cx="7" cy="11" r="1.2"/></svg>' +
            '</div>' +
            '<div class="cv-layer-icon">' + layerTypeIcon(layer.type) + '</div>' +
            '<span class="cv-layer-name" title="Click when selected to rename">' + layer.name + '</span>' +
            '<button class="cv-layer-del" title="Delete">✕</button>';

          var nameEl = row.querySelector('.cv-layer-name');

          // ── Click: select on first click, rename on click of already-selected row ──
          row.addEventListener('click', function(e) {
            if (e.target.closest('.cv-layer-drag')) { return; }
            if (e.target.classList.contains('cv-layer-del')) { return; }
            if (_renamingUid === layer.uid) { return; } // already renaming this row

            if (row.classList.contains('selected')) {
              // Second click on already-selected row → open rename
              openRename();
            } else {
              // First click → select
              if (window.vscodeApi) { window.vscodeApi.postMessage({ command: 'selectObject', uid: layer.uid }); }
            }
          });

          function openRename() {
            if (_renamingUid) { return; }
            _renamingUid = layer.uid;
            var currentName = nameEl.textContent;
            var input = document.createElement('input');
            input.type = 'text';
            input.className = 'cv-layer-name-input';
            input.value = currentName;
            nameEl.style.display = 'none';
            nameEl.parentNode.insertBefore(input, nameEl.nextSibling);
            // Defer focus so webview event loop settles
            setTimeout(function() { input.focus(); input.select(); }, 20);
            var committed = false;
            function commitRename() {
              if (committed) { return; }
              committed = true;
              _renamingUid = null;
              var newName = input.value.trim() || currentName;
              nameEl.textContent = newName;
              nameEl.style.display = '';
              if (input.parentNode) { input.parentNode.removeChild(input); }
              if (window.vscodeApi) { window.vscodeApi.postMessage({ command: 'renameObject', uid: layer.uid, name: newName }); }
              layer.name = newName;
            }
            function cancelRename() {
              if (committed) { return; }
              committed = true;
              _renamingUid = null;
              nameEl.style.display = '';
              if (input.parentNode) { input.parentNode.removeChild(input); }
            }
            input.addEventListener('blur', commitRename);
            input.addEventListener('keydown', function(ev) {
              ev.stopPropagation();
              if (ev.key === 'Enter')  { ev.preventDefault(); input.blur(); }
              if (ev.key === 'Escape') { ev.preventDefault(); cancelRename(); }
            });
            // Swallow click on the input so it doesn't trigger row.click → openRename again
            input.addEventListener('click', function(ev) { ev.stopPropagation(); });
          }

          // ── Delete button ──────────────────────────────────────
          row.querySelector('.cv-layer-del').addEventListener('click', function(e) {
            e.stopPropagation();
            if (window.vscodeApi) { window.vscodeApi.postMessage({ command: 'deleteObject', uid: layer.uid }); }
          });

          // ── Pointer-based drag on the drag handle only ─────────
          var handle = row.querySelector('.cv-layer-drag');
          handle.addEventListener('pointerdown', function(e) {
            if (e.button !== 0) { return; }
            e.preventDefault();
            e.stopPropagation();
            handle.setPointerCapture(e.pointerId);
            _layerDragUid = layer.uid;
            _layerPointerY = e.clientY;
            row.classList.add('dragging');

            function onMove(ev) {
              showDropIndicatorAt(ev.clientY);
            }
            function onUp(ev) {
              handle.removeEventListener('pointermove', onMove);
              handle.removeEventListener('pointerup',   onUp);
              row.classList.remove('dragging');
              clearDropIndicators();
              var drop = showDropIndicatorAt(ev.clientY);
              clearDropIndicators();
              if (drop && drop.targetUid !== layer.uid && window.vscodeApi) {
                window.vscodeApi.postMessage({ command: 'reorderObject', uid: layer.uid, targetUid: drop.targetUid, position: drop.position });
              }
              _layerDragUid = null;
            }
            handle.addEventListener('pointermove', onMove);
            handle.addEventListener('pointerup',   onUp);
          });

          // Wrap with drop indicators
          var wrap = document.createElement('div');
          var indBefore = document.createElement('div');
          indBefore.className = 'cv-layer-drop-indicator';
          indBefore.id = 'ind-before-' + layer.uid;
          var indAfter = document.createElement('div');
          indAfter.className = 'cv-layer-drop-indicator';
          indAfter.id = 'ind-after-' + layer.uid;
          wrap.appendChild(indBefore);
          wrap.appendChild(row);
          wrap.appendChild(indAfter);
          return wrap;
        }

        function updateLayersList(layers) {
          if (_renamingUid) { return; } // don't rebuild while user is typing a name
          _currentLayers = layers || [];
          var list = document.getElementById('cvLayersList');
          if (!list) { return; }
          list.innerHTML = '';
          if (!_currentLayers.length) {
            list.innerHTML = '<div class="cv-layers-empty">No objects on canvas</div>';
            return;
          }
          _currentLayers.forEach(function(layer) {
            list.appendChild(buildLayerRow(layer));
          });
        }

        // Listen for layersUpdate from drawing canvas (via provider)
        window.addEventListener('message', function(e) {
          var msg = e.data;
          if (!msg || !msg.command) { return; }
          if (msg.command === 'layersUpdate') {
            updateLayersList(msg.layers);
          }
          if (msg.command === 'toolModeChanged') {
            var tool = msg.tool;
            var tb = document.getElementById('cvToolbar');
            if (tb) {
              tb.querySelectorAll('.cv-tool').forEach(function(b){ b.classList.remove('active'); });
              var activeBtn = tb.querySelector('.cv-tool[data-tool="' + tool + '"]');
              if (activeBtn) { activeBtn.classList.add('active'); }
            }
            var panels = document.querySelectorAll('#panel-canvas .cv-opts-panel');
            panels.forEach(function(p){ p.classList.toggle('active', p.dataset.opts === tool); });
          }
          // ── Image: file resolved by extension host ────────────────
          if (msg.command === 'imageReady') {
            _imgSrc = msg.src || null;
            var wEl      = document.getElementById('imgW');
            var hEl      = document.getElementById('imgH');
            var rEl      = document.getElementById('imgR');
            var nameEl   = document.getElementById('imgFileName');
            var nameRow  = document.getElementById('imgFileNameRow');
            if (wEl) { wEl.value = msg.w || ''; }
            if (hEl) { hEl.value = msg.h || ''; }
            if (rEl) { rEl.value = '0'; }
            if (nameEl)  { nameEl.textContent = msg.fileName || ''; }
            if (nameRow) { nameRow.style.display = msg.fileName ? '' : 'none'; }
            syncImageProps();
          }
          // ── Shape fill: file resolved — show filename in shape panel ─
          // ── Image: placed on canvas — update W/H fields to actual dimensions ─
          if (msg.command === 'imagePlaced') {
            var wEl = document.getElementById('imgW');
            var hEl = document.getElementById('imgH');
            if (wEl) { wEl.value = Math.round(msg.w) || ''; }
            if (hEl) { hEl.value = Math.round(msg.h) || ''; }
          }
          if (msg.command === 'ellipseResized') {
            var wEl = document.getElementById('ellW');
            var hEl = document.getElementById('ellH');
            if (wEl) { wEl.value = Math.round(msg.w) || ''; }
            if (hEl) { hEl.value = Math.round(msg.h) || ''; }
          }
          if (msg.command === 'ellipseSelected') {
            var wEl = document.getElementById('ellW');
            var hEl = document.getElementById('ellH');
            if (wEl) { wEl.value = Math.round(msg.w) || ''; }
            if (hEl) { hEl.value = Math.round(msg.h) || ''; }
          }
          if (msg.command === 'rectSelected' || msg.command === 'rectResized') {
            var wEl = document.getElementById('rectW');
            var hEl = document.getElementById('rectH');
            if (wEl) { wEl.value = Math.round(msg.w) || ''; }
            if (hEl) { hEl.value = Math.round(msg.h) || ''; }
          }
          if (msg.command === 'polySelected' || msg.command === 'polyResized') {
            var wEl = document.getElementById('polyW');
            var hEl = document.getElementById('polyH');
            if (wEl) { wEl.value = Math.round(msg.w) || ''; }
            if (hEl) { hEl.value = Math.round(msg.h) || ''; }
          }
          if (msg.command === 'shapeFillReady') {
            // The canvas receives this directly from extension host and applies it.
            // Sidebar just updates the Choose Image button text as confirmation.
            var fillBtn = document.querySelector('.cv-img-btn[data-shape-fill="' + (msg.shapeType || '') + '"]');
            // No-op for now — canvas handles the fill; button label stays "Choose Image"
          }

          // ── Lucide categories arrived from extension host ──
          if (msg.command === 'lucideTags') {
            _lucideTags = msg.tags || {};
            // Categories are the top-level keys of categories.json
            var cats = Object.keys(_lucideTags).sort();
            var catEl = document.getElementById('iconCategory');
            if (catEl) {
              catEl.innerHTML = '';
              cats.forEach(function(cat, i) {
                var opt = document.createElement('option');
                opt.value = cat; opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
                if (i === 0) { opt.selected = true; }
                catEl.appendChild(opt);
              });
            }
            var loading = document.getElementById('iconLoading');
            if (loading) { loading.style.display = 'none'; }
            refreshIconGrid();
          }
          // ── Single icon SVG arrived from extension host ──
          if (msg.command === 'lucideIcon') {
            var name   = msg.name;
            var inner  = msg.svgInner || '';
            _svgCache[name] = inner;
            // Fill any pending cells currently in the grid
            if (_pendingCells[name]) {
              _pendingCells[name].forEach(function(cell) {
                var svg = cell.querySelector('svg');
                if (svg) { svg.innerHTML = inner; }
              });
              delete _pendingCells[name];
            }
          }
        });

      })();
    </script>`;
}