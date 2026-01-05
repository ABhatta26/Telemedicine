// context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Restore user from localStorage on refresh
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const username = localStorage.getItem("username");
    // const email = localStorage.getItem("email"); // Optional if you want to store email
    const role = localStorage.getItem("role"); // <--- RESTORE ROLE

    if (token && username) {
      setUser({
        name: username,
        userRole: role || "Patient", // Default to Patient if missing
      });
    }
  }, []);

  const login = async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || "Login failed");
    }

    const data = await res.json();

    // 1. Save tokens
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);

    // 2. Save User Details
    localStorage.setItem("username", data.user?.username || username);
    localStorage.setItem("email", data.user?.email || "");

    // 3. Extract role from the correct path in backend response
    // Backend returns: { user: { id, username, email, role } }
    const role = data.user?.role || "patient";
    localStorage.setItem("userRole", role);

    // 4. Update State
    setUser({
      name: data.user?.username || username,
      email: data.user?.email,
      userRole: role,
    });
  };

  const logout = () => {
    // Clear all storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("userRole"); // <--- CLEAR ROLE

    setUser(null);
    window.location.hash = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
