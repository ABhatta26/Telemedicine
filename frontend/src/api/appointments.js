const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Get appointment statistics for admin dashboard
 */
export async function getAppointmentStats() {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE_URL}/api/admin/appointments/stats`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch appointment stats");
  }

  return await res.json();
}

/**
 * Get today's appointments (admin only)
 */
export async function getTodayAppointments() {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE_URL}/api/admin/appointments/today`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch today's appointments");
  }

  return await res.json();
}

/**
 * Get upcoming appointments (admin only)
 */
export async function getUpcomingAppointments() {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE_URL}/api/admin/appointments/upcoming`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch upcoming appointments");
  }

  return await res.json();
}

/**
 * Get past appointments (admin only)
 */
export async function getPastAppointments() {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE_URL}/api/admin/appointments/past`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch past appointments");
  }

  return await res.json();
}

/**
 * Create a new appointment (patient)
 */
export async function createAppointment(appointmentData) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE_URL}/api/appointments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(appointmentData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to create appointment");
  }

  return await res.json();
}

/**
 * Get user's appointments (patient)
 */
export async function getMyAppointments() {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE_URL}/api/appointments`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch appointments");
  }

  return await res.json();
}

/**
 * Update appointment status
 */
export async function updateAppointment(appointmentId, updateData) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to update appointment");
  }

  return await res.json();
}

/**
 * Cancel appointment
 */
export async function cancelAppointment(appointmentId) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to cancel appointment");
  }

  return await res.json();
}
