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

const memoryCache = new Map();
const CACHE_MS = 6 * 60 * 60 * 1000;

const safeText = (value, max = 5000) => typeof value === "string" ? value.trim().slice(0, max) : "";
const safeUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : "";
  } catch { return ""; }
};

const normalizeJob = (job) => ({
  id: safeText(job.job_id, 300),
  title: safeText(job.job_title, 180),
  employer: safeText(job.employer_name, 140) || "Employer not listed",
  employerLogo: safeUrl(job.employer_logo),
  city: safeText(job.job_city, 80),
  state: safeText(job.job_state, 80),
  country: safeText(job.job_country, 80),
  location: safeText(job.job_location, 160),
  employmentType: safeText(job.job_employment_type, 60),
  description: safeText(job.job_description),
  applyUrl: safeUrl(job.job_apply_link),
  publisher: safeText(job.job_publisher, 100),
  postedAt: safeText(job.job_posted_at_datetime_utc, 60),
  minSalary: Number.isFinite(job.job_min_salary) ? job.job_min_salary : null,
  maxSalary: Number.isFinite(job.job_max_salary) ? job.job_max_salary : null,
  salaryPeriod: safeText(job.job_salary_period, 30),
});

export async function healthcareJobsHandler(request, response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Cache-Control", "public, s-maxage=21600, stale-while-revalidate=86400");
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const roleKey = typeof request.query.role === "string" ? request.query.role : "all";
  const locationKey = typeof request.query.location === "string" ? request.query.location : "uae";
  if (!roles[roleKey] || !locations[locationKey]) {
    return response.status(400).json({ error: "Select a valid healthcare role and UAE location." });
  }
  if (!process.env.JSEARCH_API_KEY) {
    return response.status(503).json({ error: "The healthcare jobs service is not configured yet." });
  }

  const cacheKey = `${roleKey}:${locationKey}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < CACHE_MS) {
    return response.status(200).json({ ...cached.payload, cached: true });
  }

  try {
    const url = new URL("https://api.openwebninja.com/jsearch/search-v2");
    url.searchParams.set("query", `${roles[roleKey]} jobs in ${locations[locationKey]}`);
    url.searchParams.set("country", "ae");
    url.searchParams.set("language", "en");
    url.searchParams.set("num_pages", "1");

    const apiResponse = await fetch(url, {
      headers: { "x-api-key": process.env.JSEARCH_API_KEY, Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!apiResponse.ok) {
      console.error("JSearch response", apiResponse.status);
      return response.status(apiResponse.status === 429 ? 429 : 502).json({
        error: apiResponse.status === 429 ? "The job search limit has been reached. Please try again later." : "Live jobs are temporarily unavailable.",
      });
    }

    const result = await apiResponse.json();
    const seen = new Set();
    const jobs = (Array.isArray(result.data) ? result.data : [])
      .map(normalizeJob)
      .filter((job) => job.title && job.applyUrl)
      .filter((job) => {
        const key = job.id || `${job.title}:${job.employer}:${job.location}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    const payload = { jobs, role: roleKey, location: locationKey, fetchedAt: new Date().toISOString() };
    memoryCache.set(cacheKey, { payload, createdAt: Date.now() });
    return response.status(200).json(payload);
  } catch (error) {
    console.error("Healthcare job search failed", error?.message || error);
    return response.status(502).json({ error: "Live jobs are temporarily unavailable. Please try again shortly." });
  }
}
