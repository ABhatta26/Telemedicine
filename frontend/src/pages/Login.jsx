// pages/Login.jsx (or wherever this file is located)
import React, { useState } from "react";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";
import OtpVerificationForm from "../components/auth/OtpVerificationForm"; // Import the new form
import "../styles/layout.css";
import "../styles/base.css";
import "../styles/variables.css";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot" | "otp"
  const [pendingEmail, setPendingEmail] = useState(""); // Store email for OTP

  // Handler: Called when SignupForm creates account successfully
  const handleSignupSuccess = (email) => {
    setPendingEmail(email);
    setMode("otp");
  };

  // Handler: Called when OTP is verified successfully
  const handleOtpSuccess = () => {
    // Navigate to dashboard or back to login
    // window.location.hash = "/dashboard"; 
    // OR
    setMode("login"); 
  };

  return (
    <div className="auth-page-background">
      <div className="auth-glass-card">
        
        {/* Main Form Area */}
        <div className="auth-card-content">
          {mode === "login" && <LoginForm onForgot={() => setMode("forgot")} />}
          
          {/* Pass the success handler to SignupForm */}
          {mode === "signup" && <SignupForm onSignupSuccess={handleSignupSuccess} />}
          
          {mode === "forgot" && <ForgotPasswordForm />}
          
          {/* Render OTP Form and pass the email */}
          {mode === "otp" && (
            <OtpVerificationForm 
              email={pendingEmail} 
              onSuccess={handleOtpSuccess} 
            />
          )}
        </div>

        {/* Footer Area: Handles Toggles */}
        <div className="auth-card-footer">
          
          {mode === "login" && (
            <div className="footer-row">
              <span className="toggle-text">Don’t have an account?</span>
              <button className="toggle-action-button outline" onClick={() => setMode("signup")}>
                Sign up
              </button>
            </div>
          )}

          {mode === "signup" && (
            <div className="footer-stack">
              <div className="footer-row">
                <span className="toggle-text">Already have an account?</span>
                <button className="toggle-action-button outline" onClick={() => setMode("login")}>
                  Login
                </button>
              </div>
            </div>
          )}

          {mode === "forgot" && (
            <div className="footer-row">
              <span className="toggle-text">Remembered your password?</span>
              <button className="toggle-action-button outline" onClick={() => setMode("login")}>
                Back to Login
              </button>
            </div>
          )}

          {/* OTP FOOTER */}
          {mode === "otp" && (
            <div className="footer-row">
              <span className="toggle-text">Wrong email?</span>
              <button className="toggle-action-button outline" onClick={() => setMode("signup")}>
                Back to Signup
              </button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}