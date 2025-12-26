// auth/LoginForm.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/layout.css";
import "../../styles/base.css";
import "../../styles/variables.css";

export default function LoginForm({ onForgot }) {
  const { login } = useAuth();   
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // 1. Add state for visibility
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);   
      window.location.hash = "/dashboard"; 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Define Icons (Same as SignupForm)
  const IconEye = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  const IconEyeOff = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

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

      {/* 3. Wrap password input and add toggle button */}
      <div className="password-wrapper">
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={showPassword ? "text" : "password"} // Dynamic type
          placeholder="••••••••"
          className="auth-input"
          required
        />
        <button
          type="button" // Important: prevents form submit
          className="password-toggle-btn"
          onClick={() => setShowPassword(!showPassword)}
          title={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>

      <button className="auth-submit" type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <div className="auth-extra">
        <button type="button" className="auth-link" onClick={onForgot}>
          Forgot Password?
        </button>
      </div>
    </form>
  );
}