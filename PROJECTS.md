# Featured Projects

The portfolio features SafeStep, the Log Analytics / Ingestion Engine system, and HexaDepth as technical case studies, each expressed in the site's mathematical and systems language.

## 01 — SafeStep

Repository: https://github.com/SharifWaqas/safestep

### Core idea

An AI-powered digital safety platform that helps older adults understand suspicious screenshots, emails, messages, and websites.

### Technical story

- Python / FastAPI backend
- PostgreSQL + SQLAlchemy
- JWT authentication and refresh sessions
- secure file-upload pipeline
- OpenAI vision integration
- repository + service-layer architecture
- accessibility-focused product design

### Case-study requirements

Show the system rather than summarizing it:
- request lifecycle
- authentication/session flow
- upload and screenshot-analysis pipeline
- persistence boundaries
- AI / vision integration
- risk scoring / guidance flow
- engineering decisions
- failure handling
- real repository or runtime analytics where available

Do not fabricate analytics. Any metric shown must come from repository history, documented measurements, tests, or another verifiable project source.

### Portfolio angle

Emphasize both engineering and human-centered design: a technically serious system whose value comes from explaining risk rather than simply labeling content.

## 02 — Log Analytics + Ingestion Engine

Repository: https://github.com/SharifWaqas/log-analytics-backend

Unless the user later supplies a separate ingestion-engine repository, treat the ingestion engine as a major subsystem of this project rather than inventing a third project.

### Core idea

A production-style backend for ingesting, processing, and analyzing application logs using queue-based processing and background workers.

### Technical story

- Python / FastAPI
- PostgreSQL + SQLAlchemy
- queue-based ingestion
- background worker processing
- batch database writes
- retry handling
- cursor pagination
- Dockerized deployment
- concurrency and throughput optimization

### Measured result

The system reached roughly 921 logs/second after optimization, representing about a 20× improvement over the original implementation.

### Case-study requirements

Expose the engineering:
- ingestion path
- queue topology
- worker behavior
- batch-write strategy
- retries and failure handling
- database boundaries
- analytics API
- cursor-pagination behavior
- bottlenecks
- before/after throughput
- performance reasoning
- architecture and data-flow diagrams

Useful visualizations include:
- throughput traces
- queue / worker diagrams
- write batching
- request lifecycles
- benchmark plots
- component dependency graphs

All analytics must map to real project evidence.

### Portfolio angle

This should be the strongest systems-engineering world: throughput, architecture, tradeoffs, bottlenecks, and measured optimization should be visible rather than summarized into a technology list.

## Project-world rule

Do not present either project as a conventional rectangular portfolio card.

Projects should emerge from the site's mathematical/system language through traces, topology, state transitions, observability views, and architecture rather than generic UI reveal animations.

## 03 — HexaDepth

Repository: https://github.com/SharifWaqas/hexadepth-backend

Award: VOXO 2026 hackathon, Blue Economy stream winner (team project).

### Core idea

A priority-first sonar transmission research prototype for constrained underwater links: send object-region coordinates, a low-resolution scene overview, and prioritized detail crops before optionally reconstructing the byte-exact full image.

### Technical story

- Python / FastAPI analysis and transport endpoints
- 64-byte software packet frames with CRC-16
- receiver-side reassembly
- optional lossless recovery with SHA-256 integrity verification
- simulated acoustic-link transfer-time comparisons
- optional trained sonar detector, with fallback when weights are unavailable
- repository reports 324 passing tests and 4 skips

### Accuracy and limitations

Software simulations use selected bit rates and publicly specified modem characteristics. The prototype has not been tested with acoustic hardware underwater. The fallback region selection is not a validated sonar object-recognition model, and real-world transfer speedups are not established.

### Portfolio angle

Use the already-established flow and system-proof visual language. Show a progression from coordinates to scene context to detail to verified reassembly, not a generic project card.
