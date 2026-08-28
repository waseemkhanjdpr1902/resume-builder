import test from "node:test";
import assert from "node:assert/strict";
import { healthcareJobsHandler as handler, isFreshJob, isRelevantUaeJob } from "../api/_healthcare-jobs.js";

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

const restoreEnv = (name, value) => {
  if (value === undefined) delete process.env[name]; else process.env[name] = value;
};

test("healthcare jobs rejects unapproved role and location filters", async () => {
  const result = await invoke({ role: "software", location: "chicago" });
  assert.equal(result.statusCode, 400);
  assert.match(result.body.error, /valid healthcare role/i);
});

test("healthcare jobs removes clearly foreign and non-healthcare vacancies", () => {
  assert.equal(isRelevantUaeJob({ title: "Hospital Manager", location: "Muscat, Oman" }, "all", "uae"), false);
  assert.equal(isRelevantUaeJob({ title: "Hospital Manager", location: "Dubai, UAE" }, "all", "uae"), true);
  assert.equal(isRelevantUaeJob({ title: "Personal Assistant", location: "Dubai, UAE" }, "all", "uae"), false);
});

test("profession and emirate filters reject mismatched results", () => {
  assert.equal(isRelevantUaeJob({ title: "Registered Nurse", location: "Dubai" }, "nurse", "dubai"), true);
  assert.equal(isRelevantUaeJob({ title: "Pharmacy Manager", location: "Dubai" }, "nurse", "dubai"), false);
  assert.equal(isRelevantUaeJob({ title: "Registered Nurse", location: "Abu Dhabi" }, "nurse", "dubai"), false);
});

test("strict freshness accepts seven-day jobs and rejects stale or undated jobs", () => {
  const now = Date.parse("2026-08-28T12:00:00Z");
  assert.equal(isFreshJob({ postedAt: "2026-08-27T12:00:00Z" }, now), true);
  assert.equal(isFreshJob({ postedAt: "2026-08-21T12:00:00Z" }, now), true);
  assert.equal(isFreshJob({ postedAt: "2026-08-20T12:00:00Z" }, now), false);
  assert.equal(isFreshJob({ postedAt: "" }, now), false);
  assert.equal(isFreshJob({ postedAt: "not-a-date" }, now), false);
});

test("JSearch key stays server-side and fresh safe results are normalized", async () => {
  const previous = { j: process.env.JSEARCH_API_KEY, jo: process.env.JOOBLE_API_KEY, ai: process.env.ADZUNA_APP_ID, ak: process.env.ADZUNA_APP_KEY, fetch: global.fetch };
  process.env.JSEARCH_API_KEY = "private-test-key";
  delete process.env.JOOBLE_API_KEY; delete process.env.ADZUNA_APP_ID; delete process.env.ADZUNA_APP_KEY;
  let captured;
  global.fetch = async (url, options) => {
    captured = { url: String(url), options };
    return { ok: true, json: async () => ({ data: { jobs: [
      { job_id: "1", job_title: "Registered Nurse", employer_name: "UAE Hospital", job_location: "Dubai", apply_options: [{ apply_link: "https://example.com/apply" }], job_description: "Provide safe patient care.", job_posted_at_datetime_utc: new Date().toISOString() },
      { job_id: "2", job_title: "Unsafe listing", job_apply_link: "javascript:alert(1)", job_posted_at_datetime_utc: new Date().toISOString() },
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
    global.fetch = previous.fetch; restoreEnv("JSEARCH_API_KEY", previous.j); restoreEnv("JOOBLE_API_KEY", previous.jo); restoreEnv("ADZUNA_APP_ID", previous.ai); restoreEnv("ADZUNA_APP_KEY", previous.ak);
  }
});

test("Jooble works server-side with fresh results", async () => {
  const previous = { j: process.env.JSEARCH_API_KEY, jo: process.env.JOOBLE_API_KEY, base: process.env.JOOBLE_API_BASE_URL, ai: process.env.ADZUNA_APP_ID, ak: process.env.ADZUNA_APP_KEY, fetch: global.fetch };
  delete process.env.JSEARCH_API_KEY; delete process.env.ADZUNA_APP_ID; delete process.env.ADZUNA_APP_KEY;
  process.env.JOOBLE_API_KEY = "private-jooble-key"; process.env.JOOBLE_API_BASE_URL = "https://jooble.org/api";
  global.fetch = async () => ({ ok: true, json: async () => ({ jobs: [{ id: 42, title: "Pharmacist", company: "Sharjah Medical Centre", location: "Sharjah, UAE", snippet: "Review prescriptions.", source: "Jooble", link: "https://example.com/jooble-apply", updated: new Date().toISOString() }] }) });
  try {
    const result = await invoke({ role: "pharmacist", location: "sharjah" });
    assert.equal(result.statusCode, 200); assert.equal(result.body.jobs.length, 1); assert.deepEqual(result.body.providers, ["Jooble"]);
  } finally {
    global.fetch = previous.fetch; restoreEnv("JSEARCH_API_KEY", previous.j); restoreEnv("JOOBLE_API_KEY", previous.jo); restoreEnv("JOOBLE_API_BASE_URL", previous.base); restoreEnv("ADZUNA_APP_ID", previous.ai); restoreEnv("ADZUNA_APP_KEY", previous.ak);
  }
});

test("Adzuna credentials stay server-side and provider applies seven-day query", async () => {
  const previous = { j: process.env.JSEARCH_API_KEY, jo: process.env.JOOBLE_API_KEY, ai: process.env.ADZUNA_APP_ID, ak: process.env.ADZUNA_APP_KEY, fetch: global.fetch };
  delete process.env.JSEARCH_API_KEY; delete process.env.JOOBLE_API_KEY;
  process.env.ADZUNA_APP_ID = "private-adzuna-id"; process.env.ADZUNA_APP_KEY = "private-adzuna-key";
  let capturedUrl = "";
  global.fetch = async (url) => {
    capturedUrl = String(url);
    return { ok: true, json: async () => ({ results: [{ id: "a1", title: "Registered Nurse", company: { display_name: "Dubai Hospital" }, location: { display_name: "Dubai, UAE" }, description: "Patient care", redirect_url: "https://example.com/adzuna-apply", created: new Date().toISOString() }] }) };
  };
  try {
    const result = await invoke({ role: "nurse", location: "dubai" });
    assert.equal(result.statusCode, 200); assert.equal(result.body.jobs.length, 1); assert.equal(result.body.jobs[0].provider, "Adzuna"); assert.deepEqual(result.body.providers, ["Adzuna"]);
    assert.match(capturedUrl, /max_days_old=7/); assert.match(capturedUrl, /sort_by=date/);
    assert.doesNotMatch(JSON.stringify(result.body), /private-adzuna/);
  } finally {
    global.fetch = previous.fetch; restoreEnv("JSEARCH_API_KEY", previous.j); restoreEnv("JOOBLE_API_KEY", previous.jo); restoreEnv("ADZUNA_APP_ID", previous.ai); restoreEnv("ADZUNA_APP_KEY", previous.ak);
  }
});
