// auth/LoginForm.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/layout.css";
import "../../styles/base.css";
import "../../styles/variables.css";

export default function LoginForm({ onForgot }) {
  const { login } = useAuth();   // use login from AuthContext
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);   // call AuthContext login
      window.location.hash = "/dashboard"; // redirect after success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="auth-form">
      <h2 className="auth-title">Welcome Back</h2>

      {error && <p style={{ color: "tomato", textAlign: "center" }}>{error}</p>}

      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        type="text"
        placeholder="Username"
        className="auth-input"
        required
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="••••••••"
        className="auth-input"
        required
      />
      <button className="auth-submit" type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      {/* Forgot password link */}
      <div className="auth-extra">
        <button type="button" className="auth-link" onClick={onForgot}>
          Forgot Password?
        </button>
      </div>
    </form>
  );
}
