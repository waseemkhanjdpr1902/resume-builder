import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { startPayment } from "../services/payments";
import "../css/paywall.css";

export default function PaymentButton({ planId, children, className = "", onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pay = async () => {
    setLoading(true); setError("");
    try { await startPayment(planId, onSuccess); } catch (paymentError) { setError(paymentError.message); } finally { setLoading(false); }
  };
  return <div className="payment-button-wrap"><button type="button" className={className} onClick={pay} disabled={loading}>{loading ? "Opening secure checkout…" : children} <FiArrowRight /></button>{error ? <p className="payment-error" role="alert">{error}</p> : null}</div>;
}
