import Layout from "../components/layout/Layout";
import React from "react";

export default function Dashboard() {
  return (
    <Layout>
      <h2 style={{ marginTop: 0 }}>Dashboard</h2>
      <p style={{ color: "var(--color-muted)" }}>
        Your common work area. Add widgets, charts, and notifications here.
      </p>
    </Layout>
  );
}
