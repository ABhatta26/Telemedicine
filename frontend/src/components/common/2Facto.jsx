// auth/OtpVerificationForm.jsx
import React, { useState, useEffect } from "react";
import Layout from "../layout/Layout";
import "../../styles/layout.css";
import "../../styles/base.css";
import "../../styles/variables.css";

export default function OtpVerificationForm({ email, onSuccess }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  // 1. Start timer at 30s immediately on mount
  const [timer, setTimer] = useState(30); 

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); 
    if (value.length <= 6) {
      setOtp(value);
      setError("");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Invalid OTP");
      }

      setMessage("Verification successful!");
      
      if (onSuccess) {
        setTimeout(() => onSuccess(otp), 1000);
      } else {
         window.location.hash = "/reset-password";
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    
    try {
      const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to resend code");

      setMessage("New code sent to your email.");
      
      // 2. Reset timer to 30s so the button disappears again
      setTimer(30); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
    <form className="auth-form" onSubmit={handleVerify}>
      <h2 className="auth-title">Verify OTP</h2>
      
      <p className="auth-description">
        Enter the 6-digit code sent to <strong>{email || "your email"}</strong>.
      </p>

      {error && <p style={{ color: "tomato", textAlign: "center", margin: "0" }}>{error}</p>}
      {message && <p style={{ color: "limegreen", textAlign: "center", margin: "0" }}>{message}</p>}

      <input
        type="text"
        name="otp"
        placeholder="Enter 6-digit code"
        value={otp}
        onChange={handleChange}
        className="auth-input"
        inputMode="numeric" 
        autoComplete="one-time-code"
        style={{ letterSpacing: "4px", textAlign: "center", fontSize: "1.2rem" }}
        required
      />

      <button type="submit" className="auth-submit" disabled={loading}>
        {loading ? "Verifying..." : "Verify Code"}
      </button>

      {/* 3. Show "Resend" option ONLY when timer is 0 */}
      {timer === 0 ? (
        <div className="auth-extra">
          <span className="toggle-text">Didn't receive code? </span>
          <button 
            type="button" 
            className="auth-link" 
            onClick={handleResend}
            disabled={loading}
          >
            Resend
          </button>
        </div>
      ) : (
        /* Optional: Show countdown text instead of hiding it completely */
        <div className="auth-extra" style={{ opacity: 0.6 }}>
          <span className="toggle-text" style={{ fontSize: "0.85rem" }}>
            Resend available in {timer}s
          </span>
        </div>
      )}
    </form>
    </Layout>
  );
}