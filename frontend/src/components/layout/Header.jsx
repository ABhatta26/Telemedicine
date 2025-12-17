import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";
import Dropdown from "../common/Dropdown";
import "../../styles/layout.css";
import React from "react";

export default function Header() {
  const { mode, setMode, accent, setAccent } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="brand">
        <span className="dot"></span>
        <span>Control Center</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </button>

        <Dropdown
          trigger={
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar src={user?.avatarUrl} name={user?.name} />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                <strong style={{ fontSize: 13 }}>{user?.name || "Guest"}</strong>
                <span style={{ fontSize: 11, color: "var(--color-muted)" }}>{user?.email || ""}</span>
              </div>
            </div>
          }
        >
          <button className="btn" style={{ width: "100%" }} onClick={logout}>Logout</button>
        </Dropdown>
      </div>
    </header>
  );
}
