import React, { useState, useEffect } from "react";
import "../../styles/layout.css";
import "../../styles/base.css";

// ==========================================
// 1. MOCK DATA
// ==========================================
const DOCTORS_TABLE = [
  { id: 1, name: "Dr. Emily Stone", specialty: "Cardiologist", hospital: "City Heart Center" },
  { id: 2, name: "Dr. Mark Smith", specialty: "Dentist", hospital: "Bright Smile Clinic" },
  { id: 3, name: "Dr. Susan Lee", specialty: "Dermatologist", hospital: "Skin & Glow" },
  { id: 4, name: "Dr. James Doe", specialty: "General Physician", hospital: "Community Health" },
];

const NEXT_APPT = {
  id: 101,
  doctor: "Dr. Emily Stone",
  specialty: "Cardiologist",
  time: new Date(new Date().getTime() + 5 * 60000).toISOString(), 
  status: "Confirmed",
  meetingLink: "https://meet.google.com/jem-nijr-fkg",
};

const RECORDS = [
  { id: 1, type: "Prescription", title: "Viral Fever Meds", date: "2023-10-15", doctor: "Dr. Smith" },
  { id: 2, type: "Lab Report", title: "Blood Test (CBC)", date: "2023-10-10", doctor: "Lab A" },
];

const TICKETS = [
  { id: "TK-9921", subject: "Lab Report Delay", status: "In Progress", date: "2023-11-20" },
  { id: "TK-9850", subject: "Billing Query", status: "Under Review", date: "2023-11-18" },
];

// ==========================================
// 2. REUSABLE SUB-COMPONENTS
// ==========================================

const NextAppointmentCard = ({ appointment }) => {
  const [canJoin, setCanJoin] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!appointment) return;
    const checkTime = () => {
      const now = new Date();
      const apptTime = new Date(appointment.time);
      const diffInMinutes = (apptTime - now) / 1000 / 60;
      setCanJoin(appointment.status === "Confirmed" && diffInMinutes <= 10 && diffInMinutes > -60);
      setTimeLeft(diffInMinutes > 0 ? `Starts in ${Math.ceil(diffInMinutes)} mins` : "In Progress");
    };
    checkTime();
    const interval = setInterval(checkTime, 60000); 
    return () => clearInterval(interval);
  }, [appointment]);

  if (!appointment) return <div className="card p-20">No upcoming appointments.</div>;

  return (
    <div className="card p-24 border-left-accent column-flex">
      <div className="flex-between">
        <div>
          <h3 className="m-0">Upcoming Consultation</h3>
          <p className="mt-0 color-muted">{appointment.specialty}</p>
        </div>
        <span className="btn-outline small">{timeLeft}</span>
      </div>
      <div className="flex-center">
        <div className="avatar-md"></div>
        <div>
          <strong>{appointment.doctor}</strong>
          <div className="small color-muted">Today</div>
        </div>
      </div>
      <div className="mt-10">
        {canJoin ? (
          <a href={appointment.meetingLink} target="_blank" className="btn w-full block text-center no-decoration">Join Video Call</a>
        ) : (
          <button className="btn w-full opacity-50 cursor-not-allowed" disabled>Join Enabled 10m Before</button>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 3. MAIN DASHBOARD SPA
// ==========================================

export default function PatientDashboard() {
  const [currentView, setCurrentView] = useState("overview"); // overview | doctors | support
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query.trim() === "") setFilteredDoctors([]);
    else {
      const results = DOCTORS_TABLE.filter(doc => 
        doc.name.toLowerCase().includes(query) || doc.specialty.toLowerCase().includes(query)
      );
      setFilteredDoctors(results);
    }
  };

  return (
    <div className="dashboard-stack">
      {/* SPA NAVIGATION */}
      <div className="dashboard-nav">
        <span className={`nav-tab ${currentView === "overview" ? "active" : ""}`} onClick={() => setCurrentView("overview")}>Overview</span>
        <span className={`nav-tab ${currentView === "doctors" ? "active" : ""}`} onClick={() => setCurrentView("doctors")}>Find Doctors</span>
        <span className={`nav-tab ${currentView === "support" ? "active" : ""}`} onClick={() => setCurrentView("support")}>Support Center</span>
      </div>

      <div className="dashboard-grid">
        {/* LEFT MAIN CONTENT */}
        <div className="column-flex">
          
          {currentView === "overview" && (
            <>
              <NextAppointmentCard appointment={NEXT_APPT} />
              <div className="card p-20">
                <h3 className="mt-0">Health Timeline</h3>
                <div className="timeline-container">
                  {RECORDS.map(rec => (
                    <div key={rec.id} className="relative">
                      <div className="timeline-dot"></div>
                      <strong>{rec.title}</strong>
                      <div className="small color-muted">{rec.type} • {rec.date} • {rec.doctor}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {currentView === "doctors" && (
            <div className="card p-20">
              <h3 className="mt-0">Search Specialists</h3>
              <div className="flex-center">
                <input type="text" placeholder="Name or Specialization..." className="input-field" value={searchQuery} onChange={handleSearch} />
                <button className="btn">Search</button>
              </div>
              <div className="mt-15 column-flex">
                {filteredDoctors.map(doc => (
                  <div key={doc.id} className="doctor-result-item">
                    <div>
                      <strong>{doc.name}</strong>
                      <div className="small color-primary">{doc.specialty}</div>
                    </div>
                    <button className="btn-outline small">Book Visit</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === "support" && (
            <div className="card p-20">
              <h3 className="mt-0">Active Tickets</h3>
              <div className="column-flex mt-15">
                {TICKETS.map(ticket => (
                  <div key={ticket.id} className="support-ticket column-flex">
                    <div className="flex-between">
                      <strong>{ticket.subject}</strong>
                      <span className="status-tag">{ticket.status}</span>
                    </div>
                    <div className="small color-muted">{ticket.id} • {ticket.date}</div>
                  </div>
                ))}
              </div>
              <button className="btn-outline w-full mt-15 no-border color-primary">View Resolution History →</button>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR (Shared across views) */}
        <div className="column-flex">
          <div className="card p-20 emergency-card">
             <h4 className="m-0 flex-center">🚨 Emergency Help</h4>
             <p className="small mb-15">Immediate help for medical crisis or hotlines.</p>
             <button className="btn w-full bg-crimson">Call Ambulance / SOS</button>
          </div>

          <div className="card p-20">
            <h3 className="mt-0">Quick Actions</h3>
            <div className="quick-actions-grid">
              <button className="btn-outline action-item">💊 <br/> Meds</button>
              <button className="btn-outline action-item">🧪 <br/> Labs</button>
              <button className="btn-outline action-item">🧾 <br/> Bills</button>
              <button className="btn-outline action-item" onClick={() => setCurrentView("support")}>🎧 <br/> Support</button>
            </div>
          </div>

          <div className="card p-20 attention-card">
            <h4 className="m-0">Attention Needed</h4>
            <ul className="mt-10 p-20 small">
              <li>1 Unpaid Invoice (INR 150.00)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

