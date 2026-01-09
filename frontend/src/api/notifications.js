const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchNotifications(accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/doctor/notifications`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function markNotificationRead(id, accessToken) {
  const res = await fetch(
    `${API_BASE_URL}/api/doctor/notifications/${id}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) throw new Error("Failed to mark notification read");
}

export async function markAllNotificationsRead(accessToken) {
  const res = await fetch(
    `${API_BASE_URL}/api/doctor/notifications/read-all`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) throw new Error("Failed to mark all notifications read");
}
