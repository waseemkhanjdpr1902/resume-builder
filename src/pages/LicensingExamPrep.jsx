import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiAlertCircle, FiArrowLeft, FiArrowRight, FiAward, FiBookOpen, FiCheckCircle, FiLock, FiRefreshCw, FiTarget } from "react-icons/fi";
import { examProfessions, licensingAuthorities } from "../data/licensingExamQuestions";
import { loadExamBank } from "../services/academyContent";
import "../css/licensing-exam-prep.css";

const pageWindow=(current,total)=>{
  if(total<=7)return Array.from({length:total},(_,index)=>index);
  const values=new Set([0,total-1,current-1,current,current+1]);
  return [...values].filter(value=>value>=0&&value<total).sort((a,b)=>a-b);
};

export default function LicensingExamPrep(){
  const [authority,setAuthority]=useState("DHA");
  const [profession,setProfession]=useState("Nurse");
  const [started,setStarted]=useState(false);
  const [questions,setQuestions]=useState([]);
  const [answers,setAnswers]=useState({});
  const [submitted,setSubmitted]=useState(false);
  const [current,setCurrent]=useState(0);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [access,setAccess]=useState("preview");
  const [bankTotal,setBankTotal]=useState(0);
  const [source,setSource]=useState("built-in");
  const authorityInfo=licensingAuthorities.find(item=>item.id===authority);
  useEffect(()=>{
    let active=true;
    setLoading(true);setError("");setStarted(false);setAnswers({});setSubmitted(false);setCurrent(0);
    loadExamBank(profession).then(result=>{
      if(!active)return;
      setQuestions(result.questions||[]);setAccess(result.access||"preview");setBankTotal(result.total||result.questions?.length||0);setSource(result.source||"built-in");
    }).catch(err=>active&&setError(err.message)).finally(()=>active&&setLoading(false));
    return()=>{active=false};
  },[profession]);
  const answered=Object.keys(answers).length;
  const correct=questions.reduce((total,question,index)=>total+(answers[index]===question.answer?1:0),0);
  const score=questions.length?Math.round(correct/questions.length*100):0;
  const pages=useMemo(()=>pageWindow(current,questions.length),[current,questions.length]);
  const reset=()=>{setAnswers({});setSubmitted(false);setStarted(false);setCurrent(0)};
  const goTo=index=>{setCurrent(Math.max(0,Math.min(index,questions.length-1)));requestAnimationFrame(()=>document.getElementById("exam-question")?.scrollIntoView({behavior:"smooth",block:"start"}))};
  const submit=()=>{
    setSubmitted(true);
    const key=`resuai_exam_${authority}_${profession}`;
    localStorage.setItem(key,String(Math.max(Number(localStorage.getItem(key)||0),score)));
    requestAnimationFrame(()=>document.getElementById("exam-result")?.scrollIntoView({behavior:"smooth"}));
  };
  const question=questions[current];
  return <main className="exam-page">
    <section className="exam-hero"><div><span>GCC HEALTHCARE LICENSING PRACTICE</span><h1>Prepare with purpose, not guesswork.</h1><p>Choose your pathway and profession, complete a focused question bank and learn from every explanation.</p><div className="exam-trust"><span><FiTarget/> 7 pathways</span><span><FiBookOpen/> 7 professions</span><span><FiAward/> Saved scores</span></div></div><aside><strong>DHA · DOH · MOHAP</strong><span>SCFHS · DHP · NHRA · Oman</span><p>Profession-specific practice with compact desktop and mobile navigation.</p></aside></section>
    {!started?<section className="exam-selector"><header><span>01</span><div><h2>Build your practice test</h2><p>Select the regulator pathway and healthcare profession.</p></div></header><div className="exam-fields"><label>Licensing pathway<select value={authority} onChange={event=>setAuthority(event.target.value)}>{licensingAuthorities.map(item=><option value={item.id} key={item.id}>{item.name} — {item.region}</option>)}</select></label><label>Healthcare profession<select value={profession} onChange={event=>setProfession(event.target.value)}>{examProfessions.map(item=><option key={item}>{item}</option>)}</select></label></div>
      {loading?<div className="exam-summary"><FiRefreshCw className="spin"/><div><strong>Loading question bank…</strong><p>Preparing the available questions for this profession.</p></div></div>:error?<div className="exam-error"><FiAlertCircle/>{error}</div>:<div className="exam-summary"><FiBookOpen/><div><strong>{authorityInfo.name} {profession} practice</strong><p>{questions.length} available questions · {access==="subscriber"?"subscriber bank unlocked":"free preview"} · explanations after submission{source==="ghost"?" · Ghost course bank":""}</p></div></div>}
      <button className="exam-primary" disabled={loading||!questions.length} onClick={()=>setStarted(true)}>Start practice test <FiArrowRight/></button>
      {access!=="subscriber"&&bankTotal>questions.length?<div className="exam-upgrade"><FiLock/><div><strong>Subscriber question bank available</strong><p>You are viewing {questions.length} preview questions. Subscribers unlock the complete currently published bank for this profession.</p></div><Link to="/pricing">View plans <FiArrowRight/></Link></div>:null}
      <p className="exam-disclaimer"><FiAlertCircle/>Independent educational practice only. Questions are original learning material, not recalled live examination content. Verify the current syllabus and rules with the official authority.</p>
    </section>:<section className="exam-test"><header><div><span>{authorityInfo.name} · {authorityInfo.region}</span><h2>{profession} practice test</h2></div><strong>{answered}/{questions.length} answered</strong></header><div className="exam-progress"><i style={{width:`${answered/questions.length*100}%`}}/></div>
      <nav className="exam-pagination" aria-label="Question navigation"><button aria-label="Previous question" disabled={current===0} onClick={()=>goTo(current-1)}><FiArrowLeft/></button><div>{pages.map((page,index)=><span key={page}>{index>0&&page-pages[index-1]>1?<i>…</i>:null}<button className={page===current?"active":answers[page]!==undefined?"answered":""} aria-label={`Question ${page+1}`} aria-current={page===current?"page":undefined} onClick={()=>goTo(page)}>{page+1}</button></span>)}</div><button aria-label="Next question" disabled={current===questions.length-1} onClick={()=>goTo(current+1)}><FiArrowRight/></button></nav>
      <article id="exam-question" className="exam-question single"><div className="question-number">{String(current+1).padStart(2,"0")}</div><div><h3>{question.question}</h3><div className="exam-options">{question.options.map((option,optionIndex)=>{const chosen=answers[current]===optionIndex;const state=submitted?optionIndex===question.answer?"correct":chosen?"incorrect":"":chosen?"selected":"";return <label className={state} key={option}><input type="radio" name={`question-${current}`} checked={chosen} disabled={submitted} onChange={()=>setAnswers(value=>({...value,[current]:optionIndex}))}/><span>{option}</span>{submitted&&optionIndex===question.answer?<FiCheckCircle/>:null}</label>})}</div>{submitted?<p className="exam-explanation"><strong>Why:</strong> {question.explanation}</p>:null}</div></article>
      <div className="exam-mobile-step"><button disabled={current===0} onClick={()=>goTo(current-1)}><FiArrowLeft/> Previous</button><span>{current+1} of {questions.length}</span><button disabled={current===questions.length-1} onClick={()=>goTo(current+1)}>Next <FiArrowRight/></button></div>
      <div className="exam-actions"><button className="exam-secondary" onClick={reset}><FiRefreshCw/> Change test</button>{!submitted?<button className="exam-primary" disabled={answered!==questions.length} onClick={submit}>{answered!==questions.length?`Answer ${questions.length-answered} more`:"Submit & see result"} <FiArrowRight/></button>:null}</div>
      {submitted?<section id="exam-result" className="exam-result"><FiAward/><div><span>YOUR PRACTICE RESULT</span><h2>{score}% · {correct} of {questions.length} correct</h2><p>{score>=80?"Strong result. Review every explanation and continue broader syllabus preparation.":"Review the explanations, revisit weak topics and practise again."}</p></div><Link to="/credential-readiness">Check readiness <FiArrowRight/></Link></section>:null}
    </section>}
  </main>;
}
