import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../../styles/layout.css";

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`app-shell ${collapsed ? "collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Header />
      <main className="content">{children}</main>
    </div>
  );
}
