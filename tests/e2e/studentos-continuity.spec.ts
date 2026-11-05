import { expect, test } from "@playwright/test";

const previewKey = "khaniversity:foundation:0.2";

test("StudentOS resumes the earliest incomplete lesson and explains module states", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto("/preview/dashboard");
  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify({
      enrolled: true,
      completed: true,
      score: 100,
      moduleProgress: {
        "programming-fundamentals": {
          score: 65,
          completedAt: "2026-11-03T10:00:00.000Z",
        },
      },
    }));
  }, previewKey);
  await page.reload();

  const shortcut = page.getByRole("navigation", { name: "Learning workspace shortcuts" })
    .getByRole("link", { name: /My Learning/ });
  await expect(shortcut).toHaveAttribute("href", "/preview/learn/cs101");
  await shortcut.click();
  await expect(page).toHaveURL(/\/preview\/learn\/cs101$/);
  await expect(page.getByRole("link", { name: "Continue my next module" })).toHaveAttribute("href", "/preview/learn/cs101/programming-fundamentals");
  await page.goto("/preview/dashboard");
  await expect(shortcut).toContainText("CS101 syllabus");
  await expect(page.getByRole("progressbar", { name: "CS101 course pathway progress" }))
    .toHaveAttribute("aria-valuenow", "1");

  const first = page.locator(".path-module").filter({ hasText: "Computational thinking" });
  const second = page.locator(".path-module").filter({ hasText: "Programming fundamentals" });
  const third = page.locator(".path-module").filter({ hasText: "Variables, data" });
  await expect(first).toContainText("Mastered · 100%");
  await expect(second).toContainText("Needs review · 65%");
  await expect(third).toContainText("Not started");
  await expect(second.getByRole("link", { name: /Retry .* lesson/ }))
    .toHaveAttribute("href", "/preview/learn/cs101/programming-fundamentals");
  expect(await page.evaluate(() =>
    document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2
  )).toBe(true);
});

test("StudentOS continuation advances only after a mastery threshold is met", async ({ page }) => {
  await page.goto("/preview/dashboard");
  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify({
      enrolled: true,
      completed: true,
      score: 100,
      moduleProgress: {
        "programming-fundamentals": {
          score: 85,
          completedAt: "2026-11-03T10:00:00.000Z",
        },
      },
    }));
  }, previewKey);
  await page.reload();
  await expect(page.getByRole("navigation", { name: "Learning workspace shortcuts" })
    .getByRole("link", { name: /My Learning/ }))
    .toHaveAttribute("href", "/preview/learn/cs101");
  await page.goto("/preview/learn/cs101");
  await expect(page.getByRole("link", { name: "Continue my next module" })).toHaveAttribute("href", "/preview/learn/cs101/variables-data-input-output");
  await expect(page.getByRole("progressbar", { name: "CS101 module mastery" }))
    .toHaveAttribute("aria-valuenow", "2");
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/signin$/);
});
