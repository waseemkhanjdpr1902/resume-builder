import { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { useLayout } from "../provider/layoutProvider";
import LayoutPreview from "../components/layouts/input-layout/LayoutPreview";
import LayoutInputField from "../components/layouts/input-layout/LayoutInputField";
import GeneratePageFixedButtons from "../components/generatePageFixedButton";
import Loading from "../components/Loading";
import useLoadSavedData from "../helper/hooks/useLoadSavedData";
import useAutoSaveWithDiff from "../helper/hooks/useAutoSaveWithDiff";
import DividerProvider from "../provider/DividerProvider";
import DifferentLayoutHolder from "../components/DifferentLayoutHolder";
import CandidatePhotoUploader from "../components/CandidatePhotoUploader";
import useHideOnScroll from "../helper/hooks/useHideOnScroll";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiEdit3, FiGrid, FiShield, FiTarget } from "react-icons/fi";
import { professionalTemplates } from "../static-data/professional-templates";
import "../css/resume-editor.css";
import "../css/download-experience.css";

const MainWrapper = styled.section`
  width:100%;height:auto;min-height:100vh;position:relative;inset:0;background:${({ theme }) => theme.colors.bg};
`;
const ResponsiveGrid = styled.div.withConfig({ shouldForwardProp: (prop) => !['isOpen'].includes(prop) })`
  display:grid;grid-template-columns:repeat(1,minmax(0,1fr));gap:1.25rem;
  @media(min-width:1024px){grid-template-columns:minmax(0,1.05fr) minmax(500px,.95fr);}
`;
const QualityCard=styled.section`
  margin:0 0 20px;padding:18px 20px;border:1px solid #d8e5e2;border-radius:16px;background:#fff;
  box-shadow:0 8px 24px rgba(16,42,67,.05);
  .quality-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:13px}
  .quality-title{display:flex;align-items:center;gap:10px}.quality-title svg{color:#0f766e;font-size:1.2rem}
  h3{margin:0;color:#183548;font-size:.96rem}p{margin:4px 0 0;color:#71818b;font-size:.7rem;line-height:1.45}
  .score{display:grid;place-items:center;min-width:66px;height:42px;border-radius:12px;background:#102a43;color:#fff;font-weight:850;font-size:.95rem}
  .checks{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
  .check{display:flex;align-items:center;gap:8px;padding:9px 10px;border:1px solid #e1e9e7;border-radius:10px;background:#fbfdfc;color:#536b78;font-size:.68rem;font-weight:700}
  .check.ok{color:#23655b;border-color:#c7e1db;background:#f2faf8}.check svg{flex:none}
  .tip{margin-top:12px;padding:10px 12px;border-radius:10px;background:#f7f9fa;color:#526572;font-size:.68rem;line-height:1.5}
  @media(max-width:720px){.checks{grid-template-columns:1fr 1fr}.quality-head{align-items:flex-start}.score{min-width:58px}}
`;

const hasText=(value)=>typeof value==="string" && value.trim().length>0;
const hasItems=(value)=>Array.isArray(value) && value.some(Boolean);
const countAchievements=(experiences=[])=>experiences.reduce((total,item)=>total+(Array.isArray(item?.achievements)?item.achievements.filter((a)=>hasText(a?.value ?? a)).length:0),0);

const GenerateResume = () => {
  const [showIcons,setShowIcons]=useState(true);
  const [showEditor,setShowEditor]=useState(false);
  const [isTemplateChangeModelOpen,setIsTemplateChangeModelOpen]=useState(false);
  const [isAIGenerated]=useState(() => Boolean(sessionStorage.getItem("resuai_improved_cv") || sessionStorage.getItem("resuai_ai_completed")));
  const { isSavedLoaded,liveDetails }=useLayout();
  const { layout_type,layout_id }=useParams();
  const AUTOSAVE_INTERVAL=1000*60;
  const activeTemplate=useMemo(() => professionalTemplates.find((template) => template.layoutType===layout_type && template.layoutId===Number(layout_id)),[layout_type,layout_id]);
  const quality=useMemo(()=>{
    const personal=liveDetails?.personalDetails || {};
    const checks=[
      {label:"Contact details",ok:hasText(personal.name)&&hasText(personal.email)&&hasText(personal.phone)},
      {label:"Professional summary",ok:hasText(liveDetails?.summary)&&liveDetails.summary.trim().length>=80},
      {label:"Work experience",ok:hasItems(liveDetails?.experiences)},
      {label:"Achievement bullets",ok:countAchievements(liveDetails?.experiences)>=3},
      {label:"Healthcare skills",ok:hasItems(liveDetails?.skills)},
      {label:"Education / credentials",ok:hasItems(liveDetails?.educations)||hasItems(liveDetails?.certificates)},
    ];
    const completed=checks.filter((item)=>item.ok).length;
    return {checks,score:Math.round((completed/checks.length)*100)};
  },[liveDetails]);

  useLoadSavedData();
  useAutoSaveWithDiff(AUTOSAVE_INTERVAL);
  useHideOnScroll(setShowIcons);
  const handleShowIcon=useCallback(() => setShowIcons((prev)=>!prev),[]);
  const openTemplateChangeModal=useCallback(() => setIsTemplateChangeModelOpen((prev)=>!prev),[]);

  if(!isSavedLoaded) return <Loading message="Loading saved records from database" />;
  if(!isAIGenerated) return <Navigate to="/ats-checker" replace />;

  return (
    <DividerProvider>
      <MainWrapper>
        <div className="resume-studio">
          <header className="studio-header">
            <div>
              <Link to="/templates" className="studio-back"><FiArrowLeft /> All templates</Link>
              <span className="studio-eyebrow">HEALTHCARE CV STUDIO</span>
              <h1>Your AI-improved healthcare CV is ready</h1>
              <p>AI extracted and populated this complete template directly from your uploaded CV. Review the document and download it; editing is available only if you want to make a correction.</p>
            </div>
            <div className="studio-meta"><span><FiCheckCircle /> Autosave enabled</span><span><FiShield /> Private workspace</span><strong>{activeTemplate?.name || `${layout_type} · Template ${layout_id}`}</strong></div>
          </header>
          <div className="studio-progress" aria-label="Resume workflow"><span><b>1</b> AI completed</span><i></i><span className="active"><b>2</b> Review</span><i></i><span><b>3</b> Download</span></div>
          <div className="ai-ready-banner"><div><FiCheckCircle/><span><strong>Your PDF-derived CV is complete</strong><small>All detected information has been populated automatically. Manual entry is not required.</small></span></div><div className="ready-actions"><button type="button" onClick={()=>setShowEditor((current)=>!current)}><FiEdit3/>{showEditor?"Hide editor":"Edit details or add photo"}</button><Link to="/ats-checker">Back to ATS suggestions</Link></div></div>

          <QualityCard>
            <div className="quality-head"><div className="quality-title"><FiTarget/><div><h3>Healthcare CV readiness</h3><p>A quick structural check before you download or tailor this CV to a job.</p></div></div><div className="score">{quality.score}%</div></div>
            <div className="checks">{quality.checks.map((item)=><div key={item.label} className={`check ${item.ok?"ok":""}`}><FiCheckCircle/>{item.label}</div>)}</div>
            <div className="tip">For online applications, prefer an ATS-first single-column format. Keep licence/certification names explicit, use standard headings, and tailor clinical skills and achievement wording to the target job description.</div>
          </QualityCard>

          <CandidatePhotoUploader onChoosePhotoFormat={openTemplateChangeModal}/>
          <div className="stable-format-toolbar"><div><span>CV FORMAT</span><strong>{activeTemplate?.name || "Stable Healthcare CV"}</strong><small>{activeTemplate ? `${activeTemplate.ats} ATS · ${activeTemplate.format} · ${activeTemplate.level}` : "Stable A4 · ATS-friendly · reliable PDF export"}</small></div><button type="button" onClick={openTemplateChangeModal}><FiGrid/> Change format</button></div>
          <ResponsiveGrid className={!showEditor?"preview-only":""} isOpen={isTemplateChangeModelOpen}>
            {!isTemplateChangeModelOpen && showEditor && <LayoutInputField/>}
            <LayoutPreview/>
          </ResponsiveGrid>
        </div>
        <GeneratePageFixedButtons showIcons={showIcons} setShowIcons={handleShowIcon} setIsTemplateChangeModelOpen={openTemplateChangeModal}/>
      </MainWrapper>
      <DifferentLayoutHolder isOpen={isTemplateChangeModelOpen} onHide={openTemplateChangeModal}/>
    </DividerProvider>
  );
};
export default GenerateResume;
