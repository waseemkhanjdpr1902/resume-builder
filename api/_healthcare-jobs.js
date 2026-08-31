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
  dubai: "Dubai, United Arab Emirates",
  "abu-dhabi": "Abu Dhabi, United Arab Emirates",
  sharjah: "Sharjah, United Arab Emirates",
  ajman: "Ajman, United Arab Emirates",
  "al-ain": "Al Ain, United Arab Emirates",
  "ras-al-khaimah": "Ras Al Khaimah, United Arab Emirates",
  fujairah: "Fujairah, United Arab Emirates",
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
const CACHE_VERSION = "v17-serpapi-fallback";
const MAX_JOB_AGE_DAYS = 30;
const FUTURE_TOLERANCE_MS = 6 * 60 * 60 * 1000;
const JOOBLE_MAX_TERMS = 4;
const JSEARCH_MAX_TERMS = 1;
const PROVIDER_COOLDOWN_MS = 45 * 60 * 1000;
const SERPAPI_FALLBACK_THRESHOLD = 8;

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

const normalizeRelativeDate = (value) => {
  const text = safeText(value, 80).toLowerCase();
  if (!text) return "";
  const direct = normalizeDate(text);
  if (direct) return direct;
  if (/today|just posted|just now/.test(text)) return new Date().toISOString();
  const match = text.match(/(\d+)\s*(minute|hour|day|week|month)s?\s*ago/);
  if (!match) return "";
  const amount = Number(match[1]);
  const unitMs = { minute: 60000, hour: 3600000, day: 86400000, week: 604800000, month: 2592000000 };
  return new Date(Date.now() - amount * unitMs[match[2]]).toISOString();
};

const normalizeJoobleJob = (job) => {
  const postedAt = normalizeDate(job.updated);
  return {
    id: `jooble:${safeText(String(job.id || job.link || ""), 280)}`,
    provider: "Jooble",
    title: safeText(job.title, 180),
    employer: safeText(job.company, 140) || "Employer not listed",
    employerLogo: "",
    city: "",
    state: "",
    country: "",
    location: safeText(job.location, 160),
    employmentType: safeText(job.type, 60),
    description: safeText(job.snippet),
    applyUrl: safeUrl(job.link),
    publisher: safeText(job.source, 100) || "Jooble",
    postedAt,
    freshnessConfidence: postedAt ? "verified" : "unknown",
    minSalary: null,
    maxSalary: null,
    salaryPeriod: safeText(job.salary, 80),
  };
};

const normalizeJSearchJob = (job) => {
  const postedAt = normalizeDate(job.job_posted_at_datetime_utc);
  return {
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
    postedAt,
    freshnessConfidence: postedAt ? "verified" : "unknown",
    minSalary: Number.isFinite(job.job_min_salary) ? job.job_min_salary : null,
    maxSalary: Number.isFinite(job.job_max_salary) ? job.job_max_salary : null,
    salaryPeriod: safeText(job.job_salary_period, 30),
  };
};

const normalizeSerpApiJob = (job) => {
  const postedText = job.detected_extensions?.posted_at || (Array.isArray(job.extensions) ? job.extensions.find((item) => /ago|today|posted/i.test(item)) : "");
  const postedAt = normalizeRelativeDate(postedText);
  const applyUrl = safeUrl(job.apply_options?.[0]?.link || job.share_link || job.related_links?.[0]?.link);
  return {
    id: `serpapi:${safeText(job.job_id || applyUrl || `${job.title}:${job.company_name}`, 280)}`,
    provider: "SerpApi",
    title: safeText(job.title, 180),
    employer: safeText(job.company_name, 140) || "Employer not listed",
    employerLogo: safeUrl(job.thumbnail),
    city: "",
    state: "",
    country: "United Arab Emirates",
    location: safeText(job.location, 160),
    employmentType: safeText(job.detected_extensions?.schedule_type, 60),
    description: safeText(job.description),
    applyUrl,
    publisher: safeText(job.via, 100) || "Google Jobs",
    postedAt,
    freshnessConfidence: postedAt ? "verified" : "unknown",
    minSalary: null,
    maxSalary: null,
    salaryPeriod: "",
  };
};

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

async function fetchSerpApiJobs(roleKey, locationKey) {
  if (!process.env.SERPAPI_API_KEY) return { provider: "SerpApi", configured: false, jobs: [] };
  if (isCoolingDown("SerpApi")) return { provider: "SerpApi", configured: true, jobs: [], cooldown: true };
  const term = roleKey === "all" ? "healthcare" : roles[roleKey];
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_jobs");
  url.searchParams.set("q", `${term} jobs`);
  url.searchParams.set("location", locations[locationKey]);
  url.searchParams.set("hl", "en");
  url.searchParams.set("api_key", process.env.SERPAPI_API_KEY);
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(12000) });
    if (!response.ok) {
      if (response.status === 429 || response.status >= 500) setCooldown("SerpApi");
      throw new Error(`SerpApi:${response.status}`);
    }
    const data = await response.json();
    if (data.error) throw new Error(`SerpApi:${safeText(data.error, 120)}`);
    return { provider: "SerpApi", configured: true, jobs: (Array.isArray(data.jobs_results) ? data.jobs_results : []).map(normalizeSerpApiJob) };
  } catch (error) {
    throw error;
  }
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

const filterJobs = (allJobs, roleKey, locationKey) => {
  const usable = allJobs.filter((job) => job.title && job.applyUrl);
  const fresh = usable.filter(isFreshJob);
  const relevant = fresh.filter((job) => isRelevantUaeJob(job, roleKey, locationKey));
  return { usable, fresh, relevant };
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
  if (!roles[roleKey] || !locations[locationKey]) return res.status(400).json({ error: "Select a valid healthcare role and UAE location." });

  const hasAnyProvider = Boolean(process.env.JOOBLE_API_KEY || process.env.JSEARCH_API_KEY || process.env.SERPAPI_API_KEY);
  if (!hasAnyProvider) return res.status(503).json({ jobs: [], error: "The healthcare jobs service is not configured yet." });

  const cacheKey = `${CACHE_VERSION}:${roleKey}:${locationKey}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < CACHE_MS) {
    return res.status(200).json({ ...cached.payload, cached: true, cacheAgeSeconds: Math.floor((Date.now() - cached.createdAt) / 1000) });
  }

  const primarySettled = await Promise.allSettled([fetchJoobleJobs(roleKey, locationKey), fetchJSearchJobs(roleKey, locationKey)]);
  let successful = primarySettled.filter((item) => item.status === "fulfilled").map((item) => item.value);
  let failed = primarySettled.filter((item) => item.status === "rejected");
  let allJobs = successful.flatMap((item) => item.jobs || []);
  let filtered = filterJobs(allJobs, roleKey, locationKey);

  if (filtered.relevant.length < SERPAPI_FALLBACK_THRESHOLD && process.env.SERPAPI_API_KEY) {
    const serpSettled = await Promise.allSettled([fetchSerpApiJobs(roleKey, locationKey)]);
    successful = successful.concat(serpSettled.filter((item) => item.status === "fulfilled").map((item) => item.value));
    failed = failed.concat(serpSettled.filter((item) => item.status === "rejected"));
    allJobs = successful.flatMap((item) => item.jobs || []);
    filtered = filterJobs(allJobs, roleKey, locationKey);
  }

  const providerErrors = failed.map((item) => item.reason?.message || "Provider error");
  failed.forEach((item) => console.error("Healthcare jobs provider failed", item.reason?.message || item.reason));

  const seen = new Set();
  const jobs = filtered.relevant
    .filter((job) => {
      const key = dedupeKey(job) || job.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => (Date.parse(b.postedAt || "") || 0) - (Date.parse(a.postedAt || "") || 0))
    .slice(0, 100);

  const configured = successful.filter((item) => item.configured);
  const rawCounts = Object.fromEntries(successful.map((item) => [item.provider, item.jobs?.length || 0]));
  const activeProviders = configured.filter((item) => !item.cooldown).map((item) => item.provider);
  const cooldownProviders = configured.filter((item) => item.cooldown).map((item) => item.provider);

  if (!jobs.length && cached?.payload?.jobs?.length) {
    return res.status(200).json({ ...cached.payload, cached: true, staleFallbackUsed: true, providerErrors, cooldownProviders });
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
    filterCounts: { usable: filtered.usable.length, fresh: filtered.fresh.length, relevant: filtered.relevant.length },
    cooldownProviders,
    disabledProviders: [],
  };

  if (jobs.length) memoryCache.set(cacheKey, { createdAt: Date.now(), payload });
  return res.status(200).json(payload);
}
