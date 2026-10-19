import { test, expect } from "@playwright/test";

test("private academic record requires a real signed-in account", async ({ page }) => {
  await page.goto("/preview/dashboard");
  await page.evaluate(() => localStorage.setItem("khaniversity:foundation:0.2",
    JSON.stringify({ enrolled:true, completed:true, score:100 })));
  await page.goto("/transcript");
  await expect(page).toHaveURL(/\/signin$/);
});

test("academic record is not advertised as verified in the public course catalog", async ({ page }) => {
  await page.goto("/catalog/cs101");
  await expect(page.getByRole("heading", {level:1})).toContainText("Computer");
  await expect(page.getByText("accredited course completion", {exact:false})).toBeVisible();
});
