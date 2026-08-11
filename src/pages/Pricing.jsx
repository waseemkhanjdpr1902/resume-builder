import { FiCheck, FiExternalLink } from "react-icons/fi";
import { Link } from "react-router-dom";

const paymentUrl = "https://razorpay.me/@mohammedwaseem7570";

export default function Pricing() {
  const free = ["Professional resume templates", "Guided resume editor", "Secure account and autosave", "PDF download"];
  const premium = ["Everything in Free Builder", "ATS-focused resume review", "Content and formatting guidance", "Payment through secure Razorpay page"];
  return <main className="min-h-screen pt-36 px-5 pb-20 text-slate-800 bg-slate-50"><section className="max-w-5xl mx-auto text-center">
    <span className="text-teal-700 font-bold tracking-widest text-xs">SIMPLE PRICING</span><h1 className="text-4xl md:text-5xl font-extrabold mt-4">Build free. Upgrade when you are ready.</h1><p className="text-slate-600 mt-5 max-w-2xl mx-auto">Create and edit your resume at no cost. Choose premium support when you want a professionally polished final result.</p>
    <div className="grid md:grid-cols-2 gap-6 mt-12 text-left">
      <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm"><h2 className="text-2xl font-bold">Free Builder</h2><p className="text-3xl font-extrabold my-5">₹0</p><ul className="space-y-3 text-slate-600">{free.map(x=><li className="flex gap-3" key={x}><FiCheck className="text-teal-700 mt-1"/>{x}</li>)}</ul><Link to="/templates" className="mt-8 flex justify-center rounded-xl border border-teal-700 text-teal-800 font-bold p-3">Start building</Link></article>
      <article className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl relative"><span className="absolute top-5 right-5 bg-teal-400 text-slate-900 text-xs font-bold rounded-full px-3 py-1">PERSONAL SUPPORT</span><h2 className="text-2xl font-bold">Resume Review</h2><p className="text-slate-300 my-5">Get expert help to strengthen wording, positioning and ATS compatibility.</p><ul className="space-y-3 text-slate-200">{premium.map(x=><li className="flex gap-3" key={x}><FiCheck className="text-teal-400 mt-1"/>{x}</li>)}</ul><a href={paymentUrl} target="_blank" rel="noreferrer" className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-teal-400 text-slate-900 font-bold p-3">Pay securely <FiExternalLink/></a><p className="text-xs text-slate-400 mt-4">You will be redirected to Mohammed Waseem’s Razorpay payment page.</p></article>
    </div>
  </section></main>;
}
