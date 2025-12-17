import React, { useState } from "react";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";
import "../styles/layout.css";
import "../styles/base.css";
import "../styles/variables.css";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot"

  return (
    <div className="auth-container">
      {mode === "login" && <LoginForm onForgot={() => setMode("forgot")} />}
      {mode === "signup" && <SignupForm />}
      {mode === "forgot" && <ForgotPasswordForm />}

      <div className="auth-toggle">
        {mode === "login" && (
          <p>
            Don’t have an account?{" "}
            <button className="auth-button" onClick={() => setMode("signup")}>
              Sign up
            </button>
          </p>
        )}
        {mode === "signup" && (
          <p>
            Already have an account?{" "}
            <button className="auth-button" onClick={() => setMode("login")}>
              Login
            </button>
          </p>
        )}
        {mode === "forgot" && (
          <p>
            Remembered your password?{" "}
            <button className="auth-button" onClick={() => setMode("login")}>
              Back to Login
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
