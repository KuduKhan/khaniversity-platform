import { questions } from "@/modules/academics/catalog";
export function grade(answers: unknown) {
  if (
    !Array.isArray(answers) ||
    answers.length !== questions.length ||
    answers.some((v) => !Number.isInteger(v) || v < 0 || v > 2)
  )
    throw new Error("Answer all five questions before submitting.");
  const score = Math.round(
    (questions.filter((q, i) => q.answer === answers[i]).length /
      questions.length) *
      100,
  );
  return { score, passed: score >= 80 };
}
