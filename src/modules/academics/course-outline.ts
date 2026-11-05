/**
 * CS101 public curriculum outline. Safe to import in client components.
 * Assessment questions and answer keys MUST remain in server curriculum.ts.
 * This is the canonical source of module titles, descriptions and outcomes.
 */
export const courseInfo = {
  id: "cs101",
  title: "Introduction to Computer Science & Python",
  program: "Computer Science Foundations",
  school: "School of Computer Science",
  version: "0.1.0",
  lessonId: "computational-thinking",
} as const;

export const courseOutline = [
  {
    "id": "computational-thinking",
    "outcome": "Describe a computing problem as inputs, processing and outputs; decompose it into testable steps.",
    "title": "Computer systems & computational thinking",
    "description": "Turn a problem into a clear sequence of steps.",
    "project": false
  },
  {
    "id": "programming-fundamentals",
    "outcome": "Run a Python program, recognize statements and expressions, and explain how execution proceeds.",
    "title": "Programming fundamentals & Python",
    "description": "Write and execute your first Python script.",
    "project": false
  },
  {
    "id": "variables-data-input-output",
    "outcome": "Choose appropriate data types, validate user input and transform values without losing meaning.",
    "title": "Variables, data types & input/output",
    "description": "Represent and transform information.",
    "project": false
  },
  {
    "id": "conditions-loops",
    "outcome": "Use conditions and loops to express decisions and repetition with clear stop conditions.",
    "title": "Conditions, loops & control flow",
    "description": "Make decisions and repeat useful work.",
    "project": false
  },
  {
    "id": "functions-scope",
    "outcome": "Write reusable functions with parameters, return values and a clear responsibility.",
    "title": "Functions, scope & decomposition",
    "description": "Break complex work into reusable functions.",
    "project": false
  },
  {
    "id": "collections",
    "outcome": "Select lists, tuples, dictionaries and sets to match common data-access needs.",
    "title": "Lists, tuples, dictionaries & sets",
    "description": "Choose structures that fit your data.",
    "project": false
  },
  {
    "id": "files-exceptions-debugging",
    "outcome": "Read and write structured files safely and handle expected failures with useful messages.",
    "title": "Files, exceptions & debugging",
    "description": "Find faults and handle common failures.",
    "project": false
  },
  {
    "id": "algorithms-complexity",
    "outcome": "Compare a straightforward search and explain how work grows as input size increases.",
    "title": "Algorithms & complexity",
    "description": "Compare solutions and their efficiency.",
    "project": false
  },
  {
    "id": "testing-git-quality",
    "outcome": "Write behavior-focused tests and use version control to make changes reviewable.",
    "title": "Testing, Git & code quality",
    "description": "Verify behavior and track your work.",
    "project": false
  },
  {
    "id": "personal-study-planner-capstone",
    "outcome": "Design, implement, test and explain a data-driven study planner with validation and persistence.",
    "title": "Capstone: Personal Study Planner",
    "description": "Build, test and explain a practical program.",
    "project": true
  }
] as const;
