export type CapabilityTier =
  | "CORE"
  | "STRONG"
  | "WORKING"
  | "EXPLORING";

export type Capability = {
  name: string;
  tier: CapabilityTier;
  evidence: string;
  projects: string[];
};

export type CapabilityGroup = {
  id: string;
  label: string;
  description: string;
  capabilities: Capability[];
};

export const capabilityGroups: CapabilityGroup[] = [
  {
    id: "languages",
    label: "Languages",
    description: "Languages I use to build, model, and ship systems.",
    capabilities: [
      {
        name: "Python",
        tier: "CORE",
        evidence:
          "Primary backend language across SafeStep and the ingestion engine.",
        projects: ["SafeStep", "Log Analytics"],
      },
      {
        name: "TypeScript",
        tier: "STRONG",
        evidence:
          "Used for SafeStep's Next.js frontend and this portfolio.",
        projects: ["SafeStep", "Portfolio"],
      },
      {
        name: "SQL",
        tier: "STRONG",
        evidence:
          "Relational modeling, analytics queries, filtering, and persistence.",
        projects: ["SafeStep", "Log Analytics"],
      },
      {
        name: "C++",
        tier: "WORKING",
        evidence:
          "Coursework and systems/programming foundation.",
        projects: ["Coursework"],
      },
      {
        name: "Go",
        tier: "EXPLORING",
        evidence:
          "Currently learning for distributed systems and backend infrastructure.",
        projects: ["Next systems project"],
      },
    ],
  },
  {
    id: "backend",
    label: "Backend / APIs",
    description: "Request lifecycles, state, reliability, and service boundaries.",
    capabilities: [
      {
        name: "FastAPI",
        tier: "CORE",
        evidence:
          "Production API layer for both SafeStep and Log Analytics.",
        projects: ["SafeStep", "Log Analytics"],
      },
      {
        name: "SQLAlchemy 2.0",
        tier: "CORE",
        evidence:
          "Async persistence, repository boundaries, eager-loading and locking fixes.",
        projects: ["SafeStep"],
      },
      {
        name: "REST APIs",
        tier: "CORE",
        evidence:
          "Authentication, analysis, ingestion, analytics, and pagination APIs.",
        projects: ["SafeStep", "Log Analytics"],
      },
      {
        name: "JWT / Sessions",
        tier: "STRONG",
        evidence:
          "Short-lived access tokens, rotating hashed refresh tokens, revocation.",
        projects: ["SafeStep"],
      },
      {
        name: "AsyncIO",
        tier: "STRONG",
        evidence:
          "Async request handling, persistence, and non-blocking service integration.",
        projects: ["SafeStep"],
      },
      {
        name: "Pydantic",
        tier: "STRONG",
        evidence:
          "Validation boundary for multimodal AI output and API schemas.",
        projects: ["SafeStep"],
      },
      {
        name: "Alembic",
        tier: "WORKING",
        evidence:
          "Schema evolution for normalized production PostgreSQL entities.",
        projects: ["SafeStep"],
      },
    ],
  },
  {
    id: "data",
    label: "Data / Performance",
    description: "Persistence, throughput, observability, and failure-aware data flow.",
    capabilities: [
      {
        name: "PostgreSQL",
        tier: "CORE",
        evidence:
          "Primary relational store across application and analytics systems.",
        projects: ["SafeStep", "Log Analytics"],
      },
      {
        name: "Queue Processing",
        tier: "STRONG",
        evidence:
          "Producer-consumer buffering to decouple ingestion from database writes.",
        projects: ["Log Analytics"],
      },
      {
        name: "Batch Writes",
        tier: "STRONG",
        evidence:
          "4-thread background worker batching PostgreSQL writes under load.",
        projects: ["Log Analytics"],
      },
      {
        name: "Observability",
        tier: "STRONG",
        evidence:
          "Correlation IDs, structured telemetry, latency and failure-rate analytics.",
        projects: ["SafeStep", "Log Analytics"],
      },
      {
        name: "Performance Profiling",
        tier: "STRONG",
        evidence:
          "Benchmarked ingestion strategies and improved throughput from 46 to 921+ events/sec.",
        projects: ["Log Analytics"],
      },
      {
        name: "Cursor Pagination",
        tier: "WORKING",
        evidence:
          "Analytics APIs with server-side filtering and cursor-based traversal.",
        projects: ["Log Analytics"],
      },
    ],
  },
  {
    id: "platform",
    label: "Platform / Tooling",
    description: "The deployment and testing layer around the code.",
    capabilities: [
      {
        name: "Docker",
        tier: "STRONG",
        evidence:
          "Containerized local development and backend services.",
        projects: ["SafeStep", "Log Analytics"],
      },
      {
        name: "Docker Compose",
        tier: "STRONG",
        evidence:
          "Local orchestration with application, PostgreSQL, volumes, and healthchecks.",
        projects: ["SafeStep"],
      },
      {
        name: "pytest",
        tier: "STRONG",
        evidence:
          "SafeStep validated with a 124-test suite and parameterized parser tests.",
        projects: ["SafeStep"],
      },
      {
        name: "Git / GitHub",
        tier: "CORE",
        evidence:
          "Version control, pull-request workflow, CI, and deployment integration.",
        projects: ["All projects"],
      },
      {
        name: "Linux",
        tier: "WORKING",
        evidence:
          "Development and systems tooling environment.",
        projects: ["Development"],
      },
      {
        name: "Vercel / Render",
        tier: "WORKING",
        evidence:
          "Production deployment and analytics infrastructure.",
        projects: ["SafeStep", "Portfolio"],
      },
      {
        name: "Cloudflare R2",
        tier: "WORKING",
        evidence:
          "Object storage in SafeStep's secure upload pipeline.",
        projects: ["SafeStep"],
      },
    ],
  },
  {
    id: "ai",
    label: "AI / Applied Models",
    description: "Model integration as one subsystem inside a larger product.",
    capabilities: [
      {
        name: "OpenAI API",
        tier: "STRONG",
        evidence:
          "Multimodal screenshot analysis inside a provider-agnostic pipeline.",
        projects: ["SafeStep"],
      },
      {
        name: "NVIDIA NIM",
        tier: "WORKING",
        evidence:
          "Second multimodal provider integrated behind the same orchestration layer.",
        projects: ["SafeStep"],
      },
      {
        name: "AI Fallback Logic",
        tier: "STRONG",
        evidence:
          "Provider fallback behavior measured through production telemetry endpoints.",
        projects: ["SafeStep", "Log Analytics"],
      },
      {
        name: "AI Infrastructure",
        tier: "EXPLORING",
        evidence:
          "Current learning focus around reliable model-serving systems.",
        projects: ["Next systems project"],
      },
    ],
  },
];
