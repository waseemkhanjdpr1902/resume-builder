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

const healthcareTitleTerms = /\b(nurs\w*|midwi\w*|doctor\w*|physician\w*|medical officer\w*|surgeon\w*|consultant\w*|specialist\w*|paediatric\w*|pediatric\w*|pharmac\w*|pharmacy\w*|dent\w*|orthodont\w*|physiotherap\w*|physical therap\w*|occupational therap\w*|speech therap\w*|radiograph\w*|radiolog\w*|sonograph\w*|imaging\w*|laborator\w*|lab techn\w*|patholog\w*|phlebotom\w*|medical cod\w*|clinical cod\w*|medical bill\w*|healthcare assistant\w*|health care assistant\w*|nursing assistant\w*|caregiver\w*|patient care assistant\w*|respiratory therap\w*|dietitian\w*|nutritionist\w*|optomet\w*|audiolog\w*|paramedic\w*|emergency medical technician\w*|hospital\w*|clinic\w*|medical receptionist\w*)\b/i;

const allRoleSearchTerms = ["nurse", "doctor", "pharmacist", "medical laboratory"];
const roleSearchTerms = {
  nurse: ["registered nurse", "staff nurse", "nurse"],
  doctor: ["doctor", "physician", "medical officer"],
  pharmacist: ["pharmacist", "pharmacy"],
  dentist: ["dentist", "dental"],
  physiotherapist: ["physiotherapist", "physical therapist"],
  laboratory: ["medical laboratory", "lab technician"],
  radiographer: ["radiographer", "radiology technician"],
  coder: ["medical coder", "medical billing"],
  assistant: ["healthcare assistant", "nursing assistant", "caregiver"],
};

const foreignCountry = /\b(oman|saudi arabia|qatar|bahrain|kuwait|united states|usa|united kingdom|uk|canada|australia|india|pakistan)\b/i;
const uaeLocation = /\b(united arab emirates|uae|dubai|abu dhabi|sharjah|ajman|al ain|ras al khaimah|fujairah|umm al quwain)\b/i;
const locationTerms = {
  dubai: /\bdubai\b/i,
  "abu-dhabi": /\babu dhabi\b/i,
  sharjah: /\bsharjah\b/i,
  ajman: /\bajman\b/i,
  "al-ain": /\bal ain\b/i,
  "ras-al-khaimah": /\bras al khaimah\b/i,
  fujairah: /\bfujairah\b/i,
};

const memoryCache = new Map();
const providerCooldowns = new Map();
const CACHE_MS = 30 * 60 * 1000;
const CACHE_VERSION = "v16-resilient-multiprovider";
const MAX_JOB_AGE_DAYS = 30;
const FUTURE_TOLERANCE_MS = 6 * 60 * 60 * 1000;
const JOOBLE_MAX_TERMS = 4;
const JSEARCH_MAX_TERMS = 1;
const PROVIDER_COOLDOWN_MS = 45 * 60 * 1000;

const safeText = (value, max = 5000) => typeof value === "string" ? value.trim().slice(0, max) : "";
const safeUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : "";
  } catch {
    return "";
  }
};

const normalizeDate = (value) => {
  const text = safeText(value, 80);
  if (!text) return "";
  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : "";
};

const normalizeJoobleJob = (job) => ({
  id: `jooble:${safeText(String(job.id || job.link || ""), 280)}`,
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
  postedAt: normalizeDate(job.updated),
  freshnessConfidence: normalizeDate(job.updated) ? "verified" : "unknown",
  minSalary: null,
  maxSalary: null,
  salaryPeriod: safeText(job.salary, 80),
});

const normalizeJSearchJob = (job) => ({
  id: `jsearch:${safeText(job.job_id || job.job_apply_link || "", 280)}`,
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
  publisher: safeText(job.job_publisher, 100) || "JSearch",
  postedAt: normalizeDate(job.job_posted_at_datetime_utc),
  freshnessConfidence: normalizeDate(job.job_posted_at_datetime_utc) ? "verified" : "unknown",
  minSalary: Number.isFinite(job.job_min_salary) ? job.job_min_salary : null,
  maxSalary: Number.isFinite(job.job_max_salary) ? job.job_max_salary : null,
  salaryPeriod: safeText(job.job_salary_period, 30),
});

const dedupeKey = (job) => [job.title, job.employer, job.location || job.city]
  .map((value) => safeText(value, 180).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim())
  .join(":");

const searchTermsForRole = (roleKey) => roleKey === "all" ? allRoleSearchTerms : (roleSearchTerms[roleKey] || [roles[roleKey]]);
const isCoolingDown = (provider) => (providerCooldowns.get(provider) || 0) > Date.now();
const setCooldown = (provider) => providerCooldowns.set(provider, Date.now() + PROVIDER_COOLDOWN_MS);

export const isFreshJob = (job, now = Date.now()) => {
  if (!job.postedAt) return true;
  const posted = Date.parse(job.postedAt);
  if (!Number.isFinite(posted)) return true;
  if (posted > now + FUTURE_TOLERANCE_MS) return false;
  return now - posted <= MAX_JOB_AGE_DAYS * 86400000;
};

async function fetchJoobleJobs(roleKey, locationKey) {
  if (!process.env.JOOBLE_API_KEY) return { provider: "Jooble", configured: false, jobs: [] };
  if (isCoolingDown("Jooble")) return { provider: "Jooble", configured: true, jobs: [], cooldown: true };

  const configuredBase = safeText(process.env.JOOBLE_API_BASE_URL, 300) || "https://jooble.org/api";
  const base = new URL(configuredBase);
  if (base.protocol !== "https:") throw new Error("Jooble:invalid-base-url");
  const endpoint = new URL(`${base.toString().replace(/\/+$/, "")}/${encodeURIComponent(process.env.JOOBLE_API_KEY)}`);
  const out = [];
  let lastError;

  for (const term of searchTermsForRole(roleKey).slice(0, JOOBLE_MAX_TERMS)) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: term, location: locations[locationKey], page: "1", ResultOnPage: "25", SearchMode: "1" }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) {
        if (response.status === 429 || response.status >= 500) setCooldown("Jooble");
        throw new Error(`Jooble:${response.status}`);
      }
      const data = await response.json();
      out.push(...(Array.isArray(data.jobs) ? data.jobs : []).map(normalizeJoobleJob));
    } catch (error) {
      lastError = error;
    }
  }

  if (!out.length && lastError) throw lastError;
  return { provider: "Jooble", configured: true, jobs: out };
}

async function fetchJSearchJobs(roleKey, locationKey) {
  if (!process.env.JSEARCH_API_KEY) return { provider: "JSearch", configured: false, jobs: [] };
  if (isCoolingDown("JSearch")) return { provider: "JSearch", configured: true, jobs: [], cooldown: true };

  const out = [];
  let lastError;
  for (const term of searchTermsForRole(roleKey).slice(0, JSEARCH_MAX_TERMS)) {
    try {
      const url = new URL("https://api.openwebninja.com/jsearch/search-v2");
      url.searchParams.set("query", `${term} jobs in ${locations[locationKey]}`);
      url.searchParams.set("country", "ae");
      url.searchParams.set("language", "en");
      url.searchParams.set("num_pages", "1");
      url.searchParams.set("date_posted", "month");
      const response = await fetch(url, {
        headers: { "x-api-key": process.env.JSEARCH_API_KEY, Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) {
        if (response.status === 429 || response.status >= 500) setCooldown("JSearch");
        throw new Error(`JSearch:${response.status}`);
      }
      const data = await response.json();
      const rawJobs = Array.isArray(data.data) ? data.data : Array.isArray(data.data?.jobs) ? data.data.jobs : [];
      out.push(...rawJobs.map(normalizeJSearchJob));
    } catch (error) {
      lastError = error;
    }
  }

  if (!out.length && lastError) throw lastError;
  return { provider: "JSearch", configured: true, jobs: out };
}

export const isRelevantUaeJob = (job, roleKey, locationKey) => {
  const place = [job.location, job.city, job.state, job.country].filter(Boolean).join(" ");
  const fullText = `${job.title} ${place} ${job.description || ""}`;
  if (place && foreignCountry.test(place) && !uaeLocation.test(place)) return false;
  if (locationKey !== "uae" && locationTerms[locationKey] && !locationTerms[locationKey].test(place)) return false;
  if (roleKey === "all" && !healthcareTitleTerms.test(job.title || "")) return false;
  if (roleKey !== "all" && roleTitleTerms[roleKey] && !roleTitleTerms[roleKey].test(fullText)) return false;
  return true;
};

export async function healthcareJobsHandler(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=86400");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const roleKey = typeof req.query.role === "string" ? req.query.role : "all";
  const locationKey = typeof req.query.location === "string" ? req.query.location : "uae";
  if (!roles[roleKey] || !locations[locationKey]) {
    return res.status(400).json({ error: "Select a valid healthcare role and UAE location." });
  }

  const hasAnyProvider = Boolean(process.env.JOOBLE_API_KEY || process.env.JSEARCH_API_KEY);
  if (!hasAnyProvider) {
    return res.status(503).json({ jobs: [], error: "The healthcare jobs service is not configured yet." });
  }

  const cacheKey = `${CACHE_VERSION}:${roleKey}:${locationKey}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < CACHE_MS) {
    return res.status(200).json({ ...cached.payload, cached: true, cacheAgeSeconds: Math.floor((Date.now() - cached.createdAt) / 1000) });
  }

  const settled = await Promise.allSettled([
    fetchJoobleJobs(roleKey, locationKey),
    fetchJSearchJobs(roleKey, locationKey),
  ]);

  const successful = settled.filter((item) => item.status === "fulfilled").map((item) => item.value);
  const failed = settled.filter((item) => item.status === "rejected");
  const providerErrors = failed.map((item) => item.reason?.message || "Provider error");
  failed.forEach((item) => console.error("Healthcare jobs provider failed", item.reason?.message || item.reason));

  const configured = successful.filter((item) => item.configured);
  const allJobs = successful.flatMap((item) => item.jobs || []);
  const usable = allJobs.filter((job) => job.title && job.applyUrl);
  const fresh = usable.filter(isFreshJob);
  const relevant = fresh.filter((job) => isRelevantUaeJob(job, roleKey, locationKey));

  const seen = new Set();
  const jobs = relevant
    .filter((job) => {
      const key = dedupeKey(job) || job.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const aDate = Date.parse(a.postedAt || "") || 0;
      const bDate = Date.parse(b.postedAt || "") || 0;
      return bDate - aDate;
    })
    .slice(0, 100);

  const rawCounts = Object.fromEntries(successful.map((item) => [item.provider, item.jobs?.length || 0]));
  const activeProviders = configured.filter((item) => !item.cooldown).map((item) => item.provider);
  const cooldownProviders = configured.filter((item) => item.cooldown).map((item) => item.provider);

  if (!jobs.length && cached?.payload?.jobs?.length) {
    return res.status(200).json({
      ...cached.payload,
      cached: true,
      staleFallbackUsed: true,
      providerErrors,
      cooldownProviders,
    });
  }

  const payload = {
    jobs,
    role: roleKey,
    location: locationKey,
    fetchedAt: new Date().toISOString(),
    freshnessPolicy: { maxAgeDays: MAX_JOB_AGE_DAYS, missingDatesExcluded: false },
    providers: activeProviders,
    providerErrors,
    partial: providerErrors.length > 0 || cooldownProviders.length > 0,
    rawCounts,
    filterCounts: { usable: usable.length, fresh: fresh.length, relevant: relevant.length },
    cooldownProviders,
    disabledProviders: [],
  };

  if (jobs.length) memoryCache.set(cacheKey, { createdAt: Date.now(), payload });
  return res.status(200).json(payload);
}
