import { useState } from "react";
import { FiArrowRight, FiCheck, FiLock, FiRefreshCw, FiShield, FiStar } from "react-icons/fi";
import { Link } from "react-router-dom";
import { subscriptionPlans } from "../static-data/subscription-plans";
import "../css/pricing.css";

const paymentUrl = "https://razorpay.me/@mohammedwaseem7570";
const formatPrice = value => new Intl.NumberFormat("en-IN").format(value);

function PlanCard({ plan, billing }) {
  const recurringPrice = billing === "yearly" ? plan.yearly : plan.monthly;
  const price = plan.oneTime ?? recurringPrice;
  const suffix = plan.oneTime ? "one-time" : billing === "yearly" ? "per year" : "per month";
  const actionClass = plan.featured ? "plan-action primary" : "plan-action";
  const action = plan.href
    ? <Link className={actionClass} to={plan.href}>{plan.cta} <FiArrowRight /></Link>
    : <a className={actionClass} href={`${paymentUrl}?description=${encodeURIComponent(`${plan.name} - ${suffix}`)}`} target="_blank" rel="noreferrer">{plan.cta} <FiArrowRight /></a>;
  return <article className={`subscription-card ${plan.featured ? "featured" : ""}`}>
    {plan.featured ? <span className="popular-flag"><FiStar /> Most popular</span> : null}
    <span className="plan-eyebrow">{plan.eyebrow}</span><h2>{plan.name}</h2><p className="plan-description">{plan.description}</p>
    <div className="plan-price"><strong>₹{formatPrice(price)}</strong><span>{price === 0 ? "forever" : suffix}</span></div>
    {plan.id === "pro" && billing === "yearly" ? <div className="saving-note">Save ₹1,989 each year</div> : null}
    {action}
    <div className="plan-divider" /><h3>What you get</h3><ul>{plan.features.map(feature => <li key={feature}><FiCheck /> {feature}</li>)}</ul>
  </article>;
}

export default function Pricing() {
  const [billing, setBilling] = useState("yearly");
  return <main className="pricing-page">
    <section className="pricing-hero"><span>PLANS FOR EVERY CAREER MOVE</span><h1>Invest in a resume that represents your real value.</h1><p>Start free, upgrade for intelligent application tools, or combine AI speed with a professional human review.</p>
      <div className="billing-toggle" role="group" aria-label="Billing period"><button className={billing === "monthly" ? "active" : ""} onClick={() => setBilling("monthly")}>Monthly</button><button className={billing === "yearly" ? "active" : ""} onClick={() => setBilling("yearly")}>Yearly <em>Save 33%</em></button></div>
    </section>
    <section className="subscription-grid">{subscriptionPlans.map(plan => <PlanCard plan={plan} billing={billing} key={plan.id} />)}</section>
    <section className="checkout-trust"><div><FiLock /><span><strong>Secure checkout</strong>Payments processed by Razorpay</span></div><div><FiShield /><span><strong>Your data stays private</strong>We never sell resume information</span></div><div><FiRefreshCw /><span><strong>Flexible access</strong>Upgrade when your career needs it</span></div></section>
    <section className="pricing-note"><div><span>BUILT FOR SERIOUS APPLICATIONS</span><h2>Different careers need different proof.</h2></div><p>Tech candidates need projects, stacks and measurable engineering impact. Medical professionals need licences, clinical competencies and patient-care outcomes. Career Pro is being built to guide each profession differently.</p></section>
  </main>;
}
