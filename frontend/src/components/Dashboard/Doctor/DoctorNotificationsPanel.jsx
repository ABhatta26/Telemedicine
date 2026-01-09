// src/components/Dashboard/Doctor/DoctorNotificationsPanel.jsx

import React from "react";
import { useAuth } from "../../../context/AuthContext";
import { markNotificationRead } from "../../../api/notifications";


export default function DoctorNotificationsPanel({ notifications, setNotifications }) {
  const { accessToken } = useAuth();

  // GROUP BY DATE LABEL
  const grouped = notifications.reduce((acc, n) => {
    acc[n.dateLabel] = acc[n.dateLabel] || [];
    acc[n.dateLabel].push(n);
    return acc;
  }, {});

  const handleNotificationClick = async (id, redirectTo) => {
    try {
      await markNotificationRead(id, accessToken);

      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );

      console.log("Redirect to:", redirectTo);
    } catch (err) {
      console.error(err);
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="card p-20 text-center">
        <h3>Notifications</h3>
        <p className="color-muted">🔔 You’re all caught up</p>
      </div>
    );
  }

  return (
    <div className="card p-20">
      <h3 className="mb-20">Notifications</h3>

      {Object.keys(grouped).map(group => (
        <div key={group} className="mb-20">
          <h4 className="notif-group-title">{group}</h4>

          {grouped[group].map(n => (
            <div
              key={n.id}
              className={`notification-item ${!n.is_read ? "unread" : ""} notif-${n.type}`}
              onClick={() => handleNotificationClick(n.id, n.redirectTo)}
            >
              <p className="notif-title">{n.message}</p>
              <small className="color-muted">
                {n.dateLabel} • {n.time}
              </small>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

