import { test, expect } from "@playwright/test";

// Opt-in smoke test: run only with a DEDICATED Supabase test learner and
// matching NEXT_PUBLIC_SUPABASE_* environment in the test server.
// Never put production learner credentials in repository or CI logs.
const email = process.env.KHANIVERSITY_E2E_EMAIL;
const password = process.env.KHANIVERSITY_E2E_PASSWORD;
test.skip(!email || !password, "Dedicated connected learner credentials are not configured.");

test("connected student can enroll, run Python, pass CS101 and resume saved progress", async ({ page }) => {
  await page.goto("/signin");
  await page.getByLabel("Email address").fill(email!);
  await page.getByLabel(/Password/).fill(password!);
  await page.getByRole("button", { name: /Sign in to your academy/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });

  const enroll = page.getByRole("button", { name: /Enroll in CS101/ });
  if (await enroll.count()) {
    await enroll.click();
    await expect(page.getByRole("link", { name: /Continue learning/ })).toBeVisible();
  }

  await page.goto("/learn/cs101/computational-thinking");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Before the code");
  await page.goto("/codelab");
  await expect(page.getByText("Python is ready · runs in your browser"))
    .toBeVisible({ timeout: 60_000 });
  await page.getByRole("button", { name: "Run challenge checks" }).click();
  await expect(page.getByText("All 3 challenge checks passed."))
    .toBeVisible({ timeout: 30_000 });

  await page.goto("/learn/cs101/computational-thinking");
  for (const [i, answer] of [1, 2, 0, 2, 1].entries()) {
    await page.locator(`input[name="question-${i}"][value="${answer}"]`).check();
  }
  await page.getByRole("button", { name: "Check & save progress" }).click();
  await expect(page.locator(".result[role='status']")).toContainText("100%");

  await page.goto("/dashboard");
  await expect(page.locator(".path-module").first()).toContainText("100%");
  await page.reload();
  await expect(page.locator(".path-module").first()).toContainText("100%");
  await page.goto("/learn/cs101/programming-fundamentals");
  await expect(page.getByRole("heading", { level: 1 }))
    .toContainText("Programming fundamentals");

  // Regression: live account grading must use cs101-02, not the route slug.
  for (const [i, answer] of [0, 1, 0, 1, 0].entries())
    await page.locator(`input[name="module-programming-fundamentals-q-${i}"][value="${answer}"]`).check();
  await page.getByRole("button", { name: "Submit knowledge check" }).click();
  await expect(page.locator(".module-check .result[role='status']")).toContainText("100%");
  await page.goto("/dashboard");
  await expect(page.locator(".path-module").nth(1)).toContainText("100%");
  await page.reload();
  await expect(page.locator(".path-module").nth(1)).toContainText("100%");
});


const emailB = process.env.KHANIVERSITY_E2E_EMAIL_2;
const passwordB = process.env.KHANIVERSITY_E2E_PASSWORD_2;

test("two real browser accounts cannot see each other's CS101 project draft", async ({ page, browser }) => {
  test.skip(!emailB || !passwordB, "Second designated Supabase Auth test learner is not configured");
  await page.goto("/signin");
  await page.getByLabel("Email address").fill(email!);
  await page.getByLabel(/Password/).fill(password!);
  await page.getByRole("button", { name: /Sign in to your academy/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
  const enrollA = page.getByRole("button", { name: /Enroll in CS101/ });
  if (await enrollA.count()) await enrollA.click();
  await page.goto("/learn/cs101/personal-study-planner-capstone");
  const privateName = "CS101 learner A private draft";
  await page.getByRole("textbox", { name: "Project name" }).fill(privateName);
  await page.getByRole("button", { name: "Save project draft" }).click();
  await expect(page.getByRole("status")).toContainText("Private project draft saved");

  const contextB = await browser.newContext();
  try {
    const other = await contextB.newPage();
    await other.goto("/signin");
    await other.getByLabel("Email address").fill(emailB!);
    await other.getByLabel(/Password/).fill(passwordB!);
    await other.getByRole("button", { name: /Sign in to your academy/ }).click();
    await expect(other).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
    const enrollB = other.getByRole("button", { name: /Enroll in CS101/ });
    if (await enrollB.count()) await enrollB.click();
    await other.goto("/learn/cs101/personal-study-planner-capstone");
    await expect(other.getByRole("heading", { level: 1 })).toContainText("Capstone");
    await expect(other.getByRole("textbox", { name: "Project name" })).not.toHaveValue(privateName);
  } finally {
    await contextB.close();
  }
});
