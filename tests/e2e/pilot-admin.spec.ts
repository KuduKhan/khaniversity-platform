import { test, expect } from "@playwright/test";

test("pilot staff analytics cannot be opened from anonymous or preview sessions", async ({ page }) => {
  await page.goto("/preview/dashboard");
  await page.evaluate(() =>
    localStorage.setItem("khaniversity:foundation:0.2", JSON.stringify({
      enrolled: true, completed: true, role: "administrator",
    })),
  );
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/signin$/);
  await expect(page.getByRole("heading", { name: "Pilot command center" })).toHaveCount(0);
});
