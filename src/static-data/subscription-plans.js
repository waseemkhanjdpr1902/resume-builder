export const subscriptionPlans = [
  {
    id: "free", name: "Starter", eyebrow: "EXPLORE", monthly: 0, yearly: 0,
    description: "Create a professional resume and experience the core builder.",
    features: ["1 active resume", "ATS-safe starter templates", "PDF export", "Core resume sections"],
    cta: "Start free", href: "/templates",
  },
  {
    id: "pro", name: "Career Pro", eyebrow: "BEST VALUE", monthly: 499, yearly: 3999, featured: true,
    description: "For active job seekers who want stronger applications and unlimited creation.",
    features: ["Unlimited resumes", "All Tech, Medical & professional templates", "ATS score and improvement guidance", "JD keyword matching", "Cover letters", "Priority PDF & future DOCX exports"],
    cta: "Upgrade to Career Pro",
  },
  {
    id: "expert", name: "Expert Makeover", eyebrow: "HUMAN + AI", oneTime: 2999,
    description: "A professionally reviewed resume for an important career move.",
    features: ["Everything in Career Pro", "Expert resume review", "ATS-focused content rewrite", "One tailored cover letter", "LinkedIn profile recommendations", "30-day revision support"],
    cta: "Request expert makeover",
  },
];
