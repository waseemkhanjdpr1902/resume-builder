import { FiCheck, FiLock, FiRefreshCw, FiShield, FiStar } from "react-icons/fi";
import { Link } from "react-router-dom";
import PaymentButton from "../components/PaymentButton";
import { subscriptionPlans } from "../static-data/subscription-plans";
import "../css/pricing.css";

function PlanCard({ plan }) {
  const actionClass = plan.featured ? "plan-action primary" : "plan-action";
  return <article className={`subscription-card ${plan.featured ? "featured" : ""}`}>
    {plan.featured ? <span className="popular-flag"><FiStar /> Most popular</span> : null}
    <span className="plan-eyebrow">{plan.eyebrow}</span><h2>{plan.name}</h2><p className="plan-description">{plan.description}</p>
    <div className="plan-price"><strong>₹{plan.price}</strong><span>{plan.suffix}</span></div>
    {plan.href ? <Link className={actionClass} to={plan.href}>{plan.cta}</Link> : <PaymentButton className={actionClass} planId={plan.id}>{plan.cta}</PaymentButton>}
    <div className="plan-divider" /><h3>What you get</h3><ul>{plan.features.map(feature => <li key={feature}><FiCheck /> {feature}</li>)}</ul>
  </article>;
}

export default function Pricing() {
  return <main className="pricing-page"><section className="pricing-hero"><span>ONE FREE CV · PAY TO DOWNLOAD</span><h1>Build first. Pay only when your CV is ready.</h1><p>Create, edit and preview one complete professional CV at no cost. Choose access only when you want to download the finished ATS-friendly PDF.</p></section>
    <section className="subscription-grid four-plans">{subscriptionPlans.map(plan => <PlanCard plan={plan} key={plan.id} />)}</section>
    <section className="checkout-trust"><div><FiLock /><span><strong>Secure checkout</strong>Payments processed by Razorpay</span></div><div><FiShield /><span><strong>Verified before access</strong>Downloads unlock after signature verification</span></div><div><FiRefreshCw /><span><strong>Clear terms</strong><Link to="/refund-policy">Read refund and cancellation policy</Link></span></div></section>
    <section className="pricing-note"><div><span>BUILT FOR SERIOUS APPLICATIONS</span><h2>Different careers need different proof.</h2></div><p>Tech candidates need projects, stacks and measurable engineering impact. Medical professionals need licences, clinical competencies and patient-care outcomes. ResuAIBuilder guides each profession differently.</p></section>
  </main>;
}
