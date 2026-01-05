// auth/SignupForm.jsx
import React, { useState, useEffect } from "react";
import "../../styles/layout.css"
import "../../styles/base.css"
import "../../styles/variables.css"

export default function SignupForm({ onSignupSuccess }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    userRole: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Toggle States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password Strength State
  const [strength, setStrength] = useState({ label: "", color: "#ccc", width: "0%" });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  // Real-time Password Strength Check
  useEffect(() => {
    const pass = formData.password;
    if (!pass) {
      setStrength({ label: "", color: "#ccc", width: "0%" });
      return;
    }

    let score = 0;
    // 1. Length Check
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++; 
    // 2. Complexity Checks
    if (/[A-Z]/.test(pass)) score++; 
    if (/[a-z]/.test(pass)) score++; 
    if (/[0-9]/.test(pass)) score++; 
    if (/[^A-Za-z0-9]/.test(pass)) score++; 

    // Determine Status
    if (score < 3) {
      setStrength({ label: "Weak", color: "tomato", width: "33%" });
    } else if (score < 5) {
      setStrength({ label: "Medium", color: "orange", width: "66%" });
    } else {
      setStrength({ label: "Strong", color: "limegreen", width: "100%" });
    }
  }, [formData.password]);

  const handleChange = (e) => {
    setError("");
    setOk("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

    if (!passwordRegex.test(formData.password)) {
      setError(
        "Password must be 8-16 characters, include 1 uppercase, 1 lowercase, 1 number, 1 special char (@$!%*?&), and no spaces."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userRole: formData.userRole || "Patient",
          username: formData.username,
          email: formData.email,
          phone: formData.phone || null,
          password: formData.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Signup failed");
      }

      setOk("Account created successfully. Please log in.");
      
      if (onSignupSuccess) {
        onSignupSuccess(formData.email);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // SVG Icons
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
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2 className="auth-title">Create Account</h2>

      {error && <p className="auth-error">{error}</p>}
      {ok && <p className="auth-success">{ok}</p>}

      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        className="auth-input"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="auth-input"
        required
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange}
        className="auth-input"
      />

      {/* Password Wrapper */}
      <div className="password-wrapper">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="auth-input"
          required
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setShowPassword(!showPassword)}
          title={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>

      {/* --- PASSWORD STRENGTH INDICATOR --- */}
      {formData.password && (
        <div className="strength-container">
          <div className="strength-header">
             <span className="strength-label">Password Strength:</span>
             {/* Note: Color remains inline because it is dynamic state */}
             <span className="strength-value" style={{ color: strength.color }}>
               {strength.label}
             </span>
          </div>
          {/* Progress Bar */}
          <div className="strength-bar-bg">
             {/* Note: Width and Background remain inline because they are dynamic state */}
             <div 
               className="strength-bar-fill" 
               style={{ width: strength.width, background: strength.color }}
             ></div>
          </div>
        </div>
      )}

      {/* Confirm Password Wrapper */}
      <div className="password-wrapper">
        <input
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="auth-input"
          required
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          title={showConfirmPassword ? "Hide password" : "Show password"}
        >
          {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>

      <button type="submit" className="auth-submit" disabled={loading}>
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
}