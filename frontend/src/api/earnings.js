const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchEarningsSummary(accessToken, params = {}) {
  const query = new URLSearchParams(params).toString();

  const res = await fetch(
    `${API_BASE_URL}/api/doctor/earnings/summary?${query}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch earnings summary");
  return res.json();
}

export async function fetchPaymentHistory(accessToken, params = {}) {
  const query = new URLSearchParams(params).toString();

  const res = await fetch(
    `${API_BASE_URL}/api/doctor/earnings/payments?${query}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch payment history");
  return res.json();
}
