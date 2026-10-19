import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
test("catalog, enrollment, remediation and persisted lesson completion", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Build knowledge.",
  );
  for (const system of [
    "AI Professor",
    "Adaptive Learning Engine",
    "KHANIVERSITY CodeLab",
    "Virtual Technology Labs",
    "Intelligent Assessment System",
    "Skills Passport & Certifications",
  ])
    await expect(page.getByRole("heading", { name: system })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Six systems. One connected journey." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Learning workspace", exact: true }).click();
  await expect(page).toHaveURL(/\/preview\/dashboard$/);
  const navigation = page.getByRole("navigation", { name: "Student navigation" });
  for (const name of ["Overview", "Learning Studio", "Adaptive path", "Academic catalog", "Python CodeLab", "Tech labs", "Skills Passport"])
    await expect(navigation.getByRole("link", { name, exact: true })).toHaveCount(1);
  await expect(navigation.getByRole("group")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Learning systems", exact: true })).toHaveCount(0);
  await page.goto("/university");
  await expect(page).toHaveURL(/\/preview\/dashboard$/);
  await page.goto("/");
  await page.getByRole("link", { name: "Explore CS101" }).click();
  await expect(page.getByRole("heading", { name: "Complete CS101 pathway" })).toBeVisible();
  await page.getByRole("link", { name: "Start learning CS101" }).click();
  await page.getByRole("button", { name: "Start the lesson" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Before the code",
  );
  await page.getByText("Show a scaffolded hint", { exact: true }).click();
  await expect(
    page.getByText("First handle the empty list.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Hint: empty lists" }).click();
  await expect(
    page.getByText("Start with the empty-list case", { exact: false }),
  ).toBeVisible();
  for (let i = 0; i < 5; i++)
    await page.locator(`input[name="question-${i}"][value="0"]`).check();
  await page.getByRole("button", { name: "Check & save progress" }).click();
  await expect(page.getByRole("status")).toContainText("20%");
  for (const [i, v] of [1, 2, 0, 2, 1].entries())
    await page.locator(`input[name="question-${i}"][value="${v}"]`).check();
  await page.getByRole("button", { name: "Check & save progress" }).click();
  await expect(page.getByRole("status")).toContainText("100%");
  await page.screenshot({ path: "artifacts/lesson-completed.png" });
  await page.getByRole("link", { name: "Return to your overview" }).click();
  await expect(page).toHaveURL(/\/preview\/dashboard$/);
  await page.reload();
  await expect(page.getByText("100%", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Continue your pathway" }),
  ).toBeVisible();
  await expect(page.getByText("1 / 10 modules mastered")).toBeVisible();
  expect(errors).toEqual([]);
});
test("protected student routes do not accept preview state", async ({
  page,
}) => {
  await page.goto("/preview/dashboard");
  await page.evaluate(() =>
    localStorage.setItem(
      "khaniversity:foundation:0.2",
      JSON.stringify({ enrolled: true, completed: true, score: 100 }),
    ),
  );
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/signin$/);
  await page.goto("/learn/cs101/computational-thinking");
  await expect(page).toHaveURL(/\/signin$/);
  for (const path of ["/path", "/codelab", "/labs", "/passport", "/community", "/admin"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/signin$/);
  }
});
test("the old university destination opens the learning workspace", async ({ page }) => {
  await page.goto("/university");
  await expect(page).toHaveURL(/\/preview\/dashboard$/);
  await expect(page.getByRole("heading", { name: "A good day to begin." })).toBeVisible();
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
        `learning workspace at ${width}`,
    ).toBe(true);
  }
});
test("lesson starts directly and corrupt preview data recovers", async ({
  page,
}) => {
  await page.goto("/preview/learn/cs101/computational-thinking");
  await expect(page.getByRole("heading", { name: "Your first lesson is ready." })).toBeVisible();
  await page.getByRole("button", { name: "Start the lesson" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Before the code");
  await page.evaluate(() =>
    localStorage.setItem("khaniversity:foundation:0.2", "bad-json"),
  );
  await page.goto("/preview/dashboard");
  await expect(
    page.getByRole("button", { name: "Enroll in CS101", exact: true }),
  ).toBeEnabled();
});
test("responsive pages fit at phone, tablet and desktop widths", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto("/preview/dashboard");
  await page
    .getByRole("button", { name: "Enroll in CS101", exact: true })
    .click();
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of [
      "/",
      "/catalog",
      "/catalog/cs101",
      "/schools/computer-science",
      "/catalog/se110",
      "/signin",
      "/preview/dashboard",
      "/preview/learn/cs101/computational-thinking",
      "/preview/learn/cs101/programming-fundamentals",
      "/preview/academy/se110",
      "/preview/path",
      "/preview/labs",
      "/preview/passport",
    ]) {
      await page.goto(path);
      if (path.endsWith("computational-thinking"))
        await expect(page.getByRole("heading", { level: 1 })).toContainText(
          "Before the code",
        );
      if (path.endsWith("programming-fundamentals"))
        await expect(page.getByRole("heading", { level: 1 })).toContainText("Programming fundamentals");
      const overflow = await page.evaluate(() => Array.from(document.querySelectorAll("body *")).flatMap((element) => {
        const rect = element.getBoundingClientRect();
        return rect.right > innerWidth + 1 ? [`${element.tagName.toLowerCase()}.${(element as HTMLElement).className} x=${Math.round(rect.x)} right=${Math.round(rect.right)} width=${Math.round(rect.width)} parent=${(element.parentElement as HTMLElement)?.className} parentBox=${JSON.stringify({x:Math.round(element.parentElement?.getBoundingClientRect().x ?? 0),right:Math.round(element.parentElement?.getBoundingClientRect().right ?? 0),width:Math.round(element.parentElement?.getBoundingClientRect().width ?? 0)})} card=${JSON.stringify({x:Math.round(element.parentElement?.parentElement?.getBoundingClientRect().x ?? 0),right:Math.round(element.parentElement?.parentElement?.getBoundingClientRect().right ?? 0),width:Math.round(element.parentElement?.parentElement?.getBoundingClientRect().width ?? 0)})}`] : [];
      }).slice(0, 8));
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${path} at ${width}: ${overflow.join(", ")}`,
      ).toBe(true);
      const crampedContent = await page.locator(".roadmap-module h3, body > footer > .brand").evaluateAll(elements =>
        elements.filter(element => element.scrollWidth > element.clientWidth + 1).map(element => element.textContent),
      );
      expect(crampedContent, `${path} at ${width}: content fits its container`).toEqual([]);
      if (width <= 640) {
        const horizontalScrollers = await page.evaluate(() =>
          Array.from(document.querySelectorAll("body *"))
            .filter((element) => {
              const style = getComputedStyle(element);
              return (
                ["auto", "scroll"].includes(style.overflowX) &&
                element.scrollWidth > element.clientWidth + 1
              );
            })
            .map((element) => `${element.tagName.toLowerCase()}.${(element as HTMLElement).className}`),
        );
        expect(horizontalScrollers, `${path} at ${width} has horizontal scroll`).toEqual([]);
      }
      if (
        width !== 768 &&
        [
          "/",
          "/preview/dashboard",
          "/preview/learn/cs101/computational-thinking",
        ].includes(path)
      )
        await page.screenshot({
          path: `artifacts/${path === "/" ? "home" : path.includes("/learn/") ? "lesson" : "dashboard"}-${width}.png`,
          fullPage: true,
        });
      if (path === "/catalog" && width === 375)
        await page.screenshot({ path: "artifacts/catalog-375.png", fullPage: true });
      if (width === 375 && path.includes("/preview/learn/"))
        await page.screenshot({ path: "artifacts/lesson-phone-top.png" });
    }
  }
  await page.setViewportSize({ width: 375, height: 1000 });
  await page.goto("/preview/codelab");
  await expect(
    page.getByText("Python is ready · runs in your browser"),
  ).toBeVisible({ timeout: 60_000 });
  expect(
    await page.evaluate(() =>
      Array.from(document.querySelectorAll("body *"))
        .filter((element) => {
          const style = getComputedStyle(element);
          return (
            ["auto", "scroll"].includes(style.overflowX) &&
            element.scrollWidth > element.clientWidth + 1
          );
        })
        .map((element) => `${element.tagName.toLowerCase()}.${(element as HTMLElement).className}`),
    ),
    "CodeLab has no mobile horizontal scrollers",
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "CodeLab at 375",
  ).toBe(true);
});
test("all nine follow-on CS101 modules accept checks and the capstone draft saves", async ({ page }) => {
  const modules = [
    ["programming-fundamentals", [0, 1, 0, 1, 0]],
    ["variables-data-input-output", [1, 0, 0, 1, 0]],
    ["conditions-loops", [0, 0, 0, 0, 1]],
    ["functions-scope", [0, 0, 0, 0, 0]],
    ["collections", [0, 0, 0, 0, 0]],
    ["files-exceptions-debugging", [0, 0, 0, 0, 0]],
    ["algorithms-complexity", [0, 0, 0, 0, 0]],
    ["testing-git-quality", [0, 0, 0, 0, 0]],
    ["personal-study-planner-capstone", [0, 0, 0, 0, 0]],
  ] as const;
  for (const [moduleId, answers] of modules) {
    await page.goto(`/preview/learn/cs101/${moduleId}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    if (moduleId === "personal-study-planner-capstone") {
      await page.getByRole("button", { name: "Save project draft" }).click();
      await expect(page.getByRole("status")).toContainText("saved on this device");
    }
    for (const [i, answer] of answers.entries())
      await page.locator(`input[name="module-${moduleId}-q-${i}"][value="${answer}"]`).check();
    await page.getByRole("button", { name: "Submit knowledge check" }).click();
    await expect(page.locator(".module-check .result[role='status']")).toContainText("100% · Module mastered");
  }
});
test("the app manifest and credential lookup disclose service state", async ({ page, request }) => {
  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  expect((await manifest.json()).short_name).toBe("KHANIVERSITY");
  await page.goto("/verify/KH-CS101-NOT-A-REAL-CREDENTIAL");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Verification is temporarily unavailable");
});
test("six preview systems complete a diagnostic, Python challenge, labs and passport", async ({
  page,
}) => {
  await page.goto("/preview/path");
  for (const [i, answer] of [0, 1, 1, 0, 1, 0].entries())
    await page.locator(`input[name="q-${i}"][value="${answer}"]`).check();
  await page.getByRole("button", { name: "Build my path" }).click();
  await expect(
    page.getByText("DIAGNOSTIC COMPLETE", { exact: false }),
  ).toBeVisible();
  await page.goto("/preview/codelab");
  await expect(
    page.getByText("Python is ready · runs in your browser"),
  ).toBeVisible({ timeout: 60_000 });
  await page.getByRole("button", { name: "Run challenge checks" }).click();
  await expect(page.getByText("All 3 challenge checks passed.")).toBeVisible({
    timeout: 30_000,
  });
  await page.goto("/preview/labs");
  for (const [lab, answer] of Object.entries({
    network: 1,
    cloud: 1,
    identity: 1,
    storage: 2,
    recovery: 0,
    patching: 1,
  }))
    await page.locator(`input[name="${lab}"][value="${answer}"]`).check();
  await page.getByRole("button", { name: "Submit lab results" }).click();
  await page.goto("/preview/passport");
  await expect(page.getByText("Python: sum durations")).toBeVisible();
  await expect(page.getByText("Lab: network")).toBeVisible();
  const exportButton = page.getByRole("button", { name: "Export JSON" });
  await expect(exportButton).toBeEnabled();
  const downloadPromise = page.waitForEvent("download");
  await exportButton.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(
    "khaniversity-skills-passport.json",
  );
  const exportPath = await download.path();
  expect(exportPath).not.toBeNull();
  const evidence = JSON.parse(await readFile(exportPath!, "utf8"));
  expect(evidence.verified).toBe(false);
  expect(evidence.records).toHaveLength(7);
});
test("tutor endpoint rejects anonymous requests before any billable provider call", async ({ page }) => {
  await page.goto("/");
  const status = await page.evaluate(async () => {
    const response = await fetch("/api/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId: "computational-thinking", messages: [{ role: "user", content: "Help me learn" }] }),
    });
    return response.status;
  });
  expect(status).toBe(401);
});

test("tutor endpoint rejects cross-origin requests even without an AI key", async ({ request }) => {
  const result = await request.post("/api/tutor", {
    headers: { origin: "https://malicious.example" },
    data: { moduleId: "computational-thinking", messages: [{ role: "user", content: "Help" }] },
  });
  expect(result.status()).toBe(403);
});

test("account recovery rejects cross-origin use and recovery pages remain accessible", async ({ page, request }) => {
  await page.goto("/recover");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Recover");
  await page.goto("/reset-password");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Choose a new password");
  const response = await request.post("/api/account/recovery", {
    headers: { origin: "https://malicious.example" },
    data: { email: "example@example.com" },
  });
  expect(response.status()).toBe(403);
  const update = await request.post("/api/account/password", {
    headers: { origin: "https://malicious.example" },
    data: { password: "ExampleLongPassword321!" },
  });
  expect(update.status()).toBe(403);
});

test("CodeLab isolates Python runs, so stale functions cannot pass a fresh check", async ({ page }) => {
  await page.goto("/preview/codelab");
  await expect(page.getByText("Python is ready · runs in your browser")).toBeVisible({ timeout: 60_000 });
  await page.getByRole("button", { name: "Run challenge checks" }).click();
  await expect(page.getByText("All 3 challenge checks passed.")).toBeVisible({ timeout: 30_000 });
  await page.getByRole("textbox", { name: "Python editor" }).fill("# no function in this attempt");
  await page.getByRole("button", { name: "Run challenge checks" }).click();
  await expect(page.locator(".code-output")).toContainText("NameError", { timeout: 30_000 });
  await expect(page.getByRole("button", { name: "Run challenge checks" })).toBeEnabled();
});

test("learning data disclosure is reachable without an account", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: "Your learning data matters." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Before the public learner pilot" })).toBeVisible();
});

test("five blueprint platforms and admissions have working public entry points", async ({ page }) => {
  await page.goto("/platforms");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Your academy.");
  for (const name of ["Public Site", "Student Portal", "Learning Studio", "Python CodeLab", "Academic Administration"])
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Move from a lesson to demonstrable skill" })).toBeVisible();
  await page.getByRole("link", { name: "Explore admissions" }).click();
  await expect(page).toHaveURL(/\/admissions$/);
  await expect(page.getByRole("heading", { name: "How to begin" })).toBeVisible();
  await page.getByRole("link", { name: "Try the Student Portal" }).click();
  await expect(page).toHaveURL(/\/preview\/dashboard$/);
});

test("CodeLab draft resumes in the same preview browser after reload", async ({ page }) => {
  await page.goto("/preview/codelab");
  await expect(page.getByText("Draft is kept in this browser only", { exact: false })).toBeVisible();
  const code = "def total_minutes(durations):\n    return sum(durations) + 1\n";
  await page.getByRole("textbox", { name: "Python editor" }).fill(code);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("khaniversity:codelab:preview:v1"))).toBe(code);
  await page.reload();
  await expect(page.getByRole("textbox", { name: "Python editor" })).toHaveValue(code);
  await page.getByRole("button", { name: "Reset local draft" }).click();
  await expect(page.getByRole("textbox", { name: "Python editor" })).not.toHaveValue(code);
});

test("auth endpoint rejects cross-origin requests", async ({ request }) => {
  const response = await request.post("/api/auth", {
    headers: { origin: "https://example.invalid" },
    data: {},
  });
  expect(response.status()).toBe(403);
});

test("mobile workspace menu is compact, keyboard accessible and closes on navigation", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/preview/dashboard");
  const navigation = page.getByRole("navigation", { name: "Student navigation" });
  const toggle = page.getByRole("button", { name: "Open navigation menu" });
  await expect(navigation).toBeHidden();
  const brand = await page.locator(".sidebar-header .brand").boundingBox();
  const button = await toggle.boundingBox();
  expect(brand && button && brand.x + brand.width <= button.x).toBeTruthy();
  expect(await page.locator(".sidebar").evaluate(el => el.getBoundingClientRect().height)).toBeLessThan(80);
  await toggle.click();
  await expect(navigation).toBeVisible();
  await expect(page.getByRole("button", { name: "Close navigation menu" })).toHaveAttribute("aria-expanded", "true");
  await expect(navigation.getByRole("link")).toHaveCount(6);
  await page.screenshot({ path: "artifacts/mobile-menu-open-320.png", fullPage: true });
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(navigation).toBeHidden();
  await page.keyboard.press("Enter");
  await navigation.getByRole("link", { name: "Adaptive path", exact: true }).click();
  await expect(page).toHaveURL(/\/preview\/path$/);
  await expect(navigation).toBeHidden();
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page.locator(".workspace-header").click();
  await expect(navigation).toBeHidden();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(navigation).toBeVisible();
  await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeHidden();
});

test("premium campus navigation stays operable on phones and desktop", async ({ page }) => {
  for (const width of [320, 375, 640, 768, 1120, 1440]) {
    await page.setViewportSize({ width, height: 850 });
    await page.goto("/");
    const navigation = page.getByRole("navigation", { name: "Main navigation" });
    const toggle = page.getByRole("button", { name: "Open site menu" });
    const isCompact = width <= 1120;
    if (isCompact) {
      await expect(navigation).toBeHidden();
      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await toggle.click();
      await expect(navigation).toBeVisible();
      await expect(page.getByRole("button", { name: "Close site menu" })).toHaveAttribute("aria-expanded", "true");
    } else {
      await expect(navigation).toBeVisible();
      await expect(toggle).toBeHidden();
    }
    for (const name of ["Platforms", "Explore the academy", "Getting started", "Sign in", "Learning workspace"])
      await expect(navigation.getByRole("link", { name, exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const hero = await page.locator(".hero").boundingBox();
    expect(hero?.width).toBeGreaterThan(250);
    if (isCompact) {
      await page.keyboard.press("Escape");
      await expect(toggle).toBeFocused();
      await expect(navigation).toBeHidden();
    }
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open site menu" }).click();
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Platforms" }).click();
  await expect(page).toHaveURL(/\/platforms$/);
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeHidden();
  await page.getByRole("button", { name: "Open site menu" }).click();
  await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Platforms" })).toHaveAttribute("aria-current", "page");
});

test("premium StudentOS keeps its primary study actions accessible at mobile sizes", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/preview/dashboard");
  const shortcuts = page.getByRole("navigation", { name: "Learning workspace shortcuts" });
  for (const link of ["Learning Studio", "Python CodeLab", "Skills Passport"])
    await expect(shortcuts.getByRole("link", { name: new RegExp(link) })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await shortcuts.getByRole("link", { name: /Python CodeLab/ }).click();
  await expect(page).toHaveURL(/\/preview\/codelab$/);
});
