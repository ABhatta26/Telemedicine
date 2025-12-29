// Newly added
// auth/ResetPasswordForm.jsx
import React, { useState, useEffect } from "react";
import "../../styles/layout.css";
import "../../styles/base.css";
import "../../styles/variables.css";

export default function ResetPasswordForm() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Extract token from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split("?")[1]);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/auth/reset-password?token=${encodeURIComponent(token)}&new_password=${encodeURIComponent(password)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to reset password");
      }

      const data = await res.json();
      setSuccess(data.message || "Password reset successful!");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.hash = "/login";
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2 className="auth-title">Set New Password</h2>
      <p className="auth-description">
        Enter your new password below.
      </p>

      {error && <p style={{ color: "tomato", textAlign: "center" }}>{error}</p>}
      {success && <p style={{ color: "limegreen", textAlign: "center" }}>{success}</p>}

      <input
        type="password"
        name="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="auth-input"
        required
        minLength={6}
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="auth-input"
        required
        minLength={6}
      />
      <button type="submit" className="auth-submit" disabled={loading || success}>
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}
// Newly added
