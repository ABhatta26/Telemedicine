// components/layout/Header.jsx
import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";
import Dropdown from "../common/Dropdown";
import "../../styles/layout.css";
import ProfileModal from "../common/ProfileModal";

// MOCK DATA
const FAMILY_CONFIG_TABLE = [
  { id: "u_001", label: "Saatwik (You)", value: "saatwik_main" },
  { id: "u_002", label: "Subhasis (Father)", value: "subhasis_father" },
  { id: "u_003", label: "Sanchita (Mother)", value: "sanchita_mother" }
];

export default function Header() {
  const { mode, setMode, accent, setAccent } = useTheme();
  const { user, logout } = useAuth();
  const [activeProfile, setActiveProfile] = useState(FAMILY_CONFIG_TABLE[0].value);

  // Navigation handlers
  const goToProfile = () => {
    window.location.hash = "/profile";
  };

  const goToAddFamily = () => {
    window.location.hash = "/addfamilymembers";
  };

  const handleProfileChange = (e) => {
    if (e.target.value === "ADD_NEW_MEMBER") {
      goToAddFamily();
    } else {
      setActiveProfile(e.target.value);
    }
  };

  return (
    <header className="header">
      <div className="brand">
        <span className="dot"></span>
        <span>Control Center</span>
      </div>

      <div className="header-actions">
        
        <button className="btn-emergency"><span>🚑</span> Emergency</button>
        
        <select 
           className="input-field select-pill" 
           value={activeProfile} onChange={handleProfileChange}
         >
           {FAMILY_CONFIG_TABLE.map(member => <option key={member.id} value={member.value}>{member.label}</option>)}
           <option disabled>──────────</option>
           <option value="ADD_NEW_MEMBER" className="option-highlight">+ Add New Member</option>
         </select>

        <select value={accent} onChange={e => setAccent(e.target.value)} className="btn-outline">
            <option value="violet">Violet</option>
            <option value="rose">Rose</option>
            <option value="emerald">Emerald</option>
            <option value="indigo">Indigo</option>
            <option value="orange">Orange</option>
            <option value="teal">Teal</option>
            <option value="pink">Pink</option>
            <option value="lime">Lime</option>
        </select>
        
        <button className="btn-outline" onClick={() => setMode(mode === "dark" ? "light" : "dark")}>
          {mode === "dark" ? "Light" : "Dark"}
        </button>

        <Dropdown
          trigger={
            <div className="user-trigger">
              <Avatar src={user?.avatarUrl} name={user?.name} />
              <div className="user-info">
                <strong className="user-name">{user?.name || "Guest"}</strong>
                <span className="user-email">{user?.email || ""}</span>
              </div>
            </div>
          }
        >
          <div className="dropdown-menu-content">
            <button className="btn w-full" onClick={goToProfile}>
              Edit Profile
            </button>
            {/* <button className="btn-secondary w-full" onClick={goToAddFamily}>
              <span>+</span> Add Family Member
            </button> */}
            <div className="dropdown-divider"></div>
            <button className="btn-destructive w-full" onClick={logout}>
              Logout
            </button>
          </div>
        </Dropdown>
      </div>
    </header>
  );
}