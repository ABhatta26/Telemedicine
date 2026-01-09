// src/components/Dashboard/Doctor/DoctorNotificationsTab.jsx
import React from "react";
export default function DoctorNotificationsTab({ activeTab, setActiveTab, unreadCount }) {
  return (
    <span
      className={`nav-tab ${activeTab === "notifications" ? "active" : ""}`}
      onClick={() => setActiveTab("notifications")}
    >
      Notifications
      {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
    </span>
  );
}
