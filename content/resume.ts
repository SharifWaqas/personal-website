export const resume = {
  name: "Muhammad Sharif",
  contact: {
    email: "shaarif.1031@gmail.com",
    phone: "+1-601-913-2426",
    linkedin: "linkedin.com/in/muhammad-sharif-77494139b",
    github: "github.com/SharifWaqas",
    location: "Hattiesburg, MS",
  },
  summary:
    "Backend-focused software engineer building production systems in Python/FastAPI and Next.js/React. Shipped SafeStep, a deployed full-stack AI application with authentication, cloud storage, multimodal AI integration, and custom observability instrumentation, from architecture through production deployment.",
  education: {
    school: "University of Southern Mississippi",
    degree: "B.S. Computer Science & B.S. Mathematics (Double Major)",
    expected: "Expected May 2029",
    gpa: "3.2",
    scholarship: "Academic Excellence Scholarship",
    coursework: [
      "Data Structures",
      "Computer Architecture",
      "Computer Networks",
      "Operating Systems I",
      "Software Development Foundations",
      "Discrete Mathematics",
      "Linear Algebra",
      "Mathematical Statistics",
      "Calculus I–IV",
      "Differential Equations",
    ],
  },
  skills: {
    Languages: ["Python", "TypeScript", "SQL", "C++"],
    Backend: [
      "FastAPI",
      "SQLAlchemy 2.0 (Async)",
      "Alembic",
      "Pydantic",
      "JWT",
      "REST APIs",
      "AsyncIO",
      "Structured Logging/Observability",
    ],
    Frontend: ["Next.js", "React", "Tailwind CSS"],
    "Databases & Cloud": [
      "PostgreSQL",
      "Docker",
      "Docker Compose",
      "Cloudflare R2",
      "Vercel",
      "Render",
    ],
    AI: ["OpenAI API", "NVIDIA NIM"],
    "Testing & Tools": [
      "pytest",
      "AsyncMock",
      "Postman",
      "Git",
      "Linux",
    ],
  },
  projects: [
    {
      name: "SafeStep – AI-Powered Digital Safety Companion",
      period: "Jun 2026 – Present",
      links: "usesafestep.com | github.com/SharifWaqas/safestep",
      stack:
        "Modular monolith | Python | FastAPI | PostgreSQL | SQLAlchemy 2.0 Async | Next.js/React/TypeScript | Docker | Cloudflare R2 | OpenAI API | NVIDIA NIM",
      bullets: [
        "Architected a modular-monolith backend (routes → services → repositories) spanning 8 repository classes over 7 normalized PostgreSQL entities, with schema evolution managed through Alembic migrations.",
        "Implemented JWT authentication with short-lived access tokens and rotating, SHA-256-hashed refresh tokens, session revocation, and ownership-aware authorization using indistinguishable 404 responses across users.",
        "Built a provider-agnostic multimodal AI pipeline integrating OpenAI and NVIDIA NIM vision models, including a custom regex-based response parser with 13 parameterized tests feeding validated Pydantic schemas and deterministic risk scoring.",
        "Instrumented request-tracing middleware with correlation IDs propagated through the analysis service and AI orchestrator into provider calls, streaming structured telemetry asynchronously to a self-built log-analytics service.",
        "Diagnosed and fixed a PostgreSQL/SQLAlchemy conflict between FOR UPDATE row locking and joined eager loading by switching to selectinload while preserving concurrency safety.",
        "Containerized local development with Docker Compose and deployed to production with Vercel, Render, and Cloudflare DNS/R2; built a 7-page Next.js frontend and validated the system with 124 pytest tests, accessibility review, and end-to-end production testing.",
      ],
    },
    {
      name: "Log Ingestion & Analytics Engine",
      period: "Mar 2026 – Jun 2026",
      links: "github.com/SharifWaqas/log-analytics-backend",
      stack:
        "High-throughput backend pipeline | Python | FastAPI | PostgreSQL | Docker | Threading | psycopg2",
      bullets: [
        "Designed a producer-consumer ingestion pipeline that improved sustained throughput from 46 to 921+ events/sec (~20x) through queue-based buffering, HTTP connection reuse, and concurrent request generation.",
        "Built a 4-thread background worker performing batched PostgreSQL writes via psycopg2 to reduce per-write overhead under sustained ingestion load.",
        "Added retry logic and failed-log fallback routing; built analytics endpoints with cursor-based pagination and server-side filtering and benchmarked three ingestion strategies to identify throughput bottlenecks.",
        "Extended the schema and analytics API to consume live telemetry from SafeStep and added p50/p95/p99 latency, HTTP error-rate, and AI-provider fallback-rate endpoints, validated with controlled failure-injection testing.",
      ],
      stackLine:
        "Python, FastAPI, PostgreSQL, psycopg2, Docker, threading, requests, Uvicorn, python-dotenv, Git",
    },
  ],
  experience: [
    {
      role: "Learning Assistant, MAT 101S",
      org: "Department of Mathematics, University of Southern Mississippi",
      period: "Aug 2026 – Present",
      detail:
        "Grade student assignments, hold weekly office hours, and lead exam review sessions, supporting course instructors and student comprehension.",
    },
    {
      role: "Front Desk Attendant",
      org: "Payne Center (Campus Recreation), University of Southern Mississippi",
      period: "Aug 2026 – Present",
      detail:
        "Handle member check-ins, equipment rental, and facility opening/closing procedures for a high-traffic campus recreation center.",
    },
    {
      role: "Team Member",
      org: "Subway, Hattiesburg, MS",
      period: "Jan 2026 – May 2026",
      detail: "Worked high-volume shifts alongside a full-time course load.",
    },
  ],
  leadership: [
    "University of Southern Mississippi — Senator, Student Government Association (Mar 2026–Present)",
    "Social Chair, Pakistan Student Organization (Nov 2025–Present)",
    "Social Chair, Muslim Student Association (Jul 2026–Present)",
    "One of 36 elected senators representing a student body of approximately 14,000; also lead event programming and outreach for two student organizations.",
  ],
} as const;
