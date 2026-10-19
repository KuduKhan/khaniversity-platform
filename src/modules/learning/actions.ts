"use server";
import { revalidatePath } from "next/cache";
import { requireStudent } from "@/lib/database/server";
import { diagnosticQuestions, type DiagnosticResult } from "@/modules/academics/diagnostic";
export async function saveLearningDiagnostic(answers: number[]) {
  if (!Array.isArray(answers) || answers.length !== diagnosticQuestions.length ||
      answers.some(x => !Number.isInteger(x) || x < 0 || x > 2))
    return { error: "Answer all six questions to build your learning path." };
  const {db}=await requireStudent();
  const {data,error}=await db.rpc("submit_learning_diagnostic",{p_answers:answers});
  if (error || !data) return {error:"Your learning path was not saved. Enroll in CS101 and retry."};
  revalidatePath("/path");
  revalidatePath("/dashboard");
  return {result:data as DiagnosticResult};
}
