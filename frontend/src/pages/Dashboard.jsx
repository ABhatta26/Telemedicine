import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import Patient from "../components/Dashboard/Patient";
import React from "react";
import "../styles/layout.css";
import "../styles/base.css";
import "../styles/variables.css"; 

export default function Dashboard() {
  const { user } = useAuth(); // Access user info

  console.log("User Info:", user.role); // Debugging line

  return (
    <Layout>
      <Patient />
    </Layout>

  );
}
