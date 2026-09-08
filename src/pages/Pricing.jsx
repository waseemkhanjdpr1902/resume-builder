import { FiCheck, FiLock, FiRefreshCw, FiShield, FiStar } from "react-icons/fi";
import { Link } from "react-router-dom";
import PaymentButton from "../components/PaymentButton";
import { subscriptionPlans } from "../static-data/subscription-plans";
import "../css/pricing.css";
import "../css/pricing-clarity.css";

function PlanCard({ plan }) {
  const actionClass = plan.featured ? "plan-action primary" : "plan-action";
  return <article className={`subscription-card ${plan.featured ? "featured" : ""}`}>
    {plan.featured ? <span className="popular-flag"><FiStar /> Most popular</span> : null}
    <span className={`plan-type ${plan.id === "free" ? "free" : "paid"}`}>{plan.id === "free" ? "FREE PLAN" : "PAID PLAN"}</span>
    <span className="plan-eyebrow">{plan.eyebrow}</span><h2>{plan.name}</h2><p className="plan-description">{plan.description}</p>
    <div className="plan-price"><strong>₹{plan.price}</strong><span>{plan.suffix}</span></div>
    {plan.href ? <Link className={actionClass} to={plan.href}>{plan.cta}</Link> : <PaymentButton className={actionClass} planId={plan.id}>{plan.cta}</PaymentButton>}
    <div className="plan-divider" /><h3>Included</h3><ul>{plan.features.map(feature => <li key={feature}><FiCheck /> {feature}</li>)}</ul>
  </article>;
}

export default function Pricing() {
  return <main className="pricing-page"><section className="pricing-hero"><span>SIMPLE, PREMIUM PRICING</span><h1>One free plan. Two powerful ways to advance your healthcare career.</h1><p>Start with the essentials, then unlock the complete AI career toolkit for six months or a full year. Every plan supports all healthcare professions and target countries.</p><div className="pricing-legend"><span><b>Free</b> Essential tools to get started</span><span><b>Premium</b> Unlimited tools during your access period</span></div></section>
    <section className="subscription-grid three-plans">{subscriptionPlans.map(plan => <PlanCard plan={plan} key={plan.id} />)}</section>
    <section className="pricing-clarity" aria-label="Plan selection guidance"><FiCheck /><p><strong>Our recommendation:</strong> Choose Career Pro for a focused job search. Choose Career Elite when you want a full year of premium access and leadership-focused guidance.</p></section>
    <p className="international-price-note">Launch prices are charged in INR. International customers can pay using supported cards; their bank or card network determines the converted amount and any foreign-exchange fee.</p>
    <section className="checkout-trust"><div><FiLock /><span><strong>Secure checkout</strong>Payments processed by Razorpay</span></div><div><FiShield /><span><strong>Verified before access</strong>Downloads unlock after signature verification</span></div><div><FiRefreshCw /><span><strong>Clear terms</strong><Link to="/refund-policy">Read refund and cancellation policy</Link></span></div></section>
  </main>;
}
