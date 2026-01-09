// src/components/Dashboard/Doctor/DoctorDashboardLayout.jsx
import React, { useState } from "react";
import Sidebar from "../../layout/Sidebar";
import DoctorHeader from "./DoctorHeader";
import "../../../styles/layout.css"; 

export default function DoctorDashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    // We use 'app-shell' which is already defined in your CSS to handle the grid
    <div className={`app-shell ${collapsed ? "collapsed" : ""}`}>
      
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      {/* The Header is placed in the 'header' grid area defined in CSS */}
      <DoctorHeader />
      
      {/* The Main Content is placed in the 'content' grid area defined in CSS */}
      <main className="content">
        {children}
      </main>

    </div>
  );
}