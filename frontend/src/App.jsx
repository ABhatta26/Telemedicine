// App.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SignupForm from "./components/auth/SignupForm.jsx";
import ForgotPasswordForm from "./components/auth/ForgotPasswordForm.jsx";
import FamilyComponent from "./components/common/FamilyComponent.jsx";
import ProfileModal from "./components/common/ProfileModal.jsx";
import TwoFacto from "./components/common/2Facto.jsx";
import "./styles/layout.css";
import "./styles/base.css";
import "./styles/variables.css";

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
    case "/addfamilymembers":
      return <FamilyComponent />;
    case "/profile":
      return <ProfileModal />;
    case "/2facto":
      return <TwoFacto email={user.email} onSuccess={() => window.location.hash = "/profile"} />;
    default:
      return <Dashboard />;
  }
}

