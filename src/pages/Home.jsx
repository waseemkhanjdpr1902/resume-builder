import { Link } from "react-router-dom";
import { FiArrowRight, FiCheck, FiDownload, FiEdit3, FiFileText, FiShield } from "react-icons/fi";
import "../css/home.css";

const benefits = [
  { icon: FiFileText, title: "ATS-friendly templates", text: "Clean, recruiter-ready layouts designed to remain readable by applicant tracking systems." },
  { icon: FiEdit3, title: "Simple guided editor", text: "Build every section step by step, preview changes instantly, and keep your content organized." },
  { icon: FiDownload, title: "Instant PDF export", text: "Download a polished resume when you are ready and apply with confidence." },
];

const steps = ["Choose a professional template", "Add or import your career details", "Review, refine and download your PDF"];

export default function Home() {
  return (
    <main className="landing-page">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">SMARTER RESUMES. STRONGER APPLICATIONS.</span>
          <h1>Build an ATS-ready resume that gets you noticed.</h1>
          <p className="hero-lead">ResuAIBuilder helps you turn your experience into a clear, professional resume with guided editing, proven templates and instant PDF export.</p>
          <div className="hero-actions">
            <Link className="primary-action" to="/templates">Build my resume <FiArrowRight /></Link>
            <Link className="secondary-action" to="/templates">Explore templates</Link>
          </div>
          <div className="trust-row"><FiShield /> Your resume stays private and securely saved to your account.</div>
        </div>
        <div className="hero-preview" aria-label="Sample resume preview">
          <div className="preview-top"><span>RESUME PREVIEW</span><span className="preview-pill">ATS ready</span></div>
          <div className="preview-paper">
            <div className="preview-name">YOUR NAME</div><div className="preview-role">Customer Experience Leader</div><div className="preview-rule" />
            <div className="preview-grid"><div><b>PROFILE</b><i /><i /><i className="short" /><b>EXPERIENCE</b><i /><i /><i /><i className="short" /></div><div><b>SKILLS</b><i /><i className="short" /><b>EDUCATION</b><i /><i className="short" /></div></div>
          </div>
        </div>
      </section>
      <section className="benefit-section">
        <div className="section-heading"><span>EVERYTHING YOU NEED</span><h2>A better resume, without the formatting struggle</h2></div>
        <div className="benefit-grid">{benefits.map(({ icon: Icon, title, text }) => <article className="benefit-card" key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>
      <section className="steps-section"><div><span className="eyebrow">HOW IT WORKS</span><h2>From blank page to job-ready in three steps.</h2><p>No design skills needed. Focus on your story while ResuAIBuilder handles the presentation.</p></div><ol>{steps.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p><FiCheck /></li>)}</ol></section>
      <section className="final-cta"><div><span>READY TO APPLY?</span><h2>Your next opportunity deserves your best resume.</h2><p>Start free, choose a template, and build at your own pace.</p></div><Link className="light-action" to="/templates">Create my resume <FiArrowRight /></Link></section>
    </main>
  );
}
