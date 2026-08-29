/* global process */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const out = { jooble: null, jsearch: null };
  try {
    if (process.env.JOOBLE_API_KEY) {
      const base = (process.env.JOOBLE_API_BASE_URL || 'https://jooble.org/api').replace(/\/+$/, '');
      const r = await fetch(`${base}/${encodeURIComponent(process.env.JOOBLE_API_KEY)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ keywords: 'nurse', location: 'Dubai', page: '1', ResultOnPage: '20', SearchMode: '1' }),
        signal: AbortSignal.timeout(12000),
      });
      const data = await r.json().catch(() => ({}));
      const jobs = Array.isArray(data.jobs) ? data.jobs : [];
      out.jooble = {
        status: r.status,
        count: jobs.length,
        samples: jobs.slice(0, 5).map(j => ({ title: j.title, location: j.location, updated: j.updated, company: j.company }))
      };
    }
  } catch (e) { out.jooble = { error: e?.message || String(e) }; }
  try {
    if (process.env.JSEARCH_API_KEY) {
      const url = new URL('https://api.openwebninja.com/jsearch/search-v2');
      url.searchParams.set('query', 'registered nurse jobs in Dubai');
      url.searchParams.set('country', 'ae');
      url.searchParams.set('language', 'en');
      url.searchParams.set('num_pages', '1');
      url.searchParams.set('date_posted', 'week');
      const r = await fetch(url, { headers: { 'x-api-key': process.env.JSEARCH_API_KEY, Accept: 'application/json' }, signal: AbortSignal.timeout(12000) });
      const data = await r.json().catch(() => ({}));
      const jobs = Array.isArray(data.data) ? data.data : Array.isArray(data.data?.jobs) ? data.data.jobs : [];
      out.jsearch = { status: r.status, count: jobs.length };
    }
  } catch (e) { out.jsearch = { error: e?.message || String(e) }; }
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(out);
}
