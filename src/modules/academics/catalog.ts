import { courseInfo, courseOutline } from "./course-outline";

export const course = courseInfo;
export const modules = courseOutline.map(({ title, description }) => [title, description] as const);

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
