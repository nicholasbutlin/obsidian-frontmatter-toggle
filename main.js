'use strict';

/*
 * Frontmatter Toggle — local Obsidian plugin
 *
 * Adds:
 *   - A ribbon button (left sidebar) that toggles frontmatter visibility.
 *   - A command "Toggle frontmatter visibility" for hotkey binding.
 *   - An inline button under the title of every note, kept in sync.
 *
 * State is persisted in the plugin's data.json (per-vault, survives restarts).
 *
 * Per-note override: a note with `cssclasses: show-frontmatter` always
 * shows its frontmatter regardless of the global toggle.
 */

const obsidian = require('obsidian');

const DEFAULT_SETTINGS = {
  showFrontmatter: false,
};

const BODY_CLASS = 'show-frontmatter';
const INLINE_BTN_CLASS = 'frontmatter-toggle-inline';

// Let the new view DOM settle before we look at it.
const REFRESH_DEBOUNCE_MS = 50;
// Safety-net poll: CodeMirror occasionally rebuilds `.cm-sizer` children
// (e.g. switching reading/edit mode), which would strip our button.
const REFRESH_POLL_MS = 2000;

class FrontmatterTogglePlugin extends obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    this.applyState();

    // ── Ribbon icon ──────────────────────────────────────────────
    this.ribbonEl = this.addRibbonIcon(
      this.currentIcon(),
      this.currentLabel(),
      () => this.toggle(),
    );
    this.ribbonEl.addClass('frontmatter-toggle-ribbon');

    // ── Command palette ──────────────────────────────────────────
    this.addCommand({
      id: 'toggle-frontmatter-visibility',
      name: 'Toggle frontmatter visibility',
      callback: () => this.toggle(),
    });

    // ── Inline button injection ──────────────────────────────────
    const refresh = () => this.scheduleRefresh();

    this.registerEvent(this.app.workspace.on('active-leaf-change', refresh));
    this.registerEvent(this.app.workspace.on('layout-change', refresh));
    this.registerEvent(this.app.workspace.on('file-open', refresh));
    this.registerEvent(this.app.workspace.on('css-change', refresh));

    // Initial injection once the layout is ready
    this.app.workspace.onLayoutReady(() => this.refreshInlineButtons());

    this.registerInterval(
      window.setInterval(() => this.refreshInlineButtons(), REFRESH_POLL_MS),
    );
  }

  onunload() {
    document.body.classList.remove(BODY_CLASS);
    document
      .querySelectorAll('.' + INLINE_BTN_CLASS)
      .forEach((el) => el.remove());
  }

  // ── Settings ───────────────────────────────────────────────────
  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData(),
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // ── State ──────────────────────────────────────────────────────
  applyState() {
    document.body.classList.toggle(BODY_CLASS, this.settings.showFrontmatter);
  }

  currentIcon() {
    return this.settings.showFrontmatter ? 'eye' : 'eye-off';
  }

  // Shared by the ribbon tooltip and the inline button label.
  currentLabel() {
    return this.settings.showFrontmatter
      ? 'Hide frontmatter'
      : 'Show frontmatter';
  }

  async toggle() {
    this.settings.showFrontmatter = !this.settings.showFrontmatter;
    this.applyState();
    await this.saveSettings();

    if (this.ribbonEl) {
      obsidian.setIcon(this.ribbonEl, this.currentIcon());
      this.ribbonEl.setAttribute('aria-label', this.currentLabel());
    }
    this.updateAllInlineButtons();
  }

  // ── Inline buttons ─────────────────────────────────────────────
  scheduleRefresh() {
    window.setTimeout(
      () => this.refreshInlineButtons(),
      REFRESH_DEBOUNCE_MS,
    );
  }

  refreshInlineButtons() {
    this.app.workspace.getLeavesOfType('markdown').forEach((leaf) => {
      const view = leaf.view;
      if (!(view instanceof obsidian.MarkdownView)) return;
      this.injectInto(view);
    });
  }

  injectInto(view) {
    // Inline title elements appear in both reading view and live preview.
    const titles = view.containerEl.querySelectorAll('.inline-title');
    titles.forEach((titleEl) => {
      const next = titleEl.nextElementSibling;
      if (next && next.classList.contains(INLINE_BTN_CLASS)) {
        this.updateButton(next);
        return;
      }
      const btn = this.makeButton();
      titleEl.after(btn);
    });
  }

  makeButton() {
    const btn = document.createElement('button');
    btn.className = INLINE_BTN_CLASS;
    btn.setAttribute('type', 'button');

    // Two children: an icon slot and a label slot — kept stable so we
    // can re-render the icon on toggle without rebuilding the button.
    this.buildButtonChildren(btn);
    this.updateButton(btn);

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    });
    return btn;
  }

  // Creates the icon + label slots and appends them to the button.
  buildButtonChildren(btn) {
    const iconEl = document.createElement('span');
    iconEl.className = 'frontmatter-toggle-inline__icon';
    const labelEl = document.createElement('span');
    labelEl.className = 'frontmatter-toggle-inline__label';
    btn.appendChild(iconEl);
    btn.appendChild(labelEl);
  }

  updateButton(btn) {
    let iconEl = btn.querySelector('.frontmatter-toggle-inline__icon');
    let labelEl = btn.querySelector('.frontmatter-toggle-inline__label');

    // Defensive: if the button predates the icon/label structure
    // (e.g. an older injection), upgrade it in place.
    if (!iconEl || !labelEl) {
      btn.textContent = '';
      this.buildButtonChildren(btn);
      iconEl = btn.querySelector('.frontmatter-toggle-inline__icon');
      labelEl = btn.querySelector('.frontmatter-toggle-inline__label');
    }

    obsidian.setIcon(iconEl, this.currentIcon());
    labelEl.textContent = this.currentLabel();
    btn.setAttribute('aria-pressed', String(this.settings.showFrontmatter));
  }

  updateAllInlineButtons() {
    document
      .querySelectorAll('.' + INLINE_BTN_CLASS)
      .forEach((btn) => this.updateButton(btn));
  }
}

module.exports = FrontmatterTogglePlugin;
