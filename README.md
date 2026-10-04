# Chaos Portfolio

A personal portfolio for Muhammad Sharif built as an interactive chaos-theory system rather than a conventional portfolio layout.

## Current stage

This repository is intentionally being built in stages.

- Stage 0: creative constitution and engineering guardrails
- Stage 1: chaos laboratory / deterministic particle system
- Stage 2: pointer perturbation and interaction
- Stage 3: cinematic seed → divergence → emergence → chaos sequence
- Stage 4: bifurcation into two project attractors
- Stage 5+: project worlds, case studies, mobile choreography, optimization

The current branch establishes Stage 0 and the first Stage 1 prototype.

## Stack

- Next.js
- React
- TypeScript
- Three.js / WebGL
- Motion
- GSAP
- GitHub Actions
- Vercel preview deployments

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
```

## Deployment workflow

Feature branches are intended to produce Vercel preview deployments. Production remains tied to the reviewed `main` branch.

## Dynamic portfolio metrics

The site is designed to fetch live metrics server-side.

Copy `.env.example` to `.env.local` and set:

- `GITHUB_STATS_TOKEN` — GitHub token used only server-side for contribution/commit metrics.
- `LEETCODE_USERNAME` — LeetCode username used for solved-problem counts.

No secret is exposed to the browser.

## Creative source of truth

Before modifying the experience, read:

- `AGENTS.md`
- `CREATIVE_DIRECTION.md`
- `DESIGN_SYSTEM.md`
- `ANIMATION_RULES.md`
- `PROJECTS.md`
- `PROFILE.md`
