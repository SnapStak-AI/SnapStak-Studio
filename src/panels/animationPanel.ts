export function getAnimationPanel(): string {
  return /* html */`
    <div class="tab-panel" id="panel-animation">
    <style>
      .anim-engine { display:flex; flex-direction:column; height:100%; overflow:hidden; }
      .anim-type-bar { display:grid; grid-template-columns:repeat(4,1fr); gap:4px; padding:8px 8px 4px; flex-shrink:0; }
      .anim-type-btn { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; padding:8px 4px; border:1px solid #555; border-radius:6px; background:#2a2a2a; color:#aaa; font-size:10px; font-weight:600; cursor:pointer; transition:all 0.2s; text-transform:uppercase; letter-spacing:0.4px; }
      .anim-type-btn svg { width:16px; height:16px; }
      .anim-type-btn:hover { background:#3a3a3a; border-color:#666; color:#fff; }
      .anim-type-btn.active { background:#38BDF8; border-color:#38BDF8; color:#fff; }
      .anim-settings { flex:1; overflow-y:auto; padding:0 8px 8px; scrollbar-width:none; }
      .anim-settings::-webkit-scrollbar { display:none; }
      .anim-section { background:#1e1e1e; border:1px solid #333; border-radius:6px; padding:8px; margin-bottom:6px; }
      .anim-section-title { font-size:11px; font-weight:600; color:#888; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:8px; }
      .anim-custom-select { position:relative; width:100%; }
      .anim-select-trigger { display:flex; align-items:center; justify-content:space-between; height:34px; background:#2a2a2a; border:1px solid #555; border-radius:4px; color:#eee; font-size:12px; padding:0 10px; cursor:pointer; transition:border-color 0.15s; user-select:none; }
      .anim-select-trigger:hover { border-color:#777; }
      .anim-custom-select.open .anim-select-trigger { border-color:#38BDF8; border-bottom-left-radius:0; border-bottom-right-radius:0; }
      .anim-select-dropdown { display:none; position:absolute; top:100%; left:0; right:0; background:#2a2a2a; border:1px solid #38BDF8; border-top:none; border-bottom-left-radius:4px; border-bottom-right-radius:4px; z-index:999; max-height:220px; overflow-y:auto; }
      .anim-custom-select.open .anim-select-dropdown { display:block; }
      .anim-select-option { padding:7px 10px; font-size:12px; color:#eee; cursor:pointer; }
      .anim-select-option:hover { background:rgba(56,189,248,0.2); color:#fff; border-left:2px solid #0284c7; padding-left:8px; }
      .anim-select-option.selected { background:#0284c7; color:#fff; }
      .anim-toggle-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
      .anim-toggle-row:last-child { margin-bottom:0; }
      .anim-toggle-label { font-size:11px; color:#ccc; }
      .anim-toggle { position:relative; width:36px; height:20px; flex-shrink:0; }
      .anim-toggle input { opacity:0; width:0; height:0; }
      .anim-toggle-track { position:absolute; inset:0; background:#3a3a3a; border:1px solid #555; border-radius:10px; cursor:pointer; transition:all 0.2s; }
      .anim-toggle input:checked + .anim-toggle-track { background:#38BDF8; border-color:#38BDF8; }
      .anim-toggle-track::after { content:''; position:absolute; top:2px; left:2px; width:14px; height:14px; background:#fff; border-radius:50%; transition:transform 0.2s; }
      .anim-toggle input:checked + .anim-toggle-track::after { transform:translateX(16px); }
      .anim-range-label { display:flex; justify-content:space-between; font-size:11px; color:#ccc; margin-bottom:4px; }
      .anim-range { width:100%; height:4px; border-radius:2px; background:#3a3a3a; outline:none; cursor:pointer; -webkit-appearance:none; margin-bottom:8px; }
      .anim-range:last-child { margin-bottom:0; }
      .anim-range::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; border-radius:50%; background:#38BDF8; cursor:pointer; }
      .anim-btn-row { display:flex; gap:6px; margin-top:4px; }
      .anim-btn { flex:1; height:32px; border:none; border-radius:4px; font-size:11px; font-weight:600; cursor:pointer; transition:all 0.2s; }
      .anim-btn-primary { background:#38BDF8; color:#fff; }
      .anim-btn-primary:hover { background:#0284c7; }
      .anim-btn-secondary { background:#2a2a2a; border:1px solid #555; color:#ccc; }
      .anim-btn-secondary:hover { background:#3a3a3a; color:#fff; }
      .anim-output-row { display:flex; align-items:center; gap:8px; }
      .anim-output-label { font-size:11px; color:#ccc; flex:1; }
      .anim-output-pill { display:flex; background:#2a2a2a; border:1px solid #555; border-radius:20px; overflow:hidden; }
      .anim-output-pill button { padding:4px 10px; font-size:10px; font-weight:700; border:none; background:transparent; color:#888; cursor:pointer; transition:all 0.15s; }
      .anim-output-pill button.active { background:#38BDF8; color:#fff; }
      .anim-preview { background:#fff; border-radius:4px; min-height:120px; display:flex; align-items:center; justify-content:center; overflow:hidden; cursor:pointer; }
      .preview-card-demo { background:#f8f8f8; border:1px solid #e5e7eb; border-radius:8px; padding:12px; width:160px; transform-origin:center center; }
      .preview-card-demo h4 { font-size:11px; font-weight:600; color:#111; margin:0 0 4px; }
      .preview-progress { height:4px; background:#e5e7eb; border-radius:2px; }
      .preview-progress-bar { height:100%; width:75%; background:linear-gradient(90deg,#3b82f6,#8b5cf6); border-radius:2px; }
      .anim-code-output { background:#0d0d0d; border:1px solid #333; border-radius:4px; padding:8px; font-family:'Courier New',monospace; font-size:10px; color:#9cdcfe; white-space:pre-wrap; word-break:break-all; max-height:140px; overflow-y:auto; display:none; }
      .anim-code-output.visible { display:block; }
    </style>

    <div class="anim-engine">
      <div class="anim-type-bar">
        <button class="anim-type-btn active" data-type="container">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="10" height="4" rx="1"/></svg>
          Container
        </button>
        <button class="anim-type-btn" data-type="image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          Image
        </button>
        <button class="anim-type-btn" data-type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 14a8 8 0 0 1-8 8m4-11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2m0 0V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1m0-.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
          Button
        </button>
        <button class="anim-type-btn" data-type="text">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
          Text
        </button>
      </div>

      <div class="anim-settings">
        <div class="anim-section">
          <div class="anim-section-title">Select Animation</div>
          <div class="anim-custom-select" id="animSelectWrap">
            <div class="anim-select-trigger" id="animSelectTrigger">
              <span id="animSelectLabel">Select...</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="#aaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <div class="anim-select-dropdown" id="animSelectDropdown"></div>
          </div>
          <input type="hidden" id="animSelect" value="">
        </div>
        <div class="anim-section">
          <div class="anim-section-title">Triggers</div>
          <div class="anim-toggle-row"><span class="anim-toggle-label">Mouse Enter</span><label class="anim-toggle"><input type="checkbox" id="trig-mouseEnter" checked><span class="anim-toggle-track"></span></label></div>
          <div class="anim-toggle-row"><span class="anim-toggle-label">Mouse Leave</span><label class="anim-toggle"><input type="checkbox" id="trig-mouseLeave" checked><span class="anim-toggle-track"></span></label></div>
          <div class="anim-toggle-row"><span class="anim-toggle-label">CSS Hover</span><label class="anim-toggle"><input type="checkbox" id="trig-hover"><span class="anim-toggle-track"></span></label></div>
          <div class="anim-toggle-row"><span class="anim-toggle-label">Scroll Into View</span><label class="anim-toggle"><input type="checkbox" id="trig-scroll"><span class="anim-toggle-track"></span></label></div>
          <div class="anim-toggle-row"><span class="anim-toggle-label">On Load</span><label class="anim-toggle"><input type="checkbox" id="trig-onLoad"><span class="anim-toggle-track"></span></label></div>
        </div>
        <div class="anim-section">
          <div class="anim-section-title">Settings</div>
          <div class="anim-range-label"><span>Duration</span><span id="durVal">1500ms</span></div>
          <input type="range" class="anim-range" id="animDuration" min="200" max="5000" step="100" value="1500">
          <div class="anim-range-label"><span>Delay</span><span id="delayVal">0ms</span></div>
          <input type="range" class="anim-range" id="animDelay" min="0" max="2000" step="100" value="0">
          <div class="anim-range-label" style="margin-top:4px"><span>Easing</span></div>
          <div class="anim-custom-select" id="animEasingWrap">
            <div class="anim-select-trigger" id="animEasingTrigger">
              <span id="animEasingLabel">Ease Out</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="#aaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <div class="anim-select-dropdown" id="animEasingDropdown"></div>
          </div>
          <input type="hidden" id="animEasing" value="ease-out">
        </div>
        <div class="anim-section" id="animSpecificSection" style="display:none">
          <div class="anim-section-title" id="animSpecificTitle">Animation Settings</div>
          <div id="animSpecificControls"></div>
        </div>
        <div class="anim-section">
          <div class="anim-output-row">
            <span class="anim-output-label">Output Format</span>
            <div class="anim-output-pill">
              <button id="outputCSS" class="active">CSS</button>
              <button id="outputJS">JS</button>
            </div>
          </div>
        </div>
        <div class="anim-section">
          <div class="anim-btn-row">
            <button class="anim-btn anim-btn-primary" id="applyAnimBtn">Apply</button>
            <button class="anim-btn anim-btn-secondary" id="copyCodeBtn">Copy Code</button>
          </div>
        </div>
        <div class="anim-section">
          <div class="anim-section-title">Preview <span style="color:#555;font-weight:400">(hover to test)</span></div>
          <div class="anim-preview" id="animPreview"></div>
        </div>
        <div class="anim-section">
          <div class="anim-section-title">Generated Code</div>
          <div class="anim-code-output" id="animCodeOutput"></div>
        </div>
      </div>
    </div>

    <script>
    window.animPanel = (function() {

      const NL = String.fromCharCode(10);

      let activeType = 'container';
      let outputMode = 'css';
      let animRef = null;
      let revRef  = null;

      const settings = {
        duration: 1500, easing: 'ease-out', delay: 0,
        liftHeight: 8, scaleAmount: 1.02, rotationAngle: 10,
        glowIntensity: 0.4, parallaxScale: 1.1,
        buttonColor: '#6b7280', animationColor: '#0ff'
      };

      const triggers = {
        mouseEnter: true, mouseLeave: true,
        hover: false, scrollView: false, onLoad: false
      };

      const ANIMATIONS = {
        container: {
          'hover-lift':      { name:'Hover Lift',     settings:['liftHeight','scaleAmount'],  generate:()=>([{time:0,transform:'translateY(0px) scale(1)'},{time:100,transform:\`translateY(-\${settings.liftHeight}px) scale(\${settings.scaleAmount})\`}]) },
          'slide-in':        { name:'Slide In',        settings:[],                            generate:()=>([{time:0,transform:'translateX(-100px)',opacity:'0'},{time:100,transform:'translateX(0px)',opacity:'1'}]) },
          'fade-scale':      { name:'Fade Scale',      settings:['scaleAmount'],               generate:()=>([{time:0,transform:'scale(0.8)',opacity:'0'},{time:100,transform:\`scale(\${settings.scaleAmount})\`,opacity:'1'}]) },
          'flip':            { name:'Flip Reveal',     settings:[],                            generate:()=>([{time:0,transform:'perspective(1000px) rotateY(0deg)'},{time:100,transform:'perspective(1000px) rotateY(180deg)'}]) },
          'stack-slide':     { name:'Stack Slide',     settings:[],                            generate:()=>([{time:0,transform:'translateY(20px) scale(0.95)',opacity:'0.7'},{time:100,transform:'translateY(0px) scale(1)',opacity:'1'}]) },
          'glow-pulse':      { name:'Glow Pulse',      settings:['glowIntensity'],             generate:()=>([{time:0,boxShadow:\`0 0 0 0 rgba(59,130,246,\${settings.glowIntensity})\`,transform:'scale(1)'},{time:50,boxShadow:'0 0 0 8px rgba(59,130,246,0.1)',transform:'scale(1.02)'},{time:100,boxShadow:\`0 0 0 0 rgba(59,130,246,\${settings.glowIntensity})\`,transform:'scale(1)'}]) },
          'tilt':            { name:'Tilt',            settings:['rotationAngle'],             generate:()=>([{time:0,transform:'perspective(1000px) rotateX(0deg) rotateY(0deg)'},{time:100,transform:\`perspective(1000px) rotateX(5deg) rotateY(\${settings.rotationAngle}deg)\`}]) },
          'expand':          { name:'Expand',          settings:['scaleAmount'],               generate:()=>([{time:0,transform:'scale(1)',borderRadius:'12px'},{time:100,transform:\`scale(\${settings.scaleAmount+0.08})\`,borderRadius:'20px'}]) },
          'morphing-border': { name:'Morphing Border', settings:[],                            generate:()=>([{time:0,transform:'perspective(400px) rotateX(0deg) scaleX(1) scaleY(1)'},{time:20,transform:'perspective(400px) rotateX(2deg) scaleX(1.05) scaleY(0.95)'},{time:50,transform:'perspective(400px) rotateX(-1deg) scaleX(0.95) scaleY(1.05)'},{time:80,transform:'perspective(400px) rotateX(2deg) scaleX(0.98) scaleY(1.02)'},{time:100,transform:'perspective(400px) rotateX(0deg) scaleX(1) scaleY(1)'}]) }
        },
        image: {
          'image-parallax':     { name:'Parallax Zoom', settings:['parallaxScale'], generate:()=>([{time:0,transform:'scale(1)'},{time:100,transform:\`scale(\${settings.parallaxScale})\`}]) },
          'image-reveal-clip':  { name:'Clip Reveal',   settings:[],               generate:()=>([{time:0,clipPath:'inset(0 100% 0 0)'},{time:100,clipPath:'inset(0 0% 0 0)'}]) },
          'image-ken-burns':    { name:'Ken Burns',      settings:['parallaxScale'], generate:()=>([{time:0,transform:'scale(1) translate(0px,0px)'},{time:100,transform:\`scale(\${settings.parallaxScale+0.1}) translate(10px,-10px)\`}]) },
          'image-glitch':       { name:'Glitch',         settings:[],               generate:()=>([{time:0,transform:'translateX(0px)',filter:'hue-rotate(0deg)'},{time:10,transform:'translateX(-5px)',filter:'hue-rotate(90deg)'},{time:20,transform:'translateX(5px)',filter:'hue-rotate(180deg)'},{time:30,transform:'translateX(-3px)',filter:'hue-rotate(270deg)'},{time:40,transform:'translateX(3px)',filter:'hue-rotate(360deg)'},{time:100,transform:'translateX(0px)',filter:'hue-rotate(0deg)'}]) },
          'image-mask-wipe':    { name:'Mask Wipe',      settings:[],               generate:()=>([{time:0,clipPath:'circle(0% at 50% 50%)'},{time:100,clipPath:'circle(100% at 50% 50%)'}]) },
          'image-3d-flip':      { name:'3D Flip',        settings:[],               generate:()=>([{time:0,transform:'perspective(1000px) rotateY(0deg)'},{time:50,transform:'perspective(1000px) rotateY(90deg)'},{time:100,transform:'perspective(1000px) rotateY(180deg)'}]) },
          'image-liquid-morph': { name:'Liquid Morph',   settings:[],               generate:()=>([{time:0,borderRadius:'0%'},{time:25,borderRadius:'50% 0% 50% 0%'},{time:50,borderRadius:'0% 50% 0% 50%'},{time:75,borderRadius:'50%'},{time:100,borderRadius:'0%'}]) },
          'image-split-reveal': { name:'Split Reveal',   settings:[],               generate:()=>([{time:0,clipPath:'polygon(0% 0%, 0% 100%, 0% 100%, 0% 0%)'},{time:100,clipPath:'polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%)'}]) },
          'image-slice-slide':  { name:'Slice Slide',    settings:[],               generate:()=>([{time:0,transform:'translateX(-100%)',opacity:'0'},{time:100,transform:'translateX(0%)',opacity:'1'}]) }
        },
        button: {
          'button-neon':      { name:'Neon Glow',    cssClass:'btn-neon',      settings:['animationColor'],  generate:()=>([{time:0,transform:'scale(1)',boxShadow:\`0 0 20px \${settings.animationColor}\`},{time:50,transform:'scale(1.3)',boxShadow:\`0 0 80px \${settings.animationColor}\`},{time:100,transform:'scale(1)',boxShadow:\`0 0 20px \${settings.animationColor}\`}]) },
          'button-explosion': { name:'Explosive',    cssClass:'btn-explosion', settings:['animationColor'],  generate:()=>([{time:0,transform:'scale(1)'},{time:25,transform:'scale(1.6)'},{time:50,transform:'scale(0.6)'},{time:75,transform:'scale(1.4)'},{time:100,transform:'scale(1)'}]) },
          'button-liquid':    { name:'Liquid Morph', cssClass:'btn-liquid',    settings:['buttonColor','animationColor'], generate:()=>([{time:0,borderRadius:'30px',transform:'scale(1)'},{time:25,borderRadius:'0px',transform:'scale(1.1) rotate(15deg)'},{time:50,borderRadius:'50px',transform:'scale(0.7) rotate(-15deg)'},{time:75,borderRadius:'10px',transform:'scale(1.3) rotate(10deg)'},{time:100,borderRadius:'30px',transform:'scale(1) rotate(0deg)'}]) },
          'button-outline':   { name:'Fill Reveal',  cssClass:'btn-outline',   settings:['animationColor'],  generate:()=>([{time:0,transform:'scale(1)'},{time:50,transform:'scale(1.15)'},{time:100,transform:'scale(1)'}]) },
          'button-shake':     { name:'Shake It',     cssClass:'btn-shake',     settings:['buttonColor','animationColor'], generate:()=>([{time:0,transform:'translateX(0px)'},{time:15,transform:'translateX(-8px)'},{time:30,transform:'translateX(8px)'},{time:45,transform:'translateX(-6px)'},{time:60,transform:'translateX(6px)'},{time:75,transform:'translateX(-3px)'},{time:100,transform:'translateX(0px)'}]) },
          'button-lightning': { name:'Lightning',    cssClass:'btn-lightning', settings:['animationColor'],  generate:()=>([{time:0,opacity:'1',filter:'brightness(1)'},{time:10,opacity:'0.3',filter:'brightness(3)'},{time:20,opacity:'1',filter:'brightness(1)'},{time:30,opacity:'0.5',filter:'brightness(2)'},{time:40,opacity:'1',filter:'brightness(1)'},{time:100,opacity:'1',filter:'brightness(1)'}]) },
          'button-pulse':     { name:'Pulse Beat',   cssClass:'btn-pulse',     settings:['buttonColor','animationColor'], generate:()=>([{time:0,transform:'scale(1)',boxShadow:'0 0 0 0 rgba(56,189,248,0.5)'},{time:50,transform:'scale(1.05)',boxShadow:'0 0 0 10px rgba(56,189,248,0)'},{time:100,transform:'scale(1)',boxShadow:'0 0 0 0 rgba(56,189,248,0)'}]) },
          'button-blur':      { name:'Zoom Blur',    cssClass:'btn-blur',      settings:['buttonColor','animationColor'], generate:()=>([{time:0,transform:'scale(1)',filter:'blur(0px)'},{time:50,transform:'scale(1.2)',filter:'blur(4px)'},{time:100,transform:'scale(1)',filter:'blur(0px)'}]) },
          'button-morph':     { name:'Morph',        cssClass:'btn-morph',     settings:['buttonColor'],     generate:()=>([{time:0,transform:'scale(1)',borderRadius:'4px'},{time:50,transform:'scale(1.1) rotate(5deg)',borderRadius:'50px'},{time:100,transform:'scale(1)',borderRadius:'4px'}]) }
        },
        text: {
          'text-typewriter': { name:'Typewriter',   settings:[], generate:()=>([{time:0,width:'0%'},{time:100,width:'100%'}]) },
          'text-color':      { name:'Color Change', settings:[], generate:()=>([{time:0,color:'#111'},{time:50,color:'#38BDF8'},{time:100,color:'#111'}]) },
          'text-wave':       { name:'Wave',         settings:[], generate:()=>([{time:0,transform:'translateY(0px)'},{time:25,transform:'translateY(-8px)'},{time:75,transform:'translateY(8px)'},{time:100,transform:'translateY(0px)'}]) },
          'text-blur':       { name:'Blur In',      settings:[], generate:()=>([{time:0,filter:'blur(8px)',opacity:'0'},{time:100,filter:'blur(0px)',opacity:'1'}]) },
          'text-slide':      { name:'Slide Up',     settings:[], generate:()=>([{time:0,transform:'translateY(20px)',opacity:'0'},{time:100,transform:'translateY(0px)',opacity:'1'}]) },
          'text-bounce':     { name:'Bounce',       settings:[], generate:()=>([{time:0,transform:'scale(1)'},{time:30,transform:'scale(1.2)'},{time:60,transform:'scale(0.9)'},{time:100,transform:'scale(1)'}]) },
          'text-neon':       { name:'Neon Flicker', settings:[], generate:()=>([{time:0,textShadow:'0 0 5px #38BDF8'},{time:25,textShadow:'0 0 20px #38BDF8, 0 0 40px #38BDF8'},{time:50,textShadow:'0 0 2px #38BDF8'},{time:75,textShadow:'0 0 30px #38BDF8, 0 0 60px #38BDF8'},{time:100,textShadow:'0 0 5px #38BDF8'}]) }
        }
      };

      const SETTING_DEFS = {
        liftHeight:    { label:'Lift Height', min:2,    max:20,  step:1,    suffix:'px', type:'range' },
        scaleAmount:   { label:'Scale',       min:1.01, max:1.2, step:0.01, suffix:'',   type:'range' },
        rotationAngle: { label:'Rotation',    min:2,    max:30,  step:1,    suffix:'deg',type:'range' },
        glowIntensity: { label:'Glow',        min:0.1,  max:1,   step:0.1,  suffix:'',   type:'range' },
        parallaxScale: { label:'Scale',       min:1.05, max:1.3, step:0.05, suffix:'',   type:'range' },
        buttonColor:   { label:'Button Color', type:'color' },
        animationColor:{ label:'Anim Color',   type:'color' }
      };

      const BUTTON_CSS = \`
        .btn-neon{background:transparent;color:#0ff;border:2px solid #0ff;box-shadow:0 0 5px #0ff;padding:10px 20px;border-radius:4px;font-weight:600;cursor:pointer;transition:all 0.3s;}
        .btn-neon:hover{background:#0ff;color:#111;box-shadow:0 0 20px #0ff,0 0 40px #0ff;letter-spacing:3px;}
        .btn-explosion{background:#ff3366;color:#fff;border:none;padding:10px 20px;border-radius:4px;font-weight:600;cursor:pointer;}
        .btn-explosion:hover{animation:anim-explode 0.5s forwards;box-shadow:0 0 30px #ff3366;}
        @keyframes anim-explode{0%{transform:scale(1)}50%{transform:scale(1.2)}60%{transform:scale(0.9)}100%{transform:scale(1.1)}}
        .btn-liquid{background:#4a00e0;color:#fff;border:none;border-radius:30px;padding:10px 20px;font-weight:600;cursor:pointer;transition:all 0.3s;}
        .btn-liquid:hover{background:#8e2de2;border-radius:5px;transform:translateY(-5px) scale(1.05);}
        .btn-outline{background:transparent;color:#3ae374;border:2px solid #3ae374;padding:10px 20px;border-radius:4px;font-weight:600;cursor:pointer;position:relative;overflow:hidden;z-index:0;}
        .btn-outline::before{content:'';position:absolute;top:0;left:0;width:0;height:100%;background:#3ae374;transition:width 0.5s;z-index:-1;}
        .btn-outline:hover{color:#000;}.btn-outline:hover::before{width:100%;}
        .btn-shake{background:#ffb142;color:#fff;border:none;padding:10px 20px;border-radius:4px;font-weight:600;cursor:pointer;}
        .btn-shake:hover{animation:anim-shake 0.5s infinite;}
        @keyframes anim-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px) rotate(-5deg)}75%{transform:translateX(5px) rotate(5deg)}}
        .btn-lightning{background:#222;color:#f1c40f;border:2px solid #f1c40f;box-shadow:0 0 5px #f1c40f;padding:10px 20px;border-radius:4px;font-weight:600;cursor:pointer;}
        .btn-lightning:hover{animation:anim-lightning 0.9s ease-out;}
        @keyframes anim-lightning{0%{box-shadow:0 0 20px #f1c40f;transform:scale(1)}15%{box-shadow:0 0 200px #f1c40f;transform:scale(1.4)}30%{box-shadow:0 0 50px #f1c40f;transform:scale(1)}45%{box-shadow:0 0 150px #f1c40f;transform:scale(1.3)}100%{box-shadow:0 0 20px #f1c40f;transform:scale(1)}}
        .btn-pulse{background:#9b59b6;color:#fff;border:none;padding:10px 20px;border-radius:4px;font-weight:600;cursor:pointer;}
        .btn-pulse:hover{animation:anim-pulse 1.5s infinite;}
        @keyframes anim-pulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(155,89,182,0.7)}70%{transform:scale(1.05);box-shadow:0 0 0 15px rgba(155,89,182,0)}}
        .btn-blur{background:#27ae60;color:#fff;border:none;padding:10px 20px;border-radius:4px;font-weight:600;cursor:pointer;}
        .btn-blur:hover{animation:anim-blurIn 0.5s forwards;letter-spacing:3px;}
        @keyframes anim-blurIn{0%{filter:blur(0);transform:scale(1)}50%{filter:blur(3px);transform:scale(1.1)}100%{filter:blur(0);transform:scale(1.05)}}
        .btn-morph{background:#1abc9c;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;transition:all 0.4s;}
        .btn-morph:hover{border-radius:50px;transform:rotate(360deg);}
      \`;

      let _initialized = false;
      function init() {
        if (_initialized) { return; }
        _initialized = true;
        const style = document.createElement('style');
        style.textContent = BUTTON_CSS;
        document.head.appendChild(style);

        document.querySelectorAll('.anim-type-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            document.querySelectorAll('.anim-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeType = btn.dataset.type;
            populateSelect();
            buildPreview();
          });
        });

        document.getElementById('animDuration').addEventListener('input', e => {
          settings.duration = +e.target.value;
          document.getElementById('durVal').textContent = settings.duration + 'ms';
        });
        document.getElementById('animDelay').addEventListener('input', e => {
          settings.delay = +e.target.value;
          document.getElementById('delayVal').textContent = settings.delay + 'ms';
        });
        // Easing options
        const EASING_OPTIONS = [
          ['ease-out',   'Ease Out'],
          ['linear',     'Linear'],
          ['ease',       'Ease'],
          ['ease-in',    'Ease In'],
          ['ease-in-out','Ease In-Out'],
          ['cubic-bezier(0.175, 0.885, 0.32, 1.275)', 'Slight Overshoot'],
          ['cubic-bezier(0.68, -0.55, 0.265, 1.55)',  'Back Elastic']
        ];

        // Reusable custom select builder
        function makeCustomSelect(wrapId, triggerId, dropdownId, labelId, hiddenId, options, onChange) {
          const wrap     = document.getElementById(wrapId);
          const trigger  = document.getElementById(triggerId);
          const dropdown = document.getElementById(dropdownId);
          const label    = document.getElementById(labelId);
          const hidden   = document.getElementById(hiddenId);
          dropdown.innerHTML = '';
          options.forEach(([val, name], i) => {
            const div = document.createElement('div');
            div.className = 'anim-select-option' + (i === 0 ? ' selected' : '');
            div.textContent = name;
            div.dataset.value = val;
            div.addEventListener('mousedown', e => {
              e.preventDefault();
              dropdown.querySelectorAll('.anim-select-option').forEach(o => o.classList.remove('selected'));
              div.classList.add('selected');
              hidden.value = val;
              label.textContent = name;
              wrap.classList.remove('open');
              onChange(val);
            });
            dropdown.appendChild(div);
          });
          trigger.addEventListener('click', () => wrap.classList.toggle('open'));
          document.addEventListener('click', e => {
            if (!wrap.contains(e.target)) wrap.classList.remove('open');
          });
        }

        makeCustomSelect(
          'animEasingWrap', 'animEasingTrigger', 'animEasingDropdown', 'animEasingLabel', 'animEasing',
          EASING_OPTIONS,
          val => { settings.easing = val; }
        );

        ['mouseEnter','mouseLeave','hover','scroll','onLoad'].forEach(id => {
          const el = document.getElementById('trig-' + id);
          if (el) el.addEventListener('change', e => {
            const key = id === 'scroll' ? 'scrollView' : id;
            triggers[key] = e.target.checked;
          });
        });

        document.getElementById('animSelectTrigger').addEventListener('click', () => {
          document.getElementById('animSelectWrap').classList.toggle('open');
        });
        document.addEventListener('click', e => {
          if (!document.getElementById('animSelectWrap').contains(e.target)) {
            document.getElementById('animSelectWrap').classList.remove('open');
          }
        });

        document.getElementById('outputCSS').addEventListener('click', () => setOutput('css'));
        document.getElementById('outputJS').addEventListener('click',  () => setOutput('js'));

        document.getElementById('applyAnimBtn').addEventListener('click', applyAnimation);
        document.getElementById('copyCodeBtn').addEventListener('click', copyCode);

        populateSelect();
        buildPreview();
      }

      function populateSelect() {
        const wrap     = document.getElementById('animSelectWrap');
        const dropdown = document.getElementById('animSelectDropdown');
        const hidden   = document.getElementById('animSelect');
        const label    = document.getElementById('animSelectLabel');
        dropdown.innerHTML = '';
        const entries = Object.entries(ANIMATIONS[activeType]);
        entries.forEach(([key, anim], i) => {
          const div = document.createElement('div');
          div.className = 'anim-select-option' + (i === 0 ? ' selected' : '');
          div.textContent = anim.name;
          div.dataset.value = key;
          div.addEventListener('mousedown', e => {
            e.preventDefault();
            dropdown.querySelectorAll('.anim-select-option').forEach(o => o.classList.remove('selected'));
            div.classList.add('selected');
            hidden.value = key;
            label.textContent = anim.name;
            wrap.classList.remove('open');
            buildSpecificSettings(key);
            buildPreview();
          });
          dropdown.appendChild(div);
        });
        if (entries.length) {
          hidden.value = entries[0][0];
          label.textContent = entries[0][1].name;
          buildSpecificSettings(entries[0][0]);
        }
      }

      function buildSpecificSettings(animKey) {
        const anim = ANIMATIONS[activeType][animKey];
        const section = document.getElementById('animSpecificSection');
        if (!anim?.settings?.length) { section.style.display = 'none'; return; }
        section.style.display = 'block';
        document.getElementById('animSpecificTitle').textContent = anim.name + ' Settings';
        const container = document.getElementById('animSpecificControls');
        container.innerHTML = '';
        anim.settings.forEach(key => {
          const def = SETTING_DEFS[key];
          if (!def) { return; }
          const wrapper = document.createElement('div');
          if (def.type === 'color') {
            const label = document.createElement('div');
            label.className = 'anim-range-label';
            label.innerHTML = \`<span>\${def.label}</span>\`;
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;gap:6px;align-items:center;margin-bottom:8px';
            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.value = settings[key];
            colorInput.style.cssText = 'width:36px;height:28px;border:1px solid #555;border-radius:4px;cursor:pointer;padding:0';
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.value = settings[key];
            textInput.style.cssText = 'flex:1;height:28px;background:#2a2a2a;border:1px solid #555;border-radius:4px;color:#eee;font-size:11px;padding:0 8px;outline:none';
            colorInput.addEventListener('input', e => { settings[key] = e.target.value; textInput.value = e.target.value; buildPreview(); });
            textInput.addEventListener('input', e => { settings[key] = e.target.value; colorInput.value = e.target.value; buildPreview(); });
            row.appendChild(colorInput);
            row.appendChild(textInput);
            wrapper.appendChild(label);
            wrapper.appendChild(row);
          } else {
            const labelRow = document.createElement('div');
            labelRow.className = 'anim-range-label';
            const valSpan = document.createElement('span');
            valSpan.id = 'sv-' + key;
            valSpan.textContent = settings[key] + def.suffix;
            labelRow.innerHTML = \`<span>\${def.label}</span>\`;
            labelRow.appendChild(valSpan);
            const range = document.createElement('input');
            range.type = 'range';
            range.className = 'anim-range';
            range.min = def.min;
            range.max = def.max;
            range.step = def.step;
            range.value = settings[key];
            range.addEventListener('input', e => {
              settings[key] = +e.target.value;
              valSpan.textContent = e.target.value + def.suffix;
              buildPreview();
            });
            wrapper.appendChild(labelRow);
            wrapper.appendChild(range);
          }
          container.appendChild(wrapper);
        });
      }

      function buildPreview() {
        const preview = document.getElementById('animPreview');
        preview.innerHTML = '';

        if (activeType === 'button') {
          const animKey = document.getElementById('animSelect').value;
          const anim = ANIMATIONS.button[animKey];
          preview.innerHTML = \`<button class="\${anim.cssClass}">\${anim.name}</button>\`;
          return;
        }

        if (activeType === 'image') {
          const wrapper = document.createElement('div');
          wrapper.style.cssText = 'transform-origin:center center;border-radius:4px;overflow:hidden;';
          wrapper.innerHTML = \`<svg width="140" height="100" viewBox="0 0 140 100">
            <defs><linearGradient id="sg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#87CEEB"/><stop offset="100%" style="stop-color:#98FB98"/>
            </linearGradient></defs>
            <rect width="140" height="100" fill="url(#sg)"/>
            <polygon points="0,75 35,50 70,65 105,45 140,60 140,100 0,100" fill="#8FBC8F"/>
            <circle cx="115" cy="25" r="12" fill="#FFD700"/>
          </svg>\`;
          const animKey = document.getElementById('animSelect').value;
          const animCfg = ANIMATIONS.image[animKey];
          if (animCfg?.generate) {
            wrapper.addEventListener('mouseenter', () => playEl(wrapper, animCfg.generate()));
            wrapper.addEventListener('mouseleave', () => { if (triggers.mouseLeave) reverseEl(wrapper, animCfg.generate()); });
          }
          preview.appendChild(wrapper);
          return;
        }

        if (activeType === 'text') {
          const div = document.createElement('div');
          div.style.cssText = 'font-size:20px;font-weight:700;color:#111;transform-origin:center center;padding:10px;';
          div.textContent = 'SnapStak';
          const animKey = document.getElementById('animSelect').value;
          const animCfg = ANIMATIONS.text[animKey];
          if (animCfg?.generate) {
            div.addEventListener('mouseenter', () => playEl(div, animCfg.generate()));
            div.addEventListener('mouseleave', () => { if (triggers.mouseLeave) reverseEl(div, animCfg.generate()); });
          }
          preview.appendChild(div);
          return;
        }

        // Container
        const card = document.createElement('div');
        card.className = 'preview-card-demo';
        card.innerHTML = \`
          <h4>Design System</h4>
          <p style="font-size:10px;color:#888;margin:0 0 8px">SnapStak Component</p>
          <div class="preview-progress"><div class="preview-progress-bar"></div></div>
          <div style="display:flex;justify-content:space-between;font-size:9px;color:#999;margin-top:3px"><span>75%</span><span>3 left</span></div>\`;
        const animKey = document.getElementById('animSelect').value;
        const animCfg = ANIMATIONS.container[animKey];
        if (animCfg?.generate) {
          card.addEventListener('mouseenter', () => { if (triggers.mouseEnter) playEl(card, animCfg.generate()); });
          card.addEventListener('mouseleave', () => { if (triggers.mouseLeave) reverseEl(card, animCfg.generate()); });
        }
        preview.appendChild(card);
      }

      function toWebKeyframes(frames) {
        return frames.map(f => {
          const kf = { offset: f.time / 100 };
          ['transform','opacity','boxShadow','borderRadius','clipPath','filter','color','textShadow','width'].forEach(p => {
            if (f[p] !== undefined) kf[p] = f[p];
          });
          return kf;
        });
      }

      function playEl(el, frames) {
        if (animRef) animRef.cancel();
        animRef = el.animate(toWebKeyframes(frames), { duration: settings.duration, easing: settings.easing, delay: settings.delay, fill: 'forwards' });
      }

      function reverseEl(el, frames) {
        const reversed = [...frames].reverse().map((f, i) => ({ ...f, time: i / (frames.length - 1) * 100 }));
        if (revRef) revRef.cancel();
        revRef = el.animate(toWebKeyframes(reversed), { duration: Math.round(settings.duration * 0.7), easing: 'ease-out', fill: 'forwards' });
      }

      function applyAnimation() {
        const animKey = document.getElementById('animSelect').value;
        const anim = ANIMATIONS[activeType][animKey];
        let code;
        if (activeType === 'button') {
          const animType = animKey.replace('button-', '');
          code = outputMode === 'css'
            ? generateButtonCSS(animType)
            : generateButtonJS(animType, anim);
        } else {
          const keyframes = anim.generate();
          code = outputMode === 'css' ? generateCSS(animKey, anim, keyframes) : generateJS(animKey, anim, keyframes);
        }
        const output = document.getElementById('animCodeOutput');
        output.textContent = code;
        output.classList.add('visible');
        try { window.vscodeApi?.postMessage({ command: 'applyAnimation', animKey, type: activeType, code, outputMode }); } catch(e) {}
      }

      function copyCode() {
        const output = document.getElementById('animCodeOutput');
        if (!output.textContent) { applyAnimation(); return; }
        navigator.clipboard?.writeText(output.textContent).catch(() => {});
      }

      function generateButtonCSS(animType) {
        const c = settings.animationColor || '#0ff';
        const bc = settings.buttonColor || '#6b7280';
        const base = 'padding:.75rem 1.5rem;font-weight:600;cursor:pointer;border:none;';
        const map = {
          neon:      ['.btn-neon{background:transparent;color:' + c + ';border:2px solid ' + c + ';box-shadow:0 0 5px ' + c + ';' + base + 'transition:all 0.3s;}',
                      '.btn-neon:hover{color:#111;background:' + c + ';box-shadow:0 0 20px ' + c + ',0 0 40px ' + c + ';letter-spacing:3px;}'],
          explosion: ['.btn-explosion{background:' + c + ';color:#fff;' + base + '}',
                      '.btn-explosion:hover{animation:explode 0.5s forwards;box-shadow:0 0 30px ' + c + ';}',
                      '@keyframes explode{0%{transform:scale(1)}50%{transform:scale(1.2)}60%{transform:scale(0.9)}100%{transform:scale(1.1)}}'],
          liquid:    ['.btn-liquid{background:' + bc + ';color:#fff;border-radius:30px;' + base + 'transition:all 0.3s;}',
                      '.btn-liquid:hover{background:' + c + ';border-radius:5px;transform:translateY(-5px) scale(1.05);}',
                      '@keyframes liquidClick{0%{border-radius:30px;transform:scale(1)}25%{border-radius:0px;transform:scale(1.1) rotate(15deg)}50%{border-radius:50px;transform:scale(0.7) rotate(-15deg)}75%{border-radius:10px;transform:scale(1.3) rotate(10deg)}100%{border-radius:30px;transform:scale(1)}}'],
          outline:   ['.btn-outline{background:transparent;color:' + c + ';border:2px solid ' + c + ';' + base + 'position:relative;overflow:hidden;z-index:0;}',
                      '.btn-outline::before{content:"";position:absolute;top:0;left:0;width:0;height:100%;background:' + c + ';transition:width 0.5s;z-index:-1;}',
                      '.btn-outline:hover{color:#000;}.btn-outline:hover::before{width:100%;}'],
          shake:     ['.btn-shake{background:' + bc + ';color:#fff;' + base + '}',
                      '.btn-shake:hover{animation:shake 0.5s infinite;}',
                      '@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px) rotate(-5deg)}75%{transform:translateX(8px) rotate(5deg)}}'],
          lightning: ['.btn-lightning{background:#222;color:' + c + ';border:2px solid ' + c + ';box-shadow:0 0 5px ' + c + ';' + base + '}',
                      '.btn-lightning:hover{animation:lightning 0.9s ease-out;}',
                      '@keyframes lightning{0%{box-shadow:0 0 20px ' + c + ';transform:scale(1)}15%{box-shadow:0 0 200px ' + c + ';transform:scale(1.4)}30%{box-shadow:0 0 50px ' + c + ';transform:scale(1)}45%{box-shadow:0 0 150px ' + c + ';transform:scale(1.3)}100%{box-shadow:0 0 20px ' + c + ';transform:scale(1)}}'],
          pulse:     ['.btn-pulse{background:' + bc + ';color:#fff;' + base + '}',
                      '.btn-pulse:hover{animation:pulse 1.5s infinite;}',
                      '@keyframes pulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 ' + bc + '99}70%{transform:scale(1.05);box-shadow:0 0 0 15px ' + bc + '00}}'],
          blur:      ['.btn-blur{background:' + bc + ';color:#fff;' + base + '}',
                      '.btn-blur:hover{animation:blurIn 0.5s forwards;letter-spacing:3px;}',
                      '@keyframes blurIn{0%{filter:blur(0);transform:scale(1)}50%{filter:blur(3px);transform:scale(1.1)}100%{filter:blur(0);transform:scale(1.05)}}'],
          morph:     ['.btn-morph{background:' + bc + ';color:#fff;border-radius:8px;' + base + 'transition:all 0.4s;}',
                      '.btn-morph:hover{border-radius:50px;transform:rotate(360deg);background:' + c + ';}']
        };
        const lines = map[animType];
        return lines ? lines.join('\\n') : ('/* add class "btn-' + animType + '" to your <button> */');
      }

      function generateButtonJS(animType, anim) {
        const kf = anim.generate().map((f) => {
          const o = { offset: f.time / 100 };
          ['transform','opacity','boxShadow','borderRadius','clipPath','filter'].forEach(p => { if (f[p] !== undefined) o[p] = f[p]; });
          return o;
        });
        const kfStr = JSON.stringify(kf, null, 2);
        const lines = [
          'const btn = document.querySelector(".btn-' + animType + '");',
          'btn.addEventListener("mouseenter", () => {',
          '  btn.animate(' + kfStr + ',',
          '  { duration: ' + settings.duration + ', easing: "' + settings.easing + '", fill: "forwards" });',
          '});'
        ];
        return lines.join('\\n');
      }

      function generateCSS(animKey, anim, frames) {
        const kfCSS = frames.map(f => {
          const props = [];
          ['transform','opacity','boxShadow','borderRadius','clipPath','filter'].forEach(p => {
            if (f[p] !== undefined) props.push(\`    \${p.replace(/([A-Z])/g,'-$1').toLowerCase()}: \${f[p]};\`);
          });
          return '  ' + f.time + '% {' + NL + props.join(NL) + NL + '  }';
        }).join(NL);
        let triggerCSS = '';
        const { duration: dur, easing: ease, delay: del } = settings;
        if (triggers.hover || triggers.mouseEnter) triggerCSS += NL + '.element:hover { animation: ' + animKey + ' ' + dur + 'ms ' + ease + ' ' + del + 'ms forwards; }';
        if (triggers.scrollView) triggerCSS += NL + '.element.in-view { animation: ' + animKey + ' ' + dur + 'ms ' + ease + ' ' + del + 'ms forwards; }';
        if (triggers.onLoad) triggerCSS += NL + '.element.loaded { animation: ' + animKey + ' ' + dur + 'ms ' + ease + ' ' + del + 'ms forwards; }';
        return '/* ' + anim.name + ' */' + NL + '@keyframes ' + animKey + ' {' + NL + kfCSS + NL + '}' + triggerCSS;
      }

      function generateJS(animKey, anim, frames) {
        const kf = frames.map(f => {
          const obj = { offset: f.time / 100 };
          ['transform','opacity','boxShadow','borderRadius','clipPath','filter'].forEach(p => { if (f[p] !== undefined) obj[p] = f[p]; });
          return obj;
        });
        let t = '';
        if (triggers.mouseEnter) t += NL + 'el.addEventListener("mouseenter", () => el.animate(keyframes, opts));';
        if (triggers.mouseLeave) t += NL + 'el.addEventListener("mouseleave", () => el.animate([...keyframes].reverse(), {...opts, duration: opts.duration * 0.7}));';
        if (triggers.scrollView) t += NL + 'new IntersectionObserver(([e]) => { if(e.isIntersecting) el.animate(keyframes, opts); }, {threshold:0.3}).observe(el);';
        return '// ' + anim.name + NL + 'const el = document.querySelector(".your-element");' + NL + 'const keyframes = ' + JSON.stringify(kf, null, 2) + ';' + NL + 'const opts = { duration: ' + settings.duration + ', easing: "' + settings.easing + '", delay: ' + settings.delay + ', fill: "forwards" };' + t;
      }

      function setOutput(mode) {
        outputMode = mode;
        document.getElementById('outputCSS').classList.toggle('active', mode === 'css');
        document.getElementById('outputJS').classList.toggle('active', mode === 'js');
      }

      // Public API
      return { init };

    })();

    // Boot after DOM is ready
    (function waitForDOM() {
      if (document.getElementById('animSelect')) {
        window.animPanel.init();
      } else {
        requestAnimationFrame(waitForDOM);
      }
    })();
    </script>
    </div>`;
}
