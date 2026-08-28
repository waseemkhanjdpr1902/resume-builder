import test from "node:test";
import assert from "node:assert/strict";
import { healthcareJobsHandler as handler, isRelevantUaeJob } from "../api/_healthcare-jobs.js";

const invoke = async (query = {}) => {
  const headers = {};
  let statusCode = 200;
  let body;
  const response = {
    setHeader: (name, value) => { headers[name] = value; },
    status: (value) => { statusCode = value; return response; },
    json: (value) => { body = value; return response; },
  };
  await handler({ method: "GET", query }, response);
  return { headers, statusCode, body };
};

test("healthcare jobs rejects unapproved role and location filters", async () => {
  const result = await invoke({ role: "software", location: "chicago" });
  assert.equal(result.statusCode, 400);
  assert.match(result.body.error, /valid healthcare role/i);
});

test("healthcare jobs removes clearly foreign vacancies from UAE results", () => {
  assert.equal(isRelevantUaeJob({ title: "Hospital Manager", location: "Muscat, Oman" }, "all", "uae"), false);
  assert.equal(isRelevantUaeJob({ title: "Hospital Manager", location: "Dubai, UAE" }, "all", "uae"), true);
});

test("profession and emirate filters reject mismatched results", () => {
  assert.equal(isRelevantUaeJob({ title: "Registered Nurse", location: "Dubai" }, "nurse", "dubai"), true);
  assert.equal(isRelevantUaeJob({ title: "Pharmacy Manager", location: "Dubai" }, "nurse", "dubai"), false);
  assert.equal(isRelevantUaeJob({ title: "Registered Nurse", location: "Abu Dhabi" }, "nurse", "dubai"), false);
});

test("healthcare jobs keeps the provider key server-side and normalizes safe results", async () => {
  const previousKey = process.env.JSEARCH_API_KEY;
  const previousJoobleKey = process.env.JOOBLE_API_KEY;
  const previousFetch = global.fetch;
  process.env.JSEARCH_API_KEY = "private-test-key";
  delete process.env.JOOBLE_API_KEY;
  let captured;
  global.fetch = async (url, options) => {
    captured = { url: String(url), options };
    return { ok: true, json: async () => ({ data: { jobs: [
      { job_id: "1", job_title: "Registered Nurse", employer_name: "UAE Hospital", job_location: "Dubai", apply_options: [{ apply_link: "https://example.com/apply" }], job_description: "Provide safe patient care." },
      { job_id: "2", job_title: "Unsafe listing", job_apply_link: "javascript:alert(1)" },
    ] } }) };
  };
  try {
    const result = await invoke({ role: "nurse", location: "dubai" });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.jobs.length, 1);
    assert.equal(result.body.jobs[0].title, "Registered Nurse");
    assert.match(captured.url, /country=ae/);
    assert.equal(captured.options.headers["x-api-key"], "private-test-key");
    assert.doesNotMatch(JSON.stringify(result.body), /private-test-key/);
  } finally {
    global.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.JSEARCH_API_KEY;
    else process.env.JSEARCH_API_KEY = previousKey;
    if (previousJoobleKey === undefined) delete process.env.JOOBLE_API_KEY;
    else process.env.JOOBLE_API_KEY = previousJoobleKey;
  }
});

test("Jooble works as a second server-side provider and normalizes results", async () => {
  const previousJSearchKey = process.env.JSEARCH_API_KEY;
  const previousJoobleKey = process.env.JOOBLE_API_KEY;
  const previousJoobleBase = process.env.JOOBLE_API_BASE_URL;
  const previousFetch = global.fetch;
  delete process.env.JSEARCH_API_KEY;
  process.env.JOOBLE_API_KEY = "private-jooble-key";
  process.env.JOOBLE_API_BASE_URL = "https://jooble.org/api";
  let captured;
  global.fetch = async (url, options) => {
    captured = { url: String(url), options };
    return { ok: true, json: async () => ({ jobs: [
      { id: 42, title: "Pharmacist", company: "Sharjah Medical Centre", location: "Sharjah, UAE", snippet: "Review prescriptions.", source: "Jooble", link: "https://example.com/jooble-apply", updated: "2026-08-28T00:00:00Z" },
    ] }) };
  };
  try {
    const result = await invoke({ role: "pharmacist", location: "sharjah" });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.jobs.length, 1);
    assert.equal(result.body.jobs[0].publisher, "Jooble");
    assert.deepEqual(result.body.providers, ["Jooble"]);
    assert.match(captured.url, /^https:\/\/jooble\.org\/api\/private-jooble-key$/);
    assert.equal(captured.options.method, "POST");
    assert.match(captured.options.body, /Sharjah/);
    assert.doesNotMatch(JSON.stringify(result.body), /private-jooble-key/);
  } finally {
    global.fetch = previousFetch;
    if (previousJSearchKey === undefined) delete process.env.JSEARCH_API_KEY;
    else process.env.JSEARCH_API_KEY = previousJSearchKey;
    if (previousJoobleKey === undefined) delete process.env.JOOBLE_API_KEY;
    else process.env.JOOBLE_API_KEY = previousJoobleKey;
    if (previousJoobleBase === undefined) delete process.env.JOOBLE_API_BASE_URL;
    else process.env.JOOBLE_API_BASE_URL = previousJoobleBase;
  }
});
