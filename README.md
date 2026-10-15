# Design studies by Tom Vu

Two original, responsive portfolio concepts with fictional content and generated editorial imagery.

- **Tideland:** coastal editorial website, English/Polish switching, searchable journal, four article variants and a simulated support journey.
- **Form / Earth:** ceramics commerce concept, filterable collection, four product details, finish choices and a persistent shopping bag with a simulated checkout.

The demos are personal portfolio work, not client case studies. No payment, order, email or donation is sent. Form / Earth demonstrates commerce interactions; it is not a WooCommerce integration.

## Explore

Run `node scripts/serve.mjs`, then open <http://127.0.0.1:4185/>. The static pages need no build step or runtime dependencies.

Real WordPress editions are generated from the same pages and assets with `node scripts/build-wordpress.mjs`. They use a small custom theme and native Pages whose main content can be edited in Custom HTML blocks. The visual shell and interaction code live in the theme. WordPress runs inside the visitor's browser through [WordPress Playground](https://developer.wordpress.org/playground/); it needs an internet connection and an initial runtime download. Changes are local to the session.

- [Launch Tideland in WordPress](https://playground.wordpress.net/?blueprint-url=https%3A%2F%2Fraw.githubusercontent.com%2Ftomlemur57-ux%2FDemoWebsites%2Fmain%2Fdist%2Fwordpress%2Ftideland.json)
- [Launch Form / Earth in WordPress](https://playground.wordpress.net/?blueprint-url=https%3A%2F%2Fraw.githubusercontent.com%2Ftomlemur57-ux%2FDemoWebsites%2Fmain%2Fdist%2Fwordpress%2Fform-earth.json)

## Verify

Install development dependencies with `npm install`, install the QA browser with `npx playwright install chromium`, start the preview, then run `npm test`. Browser checks cover the nine static pages at desktop, tablet and phone sizes, navigation, language switching, filters, article variants, form validation, product routes and the bag lifecycle. WordPress runtime validation is a separate check.

## Design sources

[DESIGN-RESEARCH.md](DESIGN-RESEARCH.md) documents 15 primary-source design skills, their practical guidance and limitations. They were researched and selectively applied; no remote skill code was installed or executed.

## Assets and scope

All depicted brands, products, article scenarios, sample prices, stock states and organisations are fictional. Editorial images were generated specifically for these studies. Fonts load from Google Fonts. No private buyer designs, assets, credentials or project materials are included.
