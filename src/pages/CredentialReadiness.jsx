import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiAlertTriangle, FiArrowRight, FiCheck, FiCheckCircle, FiFileText, FiGlobe, FiLock, FiShield, FiTarget } from "react-icons/fi";
import { calculateReadiness, credentialOptions, destinations, professions } from "../data/credentialReadiness";
import { hasDownloadAccess } from "../services/payments";
import "../css/credential-readiness.css";

const FREE_USE_KEY = "resuai_credential_readiness_used";

export default function CredentialReadiness() {
  const [profession, setProfession] = useState("Nurse");
  const [destination, setDestination] = useState("UAE");
  const [experienceYears, setExperienceYears] = useState(2);
  const [credentials, setCredentials] = useState([]);
  const [report, setReport] = useState(null);
  const [premium, setPremium] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [freeUsed, setFreeUsed] = useState(() => localStorage.getItem(FREE_USE_KEY) === "1");
  const [freeReportVisible, setFreeReportVisible] = useState(false);

  useEffect(() => {
    hasDownloadAccess().then(setPremium).finally(() => setCheckingAccess(false));
  }, []);

  const country = destinations[destination];
  const selectedCount = credentials.length;
  const locked = freeUsed && !premium;
  const reportLocked = locked && !freeReportVisible;
  const previewScore = useMemo(() => calculateReadiness({ profession, destination, experienceYears, credentials }).score, [profession, destination, experienceYears, credentials]);

  const toggleCredential = id => setCredentials(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const generateReport = () => {
    const nextReport = calculateReadiness({ profession, destination, experienceYears, credentials });
    setReport(nextReport);
    setFreeReportVisible(!locked);
    if (!premium) {
      localStorage.setItem(FREE_USE_KEY, "1");
      setFreeUsed(true);
    }
    requestAnimationFrame(() => document.getElementById("readiness-report")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return <main className="credential-page">
    <section className="credential-hero">
      <div><span>GLOBAL HEALTHCARE CAREER TOOL</span><h1>Credential & Country Readiness Engine</h1><p>See what is ready, what may be missing and what to verify before applying for an international healthcare role.</p><div className="credential-trust"><span><FiShield/> Evidence-led</span><span><FiGlobe/> 9 destinations</span><span><FiCheckCircle/> One free full report</span></div></div>
      <aside><span>LIVE READINESS PREVIEW</span><strong>{previewScore}</strong><small>/100 based on your current selections</small><i><b style={{ width: `${previewScore}%` }}/></i></aside>
    </section>

    <section className="credential-builder">
      <div className="credential-form">
        <header><span>01</span><div><h2>Build your readiness profile</h2><p>No CV upload required. Select only evidence you currently have.</p></div></header>
        <div className="profile-fields"><label>Healthcare profession<select value={profession} onChange={event => setProfession(event.target.value)}>{professions.map(item => <option key={item}>{item}</option>)}</select></label><label>Destination country<select value={destination} onChange={event => setDestination(event.target.value)}>{Object.keys(destinations).map(item => <option key={item}>{item}</option>)}</select></label><label>Completed experience (years)<input type="number" min="0" max="50" value={experienceYears} onChange={event => setExperienceYears(event.target.value)}/></label></div>
        <div className="country-snapshot"><FiGlobe/><div><span>LIKELY REGULATORY ROUTE</span><strong>{country.regulator}</strong><p>{country.verification}</p></div></div>
        <fieldset><legend>Which documents or milestones do you already have?</legend><div className="credential-checklist">{credentialOptions.map(item => <label key={item.id} className={credentials.includes(item.id) ? "selected" : ""}><input type="checkbox" checked={credentials.includes(item.id)} onChange={() => toggleCredential(item.id)}/><span><FiCheck/><strong>{item.label}</strong>{item.essential ? <small>Core evidence</small> : null}</span></label>)}</div></fieldset>
        <button className="generate-readiness" onClick={generateReport} disabled={checkingAccess}><FiTarget/>{checkingAccess ? "Checking access..." : locked ? "Preview updated score" : "Generate my readiness report"}</button>
        <p className="use-note">{premium ? "Premium access: unlimited destination assessments." : freeUsed ? "Your free complete assessment has been used. You can still update the preview score." : `${selectedCount} of ${credentialOptions.length} readiness items selected.`}</p>
      </div>

      <aside className="readiness-guide"><span>WHAT YOU WILL RECEIVE</span><h2>A practical country action plan</h2><div><FiTarget/><p><strong>Readiness score</strong><small>Weighted around essential evidence and experience.</small></p></div><div><FiAlertTriangle/><p><strong>Priority blockers</strong><small>See the missing items most likely to delay your application.</small></p></div><div><FiFileText/><p><strong>Document checklist</strong><small>Prepare evidence before licensing or employer review.</small></p></div><div><FiGlobe/><p><strong>Destination guidance</strong><small>CV format, regulatory route and suggested next steps.</small></p></div><p className="regulator-note"><FiShield/> Requirements change. This tool provides preparation guidance and does not replace an official regulator assessment.</p></aside>
    </section>

    {report ? <section id="readiness-report" className="readiness-report">
      <header><div><span>YOUR READINESS REPORT</span><h2>{profession} → {destination}</h2><p>{report.status}. Prioritise verified evidence before submitting applications.</p></div><div className={`report-score score-${report.score >= 80 ? "high" : report.score >= 55 ? "medium" : "low"}`}><strong>{report.score}</strong><small>/100</small></div></header>
      {reportLocked ? <div className="report-paywall"><FiLock/><h3>Your updated score is {report.score}/100</h3><p>Upgrade to unlock repeat country reports, the complete blocker analysis and unlimited destination comparisons.</p><Link to="/pricing">Unlock complete report <FiArrowRight/></Link></div> : <ReportDetails report={report}/>} 
    </section> : null}
  </main>;
}

function ReportDetails({ report }) {
  return <div className="report-grid">
    <article className="priority-card"><span>START HERE</span><h3>{report.blockers.length ? "Resolve these core blockers" : "Core evidence looks prepared"}</h3>{report.blockers.length ? <ul>{report.blockers.map(item => <li key={item}><FiAlertTriangle/>{item}</li>)}</ul> : <p><FiCheckCircle/> No essential evidence gaps were selected. Verify validity and destination-specific acceptance.</p>}</article>
    <article><span>REGULATORY ROUTE</span><h3>{report.country.regulator}</h3><p>{report.country.verification}</p><small>Language: {report.country.language}</small></article>
    <article><span>DESTINATION CV</span><h3>{report.country.cv}</h3><p>Show registration status, specialty, recent clinical scope and measurable outcomes without including patient-identifiable information.</p><Link to="/ats-checker">Prepare my healthcare CV <FiArrowRight/></Link></article>
    <article><span>ROLE PRIORITIES</span><h3>Evidence recruiters may look for</h3><ul>{report.priorities.map(item => <li key={item}><FiCheck/>{item}</li>)}</ul></article>
    <article><span>NEXT STEPS</span><h3>Your suggested sequence</h3><ol>{report.country.steps.map(item => <li key={item}>{item}</li>)}</ol></article>
    <article><span>DOCUMENT STATUS</span><h3>{report.completed.length} ready · {report.missing.length} to review</h3><ul>{report.missing.slice(0, 5).map(item => <li key={item.id}><FiAlertTriangle/>{item.label}</li>)}</ul></article>
  </div>;
}
