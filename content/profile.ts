export type Profile = {
  name: string;
  year: string;
  school: string;
  academicFocus: string[];
  interests: string[];
  skills: string[];
  currentlyLearning: string[];
  githubUsername: string;
  email: string;
  links: {
    resume: string;
    github: string;
    linkedin: string;
    gmailCompose: string;
    mailto: string;
  };
};

const email = "shaarif.1031@gmail.com";
const subject = encodeURIComponent("Portfolio / Software Engineering");

export const profile: Profile = {
  name: "Muhammad Sharif",
  year: "Sophomore",
  school: "University of Southern Mississippi",
  academicFocus: ["Computer Science", "Mathematics"],
  interests: [
    "Backend Engineering",
    "Distributed Systems",
    "System Design",
    "Performance",
    "AI Applications",
    "Creative Technology",
    "Mathematical Systems",
  ],
  skills: [
    "Python",
    "TypeScript",
    "SQL",
    "C++",
    "FastAPI",
    "SQLAlchemy 2.0 (Async)",
    "Alembic",
    "Pydantic",
    "JWT",
    "REST APIs",
    "AsyncIO",
    "Structured Logging / Observability",
    "Next.js",
    "React",
    "Tailwind CSS",
    "PostgreSQL",
    "Docker",
    "Docker Compose",
    "Cloudflare R2",
    "Vercel",
    "Render",
    "OpenAI API",
    "NVIDIA NIM",
    "pytest",
    "AsyncMock",
    "Postman",
    "Git",
    "Linux",
  ],
  currentlyLearning: [
    "Go",
    "Distributed Systems",
    "System Design",
    "Backend Scalability",
    "AI Infrastructure",
    "Performance Optimization",
  ],
  githubUsername: "SharifWaqas",
  email,
  links: {
    resume: "/resume",
    github: "https://github.com/SharifWaqas",
    linkedin: "https://www.linkedin.com/in/muhammad-sharif-77494139b",
    gmailCompose: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${subject}`,
    mailto: `mailto:${email}?subject=${subject}`,
  },
};
