import React, { useState, useEffect, useMemo } from "react";
import "../../styles/layout.css";
import "../../styles/base.css";

// ==========================================
// 1. MOCK DATA 
// ==========================================

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
          <a href={appointment.meetingLink} target="_blank" rel="noreferrer" className="btn w-full block text-center no-decoration">Join Video Call</a>
        ) : (
          <button className="btn w-full opacity-50 cursor-not-allowed" disabled>Join Enabled 10m Before</button>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 3. MAIN DASHBOARD COMPONENT
// ==========================================

export default function PatientDashboard() {
  const [currentView, setCurrentView] = useState("overview"); // overview | doctors | support
  
  // --- INTEGRATION STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("name"); // 'name' | 'specialization' | 'id'
  const [allDoctors, setAllDoctors] = useState([]);      // Master list from API
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- API INTEGRATION FUNCTION ---
  const fetchDoctors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/doctors/search`);
      
      if (!response.ok) {
        throw new Error("Failed to connect to server");
      }

      const data = await response.json();
      const safeData = Array.isArray(data) ? data : [];
      
      setAllDoctors(safeData);
      
    } catch (err) {
      console.error(err);
      setError("Could not load doctors. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  // --- EFFECT: Load Data on View Switch ---
  useEffect(() => {
    // Only fetch if we haven't loaded data yet to save bandwidth
    if(currentView === 'doctors' && allDoctors.length === 0) {
        fetchDoctors();
    }
  }, [currentView, allDoctors.length]);

  // --- INSTANT FILTERING LOGIC (Using useMemo) ---
  const filteredDoctors = useMemo(() => {
    // CHANGE 1: Return empty array [] if no search query
    // This ensures results are hidden until the user types
    if (!searchQuery) return [];

    const lowerQuery = searchQuery.toLowerCase().trim();

    return allDoctors.filter(doc => {
      // Safely access properties to prevent crashes on missing data
      const name = (doc.name || "").toLowerCase();
      const specialization = (doc.specialization || doc.specialty || "").toLowerCase();
      const id = String(doc.id || "");

      if (searchType === 'name') {
        return name.includes(lowerQuery);
      } 
      else if (searchType === 'specialization') {
        return specialization.includes(lowerQuery);
      } 
      else if (searchType === 'id') {
        return id.includes(lowerQuery);
      }
      return false;
    });
  }, [searchQuery, searchType, allDoctors]);


  // --- RENDER ---
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
          
          {/* VIEW: OVERVIEW */}
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

          {/* VIEW: DOCTORS SEARCH */}
          {currentView === "doctors" && (
            <div className="card p-20">
              <div className="flex-between">
                <h3 className="mt-0">Search Specialists</h3>
                {/* Only show count if user has searched */}
                {searchQuery && (
                    <span className="small color-muted">{filteredDoctors.length} found</span>
                )}
              </div>
              
              {/* SEARCH CONTROLS */}
              <div className="flex-center gap-10" style={{ gap: '10px' }}>
                <select 
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="input-field"
                  style={{ width: 'auto', flexShrink: 0, cursor: 'pointer' }}
                >
                  <option value="name">Name</option>
                  <option value="specialization">Specialization</option>
                  <option value="id">Doctor ID</option>
                </select>

                <input 
                  type="text" 
                  placeholder={`Filter by ${searchType}...`} 
                  className="input-field" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              {error && <div className="mt-15 color-crimson small">{error}</div>}

              {/* RESULTS LIST */}
              <div className="mt-15 column-flex">
                {isLoading && <p className="text-center small">Loading directory...</p>}

                {/* CHANGE 2: Show prompt if user hasn't typed anything yet */}
                {!isLoading && !searchQuery && (
                    <div className="text-center p-20">
                        <p className="color-muted">Start typing to search for doctors...</p>
                    </div>
                )}

                {/* CHANGE 3: Only show "No Match" if user HAS typed something and found nothing */}
                {!isLoading && searchQuery && filteredDoctors.length === 0 && !error && (
                    <div className="text-center p-20 border-dashed">
                        <p className="color-muted">No doctors match "{searchQuery}"</p>
                        <button className="btn-outline small" onClick={() => setSearchQuery("")}>Clear Search</button>
                    </div>
                )}

                {filteredDoctors.map(doc => (
                  <div key={doc.id} className="doctor-result-item">
                    <div>
                      <strong>{doc.name}</strong>
                      <div className="small color-primary">
                        {doc.specialization || doc.specialty || "General Specialist"}
                      </div>
                      <div className="small color-muted">
                        ID: {doc.id} {doc.hospital ? `• ${doc.hospital}` : ""}
                      </div>
                    </div>
                    <button className="btn-outline small">Book Visit</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: SUPPORT */}
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