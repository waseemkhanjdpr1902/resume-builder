/* global process */

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

const roleQueries = {
  all: "healthcare jobs",
  nurse: "nurse jobs",
  doctor: "doctor jobs",
  pharmacist: "pharmacist jobs",
  dentist: "dentist jobs",
  physiotherapist: "physiotherapist jobs",
  laboratory: "medical laboratory jobs",
  radiographer: "radiographer jobs",
  coder: "medical coder jobs",
  assistant: "healthcare assistant jobs",
};

const doctorSpecialtyTerms = /\b(internal medicine|family medicine|general medicine|emergency medicine|cardiolog\w*|dermatolog\w*|neurolog\w*|urolog\w*|oncolog\w*|gastroenterolog\w*|endocrinolog\w*|nephrolog\w*|pulmonolog\w*|rheumatolog\w*|hematolog\w*|haematolog\w*|psychiatr\w*|pediatric\w*|paediatric\w*|obstetric\w*|gynecolog\w*|gynaecolog\w*|anesthes\w*|anaesthes\w*|orthopedic\w*|orthopaedic\w*|ophthalmolog\w*|ent\b|otolaryngolog\w*|hospitalist\w*|intensivist\w*|radiologist\w*|pathologist\w*)\b/i;

const roleTitleTerms = {
  nurse: /\b(nurs\w*|midwi\w*|clinical facilitator)\b/i,
  doctor: /\b(doctor\w*|physician\w*|medical officer|surgeon\w*|pediatric\w*|paediatric\w*)\b/i,
  pharmacist: /\b(pharmacist\w*|pharmacy technician\w*|pharmacy assistant\w*)\b/i,
  dentist: /\b(dentist\w*|dental surgeon\w*|dental hygienist\w*|dental assistant\w*|orthodont\w*)\b/i,
  physiotherapist: /\b(physiotherap\w*|physical therap\w*)\b/i,
  laboratory: /\b(medical laboratory\w*|laboratory techn\w*|lab techn\w*|patholog\w*|phlebotom\w*)\b/i,
  radiographer: /\b(radiograph\w*|radiology techn\w*|radiologic techn\w*|sonograph\w*|medical imaging\w*)\b/i,
  coder: /\b(medical cod\w*|clinical cod\w*|medical bill\w*)\b/i,
  assistant: /\b(healthcare assistant\w*|health care assistant\w*|nursing assistant\w*|patient care assistant\w*|caregiver\w*)\b/i,
};

const healthcareTitleTerms = /\b(nurs\w*|midwi\w*|doctor\w*|physician\w*|medical officer|surgeon\w*|pharmacist\w*|pharmacy technician\w*|pharmacy assistant\w*|dentist\w*|dental surgeon\w*|dental hygienist\w*|dental assistant\w*|orthodont\w*|physiotherap\w*|physical therap\w*|occupational therap\w*|speech therap\w*|respiratory therap\w*|radiograph\w*|radiology techn\w*|radiologic techn\w*|sonograph\w*|medical imaging\w*|medical laboratory\w*|laboratory techn\w*|lab techn\w*|patholog\w*|phlebotom\w*|medical cod\w*|clinical cod\w*|medical bill\w*|healthcare assistant\w*|health care assistant\w*|nursing assistant\w*|patient care assistant\w*|caregiver\w*|dietitian\w*|nutritionist\w*|optometrist\w*|audiologist\w*|paramedic\w*|emergency medical technician\w*|medical receptionist\w*|medical secretary\w*|biomedical engineer\w*)\b/i;

const uaeTerms = /\b(united arab emirates|uae|dubai|abu dhabi|sharjah|ajman|al ain|ras al khaimah|fujairah|umm al quwain)\b/i;
const foreignTerms = /\b(saudi arabia|oman|qatar|bahrain|kuwait|india|pakistan|united kingdom|united states|canada|australia)\b/i;
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
const CACHE_MS = 15 * 60 * 1000;
const MAX_AGE_DAYS = 45;
const CACHE_VERSION = "v4-clinical-title-filter";

const clean = (value, max = 5000) => typeof value === "string" ? value.trim().slice(0, max) : "";
const safeUrl = (value) => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
};

function parsePosted(value) {
  const text = clean(value, 80).toLowerCase();
  if (!text) return "";
  const direct = Date.parse(text);
  if (Number.isFinite(direct)) return new Date(direct).toISOString();
  if (/today|just posted|just now/.test(text)) return new Date().toISOString();
  const match = text.match(/(\d+)\s*(minute|hour|day|week|month)s?\s*ago/);
  if (!match) return "";
  const units = { minute: 60000, hour: 3600000, day: 86400000, week: 604800000, month: 2592000000 };
  return new Date(Date.now() - Number(match[1]) * units[match[2]]).toISOString();
}

function normalizeSerp(job) {
  const postedText = job.detected_extensions?.posted_at || (Array.isArray(job.extensions) ? job.extensions.find(v => /ago|today|posted/i.test(v)) : "");
  const applyUrl = safeUrl(job.apply_options?.[0]?.link || job.share_link || job.related_links?.[0]?.link);
  return {
    id: `serp:${clean(job.job_id || applyUrl || `${job.title}-${job.company_name}`, 260)}`,
    provider: "SerpApi",
    title: clean(job.title, 180),
    employer: clean(job.company_name, 140) || "Employer not listed",
    location: clean(job.location, 160),
    city: "",
    state: "",
    country: "",
    description: clean(job.description),
    employmentType: clean(job.detected_extensions?.schedule_type, 60),
    postedAt: parsePosted(postedText),
    applyUrl,
    publisher: clean(job.via, 100) || "Google Jobs",
    employerLogo: safeUrl(job.thumbnail),
    minSalary: null,
    maxSalary: null,
    salaryPeriod: "",
  };
}

function normalizeJooble(job) {
  return {
    id: `jooble:${clean(String(job.id || job.link || ""), 260)}`,
    provider: "Jooble",
    title: clean(job.title, 180),
    employer: clean(job.company, 140) || "Employer not listed",
    location: clean(job.location, 160),
    city: "",
    state: "",
    country: "",
    description: clean(job.snippet),
    employmentType: clean(job.type, 60),
    postedAt: parsePosted(job.updated),
    applyUrl: safeUrl(job.link),
    publisher: clean(job.source, 100) || "Jooble",
    employerLogo: "",
    minSalary: null,
    maxSalary: null,
    salaryPeriod: clean(job.salary, 80),
  };
}

function isFresh(job) {
  if (!job.postedAt) return true;
  const ts = Date.parse(job.postedAt);
  return !Number.isFinite(ts) || Date.now() - ts <= MAX_AGE_DAYS * 86400000;
}

function hasDoctorTitle(title) {
  return roleTitleTerms.doctor.test(title) || doctorSpecialtyTerms.test(title);
}

function isRelevant(job, role, location) {
  const place = `${job.location || ""} ${job.city || ""} ${job.state || ""} ${job.country || ""}`;
  const title = job.title || "";
  if (place && foreignTerms.test(place) && !uaeTerms.test(place)) return false;
  if (location === "uae" && place && !uaeTerms.test(place)) return false;
  if (location !== "uae" && locationTerms[location] && !locationTerms[location].test(place)) return false;
  if (role === "all") return healthcareTitleTerms.test(title) || hasDoctorTitle(title);
  if (role === "doctor") return hasDoctorTitle(title);
  return roleTitleTerms[role] ? roleTitleTerms[role].test(title) : false;
}

function dedupe(jobs) {
  const seen = new Set();
  return jobs.filter(job => {
    const key = `${job.title}|${job.employer}|${job.location}`.toLowerCase().replace(/[^a-z0-9|]+/g, " ");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchSerpApi(role, location) {
  if (!process.env.SERPAPI_API_KEY) return { provider: "SerpApi", jobs: [], configured: false };

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_jobs");
  url.searchParams.set("q", roleQueries[role]);
  url.searchParams.set("location", locations[location]);
  url.searchParams.set("hl", "en");
  url.searchParams.set("api_key", process.env.SERPAPI_API_KEY);

  const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(12000) });
  const bodyText = await response.text();
  let data = {};
  try { data = bodyText ? JSON.parse(bodyText) : {}; } catch { data = {}; }

  if (!response.ok) {
    const providerMessage = clean(data.error || data.message || bodyText, 180);
    throw new Error(`SerpApi:${response.status}${providerMessage ? `:${providerMessage}` : ""}`);
  }
  if (data.error) throw new Error(`SerpApi:error:${clean(data.error, 180)}`);

  return {
    provider: "SerpApi",
    jobs: (Array.isArray(data.jobs_results) ? data.jobs_results : []).map(normalizeSerp),
    configured: true,
  };
}

async function fetchJooble(role, location) {
  if (!process.env.JOOBLE_API_KEY) return { provider: "Jooble", jobs: [], configured: false };
  const base = clean(process.env.JOOBLE_API_BASE_URL, 300) || "https://jooble.org/api";
  const endpoint = `${base.replace(/\/+$/, "")}/${encodeURIComponent(process.env.JOOBLE_API_KEY)}`;
  const queries = role === "all" ? ["nurse", "doctor", "pharmacist", "medical laboratory"] : [roleQueries[role].replace(/ jobs$/, "")];

  const requests = queries.map(async q => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ keywords: q, location: locations[location], page: "1", ResultOnPage: "25", SearchMode: "1" }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Jooble:${response.status}`);
    const data = await response.json();
    return (Array.isArray(data.jobs) ? data.jobs : []).map(normalizeJooble);
  });

  const settled = await Promise.allSettled(requests);
  const jobs = settled.filter(x => x.status === "fulfilled").flatMap(x => x.value);
  const failures = settled.filter(x => x.status === "rejected");
  if (!jobs.length && failures.length) throw failures[0].reason;
  return { provider: "Jooble", jobs, configured: true, partial: failures.length > 0 };
}

export async function healthcareJobsHandlerV2(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const role = typeof req.query.role === "string" && roleQueries[req.query.role] ? req.query.role : "all";
  const location = typeof req.query.location === "string" && locations[req.query.location] ? req.query.location : "uae";
  const cacheKey = `${CACHE_VERSION}:${role}:${location}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_MS) return res.status(200).json({ ...cached.payload, cached: true });

  const settled = await Promise.allSettled([fetchSerpApi(role, location), fetchJooble(role, location)]);
  const successes = settled.filter(x => x.status === "fulfilled").map(x => x.value);
  const errors = settled.filter(x => x.status === "rejected").map(x => x.reason?.message || "Provider error");
  errors.forEach(error => console.error("Healthcare jobs provider failed", error));

  const rawJobs = successes.flatMap(x => x.jobs || []);
  const usable = rawJobs.filter(job => job.title && job.applyUrl);
  const fresh = usable.filter(isFresh);
  const filtered = fresh.filter(job => isRelevant(job, role, location));
  const jobs = dedupe(filtered).sort((a, b) => (Date.parse(b.postedAt || "") || 0) - (Date.parse(a.postedAt || "") || 0)).slice(0, 100);

  const payload = {
    jobs,
    role,
    location,
    fetchedAt: new Date().toISOString(),
    providers: successes.filter(x => x.configured).map(x => x.provider),
    providerErrors: errors,
    partial: errors.length > 0 || successes.some(x => x.partial),
    rawCounts: Object.fromEntries(successes.map(x => [x.provider, x.jobs?.length || 0])),
    filterCounts: { raw: rawJobs.length, usable: usable.length, fresh: fresh.length, relevant: filtered.length, final: jobs.length },
    freshnessPolicy: { maxAgeDays: MAX_AGE_DAYS, missingDatesExcluded: false },
  };

  if (jobs.length) memoryCache.set(cacheKey, { at: Date.now(), payload });
  return res.status(200).json(payload);
}
