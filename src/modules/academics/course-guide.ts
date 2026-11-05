import { courseOutline as courseModules } from "./course-outline";

/**
 * CS101 publication metadata. Titles, ids, order and teaching outcomes stay in
 * curriculum.ts; this guide only adds learning-stage and orientation context.
 * Timings are planning estimates, not a completion or grading requirement.
 */
export const moduleGuide: Record<string, {
  studyMinutes: number;
  practiceFocus: string;
  capstoneConnection: string;
}> = {
  "computational-thinking": {
    studyMinutes: 25,
    practiceFocus: "Trace inputs, processing, outputs and an empty-task edge case.",
    capstoneConnection: "Describe the planner's data inputs, required operations and output before coding.",
  },
  "programming-fundamentals": {
    studyMinutes: 40,
    practiceFocus: "Predict the output of sequential assignments and explain an error.",
    capstoneConnection: "Run a first planner prototype and inspect the console output.",
  },
  "variables-data-input-output": {
    studyMinutes: 45,
    practiceFocus: "Convert a duration entered as text and reject invalid values.",
    capstoneConnection: "Represent a task's name, priority and duration with appropriate types.",
  },
  "conditions-loops": {
    studyMinutes: 50,
    practiceFocus: "Trace a loop and a conditional branch, including an empty list.",
    capstoneConnection: "Repeat over tasks and select the records that satisfy a condition.",
  },
  "functions-scope": {
    studyMinutes: 45,
    practiceFocus: "Trace parameter passing, returned values and local variables.",
    capstoneConnection: "Separate adding tasks, validating durations and calculating totals into functions.",
  },
  "collections": {
    studyMinutes: 45,
    practiceFocus: "Choose a list and dictionary structure and access a named task field.",
    capstoneConnection: "Store multiple task records in a predictable, reusable data model.",
  },
  "files-exceptions-debugging": {
    studyMinutes: 55,
    practiceFocus: "Read JSON data, handle a missing key and explain a useful error.",
    capstoneConnection: "Save and restore planner tasks while handling damaged or missing files.",
  },
  "algorithms-complexity": {
    studyMinutes: 45,
    practiceFocus: "Compare linear and nested-loop work as the task list grows.",
    capstoneConnection: "Choose a simple, explainable approach to searching and summarizing tasks.",
  },
  "testing-git-quality": {
    studyMinutes: 55,
    practiceFocus: "Write assertions for ordinary and boundary-case planner inputs.",
    capstoneConnection: "Document how tests and incremental version-control commits verify the project.",
  },
  "personal-study-planner-capstone": {
    studyMinutes: 120,
    practiceFocus: "Validate planner behavior with meaningful input, persistence and edge-case tests.",
    capstoneConnection: "Integrate, test and explain the complete Personal Study Planner for review.",
  },
};

export const courseStages = [
  {
    id: "foundations",
    label: "Stage 01",
    title: "Computing Foundations",
    summary: "Learn to frame computing problems and work with Python values.",
    outcome: "Explain input, processing and output, then run small Python programs.",
    modules: courseModules.slice(0, 3),
  },
  {
    id: "programming",
    label: "Stage 02",
    title: "Programming & Problem Solving",
    summary: "Control program flow and organize data and reusable logic.",
    outcome: "Build understandable Python logic using loops, functions and collections.",
    modules: courseModules.slice(3, 6),
  },
  {
    id: "engineering",
    label: "Stage 03",
    title: "Software Engineering Essentials",
    summary: "Handle failures, reason about efficiency and verify behavior.",
    outcome: "Work with files, debug faults and explain test and version-control decisions.",
    modules: courseModules.slice(6, 9),
  },
  {
    id: "capstone",
    label: "Stage 04",
    title: "Applied Capstone",
    summary: "Apply the entire pathway to one practical software project.",
    outcome: "Deliver a tested Personal Study Planner and explain your design choices.",
    modules: courseModules.slice(9),
  },
] as const;

export function getModuleGuide(moduleId: string) {
  const index = courseModules.findIndex((module) => module.id === moduleId);
  if (index < 0) return null;
  const currentLesson = courseModules[index];
  const stage = courseStages.find((entry) => entry.modules.some((item) => item.id === moduleId));
  const guide = moduleGuide[moduleId];
  if (!stage || !guide) return null;
  return {
    ...guide,
    module: currentLesson,
    index,
    stage,
    prerequisite: index > 0 ? courseModules[index - 1] : null,
    next: courseModules[index + 1] ?? null,
  };
}

export const estimatedCourseMinutes = courseModules.reduce(
  (sum, module) => sum + (moduleGuide[module.id]?.studyMinutes ?? 0),
  0,
);
