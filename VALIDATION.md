# Validation

Verified 15 October 2026 against the source in checkpoint `5f983e395a546e5a7c59ff16a84c46a4aa2ec863`.

- Static browser QA: **132/132 checks passed** across nine pages at 1440×1000, 768×1024 and 390×844.
- Real WordPress browser QA: **11/11 checks passed**. Tested product detail hydration and scoped images, finish/quantity persistence, bag totals, simulated checkout, language switching, journal filtering, story navigation, one main landmark and the native page editor.
- WordPress Blueprint execution: completed with a fresh official Playground CLI runtime, WordPress 6.8 and PHP 8.3.
- Public GitHub Blueprint transport: both launch files returned HTTP 200, allowed cross-origin access, and matched the locally validated SHA-256 hashes.
- Hosted instant preview: deployed successfully through Sites; its audience remains owner-private.

The WordPress run recorded a browser message, `Transition was skipped`, during rapid iframe navigation. It had no stack and did not prevent the tested flows; the test retains it as a diagnostic while failing on other browser errors. This is not a claim of full accessibility conformance or production payment integration.

## What was corrected during review

Mobile navigation and the demo label, excess headline size and empty grid space, mismatched/repeated product imagery, article routing and translations, bag quantity and malformed-storage handling, Playground-scoped image paths, and WordPress seed imports that initially stripped form controls.

## Intentional limits

These are fictional portfolio concepts. Shopping and donation flows use local browser state. No payment gateway, WooCommerce backend, email delivery, real stock service or live orders are connected. Native WordPress Pages use editable Custom HTML blocks; their shell and interactions are in the custom theme.

## Separate native WooCommerce edition — 15 October 2026

The additional `form-earth-woocommerce.json` Blueprint runs WordPress 7.1.3, PHP 8.3 and pinned WooCommerce 11.2.1. The original three WordPress Blueprint files remain byte-for-byte unchanged; their earlier validation remains dated above.

Verified in the official Playground CLI 3.1.56 and through the browser UI:

- Fresh pinned runtime boots successfully with the appended `scripts/verify-woocommerce.php` assertions. These check four native variable products, two priced variations each, decoded JPEG attachments, classic cart/checkout pages, no duplicated shortcode shop, blocked outgoing mail, only the fictional gateway, accepted native checkout flags, rejected changed identity/additional personal fields, and idempotent seeding.
- Native product selection retains Clear glaze, quantity two and a EUR290.00 total through product, cart and checkout. One fictional order in the final runtime was created successfully; the order page explicitly states no payment and no fulfillment. The displayed EUR290 is test data, not revenue.
- Shop, product, cart, checkout and result fit a 390px mobile viewport without horizontal overflow. Product images load. Native admin lists four published products.
- Fixed fictional checkout values are readonly, extra personal fields are absent, and the corrected demo copy is visible. Screenshots are in the ignored local `artifacts/` folder. Temporary viewport overrides were reset.
- Node syntax checks pass for the builder, verification-preparation script and launcher. `git diff --check` passes.

Reproduce runtime assertions: run `npm run build:woocommerce`, then `node scripts/prepare-woocommerce-verification.mjs`. Boot `artifacts/woocommerce-verification.json` with the official Playground CLI using `--wp 7.1.3 --php 8.3 --workers=6`. A failed PHP assertion prevents successful startup. Browser interaction testing uses the actual native WooCommerce pages.

External-preview limitation: the embedded hosted Playground failed in this environment (IAB module fetch; Chrome remote WebWorker loading). Its cause is unconfirmed. This does not invalidate the locally tested WordPress/WooCommerce runtime, but a successful hosted browser launch is not claimed. The launcher offers the direct official Playground route, an instant static preview, and a bounded startup failure state. No hosted deployment was changed.
