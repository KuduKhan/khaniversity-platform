/**
 * KHANIVERSITY CS101 Practice Studio.
 *
 * Interactive, explicitly ungraded worked-example checks. These are
 * browser-side reasoning prompts, not Python execution or official assessment.
 * The published database assessment answer keys are entirely separate.
 */
export type PracticeStep = {
  prompt: string;
  answer: string;
  kind: "number" | "text";
  hint: string;
  explanation: string;
};

export type PracticeChallenge = {
  moduleId: string;
  title: string;
  goal: string;
  example: string;
  steps: readonly [PracticeStep, PracticeStep];
};

export const PRACTICE_VERSION = 1;
export const PRACTICE_STEP_COUNT = 2;

export const practiceChallenges: readonly PracticeChallenge[] = [
  {
    moduleId: "computational-thinking",
    title: "Trace an algorithm before writing code",
    goal: "Follow inputs and processing to predict a result and an edge case.",
    example: "durations = [20, 35, 15]\ntotal = 0\nfor duration in durations:\n    total = total + duration\nprint(total)",
    steps: [
      { prompt: "What total is printed? Enter the number.", answer: "70", kind: "number", hint: "Start with 0. Add 20, then 35, then 15.", explanation: "The running total is 0 → 20 → 55 → 70." },
      { prompt: "If durations is an empty list, what total is printed?", answer: "0", kind: "number", hint: "The loop body never runs, so think about the starting value.", explanation: "An empty list leaves the initialized total at 0. Testing edge cases matters." },
    ],
  },
  {
    moduleId: "programming-fundamentals",
    title: "Predict Python output",
    goal: "Separate an assignment from a printed result.",
    example: "count = 3\ncount = count + 2\nprint(count)\nprint(count * 2)",
    steps: [
      { prompt: "What number is printed first?", answer: "5", kind: "number", hint: "count changes from 3 to 3 + 2 before the first print.", explanation: "The assignment updates count to 5 before printing." },
      { prompt: "What number is printed second?", answer: "10", kind: "number", hint: "Multiply the updated count by two.", explanation: "The second print evaluates 5 × 2 = 10." },
    ],
  },
  {
    moduleId: "variables-data-input-output",
    title: "Convert text to useful data",
    goal: "Trace explicit type conversion and arithmetic.",
    example: 'raw = "35"\nminutes = int(raw)\nseconds = minutes * 60\nprint(seconds)\nprint(type(raw).__name__)',
    steps: [
      { prompt: "How many seconds are printed first?", answer: "2100", kind: "number", hint: "Convert 35 minutes using 60 seconds per minute.", explanation: "int(raw) produces 35, and 35 × 60 = 2,100 seconds." },
      { prompt: "What type name is printed on the last line?", answer: "str", kind: "text", hint: "raw has quotes around the value; converting into minutes did not change raw.", explanation: "raw remains a string (str). The converted variable minutes is an integer." },
    ],
  },
  {
    moduleId: "conditions-loops",
    title: "Follow a conditional loop",
    goal: "Count the items that satisfy a decision rule.",
    example: "values = [1, 2, 3, 4, 5]\ncount = 0\nfor value in values:\n    if value % 2 == 0:\n        count += 1\nprint(count)",
    steps: [
      { prompt: "How many values satisfy the condition?", answer: "2", kind: "number", hint: "The remainder after dividing by 2 is zero for even numbers.", explanation: "Only 2 and 4 are even, so count becomes 2." },
      { prompt: "If values is empty, what count is printed?", answer: "0", kind: "number", hint: "The loop runs zero times and count begins at zero.", explanation: "No iterations means the initial count of zero stays unchanged." },
    ],
  },
  {
    moduleId: "functions-scope",
    title: "Trace parameters and returns",
    goal: "Distinguish a function's argument from its returned value.",
    example: "def add_bonus(points):\n    bonus = 4\n    return points + bonus\n\nprint(add_bonus(6))\nprint(add_bonus(0))",
    steps: [
      { prompt: "What result is printed for add_bonus(6)?", answer: "10", kind: "number", hint: "The function adds 4 to the argument it receives.", explanation: "points is 6 for that call; the return value is 10." },
      { prompt: "What result is printed for add_bonus(0)?", answer: "4", kind: "number", hint: "Each call starts with its own parameter value.", explanation: "The second call uses points = 0, so it returns 4." },
    ],
  },
  {
    moduleId: "collections",
    title: "Access and count collection data",
    goal: "Find values by key and understand distinct set values.",
    example: 'minutes = {"reading": 20, "practice": 35}\nlabels = {"read", "read", "practice"}\nprint(minutes["practice"])\nprint(len(labels))',
    steps: [
      { prompt: "What value is stored under the practice key?", answer: "35", kind: "number", hint: "A dictionary returns the value associated with the requested key.", explanation: "The dictionary maps practice to 35." },
      { prompt: "How many distinct labels are in the set?", answer: "2", kind: "number", hint: "Sets only retain unique values.", explanation: "The duplicated read entry appears once, leaving two unique labels." },
    ],
  },
  {
    moduleId: "files-exceptions-debugging",
    title: "Inspect structured data and errors",
    goal: "Predict a JSON field lookup and an expected failure.",
    example: 'import json\nrecord = json.loads(\'{"minutes": 25}\')\nprint(record["minutes"])\n# Accessing record["missing"] raises an exception',
    steps: [
      { prompt: "What number does the field lookup print?", answer: "25", kind: "number", hint: "JSON objects become Python dictionaries with named keys.", explanation: "The minutes field holds the integer 25." },
      { prompt: "What exception name does record['missing'] raise?", answer: "KeyError", kind: "text", hint: "A dictionary lookup fails when the requested key does not exist.", explanation: "Directly accessing a missing dictionary key raises KeyError; validate or handle it explicitly." },
    ],
  },
  {
    moduleId: "algorithms-complexity",
    title: "Count operations, then compare growth",
    goal: "Connect input size to simple linear and nested-loop costs.",
    example: "items = [1, 2, 3, 4]\n# A full linear scan visits each item once.\n# Two nested full scans visit each pair.",
    steps: [
      { prompt: "How many visits happen in one full linear scan?", answer: "4", kind: "number", hint: "One pass visits each of the four items.", explanation: "A linear scan touches four items, so there are four visits." },
      { prompt: "How many pair visits happen with two full nested scans?", answer: "16", kind: "number", hint: "For each of four outer items, the inner loop visits four items.", explanation: "There are 4 × 4 = 16 pairs: quadratic growth in this example." },
    ],
  },
  {
    moduleId: "testing-git-quality",
    title: "Evaluate boundary-test expectations",
    goal: "Predict the result of two meaningful test cases.",
    example: "def total_minutes(durations):\n    return sum(durations)\n\nassert total_minutes([20, 35]) == 55\nassert total_minutes([]) == 0",
    steps: [
      { prompt: "What does total_minutes([20, 35]) return?", answer: "55", kind: "number", hint: "Sum the two list entries.", explanation: "20 + 35 = 55, matching the first expectation." },
      { prompt: "What does the empty-list boundary test expect?", answer: "0", kind: "number", hint: "sum([]) uses a zero starting total.", explanation: "The empty input returns 0, so the boundary assertion passes." },
    ],
  },
  {
    moduleId: "personal-study-planner-capstone",
    title: "Validate your planner's core behavior",
    goal: "Rehearse two capstone edge cases without making an official submission.",
    example: 'tasks = [{"title": "Read", "minutes": 20},\n         {"title": "Practice", "minutes": 35}]\nplanned = sum(task["minutes"] for task in tasks)\nprint(planned)\n# A valid empty plan has zero planned minutes.',
    steps: [
      { prompt: "What total is printed for these two tasks?", answer: "55", kind: "number", hint: "Add the minutes of both task records.", explanation: "20 + 35 = 55 minutes of planned study." },
      { prompt: "What total should an empty valid plan report?", answer: "0", kind: "number", hint: "No tasks means no minutes scheduled.", explanation: "A zero total is the defined boundary behavior. The real capstone still needs code, tests and faculty review." },
    ],
  },
];

const byModule = new Map(practiceChallenges.map(challenge => [challenge.moduleId, challenge]));
export function getPracticeChallenge(moduleId: string): PracticeChallenge | null {
  return byModule.get(moduleId) ?? null;
}

export type PracticeFeedback = {
  correct: boolean;
  message: string;
};
export type PracticeEvaluation = {
  correct: number;
  total: number;
  feedback: PracticeFeedback[];
};
export function normalizePracticeAnswer(value: string, kind: PracticeStep["kind"]): string | null {
  if (typeof value !== "string" || value.length > 120) return null;
  const trimmed = value.trim();
  if (kind === "number") {
    if (!/^-?\d+$/.test(trimmed)) return null;
    const number = Number(trimmed);
    return Number.isSafeInteger(number) ? String(number) : null;
  }
  if (!trimmed || !/^[\w -]+$/.test(trimmed)) return null;
  return trimmed.replace(/\s+/g, " ").toLowerCase();
}

export function evaluatePractice(moduleId: string, answers: readonly string[]): PracticeEvaluation {
  const challenge = getPracticeChallenge(moduleId);
  if (!challenge) throw new Error("Practice activity is not available for this module.");
  if (answers.length !== challenge.steps.length)
    throw new Error("Answer both checkpoints to check your practice.");
  const feedback = challenge.steps.map((step, index) => {
    const result = normalizePracticeAnswer(answers[index], step.kind);
    if (result === null) return {
      correct: false,
      message: step.kind === "number"
        ? "Enter a valid whole number, then try again."
        : "Enter a short answer, then try again.",
    };
    const expected = normalizePracticeAnswer(step.answer, step.kind);
    return {
      correct: result === expected,
      message: result === expected ? step.explanation :
        "Not quite. " + step.hint,
    };
  });
  return { correct: feedback.filter(item => item.correct).length, total: feedback.length, feedback };
}

/** Browser-local practice evidence. This never changes server grades. */
export type PracticeAttempt = {
  moduleId: string;
  version: number;
  attempts: number;
  bestCorrect: number;
  lastCorrect: number;
  lastAttemptAt: string;
  completedAt: string | null;
};
export type PracticeRecord = {
  version: number;
  attempts: Record<string, PracticeAttempt>;
};
export const emptyPracticeRecord = (): PracticeRecord => ({ version: PRACTICE_VERSION, attempts: {} });

export function practiceStorageKey(scope: string): string {
  if (scope === "preview") return "khaniversity:practice:v1:preview";
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(scope))
    throw new Error("Authenticated practice requires an account identifier.");
  return "khaniversity:practice:v1:account:" + scope.toLowerCase();
}

export function parsePracticeRecord(raw: string | null): PracticeRecord {
  if (!raw || raw.length > 40000) return emptyPracticeRecord();
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || (value as { version?: unknown }).version !== PRACTICE_VERSION)
      return emptyPracticeRecord();
    const attempts = (value as { attempts?: unknown }).attempts;
    if (!attempts || typeof attempts !== "object" || Array.isArray(attempts))
      return emptyPracticeRecord();
    const clean: PracticeRecord = emptyPracticeRecord();
    for (const [moduleId, item] of Object.entries(attempts)) {
      if (!getPracticeChallenge(moduleId) || !item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      if (row.moduleId !== moduleId || row.version !== PRACTICE_VERSION ||
        !Number.isSafeInteger(row.attempts) || (row.attempts as number) < 1 ||
        (row.attempts as number) > 10000 ||
        !Number.isInteger(row.bestCorrect) || (row.bestCorrect as number) < 0 ||
        (row.bestCorrect as number) > PRACTICE_STEP_COUNT ||
        !Number.isInteger(row.lastCorrect) || (row.lastCorrect as number) < 0 ||
        (row.lastCorrect as number) > PRACTICE_STEP_COUNT ||
        typeof row.lastAttemptAt !== "string" || !Number.isFinite(Date.parse(row.lastAttemptAt)) ||
        (row.completedAt !== null &&
          (typeof row.completedAt !== "string" || !Number.isFinite(Date.parse(row.completedAt))))) continue;
      clean.attempts[moduleId] = {
        moduleId, version: PRACTICE_VERSION,
        attempts: row.attempts as number, bestCorrect: row.bestCorrect as number,
        lastCorrect: row.lastCorrect as number, lastAttemptAt: row.lastAttemptAt,
        completedAt: row.completedAt as string | null,
      };
    }
    return clean;
  } catch {
    return emptyPracticeRecord();
  }
}
export function savePracticeResult(
  record: PracticeRecord,
  moduleId: string,
  correct: number,
  timestamp = new Date().toISOString(),
): PracticeRecord {
  if (!getPracticeChallenge(moduleId)) throw new Error("Unknown practice activity.");
  if (!Number.isInteger(correct) || correct < 0 || correct > PRACTICE_STEP_COUNT)
    throw new Error("Invalid practice result.");
  if (!Number.isFinite(Date.parse(timestamp))) throw new Error("Invalid attempt date.");
  const prior = record.attempts[moduleId];
  return {
    version: PRACTICE_VERSION,
    attempts: {
      ...record.attempts,
      [moduleId]: {
        moduleId, version: PRACTICE_VERSION,
        attempts: Math.min(10000, (prior?.attempts ?? 0) + 1),
        bestCorrect: Math.max(prior?.bestCorrect ?? 0, correct),
        lastCorrect: correct,
        lastAttemptAt: timestamp,
        completedAt: prior?.completedAt ?? (correct === PRACTICE_STEP_COUNT ? timestamp : null),
      },
    },
  };
}
export function practiceSummary(record: PracticeRecord) {
  const values = practiceChallenges.map(challenge => record.attempts[challenge.moduleId]);
  const passed = values.filter(attempt => !!attempt?.completedAt).length;
  const attempted = values.filter(Boolean).length;
  const next = practiceChallenges.find(challenge => !record.attempts[challenge.moduleId]?.completedAt)
    ?? practiceChallenges[practiceChallenges.length - 1];
  const revisit = practiceChallenges.filter(challenge => {
    const attempt = record.attempts[challenge.moduleId];
    return !!attempt && !attempt.completedAt;
  });
  return { attempted, passed, total: practiceChallenges.length, next, revisit };
}
