import React from "react";
import { StyledNavLink } from "./CustomComponents";

const Nav = () => {
  return (
    <nav className="primary-nav" aria-label="Primary navigation">
      <ul>
        <li><StyledNavLink to="/dashboard">Dashboard</StyledNavLink></li>
        <li><StyledNavLink to="/ats-checker">Upload CV</StyledNavLink></li>
        <li><StyledNavLink to="/healthcare-cv-examples">Free Resources</StyledNavLink></li>
        <li><StyledNavLink to="/ats-checker">ATS Check</StyledNavLink></li>
        <li><StyledNavLink to="/healthcare-interview-coach">Interview Coach</StyledNavLink></li>
        <li><StyledNavLink to="/pricing">Pricing</StyledNavLink></li>
      </ul>
    </nav>
  );
};

export default Nav;
