import assert from "node:assert/strict";
import test from "node:test";
import { parseProviderJson } from "../api/improve-cv.js";

test("provider JSON parser accepts strict JSON", () => {
  assert.deepEqual(parseProviderJson('{"summary":"complete"}'), { summary: "complete" });
});

test("provider JSON parser recovers fenced and prefixed JSON", () => {
  assert.deepEqual(parseProviderJson('Here is the result:\n```json\n{"summary":"complete"}\n```'), { summary: "complete" });
});
