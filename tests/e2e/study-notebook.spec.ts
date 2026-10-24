import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("CS101 notebook saves reflections and creates a meaningful revision queue", async ({ page }) => {
  await page.goto("/preview/learn/cs101/computational-thinking");
  await page.getByRole("button", { name: "Start the lesson" }).click();
  const reflection = page.getByRole("textbox", { name: /Your reflection/ });
  await reflection.fill("Decomposition turns the task into smaller steps. I need to revisit edge cases.");
  await page.getByRole("button", { name: "Save reflection" }).click();
  await expect(page.getByRole("status", { name: "" }).filter({hasText:"Reflection saved on this device."})).toBeVisible();
  await page.reload();
  await expect(reflection).toHaveValue(/Decomposition turns the task/);

  await page.goto("/preview/dashboard");
  await expect(page.getByRole("heading", { name: "Your revision desk." })).toBeVisible();
  await expect(page.getByText("1 lesson reflections · 1 ready for review")).toBeVisible();
  await page.getByRole("link", { name: "Review", exact: true }).click();
  await expect(page).toHaveURL(/computational-thinking/);
  await page.getByRole("button", { name: "Mark as reviewed" }).click();

  await page.goto("/preview/dashboard");
  await expect(page.getByText("1 lesson reflections · 0 ready for review")).toBeVisible();
  const exportPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const download = await exportPromise;
  expect(download.suggestedFilename()).toBe("khaniversity-study-notes.json");
  const content = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(content.source).toBe("browser-local-ungraded");
  expect(content.notes).toHaveLength(1);
  expect(content.notes[0].moduleId).toBe("computational-thinking");
});

test("lesson notes clear with confirmation and remain readable on a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/preview/learn/cs101/programming-fundamentals");
  const note = page.getByRole("textbox", { name: /Your reflection/ });
  await note.fill("Python executes statements in sequence.");
  await page.getByRole("button", { name: "Save reflection" }).click();
  const notebook = page.getByRole("region", { name: /Make this lesson yours/ });
  await expect(notebook.getByText("Saved study reflection")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await notebook.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(notebook.getByText("Clear this saved note?")).toBeVisible();
  await notebook.getByRole("button", { name: "Cancel" }).click();
  await expect(notebook.getByText("Saved study reflection")).toBeVisible();
  await notebook.getByRole("button", { name: "Clear", exact: true }).click();
  await notebook.getByRole("button", { name: "Yes, clear" }).click();
  await page.reload();
  await expect(page.getByRole("textbox", { name: /Your reflection/ })).toHaveValue("");
});
