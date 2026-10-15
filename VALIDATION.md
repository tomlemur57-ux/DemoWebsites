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
