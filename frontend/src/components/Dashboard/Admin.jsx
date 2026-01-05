import React, { useState, useEffect } from "react";
import "../../styles/layout.css";
import "../../styles/base.css";
import "../../styles/variables.css";
import {
  FaUserMd,
  FaUsers,
  FaCalendarCheck,
  FaRupeeSign,
  FaExclamationCircle,
  FaCog,
  FaChartBar,
  FaClipboardList,
  FaBars,
  FaTimes,
  FaBell,
  FaCheckCircle,
  FaClock,
  FaBan,
  FaCircle,
  FaRedo,
  FaStar,
  FaMoneyBillWave,
  FaUserInjured,
  FaArrowDown,
  FaArrowUp,
  FaChevronUp,
  FaSearch,
  FaChevronDown,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import {
  getAppointmentStats,
  getTodayAppointments,
  getUpcomingAppointments,
  getPastAppointments,
} from "../../api/appointments";

/* ==========================================
   MOCK DATA
========================================== */
const admin = {
  fullName: "Swastika Akuli",
  role: "Super Admin",
  profilePic: "", // default image if empty
};

const TODAY_STATS = {
  doctors: { total: 86, verified: 60, pending: 20, blocked: 6, online: 15 },
  patients: { total: 1248, activeBookings: 324, pendingPayments: 12 },
  appointments: {
    today: 34,
    upcoming: 56,
    completed: 120,
    cancelled: 8,
    rescheduled: 5,
  },
  financial: {
    todayRevenue: "₹42,000",
    monthRevenue: "₹4,20,000",
    collected: "₹3,80,000",
    paid: "₹2,50,000",
    pendingPayouts: 5,
    completedPayouts: 40,
  },
};

const RECENT_APPOINTMENTS = [
  {
    id: "APT-201",
    patient: "Riya Sharma",
    doctor: "Dr. Emily Stone",
    time: "10:30 AM",
    status: "Confirmed",
  },
  {
    id: "APT-202",
    patient: "Amit Verma",
    doctor: "Dr. Mark Smith",
    time: "11:15 AM",
    status: "Completed",
  },
  {
    id: "APT-203",
    patient: "Neha Singh",
    doctor: "Dr. Susan Lee",
    time: "12:00 PM",
    status: "Pending",
  },
];

const PATIENTS = [
  {
    id: "P001",
    fullName: "Rahul Sharma",
    age: 32,
    gender: "Male",
    bookingStatus: "Active",
    paymentStatus: "Pending",
  },
  {
    id: "P002",
    fullName: "Priya Das",
    age: 28,
    gender: "Female",
    bookingStatus: "Active",
    paymentStatus: "Paid",
  },
  {
    id: "P003",
    fullName: "Amit Verma",
    age: 45,
    gender: "Male",
    bookingStatus: "None",
    paymentStatus: "Paid",
  },
  {
    id: "P004",
    fullName: "Neha Singh",
    age: 36,
    gender: "Female",
    bookingStatus: "Active",
    paymentStatus: "Pending",
  },
  {
    id: "P005",
    fullName: "Rohan Patel",
    age: 41,
    gender: "Male",
    bookingStatus: "None",
    paymentStatus: "Paid",
  },
  {
    id: "P006",
    fullName: "Sneha Kapoor",
    age: 29,
    gender: "Female",
    bookingStatus: "Active",
    paymentStatus: "Paid",
  },
  {
    id: "P007",
    fullName: "Kunal Mehta",
    age: 34,
    gender: "Male",
    bookingStatus: "None",
    paymentStatus: "Pending",
  },
];

const DOCTORS = [
  {
    id: "DOC-01",
    name: "Dr. Emily Stone",
    specialty: "Cardiology",
    status: "Approved",
  },
  {
    id: "DOC-02",
    name: "Dr. Mark Smith",
    specialty: "Dentistry",
    status: "Pending",
  },
  {
    id: "DOC-03",
    name: "Dr. Susan Lee",
    specialty: "Dermatology",
    status: "Approved",
  },
];

const TICKETS = [
  { id: "TK-1012", issue: "Refund request", priority: "High", status: "Open" },
  {
    id: "TK-1015",
    issue: "Doctor verification delay",
    priority: "Medium",
    status: "In Progress",
  },
];
const BOOKINGS_DATA = [
  {
    bookingId: "B001",
    reason: "Dental Checkup",
    doctor: "Dr. Smith",
    patient: "Riya Das",
    date: "02 Jan 2026",
    time: "10:30 AM",
  },
  {
    bookingId: "B002",
    reason: "Eye Test",
    doctor: "Dr. Sen",
    patient: "Amit Roy",
    date: "03 Jan 2026",
    time: "12:00 PM",
  },
];

const PAYMENTS_DATA = [
  {
    paymentId: "PAY001",
    name: "Riya Das",
    appointmentId: "APT101",
    lastVisit: "28 Dec 2025",
    amount: "₹1500",
  },
  {
    paymentId: "PAY002",
    name: "Amit Roy",
    appointmentId: "APT102",
    lastVisit: "29 Dec 2025",
    amount: "₹800",
  },
];

const COMPLAINT_CATEGORIES = [
  "Inappropriate Behavior",
  "Incorrect Medical Advice",
  "Missed Consultation",
  "Harassment or Misconduct",
  "Fraud or Misuse",
  "Billing Issue",
  "Technical Issue",
  "Other",
];

const COMPLAINTS = [
  {
    id: "C001",
    complainantRole: "Patient",
    against: "Doctor",
    category: "Missed Consultation",
    status: "Pending",
    evidence: "missed_consultation.pdf",
  },
  {
    id: "C002",
    complainantRole: "Doctor",
    against: "Patient",
    category: "Harassment or Misconduct",
    status: "Resolved",
    evidence: "chat_screenshots.zip",
  },
  {
    id: "C003",
    complainantRole: "Patient",
    against: "Doctor",
    category: "Incorrect Medical Advice",
    status: "Pending",
    evidence: "prescription_issue.pdf",
  },
  {
    id: "C004",
    complainantRole: "Patient",
    against: "Platform",
    category: "Technical Issue",
    status: "Resolved",
    evidence: "error_logs.png",
  },
];

/* ==========================================
   REUSABLE COMPONENTS
========================================== */
const StatusTag = ({ status }) => {
  const colors = {
    confirmed: "green",
    pending: "orange",
    completed: "blue",
    approved: "green",
    open: "red",
    "in progress": "orange",
  };
  const color = colors[status.toLowerCase()] || "gray";
  return <span className={`status-tag ${color}`}>{status}</span>;
};

const StatCard = ({ label, value, icon }) => (
  <div className="card p-20 stat-card">
    <div className="flex-between">
      <div className="stat-icon">{icon}</div>
      <h2 className="stat-value">{value}</h2>
    </div>
    <span className="small color-muted mt-5">{label}</span>
  </div>
);

/* ==========================================
   ADMIN DASHBOARD
========================================== */
export default function AdminDashboard() {
  const { mode, setMode, accent, setAccent } = useTheme();
  const [currentView, setCurrentView] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Appointment data state
  const [appointmentStats, setAppointmentStats] = useState({
    today: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    rescheduled: 0,
    total_today: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  const sidebarLinks = [
    { id: "overview", label: "Overview", icon: <FaClipboardList /> },
    { id: "doctors", label: "Doctors", icon: <FaUserMd /> },
    { id: "patients", label: "Patients", icon: <FaUserInjured /> },
    { id: "appointments", label: "Appointments", icon: <FaCalendarCheck /> },
    { id: "financial", label: "Financial Summary", icon: <FaRupeeSign /> },
    { id: "reports", label: "Complaints & Reports", icon: <FaChartBar /> },
    { id: "settings", label: "Settings", icon: <FaCog /> },
    { id: "support", label: "Support", icon: <FaExclamationCircle /> },
  ];

  const ACCENTS = [
    "violet",
    "rose",
    "emerald",
    "indigo",
    "orange",
    "teal",
    "pink",
    "lime",
  ];
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleMode = () => setMode(mode === "light" ? "dark" : "light");
  const [openTables, setOpenTables] = useState({
    today: false,
    upcoming: false,
    past: false,
  });

  // Fetch appointment data
  useEffect(() => {
    const fetchAppointmentData = async () => {
      try {
        setLoadingAppointments(true);
        const [stats, today, upcoming, past] = await Promise.all([
          getAppointmentStats(),
          getTodayAppointments(),
          getUpcomingAppointments(),
          getPastAppointments(),
        ]);

        setAppointmentStats(stats);
        setTodayAppointments(today);
        setUpcomingAppointments(upcoming);
        setPastAppointments(past);
      } catch (error) {
        console.error("Failed to fetch appointment data:", error);
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAppointmentData();
  }, []);

  const toggleTable = (table) => {
    setOpenTables((prev) => ({
      ...prev,
      [table]: !prev[table],
    }));
  };

  const [doctorView, setDoctorView] = useState(null);
  const [patientView, setPatientView] = useState(null);
  const [appointmentView, setAppointmentView] = useState(null);
  const totalComplaints = COMPLAINTS.length;
  const pendingComplaints = COMPLAINTS.filter(
    (c) => c.status === "Pending"
  ).length;
  const resolvedComplaints = COMPLAINTS.filter(
    (c) => c.status === "Resolved"
  ).length;
  const [activeComplaintView, setActiveComplaintView] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  return (
    <div className={`dashboard-wrapper ${mode} theme-${accent}`}>
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header flex-between">
          <h2>Admin Panel</h2>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        <nav className="sidebar-nav">
          {sidebarLinks.map((link) => (
            <div
              key={link.id}
              className={`sidebar-item ${
                currentView === link.id ? "active" : ""
              }`}
              onClick={() => setCurrentView(link.id)}
            >
              {link.icon} <span>{link.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* TOP NAV */}
        <div className="top-nav flex-between">
          <h3>
            {sidebarLinks.find((l) => l.id === currentView)?.label ||
              "Dashboard"}
          </h3>

          <div className="nav-right flex-center gap-15">
            {/* Admin Info */}
            <div className="admin-info flex-center gap-10">
              <img
                src={admin.profilePic || "/default-avatar.png"}
                alt="Admin"
                className="admin-avatar"
              />
              <div className="admin-details column-flex">
                <span className="admin-name">{admin.fullName}</span>
                <span className="admin-role">{admin.role}</span>
              </div>
            </div>

            {/* Notifications */}
            <div className="nav-item notifications">
              <FaBell /> <span className="badge">3</span>
            </div>

            {/* Accent Selector */}
            <select
              className="nav-item"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
            >
              {ACCENTS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            {/* Mode Toggle */}
            <button className="nav-item" onClick={toggleMode}>
              {mode === "light" ? "🌞" : "🌙"}
            </button>

            {/* Logout */}
            <button className="nav-item logout">Logout</button>
          </div>
        </div>

        {/* DASHBOARD BODY */}
        <div className="dashboard-body">
          {/* ================= OVERVIEW ================= */}
          {currentView === "overview" && (
            <>
              <h3 className="section-title">TODAY'S OVERVIEW</h3>

              {/* ===== ROW 1 ===== */}
              <div className="grid-4">
                {/* ================= TOTAL DOCTORS CARD ================= */}
                <div className="card overview-card p-20">
                  <div className="overview-header">
                    <FaUserMd className="overview-main-icon" />
                    <span>TOTAL DOCTORS</span>
                  </div>

                  <div className="overview-main">
                    {TODAY_STATS.doctors.total}
                  </div>

                  <div className="overview-divider"></div>

                  <div className="overview-sub">
                    <div>
                      <FaCheckCircle className="sub-icon success" />
                      Verified: {TODAY_STATS.doctors.verified}
                    </div>

                    <div>
                      <FaClock className="sub-icon warning" />
                      Pending: {TODAY_STATS.doctors.pending}
                    </div>

                    <div>
                      <FaBan className="sub-icon danger" />
                      Blocked: {TODAY_STATS.doctors.blocked}
                    </div>

                    <div>
                      <FaCircle className="sub-icon online" />
                      Online Now: {TODAY_STATS.doctors.online}
                    </div>
                  </div>
                </div>

                {/* ================= TOTAL PATIENTS ================= */}
                <div className="card overview-card p-20">
                  <div className="overview-header">
                    <FaUsers className="overview-main-icon" />
                    <span>TOTAL PATIENTS</span>
                  </div>

                  <div className="overview-main">
                    {TODAY_STATS.patients.total}
                  </div>

                  <div className="overview-divider"></div>

                  <div className="overview-sub">
                    <div>
                      <FaCheckCircle className="sub-icon success" />
                      Active Bookings: {TODAY_STATS.patients.activeBookings}
                    </div>
                    <div>
                      <FaClock className="sub-icon warning" />
                      Pending Payments: {TODAY_STATS.patients.pendingPayments}
                    </div>
                  </div>
                </div>

                {/* ================= TODAY'S APPOINTMENTS ================= */}
                <div className="card overview-card p-20">
                  <div className="overview-header">
                    <FaCalendarCheck className="overview-main-icon" />
                    <span>TODAY'S APPOINTMENTS</span>
                  </div>

                  <div className="overview-main">
                    {loadingAppointments ? "..." : appointmentStats.today}
                  </div>

                  <div className="overview-divider"></div>

                  <div className="overview-sub">
                    <div>
                      <FaClock className="sub-icon info" />
                      Upcoming:{" "}
                      {loadingAppointments ? "..." : appointmentStats.upcoming}
                    </div>
                    <div>
                      <FaCheckCircle className="sub-icon success" />
                      Completed:{" "}
                      {loadingAppointments ? "..." : appointmentStats.completed}
                    </div>
                    <div>
                      <FaBan className="sub-icon danger" />
                      Cancelled:{" "}
                      {loadingAppointments ? "..." : appointmentStats.cancelled}
                    </div>
                    <div>
                      <FaRedo className="sub-icon warning" />
                      Rescheduled:{" "}
                      {loadingAppointments
                        ? "..."
                        : appointmentStats.rescheduled}
                    </div>
                  </div>
                </div>

                {/* ================= REVENUE SUMMARY ================= */}
                <div className="card overview-card p-20">
                  <div className="overview-header">
                    <FaRupeeSign className="overview-main-icon" />
                    <span>REVENUE SUMMARY</span>
                  </div>

                  <div className="overview-main">
                    {TODAY_STATS.financial.todayRevenue}
                  </div>

                  <div className="overview-divider"></div>

                  <div className="overview-sub">
                    <div>
                      <FaMoneyBillWave className="sub-icon success" />
                      This Month: {TODAY_STATS.financial.monthRevenue}
                    </div>
                    <div>
                      <FaClock className="sub-icon warning" />
                      Pending Payouts: {TODAY_STATS.financial.pendingPayouts}
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== ROW 2 ===== */}
              <div className="grid-4 mt-20">
                {/* ================= COMPLAINTS ================= */}
                <div className="card overview-card p-20">
                  <div className="overview-header">
                    <FaExclamationCircle className="overview-main-icon" />
                    <span>COMPLAINTS OVERVIEW</span>
                  </div>

                  <div className="overview-divider"></div>

                  <div className="overview-sub">
                    <div>
                      <FaClock className="sub-icon warning" />
                      Pending: 7
                    </div>
                    <div>
                      <FaCheckCircle className="sub-icon success" />
                      Resolved: 18
                    </div>
                  </div>
                </div>

                {/* ================= REVIEWS & RATINGS ================= */}
                <div className="card overview-card p-20">
                  <div className="overview-header">
                    <FaStar className="overview-main-icon" />
                    <span>REVIEWS & RATINGS</span>
                  </div>

                  <div className="overview-main">⭐ 4.6 / 5</div>

                  <div className="overview-divider"></div>

                  <div className="overview-sub">
                    <div>
                      <FaUsers className="sub-icon info" />
                      Total Reviews: 1,240
                    </div>
                    <div>
                      <FaArrowDown className="sub-icon danger" />
                      Below Threshold: 32
                    </div>
                  </div>
                </div>

                {/* ================= FINANCIAL STATUS ================= */}
                <div className="card overview-card p-20">
                  <div className="overview-header">
                    <FaRupeeSign className="overview-main-icon" />
                    <span>FINANCIAL STATUS</span>
                  </div>

                  <div className="overview-divider"></div>

                  <div className="overview-sub">
                    <div>
                      <FaArrowDown className="sub-icon success" />
                      Collected: {TODAY_STATS.financial.collected}
                    </div>
                    <div>
                      <FaArrowUp className="sub-icon info" />
                      Paid to Doctors: {TODAY_STATS.financial.paid}
                    </div>
                    <div>
                      <FaClock className="sub-icon warning" />
                      Pending Payouts: {TODAY_STATS.financial.pendingPayouts}
                    </div>
                    <div>
                      <FaCheckCircle className="sub-icon success" />
                      Completed Payouts:{" "}
                      {TODAY_STATS.financial.completedPayouts}
                    </div>
                  </div>
                </div>

                {/* ================= NOTIFICATIONS ================= */}
                <div className="card overview-card p-20">
                  <div className="overview-header">
                    <FaBell className="overview-main-icon" />
                    <span>RECENT NOTIFICATIONS</span>
                  </div>

                  <div className="overview-divider"></div>

                  <ul className="overview-sub small">
                    <li>⏳ Doctor verification pending</li>
                    <li>💰 Payment received</li>
                    <li>❌ Appointment cancelled</li>
                    <li>📩 New support ticket</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* ================= APPOINTMENTS TABLES ================= */}
          {(currentView === "overview" || currentView === "appointments") && (
            <div className="card p-20 mt-30">
              <h3 className="section-title">APPOINTMENTS OVERVIEW</h3>

              {/* ===== TODAY'S APPOINTMENTS ===== */}
              <div className="table-section">
                <div
                  className="table-header"
                  onClick={() => toggleTable("today")}
                >
                  <span>Today's Appointments</span>
                  {openTables.today ? <FaChevronUp /> : <FaChevronDown />}
                </div>

                {openTables.today && (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingAppointments ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center" }}>
                            Loading...
                          </td>
                        </tr>
                      ) : todayAppointments.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center" }}>
                            No appointments for today
                          </td>
                        </tr>
                      ) : (
                        todayAppointments.map((apt) => (
                          <tr key={apt.id}>
                            <td>{apt.patient_name}</td>
                            <td>{apt.doctor_name}</td>
                            <td>
                              {new Date(
                                apt.appointment_date
                              ).toLocaleDateString()}
                            </td>
                            <td>{apt.appointment_time}</td>
                            <td
                              className={`status ${
                                apt.status === "completed"
                                  ? "success"
                                  : apt.status === "cancelled"
                                  ? "danger"
                                  : "info"
                              }`}
                            >
                              {apt.status.charAt(0).toUpperCase() +
                                apt.status.slice(1)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* ===== UPCOMING APPOINTMENTS ===== */}
              <div className="table-section mt-15">
                <div
                  className="table-header"
                  onClick={() => toggleTable("upcoming")}
                >
                  <span>Upcoming Appointments</span>
                  {openTables.upcoming ? <FaChevronUp /> : <FaChevronDown />}
                </div>

                {openTables.upcoming && (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingAppointments ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center" }}>
                            Loading...
                          </td>
                        </tr>
                      ) : upcomingAppointments.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center" }}>
                            No upcoming appointments
                          </td>
                        </tr>
                      ) : (
                        upcomingAppointments.map((apt) => (
                          <tr key={apt.id}>
                            <td>{apt.patient_name}</td>
                            <td>{apt.doctor_name}</td>
                            <td>
                              {new Date(
                                apt.appointment_date
                              ).toLocaleDateString()}
                            </td>
                            <td>{apt.appointment_time}</td>
                            <td className="status warning">
                              {apt.status.charAt(0).toUpperCase() +
                                apt.status.slice(1)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* ===== PAST APPOINTMENTS ===== */}
              <div className="table-section mt-15">
                <div
                  className="table-header"
                  onClick={() => toggleTable("past")}
                >
                  <span>Past Appointments</span>
                  {openTables.past ? <FaChevronUp /> : <FaChevronDown />}
                </div>

                {openTables.past && (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingAppointments ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center" }}>
                            Loading...
                          </td>
                        </tr>
                      ) : pastAppointments.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center" }}>
                            No past appointments
                          </td>
                        </tr>
                      ) : (
                        pastAppointments.map((apt) => (
                          <tr key={apt.id}>
                            <td>{apt.patient_name}</td>
                            <td>{apt.doctor_name}</td>
                            <td>
                              {new Date(
                                apt.appointment_date
                              ).toLocaleDateString()}
                            </td>
                            <td>{apt.appointment_time}</td>
                            <td
                              className={`status ${
                                apt.status === "completed"
                                  ? "success"
                                  : apt.status === "cancelled"
                                  ? "danger"
                                  : "info"
                              }`}
                            >
                              {apt.status.charAt(0).toUpperCase() +
                                apt.status.slice(1)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ================= DOCTORS SECTION ================= */}
          {currentView === "doctors" && (
            <>
              {/* ===== STATS ===== */}
              <div className="grid-4">
                <div
                  onClick={() => setDoctorView("all")}
                  style={{ cursor: "pointer" }}
                >
                  <StatCard
                    label="Total Doctors"
                    value={TODAY_STATS.doctors.total}
                    icon={<FaUserMd />}
                  />
                </div>

                <div
                  onClick={() => setDoctorView("pending")}
                  style={{ cursor: "pointer" }}
                >
                  <StatCard
                    label="Pending Verification"
                    value={TODAY_STATS.doctors.pending}
                    icon={<FaUserMd />}
                  />
                </div>

                <div
                  onClick={() => setDoctorView("blocked")}
                  style={{ cursor: "pointer" }}
                >
                  <StatCard
                    label="Blocked / Suspended"
                    value={TODAY_STATS.doctors.blocked}
                    icon={<FaUserMd />}
                  />
                </div>

                <StatCard
                  label="Online"
                  value={TODAY_STATS.doctors.online}
                  icon={<FaUserMd />}
                />
              </div>

              {/* ================= ALL DOCTORS ================= */}
              {doctorView === "all" && Array.isArray(DOCTORS) && (
                <div className="card p-20 mt-20">
                  <h3>All Doctors</h3>

                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Specialisation</th>
                        <th>Date of Joining</th>
                        <th>Verification</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {DOCTORS.map((doc) => (
                        <tr key={doc.id}>
                          <td>{doc.id}</td>
                          <td>{doc.name}</td>
                          <td>{doc.specialty}</td>
                          <td>{doc.joinedOn}</td>
                          <td>{doc.verified ? "Verified" : "Pending"}</td>
                          <td>
                            <StatusTag status={doc.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ================= PENDING VERIFICATION ================= */}
              {doctorView === "pending" && Array.isArray(DOCTORS) && (
                <div className="card p-20 mt-20">
                  <h3>Pending Verifications</h3>

                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Specialisation</th>
                        <th>Date Applied</th>
                        <th>Documents</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {DOCTORS.filter((d) => d.status === "Pending").map(
                        (doc) => (
                          <tr key={doc.id}>
                            <td>{doc.name}</td>
                            <td>{doc.specialty}</td>
                            <td>{doc.appliedOn}</td>
                            <td>
                              <a
                                href={doc.documents}
                                target="_blank"
                                rel="noreferrer"
                              >
                                View PDF
                              </a>
                            </td>
                            <td className="flex gap-10">
                              <button className="btn small">Approve</button>
                              <button className="btn-danger small">
                                Reject
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ================= BLOCKED ================= */}
              {doctorView === "blocked" && Array.isArray(DOCTORS) && (
                <div className="card p-20 mt-20">
                  <h3>Blocked / Suspended Doctors</h3>

                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Specialisation</th>
                        <th>Reason</th>
                      </tr>
                    </thead>

                    <tbody>
                      {DOCTORS.filter((d) => d.status === "Blocked").map(
                        (doc) => (
                          <tr key={doc.id}>
                            <td>{doc.id}</td>
                            <td>{doc.name}</td>
                            <td>{doc.specialty}</td>
                            <td>{doc.blockReason}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ================= PATIENTS SECTION ================= */}
          {currentView === "patients" && (
            <>
              {/* ===== STATS ===== */}
              <div className="grid-4">
                {/* TOTAL PATIENTS */}
                <div
                  onClick={() => setPatientView("all")}
                  style={{ cursor: "pointer" }}
                >
                  <StatCard
                    label="Total Patients"
                    value={Array.isArray(PATIENTS) ? PATIENTS.length : 0}
                    icon={<FaUsers />}
                  />
                </div>

                {/* ACTIVE BOOKINGS */}
                <StatCard
                  label="Active Bookings"
                  value={
                    Array.isArray(PATIENTS)
                      ? PATIENTS.filter((p) => p.bookingStatus === "Active")
                          .length
                      : 0
                  }
                  icon={<FaCalendarCheck />}
                />

                {/* PENDING PAYMENTS */}
                <StatCard
                  label="Pending Payments"
                  value={
                    Array.isArray(PATIENTS)
                      ? PATIENTS.filter((p) => p.paymentStatus === "Pending")
                          .length
                      : 0
                  }
                  icon={<FaMoneyBillWave />}
                />
              </div>

              {/* ================= PATIENT DETAILS TABLE ================= */}
              {patientView === "all" && Array.isArray(PATIENTS) && (
                <div className="card p-20 mt-20">
                  <h3>Registered Patients</h3>

                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Full Name</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Booking Status</th>
                        <th>Payment Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {PATIENTS.map((patient) => (
                        <tr key={patient.id}>
                          <td>{patient.id}</td>
                          <td>{patient.fullName}</td>
                          <td>{patient.age}</td>
                          <td>{patient.gender}</td>
                          <td>
                            <StatusTag status={patient.bookingStatus} />
                          </td>
                          <td>
                            <StatusTag status={patient.paymentStatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <p className="muted-text mt-10">
                    * Medical history and diagnosis details are not displayed
                    for privacy.
                  </p>
                </div>
              )}
            </>
          )}

          {/* ================= APPOINTMENTS SECTION ================= */}
          {currentView === "appointments" && (
            <div>
              {/* ===== STAT CARDS ===== */}
              <div className="grid-4">
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => setAppointmentView("bookings")}
                >
                  <StatCard
                    label="Active Bookings"
                    value={TODAY_STATS.patients.activeBookings}
                    icon={<FaUsers />}
                  />
                </div>

                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => setAppointmentView("payments")}
                >
                  <StatCard
                    label="Pending Payments"
                    value={TODAY_STATS.patients.pendingPayments}
                    icon={<FaUsers />}
                  />
                </div>
              </div>

              {/* ===== METRICS TABLE (UNCHANGED) ===== */}
              <div className="card p-20 mt-20">
                <h3 className="mt-0">Appointments Metrics</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      {Object.entries(TODAY_STATS.appointments).map(([key]) => (
                        <th key={key}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {Object.entries(TODAY_STATS.appointments).map(
                        ([key, val]) => (
                          <td key={key}>{val}</td>
                        )
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ================= ACTIVE BOOKINGS ================= */}
              {appointmentView === "bookings" && (
                <div className="card p-20 mt-20">
                  <h3>Active Bookings</h3>

                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Reason</th>
                        <th>Doctor</th>
                        <th>Patient</th>
                        <th>Date</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BOOKINGS_DATA.map((b) => (
                        <tr key={b.bookingId}>
                          <td>{b.bookingId}</td>
                          <td>{b.reason}</td>
                          <td>{b.doctor}</td>
                          <td>{b.patient}</td>
                          <td>{b.date}</td>
                          <td>{b.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ================= PENDING PAYMENTS ================= */}
              {appointmentView === "payments" && (
                <div className="card p-20 mt-20">
                  <h3>Pending Payments</h3>

                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Payment ID</th>
                        <th>Name</th>
                        <th>Appointment ID</th>
                        <th>Last Visit</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PAYMENTS_DATA.map((p) => (
                        <tr key={p.paymentId}>
                          <td>{p.paymentId}</td>
                          <td>{p.name}</td>
                          <td>{p.appointmentId}</td>
                          <td>{p.lastVisit}</td>
                          <td>{p.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* FINANCIAL SECTION */}
          {currentView === "financial" && (
            <div className="card p-20">
              <h3 className="mt-0">Financial Summary</h3>
              <div className="grid-4">
                <StatCard
                  label="Revenue Today"
                  value={TODAY_STATS.financial.todayRevenue}
                  icon={<FaRupeeSign />}
                />
                <StatCard
                  label="Revenue This Month"
                  value={TODAY_STATS.financial.monthRevenue}
                  icon={<FaRupeeSign />}
                />
                <StatCard
                  label="Collected"
                  value={TODAY_STATS.financial.collected}
                  icon={<FaRupeeSign />}
                />
                <StatCard
                  label="Paid to Doctors"
                  value={TODAY_STATS.financial.paid}
                  icon={<FaRupeeSign />}
                />
                <StatCard
                  label="Pending Payouts"
                  value={TODAY_STATS.financial.pendingPayouts}
                  icon={<FaRupeeSign />}
                />
                <StatCard
                  label="Completed Payouts"
                  value={TODAY_STATS.financial.completedPayouts}
                  icon={<FaRupeeSign />}
                />
              </div>
              <div className="chart-placeholder mt-20">
                📈 Monthly Financial Chart Placeholder
              </div>
            </div>
          )}

          {/* ================= REPORTS ================= */}
          {currentView === "reports" && (
            <div className="card p-20">
              <h3 className="mt-0">Complaints & Reports</h3>

              {/* ===== STATS CARDS ===== */}
              <div className="grid-3 mt-20">
                <div
                  className="card clickable"
                  onClick={() => setActiveComplaintView("all")}
                >
                  <h4>TOTAL COMPLAINTS</h4>
                  <h2>{COMPLAINTS.length}</h2>
                </div>

                <div
                  className="card clickable"
                  onClick={() => setActiveComplaintView("pending")}
                >
                  <h4>PENDING / RESOLVED</h4>
                  <h2 className="text-warning">
                    {COMPLAINTS.filter((c) => c.status === "Pending").length}
                  </h2>
                </div>

                <div
                  className="card clickable"
                  onClick={() => setActiveComplaintView("resolved")}
                >
                  <h4>RESOLVED</h4>
                  <h2 className="text-success">
                    {COMPLAINTS.filter((c) => c.status === "Resolved").length}
                  </h2>
                </div>
              </div>

              <div className="table-toolbar mt-25">
                <div className="search-pill">
                  {/* Search Icon */}
                  <FaSearch className="search-pill-icon" />

                  {/* Search Input */}
                  <input
                    type="text"
                    placeholder="Search complaints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  {/* Category Filter */}
                  <select
                    className="search-pill-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="All">All Categories</option>
                    <option>Billing Issue</option>
                    <option>Technical Issue</option>
                    <option>Missed Consultation</option>
                    <option>Harassment or Misconduct</option>
                    <option>Fraud or Misuse</option>
                    <option>Incorrect Medical Advice</option>
                    <option>Other</option>
                  </select>

                  {/* Search Button */}
                  <button className="search-pill-btn">Search</button>
                </div>
              </div>

              {/* ===== TABLE ===== */}
              <table className="data-table mt-20">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Complainant Role</th>
                    <th>Against</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Evidence</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {COMPLAINTS.filter(
                    (c) =>
                      activeComplaintView === "all" ||
                      c.status.toLowerCase() === activeComplaintView
                  )
                    .filter(
                      (c) =>
                        categoryFilter === "All" ||
                        c.category === categoryFilter
                    )
                    .filter((c) =>
                      `${c.role} ${c.against} ${c.category}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    ).length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-row">
                        No complaints found
                      </td>
                    </tr>
                  ) : (
                    COMPLAINTS.filter(
                      (c) =>
                        activeComplaintView === "all" ||
                        c.status.toLowerCase() === activeComplaintView
                    )
                      .filter(
                        (c) =>
                          categoryFilter === "All" ||
                          c.category === categoryFilter
                      )
                      .filter((c) =>
                        `${c.role} ${c.against} ${c.category}`
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      )
                      .map((c) => (
                        <tr key={c.id}>
                          <td>{c.id}</td>
                          <td>{c.role}</td>
                          <td>{c.against}</td>
                          <td>{c.category}</td>
                          <td>
                            <span
                              className={`status ${
                                c.status === "Pending" ? "warning" : "success"
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td>
                            <button className="btn-outline small">View</button>
                          </td>
                          <td>
                            {c.status === "Pending" ? (
                              <div className="action-stack">
                                <input type="file" />
                                <button className="btn small">Resolve</button>
                              </div>
                            ) : (
                              <button className="btn-outline small">
                                View Resolution
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* SETTINGS */}
          {currentView === "settings" && (
            <div className="card p-20">
              <h3 className="mt-0">Settings</h3>
              <div className="chart-placeholder">⚙️ Settings Options</div>
            </div>
          )}

          {/* SUPPORT */}
          {currentView === "support" && (
            <div className="card p-20">
              <h3 className="mt-0">Support Tickets</h3>
              <div className="column-flex mt-15">
                {TICKETS.map((ticket) => (
                  <div key={ticket.id} className="support-ticket column-flex">
                    <div className="flex-between">
                      <strong>{ticket.issue}</strong>
                      <StatusTag status={ticket.status} />
                    </div>
                    <div className="small color-muted">
                      {ticket.id} • Priority: {ticket.priority}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
