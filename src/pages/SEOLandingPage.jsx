import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { seoLandingPages } from "../data/seoLandingPages";
import "../css/seo-landing.css";

export default function SEOLandingPage(){
  const { pathname }=useLocation(); const page=seoLandingPages[pathname];
  useEffect(()=>{if(!page)return;const script=document.createElement("script");script.type="application/ld+json";script.dataset.seoFaq="true";script.text=JSON.stringify({"@context":"https://schema.org","@type":"FAQPage",mainEntity:page.faqs.map(([name,text])=>({"@type":"Question",name,acceptedAnswer:{"@type":"Answer",text}}))});document.head.appendChild(script);return()=>script.remove()},[page]);
  if(!page)return null;
  return <main className="seo-landing"><section className="seo-hero"><span>{page.label}</span><h1>{page.title}</h1><p>{page.intro}</p><div><Link to="/get-started">Build my free CV <FiArrowRight/></Link><Link className="secondary" to="/ats-checker">Check my current CV</Link></div><small>One complete PDF download is free after sign-in.</small></section>
  <section className="seo-content"><p className="audience"><strong>Designed for:</strong> {page.audience}.</p>{page.sections.map(([heading,items])=><article key={heading}><h2>{heading}</h2><ul>{items.map(item=><li key={item}><FiCheckCircle/><span>{item}</span></li>)}</ul></article>)}</section>
  <section className="seo-faq"><span>COMMON QUESTIONS</span><h2>Frequently asked questions</h2>{page.faqs.map(([question,answer])=><details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>
  <section className="seo-links"><h2>Continue with ResuAIBuilder</h2><div><Link to="/templates">Healthcare CV templates</Link><Link to="/healthcare-guide">Role and country CV guide</Link><Link to="/cover-letter">Healthcare cover letter</Link><Link to="/pricing">Plans and free download</Link></div><p>Always verify qualifications, registrations, dates and clinical claims before using a CV.</p></section></main>
}
