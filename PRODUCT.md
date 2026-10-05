# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS landing driven by `config.json`; separate static HTML slide deck under `apresentacao/`. Deploy target: GitHub Pages (`developerrafu.github.io`). No application server in this repo.

## Users

- **Primary:** developers in Brazil (especially juniors and career switchers) evaluating mentorship in Java/backend career paths and use of AI in daily work.
- **Secondary:** companies or leads seeking consulting on microservices and AI-enabled delivery.
- **Situation:** arrives from social (Instagram, comunidade), talks, or search; needs trust, clarity on offer, and a low-friction way to contact (WhatsApp).

## Product Purpose

Present Rafael Almeida’s **mentoria de carreira Dev Java + IA** and **consultoria para empresas** (microsserviços e IA), convert interest into contact, and host supporting assets (e.g. career talk slides) without a separate CMS.

Success: clear positioning, credible proof, fast load on mobile, and working CTAs (WhatsApp, consultoria, comunidade).

## Positioning

Career mentorship and consulting from a practicing engineer (BEES-scale backend context), not a generic course marketplace — personal brand, live community touchpoints, and Java/cloud/AI as the through-line.

## Operating Context

- Content and copy largely edited via `config.json` for the landing; slides are hand-authored HTML.
- Public URLs include `landing-consultoria-java` and `portfolio` GitHub Pages properties (see published links in slide closing and README).
- Portuguese (pt-BR) is the primary language for audience-facing copy.

## Capabilities and Constraints

- Landing sections: hero, problem/solution, benefits, products carousel, live meetings, companies, reviews, FAQ, CTA, footer — each toggled via `config.json`.
- Slide deck: keyboard navigation, full-screen, Norte4j-inspired purple palette; not the same visual system as the emerald link-in-bio `portfolio` repo (out of scope for this PRODUCT record unless merged later).
- **Constraint:** do not invent testimonials, client logos, metrics, or pricing not present in `config.json` or confirmed assets.
- **Open:** whether future UI work targets only this repo’s landing, only `apresentacao/`, or a separate portfolio redesign — user has asked to keep Impeccable off slide/portfolio until explicitly requested.

## Brand Commitments

- **Name:** Rafael Almeida (Rafael Henrique on some link pages).
- **Handles / links (confirmed in project):** GitHub `developerRafu`, Instagram `@rafu.class`, WhatsApp +55 91 8361-0117, comunidade Norte4j / mentoria landing URLs referenced in materials.
- **Voice:** direct, practical, anti-hype career advice for devs; professional but approachable for consulting.

## Evidence on Hand

- `config.json` — landing content source of truth.
- `apresentacao/dev-juninho-30-slides.html` — ~28-slide junior dev career deck (published copy also on `portfolio` Pages).
- `assets/` — images, CSS, JS for landing.
- **Absent unless added to config:** fabricated case studies, revenue numbers, or enterprise client lists.

## Product Principles

1. **Clarity over cleverness** — visitor understands mentoria vs consultoria in seconds.
2. **Trust before conversion** — real contact paths and consistent identity across surfaces.
3. **Static and maintainable** — prefer JSON/config and plain HTML over heavy frameworks for these marketing surfaces.
4. **Audience-first** — junior and mid-level devs and hiring managers are different jobs; do not merge their messages on one screen without intent.
5. **No fabricated social proof** — if reviews or logos are disabled or empty, design must not imply they exist.

## Accessibility & Inclusion

- Target readable contrast on dark landing theme; slide deck should remain legible when projected (large type, scroll where needed).
- No product-specific WCAG certification claimed; aim for semantic HTML, focus states, and pt-BR as primary locale.
