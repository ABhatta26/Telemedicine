// App.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SignupForm from "./components/auth/SignupForm";
import ForgotPasswordForm from "./components/auth/ForgotPasswordForm";

export default function App() {
  const { user } = useAuth();
  const [route, setRoute] = useState(
    window.location.hash.replace("#", "") || "/dashboard"
  );

  // Listen for hash changes so UI updates immediately
  useEffect(() => {
    const onHashChange = () =>
      setRoute(window.location.hash.replace("#", "") || "/dashboard");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // If user is not logged in, show auth-related screens
  if (!user) {
    switch (route) {
      case "/signup":
        return <SignupForm />;
      case "/forgot-password":
        return <ForgotPasswordForm />;
      default:
        return <Login />;
    }
  }

  // If user is logged in, show app screens
  switch (route) {
    case "/dashboard":
      return <Dashboard />;
    default:
      return <Dashboard />;
  }
}
