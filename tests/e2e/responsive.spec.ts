import { test, expect, type Page } from "@playwright/test";

// Regression coverage for the original KHANIVERSITY campus and every
// learner-accessible product surface across compact and wide viewports.
// Horizontal scrolling is permitted INSIDE labelled code/table containers,
// never on the overall document.
const widths = [320, 375, 430, 768, 1024, 1440, 1920] as const;
const publicRoutes = [
  "/", "/platforms", "/admissions", "/catalog", "/catalog/cs101",
  "/schools/computer-science", "/signin", "/privacy",
] as const;
const learnerRoutes = [
  "/preview/dashboard", "/preview/learn/cs101/computational-thinking",
  "/preview/learn/cs101/programming-fundamentals", "/preview/path",
  "/preview/codelab", "/preview/labs", "/preview/passport",
] as const;

async function checkFit(page: Page, path: string, width: number) {
  const measurement = await page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const targets = document.querySelectorAll<HTMLElement>(
      "main, .hero, .public-header, .site-footer, .featured-course, .system-card," +
      " .dashboard, .welcome-panel, .stats article, .study-shortcuts > a," +
      " .learning-path, .path-card, .path-module, .tool-page, .tool-panel," +
      " .lesson-layout, .lesson-content, .module-reading, .module-project," +
      " .module-check, .operations-section, .auth-card, .catalog-card," +
      " .university-school-card, .school-course, .review-card"
    );
    const violations: string[] = [];
    for (const element of targets) {
      const style = getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const box = element.getBoundingClientRect();
      if (!box.width || !box.height) continue;
      // Only structural surfaces: decorative artwork is deliberately clipped.
      if (box.left < -3 || box.right > viewport + 3) {
        violations.push(`${element.tagName.toLowerCase()}.${String(element.className).split(" ")[0]} at ${Math.round(box.left)}..${Math.round(box.right)}`);
      }
    }
    return { viewport, scrollWidth, violations };
  });
  expect(
    measurement.scrollWidth,
    `${path} at ${width}px: document horizontal overflow ${JSON.stringify(measurement)}`,
  ).toBeLessThanOrEqual(measurement.viewport + 2);
  expect(
    measurement.violations,
    `${path} at ${width}px: page surface escaped the viewport`,
  ).toEqual([]);
}

test("public campus content fits phone, tablet, laptop and desktop widths", async ({ page }) => {
  test.setTimeout(210_000);
  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 600 ? 812 : 900 });
    for (const path of publicRoutes) {
      await page.goto(path);
      await checkFit(page, path, width);
    }
  }
});

test("student preview content and code tools fit all viewport classes", async ({ page }) => {
  test.setTimeout(210_000);
  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 600 ? 812 : 900 });
    for (const path of learnerRoutes) {
      await page.goto(path);
      await checkFit(page, path, width);
    }
  }
});

test("long form content remains visible and can scroll within its own container", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto("/preview/learn/cs101/programming-fundamentals");
  const codeBlock = page.locator(".module-reading pre").first();
  if (await codeBlock.count()) {
    await expect(codeBlock).toHaveCSS("overflow-x", "auto");
    const sizing = await codeBlock.evaluate(el => {
      const outer = el.getBoundingClientRect();
      const article = el.closest(".module-reading")!.getBoundingClientRect();
      return { left: outer.left, right: outer.right, leftBound: article.left, rightBound: article.right };
    });
    expect(sizing.left).toBeGreaterThanOrEqual(sizing.leftBound - 2);
    expect(sizing.right).toBeLessThanOrEqual(sizing.rightBound + 2);
  }
  await page.goto("/preview/codelab");
  await expect(page.getByRole("textbox", { name: "Python editor" })).toBeVisible();
  await checkFit(page, "/preview/codelab", 320);
});

test("long course titles, status labels and student shortcuts wrap without clipping", async ({ page }) => {
  test.setTimeout(45_000);
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 812 });
    const stress = "KHANIVERSITY" + "ComputerScienceFoundations".repeat(7);
    for (const path of ["/", "/platforms", "/preview/dashboard"]) {
      await page.goto(path);
      const selector = path === "/" ? ".system-card h3" : path === "/platforms" ? "main article h3" : ".study-shortcuts strong";
      const target = page.locator(selector).first();
      await expect(target).toBeVisible();
      await target.evaluate((el, word) => { el.textContent = word; }, stress);
      const layout = await target.evaluate(el => {
        const card = el.closest(".system-card, article, a")!;
        const text = el.getBoundingClientRect();
        const parent = card.getBoundingClientRect();
        return {
          left: text.left, right: text.right,
          containerLeft: parent.left, containerRight: parent.right,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        };
      });
      expect(layout.right, `${path} (${width}px) text escaped its parent`).toBeLessThanOrEqual(layout.containerRight + 2);
      expect(layout.left).toBeGreaterThanOrEqual(layout.containerLeft - 2);
      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 2);
    }
  }
});
