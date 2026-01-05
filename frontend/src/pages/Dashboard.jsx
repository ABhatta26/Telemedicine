import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import Patient from "../components/Dashboard/Patient";
import Admin from "../components/Dashboard/Admin";
import React from "react";
import "../styles/layout.css";
import "../styles/base.css";
import "../styles/variables.css";

export default function Dashboard() {
  const { user } = useAuth(); // Access user info

  console.log("User Info:", user); // Debugging line

  // Role-based rendering
  // If user role is "admin", show Admin dashboard (without Layout wrapper - Admin has its own layout)
  // Otherwise, show Patient dashboard (with Layout wrapper)
  const isAdmin = user?.userRole === "admin";

  // Admin component has its own complete layout (sidebar + nav), so don't wrap it
  if (isAdmin) {
    return <Admin />;
  }

  // Patient dashboard needs the Layout wrapper
  return (
    <Layout>
      <Patient />
    </Layout>
  );
}
