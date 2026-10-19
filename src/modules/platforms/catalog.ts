// Original blueprint v1.0, Section 08: Platform Interfaces.
// Five product surfaces share ONE KHANIVERSITY modular monolith.
export type PlatformId = "public" | "student" | "studio" | "codelab" | "admin";
export type PlatformSurface = {
  id: PlatformId;
  number: string;
  title: string;
  eyebrow: string;
  description: string;
  highlights: readonly string[];
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  access: "public" | "preview-and-account" | "staff-only";
  note: string;
};

export const platformSurfaces: readonly PlatformSurface[] = [
  {
    id: "public", number: "01", title: "Public Site",
    eyebrow: "DISCOVER THE UNIVERSITY",
    description: "Explore the academy, academic schools, CS101 and the controlled pilot's entry process.",
    highlights: ["Academic catalog", "CS101 pathway", "Pilot entry and account sign-in"],
    primaryLabel: "Explore admissions", primaryHref: "/admissions",
    secondaryLabel: "Browse CS101", secondaryHref: "/catalog/cs101",
    access: "public", note: "An independent online learning academy, not an accredited degree-awarding university.",
  },
  {
    id: "student", number: "02", title: "Student Portal",
    eyebrow: "STUDENTOS",
    description: "Your enrolled learning pathway, next recommended lesson, mastery progress and revision queue.",
    highlights: ["Course enrollment", "Account-backed progress", "Next-step dashboard"],
    primaryLabel: "Preview StudentOS", primaryHref: "/preview/dashboard",
    secondaryLabel: "Student sign-in", secondaryHref: "/signin",
    access: "preview-and-account", note: "Preview activity is device-local. Authenticated progress is kept separately.",
  },
  {
    id: "studio", number: "03", title: "Learning Studio",
    eyebrow: "STUDY AND UNDERSTAND",
    description: "Lessons with learning outcomes, worked examples, interactive checks and guided AI tutoring.",
    highlights: ["Ten CS101 modules", "Practice and remediation", "Lesson-grounded tutor"],
    primaryLabel: "Open CS101 lesson", primaryHref: "/preview/learn/cs101/computational-thinking",
    secondaryLabel: "View the syllabus", secondaryHref: "/catalog/cs101",
    access: "preview-and-account", note: "Official assessment evidence requires enrollment and protected database grading.",
  },
  {
    id: "codelab", number: "04", title: "Python CodeLab",
    eyebrow: "BUILD AND TEST",
    description: "Run Python in an isolated browser worker, see console output, check exercises and export your code.",
    highlights: ["In-browser Python runtime", "Deterministic practice checks", "Private account-backed submissions and reviewer feedback"],
    primaryLabel: "Open CodeLab", primaryHref: "/preview/codelab",
    secondaryLabel: "Sign in for CS101", secondaryHref: "/signin",
    access: "preview-and-account", note: "Browser drafts remain local until signed-in students submit code for staff review. Browser tests do not determine official grades.",
  },
  {
    id: "admin", number: "05", title: "Academic Administration",
    eyebrow: "GOVERN AND REVIEW",
    description: "Reviewed lesson material, code and capstone decisions, real enrollment metrics and restricted staff access control.",
    highlights: ["Reviewer-approved lesson supplements", "Code and capstone review", "Administrator-managed staff access and audit"],
    primaryLabel: "Open staff console", primaryHref: "/admin",
    secondaryLabel: "View university catalog", secondaryHref: "/catalog",
    access: "staff-only", note: "Operations require assigned staff roles; student accounts cannot self-assign permissions.",
  },
] as const;
