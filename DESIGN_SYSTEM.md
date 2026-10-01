# Design System

## Principles

- Use space as an active design material.
- Let dense simulation moments coexist with extremely sparse UI.
- Prefer asymmetry when it increases tension or hierarchy.
- Keep the DOM interface quieter than the WebGL system.
- Avoid ornamental UI chrome.

## Core tokens

### Color

```css
--bg: #08090b;
--fg: #f1efe9;
--muted: #8b8d92;
--faint: #4b4e55;
--line: rgba(241, 239, 233, 0.12);
```

These are starting values, not permanent branding decisions.

### Spacing

Use a fluid spacing scale based on viewport size. Major compositions should rely on large negative space rather than nested containers.

### Radius

Default to little or no radius. Rounded cards are not part of the primary visual language.

### Borders

Use sparingly and at low contrast. Do not create a dashboard grid.

## Type hierarchy

- Display: clamp aggressively for large cinematic words.
- Body: 15–18px desktop equivalent.
- System labels: 10–12px, uppercase, tracked, monospace.

Do not use tiny text as decoration if it carries essential meaning.

## Layout

The homepage is a full-viewport experience, not stacked content sections.

Information can occupy corners, edges, or temporary spatial anchors while the simulation remains central.

## Links

External links should behave as part of the identity index. Avoid pill buttons. Use typography, directional glyphs, and subtle field reactions.

## Skills

Do not render skills as badges or a logo wall.

Treat skills as system metadata: terse, typographic, and subordinate to the work itself.

## Projects

Exactly two featured project worlds.

They should be spatially and behaviorally distinct while clearly belonging to the same parent chaos system.
