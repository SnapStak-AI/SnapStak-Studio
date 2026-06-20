export function getLibraryPanel(): string {
  return /* html */`
    <div class="tab-panel" id="panel-library">
      <div class="placeholder">
        <div class="placeholder-icon">📚</div>
        <div class="placeholder-label">Library components will appear here.<br>Use the prompt below to get started.</div>
      </div>
      <div class="thinking" id="thinking-library">
        <div class="thinking-dots"><span></span><span></span><span></span></div>
        SnapStak is thinking...
      </div>
      <div class="response-area" id="response-library"></div>
    </div>`;
}
