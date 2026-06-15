# Frontmatter Toggle

An [Obsidian](https://obsidian.md) plugin to show or hide YAML frontmatter
(the **Properties** block) across all your notes with a single click.

Frontmatter is useful but visually noisy. This plugin lets you collapse it
out of the way while writing and reveal it when you need it — globally, with
a per-note escape hatch.

## Features

- **Ribbon button** in the left sidebar that toggles frontmatter visibility,
  with an icon that reflects the current state (👁 shown / 🚫 hidden).
- **Command** — *"Toggle frontmatter visibility"* — for binding to a hotkey.
- **Inline button** under each note's title, kept in sync with the global
  state, so you can toggle without leaving the note.
- **Persistent** — the setting is saved per-vault and survives restarts.
- **Per-note override** — force a single note to always show its frontmatter
  regardless of the global toggle (see below).
- Works in **Reading view**, **Live Preview**, and **Source mode**.

## Per-note override

To always show frontmatter for a specific note — even when it's globally
hidden — add `show-frontmatter` to that note's `cssclasses`:

```yaml
---
cssclasses: show-frontmatter
---
```

## Installation

This plugin isn't in the community catalogue, so install it from GitHub.

### Via BRAT (recommended — gets updates automatically)

1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) community
   plugin and enable it.
2. Run the command **BRAT: Add a beta plugin for testing** and paste this
   repo's URL:

   ```
   https://github.com/nicholasbutlin/obsidian-frontmatter-toggle
   ```

3. BRAT installs the latest release. Enable **Frontmatter Toggle** under
   **Settings → Community plugins**.

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the
   [latest release](https://github.com/nicholasbutlin/obsidian-frontmatter-toggle/releases/latest).
2. Copy them into your vault at:

   ```
   <your-vault>/.obsidian/plugins/frontmatter-toggle/
   ```

3. In Obsidian, open **Settings → Community plugins** and enable
   **Frontmatter Toggle**.

> The plugin does not ship a `data.json`; on first run it defaults to
> frontmatter **hidden**. Your toggle state is then saved per-vault.

## How it works

Visibility is driven entirely by CSS. The plugin toggles a `show-frontmatter`
class on `<body>`, and `styles.css` hides the `.metadata-container` (and raw
YAML lines in Source mode) unless that class — or a per-view
`show-frontmatter` class from `cssclasses` — is present.

A short interval re-injects the inline button if Obsidian rebuilds the note
DOM (for example when switching between reading and editing modes).

## Development

The repo is the plugin folder itself. With the
[Hot Reload](https://github.com/pjeby/hot-reload) plugin installed, the
`.hotreload` marker file makes Obsidian reload the plugin on save.

There is no build step — `main.js` is committed directly. `npm run build`
validates the shipped artifacts (`main.js` syntax, `manifest.json` /
`versions.json` consistency).

### Releases

Releases are automated with
[semantic-release](https://github.com/semantic-release/semantic-release) on
every push to `main` (see `.github/workflows/release.yml`). The version is
derived from [Conventional Commits](https://www.conventionalcommits.org)
(`fix:` → patch, `feat:` → minor, `feat!:` → major), which updates
`manifest.json` / `versions.json` and publishes a GitHub release with the
plugin assets attached. Bump `minAppVersion` by hand in `manifest.json` when
you start relying on a newer Obsidian API.

## License

[MIT](LICENSE)
