import { expect, test } from "@playwright/test";

const viewports = [320, 375, 430, 768, 1024, 1440] as const;

test("StudentOS retains one readable mobile menu with all existing destinations", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto("/preview/dashboard");

  const menu = page.getByRole("button", { name: "Open navigation menu" });
  await expect(menu).toBeVisible();
  await menu.click();
  const navigation = page.getByRole("navigation", { name: "Student navigation" });
  await expect(navigation).toBeVisible();
  for (const destination of [
    "Home", "My Learning", "Adaptive path", "Python CodeLab",
    "Tech labs", "Skills Passport", "Academic catalog",
  ]) {
    await expect(navigation.getByRole("link", { name: destination, exact: true })).toHaveCount(1);
  }
  const links = await navigation.locator("a").evaluateAll((elements) =>
    elements.map((element) => ({
      label: element.textContent?.trim(),
      size: parseFloat(getComputedStyle(element).fontSize),
      height: element.getBoundingClientRect().height,
    })),
  );
  expect(links.length).toBeGreaterThanOrEqual(7);
  for (const link of links) {
    expect(link.size, link.label).toBeGreaterThanOrEqual(13);
    expect(link.height, link.label).toBeGreaterThanOrEqual(44);
  }
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeFocused();
  await expect(navigation).not.toBeVisible();
});

test("primary continuation comes before secondary revision aids on student overview", async ({ page }) => {
  await page.goto("/preview/dashboard");
  const hero = page.locator(".welcome-panel");
  await expect(hero).toBeVisible();
  const review = page.getByRole("heading", { name: "Your revision desk." });
  const practice = page.getByRole("heading", { name: "Turn reading into reasoning." });
  await expect(review).toBeVisible();
  await expect(practice).toBeVisible();
  const positions = await Promise.all([hero, review, practice].map(async (locator) =>
    (await locator.boundingBox())?.y ?? Number.POSITIVE_INFINITY
  ));
  expect(positions[0]).toBeLessThan(positions[1]);
  expect(positions[0]).toBeLessThan(positions[2]);
});

test("navigation and learning surfaces remain contained at supported widths", async ({ page }) => {
  test.setTimeout(90_000);
  for (const width of viewports) {
    await page.setViewportSize({ width, height: 880 });
    await page.goto("/preview/dashboard");
    const geometry = await page.evaluate(() => ({
      total: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(geometry.total, `dashboard at ${width}px`).toBeLessThanOrEqual(geometry.viewport + 2);
    await page.goto("/preview/learn/cs101/programming-fundamentals");
    expect(await page.evaluate(() =>
      document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2
    ), `lesson at ${width}px`).toBe(true);
  }
});

test("existing CodeLab remains locked until runtime is ready, then executes in browser", async ({ page }) => {
  await page.goto("/preview/codelab");
  await expect(page.getByText("Python is ready · runs in your browser")).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole("button", { name: "Run code", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Run challenge checks" }).click();
  await expect(page.getByText("All 3 challenge checks passed.")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("button", { name: "Reset local draft" })).toBeEnabled();
});
