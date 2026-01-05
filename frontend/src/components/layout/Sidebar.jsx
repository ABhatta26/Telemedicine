import React from "react";
import "../../styles/layout.css";

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <button
        className="btn-outline sidebar-toggle-btn"
        onClick={() => setCollapsed(c => !c)}
      >
        {collapsed ? "⮞" : "≡"}
      </button>
      <nav className="sidebar-nav">
        <a className="item" href="#/dashboard">🏠 <span>Dashboard</span></a>
        {/* This link triggers the hash change */}
        <a className="item" href="#/addfamilymembers">+<span>Add Family Members</span></a>
        <a className="item" href="#/settings">⚙️ <span>Settings</span></a>
        <a className="item" href="#/security">🔒 <span>Security</span></a>
      </nav>
    </aside>
  );
}