import React from "react";
export default function Avatar({ src, name }) {
  if (src) return <img src={src} alt={name} style={{ width: 32, height: 32, borderRadius: "50%" }} />;
  const initials = (name || "?").split(" ").map(s => s[0]).join("").slice(0,2).toUpperCase();
  return (
    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-primary)",
                  display: "grid", placeItems: "center", color: "white", fontWeight: 700 }}>
      {initials}
    </div>
  );
}
