const SKILL_MAP = {
  "Core CS": {
    DSA: [/\bdsa\b/i, /data structures?/i, /algorithms?/i],
    OOP: [/\boop\b/i, /object[\s-]?oriented/i],
    DBMS: [/\bdbms\b/i, /database management/i],
    OS: [/\bos\b/i, /operating systems?/i],
    Networks: [/\bnetworks?\b/i, /computer networks?/i],
  },
  Languages: {
    Java: [/\bjava\b(?!script)/i],
    Python: [/\bpython\b/i],
    JavaScript: [/\bjavascript\b/i, /\bjs\b/i],
    TypeScript: [/\btypescript\b/i, /\bts\b/i],
    C: [/\bc language\b/i, /\bc programming\b/i, /\bc\b(?!\+\+|#)/i],
    "C++": [/\bc\+\+\b/i],
    "C#": [/\bc#\b/i, /c sharp/i],
    Go: [/\bgolang\b/i, /\bgo language\b/i],
  },
  Web: {
    React: [/\breact(?:\.js)?\b/i],
    "Next.js": [/\bnext(?:\.js)?\b/i],
    "Node.js": [/\bnode(?:\.js)?\b/i],
    Express: [/\bexpress(?:\.js)?\b/i, /\bexpress\b/i],
    REST: [/\brest\b/i, /\brestful\b/i],
    GraphQL: [/\bgraphql\b/i],
  },
  Data: {
    SQL: [/\bsql\b/i],
    MongoDB: [/\bmongodb\b/i, /\bmongo\b/i],
    PostgreSQL: [/\bpostgres(?:ql)?\b/i],
    MySQL: [/\bmysql\b/i],
    Redis: [/\bredis\b/i],
  },
  "Cloud/DevOps": {
    AWS: [/\baws\b/i, /amazon web services/i],
    Azure: [/\bazure\b/i],
    GCP: [/\bgcp\b/i, /google cloud/i],
    Docker: [/\bdocker\b/i],
    Kubernetes: [/\bkubernetes\b/i, /\bk8s\b/i],
    "CI/CD": [/\bci\/?cd\b/i, /continuous integration/i, /continuous delivery/i],
    Linux: [/\blinux\b/i],
  },
  Testing: {
    Selenium: [/\bselenium\b/i],
    Cypress: [/\bcypress\b/i],
    Playwright: [/\bplaywright\b/i],
    JUnit: [/\bjunit\b/i],
    PyTest: [/\bpytest\b/i],
  },
};

function detectSkills(jdText) {
  const normalized = jdText || "";
  const extracted = {};

  Object.entries(SKILL_MAP).forEach(([category, skills]) => {
    const found = Object.entries(skills)
      .filter(([, patterns]) => patterns.some((pattern) => pattern.test(normalized)))
      .map(([skill]) => skill);

    if (found.length > 0) {
      extracted[category] = found;
    }
  });

  if (Object.keys(extracted).length === 0) {
    return { General: ["General fresher stack"] };
  }

  return extracted;
}

function buildChecklist(extractedSkills) {
  const allSkills = Object.values(extractedSkills).flat();
  const has = (skill) => allSkills.includes(skill);

  const round1 = [
    "Revise quantitative aptitude formulas and shortcut methods.",
    "Practice 2 timed logical reasoning sets.",
    "Review verbal ability basics (reading comprehension + grammar).",
    "Prepare a crisp self-introduction (60-90 seconds).",
    "Recheck fundamental syntax in your primary language.",
  ];

  if (has("Python") || has("Java") || has("JavaScript") || has("C++")) {
    round1.push("Solve 8-10 warm-up language-based coding questions.");
  }

  const round2 = [
    "Practice arrays, strings, and hashing problems with time limits.",
    "Revise recursion, stack/queue, and tree traversals.",
    "Solve 2 medium DSA problems and explain trade-offs.",
    "Review OS process/thread basics and scheduling concepts.",
    "Revise DBMS normalization, ACID properties, and transactions.",
  ];

  if (has("Networks")) {
    round2.push("Brush up on TCP/IP, HTTP lifecycle, and common status codes.");
  }
  if (has("OOP")) {
    round2.push("Revise OOP pillars with one practical code example each.");
  }

  const round3 = [
    "Prepare 2 project deep dives: architecture, challenges, and outcomes.",
    "Practice explaining design decisions and trade-offs clearly.",
    "Align resume bullet points with measurable impact.",
    "Prepare one scalability and one debugging story from your projects.",
    "Practice role-specific technical Q&A in mock format.",
  ];

  if (has("React") || has("Next.js")) {
    round3.push("Revise component lifecycle, state management, and rendering optimization.");
  }
  if (has("Node.js") || has("Express") || has("REST") || has("GraphQL")) {
    round3.push("Review API design, auth flow, and request/response validation.");
  }
  if (has("SQL") || has("MongoDB") || has("PostgreSQL") || has("MySQL")) {
    round3.push("Practice schema reasoning, indexing, and query optimization basics.");
  }
  if (has("AWS") || has("Docker") || has("Kubernetes") || has("CI/CD")) {
    round3.push("Explain deployment pipeline, containerization, and observability approach.");
  }

  const round4 = [
    "Prepare STAR-format answers for leadership and ownership questions.",
    "Draft concise responses for strengths, weaknesses, and conflict handling.",
    "Prepare role motivation and company-fit explanation.",
    "Practice salary/expectation response in a balanced tone.",
    "Prepare 3 thoughtful questions to ask interviewer/manager.",
  ];

  return {
    "Round 1: Aptitude / Basics": round1.slice(0, 8),
    "Round 2: DSA + Core CS": round2.slice(0, 8),
    "Round 3: Tech interview (projects + stack)": round3.slice(0, 8),
    "Round 4: Managerial / HR": round4.slice(0, 8),
  };
}

function buildPlan(extractedSkills) {
  const allSkills = Object.values(extractedSkills).flat();
  const has = (skill) => allSkills.includes(skill);

  const day1 = [
    "Revise aptitude fundamentals and communication basics.",
    "Review OS, DBMS, and OOP fundamentals with short notes.",
  ];
  const day2 = ["Continue Core CS revision and solve 20 MCQs across OS/DBMS/Networks."];
  const day3 = ["Practice DSA: arrays, strings, hashing (5-6 medium problems)."];
  const day4 = ["Practice DSA: trees/graphs or dynamic programming with timed attempts."];
  const day5 = ["Align resume bullets to JD and prepare project walkthrough scripts."];
  const day6 = ["Run a mock interview: 60 minutes technical + behavioral round."];
  const day7 = ["Revise weak areas from mock feedback and create final cheat sheet."];

  if (has("React") || has("Next.js")) {
    day5.push("Frontend revision: state management, rendering flow, and performance tuning.");
  }
  if (has("Node.js") || has("Express") || has("REST") || has("GraphQL")) {
    day5.push("Backend/API revision: auth, error handling, and scalable endpoint design.");
  }
  if (has("SQL") || has("PostgreSQL") || has("MySQL") || has("MongoDB")) {
    day3.push("Practice 10 DB query tasks including joins/indexing use cases.");
  }
  if (has("AWS") || has("Docker") || has("Kubernetes") || has("CI/CD")) {
    day6.push("Discuss one deployment pipeline end-to-end with rollback strategy.");
  }
  if (has("Selenium") || has("Cypress") || has("Playwright") || has("PyTest") || has("JUnit")) {
    day4.push("Write or review automation test cases for critical project flows.");
  }

  return [
    { day: "Day 1", focus: "Basics + core CS", tasks: day1 },
    { day: "Day 2", focus: "Basics + core CS", tasks: day2 },
    { day: "Day 3", focus: "DSA + coding practice", tasks: day3 },
    { day: "Day 4", focus: "DSA + coding practice", tasks: day4 },
    { day: "Day 5", focus: "Project + resume alignment", tasks: day5 },
    { day: "Day 6", focus: "Mock interview questions", tasks: day6 },
    { day: "Day 7", focus: "Revision + weak areas", tasks: day7 },
  ];
}

const QUESTION_BANK = {
  DSA: "How would you optimize search in sorted data, and when would you choose binary search variants?",
  OOP: "How would you model a real-world module using encapsulation and polymorphism in your main language?",
  DBMS: "How do normalization and denormalization trade off performance and maintainability?",
  OS: "What happens from process creation to context switching in a multitasking OS?",
  Networks: "How does an HTTP request travel from browser to server, and where can latency occur?",
  Java: "How do Java memory model and garbage collection affect performance-sensitive code?",
  Python: "When would you prefer list comprehensions vs generators in Python and why?",
  JavaScript: "How do closures and the event loop influence async behavior in JavaScript applications?",
  TypeScript: "How would you design robust TypeScript interfaces for evolving API responses?",
  C: "How do you avoid memory errors in C while handling dynamic data structures?",
  "C++": "When would you choose smart pointers over raw pointers in modern C++?",
  "C#": "How do dependency injection and async/await improve maintainability in C# services?",
  Go: "How would you use goroutines and channels to build a concurrent worker pipeline?",
  React: "Explain state management options in React and when you would choose each.",
  "Next.js": "When would you use server components, static generation, or SSR in Next.js?",
  "Node.js": "How do you prevent event-loop blocking in high-throughput Node.js services?",
  Express: "How would you structure middleware for auth, validation, and centralized error handling in Express?",
  REST: "How do you design REST endpoints for idempotency, versioning, and clear error contracts?",
  GraphQL: "How do you prevent N+1 query issues and secure GraphQL resolvers?",
  SQL: "Explain indexing and when it helps, including a case where it can hurt writes.",
  MongoDB: "How would you choose between embedding and referencing documents in MongoDB?",
  PostgreSQL: "How would you optimize slow PostgreSQL queries using execution plans?",
  MySQL: "How do transaction isolation levels in MySQL affect consistency and concurrency?",
  Redis: "When would you use Redis as cache vs primary data structure store?",
  AWS: "How would you design a fault-tolerant deployment on AWS for a student-scale product?",
  Azure: "Which Azure services would you combine for scalable web app hosting and monitoring?",
  GCP: "How would you architect CI/CD and autoscaling for an app on GCP?",
  Docker: "How do you optimize Docker image size and startup time for production?",
  Kubernetes: "How would you define liveness/readiness probes for stable Kubernetes rollouts?",
  "CI/CD": "What quality gates would you add in CI/CD before promoting to production?",
  Linux: "Which Linux debugging commands do you rely on to diagnose CPU and memory bottlenecks?",
  Selenium: "How would you reduce flaky Selenium tests in a dynamic web UI?",
  Cypress: "How does Cypress architecture impact E2E test speed and reliability?",
  Playwright: "What Playwright features help maintain cross-browser test confidence?",
  JUnit: "How do you structure JUnit test suites to keep feedback fast and meaningful?",
  PyTest: "How would you use fixtures and parametrization effectively in PyTest?",
};

function buildQuestions(extractedSkills) {
  const skills = Object.values(extractedSkills).flat();
  const questions = [];

  skills.forEach((skill) => {
    if (QUESTION_BANK[skill] && !questions.includes(QUESTION_BANK[skill])) {
      questions.push(QUESTION_BANK[skill]);
    }
  });

  const fallback = [
    "Tell me about your strongest project and the toughest technical decision you made.",
    "How do you break down an unfamiliar problem under interview time pressure?",
    "Which weak area are you currently improving, and how are you tracking progress?",
    "How would you prioritize bugs vs feature work in a tight deadline sprint?",
    "How do you validate that your solution is correct before submission?",
    "Describe a time you improved performance or reliability in your code.",
    "How do you communicate trade-offs when collaborating with non-technical stakeholders?",
    "What metrics would you track to evaluate the quality of a feature after release?",
    "How do you prepare for ambiguous interview questions with incomplete requirements?",
    "What debugging process do you follow when a fix works locally but fails in production-like tests?",
  ];

  while (questions.length < 10) {
    const next = fallback.find((item) => !questions.includes(item));
    if (!next) break;
    questions.push(next);
  }

  return questions.slice(0, 10);
}

function calculateReadiness({ extractedSkills, company, role, jdText }) {
  const categoryCount = Object.keys(extractedSkills).filter((k) => k !== "General").length;
  const categoryScore = Math.min(categoryCount * 5, 30);

  let score = 35 + categoryScore;
  if ((company || "").trim()) score += 10;
  if ((role || "").trim()) score += 10;
  if ((jdText || "").trim().length > 800) score += 10;

  return Math.min(score, 100);
}

const ENTERPRISE_COMPANIES = [
  "amazon",
  "infosys",
  "tcs",
  "wipro",
  "accenture",
  "google",
  "microsoft",
  "meta",
  "ibm",
  "deloitte",
  "cognizant",
];

function inferIndustry(company, jdText) {
  const text = `${company || ""} ${jdText || ""}`.toLowerCase();

  if (/bank|fintech|payments|wallet|insurance/.test(text)) return "Financial Services";
  if (/health|med|hospital|pharma/.test(text)) return "Healthcare Technology";
  if (/retail|e-?commerce|marketplace|shopping/.test(text)) return "E-commerce";
  if (/consult|services|outsourcing/.test(text)) return "Technology Services";
  if (/saas|platform|cloud|product/.test(text)) return "Software Product";

  return "Technology Services";
}

function inferCompanySize(company) {
  const name = (company || "").trim().toLowerCase();
  if (!name) return "Startup (<200)";
  if (ENTERPRISE_COMPANIES.some((known) => name.includes(known))) return "Enterprise (2000+)";
  return "Startup (<200)";
}

export function generateCompanyIntel({ company, jdText }) {
  const companyName = (company || "").trim();
  const sizeCategory = inferCompanySize(companyName);
  const industry = inferIndustry(companyName, jdText);

  const typicalHiringFocus =
    sizeCategory === "Enterprise (2000+)"
      ? "Structured DSA screening, strong core CS fundamentals, and consistent communication clarity."
      : "Practical problem solving, strong stack depth, and ability to ship features end-to-end quickly.";

  return {
    companyName: companyName || "Not provided",
    industry,
    sizeCategory,
    typicalHiringFocus,
    demoNote: "Demo Mode: Company intel generated heuristically.",
  };
}

function buildRound(title, focus, whyItMatters) {
  return { title, focus, whyItMatters };
}

export function generateRoundMapping({ extractedSkills, companyIntel }) {
  const allSkills = Object.values(extractedSkills || {}).flat();
  const has = (skill) => allSkills.includes(skill);
  const isEnterprise = companyIntel?.sizeCategory === "Enterprise (2000+)";
  const isStartup = companyIntel?.sizeCategory === "Startup (<200)";
  const hasWebStack = has("React") || has("Next.js") || has("Node.js") || has("Express");
  const hasDSA = has("DSA");

  if (isEnterprise && hasDSA) {
    return [
      buildRound(
        "Round 1: Online Test (DSA + Aptitude)",
        "Timed coding and aptitude with elimination cutoff.",
        "This round filters for problem-solving speed and core analytical baseline.",
      ),
      buildRound(
        "Round 2: Technical (DSA + Core CS)",
        "In-depth coding plus OS/DBMS/OOP fundamentals.",
        "Interviewers validate depth, correctness, and reasoning under pressure.",
      ),
      buildRound(
        "Round 3: Tech + Projects",
        "Project walkthrough with stack-specific follow-up questions.",
        "This ensures your practical execution matches your resume claims.",
      ),
      buildRound(
        "Round 4: HR",
        "Behavioral and role-fit conversation.",
        "Final round checks communication maturity and long-term alignment.",
      ),
    ];
  }

  if (isStartup && hasWebStack) {
    return [
      buildRound(
        "Round 1: Practical Coding",
        "Build/debug feature-level tasks using real stack constraints.",
        "Startups prioritize immediate execution ability over theoretical depth alone.",
      ),
      buildRound(
        "Round 2: System Discussion",
        "Architecture and trade-off conversation around your implementation.",
        "Founders/leads test ownership mindset and pragmatic technical decisions.",
      ),
      buildRound(
        "Round 3: Culture Fit",
        "Team collaboration, communication, and ambiguity handling.",
        "Small teams need high trust, adaptability, and proactive communication.",
      ),
    ];
  }

  if (isEnterprise) {
    return [
      buildRound(
        "Round 1: Online Assessment",
        "Aptitude, coding basics, and screening MCQs.",
        "It establishes consistent baseline capability across large applicant pools.",
      ),
      buildRound(
        "Round 2: Technical Fundamentals",
        "Coding + fundamentals from role-relevant domains.",
        "This validates technical consistency beyond memorized patterns.",
      ),
      buildRound(
        "Round 3: Project and Problem Solving",
        "Discussion on implementation quality and debugging approach.",
        "Interviewers assess applied engineering judgment and ownership.",
      ),
      buildRound(
        "Round 4: HR / Managerial",
        "Behavioral evaluation and role-fit.",
        "This confirms communication quality and organizational alignment.",
      ),
    ];
  }

  return [
    buildRound(
      "Round 1: Practical Coding",
      "Task-based coding aligned with role stack.",
      "It quickly verifies if you can contribute in real project scenarios.",
    ),
    buildRound(
      "Round 2: Technical Deep Dive",
      "Projects, core fundamentals, and debugging/system reasoning.",
      "This round validates decision-making depth and implementation maturity.",
    ),
    buildRound(
      "Round 3: Culture Fit",
      "Communication, collaboration style, and growth mindset.",
      "Teams use this to evaluate long-term fit and execution reliability.",
    ),
  ];
}

export function generateAnalysis({ company, role, jdText }) {
  const extractedSkills = detectSkills(jdText);
  const checklist = buildChecklist(extractedSkills);
  const plan = buildPlan(extractedSkills);
  const questions = buildQuestions(extractedSkills);
  const readinessScore = calculateReadiness({ extractedSkills, company, role, jdText });
  const companyIntel = generateCompanyIntel({ company, jdText });
  const roundMapping = generateRoundMapping({ extractedSkills, companyIntel });

  return {
    extractedSkills,
    checklist,
    plan,
    questions,
    readinessScore,
    companyIntel,
    roundMapping,
  };
}
