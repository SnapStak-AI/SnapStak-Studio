"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMediaPanel = getMediaPanel;
function getMediaPanel() {
    return /* html */ `
    <div class="tab-panel active" id="panel-media">
      <div class="placeholder">
        <div class="placeholder-icon">🖼️</div>
        <div class="placeholder-label">Media assets will appear here.<br>Use the prompt below to get started.</div>
      </div>
      <div class="thinking" id="thinking-media">
        <div class="thinking-dots"><span></span><span></span><span></span></div>
        SnapStak is thinking...
      </div>
      <div class="response-area" id="response-media"></div>
    </div>`;
}
//# sourceMappingURL=mediaPanel.js.map