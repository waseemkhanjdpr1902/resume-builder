import fs from "node:fs/promises";
import path from "node:path";
import { healthcareSeoPages } from "../src/data/healthcareSeoPages.js";

const root = process.cwd();
const dist = path.join(root, "dist");
const siteUrl = "https://www.resuaibuilder.com";

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#39;");

const metadata = {
  "/": ["Healthcare CV Builder & ATS Resume Optimiser | ResuAIBuilder", "Create an ATS-friendly healthcare CV with AI-assisted improvement, nursing and medical templates, job matching and secure PDF export."],
  "/templates": ["Healthcare CV Templates for Nurses, Doctors & Allied Health", "Choose professional ATS-friendly healthcare CV templates for nurses, doctors, pharmacists and allied health professionals."],
  "/ats-checker": ["Healthcare ATS CV Checker & AI Resume Optimiser", "Upload your healthcare CV, check ATS readiness and create an improved editable version using verified professional information."],
  "/uae-healthcare-jobs": ["UAE Healthcare Jobs for Nurses, Doctors & Allied Health", "Search current UAE healthcare opportunities and tailor your healthcare CV before applying on the original job website."],
  "/healthcare-guide": ["Healthcare CV Guide by Role and Country | ResuAIBuilder", "Practical CV guidance for healthcare professionals applying in the UAE, UK, Saudi Arabia, Qatar, India and global markets."],
  "/healthcare-cv-examples": ["20 Healthcare CV Examples by Role & Country | ResuAIBuilder", "Explore practical CV structures for nurses, doctors, pharmacists, allied health and healthcare leaders."],
  "/gcc-eligibility-checker": ["Free GCC Healthcare Eligibility Checklist | ResuAIBuilder", "Prepare healthcare licensing documents for UAE, Saudi Arabia, Qatar, Oman and Bahrain with an informational checklist."],
  "/healthcare-interview-questions": ["Healthcare Interview Questions with Answer Frameworks", "Practise nursing, doctor, pharmacy, allied health, clinical, HR and GCC healthcare interview questions."],
  "/healthcare-salary-explorer": ["Healthcare Salary Explorer – India & GCC", "Review indicative salary ranges for nurses, doctors, pharmacists and allied health professionals in India and GCC markets."],
  "/career-readiness-score": ["Free Healthcare Career Readiness Score", "Check CV, licensing, job matching and interview preparation readiness with a privacy-safe score."],
  "/licensing-exam-prep": ["DHA, DOH & GCC Healthcare Exam Practice | ResuAIBuilder", "Practise healthcare licensing-style questions for DHA, DOH, MOHAP, SCFHS, DHP and other GCC pathways."],
  "/credential-readiness": ["Healthcare Credential Readiness Checker | ResuAIBuilder", "Organise professional registration, verification, licensing and job-application readiness for healthcare careers."],
};

const fallbackContent = {
  "/": ["Healthcare CV Builder for Global Careers", "ResuAIBuilder helps nurses, doctors, pharmacists and allied health professionals create accurate ATS-friendly CVs, assess application readiness and prepare for healthcare jobs."],
  "/templates": ["Healthcare CV templates", "Choose a simple, readable CV structure designed around healthcare credentials, clinical experience and verified achievements."],
  "/ats-checker": ["Healthcare ATS CV checker", "Review structure, role terminology, credential visibility and evidence quality. An ATS score is guidance and does not guarantee an interview."],
  "/uae-healthcare-jobs": ["UAE healthcare jobs", "Find opportunities for nurses, doctors, pharmacists and allied health professionals and apply through the original employer or job source."],
  "/healthcare-guide": ["Healthcare CV guide", "Learn how to present registration, clinical scope, competencies and achievements for healthcare applications in India, the GCC and international markets."],
  "/healthcare-cv-examples": ["Healthcare CV examples", "Use role-specific examples as writing patterns, then replace every detail with facts from your own experience."],
  "/gcc-eligibility-checker": ["GCC healthcare eligibility checklist", "Organise documents and licensing steps for GCC applications. Confirm current rules with the relevant official regulator."],
  "/healthcare-interview-questions": ["Healthcare interview questions", "Practise structured, evidence-based answers for clinical, behavioural and patient-safety questions."],
  "/healthcare-salary-explorer": ["Healthcare salary explorer", "Review indicative ranges and compare them with current vacancies, location, specialty, experience and employer benefits."],
  "/career-readiness-score": ["Healthcare career readiness score", "Review CV, credential, job-search and interview readiness without treating a score as a hiring guarantee."],
  "/licensing-exam-prep": ["GCC healthcare licensing exam practice", "Practise original licensing-style questions by profession and use official regulator material to confirm current requirements."],
  "/credential-readiness": ["Healthcare credential readiness", "Track registration, primary-source verification, licensing and application documents with accurate status wording."],
};

for (const [route, data] of Object.entries(healthcareSeoPages)) {
  metadata[route] = [data.title.replace(/\.$/, "") + " | ResuAIBuilder", data.intro];
}

const makeContent = (route) => {
  const data = healthcareSeoPages[route];
  if (!data) {
    const [heading, copy] = fallbackContent[route];
    return `<main id="seo-content"><article><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(copy)}</p><p>ResuAIBuilder is an independent career tool. Verify credentials, licensing rules and application claims before use.</p></article></main>`;
  }
  const sections = data.sections.map(({ title, text }) => `<section><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p></section>`).join("");
  const faqs = data.faqs.map(([question, answer]) => `<section><h2>${escapeHtml(question)}</h2><p>${escapeHtml(answer)}</p></section>`).join("");
  return `<main id="seo-content"><article><p>${escapeHtml(data.eyebrow)}</p><h1>${escapeHtml(data.title)}</h1><p>${escapeHtml(data.intro)}</p><p>${escapeHtml(data.audience)}</p>${sections}<section><h2>${escapeHtml(data.exampleTitle)}</h2><p>${escapeHtml(data.example)}</p></section><section aria-label="Frequently asked questions"><h2>Frequently asked questions</h2>${faqs}</section><p>ResuAIBuilder is an independent career tool. Verify all credentials, licence information and AI-assisted wording before use.</p></article></main>`;
};

const makeSchema = (route, title, description) => {
  const data = healthcareSeoPages[route];
  const graph = [
    { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: "ResuAIBuilder", url: `${siteUrl}/` },
    { "@type": "WebSite", "@id": `${siteUrl}/#website`, name: "ResuAIBuilder", url: `${siteUrl}/`, publisher: { "@id": `${siteUrl}/#organization` } },
    { "@type": route === "/" ? "WebApplication" : "WebPage", "@id": `${siteUrl}${route === "/" ? "/" : route}#page`, name: title, description, url: `${siteUrl}${route === "/" ? "/" : route}`, isPartOf: { "@id": `${siteUrl}/#website` }, publisher: { "@id": `${siteUrl}/#organization` } },
  ];
  if (data?.faqs?.length) graph.push({ "@type": "FAQPage", mainEntity: data.faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) });
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replaceAll("<", "\\u003c");
};

const template = await fs.readFile(path.join(dist, "index.html"), "utf8");
for (const [route, [title, description]] of Object.entries(metadata)) {
  const canonical = `${siteUrl}${route === "/" ? "/" : route}`;
  let html = template
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`)
    .replace(/<script type="application\/ld\+json">.*?<\/script>/s, `<script type="application/ld+json">${makeSchema(route, title, description)}</script>`)
    .replace(/<body>[\s\S]*?<\/body>/, `<body><div id="root">${makeContent(route)}</div></body>`);
  const target = route === "/" ? path.join(dist, "index.html") : path.join(dist, route.slice(1), "index.html");
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, html);
}

console.log(`Generated crawlable HTML for ${Object.keys(metadata).length} public routes.`);
