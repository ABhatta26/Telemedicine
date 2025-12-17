import React from "react";
import "../../styles/layout.css";

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <button
        className="btn-outline"
        style={{ width: "100%", marginBottom: 12 }}
        onClick={() => setCollapsed(c => !c)}
      >
        {collapsed ? "⮞" : "≡"}
      </button>
      <nav style={{ display: "grid", gap: 6 }}>
        <a className="item" href="#/dashboard">🏠 <span>Dashboard</span></a>
        <a className="item" href="#/notifications">🔔 <span>Notifications</span></a>
        <a className="item" href="#/settings">⚙️ <span>Settings</span></a>
        <a className="item" href="#/security">🔒 <span>Security</span></a>
      </nav>
    </aside>
  );
}
