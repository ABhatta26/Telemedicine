//auth/ForgotPasswordForm.jsx
import React, { useState } from "react";
import "../../styles/layout.css";
import "../../styles/base.css";
import "../../styles/variables.css";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Call your password reset API here
    console.log("Password reset requested for:", email);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2 className="auth-title">Reset Password</h2>
      <p className="auth-description">
        Enter your email address and we’ll send you instructions to reset your password.
      </p>
      <input
        type="email"
        name="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="auth-input"
        required
      />
      <button type="submit" className="auth-submit">
        Send Reset Link
      </button>
    </form>
  );
}
