"use strict";
/**
 * SnapStak Form Panel
 * Component type tagging: Text Input Fields, Form Layout Elements,
 * Data Entry, Advanced Patterns, Shapes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormPanel = getFormPanel;
function getFormPanel() {
    return /* html */ `
<div class="tab-panel" id="panel-form">
  <div class="fp-panel">

    <div class="fp-group">
      <label class="fp-label">Text Input Fields</label>
      <div class="fp-select-wrap">
        <select class="fp-select" id="fp-textInputFields">
          <option value="">Select text input field</option>
          <option value="text-input">Text Input</option>
          <option value="number-input">Number Input</option>
          <option value="email-input">Email Input</option>
          <option value="password-input">Password Input</option>
          <option value="phone">Phone Number</option>
          <option value="search-box">Search Box</option>
          <option value="url-input">URL Input</option>
          <option value="number-spinner">Number Spinner</option>
          <option value="textarea">Multi-line Text Area</option>
          <option value="autocomplete">Autocomplete Text Box</option>
        </select>
        <svg class="fp-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4,6 8,10 12,6"/></svg>
      </div>
    </div>

    <div class="fp-group">
      <label class="fp-label">Form Layout Elements</label>
      <div class="fp-select-wrap">
        <select class="fp-select" id="fp-formLayoutElements">
          <option value="">Select form layout element</option>
          <option value="heading">Heading</option>
          <option value="label">Label</option>
          <option value="text">Text</option>
          <option value="fieldset">Fieldset Box</option>
          <option value="legend">Legend Label</option>
          <option value="readonly-field">Readonly Field</option>
          <option value="disabled-control">Disabled Control</option>
          <option value="required-field">Required Field</option>
        </select>
        <svg class="fp-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4,6 8,10 12,6"/></svg>
      </div>
    </div>

    <div class="fp-group">
      <label class="fp-label">Data Entry</label>
      <div class="fp-select-wrap">
        <select class="fp-select" id="fp-dataEntry">
          <option value="">Select data entry method</option>
          <option value="text-field">Text Field</option>
          <option value="text-area">Text Area</option>
          <option value="search-bar">Search Bar</option>
          <option value="select-dropdown">Select / Dropdown</option>
          <option value="date-picker">Date Picker</option>
          <option value="time-picker">Time Picker</option>
          <option value="file-uploader">File Uploader</option>
          <option value="autocomplete-entry">Autocomplete</option>
          <option value="rich-text">Rich Text Editor</option>
        </select>
        <svg class="fp-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4,6 8,10 12,6"/></svg>
      </div>
    </div>

    <div class="fp-group">
      <label class="fp-label">Advanced Patterns</label>
      <div class="fp-select-wrap">
        <select class="fp-select" id="fp-advancedPatterns">
          <option value="">Select advanced pattern</option>
          <option value="infinite-scroll">Infinite Scroll</option>
          <option value="pull-refresh">Pull-to-Refresh</option>
          <option value="sticky-header">Sticky Header / Footer</option>
          <option value="back-to-top">Back-to-Top Button</option>
          <option value="fab">Floating Action Button</option>
          <option value="chat-widget">Chat Widget</option>
          <option value="map-picker">Map / Location Picker</option>
        </select>
        <svg class="fp-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4,6 8,10 12,6"/></svg>
      </div>
    </div>

    <div class="fp-group">
      <label class="fp-label">Shapes</label>
      <div class="fp-select-wrap">
        <select class="fp-select" id="fp-shapes">
          <option value="">Select shape</option>
          <option value="line">Line</option>
          <option value="divider">Divider</option>
          <option value="spacer">Spacer</option>
        </select>
        <svg class="fp-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4,6 8,10 12,6"/></svg>
      </div>
    </div>

  </div>
</div>

<style>
  .fp-panel { padding: 12px 10px; display: flex; flex-direction: column; gap: 14px; }
  .fp-group { display: flex; flex-direction: column; gap: 5px; }
  .fp-label { font-size: 11px; font-weight: 600; color: var(--fg-dim); text-transform: uppercase; letter-spacing: 0.4px; }
  .fp-select-wrap { position: relative; }
  .fp-select {
    width: 100%; height: 30px; padding: 0 28px 0 10px;
    background: var(--bg-input); border: 1px solid var(--border);
    border-radius: 5px; color: var(--fg); font-family: var(--vscode-font-family);
    font-size: 12px; cursor: pointer; appearance: none; outline: none;
    transition: border-color 0.15s;
  }
  .fp-select:focus, .fp-select:hover { border-color: var(--blue); }
  .fp-select option { background: var(--bg-input); color: var(--fg); }
  .fp-chevron {
    position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
    width: 12px; height: 12px; color: var(--fg-dim); pointer-events: none;
  }
</style>
`;
}
//# sourceMappingURL=formPanel.js.map