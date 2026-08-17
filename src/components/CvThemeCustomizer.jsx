import { memo } from "react";
import { FiCheck, FiGrid, FiSliders } from "react-icons/fi";
import { cvThemes } from "../data/cvThemes";

const CvThemeCustomizer = memo(({ value, onChange, onChangeFormat }) => (
  <section className="cv-customizer" aria-labelledby="cv-style-heading">
    <div className="cv-customizer-copy">
      <span><FiSliders /> CV STYLE</span>
      <h2 id="cv-style-heading">Choose a colour theme</h2>
      <p>Colour changes the visual emphasis only. Your wording, sections and ATS-safe reading order remain unchanged.</p>
    </div>
    <div className="cv-theme-options" role="radiogroup" aria-label="CV colour theme">
      {cvThemes.map((theme) => (
        <button
          key={theme.id}
          type="button"
          role="radio"
          aria-checked={value === theme.id}
          className={value === theme.id ? "selected" : ""}
          onClick={() => onChange(theme.id)}
          title={theme.description}
        >
          <i style={{ "--theme-accent": theme.accent, "--theme-secondary": theme.secondary }} />
          <span><strong>{theme.name}</strong><small>{theme.description}</small></span>
          {value === theme.id ? <FiCheck aria-hidden="true" /> : null}
        </button>
      ))}
    </div>
    <button className="change-format-action" type="button" onClick={onChangeFormat}><FiGrid /> Change CV format</button>
  </section>
));

CvThemeCustomizer.displayName = "CvThemeCustomizer";

export default CvThemeCustomizer;
