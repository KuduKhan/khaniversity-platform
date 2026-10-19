// Student code editor persistence is intentionally local-only and is NEVER a
// formal project submission or university assessment record.
export const starterPython = [
  "def total_minutes(durations):",
  "    # Return the total number of minutes",
  "    return sum(durations)",
  "",
].join("\n");

export function codelabDraftKey(preview: boolean, accountId?: string): string {
  if (preview) return "khaniversity:codelab:preview:v1";
  if (!accountId || !/^[0-9a-f-]{36}$/i.test(accountId)) {
    throw new Error("An authenticated account identity is required for private local drafts.");
  }
  return `khaniversity:codelab:account:${accountId}:v1`;
}

export function safeDraft(input: string | null): string | null {
  return input !== null && input.length <= 6000 ? input : null;
}
