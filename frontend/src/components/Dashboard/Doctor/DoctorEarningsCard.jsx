// src/components/Dashboard/Doctor/DoctorEarningsCard.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchEarningsSummary,
  fetchPaymentHistory,
} from "../../../api/earnings";

/* ===============================
   DATE HELPERS
================================ */
function isToday(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

function isThisMonth(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/* ===============================
   COMPONENT
================================ */
export default function DoctorEarningsCard() {
  const { accessToken } = useAuth();

  const [expanded, setExpanded] = useState(false);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [payments, setPayments] = useState([]);

  /* ===============================
     INITIAL LOAD (LAST 30 DAYS)
  =============================== */
  useEffect(() => {
    if (!accessToken) return;

    const today = new Date();
    const from = new Date();
    from.setDate(today.getDate() - 30);

    const params = {
      from_date: from.toISOString().slice(0, 10),
      to_date: today.toISOString().slice(0, 10),
    };

    fetchPaymentHistory(accessToken, params).then(setPayments);
  }, [accessToken]);

  /* ===============================
     GLOBAL SUMMARY (NOT FILTERED)
  =============================== */
  const todayAmount = payments
    .filter(p => p.status === "completed" && isToday(p.created_at))
    .reduce((sum, p) => sum + p.amount, 0);

  const monthAmount = payments
    .filter(p => p.status === "completed" && isThisMonth(p.created_at))
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments.filter(p => p.status === "pending");

  const pendingAmount = pendingPayments.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  /* ===============================
     FILTERED PAYMENT HISTORY ONLY
  =============================== */
  const filteredPayments = useMemo(() => {
    let data = payments;

    if (fromDate) {
      data = data.filter(
        p => new Date(p.created_at) >= new Date(fromDate)
      );
    }

    if (toDate) {
      data = data.filter(
        p => new Date(p.created_at) <= new Date(toDate)
      );
    }

    return data;
  }, [payments, fromDate, toDate]);

  /* ===============================
     UI
  =============================== */
  return (
    <div className="card p-20">
      {/* HEADER */}
      <div className="flex-between mb-15">
        <h3 className="m-0">Earnings</h3>
        <button
          className="btn-outline small"
          onClick={() => setExpanded(p => !p)}
        >
          {expanded ? "Hide Details" : "View Details"}
        </button>
      </div>

      {/* SUMMARY */}
      <div className="earnings-summary">
        <div>
          <span>Today</span>
          <strong>₹{todayAmount}</strong>
        </div>

        <div>
          <span>This Month</span>
          <strong>₹{monthAmount}</strong>
        </div>

        <div className="pending-col">
          <span>Pending</span>
          <strong className="color-warn">₹{pendingAmount}</strong>
          <button
            className="link-btn"
            onClick={() => setShowPendingOnly(p => !p)}
          >
            {showPendingOnly
              ? "Hide Pending Payments"
              : "View Pending Payments"}
          </button>
        </div>
      </div>

      {/* GLOBAL PENDING SECTION (UNCHANGED BY FILTERS) */}
      {showPendingOnly && (
        <div className="pending-section mt-20">
          <h4 className="mb-10">Pending Payments</h4>

          <div className="payment-table pending-highlight">
            <div className="payment-row header">
              <span>Date</span>
              <span>Patient</span>
              <span>Method</span>
              <span>Status</span>
              <span className="text-right">Amount</span>
            </div>

            {pendingPayments.map(p => (
              <div key={p.id} className="payment-row">
                <span>
                  {new Date(p.created_at).toLocaleDateString("en-GB")}
                </span>
                <strong>{p.patient_name}</strong>
                <span>{p.method}</span>
                <span className="status-pending">pending</span>
                <strong className="text-right">₹{p.amount}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXPANDED DETAILS */}
      {expanded && (
        <>
          {/* DATE FILTER */}
          <div className="earnings-filter mt-20">
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
            />
          </div>

          {/* PAYMENT HISTORY */}
          <h4 className="mt-20 mb-10">Payment History</h4>

          <div className="payment-table">
            <div className="payment-row header">
              <span>Date</span>
              <span>Patient</span>
              <span>Method</span>
              <span>Status</span>
              <span className="text-right">Amount</span>
            </div>

            {filteredPayments.map(p => (
              <div key={p.id} className="payment-row">
                <span>
                  {new Date(p.created_at).toLocaleDateString("en-GB")}
                </span>
                <strong>{p.patient_name}</strong>
                <span>{p.method}</span>
                <span
                  className={
                    p.status === "pending"
                      ? "status-pending"
                      : "status-success"
                  }
                >
                  {p.status}
                </span>
                <strong className="text-right">₹{p.amount}</strong>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}