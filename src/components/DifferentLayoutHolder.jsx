import { memo, useEffect, useState } from "react";
import styled, { keyframes, css, useTheme } from "styled-components";
import { GridTwo } from "./layouts/input-layout/GridCards";
import { H2, H3, Hspace } from "./CustomComponents";
import { useNavigate } from "react-router-dom";
import { LineDivider } from "./Divider/TransparentDividers";
import { professionalTemplates } from "../static-data/professional-templates";

const slideIn = keyframes`
  from { right: -540px; opacity: 0; }
  to { right: 10px; opacity: 1; }
`;
const slideOut = keyframes`
  from { right: 10px; opacity: 1; }
  to { right: -540px; opacity: 0; }
`;

const Wrapper = styled.div.withConfig({ shouldForwardProp: (prop) => !['isOpen', 'backgroundColor'].includes(prop) })`
  width: calc(100% - 20px);
  max-width: 540px;
  background: ${({ backgroundColor, theme }) => backgroundColor || theme.colors.background || "#222"};
  padding: 1rem;
  position: fixed;
  top: 11%;
  z-index: 999;
  border-radius: 16px 0 0 16px;
  box-shadow: -8px 0 15px rgba(0,0,0,.2), 0 8px 15px rgba(0,0,0,.18);
  animation: ${({ isOpen }) => isOpen ? css`${slideIn} .35s ease-out forwards` : css`${slideOut} .35s ease-in forwards`};
  pointer-events: ${({ isOpen }) => isOpen ? "auto" : "none"};
  @media(max-width:600px){top:7%;right:0!important;max-width:none;border-radius:16px 0 0 16px;}
`;
const ScrollableWrapper=styled.div`max-height:76vh;overflow-y:auto;padding-right:4px;`;
const Intro=styled.p`margin:0 0 12px;color:#647681;font-size:.76rem;line-height:1.5;`;
const ImageWrapper = styled.button`
  display:flex;flex-direction:column;width:100%;min-height:174px;margin:.25rem 0;padding:16px;
  border:1px solid #d5dfdf;border-radius:12px;background:#fff;color:#172f41;text-align:left;cursor:pointer;
  transition:.2s all ease-in-out;
  &:hover{transform:translateY(-2px);border-color:#83bdb1;box-shadow:0 8px 18px rgba(16,42,67,.08)}
  p{margin:7px 0;color:#647681;font-size:.73rem;line-height:1.45}
`;
const Tags=styled.div`display:flex;flex-wrap:wrap;gap:5px;margin:5px 0 9px;span{padding:4px 7px;border-radius:999px;background:#eef6f4;color:#315e58;font-size:.6rem;font-weight:750}`;
const Meta=styled.span`margin-top:auto;color:#4f606a;font-size:.66rem;font-weight:750;`;

// All formats below use the same stable A4 renderer. Expanding this list does not
// change CV data, AI improvement, autosave, photo upload or download behaviour.
const stableTemplateIds = new Set([
  "healthcare-leader",
  "nursing-clinical",
  "doctor-specialist",
  "doctor-chronology",
  "doctor-credential",
  "allied-health",
  "early-career-clinical",
  "gcc-photo-clinical",
  "photo-sidebar-healthcare",
  "pharmacy-practice",
  "executive-photo-clinical",
]);

const DifferentLayoutHolder = memo(({ isOpen, onHide }) => {
  const [visible, setVisible] = useState(isOpen);
  const theme = useTheme();
  const navigate = useNavigate();
  const handleLayoutClick = (category, index) => {
    navigate(`/build-resume/${category}/${index}`);
    onHide();
  };
  useEffect(() => {
    if (isOpen) setVisible(true);
    else {
      const timeout = setTimeout(() => setVisible(false), 350);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);
  if (!visible) return null;

  return (
    <Wrapper isOpen={isOpen}>
      <H2>Choose a Healthcare CV Format</H2>
      <LineDivider backgroundColor={theme.colors.text} />
      <Hspace height="8px"/>
      <Intro>Switch the presentation without losing your CV content. ATS-first formats are recommended for online applications; photo formats are useful where a professional portrait is appropriate.</Intro>
      <ScrollableWrapper>
        <GridTwo>
          {professionalTemplates.filter((template) => stableTemplateIds.has(template.id)).map((template) => (
            <ImageWrapper type="button" key={template.id} onClick={() => handleLayoutClick(template.layoutType, template.layoutId)}>
              <H3>{template.name}</H3>
              <Tags><span>{template.ats} ATS</span><span>{template.level}</span>{template.photoReady ? <span>Photo optional</span> : <span>ATS-first</span>}</Tags>
              <p>{template.description}</p>
              <Meta>Stable A4 · {template.format}</Meta>
            </ImageWrapper>
          ))}
        </GridTwo>
      </ScrollableWrapper>
    </Wrapper>
  );
});

DifferentLayoutHolder.displayName = "DifferentLayoutHolder";
export default DifferentLayoutHolder;
