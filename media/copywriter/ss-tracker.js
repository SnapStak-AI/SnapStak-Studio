/**
 * SnapStak Page Tracker
 * Loaded into the project page via a <script src> tag injected into index.html.
 * Sits idle on page load. Activates when it receives:
 *   window.postMessage({ command: 'ss_start', tab: 'copywriter' })
 * Posts COPYWRITER_SELECTION_COMPLETE back to window.parent when done.
 *
 * Derived from Enterprise Element Highlighter v2.9.0 — stripped to selection core only.
 */

(function () {
    'use strict';

    const Z = 2147483647;

    const EVENT_OPTIONS = {
        passive: { passive: true },
        capture: { capture: true },
        capturePassive: { capture: true, passive: true }
    };

    // ─── Safe element access ────────────────────────────────────

    const SafeEl = {
        getTagName: function (el) { try { return el.tagName ? el.tagName.toLowerCase() : ''; } catch (e) { return ''; } },
        getRect: function (el) {
            try { const r = el.getBoundingClientRect(); return { top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; }
            catch (e) { return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }; }
        }
    };

    // ─── Utils ──────────────────────────────────────────────────

    const Utils = {
        throttle: function (fn, delay) {
            let tid, last = 0;
            const t = function () { const now = Date.now(); if (now - last > delay) { fn.apply(this, arguments); last = now; } else { clearTimeout(tid); tid = setTimeout(() => { fn.apply(this, arguments); last = Date.now(); }, delay - (now - last)); } };
            t.cancel = function () { clearTimeout(tid); };
            return t;
        },
        debounce: function (fn, delay) {
            let tid;
            const d = function () { clearTimeout(tid); tid = setTimeout(() => fn.apply(this, arguments), delay); };
            d.cancel = function () { clearTimeout(tid); };
            return d;
        },
        isValid: function (el) { return el && el.nodeType === Node.ELEMENT_NODE && el !== document.body && el !== document.documentElement && SafeEl.getTagName(el) !== 'html'; },
        uid: function () { return Date.now().toString(36) + Math.random().toString(36).substr(2); }
    };

    // ─── DOM helpers ─────────────────────────────────────────────

    function appendToBody(el) {
        if (!document.body || !el) { return; }
        el.style.setProperty('z-index', String(Z), 'important');
        el.style.setProperty('position', 'fixed', 'important');
        el.style.setProperty('margin', '0', 'important');
        el.style.setProperty('inset', 'unset', 'important');
        if (typeof el.showPopover === 'function') { el.setAttribute('popover', 'manual'); }
        if (!document.body.contains(el)) { document.body.appendChild(el); }
    }

    function enterTopLayer(el) {
        if (!el || typeof el.showPopover !== 'function') { return; }
        try { if (el.matches(':popover-open')) { el.hidePopover(); } el.showPopover(); } catch (e) { }
    }

    // ─── CSS ─────────────────────────────────────────────────────

    (function () {
        if (document.getElementById('ss-tracker-styles')) { return; }
        const s = document.createElement('style');
        s.id = 'ss-tracker-styles';
        s.textContent = `
      .ss-ov{position:fixed!important;pointer-events:none!important;box-sizing:border-box!important;z-index:${Z}!important;border:1px dashed rgba(56,189,248,0.7)!important;background:rgba(56,189,248,0.06)!important;border-radius:2px!important;transition:none!important;}
      .ss-ov.ss-h{display:none!important;}
      .ss-ov.ss-sel{border:2px solid #38BDF8!important;background:rgba(56,189,248,0.10)!important;}
      .ss-ctx{position:fixed!important;z-index:${Z}!important;background:#1a1a1a!important;border:1px solid #3a3a3a!important;border-radius:6px!important;padding:4px 0!important;min-width:160px!important;box-shadow:0 4px 16px rgba(0,0,0,0.5)!important;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif!important;font-size:13px!important;pointer-events:auto!important;}
      .ss-ctx-item{padding:7px 14px!important;color:#e4e4e7!important;cursor:pointer!important;user-select:none!important;white-space:nowrap!important;}
      .ss-ctx-item:hover{background:#2a2a2a!important;}
      .ss-ctx-item.danger{color:#ef4444!important;}
      .ss-ctx-item.primary{color:#38BDF8!important;font-weight:600!important;}
      .ss-ctx-sep{height:1px!important;background:#2e2e2e!important;margin:4px 0!important;}
      #ss-tracker-toolbar button{border:none!important;border-radius:5px!important;padding:4px 10px!important;font-size:12px!important;cursor:pointer!important;font-family:inherit!important;}
    `;
        document.head.appendChild(s);
    })();

    // ─── PageTracker ─────────────────────────────────────────────

    class PageTracker {
        constructor() {
            this.id = Utils.uid();
            this.isActive = false;
            this.isDestroyed = false;
            this.hovering = true;
            this.multiMode = false;
            this.contentMode = 'text';
            this.selected = new Set();
            this.overlays = new Map();
            this.borderTargets = new Map();
            this.hoverOv = null;
            this.ctxMenu = null;
            this.rightClicked = null;
            this.isScrolling = false;
            this._raf = null;

            this.bh = {
                mm: Utils.throttle(this._mm.bind(this), 16),
                ml: this._ml.bind(this),
                clk: this._clk.bind(this),
                mdn: this._mdn.bind(this),
                mup: this._mup.bind(this),
                ctx: this._ctx.bind(this),
                kdn: this._kdn.bind(this),
                dclk: this._dclk.bind(this),
                rsz: Utils.debounce(this._rsz.bind(this), 100),
                scr: this._scr.bind(this),
                scre: Utils.debounce(this._scre.bind(this), 150),
                cMdn: (e) => { e.stopPropagation(); e.preventDefault(); },
                cClk: (e) => { e.stopPropagation(); e.preventDefault(); }
            };

            if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', () => this._setup()); }
            else { this._setup(); }
        }

        _setup() {
            if (this.isDestroyed || this.isActive) { return; }
            // Re-inject styles if they were removed by a previous destroy()
            if (!document.getElementById('ss-tracker-styles')) {
                const s = document.createElement('style');
                s.id = 'ss-tracker-styles';
                s.textContent = `
      .ss-ov{position:fixed!important;pointer-events:none!important;box-sizing:border-box!important;z-index:${Z}!important;border:1px dashed rgba(56,189,248,0.7)!important;background:rgba(56,189,248,0.06)!important;border-radius:2px!important;transition:none!important;}
      .ss-ov.ss-h{display:none!important;}
      .ss-ov.ss-sel{border:2px solid #38BDF8!important;background:rgba(56,189,248,0.10)!important;}
      .ss-ctx{position:fixed!important;z-index:${Z}!important;background:#1a1a1a!important;border:1px solid #3a3a3a!important;border-radius:6px!important;padding:4px 0!important;min-width:160px!important;box-shadow:0 4px 16px rgba(0,0,0,0.5)!important;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif!important;font-size:13px!important;pointer-events:auto!important;}
      .ss-ctx-item{padding:7px 14px!important;color:#e4e4e7!important;cursor:pointer!important;user-select:none!important;white-space:nowrap!important;}
      .ss-ctx-item:hover{background:#2a2a2a!important;}
      .ss-ctx-item.danger{color:#ef4444!important;}
      .ss-ctx-item.primary{color:#38BDF8!important;font-weight:600!important;}
      .ss-ctx-sep{height:1px!important;background:#2e2e2e!important;margin:4px 0!important;}
      #ss-tracker-toolbar button{border:none!important;border-radius:5px!important;padding:4px 10px!important;font-size:12px!important;cursor:pointer!important;font-family:inherit!important;}
    `;
                document.head.appendChild(s);
            }
            this._mkHoverOv();
            this._addListeners();
            this.isActive = true;
        }

        // ── Hover overlay ────────────────────────────────────────────

        _mkHoverOv() {
            this.hoverOv = document.createElement('div');
            this.hoverOv.className = 'ss-ov ss-h';
            this.hoverOv.setAttribute('aria-hidden', 'true');
            this.hoverOv.setAttribute('data-ss', 'true');
            appendToBody(this.hoverOv);
        }

        _showHover(el) {
            if (!this.hoverOv || !el || !Utils.isValid(el) || this._isOurs(el)) { this._hideHover(); return; }
            const r = SafeEl.getRect(el);
            if (!r.width && !r.height) { this._hideHover(); return; }
            this.hoverOv.style.left = r.left + 'px';
            this.hoverOv.style.top = r.top + 'px';
            this.hoverOv.style.width = r.width + 'px';
            this.hoverOv.style.height = r.height + 'px';
            this.hoverOv.classList.remove('ss-h');
            enterTopLayer(this.hoverOv);
        }

        _hideHover() {
            if (!this.hoverOv) { return; }
            this.hoverOv.classList.add('ss-h');
            if (typeof this.hoverOv.hidePopover === 'function' && this.hoverOv.matches(':popover-open')) {
                try { this.hoverOv.hidePopover(); } catch (e) { }
            }
        }

        // ── Selection overlays ────────────────────────────────────────

        _mkSelOv(el) {
            const ov = document.createElement('div');
            ov.className = 'ss-ov ss-sel';
            ov.setAttribute('aria-hidden', 'true');
            ov.setAttribute('data-ss', 'true');
            appendToBody(ov);
            this.overlays.set(el, ov);
            return ov;
        }

        _rmSelOv(el) {
            const ov = this.overlays.get(el);
            if (ov) { if (ov.parentNode) { ov.parentNode.removeChild(ov); } this.overlays.delete(el); }
        }

        _posOv(el, ov) {
            if (!ov || !el) { return; }
            const r = SafeEl.getRect(el);
            ov.style.left = r.left + 'px';
            ov.style.top = r.top + 'px';
            ov.style.width = r.width + 'px';
            ov.style.height = r.height + 'px';
        }

        _showOv(ov) { if (!ov) { return; } ov.classList.remove('ss-h'); enterTopLayer(ov); }

        // ── Selection management ──────────────────────────────────────

        _add(el) {
            if (!Utils.isValid(el) || this._isOurs(el)) { return; }
            this.borderTargets.set(el, el);
            this.selected.add(el);
            const ov = this._mkSelOv(el);
            this._posOv(el, ov);
            this._showOv(ov);
            this.hovering = false;
            try { window.parent.postMessage({ type: 'SS_SELECTION_CHANGED', count: this.selected.size }, '*'); } catch (e) { }
        }

        _remove(el) {
            this.selected.delete(el);
            this.borderTargets.delete(el);
            this._rmSelOv(el);
            if (this.selected.size === 0) { this.hovering = true; }
            try { window.parent.postMessage({ type: 'SS_SELECTION_CHANGED', count: this.selected.size }, '*'); } catch (e) { }
        }

        _deselectAll() {
            for (const el of this.overlays.keys()) { this._rmSelOv(el); }
            this.selected.clear();
            this.borderTargets.clear();
            this.hovering = true;
            this._hideHover();
            this._rmCtx();
            try { window.parent.postMessage({ type: 'SS_SELECTION_CHANGED', count: this.selected.size }, '*'); } catch (e) { }
        }

        // ── Event listeners ───────────────────────────────────────────

        _addListeners() {
            document.addEventListener('mousemove', this.bh.mm, EVENT_OPTIONS.passive);
            document.addEventListener('mouseleave', this.bh.ml, EVENT_OPTIONS.passive);
            document.addEventListener('click', this.bh.clk, EVENT_OPTIONS.capture);
            document.addEventListener('mousedown', this.bh.mdn, EVENT_OPTIONS.capture);
            document.addEventListener('mouseup', this.bh.mup, EVENT_OPTIONS.capture);
            document.addEventListener('contextmenu', this.bh.ctx, EVENT_OPTIONS.capture);
            document.addEventListener('keydown', this.bh.kdn, EVENT_OPTIONS.capture);
            document.addEventListener('click', this.bh.dclk);
            window.addEventListener('resize', this.bh.rsz, EVENT_OPTIONS.passive);
            window.addEventListener('scroll', this.bh.scr, EVENT_OPTIONS.passive);
            window.addEventListener('scroll', this.bh.scre, EVENT_OPTIONS.passive);
            document.addEventListener('scroll', this.bh.scr, EVENT_OPTIONS.capturePassive);
            document.addEventListener('scroll', this.bh.scre, EVENT_OPTIONS.capturePassive);
        }

        _rmListeners() {
            document.removeEventListener('mousemove', this.bh.mm, EVENT_OPTIONS.passive);
            document.removeEventListener('mouseleave', this.bh.ml, EVENT_OPTIONS.passive);
            document.removeEventListener('click', this.bh.clk, EVENT_OPTIONS.capture);
            document.removeEventListener('mousedown', this.bh.mdn, EVENT_OPTIONS.capture);
            document.removeEventListener('mouseup', this.bh.mup, EVENT_OPTIONS.capture);
            document.removeEventListener('contextmenu', this.bh.ctx, EVENT_OPTIONS.capture);
            document.removeEventListener('keydown', this.bh.kdn, EVENT_OPTIONS.capture);
            document.removeEventListener('click', this.bh.dclk);
            window.removeEventListener('resize', this.bh.rsz, EVENT_OPTIONS.passive);
            window.removeEventListener('scroll', this.bh.scr, EVENT_OPTIONS.passive);
            window.removeEventListener('scroll', this.bh.scre, EVENT_OPTIONS.passive);
            document.removeEventListener('scroll', this.bh.scr, EVENT_OPTIONS.capturePassive);
            document.removeEventListener('scroll', this.bh.scre, EVENT_OPTIONS.capturePassive);
        }

        // ── Handlers ─────────────────────────────────────────────────

        _mm(e) {
            if (this.isDestroyed) { return; }
            let el = document.elementFromPoint(e.clientX, e.clientY);
            if (el && el.ownerSVGElement) { el = el.ownerSVGElement; }
            if (this.hovering) { this._showHover(el); }
        }

        _ml() { if (this.hovering && !this.isDestroyed) { this._hideHover(); } }

        _mdn(e) { if (e.button === 2) { this._rpending = true; } }

        _mup(e) { if (e.button === 2) { this._rpending = false; } }

        _clk(e) {
            if (this.isDestroyed) { return; }
            if (this.ctxMenu && this.ctxMenu.contains(e.target)) { return; }
            if (e.button === 2) { return; }

            let el = document.elementFromPoint(e.clientX, e.clientY);
            if (el && el.ownerSVGElement) { el = el.ownerSVGElement; }
            if (!Utils.isValid(el) || this._isOurs(el)) { return; }

            e.preventDefault();
            e.stopPropagation();

            // Group mode — select the clicked element as root, wait for Send to Copywriter button.
            if (this.contentMode === 'group') {
                this._deselectAll();
                this._add(el);
                return;
            }

            const ctrl = e.ctrlKey || e.metaKey || this.multiMode;

            if (this.selected.has(el)) {
                this._remove(el);
            } else if (ctrl || this.selected.size === 0) {
                this._add(el);
            } else {
                this._deselectAll();
                this._add(el);
            }
        }

        _ctx(e) {
            if (this.isDestroyed) { return; }
            e.preventDefault();
            e.stopPropagation();
            if (this.selected.size === 0) { return; }

            let el = document.elementFromPoint(e.clientX, e.clientY);
            if (el && el.ownerSVGElement) { el = el.ownerSVGElement; }

            const onSel = Array.from(this.selected).some(s => {
                try {
                    const r = s.getBoundingClientRect();
                    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) { return true; }
                    return s.contains(el);
                } catch (_) { return false; }
            });

            if (onSel) { this.rightClicked = el; this._showCtx(e.clientX, e.clientY); }
            else { this._rmCtx(); }
        }

        _showCtx(x, y) {
            this._rmCtx();
            const menu = document.createElement('div');
            menu.className = 'ss-ctx';
            menu.setAttribute('data-ss', 'true');
            menu.style.setProperty('pointer-events', 'auto', 'important');

            const add = (label, action, cls) => {
                const item = document.createElement('div');
                item.className = 'ss-ctx-item' + (cls ? ' ' + cls : '');
                item.textContent = label;
                item.addEventListener('click', (ev) => { ev.stopPropagation(); ev.preventDefault(); this._rmCtx(); this._ctxAction(action); });
                menu.appendChild(item);
            };

            add('Deselect', 'deselect', 'danger');
            const sep = document.createElement('div'); sep.className = 'ss-ctx-sep'; menu.appendChild(sep);
            add('Done — send to Copywriter', 'done', 'primary');

            menu.addEventListener('mousedown', this.bh.cMdn);
            menu.addEventListener('click', this.bh.cClk);
            appendToBody(menu);
            this.ctxMenu = menu;

            const vw = window.innerWidth || document.documentElement.clientWidth;
            const vh = window.innerHeight || document.documentElement.clientHeight;
            menu.style.left = '0px'; menu.style.top = '0px';
            const mw = menu.offsetWidth || 180, mh = menu.offsetHeight || 80;
            let lx = x, ly = y;
            if (lx + mw > vw) { lx = vw - mw - 4; }
            if (ly + mh > vh) { ly = vh - mh - 4; }
            if (lx < 0) { lx = 4; } if (ly < 0) { ly = 4; }
            menu.style.left = lx + 'px'; menu.style.top = ly + 'px';
        }

        _rmCtx() {
            if (this.ctxMenu) { if (this.ctxMenu.parentNode) { this.ctxMenu.parentNode.removeChild(this.ctxMenu); } this.ctxMenu = null; }
        }

        _ctxAction(action) {
            if (action === 'deselect') {
                if (this.rightClicked) {
                    const target = Array.from(this.selected).find(s => s === this.rightClicked || s.contains(this.rightClicked));
                    if (target) { this._remove(target); }
                }
                this.rightClicked = null;
            } else if (action === 'done') {
                this._finish();
            }
        }

        _dclk(e) { if (this.ctxMenu && !this.ctxMenu.contains(e.target)) { this._rmCtx(); } }

        _kdn(e) {
            if (this.isDestroyed) { return; }
            if (e.key === 'Escape' || e.keyCode === 27) {
                e.preventDefault(); e.stopPropagation();
                if (this.ctxMenu) { this._rmCtx(); return; }
                if (this.selected.size > 0) { this._deselectAll(); }
            }
        }

        // ── Scroll / resize ───────────────────────────────────────────

        _rsz() {
            if (this.isDestroyed) { return; }
            for (const [el, ov] of this.overlays.entries()) { this._posOv(this.borderTargets.get(el) || el, ov); }
        }

        _scr() {
            if (this.isDestroyed) { return; }
            this.isScrolling = true;
            this._hideHover();
            for (const [el, ov] of this.overlays.entries()) { this._posOv(this.borderTargets.get(el) || el, ov); }
            if (!this._raf) { this._startRAF(); }
            this.bh.scre();
        }

        _startRAF() {
            this.isScrolling = true;
            this._hideHover();
            const tick = () => {
                if (this.isDestroyed) { this._raf = null; return; }
                if (this.isScrolling) {
                    this._hideHover();
                    for (const [el, ov] of this.overlays.entries()) { this._posOv(this.borderTargets.get(el) || el, ov); }
                    this._raf = requestAnimationFrame(tick);
                } else { this._raf = null; }
            };
            this._raf = requestAnimationFrame(tick);
        }

        _scre() {
            if (this.isDestroyed) { return; }
            this.isScrolling = false;
            if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
            for (const [el, ov] of this.overlays.entries()) {
                this._posOv(this.borderTargets.get(el) || el, ov);
                this._showOv(ov);
            }
        }

        // ── Helpers ───────────────────────────────────────────────────

        _isOurs(el) {
            if (!el) { return false; }
            return (el.getAttribute && el.getAttribute('data-ss') === 'true') || el.id === 'ss-tracker-toolbar' || el.id === 'ss-tracker-styles';
        }

        // ── Group extraction ─────────────────────────────────────────

        _isHiddenEl(el) {
            try {
                const tag = SafeEl.getTagName(el).toUpperCase();
                if (tag === 'OPTION') { return !el.selected; }
                const cs = window.getComputedStyle(el);
                if (cs.display === 'none') { return true; }
                if (cs.visibility === 'hidden') { return true; }
                if (parseFloat(cs.opacity) === 0) { return true; }
                if (parseFloat(cs.height) === 0 && cs.overflow === 'hidden') { return true; }
                const details = el.closest('details');
                if (details && !details.open) { return true; }
            } catch (e) { }
            return false;
        }

        _extractGroupBlocks(rootEl) {
            const self = this;
            const headingTags = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);
            const skipTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'CANVAS', 'IFRAME', 'VIDEO', 'AUDIO', 'PICTURE', 'SOURCE']);
            const textTags = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'DD', 'FIGCAPTION', 'SPAN', 'DIV', 'A', 'OPTION', 'TD', 'TH', 'LABEL', 'BUTTON']);

            function typo(el) {
                try {
                    const cs = window.getComputedStyle(el);
                    return { fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, color: cs.color, lineHeight: cs.lineHeight, textTransform: cs.textTransform, letterSpacing: cs.letterSpacing, textAlign: cs.textAlign };
                } catch (e) { return {}; }
            }

            function makeNode(el) {
                const tag = SafeEl.getTagName(el).toUpperCase();
                const text = (el.innerText || el.textContent || '').trim();
                const wc = text ? (text.match(/ /g) || []).length + 1 : 0;
                return { tag, text, wordCount: wc, outerHTML: el.outerHTML, typography: typo(el), isHidden: self._isHiddenEl(el) };
            }

            function isRewriteable(el) {
                const text = (el.textContent || '').trim();
                if (!text) { return false; }
                if (el.closest('table') || el.closest('select')) { return false; }
                const tag = SafeEl.getTagName(el).toUpperCase();
                if (tag === 'TD' || tag === 'TH' || tag === 'OPTION') { return false; }
                // Skip pure number/symbol strings (timestamps, counts, icons)
                if (/^[\d\s\:\.\-\/\+\#\@\!\%]+$/.test(text)) { return false; }
                return true;
            }

            function collectLeaves(root) {
                const leaves = [];
                const visited = new Set();
                function walk(el) {
                    if (!el || el.nodeType !== Node.ELEMENT_NODE) { return; }
                    const tag = SafeEl.getTagName(el).toUpperCase();
                    if (skipTags.has(tag)) { return; }
                    const text = (el.textContent || '').trim();
                    if (!text) { return; }
                    if (textTags.has(tag)) {
                        // Always descend if this element has child elements.
                        // This handles accordion rows where a single wrapper DIV contains
                        // both the visible heading and the hidden panel children.
                        if (el.children.length > 0) {
                            for (let i = 0; i < el.children.length; i++) { walk(el.children[i]); }
                            return;
                        }
                        // True leaf — no child elements, just a text node
                        if (!visited.has(el)) { visited.add(el); leaves.push(el); }
                        return;
                    }
                    for (let i = 0; i < el.children.length; i++) { walk(el.children[i]); }
                }
                walk(root);
                return leaves;
            }

            function buildGroups(leaves) {
                const groups = [];
                let current = null;
                let foundFirstHeading = false;
                let preLabel = null;
                for (let i = 0; i < leaves.length; i++) {
                    const el = leaves[i];
                    const tag = SafeEl.getTagName(el).toUpperCase();
                    const node = makeNode(el);
                    if (headingTags.has(tag)) {
                        foundFirstHeading = true;
                        current = { blockId: 'block_' + Utils.uid(), isGroup: true, label: preLabel || null, parent: node, children: [] };
                        preLabel = null;
                        groups.push(current);
                    } else {
                        if (!foundFirstHeading) {
                            if (!preLabel) { preLabel = node; }
                        } else if (current) {
                            current.children.push(node);
                        } else {
                            current = { blockId: 'block_' + Utils.uid(), isGroup: true, label: null, parent: node, children: [] };
                            groups.push(current);
                        }
                    }
                }
                // If no H1-H6 found, first leaf = parent, rest = children
                if (!foundFirstHeading && groups.length === 0 && leaves.length > 0) {
                    const firstNode = makeNode(leaves[0]);
                    const children = [];
                    for (let i = 1; i < leaves.length; i++) { children.push(makeNode(leaves[i])); }
                    groups.push({ blockId: 'block_' + Utils.uid(), isGroup: true, label: null, parent: firstNode, children: children });
                } else if (!foundFirstHeading && groups.length === 1 && groups[0].children.length > 0) {
                    groups[0].parent = groups[0].children.shift();
                }
                return groups;
            }

            const allLeaves = collectLeaves(rootEl);
            if (!allLeaves.some(isRewriteable)) { return []; }

            // Find repeating peer structure — check direct children first,
            // then one level deeper if direct children don't qualify.
            function findPeerGroups(candidates) {
                if (candidates.length < 3) { return null; }
                const tagCounts = {};
                candidates.forEach(function (c) {
                    const t = SafeEl.getTagName(c).toUpperCase();
                    tagCounts[t] = (tagCounts[t] || 0) + 1;
                });
                const dominantTag = Object.keys(tagCounts).reduce(function (a, b) {
                    return tagCounts[a] >= tagCounts[b] ? a : b;
                });
                const dominantCount = tagCounts[dominantTag];
                if (dominantCount >= 3 && dominantCount / candidates.length >= 0.6) {
                    return candidates.filter(function (c) {
                        return SafeEl.getTagName(c).toUpperCase() === dominantTag;
                    });
                }
                return null;
            }

            function buildFromPeers(peers) {
                const allGroups = [];
                for (let i = 0; i < peers.length; i++) {
                    const childLeaves = collectLeaves(peers[i]);
                    if (!childLeaves.some(isRewriteable)) { continue; }
                    const groups = buildGroups(childLeaves);
                    groups.forEach(function (g) { allGroups.push(g); });
                }
                return allGroups;
            }

            // Level 1: direct children of root
            const directChildren = Array.from(rootEl.children).filter(function (c) {
                return !skipTags.has(SafeEl.getTagName(c).toUpperCase());
            });
            const peers1 = findPeerGroups(directChildren);
            if (peers1) {
                const groups1 = buildFromPeers(peers1);
                if (groups1.length > 0) { return groups1; }
            }

            // Level 2: grandchildren — find which direct child contains the repeating structure
            for (let i = 0; i < directChildren.length; i++) {
                const grandChildren = Array.from(directChildren[i].children).filter(function (c) {
                    return !skipTags.has(SafeEl.getTagName(c).toUpperCase());
                });
                const peers2 = findPeerGroups(grandChildren);
                if (peers2) {
                    const groups2 = buildFromPeers(peers2);
                    if (groups2.length > 0) { return groups2; }
                }
            }

            return buildGroups(allLeaves);
        }

        // ── Finish ────────────────────────────────────────────────────

        _finish() {
            if (this.contentMode === 'group') {
                // Get the single selected root element
                const rootEl = this.selected.values().next().value;
                if (!rootEl) { return; }
                const self = this;
                const root = rootEl;
                const groupBlocks = this._extractGroupBlocks(root);
                groupBlocks.forEach(function (gb, i) {
                });
                const hasContent = groupBlocks.some(function (gb) {
                    return gb.parent || (gb.children && gb.children.length > 0);
                });
                if (!hasContent) {
                    this.destroy();
                    try { window.parent.postMessage({ type: 'SS_GROUP_NO_CONTENT' }, '*'); } catch (e) { }
                    return;
                }
                // Capture root label (e.g. "SINGLE-SEATERS")
                var rootLabel = null;
                try {
                    var rootChildren = Array.from(root.children);
                    for (var ri = 0; ri < rootChildren.length; ri++) {
                        var rc = rootChildren[ri];
                        var rcTag = SafeEl.getTagName(rc).toUpperCase();
                        var rcText = (rc.textContent || '').trim();
                        if (rcText && rc.children.length === 0) {
                            var rcTypo = {};
                            try {
                                var cs = window.getComputedStyle(rc);
                                rcTypo = { fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, color: cs.color, lineHeight: cs.lineHeight, textTransform: cs.textTransform, letterSpacing: cs.letterSpacing, textAlign: cs.textAlign };
                            } catch (e2) { }
                            rootLabel = { tag: rcTag, text: rcText, typography: rcTypo };
                            break;
                        }
                    }
                } catch (e) { }
                this.destroy();
                try { window.parent.postMessage({ type: 'COPYWRITER_SELECTION_COMPLETE', payload: groupBlocks, isGroupMode: true, rootLabel: rootLabel }, '*'); }
                catch (e) { window.postMessage({ type: 'COPYWRITER_SELECTION_COMPLETE', payload: groupBlocks, isGroupMode: true, rootLabel: rootLabel }, '*'); }
                return;
            }
            const blocks = this._buildBlocks();
            this.destroy();
            try { window.parent.postMessage({ type: 'COPYWRITER_SELECTION_COMPLETE', payload: blocks }, '*'); }
            catch (e) { window.postMessage({ type: 'COPYWRITER_SELECTION_COMPLETE', payload: blocks }, '*'); }
        }

        _buildBlocks() {
            const blocks = [];
            for (const el of this.selected) {
                const tag = SafeEl.getTagName(el).toUpperCase();
                const text = (el.innerText || el.textContent || '').trim();
                const wc = text ? (text.match(/ /g) || []).length + 1 : 0;

                let typography = {};
                try {
                    const cs = window.getComputedStyle(el);
                    typography = {
                        fontFamily: cs.fontFamily,
                        fontSize: cs.fontSize,
                        fontWeight: cs.fontWeight,
                        color: cs.color,
                        lineHeight: cs.lineHeight,
                        textTransform: cs.textTransform,
                        letterSpacing: cs.letterSpacing,
                        textAlign: cs.textAlign
                    };
                } catch (e) { }

                blocks.push({ blockId: 'block_' + Utils.uid(), tag, text, wordCount: wc, outerHTML: el.outerHTML, typography, isGroup: this.contentMode === 'group' });
            }
            return blocks;
        }

        // ── Destroy ───────────────────────────────────────────────────

        destroy() {
            if (this.isDestroyed) { return; }
            this.isDestroyed = true;
            this.isActive = false;
            this.bh.mm.cancel();
            this.bh.rsz.cancel();
            this.bh.scre.cancel();
            if (this._raf) { cancelAnimationFrame(this._raf); }
            this._rmListeners();
            if (this.hoverOv && this.hoverOv.parentNode) {
                try { if (typeof this.hoverOv.hidePopover === 'function' && this.hoverOv.matches(':popover-open')) { this.hoverOv.hidePopover(); } } catch (e) { }
                this.hoverOv.parentNode.removeChild(this.hoverOv);
            }
            for (const ov of this.overlays.values()) {
                try { if (typeof ov.hidePopover === 'function' && ov.matches(':popover-open')) { ov.hidePopover(); } } catch (e) { }
                if (ov.parentNode) { ov.parentNode.removeChild(ov); }
            }
            this._rmCtx();
            const st = document.getElementById('ss-tracker-styles'); if (st) { st.parentNode.removeChild(st); }
            this.selected.clear();
            this.overlays.clear();
            this.borderTargets.clear();
            this.bh = null;
            window.__snapstakTrackerActive = false;
        }
    }

    // ─── Boot ─────────────────────────────────────────────────────
    // Script loads with the page but stsays idle.
    // Activates only when it receives { command: 'ss_start' } via postMessage.
    // This allows the script to be present in the page from initial load
    // without interfering with normal page behaviour.

    window.addEventListener('message', function (e) {
        if (!e.data) { return; }

        if (e.data.command === 'ss_start') {
            if (window.__snapstakTrackerActive) { return; }
            window.__snapstakTrackerActive = true;
            window.__snapstakTracker = new PageTracker();
            return;
        }

        const t = window.__snapstakTracker;
        if (!t || t.isDestroyed) { return; }

        if (e.data.command === 'ss_set_mode') { t.multiMode = !!e.data.multi; return; }
        if (e.data.command === 'ss_set_content_mode') { t.contentMode = e.data.mode || 'text'; return; }
        if (e.data.command === 'ss_clear') { t._deselectAll(); return; }
        if (e.data.command === 'ss_done') { t._finish(); return; }
        if (e.data.command === 'ss_stop') { t.destroy(); return; }
    });

    window.addEventListener('beforeunload', () => {
        if (window.__snapstakTracker) { window.__snapstakTracker.destroy(); }
    });

})();