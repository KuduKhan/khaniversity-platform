export type School = {
  id: string;
  title: string;
  focus: string;
  introduction: string;
  programs: { id: string; title: string; courses: string[] }[];
};

// One academic catalog for the entire university. Schools share identity,
// enrollment, learning, assessment and evidence services.
export const schools: School[] = [
  {
    id: "computer-science",
    title: "School of Computer Science",
    focus: "Computation, programming, algorithms and systems",
    introduction:
      "Understand how computers solve problems, then turn that understanding into tested programs.",
    programs: [
      {
        id: "cs-foundations",
        title: "Computer Science Foundations",
        courses: ["cs101"],
      },
      {
        id: "algorithms-data",
        title: "Algorithms & Data",
        courses: ["cs201"],
      },
      {
        id: "systems-foundations",
        title: "Computing Systems",
        courses: ["cs220"],
      },
    ],
  },
  {
    id: "software-engineering",
    title: "School of Software Engineering",
    focus: "Web and mobile applications, APIs, architecture and quality",
    introduction:
      "Plan, build, test and maintain useful software through disciplined engineering practice.",
    programs: [
      { id: "web-applications", title: "Web Applications", courses: ["se110"] },
      { id: "api-engineering", title: "API Engineering", courses: ["se210"] },
      {
        id: "software-quality",
        title: "Software Quality & Delivery",
        courses: ["se230"],
      },
    ],
  },
  {
    id: "artificial-intelligence",
    title: "School of Artificial Intelligence",
    focus: "Machine learning, language models and responsible AI",
    introduction:
      "Build a rigorous foundation in data-driven systems, model evaluation and responsible deployment.",
    programs: [
      { id: "ai-foundations", title: "AI Foundations", courses: ["ai101"] },
      { id: "machine-learning", title: "Machine Learning", courses: ["ai210"] },
      {
        id: "applied-ai",
        title: "Applied AI Systems",
        courses: ["ai230"],
      },
    ],
  },
  {
    id: "cybersecurity",
    title: "School of Cybersecurity",
    focus: "Networks, defensive security, forensics and cryptography",
    introduction:
      "Learn to protect systems by understanding threats, reducing exposure and responding to evidence.",
    programs: [
      { id: "security-foundations", title: "Security Foundations", courses: ["cy101"] },
      { id: "network-defense", title: "Network Defense", courses: ["cy210"] },
      {
        id: "security-operations",
        title: "Security Operations",
        courses: ["cy230"],
      },
    ],
  },
  {
    id: "cloud",
    title: "School of Cloud & Infrastructure",
    focus: "Linux, databases, containers and reliable cloud services",
    introduction:
      "Operate secure, observable services and understand the infrastructure that supports modern software.",
    programs: [
      { id: "infrastructure", title: "Infrastructure Foundations", courses: ["cl101"] },
      { id: "cloud-platforms", title: "Cloud Platforms", courses: ["cl210"] },
      {
        id: "reliability",
        title: "Reliability Engineering",
        courses: ["cl230"],
      },
    ],
  },
  {
    id: "emerging-technologies",
    title: "School of Emerging Technologies",
    focus: "Robotics, IoT, embedded computing and future technologies",
    introduction:
      "Connect software to the physical world through sensing, control and responsible experimentation.",
    programs: [
      { id: "robotics", title: "Robotics Foundations", courses: ["et101"] },
      { id: "iot", title: "Internet of Things", courses: ["et210"] },
      {
        id: "embedded-systems",
        title: "Embedded Systems",
        courses: ["et230"],
      },
    ],
  },
];

export type CourseListing = {
  id: string;
  title: string;
  programId: string;
  schoolId: string;
  description: string;
  level: "Foundation" | "Intermediate" | "Advanced";
  status: "Available" | "Available preview";
};

export const courseListings: CourseListing[] = [
  {
    id: "cs101",
    title: "Introduction to Computer Science & Python",
    programId: "cs-foundations",
    schoolId: "computer-science",
    description:
      "A complete beginner pathway from computational thinking to a tested Personal Study Planner capstone.",
    level: "Foundation",
    status: "Available",
  },
  ...[
    ["cs201", "Algorithms & Data Structures", "algorithms-data", "computer-science", "Compare algorithms and choose data structures for practical problems.", "Intermediate"],
    ["cs220", "How Computing Systems Work", "systems-foundations", "computer-science", "Explore operating systems, networks and data storage.", "Intermediate"],
    ["se110", "Engineering a Web Application", "web-applications", "software-engineering", "Design accessible interfaces and connect them to reliable services.", "Foundation"],
    ["se210", "APIs & Service Design", "api-engineering", "software-engineering", "Model, validate and secure application interfaces.", "Intermediate"],
    ["se230", "Testing & Continuous Delivery", "software-quality", "software-engineering", "Build a quality workflow from automated tests to controlled releases.", "Advanced"],
    ["ai101", "Foundations of Artificial Intelligence", "ai-foundations", "artificial-intelligence", "Learn core AI ideas, limitations and responsible use.", "Foundation"],
    ["ai210", "Machine Learning with Data", "machine-learning", "artificial-intelligence", "Train, evaluate and interpret introductory predictive models.", "Intermediate"],
    ["ai230", "Applied Language Model Systems", "applied-ai", "artificial-intelligence", "Build grounded AI workflows with evaluation and safety boundaries.", "Advanced"],
    ["cy101", "Cybersecurity Foundations", "security-foundations", "cybersecurity", "Build a defensive security mindset and identify common risks.", "Foundation"],
    ["cy210", "Network Defense & Monitoring", "network-defense", "cybersecurity", "Read network signals and develop a practical defensive plan.", "Intermediate"],
    ["cy230", "Incident Response & Forensics", "security-operations", "cybersecurity", "Preserve evidence and reason through a structured response.", "Advanced"],
    ["cl101", "Linux & Infrastructure Foundations", "infrastructure", "cloud", "Understand processes, files, permissions and service boundaries.", "Foundation"],
    ["cl210", "Cloud Architecture & Deployment", "cloud-platforms", "cloud", "Design secure, observable application deployments.", "Intermediate"],
    ["cl230", "Reliable Cloud Services", "reliability", "cloud", "Practice reliability, capacity and recovery planning.", "Advanced"],
    ["et101", "Robotics & Physical Computing", "robotics", "emerging-technologies", "Connect sensing, logic and control in safe simulations.", "Foundation"],
    ["et210", "Connected Devices & IoT", "iot", "emerging-technologies", "Design responsible connected-device systems.", "Intermediate"],
    ["et230", "Embedded Systems Design", "embedded-systems", "emerging-technologies", "Explore constrained hardware, interfaces and dependable software.", "Advanced"],
  ].map(([id, title, programId, schoolId, description, level]) => ({
    id,
    title,
    programId,
    schoolId,
    description,
    level: level as CourseListing["level"],
    status: "Available preview" as const,
  })),
];

export function getSchool(id: string) {
  return schools.find((school) => school.id === id);
}

export function getCourse(id: string) {
  return courseListings.find((course) => course.id === id);
}
