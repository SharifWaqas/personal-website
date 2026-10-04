# Revision Spec — Pendulum / Engineering Dossier

This document is the source of truth for the next major portfolio revision.

## Core identity

The site should feel like a backend engineer and mathematics student built an experimental instrument, not a normal portfolio.

Desired qualities:
- mathematical
- systems-oriented
- backend-heavy
- precise
- cinematic
- dark
- interactive
- performance-conscious
- technically credible

Avoid generic portfolio sections, cards, glassmorphism, SaaS styling, terminal cosplay, and decorative effects that do not represent an actual system.

## Hero: chaos through a double pendulum

Replace the current abstract particle-first opening as the primary visual with a double-pendulum chaos experience.

The hero should begin in near-darkness with a restrained mechanical/mathematical construction:
- two rigid arms
- two masses
- pivots and trajectory traces
- minimal coordinate / state instrumentation
- no giant glowing objects
- no physically meaningless decoration

Narrative:
1. One double pendulum begins from a defined initial condition.
2. A second pendulum begins from an almost identical initial condition.
3. Their motion initially appears synchronized.
4. Small differences compound.
5. Their paths visibly diverge.
6. Trails accumulate into a chaotic phase portrait / trajectory field.
7. Pointer movement may perturb initial conditions or system parameters subtly.
8. Scroll gradually transitions the visitor from the pendulum laboratory into the rest of the portfolio.

The pendulum must be performant. It should use a small number of real simulated bodies and efficient trail rendering rather than thousands of oversized transparent sprites.

## Scroll architecture

The page should be scrollable. The hero is not the whole website.

The experience should flow roughly as:

1. Double-pendulum chaos hero
2. Identity / short engineering statement
3. Skills and languages
4. Resume
5. Live engineering metrics
6. SafeStep
7. Log Analytics + Ingestion Engine
8. Contact / Connect with me

Transitions should inherit the mathematical/system language of the hero. Do not simply fade generic sections into view.

## Skills and languages

Create a substantial skills section showing what Muhammad actually knows.

Separate categories where useful, such as:
- Languages
- Backend / APIs
- Data / persistence
- Infrastructure / tooling
- AI / model integrations
- Currently learning

Use the profile source of truth and do not promote currently-learning technologies into demonstrated skills without evidence.

The visual treatment should resemble a systems map, dependency graph, matrix, topology, or mathematical notation rather than a wall of badges.

## Resume

Show a real copy of the resume on the website.

Requirements:
- embedded or visually previewed resume
- clear option to open/view the full document
- responsive presentation
- preserve readability
- do not fabricate resume content

The repository does not currently contain the actual resume PDF. Add it only after the real file is supplied, expected at:
- public/resume.pdf

## LinkedIn

Provide a clearly discoverable LinkedIn link using the canonical profile URL stored in PROFILE.md.

It should be integrated into the visual system rather than presented as a generic social icon row.

## GitHub activity

Show a live GitHub commit metric.

Requirements:
- fetch rather than hardcode
- label the measurement window clearly
- fail gracefully if the provider is unavailable
- never display fake numbers

The existing GitHub stats adapter can be reused.

## Project coverage

### SafeStep

Present SafeStep as a full technical case study, not a card.

Show:
- what the product does
- architecture
- request / data flow
- authentication model
- screenshot-analysis pipeline
- persistence
- AI / vision integration
- engineering decisions
- failure handling
- measurable project analytics when supported by evidence

Useful analytics may include repository activity, architecture facts, tested metrics, request flow, latency/throughput measurements, or other real project evidence. Never invent analytics.

### Log Analytics + Ingestion Engine

Treat the log analytics backend and ingestion engine as one systems-engineering project unless the user later identifies the ingestion engine as a separate repository/project.

Show:
- ingestion flow
- queue behavior
- worker model
- batching
- retries
- database writes
- analytics API
- cursor pagination
- bottlenecks
- before/after throughput
- performance story
- architecture and data-flow visualization

Known measured result currently available:
- approximately 921 logs/second after optimization
- roughly 20x improvement from the original implementation

Only surface measurements that are supported by project evidence.

## Project analytics visual language

Project metrics should feel like engineering observability, not marketing KPIs.

Possible visual forms:
- throughput traces
- queue depth / worker diagrams
- latency timelines
- architecture graphs
- request lifecycles
- database-write batching visualizations
- before/after benchmark plots
- component dependency graphs

Each visualization must correspond to real project data or documented architecture.

## Contact

The site should contain a prominent phrase such as:

"Connect with me"

Clicking it should open a new Gmail compose draft addressed to Muhammad's contact email.

Implementation requirements:
- use the real contact email only after it is explicitly supplied/stored
- do not fabricate or infer an email address
- Gmail compose should be the primary action
- provide a mailto fallback for environments where Gmail is unavailable
- the interaction should feel like part of the system, not a generic contact form card

Optional prefilled subject:
- Portfolio / Software Engineering

Do not include a traditional multi-field contact form unless later requested; the requested interaction is a direct compose action.

## Interaction principle

Interactions manipulate or reveal the system.

Examples:
- scrolling changes simulation state / camera framing / mathematical traces
- hovering a skill highlights related project architecture
- project metrics animate as data flow, not counters flying in
- "Connect with me" can behave like a terminal node / graph edge resolving into a communication action
- project transitions inherit lines, vectors, trails, or pendulum state from the hero

## Performance requirements

Performance is a feature.

- no giant transparent point sprites
- cap device pixel ratio
- adapt quality based on device capability
- pause simulation when the tab is hidden
- avoid unbounded trail geometry
- minimize draw calls
- respect prefers-reduced-motion
- provide a mobile-specific choreography
- keep scrolling responsive while the simulation is active

The site must never make a normal laptop feel unusably slow.


## October 4 visual revision

The chaos hero should visually evoke the supplied multi-pendulum reference without copying its poster layout.

Implementation target:
- simulate 200 double pendulums
- initial angle separation: 0.1 degrees
- rainbow hue assignment across the ensemble
- persistent trajectory traces that accumulate into a dense chaotic field
- dark near-black background
- restrained mechanical arm rendering underneath the colored traces
- keep the mathematics legible through small system labels rather than decorative equations
- simulate all 200 systems but optimize trail persistence and pause rendering when the hero leaves the viewport

Cursor:
- desktop/fine-pointer devices get a small Daffy-themed cursor companion
- keep the normal pointer visible
- companion follows with slight interpolation/lag
- hide on touch/coarse-pointer devices
- implementation must remain lightweight

Measured signals:
- show authored GitHub commit count across tracked public repositories
- show SafeStep production visitor and pageview counts
- label Vercel analytics values with their measurement window
- if a value is a snapshot rather than live runtime data, say so explicitly
