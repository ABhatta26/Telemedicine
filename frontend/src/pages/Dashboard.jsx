import React from "react";
import { useAuth } from "../context/AuthContext";

// Styles
import "../styles/layout.css";
import "../styles/base.css";
import "../styles/variables.css";

// Components
import Layout from "../components/layout/Layout";
import PatientDashboard from "../components/Dashboard/Patient";
import Admin from "../components/Dashboard/Admin";
import DoctorDashboardLayout from "../components/Dashboard/Doctor/DoctorDashboardLayout";
import DoctorDashboardBody from "../components/Dashboard/Doctor/DoctorDashboardBody";

export default function Dashboard() {
  const { user } = useAuth();

  // Safety Check: Don't render if user data isn't loaded yet
  if (!user) {
    return <div style={{ padding: "20px" }}>Loading user profile...</div>;
  }

  // Helper to get the role (checks both 'role' and 'userRole' to be safe)
  const role = user.role || user.userRole;

  console.log("Current User Role:", role);

  // --- RENDER LOGIC ---

  // 1. Admin View
  // (Admin usually has its own full-page layout inside the component)
  if (role === "admin") {
    return <Admin />;
  }

  // 2. Doctor View
  // (Uses the specific Doctor Layout)
  // if (role === "doctor") {
  //   return (
  //     <DoctorDashboardLayout>
  //       <DoctorDashboardBody />
  //     </DoctorDashboardLayout>
  //   );
  // }

  // 3. Patient View (Default)
  // (Wraps patient content in the standard website Layout)
   return (
  //   <Layout>
  //     <PatientDashboard />
  //   </Layout>
  <DoctorDashboardLayout>
        <DoctorDashboardBody />
     </DoctorDashboardLayout>
   );
}
