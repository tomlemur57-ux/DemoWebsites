# Design Skill Research

Research date: 2026-10-15

This is a source-backed reference for building the Money Ops demo pages. The list intentionally combines complementary skills: art direction, visual systems, typography, motion, accessibility, and rendered QA. Their guidance is applied selectively; the build should have one coherent product-specific visual language rather than fifteen simultaneous styles. No skills were installed and no remote code was executed during research.

## Primary sources

1. **Impeccable** — [pbakaus/impeccable `skill/SKILL.src.md`](https://github.com/pbakaus/impeccable/blob/main/skill/SKILL.src.md)
   - Practical use: classify the surface (persuade, operate, read, or experience), inspect existing visual truth, define a clear visual world, and verify in bounded screenshot/defect passes. Preserve the brief and use design tokens, responsive behavior, accessibility, and purposeful motion as the quality floor.
   - Limitation: the full workflow depends on the Impeccable launcher and referenced playbooks; it is broader than needed for a tiny local adjustment.

2. **Anthropic Frontend Design** — [anthropics/skills `skills/frontend-design/SKILL.md`](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)
   - Practical use: ground palette, type, layout, copy, and hero treatment in the subject; plan 4–6 color tokens, type roles, layout, and principles before coding; reject generic cream/terracotta, acid-green dark mode, SaaS-card kits, decorative numbering, eyebrow labels, and scattered fade-up motion.
   - Limitation: concise principles only; it does not supply assets, a component system, or deterministic browser scoring.

3. **Vercel Web Design Guidelines** — [vercel-labs/agent-skills `web-design-guidelines/SKILL.md`](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md)
   - Practical use: run a terse `file:line` UI review against the canonical Web Interface Guidelines, especially accessibility and interaction quality.
   - Limitation: this wrapper fetches the latest rules from [web-interface-guidelines `command.md`](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md); it is an audit skill, not an art-direction system, and needs network access for a fresh review.

4. **Taste Skill v2** — [Leonxlnx/taste-skill `skills/taste-skill/SKILL.md`](https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md)
   - Practical use: derive the concept from details unique to the subject, choose among researched art directions, write claims/proof before sections, vary each section's composition, use real credited imagery, and inspect at 1440/768/390 widths. Strong anti-slop rules include no eyebrow labels, gradients, resting shadows, glass panels, icon-card rows, or default purple/indigo palettes.
   - Limitation: intended for public-facing pages, marketing sites, portfolios, and product pages, not dashboards/app screens; its scripts require Node 22+ and Chromium, and image search needs network access.

5. **UI/UX Pro Max** — [nextlevelbuilder/ui-ux-pro-max-skill `.claude/skills/ui-ux-pro-max/SKILL.md`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/SKILL.md)
   - Practical use: use `--design-system` for a coherent new page, then query explicit domains for accessibility, touch targets, responsive layout, type/color tokens, meaningful motion, forms, and charts. Detect the actual stack before applying stack rules; optional variance, motion, and density dials help tune the output.
   - Limitation: Python-backed local searches are query-dependent; unverified or zero-result recommendations must not be presented as facts, and the stack must not be guessed.

6. **Stitch DESIGN.md** — [google-labs-code/stitch-skills `design-md/SKILL.md`](https://github.com/google-labs-code/stitch-skills/blob/main/plugins/stitch-utilities/skills/design-md/SKILL.md)
   - Practical use: extract atmosphere, exact hex colors with functional roles, typography, geometry, depth, component styling, spacing, and layout into a semantic DESIGN.md that can anchor subsequent screen generation.
   - Limitation: requires Stitch MCP access and an existing Stitch project with at least one designed screen; it documents an existing system rather than inventing a new one.

7. **Anti-AI-Slop UI** — [rwcod/anti-ai-slop-ui `SKILL.md`](https://github.com/rwcod/anti-ai-slop-ui/blob/main/SKILL.md)
   - Practical use: define design intent and tokens before components, choose a concrete direction and non-default layout, and score AI-slop/distinctiveness before shipping. Reject purposeless purple gradients, centered hero plus three cards, emoji icons, glow/glass/blob decoration, rounded-everything, unexamined Inter/Geist, ubiquitous hover/scroll animation, and decorative bento grids.
   - Limitation: its optional Python lint is heuristic and documents expected false positives; full review requires its reference files and checklists.

8. **UI Design** — [mblode/agent-skills `ui-design/SKILL.md`](https://github.com/mblode/agent-skills/blob/main/skills/ui-design/SKILL.md)
   - Practical use: resolve a mode before acting (Direction, Build, Audit, Break, or Options), separate marketing from product tracks, preserve an existing design system, and verify desktop/mobile states, focus, loading, error, and overflow behavior. Its quality bar favors one personality, token-backed values, readable hierarchy, and purposeful assets.
   - Limitation: it explicitly delegates deep typography, motion physics, and browser measurement to companion skills; it is a router and quality discipline rather than a single visual style.

9. **Animations** — [mthines/agent-skills `skills/design/animations/SKILL.md`](https://github.com/mthines/agent-skills/blob/main/skills/design/animations/SKILL.md)
   - Practical use: choose motion from the interaction verb; prefer transform/opacity and composite-safe properties; use a 200 ms loader floor, skeletons that match final geometry, reduced-motion and contrast fallbacks, and evidence from rendered states for complex effects.
   - Limitation: phase-based and reference-heavy; loading every rule is unnecessary, and advanced effects need the relevant on-demand references.

10. **Stitch Enhance Prompt** — [google-labs-code/stitch-skills `enhance-prompt/SKILL.md`](https://github.com/google-labs-code/stitch-skills/blob/main/plugins/stitch-utilities/skills/enhance-prompt/SKILL.md)
    - Practical use: turn vague UI requests into explicit platform, page type, structure, visual style, color roles, component vocabulary, DESIGN SYSTEM, and page-structure sections. Read an existing DESIGN.md and include its palette/type/component rules when present.
    - Limitation: improves prompts for Stitch; it does not implement UI or independently validate the rendered result. It also defers current best practices to the official Stitch prompting guide.

11. **Typography** — [rhino-labs/skills `typography/SKILL.md`](https://github.com/rhino-labs/skills/blob/main/typography/SKILL.md)
    - Practical use: start with body text; use 15–25px web text, unitless 1.3–1.45 line-height, 45–90 characters per line, no more than two type families, restrained emphasis, left alignment, and `max-width` rather than full-width paragraphs.
    - Limitation: based on general practical typography and spans documents, print, and web; visual context still decides the final scale and pairing.

12. **Refactoring UI** — [saintgermainlabs/agent-skills `refactoring-ui/SKILL.md`](https://github.com/saintgermainlabs/agent-skills/blob/main/refactoring-ui/SKILL.md)
    - Practical use: design in grayscale first, establish hierarchy through size/weight/color, use constrained spacing (4/8/16/24/32/48/64), constrain text to roughly 45–75 characters, limit to two fonts, build systematic color shades, and check 4.5:1 body contrast.
    - Limitation: deliberately opinionated and system-oriented; its defaults need adaptation for the Money Ops brand and for immersive marketing moments.

13. **Web Accessibility** — [magnus919/agent-skills `web-accessibility/SKILL.md`](https://github.com/magnus919/agent-skills/blob/main/web-accessibility/SKILL.md)
    - Practical use: define observable successful-task and recovery requirements; prefer native semantics; cover keyboard/focus, labels, forms, dialogs, responsive input, motion, zoom, and bounded assistive-technology evidence using WCAG 2.2-informed checks.
    - Limitation: accessibility-focused and framework-neutral; it does not choose a brand direction, palette, or layout composition.

14. **VS Code Design Philosophy** — [microsoft/vscode `.github/skills/design-philosophy/SKILL.md`](https://github.com/microsoft/vscode/blob/main/.github/skills/design-philosophy/SKILL.md)
    - Practical use: reason from Values → Principles → Moves: Calm, Focused, Consistent, and Delightful. Use “one thing leads; the rest supports,” shared ramps/tiers, quiet-at-rest surfaces, and small purposeful moments instead of pixel-by-pixel taste debates.
    - Limitation: calibrated for a dense developer tool; its interaction and token examples need translation for a public Money Ops demo page.

15. **Prism** — [GOODMAN-PRO/prism `SKILL.md`](https://github.com/GOODMAN-PRO/prism/blob/main/SKILL.md)
    - Practical use: combine anti-slop foundations with React, GSAP/Lenis, and immersive 3D direction; use the committed craft/foundations/motion references and headless-Chromium harness to inspect real output, not just code.
    - Limitation: targets React + R3F/Three.js + GSAP/Lenis/WebGL-heavy work; it can add needless complexity to a simple static page, and screenshot inspection still requires human judgment.

## Guidance applied selectively

The shared build direction is: subject-specific art direction (Anthropic, Taste, Impeccable), a small token system and semantic hierarchy (UI/UX Pro Max, Refactoring UI, Stitch), restrained purposeful motion (mthines), accessible states and responsive behavior (Vercel, magnus919, mblode), and rendered screenshot checks (Taste, Impeccable, Prism). The skills are references, not a mandate to combine their palettes, section recipes, or effects. Existing product constraints and the selected Money Ops visual direction win when guidance conflicts.

## Final build checklist

- [ ] State the Money Ops audience, primary job, and one subject-specific visual idea before coding.
- [ ] Define tokens for ground, ink, accent, type roles, spacing, radius, elevation, and motion; use them consistently.
- [ ] Reject unexplained template tells: centered hero plus three cards, gradient hero text, emoji icons, generic bento, glass/glow/blob decoration, and unexamined Inter/Geist.
- [ ] Keep hierarchy legible in grayscale; constrain body measure and use no more than two type families.
- [ ] Use real product content and credible imagery; do not invent proof, metrics, customer logos, or testimonials.
- [ ] Implement meaningful hover, focus, pressed, loading, empty, and error states; preserve keyboard access and reduced-motion behavior.
- [ ] Verify at 390px, 768px, and 1440px (or the supported viewport set); check overflow, contrast, console errors, and fixed/sticky overlap.
- [ ] Review the screenshots once for composition and once for the top three visible defects; record remaining tradeoffs instead of adding ornamental polish.
