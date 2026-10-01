export type Profile = {
  name: string;
  year: string;
  school: string;
  academicFocus: string[];
  interests: string[];
  skills: string[];
  currentlyLearning: string[];
  githubUsername: string;
  links: {
    resume: string | null;
    github: string;
    linkedin: string;
  };
};

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
  ],
  skills: [
    "Python",
    "C++",
    "SQL",
    "FastAPI",
    "PostgreSQL",
    "SQLAlchemy",
    "REST APIs",
    "JWT",
    "Docker",
    "Git",
    "GitHub",
    "OpenAI API",
  ],
  currentlyLearning: [
    "Go",
    "Distributed Systems",
    "System Design",
    "Backend Scalability",
  ],
  githubUsername: "SharifWaqas",
  links: {
    resume: null,
    github: "https://github.com/SharifWaqas",
    linkedin: "https://www.linkedin.com/in/muhammad-sharif-77494139b",
  },
};
