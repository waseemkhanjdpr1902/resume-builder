import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const siteUrl = "https://resume-builder-murex-five.vercel.app";
const defaultDescription = "Create an ATS-friendly healthcare CV with AI-assisted improvement, nursing and medical templates, job matching and secure PDF export.";
const pages = {
  "/": { title: "Healthcare CV Builder & ATS Resume Optimiser | ResuAIBuilder", description: defaultDescription },
  "/templates": { title: "Healthcare CV Templates for Nurses, Doctors & Allied Health", description: "Choose professional ATS-friendly healthcare CV templates designed for nurses, doctors, pharmacists and allied health professionals." },
  "/ats-checker": { title: "Healthcare ATS CV Checker & AI Resume Optimiser", description: "Upload your healthcare CV, check ATS readiness and create an improved, editable version using verified professional information." },
  "/healthcare-guide": { title: "Healthcare CV Guide by Role and Country | ResuAIBuilder", description: "Practical CV guidance for healthcare professionals applying in the UAE, UK, Saudi Arabia, Qatar, India and other global markets." },
  "/cover-letter": { title: "Healthcare Cover Letter Builder | ResuAIBuilder", description: "Create a tailored healthcare cover letter for nursing, medical, pharmacy and allied health roles." },
  "/pricing": { title: "Healthcare CV Builder Pricing | ResuAIBuilder", description: "Compare affordable ResuAIBuilder plans for healthcare CV creation, ATS analysis and professional document tools." },
  "/about": { title: "About Healthcare ResuAIBuilder", description: "Learn how ResuAIBuilder helps healthcare professionals create accurate, ATS-friendly CVs for global career opportunities." },
  "/contact": { title: "Contact ResuAIBuilder", description: "Contact the ResuAIBuilder team for support with your healthcare CV builder account and tools." },
  "/privacy": { title: "Privacy Policy | ResuAIBuilder", description: "Read how ResuAIBuilder handles account, CV and payment-related information." },
  "/refund-policy": { title: "Refund and Cancellation Policy | ResuAIBuilder", description: "Review ResuAIBuilder subscription, cancellation and refund terms." },
};
const privatePrefixes = ["/dashboard", "/login", "/build-resume", "/redirecting", "/get-started", "/ai-assistant"];

const setMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);
  if (!element) { element = document.createElement("meta"); document.head.appendChild(element); }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
};

export default function SEO() {
  const { pathname } = useLocation();
  useEffect(() => {
    const page = pages[pathname] || pages["/"];
    const isPrivate = privatePrefixes.some((prefix) => pathname.startsWith(prefix)) || !pages[pathname];
    const canonical = `${siteUrl}${pathname === "/" ? "" : pathname}`;
    document.title = page.title;
    setMeta('meta[name="description"]', { name: "description", content: page.description });
    setMeta('meta[name="robots"]', { name: "robots", content: isPrivate ? "noindex, nofollow" : "index, follow, max-image-preview:large" });
    setMeta('meta[property="og:title"]', { property: "og:title", content: page.title });
    setMeta('meta[property="og:description"]', { property: "og:description", content: page.description });
    setMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: page.title });
    setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: page.description });
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
    link.href = canonical;
  }, [pathname]);
  return null;
}
