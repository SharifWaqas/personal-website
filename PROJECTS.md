# Featured Projects

The portfolio should feature SafeStep and the Log Analytics / Ingestion Engine system as deep technical case studies.

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
