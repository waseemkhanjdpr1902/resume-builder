import { Link } from "react-router-dom";
import { FiArrowRight, FiAward, FiBookOpen, FiBriefcase, FiCheckCircle, FiClipboard, FiGlobe, FiLock, FiShield, FiTarget, FiUsers } from "react-icons/fi";
import "../css/academy.css";

const paths = [
  { icon: FiUsers, label: "Registered Nursing", meta: "DHA · DOH · MOHAP", description: "Clinical safety, fundamentals, ethics and GCC licensing preparation.", href: "/academy/course/nursing-clinical-safety", tone: "teal" },
  { icon: FiBookOpen, label: "Pharmacist", meta: "DHA · DOH · MOHAP", description: "Pharmacotherapy, calculations, patient counselling and professional practice.", href: "/academy/course/healthcare-career-launch", tone: "blue" },
  { icon: FiClipboard, label: "Pharmacy Technician", meta: "GCC pathways", description: "Dispensing safety, inventory, calculations and technician responsibilities.", href: "/academy/course/gcc-licensing-foundations", tone: "gold" },
  { icon: FiGlobe, label: "Licensing Readiness", meta: "7 GCC pathways", description: "Documents, DataFlow preparation, regulator selection and eligibility guidance.", href: "/credential-readiness", tone: "violet" }
];

const modules = [
  { number: "01", title: "Understand your pathway", text: "Choose the right authority and check profession-specific document readiness.", action: "Check readiness", href: "/credential-readiness", free: true },
  { number: "02", title: "Build exam foundations", text: "Use structured profession-focused practice with answers and learning explanations.", action: "Open exam practice", href: "/licensing-exam-prep", free: true },
  { number: "03", title: "Practise interview answers", text: "Prepare clinical, behavioural and GCC healthcare interview responses with AI feedback.", action: "Start interview practice", href: "/practice-questions", free: false },
  { number: "04", title: "Prepare your application", text: "Check ATS alignment and strengthen your healthcare CV for the target role.", action: "Check your CV", href: "/ats-checker", free: false }
];

const resources = [
  ["Licensing starter guide", "A practical sequence for documents, verification, application and exam preparation.", "/healthcare-guide"],
  ["Healthcare interview laboratory", "Profession-specific questions, mock interviews and actionable feedback.", "/healthcare-interview-coach"],
  ["UAE healthcare jobs", "Explore current opportunities and connect learning with your target role.", "/uae-healthcare-jobs"]
];

export default function Academy() {
  return <main className="academy-page">
    <section className="academy-hero">
      <div className="academy-shell academy-hero-grid">
        <div>
          <span className="academy-kicker"><FiAward/> RESUAI ACADEMY</span>
          <h1>Prepare for licensing exams. Build your global healthcare career.</h1>
          <p>One guided learning space for healthcare professionals preparing for GCC licensing, profession-specific assessments, interviews and international applications.</p>
          <div className="academy-actions"><a href="#learning-paths" className="academy-primary">Explore learning paths <FiArrowRight/></a><Link to="/academy/my-learning" className="academy-secondary">My Learning</Link></div>
          <div className="academy-proof"><span><FiCheckCircle/> Profession-specific</span><span><FiCheckCircle/> Original learning content</span><span><FiCheckCircle/> Mobile friendly</span></div>
        </div>
        <aside className="academy-roadmap">
          <small>YOUR PREPARATION ROADMAP</small>
          <ol><li><b>1</b><span><strong>Choose</strong> profession and authority</span></li><li><b>2</b><span><strong>Learn</strong> core exam concepts</span></li><li><b>3</b><span><strong>Practise</strong> questions and interviews</span></li><li><b>4</b><span><strong>Apply</strong> with a stronger CV</span></li></ol>
          <Link to="/credential-readiness">Start with credential readiness <FiArrowRight/></Link>
        </aside>
      </div>
    </section>

    <section id="learning-paths" className="academy-section academy-shell">
      <header className="academy-section-head"><div><span>CHOOSE YOUR PATH</span><h2>Learning designed around your goal</h2></div><p>Start with the pathway closest to your profession. Each section connects licensing preparation with career action.</p></header>
      <div className="academy-path-grid">{paths.map(({icon:Icon,...path})=><Link className={`academy-path ${path.tone}`} to={path.href} key={path.label}><Icon/><small>{path.meta}</small><h3>{path.label}</h3><p>{path.description}</p><b>Explore pathway <FiArrowRight/></b></Link>)}</div>
    </section>

    <section className="academy-modules">
      <div className="academy-shell">
        <header className="academy-section-head"><div><span>STRUCTURED PROGRESS</span><h2>From uncertainty to a clear action plan</h2></div><p>Follow the sequence or enter at the step you need today.</p></header>
        <div className="academy-module-list">{modules.map(module=><article key={module.number}><b className="module-number">{module.number}</b><div><span className={module.free?"free-label":"premium-label"}>{module.free?<><FiCheckCircle/> Free access</>:<><FiLock/> Member tool</>}</span><h3>{module.title}</h3><p>{module.text}</p></div><Link to={module.href}>{module.action} <FiArrowRight/></Link></article>)}</div>
      </div>
    </section>

    <section className="academy-section academy-shell">
      <header className="academy-section-head"><div><span>CAREER LEARNING</span><h2>Turn preparation into employability</h2></div></header>
      <div className="academy-resource-grid">{resources.map(([title,text,href],index)=><article key={title}><span>{index===0?<FiShield/>:index===1?<FiTarget/>:<FiBriefcase/>}</span><h3>{title}</h3><p>{text}</p><Link to={href}>Open resource <FiArrowRight/></Link></article>)}</div>
    </section>

    <section className="academy-membership"><div className="academy-shell"><div><span>RESUAI ACADEMY MEMBERSHIP</span><h2>One platform for exam preparation and healthcare career growth.</h2><p>Current testing access lets you explore the available tools. Paid learning plans will only include content and features that are live and ready to use.</p></div><div className="membership-actions"><Link to="/pricing">View current plans <FiArrowRight/></Link><Link to="/login">Sign in</Link></div></div></section>

    <section className="academy-disclaimer academy-shell"><FiShield/><p><strong>Independent educational platform:</strong> ResuAI Academy is not affiliated with or endorsed by DHA, DOH, MOHAP, SCFHS, DHP, NHRA, OMSB, Prometric or Pearson VUE. Questions are original learning material—not recalled examination content. Always verify current requirements with the official authority.</p></section>
  </main>;
}
