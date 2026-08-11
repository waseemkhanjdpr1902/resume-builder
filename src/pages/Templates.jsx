import { useDeferredValue, useMemo, useState } from "react";
import { FiArrowRight, FiCheck, FiSearch, FiShield, FiTarget, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import { careerTracks, professionalTemplates } from "../static-data/professional-templates";
import "../css/template-gallery.css";

const atsTone = { Excellent: "ats-excellent", Strong: "ats-strong" };

function TemplateCard({ template }) {
  return <article className="pro-template-card">
    <div className="template-visual">
      {template.featured ? <span className="recommended-badge">Recommended</span> : null}
      <img src={template.image} alt={`${template.name} professional resume template`} loading="lazy" />
      <Link className="template-overlay" to={`/build-resume/${template.layoutType}/${template.layoutId}`}>Use this template <FiArrowRight /></Link>
    </div>
    <div className="template-details">
      <div className="template-title-row"><div><span className="career-label">{template.track}</span><h2>{template.name}</h2></div><span className={`ats-badge ${atsTone[template.ats]}`}><FiShield /> ATS {template.ats}</span></div>
      <p>{template.description}</p>
      <div className="template-meta"><span>{template.format}</span><span>{template.level}</span></div>
      <div className="role-tags">{template.roles.map(role => <span key={role}>{role}</span>)}</div>
      <ul>{template.strengths.map(item => <li key={item}><FiCheck /> {item}</li>)}</ul>
      <Link className="use-template-button" to={`/build-resume/${template.layoutType}/${template.layoutId}`}>Build with {template.name} <FiArrowRight /></Link>
    </div>
  </article>;
}

export default function Templates() {
  const [track, setTrack] = useState("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const templates = useMemo(() => professionalTemplates.filter(template => {
    const matchesTrack = track === "all" || template.track === track;
    const searchable = `${template.name} ${template.roles.join(" ")} ${template.description}`.toLowerCase();
    return matchesTrack && (!deferredQuery || searchable.includes(deferredQuery));
  }), [track, deferredQuery]);

  return <main className="template-page">
    <section className="template-hero">
      <div><span className="template-eyebrow">PROFESSION-READY RESUMES</span><h1>Choose a template built for your career—not just your colour preference.</h1><p>Every recommended layout is reviewed for ATS readability, recruiter scanning and real-world professional use. Start with the right structure for Technology, Healthcare or Business roles.</p></div>
      <div className="ats-standard"><FiTarget /><div><strong>ResuAI ATS Standard</strong><span>Readable hierarchy · standard sections · parsing-safe typography</span></div></div>
    </section>

    <section className="template-controls" aria-label="Template filters">
      <div className="career-tabs" role="group" aria-label="Filter by career">
        {careerTracks.map(item => <button className={track === item.id ? "active" : ""} key={item.id} onClick={() => setTrack(item.id)}>{item.label}</button>)}
      </div>
      <label className="template-search"><FiSearch /><span className="sr-only">Search templates by role</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search: nurse, developer, product…" /></label>
    </section>

    <section className="template-results">
      <div className="result-heading"><div><span>{templates.length} CURATED OPTIONS</span><h2>{track === "all" ? "Professional templates" : `${careerTracks.find(item => item.id === track)?.label} templates`}</h2></div><p>Quality over quantity. Each template has a clear purpose.</p></div>
      <div className="professional-template-grid">{templates.map(template => <TemplateCard template={template} key={template.id} />)}</div>
      {templates.length === 0 ? <div className="empty-templates"><h2>No exact match found</h2><p>Try another role or browse all careers.</p><button onClick={() => { setTrack("all"); setQuery(""); }}>Show all templates</button></div> : null}
    </section>

    <section className="career-value-grid">
      <article><FiShield /><h3>ATS before aesthetics</h3><p>We prioritize readable text order, familiar headings and recruiter-friendly structure.</p></article>
      <article><FiUsers /><h3>Built around real roles</h3><p>Technical projects and clinical credentials need different emphasis. Your starting point reflects that.</p></article>
      <article><FiTarget /><h3>Impact-focused content</h3><p>The editor guides you toward outcomes, evidence and role-relevant information.</p></article>
    </section>
  </main>;
}
