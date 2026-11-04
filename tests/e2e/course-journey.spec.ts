import { expect, test } from "@playwright/test";

test("CS101 learner hub connects discovery, syllabus, practice, mastery and evidence", async ({ page }) => {
  await page.goto("/preview/learn/cs101");
  await expect(page.getByRole("heading", { name: "Introduction to Computer Science & Python" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "From discovery to verified learning evidence" })).toBeVisible();
  for (const label of [
    "Discover a course", "Understand the syllabus", "Learn", "Practice",
    "Demonstrate mastery", "Complete the capstone", "Review academic evidence",
  ]) {
    await expect(page.locator("ol").first().getByRole("link", { name: new RegExp(label) })).toHaveCount(1);
  }
  await expect(page.getByRole("heading", { name: "Four learning stages, one connected project" })).toBeVisible();
  for (const stage of [
    "Computing Foundations", "Programming & Problem Solving",
    "Software Engineering Essentials", "Applied Capstone",
  ]) {
    await expect(page.getByRole("heading", { name: stage, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("progressbar", { name: "CS101 module mastery" })).toHaveAttribute("aria-valuenow", "0");
  await expect(page.getByText("This progress is stored only on this device", { exact: false })).toBeVisible();
  await page.getByRole("link", { name: /Module 02: Programming fundamentals/ }).click();
  await expect(page.getByRole("heading", { name: "Programming fundamentals & Python" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Module activities" }).getByRole("link", { name: "Guided practice" })).toHaveAttribute("href", "#practice-studio-programming-fundamentals");
  await page.getByRole("link", { name: "Back to your syllabus" }).click();
  await expect(page).toHaveURL(/\/preview\/learn\/cs101$/);
});

test("course overview remains contained and keyboard-accessible on phones and desktops", async ({ page }) => {
  test.setTimeout(90_000);
  for (const width of [320, 375, 430, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 860 });
    await page.goto("/preview/learn/cs101");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2),
      `CS101 course hub overflow at ${width}px`,
    ).toBe(true);
  }
  await page.setViewportSize({ width: 320, height: 860 });
  const button = page.getByRole("button", { name: "Open navigation menu" });
  await expect(button).toBeVisible();
  await button.click();
  await expect(page.getByRole("navigation", { name: "Student navigation" }).getByRole("link", { name: "My Learning" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(button).toBeFocused();
});
