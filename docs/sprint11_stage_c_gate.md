# arkaneworks — Sprint 11 Stage C gate note (aether portfolio case study)

This note lives in the **arkaneworks website repo** and records the aether-Sprint-11 Stage C work that
touches this repo: the `ape.html` case-study page and its live-demo embed facade. (The aether-side gate
reports live in the aether repo under `docs/reports/`.)

## Stage C — APPROVED as built

The reviewer approved the `ape.html` revamp (commit `fa84f0e`):

- **Website-preservation proof clean** — `styles.css` + `script.js` byte-identical by `shasum`;
  `git diff --name-only` = `ape.html`; no dashboard colour in the page's own CSS.
- Content leads with the **C3/C4 failures**; figures all from the aether snippet `docs/key_results.json`
  stamped **"as of aether `91620d5`"**; the **F5** Carbon Mapper boundary intact; the
  planetary-engine / lunar / SDA / exoplanet cosmology absent.

## Stage C EXTENSION — live-demo embed facade (consciously scoped expansion)

A **click-to-load facade** (not an inline iframe) was added, opening the live tool in a **new tab**.

**Why a facade, not an iframe.** The dashboard API enforces a tight CORS / origin allowlist
(`aether.arkaneworks.co` only, by the Sprint 10 hardening this case study advertises). Iframing it on
`arkaneworks.co` would hit CORS / framing / Cesium-in-frame breakage and would force loosening that
hardening. So the page shows a static preview placed where the other project pages put their media, with
a **"Launch live dashboard ↗"** control that opens `https://aether.arkaneworks.co` in a new tab
(`target="_blank" rel="noopener"`). No origin was added to any API allowlist; the tool, its API, and the
aether artifacts were not touched.

**Embed markup matches the site's existing pattern.** Each visual reuses the site's own
`<div class="media-container"><img class="project-media project-image">` block (the exact pattern in
`ax10.html` / `ax11.html`). The facade is that same block, wrapped in an `<a class="ape-launch"
target="_blank" rel="noopener">` with a scoped `.ape-launch-cta` launch label. The four cropped
screenshots sit in their own content blocks, each paired with the blurb it illustrates.

### Surviving invariant — re-proven

- **`styles.css` byte-identical** — `shasum` before *and* after: `4639bb5a65738375fde7b08e6bf958ed3e12c02e`.
- **`script.js` byte-identical** — before *and* after: `258e841740ffdd0645bac6f8b6a41dfa3f7ca125`.
- **No other page touched**, shared nav untouched, `lunar.html` untouched (`git diff --name-only` among
  tracked files = `ape.html`).
- **No dashboard colour in the page CSS** — the facade styling (`.ape-launch`, `.ape-launch-cta`) uses
  only shared monochrome tokens (`--ink`, `--panel-glass`, `--line-strong`, `--paper`, `--ease`); the
  only "amber/cyan" string in the file is the comment documenting this rule.
- **New files limited to** `ape.html` + the placeholder assets under `assets/aether/` + this gate note.

### `git diff --stat` (now legitimately exceeds ape.html — image assets added)

```
 ape.html                              | (rewritten in place)
 assets/aether/preview-hero.png        | new (binary)
 assets/aether/globe.png               | new (binary)
 assets/aether/tier-table.png          | new (binary)
 assets/aether/two-lanes.png           | new (binary)
 assets/aether/factor-attribution.png  | new (binary)
 docs/sprint11_stage_c_gate.md         | new (this note)
```

## Placeholder swap-in list

The placeholders are labeled monochrome stand-ins (dimensioned, captioned). **Overwrite each file in
place** with a real capture at the same path and name — the page references fixed paths and the images
are responsive (`project-media`, width 100%), so no markup or layout change is needed. Capture from the
live dashboard at `https://aether.arkaneworks.co`.

| File (in `assets/aether/`) | What to capture | Target dimensions |
|---|---|---|
| `preview-hero.png` | Dashboard overview — the three-event globe with the inspector open (the launch preview) | 1600 × 900 |
| `globe.png` | The three-event globe with all three markers visible (Goturdepe, Permian, NW-India) | 1280 × 800 |
| `tier-table.png` | The per-quantity validation table — C1/C2 VALIDATED, C3/C4 failed with their criteria attached | 1280 × 800 |
| `two-lanes.png` | The two-lanes heat block — 2 m air temperature shown separately from land-surface temperature | 1280 × 800 |
| `factor-attribution.png` | The factor-attribution panel — ranked ridge (capped), the negative-UHI counter-evidence, and the cited-external attribution boundary | 1280 × 800 |

The placeholders were generated with matplotlib as monochrome stand-ins (`#0d0d0d` ground, `#e7e7e2`
text, dashed `#3d3d3d` border) carrying the caption + target size; the generator is throwaway and not
committed (the files are replaced by real captures).

## Held for the gate — NOT pushed

The website deploy (push to the Pages source → `arkaneworks.co/ape`) remains **approval-gated**; the
aether-repo commits remain unpushed. Visual confirmation of the rendered page is the human's step (no
headless browser is available to the agent).
