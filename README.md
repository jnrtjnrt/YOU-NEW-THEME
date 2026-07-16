# YOU — Shopify Theme

A production Shopify **Online Store 2.0** theme for YOU, the DTC bag brand for young Filipinos who hate the corporate vibe. Built against the [YOU design system](https://claude.ai/design/p/09ed2c12-01e3-4ba2-a6ae-c06b5b78f8b5) as the single source of truth.

## Architecture

```
layout/        theme.liquid, password.liquid
config/        settings_schema.json (global Theme settings), settings_data.json
sections/      OS 2.0 sections, each with a full {% schema %}
  *-group.json header-group / footer-group section groups
templates/     JSON templates (all editable in the Theme Editor)
  customers/   login, register, account, order, addresses, activate, reset
snippets/      reusable components (product-card, collection-card, price, icon, …)
assets/        base.css, theme.js
locales/       en.default.json
```

## Theme settings (Theme Editor → Theme settings)

Colors · Typography · Layout · Buttons · Product cards · Collection cards · Header · Footer · Animations · Cart · Social media · Favicon

All settings are functional — they map to CSS custom properties via `snippets/css-variables.liquid` and are consumed by every section and snippet.

## Fonts

Brand fonts (Bricolage Grotesque / Cormorant Garamond / Archivo) load from Google Fonts by default. Note: Agrandir (the brand's true display face) is a commercial font — Bricolage Grotesque is the design system's documented substitute. Merchants can switch to any Shopify font via Theme settings → Typography.

## Key sections

| Section | Purpose |
|---|---|
| `hero-carousel` | Homepage hero with rotating slides, accent word, CTA |
| `how-it-works` | Volt "bags and straps come separate" steps band |
| `category-cards` | Edge-to-edge collection tiles with overlay |
| `featured-products` | Bestsellers scroll row / grid from any collection |
| `testimonials` | Pink reviews band |
| `ugc-gallery` | Black "worn by" photo grid |
| `promo-banners` | Split color-washed promo pair |
| `newsletter` | Black email capture band |
| `main-product` | Block-based PDP (gallery, swatches, qty, trust row, accordions, sticky ATC) |
| `main-collection` | Collection page with storefront filtering, sorting, grid toggle |
| `cart-drawer` | AJAX cart drawer with free-shipping progress |

## Development

```sh
shopify theme dev    # preview against a dev store
shopify theme check  # lint
python3 scripts/validate_theme.py  # offline structural validation
```
