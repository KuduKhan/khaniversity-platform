export const diagnosticQuestions = [
  {
    prompt: "Which statement best describes an algorithm?",
    topic: "Algorithms",
    options: [
      "A finite sequence of clear steps for a task",
      "A specific computer brand",
      "A list of random instructions",
    ],
    answer: 0,
  },
  {
    prompt: "In an input-process-output model, where does a calculation belong?",
    topic: "Systems thinking",
    options: ["Input", "Process", "Output"],
    answer: 1,
  },
  {
    prompt: "What is a useful first step when a problem feels too large?",
    topic: "Problem solving",
    options: ["Guess the final answer", "Break it into smaller parts", "Write code immediately"],
    answer: 1,
  },
  {
    prompt: "What does a loop help a program do?",
    topic: "Programming logic",
    options: ["Repeat a set of instructions", "Rename a variable", "Store a file"],
    answer: 0,
  },
  {
    prompt: "Why test a solution with an empty list?",
    topic: "Testing",
    options: ["To increase the program size", "To check an edge case", "To skip the algorithm"],
    answer: 1,
  },
  {
    prompt: "Which Python value represents a collection of ordered items?",
    topic: "Python foundations",
    options: ["A list", "A comment", "A function name"],
    answer: 0,
  },
] as const;

export type DiagnosticResult = {
  completedAt: string;
  score: number;
  byTopic: Record<string, number>;
};

export function gradeDiagnostic(answers: number[]): DiagnosticResult {
  if (
    answers.length !== diagnosticQuestions.length ||
    diagnosticQuestions.some((_, index) =>
      !Number.isInteger(answers[index]) || answers[index] < 0 || answers[index] > 2,
    )
  ) {
    throw new Error("Answer all six questions to build your starting path.");
  }
  const byTopic = Object.fromEntries(
    diagnosticQuestions.map((question, index) => [question.topic, answers[index] === question.answer ? 100 : 0]),
  );
  const correct = diagnosticQuestions.reduce((total, question, index) => total + Number(answers[index] === question.answer), 0);
  return { completedAt: new Date().toISOString(), score: Math.round((correct / diagnosticQuestions.length) * 100), byTopic };
}

