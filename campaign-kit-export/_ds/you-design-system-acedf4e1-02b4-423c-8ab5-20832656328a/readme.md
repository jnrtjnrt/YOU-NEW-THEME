# YOU — Design System

**YOU** is a direct-to-consumer bag brand made for young Filipinos who "hate the corporate vibe." Bags are framed as an extension of identity — *"a bag is more than something you wear — it's a part of your everyday story."* The brand voice is short, punchy, bilingual (English/Filipino), and unapologetically bold; the visual system pairs a bubbly wordmark with hard-edged, high-contrast graphic design and clashing color.

**Sources provided** (all under `uploads/` in this project — no Figma file, GitHub repo, or codebase was attached):
- `you-brand-spec.md` — full brand guide (story, mission, values, voice, logo, type, color, social calendar)
- `you-brand-tokens.json` — Tokens Studio JSON export (color, font, type scale, radius, border)
- `you-wordmark-black.png` / `you-wordmark-white.png` — the real logo lockup, on light and dark

No component library, Figma file, or codebase was given, so the component set below is a **standard e-commerce/DTC set** (Button, Input, Card, etc.) sized to the brand — not pulled from an existing inventory. If a real product codebase or Figma library exists, attach it and this system should be rebuilt against that source of truth.

## Index

- `styles.css` — root stylesheet, imports everything in `tokens/`
- `tokens/` — `colors.css`, `fonts.css`, `typography.css`, `spacing.css`, `radius.css`
- `assets/logo/` — `you-wordmark-black.png`, `you-wordmark-white.png`
- `guidelines/` — 15 foundation specimen cards (Colors, Type, Spacing, Brand) shown in the Design System tab
- `components/core/` — Button, IconButton, Badge, Tag, Card
- `components/forms/` — Input, Select, Checkbox, Radio, Switch
- `components/feedback/` — Tooltip, Toast, Dialog
- `components/navigation/` — Tabs
- `ui_kits/store/` — YOU Store: interactive Home → Product Detail → Cart click-through

### Components
| Name | Group | File |
|---|---|---|
| Button | Core | `components/core/Button.jsx` |
| IconButton | Core | `components/core/IconButton.jsx` |
| Badge | Core | `components/core/Badge.jsx` |
| Tag | Core | `components/core/Tag.jsx` |
| Card | Core | `components/core/Card.jsx` |
| Input | Forms | `components/forms/Input.jsx` |
| Select | Forms | `components/forms/Select.jsx` |
| Checkbox | Forms | `components/forms/Checkbox.jsx` |
| Radio | Forms | `components/forms/Radio.jsx` |
| Switch | Forms | `components/forms/Switch.jsx` |
| Tooltip | Feedback | `components/feedback/Tooltip.jsx` |
| Toast | Feedback | `components/feedback/Toast.jsx` |
| Dialog | Feedback | `components/feedback/Dialog.jsx` |
| Tabs | Navigation | `components/navigation/Tabs.jsx` |

**Intentional additions**: none of the above were specified by a source component library (there wasn't one) — this is the standard set the skill authors when starting from brand guidelines alone, sized down to what a small DTC store needs (dropped Avatar, Toast queueing, Accordion, Pagination, etc. as unneeded for a bag e-commerce site).

## Content Fundamentals

**Voice**: short and punchy, confident without arrogance, speaks to young Filipinos who reject corporate-speak. Mixes English and Filipino naturally.

**Caption formula**: (1) Hook — one bold sentence/question/attitude, (2) optional product context or CTA, (3) 5–10 hashtags, never a dump.

**Do / Don't** — collapse the corporate voice into a hook:
- Don't: "Introducing the YOU Versa bag, available in 5 colors, now on our website!"
- Do: "Pick a color. Become her. YOU Versa, link in bio."
- Don't: "We are excited to announce the launch of our new colorway!"
- Do: "She's here. YOU Pixie in Volt. Go."

**Casing**: sentence case in body copy; ALL CAPS only for micro-labels/eyebrows (tracked wide, e.g. `#MadeByYOU`). No title-case headlines.

**Person**: addresses the reader directly as "you" / "her" (the customer as a character) rather than "we" — the brand is a mirror, not a narrator.

**Emoji**: used sparingly in social captions (e.g. 🎒 🧡) as a single punctuation accent, never as bullet icons or in-product UI. Never used in the UI kit.

**Hashtags**: always-on (`#MadeByYOU #YOUBags #YOUOfficialStore`), rotating per-product (`#YOUVersa #YOUFlip #YOUMinigo #YOUPixie #YOUStrappy`), community (`#PinoyStyle #OOTDPH #BagAddict #FilipinoMade #ShopLocal`).

**Vibe**: fearless, self-expressive, a little defiant — "unapologetically YOU." Per the brand's moodboard, this leans further into Y2K/scrapbook maximalism: sticker collage, spiky starbursts, halftone print texture, tilted photos taped-to-a-wall — loud and a little chaotic on purpose, not polished-corporate. Layout inspiration also pulled from Baobab Eyewear (full-bleed real photography, a bold hand-lettered script accent word over the hero, dark sticky navbar, tile-grid category cards) and Topologie (clean generous-whitespace product grid, restrained accent use) — the loud collage motifs (starburst, sticker-tilt, halftone) are still available as component options, but the Store home now leads with editorial photography + a script hook line rather than color-block chrome.

## Visual Foundations

**Color**: thirteen-color palette built to clash on purpose — *"let colors clash. Red on blue, volt on pink — yes. Plain white — no."* Red (`#E8401C`) is the primary energy color and default accent/CTA; Black (`#1A1A1A`) and Cream (`#FDFEFF`) are the two anchors (cream stands in for pure white — never true `#fff` as a background). Orange, Blue, Bright Orange, Volt, Pink, Sage, Cyan rotate as accents, plus three louder additions pulled from the moodboard direction — **Magenta** (`#FF2E92`), **Cobalt** (`#1E2DE0`), **Lemon** (`#F4FF3D`) — for maximum-clash pairings (lemon/magenta, red/cobalt). No fixed secondary color, pick loud pairings.

**Type**: four-family system. Display is **Anton** (chunky, ultra-bold, condensed stamp-style grotesk) at very large sizes (96–176px), all-caps for hero/section headlines. **Script** (`--font-script`, Caveat Bold) is a hand-lettered accent for hook lines over photography — e.g. "Become her." tilted -2° in lemon over the hero image, referencing Baobab's yellow script overlay. **Bricolage Grotesque** remains available as `--font-display-alt`. Serif (Cormorant Garamond, italic only) for editorial quote accents. Body (Archivo 400/500/700) for everything functional: UI, product copy, captions.

**Spacing**: 4px base unit scaling 4→128px; generous whitespace at the hero/section level, tight (8px) gaps inside compact UI clusters like tag rows.

**Backgrounds**: flat color blocks and full-bleed photography (hero sections use full-bleed image slots, not color blocks) — no smooth gradients except a thin dark scrim over hero images for text legibility. A subtle **halftone dot texture** (`--pattern-halftone`, `guidelines/motif-halftone.html`) is available as a low-opacity overlay on dark image sections for print/collage grain — used sparingly, not everywhere. Product imagery uses `image-slot` placeholders since no product photography was provided.

**Collage motifs**: three tasteful additions toward the "unapologetically you" moodboard — (1) **sticker-tilt cards** (`Card sticker`): 3px border, -2°/+2° rotation, alternated per grid item, like photos taped to a wall; (2) **starburst badges** (`Badge shape="burst"`): a rotated 24-point spiky clip-path shape for price call-outs and urgency ("₱149 OFF", "SALE") — moodboard-referenced from the "$1.49" sticker; (3) all-caps chunky Anton headlines standing in for the moodboard's stamp/marker type. Deliberately did not add torn-paper cutouts or photo-collage layering — those need real photography to look intentional rather than cheap in CSS.

**Animation**: no eased/bouncy motion system specified in source; this system uses a single fast, snappy transition (`--dur-fast` 120ms / `--dur-med` 200ms, `cubic-bezier(.2,.8,.2,1)`) for hovers, toggles, and the cart drawer slide — nothing longer, nothing bouncy. Matches the brand's "boldly effortless" personality (quick, no fuss).

**Hover states**: buttons lift (translate up-left) and their pop shadow extends; cards/tags don't shift color, they use motion instead of opacity dimming — opacity-based hover is avoided since it reads "corporate."

**Press states**: buttons flatten to the surface (shadow drops to 0, translate resets) — a physical "push" rather than a color change.

**Borders**: a consistent 2px solid black hairline is the load-bearing structural device — every input, card, chip, and button border uses it. No 1px hairlines, no colored borders.

**Shadows**: none, anywhere — no soft blur, no hard offset "pop" shadow. Depth and emphasis come from color and the 2px black border only, never elevation.

**Corners**: sharp, 0px radius on every card/input/surface — the only rounded shapes in the system are full pills (buttons, tags, badges), which are a shape choice, not "rounding."

**Cards**: white fill, 2px black border, square corners, no shadow — `pop` cards swap the border to red for emphasis instead of adding elevation.

**Transparency/blur**: used once, deliberately — the cart drawer's dark scrim (`rgba(black, 0.55)`) — no frosted-glass/backdrop-blur anywhere else; the brand's flat, poster-like graphic language avoids translucency as a decorative device.

**Imagery**: none supplied. Home and Product Detail now use full-bleed `image-slot` hero/product images (drop yours in) instead of color blocks. When photography arrives, treat it as bold and saturated (matching the clash-color palette) rather than desaturated/moody — no source guidance on grain or B&W treatment was given.

## Iconography

No icon font, SVG sprite, or icon system was included in the source material. This system uses **inline stroke-style SVGs (2px stroke, no fill)** hand-matched to the brand's 2px hairline border weight for the handful of functional glyphs needed (cart, heart/wishlist, checkmark) — kept minimal and swappable. If the brand has a preferred icon set (e.g. Lucide, Phosphor), attach it and this note should be replaced with real icon assets. Emoji are not used in UI; unicode glyphs (×) are used only for close buttons.

## Fonts — substitution flag

**Agrandir Bold is a commercial font (Pangram Pangram) with no free distribution** — it is not available to self-host in this project. This system substitutes **Bricolage Grotesque** (Google Fonts) for all display/headline use: it's a similarly bold, geometric grotesk with personality close to Agrandir's tight-tracked display feel. **Please share Agrandir Bold's licensed font files if you have access** — I'll swap them in directly. Cormorant Garamond and Archivo are used as specified (Archivo is itself already a brand-chosen substitute for Aileron, per the tokens file) and are both real Google Fonts, linked live — no substitution needed there.

## Logo

The uploaded wordmark (`assets/logo/`) is the real, provided logo — a rounded "YOU" lockup with a smiling face built into the "O." Note this differs slightly from the brand spec's text description (a plain wordmark with a red-period dot) — **the image file is the source of truth** and is what's used throughout this system. Clearspace = height of the "O," per spec. Never stretch, skew, outline, or drop-shadow it.
