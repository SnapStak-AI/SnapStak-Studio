"use strict";
/**
 * SnapStak Actions Panel
 * Component type tagging: Containers & Layout, Navigation, Interactive Controls,
 * Data Display, Media & Content, Feedback & Messaging.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActionsPanel = getActionsPanel;
function getActionsPanel() {
    return /* html */ `
<div class="tab-panel" id="panel-actions">
  <div class="ap-panel">

    <div class="ap-group">
      <label class="ap-label">Containers &amp; Layout</label>
      <div class="ap-select-wrap">
        <select class="ap-select" id="ap-containersLayout">
          <option value="">Select containers &amp; layout</option>
          <option value="card">Card</option>
          <option value="panel">Panel / Widget</option>
          <option value="modal">Modal / Popup Dialog</option>
          <option value="drawer">Drawer / Side Panel</option>
          <option value="accordion">Accordion / Collapsible Panel</option>
          <option value="tabs">Tabs</option>
          <option value="stepper">Stepper / Wizard</option>
          <option value="splitview">Split View</option>
          <option value="grid">Grid / Masonry Layout</option>
        </select>
        <svg class="ap-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4,6 8,10 12,6"/></svg>
      </div>
    </div>

    <div class="ap-group">
      <label class="ap-label">Navigation</label>
      <div class="ap-select-wrap">
        <select class="ap-select" id="ap-navigation">
          <option value="">Select navigation</option>
          <option value="navbar">Navbar</option>
          <option value="sidebar">Sidebar</option>
          <option value="breadcrumbs">Breadcrumbs</option>
          <option value="pagination">Pagination</option>
          <option value="tabs-nav">Tabs Navigation</option>
          <option value="mega-menu">Mega Menu</option>
          <option value="dropdown-menu">Dropdown Menu</option>
          <option value="context-menu">Context Menu</option>
        </select>
        <svg class="ap-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4,6 8,10 12,6"/></svg>
      </div>
    </div>

    <div class="ap-group">
      <label class="ap-label">Interactive Controls</label>
      <div class="ap-select-wrap">
        <select class="ap-select" id="ap-interactiveControls">
          <option value="">Select interactive control</option>
          <option value="button">Button</option>
          <option value="switch">Switch / Toggle</option>
          <option value="checkbox">Checkbox</option>
          <option value="radio">Radio Button</option>
          <option value="slider">Slider</option>
          <option value="rating">Rating Stars</option>
          <option value="chip">Chip / Tags</option>
          <option value="badge">Badge</option>
        </select>
        <svg class="ap-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4,6 8,10 12,6"/></svg>
      </div>
    </div>

    <div class="ap-group">
      <label class="ap-label">Data Display</label>
      <div class="ap-select-wrap">
        <select class="ap-select" id="ap-dataDisplay">
          <option value="">Select data display</option>
          <option value="table">Table</option>
          <option value="datagrid">Data Grid</option>
          <option value="list">List</option>
          <option value="treeview">Tree View</option>
          <option value="timeline">Timeline</option>
          <option value="chart">Chart / Graph</option>
          <option value="progress">Progress Bar</option>
          <option value="gauge">Meter / Gauge</option>
          <option value="kpi">Statistic / KPI Card</option>
        </select>
        <svg class="ap-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4,6 8,10 12,6"/></svg>
      </div>
    </div>

    <div class="ap-group">
      <label class="ap-label">Media &amp; Content</label>
      <div class="ap-select-wrap">
        <select class="ap-select" id="ap-mediaContent">
          <option value="">Select media &amp; content</option>
          <option value="image">Image</option>
          <option value="video">Video Player</option>
          <option value="audio">Audio Player</option>
          <option value="carousel">Carousel / Gallery</option>
          <option value="avatar">Avatar</option>
          <option value="media-object">Media Object</option>
        </select>
        <svg class="ap-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4,6 8,10 12,6"/></svg>
      </div>
    </div>

    <div class="ap-group">
      <label class="ap-label">Feedback &amp; Messaging</label>
      <div class="ap-select-wrap">
        <select class="ap-select" id="ap-feedbackMessaging">
          <option value="">Select feedback &amp; messaging</option>
          <option value="toast">Toast / Snackbar</option>
          <option value="tooltip">Tooltip</option>
          <option value="popover">Popover</option>
          <option value="notification">Notification Badge</option>
          <option value="alert">Alert / Banner</option>
          <option value="confirm-dialog">Confirmation Dialog</option>
          <option value="empty-state">Empty State</option>
          <option value="skeleton">Skeleton Loader</option>
        </select>
        <svg class="ap-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4,6 8,10 12,6"/></svg>
      </div>
    </div>

  </div>
</div>

<style>
  .ap-panel { padding: 12px 10px; display: flex; flex-direction: column; gap: 14px; }
  .ap-group { display: flex; flex-direction: column; gap: 5px; }
  .ap-label { font-size: 11px; font-weight: 600; color: var(--fg-dim); text-transform: uppercase; letter-spacing: 0.4px; }
  .ap-select-wrap { position: relative; }
  .ap-select {
    width: 100%; height: 30px; padding: 0 28px 0 10px;
    background: var(--bg-input); border: 1px solid var(--border);
    border-radius: 5px; color: var(--fg); font-family: var(--vscode-font-family);
    font-size: 12px; cursor: pointer; appearance: none; outline: none;
    transition: border-color 0.15s;
  }
  .ap-select:focus, .ap-select:hover { border-color: var(--blue); }
  .ap-select option { background: var(--bg-input); color: var(--fg); }
  .ap-chevron {
    position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
    width: 12px; height: 12px; color: var(--fg-dim); pointer-events: none;
  }
</style>
`;
}
//# sourceMappingURL=actionsPanel.js.map