# YOU · Buy 1 Take 1 — Campaign Kit export

Source: claude.ai Design project `595c387f-c136-4e2d-bad4-2ce7e6b59bb1`
File: **YOU B1T1 Campaign Kit.dc.html**
Exported: 2026-07-20

This folder is a partial export of the design project, pulled through the Design
read API (`DesignSync get_file`). That API **caps file content at 256 KiB and
truncates anything larger**, with no range/offset to page through the rest. So:

- **Text / code files exported here are complete and byte-faithful** — verified
  `truncated: false` on each.
- **Every binary image in the project exceeds 256 KiB and cannot be pulled
  intact** — a truncated PNG/JPG has no end marker and won't open. Those files
  are listed below but are **not** in this folder. Grab them from the design UI
  (see "Getting the images").

## What's included (complete)

```
YOU B1T1 Campaign Kit.dc.html        # the campaign kit document (DC/JSX template + data)
support.js                           # dc-runtime that renders the .dc.html
_ds/you-design-system-.../
  _ds_bundle.js                      # compiled design-system components (Badge, Button, Card,
                                     #   Input, Dialog, Tabs, … + the YOU Store ui_kit)
  styles.css                         # imports every token file
  readme.md                          # full design-system + brand write-up
  tokens/colors.css                  # 13-color clash palette + semantic aliases
  tokens/fonts.css                   # Anton / Bricolage Grotesque / Caveat / Cormorant / Archivo
  tokens/typography.css              # type scale (H1 176px → micro 12px)
  tokens/spacing.css                 # 4px base unit, 4→128px
  tokens/radius.css                  # 0px corners, 2px hairline, no shadows, motion tokens
  tokens/patterns.css                # halftone dot texture + 24-point starburst clip-path
```

## Not exported — binary images (get these from the design UI)

None of these came through intact (all > 256 KiB). Paths are exactly as they
appear in the project.

### Campaign deliverables — `export/` (30 files, the ready-to-post assets)
```
export/01-teaser.png
export/02-launch.png
export/03a-trio-carousel-cover.png
export/03b-trio-carousel-essentials.png
export/03c-trio-carousel-commute.png
export/03d-trio-carousel-gala.png
export/03e-trio-carousel-endcard.png
export/04-bundle-announcement.png
export/05-lifestyle-out-in-the-wild.png
export/06a-bundle-guide-cover.png
export/06b-strawberry-milk-set.png
export/06c-cherry-cola-set.png
export/06d-mint-condition-set.png
export/06e-dirty-matcha-set.png
export/06f-pink-lemonade-set.png
export/06g-espresso-shot-set.png
export/06h-bundle-guide-endcard.png
export/07-reel1-whats-in-her-bag-cover.png
export/08-ugc-this-is-you.png
export/09-bundle-hero-commute.png
export/10-reel2-knot-tutorial-cover.png
export/11-urgency-last-weekend.png
export/12-last-call.png
```

### Logo lockups — `assets/`
```
assets/you-wordmark-black.png
assets/you-wordmark-white.png
```

### Source photography — `uploads/`
Product-set mockups (PNG):
```
uploads/After Hours Set 01.png            uploads/After Hours Set 02.png
uploads/Blue Hour Set 01.png              uploads/Blue Hour Set 02.png
uploads/Blueberry Mango Set.png           uploads/Cherry Cola Set.png
uploads/Color Rush Set 01.png             uploads/Color Rush Set 02.png
uploads/Color Rush Set 03.png             uploads/Dirty Matcha Set.png
uploads/Espresso Shot Set.png             uploads/Golden Hour Set 01.png
uploads/Golden Hour Set 02.png            uploads/Golden Hour Set 03.png
uploads/Lavender Latte Set 01.png         uploads/Lavender Latte Set 02.png
uploads/Lavender Latte Set 03.png         uploads/Lemon Macarons Set.png
uploads/Matcha Mood Set 01.png            uploads/Matcha Mood Set 02.png
uploads/Matcha Mood Set 03.png            uploads/Mint Condition Set.png
uploads/Monochrome Mood Set 01.png        uploads/Monochrome Mood Set 02.png
uploads/Monochrome Mood Set 03.png        uploads/Orange Crush Set 01.png
uploads/Orange Crush Set 02.png           uploads/Orange Crush Set 03.png
uploads/Pink Lemonade Set 01.png          uploads/Pistachio Ube Set.png
uploads/Purple Rain Set.png               uploads/Rosé Mood Set.png
uploads/Strawberry Milk Set 01.png        uploads/Strawberry Milk Set 02.png
uploads/Vanilla Bean Set.png              uploads/Watermelon Sugar Set.png
```
Promotional shoot (JPG) — `uploads/Promotional Contents/`:
```
DPD_0471.jpg  DSCF0698.jpg  DSCF0709.jpg  DSCF0716.jpg  DSCF0729.jpg
DSCF0734.jpg  DSCF0747.jpg  DSCF3032.jpg  DSCF3053.jpg  DSCF3054.jpg
DSCF3064.jpg  DSCF3077.jpg  DSCF3080.jpg  DSCF3092.jpg  DSCF3110.jpg
DSCF3242.jpg  DSCF3254.jpg  DSCF3271.jpg  DSCF3287.jpg  DSCF3328.jpg
DSCF3413.jpg  DSCF3427.jpg
```
Starter Trio (JPG, full + `-hash` thumbnails) — `uploads/Starter Trio/`:
```
DSCF0698.jpg / DSCF0698-68be8435.jpg     DSCF0709.jpg / DSCF0709-b26aa256.jpg
DSCF0716.jpg / DSCF0716-cb2df411.jpg     DSCF0729.jpg / DSCF0729-f7d90518.jpg
DSCF0734.jpg / DSCF0734-16dd9071.jpg     DSCF0747.jpg / DSCF0747-d6890854.jpg
```
Project-root photos:
```
dscf0729-mrrrj4nb-om04.jpg
dscf0804-mrrrjliw-8wj8.jpg
dscf0826-mrrrix3i-0dxf.jpg
```

## Not exported — design-system internal metadata
Regenerated by Claude Design on import; their substantive data (the design
tokens) is already fully captured in `tokens/*.css` above, so they were left out
rather than risk shipping a hand-transcribed, subtly-wrong copy:
```
_ds/you-design-system-.../_ds_manifest.json      # card index + token registry
_ds/you-design-system-.../_adherence.oxlintrc.json  # oxlint adherence rules
.thumbnail                                       # project preview
```

## Getting the images

The reliable way to pull the full-resolution originals is the design project
itself, which serves the real bytes (not a truncated read):

1. Open the project: https://claude.ai/design/p/595c387f-c136-4e2d-bad4-2ce7e6b59bb1
2. Use the **Files** panel to download individual assets, or the project's
   **Export / Download** action to grab everything (including the `export/`
   deliverables and `uploads/` photography) in one go.
