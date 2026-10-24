import { test, expect } from "@playwright/test";

test("guided practice offers hints, scores a trace and persists separately from grading", async ({ page }) => {
  await page.goto("/preview/learn/cs101/computational-thinking");
  await page.getByRole("button", { name: "Start the lesson" }).click();
  const studio = page.locator("#practice-studio-computational-thinking");
  await expect(studio.getByRole("heading", { name: "Trace an algorithm before writing code" })).toBeVisible();
  await studio.getByText("Need a hint?").first().click();
  await expect(studio.getByText(/Start with 0. Add 20/)).toBeVisible();
  const inputs = studio.getByRole("textbox", { name: "Your answer" });
  await inputs.nth(0).fill("99");
  await inputs.nth(1).fill("5");
  await studio.getByRole("button", { name: "Check my reasoning" }).click();
  await expect(studio.getByRole("status")).toContainText("0 of 2 checkpoints correct");
  await expect(studio.getByText(/Not quite|Keep working/).first()).toBeVisible();
  await studio.getByRole("button", { name: "Try again" }).click();
  await inputs.nth(0).fill("70");
  await inputs.nth(1).fill("0");
  await studio.getByRole("button", { name: "Check my reasoning" }).click();
  await expect(studio.getByRole("status")).toContainText("2 of 2 checkpoints correct");
  await expect(studio.getByText(/Local history: 2 attempts/)).toBeVisible();
  await page.reload();
  await expect(studio.getByText(/Local history: 2 attempts/)).toBeVisible();
  await page.goto("/preview/dashboard");
  await expect(page.getByRole("heading", { name: "Turn reading into reasoning." })).toBeVisible();
  const tracker = page.getByRole("region", { name: "Turn reading into reasoning." });
  await expect(tracker).toContainText("1 / 10 practiced");
  await expect(tracker).toContainText("Programming fundamentals");
});

test("mobile guided practice stays in viewport and does not create an official course grade", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto("/preview/learn/cs101/collections");
  const studio = page.locator("#practice-studio-collections");
  const inputs = studio.getByRole("textbox", { name: "Your answer" });
  await inputs.nth(0).fill("35");
  await inputs.nth(1).fill("2");
  await studio.getByRole("button", { name: "Check my reasoning" }).click();
  await expect(studio.getByRole("status")).toContainText("2 of 2 checkpoints correct");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2)).toBe(true);
  await page.goto("/preview/dashboard");
  const tracker = page.getByRole("region", { name: "Turn reading into reasoning." });
  await expect(tracker).toContainText("1 / 10 practiced");
  await expect(page.getByText("0 / 10 modules mastered")).toBeVisible();
});

test("practice storage belongs to preview only and does not grant protected student access", async ({ page }) => {
  await page.goto("/preview/learn/cs101/collections");
  const studio = page.locator("#practice-studio-collections");
  const fields = studio.getByRole("textbox", { name: "Your answer" });
  await fields.nth(0).fill("35");
  await fields.nth(1).fill("2");
  await studio.getByRole("button", { name: "Check my reasoning" }).click();
  const stored = await page.evaluate(() => localStorage.getItem("khaniversity:practice:v1:preview"));
  expect(stored).toContain("collections");
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/signin$/);
  await page.goto("/learn/cs101/collections");
  await expect(page).toHaveURL(/\/signin$/);
});
