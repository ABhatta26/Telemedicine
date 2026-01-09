import React, { useState, useEffect, useMemo, useRef } from "react";
import "../../styles/layout.css";
import "../../styles/base.css";

// ==========================================
// 1. MOCK DATA 
// ==========================================

const NEXT_APPT = {
  id: 101,
  doctor: "Dr. Emily Stone",
  specialty: "Cardiologist",
  time: new Date(new Date().getTime() + 5 * 60000).toISOString(), // Starts in 5 mins
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

// --- NEW: Chat Interface Component ---
const LiveChatInterface = ({ doctor, onClose }) => {
  // UPDATED: Mock Messages for Heart Patient vs Cardiologist
  const [messages, setMessages] = useState([
    { id: 1, sender: 'patient', text: "Hello Dr. Stone, I've been feeling some heaviness in my chest since morning." },
    { id: 2, sender: 'doctor', text: "I see. Is it a sharp stabbing pain or more like pressure? Does it radiate to your arm?" },
    { id: 3, sender: 'patient', text: "It's more like pressure/tightness. My left arm feels a bit numb too." },
    { id: 4, sender: 'doctor', text: "Okay, please sit down and rest immediately. Have you taken your BP medication today?" },
  ]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg = { id: Date.now(), sender: 'patient', text: inputText };
    setMessages([...messages, newMsg]);
    setInputText("");
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '500px' }}>
      {/* HEADER - Matches Red Design */}
      <div style={{ backgroundColor: '#DC143C', padding: '20px', color: 'white' }}>
        <div className="flex-between mb-10">
          <div className="flex-center gap-10">
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ff4d4d', boxShadow: '0 0 5px white' }}></div>
            <span className="small font-bold">Live Consultation</span>
          </div>
          <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>⏱ 0:30</span>
        </div>

        <div className="flex-between align-start">
          <div className="flex-center gap-15">
            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'white', color: '#DC143C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              AG
            </div>
            <div>
              <h2 className="m-0" style={{ fontSize: '18px' }}>{doctor}</h2>
              {/* UPDATED: Subtitle to match Cardiology context */}
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Cardiac Follow-up • Chest Pain</div>
            </div>
          </div>
          <button className="btn small" style={{ backgroundColor: '#4169E1', border: 'none' }}>Open EMR</button>
        </div>

        <div className="flex-center gap-10 mt-15">
         
          <button 
            className="btn small" 
            onClick={onClose}
            style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.5)', color: 'white' }}
          >
             ✕ Close Chat
          </button>
        </div>
      </div>

      {/* CHAT BODY */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            style={{ 
              alignSelf: msg.sender === 'patient' ? 'flex-start' : 'flex-end',
              maxWidth: '70%',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '14px',
              backgroundColor: msg.sender === 'patient' ? '#F0F2F5' : '#483D8B',
              color: msg.sender === 'patient' ? '#333' : 'white',
              borderBottomLeftRadius: msg.sender === 'patient' ? '2px' : '12px',
              borderBottomRightRadius: msg.sender === 'patient' ? '12px' : '2px',
            }}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* FOOTER INPUT */}
      <div style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type message to patient..." 
          className="input-field"
          style={{ borderRadius: '20px', border: '1px solid #ddd', padding: '10px 15px' }}
        />
        <button 
          onClick={handleSend}
          className="btn" 
          style={{ borderRadius: '20px', padding: '10px 20px', backgroundColor: '#483D8B' }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

const NextAppointmentCard = ({ appointment }) => {
  const [canJoin, setCanJoin] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false); // State to toggle chat view

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

  // --- RENDER CHAT IF OPEN ---
  if (isChatOpen) {
    return <LiveChatInterface doctor={appointment.doctor} onClose={() => setIsChatOpen(false)} />;
  }

  // --- RENDER NORMAL CARD ---
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
          <div style={{ display: 'flex', gap: '10px' }}>
            <a 
                href={appointment.meetingLink} 
                target="_blank" 
                rel="noreferrer" 
                className="btn text-center no-decoration"
                style={{ flex: 1 }}
            >
                Join Video Call
            </a>
            
            <button 
                className="btn-outline" 
                onClick={() => setIsChatOpen(true)}
                style={{ flex: 1 }}
            >
                Chat with Doctor
            </button>
          </div>
        ) : (
          <button className="btn w-full opacity-50 cursor-not-allowed" disabled>
            Join Enabled 10m Before
          </button>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 3. MAIN DASHBOARD COMPONENT
// ==========================================

export default function PatientDashboard() {
  const [currentView, setCurrentView] = useState("overview"); 
  
  // --- INTEGRATION STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("name"); 
  const [allDoctors, setAllDoctors] = useState([]);      
  
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

  // --- BOOKING FUNCTION ---
  const handleBookAppointment = async (doctor) => {
    const confirm = window.confirm(`Do you want to send an appointment request to ${doctor.name}?`);
    if (!confirm) return;

    try {
        // Mock success for now
        alert(`✅ Request Sent! ${doctor.name} has been notified.`);
    } catch (err) {
        alert("❌ Failed to send appointment request.");
    }
  };

  // --- EFFECT: Load Data ---
  useEffect(() => {
    if(currentView === 'doctors' && allDoctors.length === 0) {
        fetchDoctors();
    }
  }, [currentView, allDoctors.length]);

  // --- FILTERING LOGIC ---
  const filteredDoctors = useMemo(() => {
    if (!searchQuery) return [];

    const lowerQuery = searchQuery.toLowerCase().trim();

    return allDoctors.filter(doc => {
      const name = (doc.name || "").toLowerCase();
      const specialization = (doc.specialization || doc.specialty || "").toLowerCase();
      const id = String(doc.id || "");

      if (searchType === 'name') return name.includes(lowerQuery);
      else if (searchType === 'specialization') return specialization.includes(lowerQuery);
      else if (searchType === 'id') return id.includes(lowerQuery);
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
                {searchQuery && (
                    <span className="small color-muted">{filteredDoctors.length} found</span>
                )}
              </div>
              
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

              <div className="mt-15 column-flex">
                {isLoading && <p className="text-center small">Loading directory...</p>}

                {!isLoading && !searchQuery && (
                    <div className="text-center p-20">
                        <p className="color-muted">Start typing to search for doctors...</p>
                    </div>
                )}

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
                    <button 
                        className="btn-outline small"
                        onClick={() => handleBookAppointment(doc)}
                    >
                        Book Appointment
                    </button>
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

        {/* RIGHT SIDEBAR */}
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