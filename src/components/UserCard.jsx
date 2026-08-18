import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";
import Modal from "./Modal";
import { useAuth } from "../provider/AuthProvider";
import LoginButton from "./LoginButton";
import profileHolder from "../assets/profile_holder.jpg";

export default function UserCard() {
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    const closeOutside = event => { if (!accountRef.current?.contains(event.target)) setMenuOpen(false); };
    const closeOnEscape = event => { if (event.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("mousedown", closeOutside); document.removeEventListener("keydown", closeOnEscape); };
  }, []);

  if (loading) return <div className="account-skeleton" aria-label="Loading account" />;
  if (!user) return <LoginButton />;

  const displayName = user.name || user.email?.split("@")[0] || "My account";
  const initial = displayName.charAt(0).toUpperCase();

  return <div className="account-menu" ref={accountRef}>
    <button className="account-trigger" type="button" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>
      {user.picture ? <img src={user.picture} alt="" referrerPolicy="no-referrer" /> : <span className="account-initial">{initial}</span>}
      <span className="account-trigger-copy"><strong>{displayName}</strong><small>My account</small></span>
      <FiChevronDown className={menuOpen ? "rotated" : ""} aria-hidden="true" />
    </button>
    {menuOpen ? <div className="account-dropdown" role="menu">
      <div className="account-summary"><img src={user.picture || profileHolder} alt="" referrerPolicy="no-referrer"/><div><strong>{displayName}</strong><small>{user.email}</small></div></div>
      <a href="/dashboard" role="menuitem"><FiUser/> My workspace</a>
      <button className="account-logout" type="button" role="menuitem" onClick={() => { setMenuOpen(false); setConfirmOpen(true); }}><FiLogOut/> Log out</button>
    </div> : null}
    {confirmOpen ? <Modal onClose={() => setConfirmOpen(false)} header={<span>Log out of ResuAIBuilder?</span>} footer={<div className="logout-modal-actions"><button type="button" onClick={() => setConfirmOpen(false)}>Stay signed in</button><button type="button" className="confirm-logout" onClick={async () => { await logout(); setConfirmOpen(false); }}>Log out</button></div>}><p className="logout-modal-copy">You can sign in again at any time. Your saved CV workspace will remain available.</p></Modal> : null}
  </div>;
}
