import test from "node:test";
import assert from "node:assert/strict";
import { platformSurfaces } from "../../src/modules/platforms/catalog";
import { dataDomains } from "../../src/modules/platforms/data-domains";

test("all five blueprint platform interfaces have distinct, accessible entry points", () => {
  assert.deepEqual(platformSurfaces.map(p => p.title), [
    "Public Site", "Student Portal", "Learning Studio", "Python CodeLab", "Academic Administration",
  ]);
  assert.equal(new Set(platformSurfaces.map(p => p.id)).size, 5);
  for (const platform of platformSurfaces) {
    assert.ok(platform.primaryHref.startsWith("/"));
    assert.ok(platform.secondaryHref.startsWith("/"));
    assert.ok(platform.highlights.length > 0);
    assert.ok(platform.note.length > 20);
  }
  assert.equal(platformSurfaces.find(p => p.id === "admin")?.access, "staff-only");
});

test("section 07 lists nine domains and explicitly separates existing and future tables", () => {
  assert.deepEqual(dataDomains.map(p => p.domain), [
    "Identity", "Academic catalog", "Curriculum", "Enrollment", "Assessment",
    "CodeLab", "AI tutoring", "Credentials", "Operations",
  ]);
  assert.ok(dataDomains.some(domain => domain.planned.length));
  assert.ok(dataDomains.find(domain => domain.domain === "AI tutoring")?.planned.includes("ai_usage"));
  assert.ok(dataDomains.find(domain => domain.domain === "Credentials")?.existing.includes("credentials"));
});
