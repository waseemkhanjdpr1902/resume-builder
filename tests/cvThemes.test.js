import assert from "node:assert/strict";
import test from "node:test";
import { cvThemes, defaultCvTheme } from "../src/data/cvThemes.js";

test("CV studio provides distinct accessible colour themes", () => {
  assert.equal(cvThemes.length, 6);
  assert.equal(new Set(cvThemes.map((theme) => theme.id)).size, cvThemes.length);
  assert.ok(cvThemes.every((theme) => /^#[0-9a-f]{6}$/i.test(theme.accent)));
  assert.ok(cvThemes.some((theme) => theme.id === defaultCvTheme));
});
