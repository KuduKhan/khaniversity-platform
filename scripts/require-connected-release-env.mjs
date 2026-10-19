// Never log actual secrets. This script fails closed rather than treating a
// skipped connected test as release approval.
const expected = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "KHANIVERSITY_E2E_EMAIL",
  "KHANIVERSITY_E2E_PASSWORD",
  "KHANIVERSITY_E2E_EMAIL_2",
  "KHANIVERSITY_E2E_PASSWORD_2",
  "KHANIVERSITY_EXPECTED_PROJECT_REF",
];
const missing = expected.filter((key) => !process.env[key]?.trim());
if (missing.length) {
  console.error("Connected release gate BLOCKED. Missing environment variables: " + missing.join(", "));
  process.exit(1);
}
const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
const ref = process.env.KHANIVERSITY_EXPECTED_PROJECT_REF;
if (url.protocol !== "https:" || url.hostname !== `${ref}.supabase.co`) {
  console.error("Connected release gate BLOCKED: Supabase URL does not match the explicitly authorized test project.");
  process.exit(1);
}
if (process.env.KHANIVERSITY_E2E_EMAIL.toLowerCase() === process.env.KHANIVERSITY_E2E_EMAIL_2.toLowerCase()) {
  console.error("Connected release gate BLOCKED: the two test accounts must differ.");
  process.exit(1);
}
if (process.env.KHANIVERSITY_E2E_PASSWORD.length < 12 || process.env.KHANIVERSITY_E2E_PASSWORD_2.length < 12) {
  console.error("Connected release gate BLOCKED: test passwords must meet app requirements.");
  process.exit(1);
}
console.info("Connected release prerequisites configured for two distinct learner accounts.");
