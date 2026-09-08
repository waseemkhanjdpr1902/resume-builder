import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// A GA4 measurement ID is public. Keep the Vercel variable configurable while
// ensuring production analytics cannot silently compile to an empty value.
const measurementId = String(import.meta.env.VITE_GA_MEASUREMENT_ID || "G-W4HNT86SGN").trim();

export default function Analytics() {
  const location = useLocation();
  const [consent, setConsent] = useState(() => localStorage.getItem("resuai_analytics_consent"));

  useEffect(() => {
    if (!measurementId || !/^G-[A-Z0-9]+$/i.test(measurementId)) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
    if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      script.dataset.resuaiAnalytics = "true";
      document.head.appendChild(script);
      window.gtag("js", new Date());
      window.gtag("config", measurementId, { send_page_view: false, anonymize_ip: true });
    }
    window.gtag("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: `${location.pathname}${location.search}`,
    });
  }, [location.pathname, location.search]);

  const chooseConsent = (value) => {
    localStorage.setItem("resuai_analytics_consent", value);
    window.gtag?.("consent", "update", { analytics_storage: value });
    setConsent(value);
    if (value === "granted") {
      window.gtag?.("event", "page_view", {
        page_title: document.title,
        page_location: window.location.href,
        page_path: `${location.pathname}${location.search}`,
      });
    }
  };

  if (consent) return null;

  return (
    <aside
      role="dialog"
      aria-label="Analytics preferences"
      style={{
        position: "fixed", left: 16, right: 16, bottom: 16, zIndex: 99999,
        maxWidth: 620, margin: "0 auto", padding: "16px 18px", borderRadius: 12,
        background: "#0f172a", color: "#fff", boxShadow: "0 12px 35px rgba(0,0,0,.28)",
        fontSize: 14, lineHeight: 1.5,
      }}
    >
      <div style={{ marginBottom: 12 }}>
        We use privacy-friendly analytics to understand visits and improve ResuAIBuilder.
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
        <button type="button" onClick={() => chooseConsent("denied")} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #94a3b8", background: "transparent", color: "#fff", cursor: "pointer" }}>
          Decline
        </button>
        <button type="button" onClick={() => chooseConsent("granted")} style={{ padding: "8px 14px", borderRadius: 8, border: 0, background: "#14b8a6", color: "#042f2e", fontWeight: 700, cursor: "pointer" }}>
          Accept analytics
        </button>
      </div>
    </aside>
  );
}
