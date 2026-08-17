/* global process */
import test from "node:test";
import assert from "node:assert/strict";
import { isTestingAccessEnabled } from "../api/_testing-access.js";

test("testing access is open by default for the validation release", () => {
  const previous = process.env.RESUAI_TESTING_ACCESS;
  delete process.env.RESUAI_TESTING_ACCESS;
  assert.equal(isTestingAccessEnabled(), true);
  if (previous !== undefined) process.env.RESUAI_TESTING_ACCESS = previous;
});

test("testing access can be disabled without a code change", () => {
  const previous = process.env.RESUAI_TESTING_ACCESS;
  process.env.RESUAI_TESTING_ACCESS = "false";
  assert.equal(isTestingAccessEnabled(), false);
  if (previous === undefined) delete process.env.RESUAI_TESTING_ACCESS;
  else process.env.RESUAI_TESTING_ACCESS = previous;
});
