/* Edit this file to customize your site. */
window.SITE_CONFIG = {
  name: "Darius Sattari",
  role: "Engineer • Builder • Lifelong learner",
  tagline: "I build practical software, explore AI systems, and share what I learn.",
  githubUsername: "dariussattari",
  email: "you@example.com",

  socials: [
    { label: "GitHub", href: "https://github.com/dariussattari" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/your-handle/" },
  ],

  aiDiscussionsUrl: "",

  projectSettings: {
    maxRepos: 80,
    includeArchived: false,
    includeForks: false,
  },

  projectSubjects: [
    {
      id: "all",
      label: "All subjects",
      match: { languages: [], keywords: [] },
    },
    {
      id: "ai",
      label: "AI / ML",
      match: {
        languages: ["Python", "Jupyter Notebook"],
        keywords: ["ai", "ml", "llm", "nlp", "transformer", "agent", "rag"],
      },
    },
    {
      id: "data",
      label: "Data / Analytics",
      match: {
        languages: ["Python", "SQL", "R"],
        keywords: ["data", "analytics", "etl", "pipeline", "warehouse", "dashboard"],
      },
    },
    {
      id: "web",
      label: "Web / Apps",
      match: {
        languages: ["TypeScript", "JavaScript", "HTML", "CSS"],
        keywords: ["web", "frontend", "backend", "react", "next", "api"],
      },
    },
    {
      id: "systems",
      label: "Systems / Infra",
      match: {
        languages: ["Go", "Rust", "C", "C++", "Shell"],
        keywords: ["infra", "docker", "kubernetes", "cli", "systems"],
      },
    },
    {
      id: "automation",
      label: "Automation",
      match: {
        languages: ["Python", "Shell", "JavaScript"],
        keywords: ["automation", "workflow", "scrape", "bot", "script"],
      },
    },
  ],
};

