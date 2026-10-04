# Animation Rules

## Governing rule

Movement should imply a physical, mathematical, or narrative cause.

If an element moves, the viewer should be able to feel why.

## Ownership

### Three.js / WebGL

Owns:

- particles
- vector fields
- attractors
- simulation
- camera/world motion
- project-world transformations

### GSAP

Owns:

- master cinematic sequencing
- normalized world parameters
- orchestration between simulation phases

### Motion

Owns:

- DOM typography
- labels
- identity metadata
- restrained interface transitions

Do not make multiple animation systems fight over the same property.

## Interaction

### Pointer

The pointer perturbs the field. It should not behave like a generic particle magnet.

Velocity and direction changes may influence turbulence, curvature, or local energy.

### Hover

Hovering a project changes attractor influence and system balance. Avoid generic `scale(1.05)` interactions.

### Click

Selecting a project commits the simulation toward that attractor and transforms the same visual material into the project world.

### Scroll

Scroll may control time, energy, or progression, but it should not become a sequence of unrelated scroll-triggered tricks.

## Continuity

Favor:

- reconstruction
- decomposition
- convergence
- divergence
- advection
- morphing
- field changes

Avoid:

- fade everything out
- hard cut
- slide in card
- generic parallax section

## Reduced motion

When `prefers-reduced-motion: reduce` is active:

- do not run the animated chaos loop
- present a static authored system composition
- preserve access to all identity, project, and navigation information
- do not punish the user with a visually inferior generic fallback

## Timing

The passive opening target is approximately 8–12 seconds and must be interruptible later.

No visitor should be trapped inside a long intro.
