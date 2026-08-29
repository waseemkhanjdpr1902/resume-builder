/* global process */
const roles = {
  all: "healthcare",
  nurse: "registered nurse",
  doctor: "doctor physician",
  pharmacist: "pharmacist",
  dentist: "dentist",
  physiotherapist: "physiotherapist",
  laboratory: "medical laboratory technician",
  radiographer: "radiographer",
  coder: "medical coder",
  assistant: "healthcare assistant",
};

const locations = {
  uae: "United Arab Emirates",
  dubai: "Dubai",
  "abu-dhabi": "Abu Dhabi",
  sharjah: "Sharjah",
  ajman: "Ajman",
  "al-ain": "Al Ain",
  "ras-al-khaimah": "Ras Al Khaimah",
  fujairah: "Fujairah",
};

const roleTitleTerms = {
  nurse: /\b(nurs|midwi|clinical facilitator)\w*/i,
  doctor: /\b(doctor|physician|consultant|specialist|medical officer|surgeon|paediatric|pediatric)\w*/i,
  pharmacist: /\b(pharmac|pharmacy)\w*/i,
  dentist: /\b(dent|orthodont|prosthodont|periodont)\w*/i,
  physiotherapist: /\b(physiotherap|physical therap)\w*/i,
  laboratory: /\b(laborator|lab techn|patholog|phlebotom)\w*/i,
  radiographer: /\b(radiograph|radiolog|imaging|sonograph)\w*/i,
  coder: /\b(medical cod|clinical cod|medical bill)\w*/i,
  assistant: /\b(healthcare assistant|health care assistant|nursing assistant|caregiver|patient care assistant)\w*/i,
};

const healthcareTitleTerms = /\b(nurs\w*|midwi\w*|doctor\w*|physician\w*|medical officer\w*|surgeon\w*|consultant\w*|clinical specialist\w*|paediatric\w*|pediatric\w*|pharmac\w*|pharmacy\w*|dent\w*|orthodont\w*|prosthodont\w*|periodont\w*|physiotherap\w*|physical therap\w*|occupational therap\w*|speech therap\w*|radiograph\w*|radiolog\w*|sonograph\w*|imaging techn\w*|laborator\w*|lab techn\w*|patholog\w*|phlebotom\w*|medical cod\w*|clinical cod\w*|medical bill\w*|healthcare assistant\w*|health care assistant\w*|nursing assistant\w*|caregiver\w*|patient care assistant\w*|respiratory therap\w*|dietitian\w*|nutritionist\w*|optomet\w*|audiolog\w*|paramedic\w*|emergency medical technician\w*|hospital manager\w*|clinic manager\w*|healthcare manager\w*|medical receptionist\w*)\b/i;

const allRoleSearchTerms = [
  "registered nurse",
  "doctor physician",
  "pharmacist",
  "dentist",
  "physiotherapist",
  "medical laboratory technician",
  "radiographer radiology technician",
  "medical coder",
  "healthcare assistant nursing assistant",
  "occupational therapist",
  "respiratory therapist",
  "dietitian nutritionist",
  "paramedic emergency medical technician",
  "medical receptionist clinic manager",
];

const roleSearchTerms = {
  nurse: ["registered nurse", "staff nurse", "nursing", "midwife"],
  doctor: ["doctor physician", "medical officer", "consultant physician", "specialist doctor"],
  pharmacist: ["pharmacist", "clinical pharmacist", "hospital pharmacist", "pharmacy technician"],
  dentist: ["dentist", "dental doctor", "orthodontist", "dental specialist"],
  physiotherapist: ["physiotherapist", "physical therapist"],
  laboratory: ["medical laboratory technician", "lab technologist", "phlebotomist", "pathology technician"],
  radiographer: ["radiographer", "radiology technician", "sonographer", "imaging technologist"],
  coder: ["medical coder", "clinical coder", "medical billing"],
  assistant: ["healthcare assistant", "nursing assistant", "patient care assistant", "caregiver"],
};

const foreignCountry = /\b(oman|saudi arabia|qatar|bahrain|kuwait)\b/i;
const uaeLocation = /\b(united arab emirates|uae|dubai|abu dhabi|sharjah|ajman|al ain|ras al khaimah|fujairah|umm al quwain)\b/i;
const locationTerms = {
  dubai: /\bdubai\b/i, "abu-dhabi": /\babu dhabi\b/i, sharjah: /\bsharjah\b/i,
  ajman: /\bajman\b/i, "al-ain": /\bal ain\b/i, "ras-al-khaimah": /\bras al khaimah\b/i,
  fujairah: /\bfujairah\b/i,
};

const memoryCache = new Map();
const CACHE_MS = 10 * 60 * 1000;
const CACHE_VERSION = "v7-provider-quota-fix";
const MAX_JOB_AGE_DAYS = 7;
const FUTURE_TOLERANCE_MS = 6 * 60 * 60 * 1000;
const JSEARCH_MAX_TERMS = 2;
const JOOBLE_MAX_TERMS = 3;

const safeText = (value, max = 5000) => typeof value === "string" ? value.trim().slice(0, max) : "";
const safeUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : "";
  } catch { return ""; }
};

const normalizeJSearchJob = (job) => ({
  id: `jsearch:${safeText(job.job_id, 280)}`,
  provider: "JSearch",
  title: safeText(job.job_title, 180),
  employer: safeText(job.employer_name, 140) || "Employer not listed",
  employerLogo: safeUrl(job.employer_logo),
  city: safeText(job.job_city, 80),
  state: safeText(job.job_state, 80),
  country: safeText(job.job_country, 80),
  location: safeText(job.job_location, 160),
  employmentType: safeText(job.job_employment_type, 60),
  description: safeText(job.job_description),
  applyUrl: safeUrl(job.job_apply_link || job.apply_options?.[0]?.apply_link || job.job_google_link),
  publisher: safeText(job.job_publisher, 100),
  postedAt: safeText(job.job_posted_at_datetime_utc, 60),
  minSalary: Number.isFinite(job.job_min_salary) ? job.job_min_salary : null,
  maxSalary: Number.isFinite(job.job_max_salary) ? job.job_max_salary : null,
  salaryPeriod: safeText(job.job_salary_period, 30),
});

const normalizeJoobleJob = (job) => ({
  id: `jooble:${safeText(String(job.id || ""), 280)}`,
  provider: "Jooble",
  title: safeText(job.title, 180),
  employer: safeText(job.company, 140) || "Employer not listed",
  employerLogo: "",
  city: "",
  state: "",
  country: "United Arab Emirates",
  location: safeText(job.location, 160),
  employmentType: safeText(job.type, 60),
  description: safeText(job.snippet),
  applyUrl: safeUrl(job.link),
  publisher: safeText(job.source, 100) || "Jooble",
  postedAt: safeText(job.updated, 60),
  minSalary: null,
  maxSalary: null,
  salaryPeriod: safeText(job.salary, 80),
});

const dedupeKey = (job) => [job.title, job.employer, job.location || job.city]
  .map((value) => safeText(value, 180).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim())
  .join(":");

const searchTermsForRole = (roleKey) => roleKey === "all" ? allRoleSearchTerms : (roleSearchTerms[roleKey] || [roles[roleKey]]);
const limitedSearchTerms = (roleKey, maxTerms) => searchTermsForRole(roleKey).slice(0, maxTerms);

export const isFreshJob = (job, now = Date.now()) => {
  if (!job.postedAt) return false;
  const posted = Date.parse(job.postedAt);
  if (!Number.isFinite(posted)) return false;
  if (posted > now + FUTURE_TOLERANCE_MS) return false;
  return now - posted <= MAX_JOB_AGE_DAYS * 86400000;
};

const fetchJSearchQuery = async (term, locationKey) => {
  const url = new URL("https://api.openwebninja.com/jsearch/search-v2");
  url.searchParams.set("query", `${term} jobs in ${locations[locationKey]}`);
  url.searchParams.set("country", "ae");
  url.searchParams.set("language", "en");
  url.searchParams.set("num_pages", "1");
  url.searchParams.set("date_posted", "week");
  const apiResponse = await fetch(url, { headers: { "x-api-key": process.env.JSEARCH_API_KEY, Accept: "application/json" }, signal: AbortSignal.timeout(12_000) });
  if (!apiResponse.ok) throw new Error(`JSearch:${apiResponse.status}`);
  const result = await apiResponse.json();
  const rawJobs = Array.isArray(result.data) ? result.data : Array.isArray(result.data?.jobs) ? result.data.jobs : [];
  return rawJobs.map(normalizeJSearchJob);
};

const fetchJSearchJobs = async (roleKey, locationKey) => {
  if (!process.env.JSEARCH_API_KEY) return { provider: "JSearch", configured: false, jobs: [] };
  const queryResults = await Promise.allSettled(limitedSearchTerms(roleKey, JSEARCH_MAX_TERMS).map((term) => fetchJSearchQuery(term, locationKey)));
  const jobs = queryResults.filter((item) => item.status === "fulfilled").flatMap((item) => item.value);
  if (!jobs.length && queryResults.some((item) => item.status === "rejected")) throw queryResults.find((item) => item.status === "rejected").reason;
  return { provider: "JSearch", configured: true, jobs };
};

const fetchJoobleQuery = async (term, locationKey) => {
  const requestedBase = safeText(process.env.JOOBLE_API_BASE_URL, 300) || "https://ae.jooble.org/api";
  const configuredBase = /^https:\/\/(?:www\.)?jooble\.org\/api\/?$/i.test(requestedBase)
    ? "https://ae.jooble.org/api"
    : requestedBase;
  const base = new URL(configuredBase);
  if (base.protocol !== "https:") throw new Error("Jooble:invalid-base-url");
  const endpoint = new URL(`${base.toString().replace(/\/+$/, "")}/${encodeURIComponent(process.env.JOOBLE_API_KEY)}`);
  const apiResponse = await fetch(endpoint, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ keywords: term, location: locations[locationKey], page: "1", ResultOnPage: "50", SearchMode: "1" }), signal: AbortSignal.timeout(12_000) });
  if (!apiResponse.ok) throw new Error(`Jooble:${apiResponse.status}`);
  const result = await apiResponse.json();
  return (Array.isArray(result.jobs) ? result.jobs : []).map(normalizeJoobleJob);
};

const fetchJoobleJobs = async (roleKey, locationKey) => {
  if (!process.env.JOOBLE_API_KEY) return { provider: "Jooble", configured: false, jobs: [] };
  const queryResults = await Promise.allSettled(limitedSearchTerms(roleKey, JOOBLE_MAX_TERMS).map((term) => fetchJoobleQuery(term, locationKey)));
  const jobs = queryResults.filter((item) => item.status === "fulfilled").flatMap((item) => item.value);
  if (!jobs.length && queryResults.some((item) => item.status === "rejected")) throw queryResults.find((item) => item.status === "rejected").reason;
  return { provider: "Jooble", configured: true, jobs };
};

const fetchAdzunaJobs = async () => ({ provider: "Adzuna", configured: false, jobs: [] });

export const isRelevantUaeJob = (job, roleKey, locationKey) => {
  const place = [job.location, job.city, job.state, job.country].filter(Boolean).join(" ");
  const fullText = `${job.title} ${place} ${job.description || ""}`;
  if (foreignCountry.test(place) && !uaeLocation.test(place)) return false;
  if (locationKey !== "uae" && locationTerms[locationKey] && !locationTerms[locationKey].test(place)) return false;
  if (roleKey === "all" && !healthcareTitleTerms.test(job.title || "")) return false;
  if (roleKey !== "all" && roleTitleTerms[roleKey] && !roleTitleTerms[roleKey].test(fullText)) return false;
  return true;
};

export async function healthcareJobsHandler(request, response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("Pragma", "no-cache");
  response.setHeader("Expires", "0");
  if (request.method !== "GET") { response.setHeader("Allow", "GET"); return response.status(405).json({ error: "Method not allowed" }); }

  const roleKey = typeof request.query.role === "string" ? request.query.role : "all";
  const locationKey = typeof request.query.location === "string" ? request.query.location : "uae";
  if (!roles[roleKey] || !locations[locationKey]) return response.status(400).json({ error: "Select a valid healthcare role and UAE location." });
  const hasAnyProvider = Boolean(process.env.JSEARCH_API_KEY || process.env.JOOBLE_API_KEY);
  if (!hasAnyProvider) return response.status(503).json({ error: "The healthcare jobs service is not configured yet." });

  const cacheKey = `${CACHE_VERSION}:${roleKey}:${locationKey}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < CACHE_MS) return response.status(200).json({ ...cached.payload, cached: true, cacheAgeSeconds: Math.floor((Date.now() - cached.createdAt) / 1000) });

  try {
    const settled = await Promise.allSettled([fetchJSearchJobs(roleKey, locationKey), fetchJoobleJobs(roleKey, locationKey), fetchAdzunaJobs(roleKey, locationKey)]);
    const successful = settled.filter((item) => item.status === "fulfilled").map((item) => item.value);
    const configured = successful.filter((item) => item.configured);
    const failed = settled.filter((item) => item.status === "rejected");
    failed.forEach((item) => console.error("Healthcare jobs provider failed", item.reason?.message || item.reason));
    if (!configured.length && failed.length) {
      const rateLimited = failed.some((item) => /:429$/.test(item.reason?.message || ""));
      const joobleRegionalKey = failed.some((item) => /Jooble:403$/.test(item.reason?.message || ""));
      return response.status(rateLimited ? 429 : 502).json({
        jobs: [],
        staleFallbackUsed: false,
        error: joobleRegionalKey
          ? "Jooble now requires a UAE-specific API key for ae.jooble.org. Update JOOBLE_API_KEY with the UAE key."
          : rateLimited
            ? "Live job providers are temporarily rate-limited. No older jobs are being shown."
            : "Live jobs are temporarily unavailable. No stale jobs are being shown."
      });
    }

    const seen = new Set();
    const jobs = successful.flatMap((item) => item.jobs)
      .filter((job) => job.title && job.applyUrl)
      .filter((job) => isFreshJob(job))
      .filter((job) => isRelevantUaeJob(job, roleKey, locationKey))
      .filter((job) => { const key = dedupeKey(job) || job.id; if (seen.has(key)) return false; seen.add(key); return true; })
      .sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));

    const payload = {
      jobs, role: roleKey, location: locationKey, fetchedAt: new Date().toISOString(), staleFallbackUsed: false,
      freshnessPolicy: { maxAgeDays: MAX_JOB_AGE_DAYS, missingDatesExcluded: true, invalidDatesExcluded: true, staleCacheFallback: false },
      providers: successful.filter((item) => item.configured).map((item) => item.provider),
      providerErrors: failed.map((item) => safeText(item.reason?.message || "Provider error", 120)),
      partial: failed.length > 0,
      discoveryTerms: limitedSearchTerms(roleKey, Math.max(JSEARCH_MAX_TERMS, JOOBLE_MAX_TERMS)).length,
    };
    memoryCache.set(cacheKey, { payload, createdAt: Date.now() });
    return response.status(200).json(payload);
  } catch (error) {
    console.error("Healthcare job search failed", error?.message || error);
    return response.status(502).json({ jobs: [], staleFallbackUsed: false, error: "Live jobs are temporarily unavailable. No stale jobs are being shown." });
  }
}
