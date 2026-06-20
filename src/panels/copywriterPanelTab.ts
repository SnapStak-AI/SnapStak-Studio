/**
 * SnapStak Copywriter Panel — sidebar tab content
 * Shows block properties when user clicks a block in copywriterPanel.ts
 */

export function getCopywriterPanel(): string {
    return /* html */`
<div class="tab-panel" id="panel-copywriter">

  <div id="cwt-empty" class="cwt-empty">
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="3" y="5" width="22" height="18" rx="2" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="5 2"/>
      <path d="M8 10h12M8 14h8M8 18h10" stroke="#38BDF8" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <div class="cwt-empty-text">Click a block in the Copywriter to edit its properties</div>
  </div>

  <div id="cwt-no-content" class="cwt-no-content" style="display:none">
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="9" stroke="#ef4444" stroke-width="1.5"/>
      <path d="M11 7v5M11 15v.5" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <div class="cwt-empty-text">No rewriteable content found in the selected container. Try selecting a different element.</div>
  </div>

  <div id="cwt-props" class="cwt-props" style="display:none">

    <div class="cwt-block-header" id="cwt-block-header">
      <div class="cwt-label-row" id="cwt-label-row" style="display:none">
        <span class="cwt-label-text" id="cwt-label-text"></span>
        <span class="cwt-hidden-badge" id="cwt-label-hidden" style="display:none">hidden</span>
      </div>
      <div class="cwt-header-row">
        <span class="cwt-tag" id="cwt-tag"></span>
        <span class="cwt-block-text" id="cwt-block-text"></span>
        <span class="cwt-wc" id="cwt-wc"></span>
      </div>
    </div>

    <!-- TYPOGRAPHY -->
    <div class="cwt-section">
      <div class="cwt-section-label">Font</div>
      <div class="cwt-row">
        <input class="cwt-field cwt-font-family" id="cwt-font-family" placeholder="Font family">
        <select class="cwt-field cwt-font-weight" id="cwt-font-weight">
          <option value="100">Thin</option>
          <option value="200">ExtraLight</option>
          <option value="300">Light</option>
          <option value="400">Regular</option>
          <option value="500">Medium</option>
          <option value="600">SemiBold</option>
          <option value="700">Bold</option>
          <option value="800">ExtraBold</option>
          <option value="900">Black</option>
        </select>
      </div>
      <div class="cwt-row">
        <span class="cwt-lbl">Size</span>
        <input class="cwt-field cwt-sz" id="cwt-font-size" type="number" min="1">
        <select class="cwt-field cwt-unit" id="cwt-font-unit">
          <option value="px">px</option>
          <option value="rem">rem</option>
          <option value="em">em</option>
        </select>
        <span class="cwt-lbl">LH</span>
        <input class="cwt-field cwt-sz" id="cwt-line-height" type="number" step="0.1" min="0">
        <span class="cwt-lbl">LS</span>
        <input class="cwt-field cwt-sz" id="cwt-letter-spacing" type="number" step="0.1">
      </div>
      <div class="cwt-row">
        <span class="cwt-lbl">Align</span>
        <div class="cwt-align-btns" id="cwt-align-btns">
          <button class="cwt-align-btn" data-align="left" title="Left">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 2h8M1 5h11M1 8h8M1 11h11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
          </button>
          <button class="cwt-align-btn" data-align="center" title="Center">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 2h7M1 5h11M3 8h7M1 11h11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
          </button>
          <button class="cwt-align-btn" data-align="right" title="Right">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M4 2h8M1 5h11M4 8h8M1 11h11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
          </button>
          <button class="cwt-align-btn" data-align="justify" title="Justify">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 2h11M1 5h11M1 8h11M1 11h11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
          </button>
        </div>
        <span class="cwt-lbl" style="margin-left:8px">Color</span>
        <input type="color" class="cwt-color" id="cwt-color">
      </div>
    </div>

    <!-- CONTENT -->
    <div class="cwt-section">
      <div class="cwt-section-label">Original</div>
      <div class="cwt-original" id="cwt-original"></div>
    </div>

    <div class="cwt-section">
      <div class="cwt-section-label">Rewrite</div>
      <textarea class="cwt-rewrite" id="cwt-rewrite" placeholder="AI rewrite will appear here..."></textarea>
      <div class="cwt-wc-row"><span id="cwt-rewrite-wc" class="cwt-rewrite-wc"></span></div>
      <div class="cwt-keywords-row">
        <input class="cwt-keywords" id="cwt-keywords" placeholder="Keywords for AI suggestion...">
        <button class="cwt-suggest-btn" id="cwt-suggest">&#10022; Suggest</button>
      </div>
      <div class="cwt-action-row">
        <button class="cwt-cancel-btn" id="cwt-cancel">Cancel</button>
        <button class="cwt-apply-btn" id="cwt-apply">Apply &#10003;</button>
      </div>
    </div>

    <!-- GROUP BODY TEXT SECTION -->
    <div class="cwt-section cwt-group-section" id="cwt-group-section" style="display:none">
      <div class="cwt-section-label">Body Text <span class="cwt-group-badge">GROUP</span></div>
      <div class="cwt-group-body-list" id="cwt-group-body-list"></div>
      <div class="cwt-keywords-row" style="margin-top:8px">
        <input class="cwt-keywords" id="cwt-body-keywords" placeholder="Keywords for body text generation...">
        <button class="cwt-suggest-btn" id="cwt-generate-body">&#10022; Generate</button>
      </div>
      <div class="cwt-group-hint">AI will generate fresh body text using your new heading, website description and keywords. Original word count is preserved.</div>
    </div>

  </div>

  <style>
    #panel-copywriter { height: 100%; overflow-y: auto; scrollbar-width: thin; }
    .cwt-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 40px 20px; opacity: 0.5; text-align: center; }
    .cwt-empty-text { font-size: 11px; color: var(--vscode-descriptionForeground); line-height: 1.6; }
    .cwt-no-content { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 32px 20px; text-align: center; }
    .cwt-props { padding: 10px 12px; display: flex; flex-direction: column; gap: 0; }
    .cwt-block-header { display: flex; flex-direction: column; padding: 8px 10px; background: var(--vscode-editor-background); border: 1px solid var(--vscode-widget-border, #3a3a3a); border-radius: 6px; margin-bottom: 12px; }
    .cwt-label-row { width: 100%; display: flex; align-items: center; gap: 6px; margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px solid var(--vscode-widget-border, #3a3a3a); }
    .cwt-label-text { font-size: 10px; color: var(--vscode-descriptionForeground); font-style: italic; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cwt-header-row { display: flex; align-items: center; gap: 8px; width: 100%; }
    .cwt-tag { font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 3px; background: rgba(56,189,248,0.12); color: #38BDF8; letter-spacing: .06em; flex-shrink: 0; }
    .cwt-block-text { font-size: 11px; font-weight: 600; color: var(--vscode-foreground); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
    .cwt-wc { font-size: 10px; color: var(--vscode-descriptionForeground); flex-shrink: 0; }
    .cwt-hidden-badge { font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 3px; background: rgba(239,68,68,0.12); color: #ef4444; letter-spacing: .06em; flex-shrink: 0; }
    .cwt-section { margin-bottom: 12px; }
    .cwt-section-label { font-size: 9px; font-weight: 700; color: var(--vscode-descriptionForeground); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 6px; }
    .cwt-row { display: flex; align-items: center; gap: 5px; margin-bottom: 5px; }
    .cwt-lbl { font-size: 10px; color: var(--vscode-descriptionForeground); white-space: nowrap; }
    .cwt-field { background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, #3a3a3a); border-radius: 4px; color: var(--vscode-input-foreground); font-size: 11px; padding: 4px 6px; outline: none; font-family: inherit; }
    .cwt-field:focus { border-color: #38BDF8; }
    .cwt-font-family { flex: 1; }
    .cwt-font-weight { width: 90px; }
    .cwt-sz { width: 48px; }
    .cwt-unit { width: 50px; }
    .cwt-align-btns { display: flex; gap: 2px; }
    .cwt-align-btn { width: 24px; height: 24px; background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, #3a3a3a); border-radius: 3px; color: var(--vscode-descriptionForeground); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s; padding: 0; }
    .cwt-align-btn:hover { color: var(--vscode-foreground); }
    .cwt-align-btn.active { background: rgba(56,189,248,0.12); border-color: #38BDF8; color: #38BDF8; }
    .cwt-color { width: 24px; height: 24px; border-radius: 4px; border: 1px solid var(--vscode-input-border, #3a3a3a); cursor: pointer; padding: 0; }
    .cwt-original { font-size: 11px; color: var(--vscode-descriptionForeground); font-style: italic; line-height: 1.5; padding: 7px 8px; background: var(--vscode-editor-background); border: 1px solid var(--vscode-widget-border, #3a3a3a); border-radius: 4px; }
    .cwt-rewrite { width: 100%; background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, #3a3a3a); border-radius: 4px; color: var(--vscode-input-foreground); font-family: inherit; font-size: 11px; padding: 7px 8px; outline: none; resize: vertical; min-height: 60px; transition: border-color .15s; box-sizing: border-box; }
    .cwt-rewrite:focus { border-color: #38BDF8; }
    .cwt-keywords-row { display: flex; gap: 5px; margin-top: 6px; }
    .cwt-keywords { flex: 1; min-width: 0; background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, #3a3a3a); border-radius: 4px; color: var(--vscode-input-foreground); font-size: 11px; padding: 5px 7px; outline: none; font-family: inherit; transition: border-color .15s; }
    .cwt-keywords:focus { border-color: #38BDF8; }
    .cwt-wc-row { display: flex; justify-content: flex-end; margin-top: 3px; margin-bottom: 2px; }
    .cwt-rewrite-wc { font-size: 10px; }
    .cwt-rewrite-wc.ok  { color: #1D9E75; }
    .cwt-rewrite-wc.low { color: #ef4444; }
    .cwt-rewrite-wc.empty { color: var(--vscode-descriptionForeground); }
    .cwt-action-row { display: flex; gap: 5px; margin-top: 5px; justify-content: flex-end; }
    .cwt-cancel-btn { flex: 1; background: transparent; color: var(--vscode-descriptionForeground); border: 1px solid var(--vscode-input-border, #3a3a3a); border-radius: 4px; padding: 5px 12px; font-size: 11px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .15s; }
    .cwt-cancel-btn:hover { color: var(--vscode-foreground); border-color: var(--vscode-foreground); }
    .cwt-apply-btn { flex: 1; background: #38BDF8; color: #111; border: none; border-radius: 4px; padding: 5px 12px; font-size: 11px; font-weight: 600; cursor: pointer; font-family: inherit; transition: background .15s; }
    .cwt-apply-btn:hover:not(:disabled) { background: #0284c7; }
    .cwt-apply-btn:disabled { opacity: .4; cursor: not-allowed; }
    .cwt-suggest-btn { background: #38BDF8; color: #111; border: none; border-radius: 4px; padding: 5px 10px; font-size: 11px; font-weight: 600; cursor: pointer; white-space: nowrap; font-family: inherit; transition: background .15s; flex-shrink: 0; }
    .cwt-suggest-btn:hover:not(:disabled) { background: #0284c7; }
    .cwt-suggest-btn:disabled { opacity: .4; cursor: not-allowed; }
    .cwt-group-badge { font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 3px; background: rgba(56,189,248,0.15); color: #38BDF8; letter-spacing: .06em; margin-left: 6px; vertical-align: middle; }
    .cwt-group-body-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 4px; }
    .cwt-group-body-item { background: var(--vscode-editor-background); border: 1px solid var(--vscode-widget-border, #3a3a3a); border-radius: 4px; padding: 7px 8px; }
    .cwt-group-body-item.is-hidden { border-left: 2px solid rgba(239,68,68,0.4); }
    .cwt-group-body-original { font-size: 11px; color: var(--vscode-descriptionForeground); font-style: italic; line-height: 1.5; margin-bottom: 4px; }
    .cwt-group-body-rewrite { width: 100%; background: rgba(56,189,248,0.06); border: 1px solid var(--vscode-input-border, #3a3a3a); border-radius: 4px; color: var(--vscode-input-foreground); font-family: inherit; font-size: 11px; padding: 5px 7px; outline: none; resize: vertical; min-height: 44px; transition: border-color .15s; box-sizing: border-box; }
    .cwt-group-body-rewrite:focus { border-color: #38BDF8; }
    .cwt-group-body-wc { font-size: 10px; text-align: right; margin-top: 2px; }
    .cwt-group-hint { font-size: 10px; color: var(--vscode-descriptionForeground); line-height: 1.5; margin-top: 6px; padding: 6px 8px; background: rgba(56,189,248,0.06); border-radius: 4px; border-left: 2px solid #38BDF8; }
  </style>

  <script>
  (function() {
    const empty        = document.getElementById('cwt-empty');
    const noContent    = document.getElementById('cwt-no-content');
    const props        = document.getElementById('cwt-props');
    const labelRow     = document.getElementById('cwt-label-row');
    const labelText    = document.getElementById('cwt-label-text');
    const labelHidden  = document.getElementById('cwt-label-hidden');
    const groupSection   = document.getElementById('cwt-group-section');
    const groupBodyList  = document.getElementById('cwt-group-body-list');
    const bodyKeywords   = document.getElementById('cwt-body-keywords');
    const generateBody   = document.getElementById('cwt-generate-body');
    const tagEl   = document.getElementById('cwt-tag');
    const textEl  = document.getElementById('cwt-block-text');
    const wcEl    = document.getElementById('cwt-wc');
    const origEl  = document.getElementById('cwt-original');
    const rewrite = document.getElementById('cwt-rewrite');
    const keywords= document.getElementById('cwt-keywords');
    const suggest = document.getElementById('cwt-suggest');
    const fontFam = document.getElementById('cwt-font-family');
    const fontWt  = document.getElementById('cwt-font-weight');
    const fontSize= document.getElementById('cwt-font-size');
    const fontUnit= document.getElementById('cwt-font-unit');
    const lineH   = document.getElementById('cwt-line-height');
    const letterS = document.getElementById('cwt-letter-spacing');
    const colorEl = document.getElementById('cwt-color');
    const alignBtns = document.getElementById('cwt-align-btns');
    const apply   = document.getElementById('cwt-apply');
    const cancel  = document.getElementById('cwt-cancel');
    const rewriteWc = document.getElementById('cwt-rewrite-wc');

    let currentBlock = null;

    function countSpaces(str) { return (str.match(/ /g) || []).length; }

    function updateRewriteWc() {
      if (!currentBlock) { rewriteWc.textContent = ''; return; }
      const targetSpaces = countSpaces(currentBlock.heading.text);
      const currentSpaces = countSpaces(rewrite.value);
      if (!rewrite.value) {
        rewriteWc.textContent = '0 / ' + targetSpaces + ' spaces';
        rewriteWc.className = 'cwt-rewrite-wc empty';
        apply.disabled = true;
        return;
      }
      rewriteWc.textContent = currentSpaces + ' / ' + targetSpaces + ' spaces';
      const match = currentSpaces === targetSpaces;
      rewriteWc.className = 'cwt-rewrite-wc ' + (match ? 'ok' : 'low');
      apply.disabled = !match;
    }

    function rgbToHex(rgb) {
      const m = (rgb||'').match(/rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)/);
      if (!m) { return '#ffffff'; }
      return '#' + [m[1],m[2],m[3]].map(function(x){ return parseInt(x).toString(16).padStart(2,'0'); }).join('');
    }

    function loadBlock(block) {
      currentBlock = block;
      const t = block.heading.typography || {};

      if (block.label && block.label.text) {
        labelText.textContent = block.label.text;
        labelHidden.style.display = block.label.isHidden ? 'inline' : 'none';
        labelRow.style.display = 'flex';
      } else {
        labelRow.style.display = 'none';
        labelText.textContent = '';
      }

      tagEl.textContent  = block.heading ? block.heading.tag : '';
      textEl.textContent = block.heading ? block.heading.text : '';
      wcEl.textContent   = block.heading ? block.heading.wordCount + 'w' : '';
      origEl.textContent = block.heading ? block.heading.text : '';

      fontFam.value = (t.fontFamily||'').split(',')[0].replace(/['"]/g,'').trim();
      fontWt.value  = t.fontWeight || '400';

      const fsSrc = t.fontSize || '14px';
      const fsMatch = fsSrc.match(/^([\\d.]+)(.*)\$/);
      fontSize.value = fsMatch ? fsMatch[1] : '14';
      fontUnit.value = fsMatch ? (fsMatch[2]||'px') : 'px';

      const lhSrc = t.lineHeight || '';
      const lhMatch = lhSrc.match(/^([\\d.]+)/);
      lineH.value = lhMatch ? lhMatch[1] : '';

      const lsSrc = t.letterSpacing || '0';
      const lsMatch = lsSrc.match(/^([\\d.-]+)/);
      letterS.value = lsMatch ? lsMatch[1] : '0';

      colorEl.value = rgbToHex(t.color);

      const align = t.textAlign || 'left';
      alignBtns.querySelectorAll('.cwt-align-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.align === align);
      });

      rewrite.value = '';
      keywords.value = '';
      apply.disabled = true;
      updateRewriteWc();

      if (block.isGroup && block.bodyText && block.bodyText.length > 0) {
        groupBodyList.innerHTML = '';
        block.bodyText.forEach(function(bt, idx) {
          const targetSpaces = countSpaces(bt.text);
          const item = document.createElement('div');
          item.className = 'cwt-group-body-item' + (bt.isHidden ? ' is-hidden' : '');
          const hiddenBadge = bt.isHidden ? ' <span class="cwt-hidden-badge">hidden</span>' : '';
          item.innerHTML =
            '<div class="cwt-group-body-original">' + bt.tag + ' \u00b7 ' + bt.wordCount + 'w' + hiddenBadge + ' \u2014 ' + bt.text + '</div>' +
            '<textarea class="cwt-group-body-rewrite" data-idx="' + idx + '" data-target="' + targetSpaces + '" placeholder="AI will generate body text here..."></textarea>' +
            '<div class="cwt-group-body-wc" id="cwt-body-wc-' + idx + '">0 / ' + targetSpaces + ' spaces</div>';
          const ta = item.querySelector('textarea');
          const wcEl2 = item.querySelector('.cwt-group-body-wc');
          ta.addEventListener('input', function() {
            const s = countSpaces(ta.value);
            wcEl2.textContent = s + ' / ' + targetSpaces + ' spaces';
            wcEl2.style.color = (s === targetSpaces) ? '#1D9E75' : '#ef4444';
          });
          groupBodyList.appendChild(item);
        });
        bodyKeywords.value = '';
        groupSection.style.display = 'block';
      } else {
        groupSection.style.display = 'none';
        groupBodyList.innerHTML = '';
      }

      empty.style.display     = 'none';
      noContent.style.display = 'none';
      props.style.display     = 'flex';
    }

    rewrite.addEventListener('input', updateRewriteWc);

    apply.addEventListener('click', function() {
      if (!currentBlock || !rewrite.value.trim()) { return; }
      window.vscodeApi.postMessage({ command: 'applyBlockRewrite', blockId: currentBlock.blockId, text: rewrite.value.trim() });
      apply.textContent = 'Applied \u2713';
      setTimeout(function(){ apply.textContent = 'Apply \u2713'; }, 1500);
    });

    cancel.addEventListener('click', function() {
      rewrite.value = '';
      keywords.value = '';
      updateRewriteWc();
    });

    alignBtns.querySelectorAll('.cwt-align-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        alignBtns.querySelectorAll('.cwt-align-btn').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
      });
    });

    suggest.addEventListener('click', function() {
      if (!currentBlock) { return; }
      if (!keywords.value.trim()) {
        suggest.textContent = 'Add keywords first';
        setTimeout(function(){ suggest.textContent = '\u2726 Suggest'; }, 2000);
        return;
      }
      suggest.disabled = true;
      suggest.textContent = '...';
      window.vscodeApi.postMessage({
        type: 'GENERATE_HEADING',
        blockId:             currentBlock.blockId,
        originalHeading:     currentBlock.heading.text,
        headingTag:          currentBlock.heading.tag,
        wordCount:           currentBlock.heading.wordCount,
        businessDescription: currentBlock.businessDescription || '',
        keywords:            keywords.value.trim()
      });
    });

    generateBody.addEventListener('click', function() {
      if (!currentBlock || !currentBlock.bodyText) { return; }
      generateBody.disabled = true;
      generateBody.textContent = '...';
      const newHeading = rewrite.value.trim() || currentBlock.heading.text;
      const bodySpaceCounts = currentBlock.bodyText.map(function(bt) { return countSpaces(bt.text); });
      window.vscodeApi.postMessage({
        command: 'prompt',
        tab: 'copywriter',
        text: 'Generate body text for a website with the following context:\\n' +
              'New heading: "' + newHeading + '"\\n' +
              'Keywords: ' + (bodyKeywords.value || '[none provided]') + '\\n' +
              'Original body text space counts (one per paragraph, must match exactly): ' + bodySpaceCounts.join(', ') + '\\n' +
              'Return each paragraph on a new line. Match the space count of each paragraph exactly. Write fresh content \u2014 do not reference or paraphrase the original.'
      });
      setTimeout(function(){ generateBody.disabled = false; generateBody.textContent = '\u2726 Generate'; }, 15000);
    });

    window.addEventListener('message', function(event) {
      const msg = event.data;
      if (!msg) { return; }

      if (msg.command === 'loadBlockProperties' && msg.block) {
        // Attach businessDescription from the message so Suggest can pass it to the AI
        if (msg.businessDescription) {
          msg.block.businessDescription = msg.businessDescription;
        }
        loadBlock(msg.block);
      }

      if (msg.command === 'groupNoContent') {
        empty.style.display     = 'none';
        props.style.display     = 'none';
        noContent.style.display = 'flex';
        setTimeout(function() {
          noContent.style.display = 'none';
          empty.style.display     = 'flex';
        }, 4000);
      }

      if (msg.type === 'HEADING_GENERATED' && msg.blockId === currentBlock?.blockId) {
        rewrite.value = msg.heading || '';
        updateRewriteWc();
        apply.disabled = !rewrite.value.trim();
        suggest.disabled = false;
        suggest.textContent = '\u2726 Suggest';
      }

      if (msg.command === 'response' && msg.tab === 'copywriter') {
        const text = msg.text || '';
        const lines = text.split('\\n').filter(function(l) { return l.trim(); });
        const tareas = groupBodyList.querySelectorAll('.cwt-group-body-rewrite');
        if (tareas.length > 0 && lines.length > 0) {
          tareas.forEach(function(ta, i) {
            if (lines[i]) { ta.value = lines[i].trim(); ta.dispatchEvent(new Event('input')); }
          });
          generateBody.disabled = false;
          generateBody.textContent = '\u2726 Generate';
        } else {
          rewrite.value = text;
          updateRewriteWc();
          suggest.disabled = false;
          suggest.textContent = '\u2726 Suggest';
        }
      }
    });
  })();
  </script>

</div>
`;
}