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
  return <main className="pricing-page"><section className="pricing-hero"><span>AI-POWERED · SELF-SERVICE · NO HUMAN REVIEW</span><h1>Choose an AI career plan for your experience level.</h1><p>Start free, then unlock automated CV improvement, job matching, cover letters and interview practice designed around your healthcare career stage.</p><div className="automation-notice"><FiShield/><span><strong>Transparent AI service</strong>Every paid plan is delivered automatically through the platform. It does not include a human writer, recruiter consultation or guaranteed employment outcome.</span></div></section>
    <section className="subscription-grid four-plans">{subscriptionPlans.map(plan => <PlanCard plan={plan} key={plan.id} />)}</section>
    <p className="international-price-note">Launch prices are charged in INR. International customers can pay using supported cards; their bank or card network determines the converted amount and any foreign-exchange fee.</p>
    <section className="checkout-trust"><div><FiLock /><span><strong>Secure checkout</strong>Payments processed by Razorpay</span></div><div><FiShield /><span><strong>Verified before access</strong>Downloads unlock after signature verification</span></div><div><FiRefreshCw /><span><strong>Clear terms</strong><Link to="/refund-policy">Read refund and cancellation policy</Link></span></div></section>
    <section className="pricing-note"><div><span>ONE PLATFORM · DIFFERENT CAREER STAGES</span><h2>Your experience changes what your CV must prove.</h2></div><p>Early-career candidates need credible placements and transferable evidence. Experienced professionals need specialty achievements. Healthcare leaders need measurable quality, governance, operations and people impact.</p></section>
  </main>;
}
