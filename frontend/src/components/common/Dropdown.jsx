import React,{ useEffect, useRef, useState } from "react";

export default function Dropdown({ trigger, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onDocClick = e => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => setOpen(p => !p)}>{trigger}</div>
      {open && (
        <div className="card" style={{ position: "absolute", right: 0, marginTop: 8, padding: 8, minWidth: 180 }}>
          {children}
        </div>
      )}
    </div>
  );
}
