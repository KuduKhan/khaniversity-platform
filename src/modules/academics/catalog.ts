export const course = {
  id: "cs101",
  title: "Introduction to Computer Science & Python",
  program: "Computer Science Foundations",
  school: "School of Computer Science",
  version: "0.1.0",
  lessonId: "computational-thinking",
};
export const modules = [
  [
    "Computer systems & computational thinking",
    "Turn a problem into a clear sequence of steps.",
  ],
  [
    "Programming fundamentals & Python",
    "Write and execute your first Python script.",
  ],
  [
    "Variables, data types & input/output",
    "Represent and transform information.",
  ],
  [
    "Conditions, loops & control flow",
    "Make decisions and repeat useful work.",
  ],
  [
    "Functions, scope & decomposition",
    "Break complex work into reusable functions.",
  ],
  [
    "Lists, tuples, dictionaries & sets",
    "Choose structures that fit your data.",
  ],
  ["Files, exceptions & debugging", "Find faults and handle common failures."],
  ["Algorithms & complexity", "Compare solutions and their efficiency."],
  ["Testing, Git & code quality", "Verify behavior and track your work."],
  [
    "Capstone: Personal Study Planner",
    "Build, test and explain a practical program.",
  ],
] as const;
export const questions = [
  {
    prompt: "Which description best defines an algorithm?",
    options: [
      "A particular programming language",
      "A precise sequence of steps to solve a problem",
      "The physical parts of a computer",
    ],
    answer: 1,
    explanation:
      "An algorithm is a finite, unambiguous sequence of steps. It can be expressed without code.",
  },
  {
    prompt:
      "A study planner takes task durations and returns a total. What is the output?",
    options: [
      "The individual task durations",
      "The addition operation",
      "The total study time",
    ],
    answer: 2,
    explanation:
      "Durations are inputs, addition is processing, and the total is the output.",
  },
  {
    prompt: "What does decomposition help you do?",
    options: [
      "Split a problem into smaller, manageable parts",
      "Avoid checking your solution",
      "Choose a faster computer",
    ],
    answer: 0,
    explanation:
      "Decomposition separates a large problem into parts you can reason about and test.",
  },
  {
    prompt: "Which instruction is least ambiguous?",
    options: [
      "Study for a while",
      "Repeat until it feels right",
      "Add each task duration to a total starting at zero",
    ],
    answer: 2,
    explanation:
      "An explicit starting state and operation make a sequence reproducible.",
  },
  {
    prompt: "Why test an algorithm with no tasks?",
    options: [
      "Empty inputs are always invalid",
      "To check an edge case",
      "To change the programming language",
    ],
    answer: 1,
    explanation:
      "An empty list is an edge case. A sensible study-time total is zero.",
  },
];
