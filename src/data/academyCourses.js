export const academyCourses = [
  {
    slug: "gcc-licensing-foundations", title: "GCC Licensing Foundations", profession: "All healthcare professionals",
    description: "Build a clear, regulator-aware plan for documents, verification, applications and exam preparation.",
    level: "Foundation", duration: "55 min", free: true, accent: "teal",
    outcomes: ["Compare GCC licensing pathways", "Prepare a document and verification checklist", "Create a realistic exam-preparation plan"],
    lessons: [
      { slug: "choose-your-pathway", title: "Choose the right licensing pathway", minutes: 12, free: true, content: [
        ["Start with the role, not the exam", "Confirm the professional title you are eligible to apply for before choosing an authority. Your qualification, recent experience and scope of practice influence the title available to you."],
        ["Compare authorities carefully", "DHA, DOH, MOHAP and other GCC regulators publish their own requirements. Use official sources for current eligibility, fees and timelines; third-party summaries are only a planning aid."],
        ["Your action step", "Write down your target country, authority, professional title and intended application month. Flag any requirement you still need to verify."]
      ]},
      { slug: "document-readiness", title: "Build your document checklist", minutes: 14, free: true, content: [
        ["Create one source of truth", "List your passport, qualification, transcript, registration, good-standing evidence and employment certificates. Record the name, issue date, expiry date and issuing body for each item."],
        ["Check consistency", "Differences in names, dates or job titles can delay verification. Identify inconsistencies early and obtain supporting evidence where required."],
        ["Protect sensitive records", "Keep originals secure. Share documents only through official authority or verification channels and avoid sending unrestricted copies through informal messaging."]
      ]},
      { slug: "verification-and-application", title: "Verification and application workflow", minutes: 14, free: false, content: [
        ["Plan the sequence", "Requirements differ, but a typical workflow includes eligibility review, primary-source verification, application review, assessment and final licensing steps."],
        ["Track every submission", "Keep confirmation numbers, dates, receipts and status changes in one tracker. Use the same verified spelling and contact details throughout."],
        ["Avoid false certainty", "Processing times vary. Do not make irreversible employment or travel decisions based only on an estimated completion date."]
      ]},
      { slug: "exam-study-plan", title: "Create a focused study plan", minutes: 15, free: false, content: [
        ["Use the blueprint", "Organise study time around the current official exam blueprint when one is available. Give more time to high-weight topics and weak areas."],
        ["Practise retrieval", "Short question sets, error review and spaced repetition are more useful than repeatedly rereading notes."],
        ["Review safely", "Use original educational questions. Do not seek, share or rely on recalled live examination content."]
      ]}
    ]
  },
  {
    slug: "nursing-clinical-safety", title: "Nursing Clinical Safety Essentials", profession: "Registered nurses",
    description: "Review high-value safety, prioritisation, communication and medication principles for licensing preparation.",
    level: "Intermediate", duration: "65 min", free: false, accent: "blue",
    outcomes: ["Apply patient-safety priorities", "Use structured clinical communication", "Recognise common medication-risk controls"],
    lessons: [
      { slug: "clinical-prioritisation", title: "Clinical prioritisation", minutes: 16, free: true, content: [
        ["Assess immediate risk", "Prioritise threats to airway, breathing, circulation and rapidly changing clinical status. Consider the whole presentation rather than one isolated observation."],
        ["Reassess after action", "An intervention is incomplete without checking the patient response, documenting relevant findings and escalating ongoing concerns."]
      ]},
      { slug: "infection-prevention", title: "Infection prevention", minutes: 15, free: false, content: [
        ["Use risk-based precautions", "Apply standard precautions consistently and add transmission-based precautions according to the suspected or confirmed route of infection."],
        ["Break the chain", "Hand hygiene, appropriate protective equipment, safe sharps handling and correct environmental cleaning work together; no single control replaces the others."]
      ]},
      { slug: "medication-safety", title: "Medication safety", minutes: 18, free: false, content: [
        ["Verify before administration", "Follow local policy for patient, medicine, dose, route, timing, indication, allergies, documentation and monitoring."],
        ["Pause on uncertainty", "Clarify incomplete, illegible or clinically concerning orders through the approved escalation route before administration."]
      ]},
      { slug: "structured-escalation", title: "Structured escalation and handover", minutes: 16, free: false, content: [
        ["Make urgency clear", "Use a structure such as situation, background, assessment and recommendation while adapting to local policy."],
        ["Close the loop", "Confirm that critical information was understood, record agreed actions and escalate again if the patient remains at risk."]
      ]}
    ]
  },
  {
    slug: "healthcare-career-launch", title: "Healthcare Career Launch", profession: "International applicants",
    description: "Turn licensing preparation into a credible CV, interview narrative and focused healthcare job search.",
    level: "Practical", duration: "50 min", free: false, accent: "gold",
    outcomes: ["Translate experience into measurable CV evidence", "Prepare structured interview examples", "Build a safer targeted job-search routine"],
    lessons: [
      { slug: "target-role", title: "Define your target role", minutes: 10, free: true, content: [
        ["Narrow the search", "Choose a specific profession, seniority, care setting and location. A clear target improves your CV language and interview preparation."],
        ["Map gaps honestly", "Separate requirements you already meet from licensing, experience or skill gaps that still need action."]
      ]},
      { slug: "evidence-based-cv", title: "Build an evidence-based healthcare CV", minutes: 15, free: false, content: [
        ["Show scope and outcomes", "Describe patient population, setting, responsibilities, safety contributions and measurable improvements without exposing patient information."],
        ["Keep claims verifiable", "Do not overstate licensing status, competency, seniority or outcomes. Employers may verify important details."]
      ]},
      { slug: "interview-stories", title: "Prepare interview stories", minutes: 15, free: false, content: [
        ["Use a clear structure", "Explain the situation, your responsibility, the actions you personally took and the result or learning."],
        ["Prioritise safe practice", "Strong answers show patient-centred judgement, escalation, teamwork, reflection and awareness of professional limits."]
      ]},
      { slug: "safe-job-search", title: "Run a safer job search", minutes: 10, free: false, content: [
        ["Verify opportunities", "Research the employer and recruiter independently. Be cautious with unofficial domains, urgent payment requests and unrealistic guarantees."],
        ["Track applications", "Record the role, employer, source, application date, contact and follow-up. Tailor materials to the real job description."]
      ]}
    ]
  }
];

export const getAcademyCourse = slug => academyCourses.find(course => course.slug === slug);
export const getAcademyLesson = (course, slug) => course?.lessons.find(lesson => lesson.slug === slug);
export const courseLessonCount = course => course.lessons.length;
