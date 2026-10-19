import { modules } from "./catalog";

export type ModuleCheck = {
  prompt: string;
  options: [string, string, string];
  answer: number;
  explanation: string;
};
export type ModuleLesson = {
  id: string;
  title: string;
  description: string;
  outcome: string;
  sections: { heading: string; body: string; example?: string }[];
  checks: ModuleCheck[];
  project?: boolean;
};

const lessons: Omit<ModuleLesson, "title" | "description">[] = [
  {
    id: "computational-thinking",
    outcome: "Describe a computing problem as inputs, processing and outputs; decompose it into testable steps.",
    sections: [
      { heading: "A computer needs a clear plan", body: "Computational thinking turns an unclear problem into a solution you can explain, test and repeat. Start by identifying the information available, the transformation required and the result expected.", example: "INPUT: task durations [20, 35, 15]\nPROCESS: add each duration to a total starting at 0\nOUTPUT: 70 minutes" },
      { heading: "Decompose, then test an edge case", body: "Split a larger job into smaller jobs: collect tasks, validate each duration, calculate the total and present the result. Then ask what happens for an empty list, invalid value or unusually large input. Explicit assumptions make an algorithm useful." },
    ],
    checks: [
      { prompt: "Which description best defines an algorithm?", options: ["A programming language", "A precise finite sequence of steps", "The physical parts of a computer"], answer: 1, explanation: "An algorithm is a finite, unambiguous sequence of steps, independent of a specific language." },
      { prompt: "A planner adds task durations. What is its output?", options: ["The original durations", "The addition operation", "The total study time"], answer: 2, explanation: "The durations are inputs, addition is processing and the total is output." },
      { prompt: "What does decomposition do?", options: ["Splits a problem into manageable parts", "Removes the need for testing", "Chooses a faster computer"], answer: 0, explanation: "Smaller parts are easier to understand, implement and test." },
      { prompt: "Which instruction is least ambiguous?", options: ["Study for a while", "Repeat until it feels right", "Add each duration to a total starting at zero"], answer: 2, explanation: "A defined starting state and operation make a process repeatable." },
      { prompt: "Why test the empty-list case?", options: ["Empty inputs are always invalid", "It checks an edge case", "It changes the programming language"], answer: 1, explanation: "An empty input checks whether the algorithm handles a boundary condition sensibly." },
    ],
  },
  {
    id: "programming-fundamentals",
    outcome: "Run a Python program, recognize statements and expressions, and explain how execution proceeds.",
    sections: [
      { heading: "Programs are instructions for a runtime", body: "Python reads statements in order. An expression produces a value; a statement performs an action such as assigning a value or displaying text. A syntax error means the instructions cannot be parsed, while a runtime error occurs during execution.", example: "name = \"Amina\"\nprint(\"Welcome,\", name)" },
      { heading: "Make a small change and observe", body: "Start with a working example, change one thing, run it again and compare the output. This loop builds a reliable mental model: edit, execute, inspect and refine. Keep error messages nearby; the final line often points to the failing operation." },
    ],
    checks: [
      { prompt: "What does print(value) do?", options: ["Displays a value", "Creates a new variable", "Repeats a statement"], answer: 0, explanation: "print writes a human-readable representation to the output stream." },
      { prompt: "What is an expression?", options: ["A comment", "Code that evaluates to a value", "A saved file"], answer: 1, explanation: "Expressions such as 2 + 3 evaluate to a value." },
      { prompt: "A syntax error usually means…", options: ["Python cannot parse the instructions", "The computer is offline", "The answer is mathematically wrong"], answer: 0, explanation: "Syntax errors prevent the parser from understanding the code structure." },
      { prompt: "What is a useful first debugging step?", options: ["Delete the whole program", "Read the error and locate the reported operation", "Change several lines at once"], answer: 1, explanation: "A focused inspection preserves evidence and narrows the cause." },
      { prompt: "Why run a program after a small edit?", options: ["To verify the change's effect", "To make comments execute", "To avoid understanding the code"], answer: 0, explanation: "Running after a focused change connects cause to observed behavior." },
    ],
  },
  {
    id: "variables-data-input-output",
    outcome: "Choose appropriate data types, validate user input and transform values without losing meaning.",
    sections: [
      { heading: "Values have types", body: "An integer represents a whole number, a float a decimal number, a string text, and a Boolean a true-or-false value. Input entered by a person arrives as text, so convert it deliberately and handle values that cannot be converted.", example: "raw_minutes = input(\"Minutes: \")\nminutes = int(raw_minutes)\nprint(minutes * 60, \"seconds\")" },
      { heading: "Validate before using", body: "A useful program defines acceptable ranges and gives a clear response when input falls outside them. For a duration, decide whether zero is allowed, reject negative numbers and avoid silently treating malformed text as a valid value." },
    ],
    checks: [
      { prompt: "What type does input() return?", options: ["Integer", "String", "Boolean"], answer: 1, explanation: "input returns text; convert it before arithmetic." },
      { prompt: "Which type is appropriate for yes/no state?", options: ["Boolean", "List", "Float"], answer: 0, explanation: "A Boolean represents True or False." },
      { prompt: "Why convert a numeric string before adding?", options: ["To make arithmetic numeric", "To hide the value", "To change the keyboard"], answer: 0, explanation: "Without conversion, plus may concatenate strings instead of adding numbers." },
      { prompt: "What should a robust program do with malformed input?", options: ["Crash without explanation", "Validate and provide a useful correction", "Assume the value is zero"], answer: 1, explanation: "Validation keeps invalid data from silently corrupting later calculations." },
      { prompt: "Which is a decimal number type in Python?", options: ["float", "dict", "str"], answer: 0, explanation: "float represents fractional numeric values." },
    ],
  },
  {
    id: "conditions-loops",
    outcome: "Use conditions and loops to express decisions and repetition with clear stop conditions.",
    sections: [
      { heading: "Choose a path", body: "An if statement runs a block when a condition is true. elif checks another condition and else handles the remaining case. Comparisons produce Boolean values; combine them carefully and make boundary rules explicit.", example: "if minutes < 0:\n    print(\"Duration cannot be negative\")\nelif minutes == 0:\n    print(\"No time scheduled\")\nelse:\n    print(\"Task recorded\")" },
      { heading: "Repeat with a reason", body: "A for loop visits each item in a sequence. A while loop continues while a condition remains true. Every while loop needs a progress rule that eventually makes the condition false; otherwise it can run forever." },
    ],
    checks: [
      { prompt: "When does an if block run?", options: ["When its condition is true", "At random", "Only after a loop"], answer: 0, explanation: "The condition controls whether the block executes." },
      { prompt: "What is a common use for a for loop?", options: ["Visit each item in a sequence", "Define a data type", "Catch every syntax error"], answer: 0, explanation: "A for loop iterates over an iterable's items." },
      { prompt: "What prevents a while loop from running forever?", options: ["A progress rule that changes its condition", "A comment", "A print statement"], answer: 0, explanation: "The loop needs a path to a false condition or an explicit break." },
      { prompt: "What does else in an if/elif/else chain represent?", options: ["The remaining case", "A repeated case", "A function return"], answer: 0, explanation: "else handles the case when earlier conditions do not match." },
      { prompt: "What does 4 < 2 evaluate to?", options: ["True", "False", "4"], answer: 1, explanation: "The comparison is false because four is not less than two." },
    ],
  },
  {
    id: "functions-scope",
    outcome: "Write reusable functions with parameters, return values and a clear responsibility.",
    sections: [
      { heading: "Give a task a name", body: "A function packages a focused operation. Parameters describe the inputs; return sends a result back to the caller. Prefer a returned value for computation and keep display or file access at the boundary of the program.", example: "def total_minutes(durations):\n    return sum(durations)\n\nplanned = total_minutes([20, 35, 15])" },
      { heading: "Keep scope understandable", body: "A local variable exists inside the function where it is assigned. Passing data in and returning results out makes dependencies visible and makes functions easier to test than code that relies on hidden global state." },
    ],
    checks: [
      { prompt: "What does return do?", options: ["Sends a result to the caller", "Prints automatically", "Repeats the function"], answer: 0, explanation: "return ends the function call and provides its result." },
      { prompt: "Why use a parameter?", options: ["To provide input to a function", "To change Python versions", "To create a comment"], answer: 0, explanation: "Parameters make a function reusable with different inputs." },
      { prompt: "Where is a local variable normally available?", options: ["Inside its function scope", "Every computer on the network", "Only in a database"], answer: 0, explanation: "Local names are bound within the function call's scope." },
      { prompt: "What is a useful function design?", options: ["One focused responsibility", "Every task in one giant function", "Hidden inputs from global state"], answer: 0, explanation: "Focused functions are easier to understand, test and reuse." },
      { prompt: "How can a pure calculation be tested easily?", options: ["Give inputs and compare the returned result", "Read its color", "Run it without inputs"], answer: 0, explanation: "A function with explicit input and output is straightforward to test." },
    ],
  },
  {
    id: "collections",
    outcome: "Select lists, tuples, dictionaries and sets to match common data-access needs.",
    sections: [
      { heading: "Choose a collection for the job", body: "A list keeps an ordered, changeable sequence. A tuple is ordered and fixed. A dictionary maps unique keys to values. A set stores distinct values and supports membership and set operations.", example: "tasks = [\"read\", \"practice\"]\nminutes = {\"read\": 20, \"practice\": 35}\nlabels = {\"urgent\", \"review\"}" },
      { heading: "Model records clearly", body: "A dictionary can represent a task with named fields such as title, priority and duration. A list can then hold many records. Validate a key before looking it up and use a default only when the product rule makes that behavior clear." },
    ],
    checks: [
      { prompt: "Which collection maps a task name to its duration?", options: ["Dictionary", "Set", "Tuple only"], answer: 0, explanation: "Dictionaries map keys to values." },
      { prompt: "Which collection removes duplicates by design?", options: ["Set", "List", "String"], answer: 0, explanation: "A set stores unique elements." },
      { prompt: "Which collection is ordered and mutable?", options: ["List", "Set", "Boolean"], answer: 0, explanation: "Lists preserve order and support item updates." },
      { prompt: "Why use named dictionary keys?", options: ["They make record fields explicit", "They sort every record automatically", "They prevent all errors"], answer: 0, explanation: "Keys make the meaning of each stored value visible." },
      { prompt: "What should happen for a missing key?", options: ["Follow a defined validation/default rule", "Silently use any value", "Delete the dictionary"], answer: 0, explanation: "Missing data behavior is a product decision and should be explicit." },
    ],
  },
  {
    id: "files-exceptions-debugging",
    outcome: "Read and write structured files safely and handle expected failures with useful messages.",
    sections: [
      { heading: "Persist data deliberately", body: "Files let a program retain information between runs. Use a context manager so files close reliably. Choose a documented format such as JSON for structured records and validate the data after loading it.", example: "import json\nwith open(\"tasks.json\", encoding=\"utf-8\") as file:\n    tasks = json.load(file)" },
      { heading: "Handle expected errors", body: "A file may be missing, unreadable or malformed. Catch a specific expected exception, explain what the user can do and preserve the original error for debugging. Avoid a broad except that hides programming defects." },
    ],
    checks: [
      { prompt: "Why use with open(...) as file?", options: ["It closes the file reliably", "It encrypts the file", "It skips validation"], answer: 0, explanation: "The context manager handles resource cleanup when the block exits." },
      { prompt: "What does JSON represent well?", options: ["Structured records", "Only pictures", "A running loop"], answer: 0, explanation: "JSON encodes common structured values such as objects and arrays." },
      { prompt: "Why catch a specific exception?", options: ["To handle a known failure without hiding unrelated bugs", "To ignore all errors", "To make code shorter"], answer: 0, explanation: "Specific handling preserves visibility of unexpected defects." },
      { prompt: "What should a file-loading feature validate?", options: ["That loaded data has the expected shape", "Only the file color", "The user's screen size"], answer: 0, explanation: "Persisted data can be missing, corrupt or from an older version." },
      { prompt: "What is useful debugging evidence?", options: ["The exception type and failing operation", "A guess without reproduction", "Deleting the input file"], answer: 0, explanation: "Concrete error details help isolate and reproduce the fault." },
    ],
  },
  {
    id: "algorithms-complexity",
    outcome: "Compare a straightforward search and explain how work grows as input size increases.",
    sections: [
      { heading: "Reason about growth", body: "An algorithm's complexity describes how resource use changes as input grows. A linear scan may inspect each of n items once, so work grows roughly with n. Nested full scans can grow much faster, around n squared.", example: "# Linear search: inspect at most each item once\nfor task in tasks:\n    if task[\"priority\"] == target:\n        return task" },
      { heading: "Measure the right thing", body: "Big-O is a useful comparison, not a stopwatch prediction. Constant factors, memory, input distribution and the actual workload matter. First make the solution correct and measurable; optimize a demonstrated bottleneck." },
    ],
    checks: [
      { prompt: "A scan checks each item once. Its growth is commonly…", options: ["Linear O(n)", "Constant O(1) for all sizes", "Exponential O(2ⁿ)"], answer: 0, explanation: "The number of checks grows proportionally with the item count." },
      { prompt: "What does Big-O help describe?", options: ["How resource use grows with input size", "The exact runtime on every device", "The code's author"], answer: 0, explanation: "Big-O abstracts asymptotic growth." },
      { prompt: "Why avoid premature optimization?", options: ["Measure first to target real bottlenecks", "Correctness never matters", "Fast code needs no tests"], answer: 0, explanation: "Measurement helps focus effort on actual performance constraints." },
      { prompt: "Two nested full scans may do work near…", options: ["O(n²)", "O(1)", "O(log n) always"], answer: 0, explanation: "Each outer item may trigger a scan of all inner items." },
      { prompt: "Does Big-O include every real-world performance factor?", options: ["No, it abstracts growth and omits constants", "Yes, exact latency is guaranteed", "Only for Python"], answer: 0, explanation: "Big-O is a model of growth, not a complete benchmark." },
    ],
  },
  {
    id: "testing-git-quality",
    outcome: "Write behavior-focused tests and use version control to make changes reviewable.",
    sections: [
      { heading: "Make expectations executable", body: "A test gives a known input and checks the behavior that matters. Include typical, boundary and invalid cases. A small test suite catches regressions and records assumptions that prose alone can leave ambiguous.", example: "assert total_minutes([20, 35, 15]) == 70\nassert total_minutes([]) == 0" },
      { heading: "Track changes with Git", body: "Git records snapshots so you can inspect, compare and restore work. Make focused commits with clear messages. Review a diff before sharing it and keep secrets and generated learner data out of source control." },
    ],
    checks: [
      { prompt: "What should a test assert?", options: ["Expected behavior for a defined input", "The author's preferred editor", "That no one changes the code"], answer: 0, explanation: "Tests encode observable behavior." },
      { prompt: "Why include an empty-input test?", options: ["To check a boundary case", "To remove the feature", "To skip normal cases"], answer: 0, explanation: "Boundary tests exercise conditions that typical examples may miss." },
      { prompt: "What does a Git commit represent?", options: ["A recorded change snapshot", "A deployed server", "A password"], answer: 0, explanation: "Commits form a history of repository changes." },
      { prompt: "Why review a diff before sharing?", options: ["To inspect the exact change", "To hide the change", "To erase test results"], answer: 0, explanation: "A diff makes unintended edits and secrets easier to notice." },
      { prompt: "Which commit is easiest to review?", options: ["A focused, clearly described change", "A thousand unrelated edits", "An empty message"], answer: 0, explanation: "Small coherent changes improve review and recovery." },
    ],
  },
  {
    id: "personal-study-planner-capstone",
    outcome: "Design, implement, test and explain a data-driven study planner with validation and persistence.",
    project: true,
    sections: [
      { heading: "Build for a real learner", body: "Create a program that records study tasks, assigns priorities, persists progress and generates useful summaries. Begin with a short design: users, task fields, rules, supported commands and error cases.", example: "Task: {title, minutes, priority, done}\nRequired: add task, list tasks, mark complete, summarize time" },
      { heading: "Demonstrate quality, not just features", body: "Your evidence should include a working program, representative tests, clear input validation, a data model, readable functions and a short explanation of a design decision. The rubric rewards correctness and reasoning; it does not reward hidden or unreviewed AI output." },
      { heading: "Review the capstone rubric", body: "Feature completeness (25%), input handling (15%), data organization (15%), test coverage (20%), code readability (15%) and explanation of decisions (10%). Keep a draft, run the tests and revise after reading the feedback." },
    ],
    checks: [
      { prompt: "Which is a required capstone behavior?", options: ["Persist tasks and generate summaries", "Hide all validation", "Depend on a single hard-coded task"], answer: 0, explanation: "The project is expected to record tasks and generate useful summaries." },
      { prompt: "What should happen to invalid duration input?", options: ["Be rejected with a useful explanation", "Silently become zero", "Change the task title"], answer: 0, explanation: "Clear validation protects the integrity of stored data." },
      { prompt: "Why include tests in the project?", options: ["To demonstrate expected behavior and catch regressions", "To replace the program", "To avoid explaining decisions"], answer: 0, explanation: "Tests show behavior across ordinary and boundary inputs." },
      { prompt: "What does a project explanation demonstrate?", options: ["Your reasoning about design choices", "That code has no trade-offs", "A guaranteed professional qualification"], answer: 0, explanation: "An explanation makes design reasoning visible for review." },
      { prompt: "Who determines formal course completion?", options: ["Published deterministic requirements and reviewed project evidence", "A tutor chat message alone", "A local export file"], answer: 0, explanation: "Completion must be based on explicit course rules and reviewed evidence." },
    ],
  },
];

export const courseModules: ModuleLesson[] = lessons.map((lesson, index) => ({
  ...lesson,
  title: modules[index][0],
  description: modules[index][1],
}));

export const getCourseModule = (id: string) =>
  courseModules.find((module) => module.id === id);
