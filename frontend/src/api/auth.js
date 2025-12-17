const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useAuth() {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  async function login(username, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);
  }

  async function refresh() {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: refreshToken })
    });
    const data = await res.json();
    setAccessToken(data.access_token);
  }

  return { login, refresh, accessToken };
}
