# AGENTS.md

This repository is an authored interactive experience, not a generic portfolio template.

Any coding agent changing the site must read this file plus `CREATIVE_DIRECTION.md`, `DESIGN_SYSTEM.md`, and `ANIMATION_RULES.md` before changing visual behavior.

## Non-negotiable creative rules

1. Never replace the experimental interaction with a standard hero / about / skills / projects / contact page.
2. Never replace project gateways with generic cards.
3. Chaos theory is structural, not decorative. Motion should emerge from the simulation or reinforce its state.
4. Favor transformation and continuity over hard section cuts and generic fades.
5. Preserve negative space. Do not fill empty areas simply because they look empty.
6. Avoid glassmorphism, floating blobs, generic gradient backgrounds, pill-heavy UI, stock 3D shapes, and AI-startup visual language.
7. Do not add animation solely to show that an element can move.
8. Project entry should feel like committing the system to an attractor, not clicking a card and loading another page.
9. Mobile is authored separately. Do not simply scale the desktop experience down.
10. `prefers-reduced-motion` must remain functional.

## Engineering rules

- React owns document structure, content, accessibility, and high-level experience state.
- Three.js/WebGL owns simulation and expensive visual rendering.
- Do not put per-particle state in React.
- Keep one primary WebGL canvas unless a measured requirement proves otherwise.
- Cap device pixel ratio.
- Pause rendering while the document is hidden.
- Dispose geometries, materials, textures, render targets, and listeners.
- Any performance-heavy change must be measured before merging.
- Dynamic profile metrics must never be hardcoded if they can be fetched safely.
- Keep secrets server-side.
- Do not add a dependency unless it materially simplifies the architecture.

## Required checks before a PR is considered ready

```bash
npm run typecheck
npm run lint
npm run build
```

Later stages will add browser smoke tests, accessibility checks, and performance budgets.

## Working style

Prefer small, reviewable branches that change one experience concept at a time:

- `feat/chaos-seed`
- `feat/pointer-perturbation`
- `feat/bifurcation`
- `feat/project-gateway`
- `perf/gpu-simulation`

Never simplify the central concept merely because a conventional implementation is easier.
