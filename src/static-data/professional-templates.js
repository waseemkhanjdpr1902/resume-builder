import classicExecutive from "../assets/layout-images/classic/classic_layout_1.png";
import classicClinical from "../assets/layout-images/classic/classic_resume_4.png";
import modernEngineer from "../assets/layout-images/modern/modern_layout_2.png";
import modernProduct from "../assets/layout-images/modern/modern_layout_6.png";
import simpleMedical from "../assets/layout-images/simple/simple_layout_3.png";
import simpleUniversal from "../assets/layout-images/simple/simple_layout_4.png";

export const careerTracks = [
  { id: "all", label: "All careers" },
  { id: "technology", label: "Technology" },
  { id: "healthcare", label: "Healthcare" },
  { id: "business", label: "Business & leadership" },
];

export const professionalTemplates = [
  {
    id: "tech-core", name: "Tech Core", track: "technology", image: simpleUniversal,
    layoutType: "simple", layoutId: 4, ats: "Excellent", format: "Single column", level: "All levels",
    roles: ["Software Engineer", "DevOps", "Cybersecurity"],
    description: "A parsing-first structure for technical experience, measurable impact, skills and projects.",
    strengths: ["Clean skill taxonomy", "Project-friendly", "No parsing-risk sidebar"], featured: true,
  },
  {
    id: "engineering-impact", name: "Engineering Impact", track: "technology", image: modernEngineer,
    layoutType: "modern", layoutId: 2, ats: "Strong", format: "Compact", level: "Mid–senior",
    roles: ["Full-stack", "Data Engineer", "Engineering Lead"],
    description: "A compact professional layout for engineers with deep project and delivery experience.",
    strengths: ["Impact-led experience", "Dense but readable", "Modern hierarchy"],
  },
  {
    id: "product-leader", name: "Product & Data Leader", track: "technology", image: modernProduct,
    layoutType: "modern", layoutId: 6, ats: "Strong", format: "Executive compact", level: "Senior",
    roles: ["Product Manager", "Data Scientist", "Technology Head"],
    description: "Balances leadership outcomes, strategic initiatives and technical credibility.",
    strengths: ["Leadership narrative", "Metrics-forward", "Executive presence"],
  },
  {
    id: "clinical-core", name: "Clinical Professional", track: "healthcare", image: classicClinical,
    layoutType: "classical", layoutId: 4, ats: "Excellent", format: "Single column", level: "All levels",
    roles: ["Doctor", "Registered Nurse", "Pharmacist"],
    description: "A credential-first clinical resume for licensure, patient-care experience and specialities.",
    strengths: ["Credential visibility", "Clinical experience focus", "ATS-safe chronology"], featured: true,
  },
  {
    id: "medical-specialist", name: "Medical Specialist", track: "healthcare", image: simpleMedical,
    layoutType: "simple", layoutId: 3, ats: "Excellent", format: "Refined single column", level: "Experienced",
    roles: ["Specialist Doctor", "Clinical Research", "Healthcare Manager"],
    description: "Built for advanced qualifications, specialist practice, research and professional training.",
    strengths: ["Qualifications first", "Research-ready", "Formal clinical tone"],
  },
  {
    id: "leadership-classic", name: "Leadership Classic", track: "business", image: classicExecutive,
    layoutType: "classical", layoutId: 1, ats: "Excellent", format: "Executive single column", level: "Mid–executive",
    roles: ["Operations", "Finance", "Customer Experience"],
    description: "A confident, conservative design for business leadership and client-facing careers.",
    strengths: ["Outcome-led summary", "Clear progression", "Boardroom-ready"],
  },
];
