import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { fetchNotifications } from "../../../api/notifications";

// Components
import MyPatients from "./MyPatients";
import DoctorNotificationsPanel from "./DoctorNotificationsPanel";
import DoctorEarningsCard from "./DoctorEarningsCard";
import DoctorNotificationsTab from "./DoctorNotificationsTab";

// Styles
import "../../../styles/layout.css";
import "../../../styles/base.css";

// --- HELPERS ---
const getRelativeDate = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

function isToday(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// --- MOCK DATA FOR INITIAL STATE ---
const INITIAL_PATIENTS = [
  { id: 101, name: "Rahul Sharma", age: 34, gender: "M", time: "10:00 AM", date: getRelativeDate(0), reason: "Migraine Follow-up", status: "Confirmed" },
];

const INITIAL_SLOTS = ["14:00 PM", "15:30 PM", "16:15 PM", "17:00 PM"];

const REVIEWS = [
  { id: 1, user: "Anonymous", rating: 5, text: "Very patient and understanding doctor." },
  { id: 2, user: "S. Khan", rating: 4, text: "Good experience but wait time was long." },
];

export default function DoctorDashboardBody() {
  const { accessToken } = useAuth();

  // --- States ---
  const [activeTab, setActiveTab] = useState("overview");
  const [requests, setRequests] = useState([]);
  const [allPatients, setAllPatients] = useState(INITIAL_PATIENTS);
  const [notifications, setNotifications] = useState([]);

  // API Data State
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
   
  // NEW: Live Session State
  const [liveSession, setLiveSession] = useState(null);

  // Session & Chat State
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
   
  // Hardcoded ID for active session logic (can be dynamic later)
  const ACTIVE_PATIENT_ID = 101; 

  // Slots State
  const [availableSlots, setAvailableSlots] = useState(INITIAL_SLOTS);
  const [isEditingSlots, setIsEditingSlots] = useState(false);
  const [newSlotInput, setNewSlotInput] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  // --- Effects ---

  /* ✅ UNREAD COUNT */
  const unreadCount = notifications.filter(n => !n.is_read).length;

  /* ✅ FETCH NOTIFICATIONS */
  useEffect(() => {
    if (!accessToken) return;

    fetchNotifications(accessToken)
      .then(data => {
        const formatted = data.map(n => {
          const d = new Date(n.created_at);
          return {
            ...n,
            dateLabel: isToday(d) ? "Today" : "Yesterday",
            time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
        });
        setNotifications(formatted);
      })
      .catch(console.error);
  }, [accessToken]);

  // 1. Session Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch Dashboard Data (Schedule, Requests, Live Session)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // A. Fetch Schedule
        const scheduleRes = await axios.get(`${API_BASE_URL}/api/appointments`);
        const rawSchedule = Array.isArray(scheduleRes.data) ? scheduleRes.data : [];
        
        const formattedSchedule = rawSchedule.map(appt => ({
          id: appt.id,
          patient: appt.patient_name || "Unknown",
          type: appt.type || "Consultation",
          time: appt.time_slot || "TBD",
          status: appt.status || "Scheduled"
        }));
        setTodaySchedule(formattedSchedule);
        setIsLoadingSchedule(false);

        // B. Fetch Requests
        const requestsRes = await axios.get(`${API_BASE_URL}/api/appointments/requests?status=pending`);
        const rawRequests = Array.isArray(requestsRes.data) ? requestsRes.data : [];

        const formattedRequests = rawRequests.map(req => ({
            id: req.id,
            patient: req.patient_name || "Unknown",
            reason: req.reason || "Checkup",
            requestedTime: req.requested_time || "TBD",
            status: req.status
        }));
        setRequests(formattedRequests);

        // C. Fetch Live Session (NEW INTEGRATION)
        const liveRes = await axios.get(`${API_BASE_URL}/api/consultation/live`);
        if (liveRes.data && liveRes.data.active) {
            setLiveSession(liveRes.data);
        } else {
            setLiveSession(null);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setIsLoadingSchedule(false);
      }
    };

    fetchDashboardData();
  }, [API_BASE_URL]);

  // 3. Fetch Chat History
  useEffect(() => {
    const fetchChatHistory = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/chat/history/${ACTIVE_PATIENT_ID}`);
            if (Array.isArray(res.data)) {
                setMessages(res.data);
            }
        } catch (error) {
            console.error("Error fetching chat history", error);
        }
    };
    fetchChatHistory();
  }, [API_BASE_URL]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- HANDLERS ---

  const handleRequestAction = async (id, action) => {
    const backendAction = action === "Approved" ? "approve" : "reject";
    try {
      await axios.post(`${API_BASE_URL}/api/requests/${id}/${backendAction}`);
      
      const requestToProcess = requests.find(req => req.id === id);
      if (action === "Approved" && requestToProcess) {
        setAllPatients(prev => [...prev, {
          id: Date.now(),
          name: requestToProcess.patient,
          age: 30,
          gender: "Unknown",
          time: requestToProcess.requestedTime,
          date: new Date().toISOString().split('T')[0],
          reason: requestToProcess.reason,
          status: "Confirmed"
        }]);
      }
      setRequests(requests.filter(req => req.id !== id));
    } catch (error) {
      console.error(`❌ Failed to ${backendAction} request:`, error);
      alert("Action failed. Check console.");
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    // Optimistic Update
    const tempMsg = { id: Date.now(), sender: 'doctor', text: chatInput };
    setMessages(prev => [...prev, tempMsg]);
    const msgText = chatInput;
    setChatInput(""); 

    try {
        const payload = {
            patientId: ACTIVE_PATIENT_ID,
            sender: "doctor",
            text: msgText
        };
        await axios.post(`${API_BASE_URL}/api/chat/send`, payload);
        console.log("Message synced with backend");

    } catch (error) {
        console.error("Failed to send message:", error);
        alert("Message failed to send.");
        setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
        setChatInput(msgText); 
    }
  };

  const toggleStatus = () => setIsOnline(!isOnline);

  const handleRoleSwitch = () => {
    if (window.confirm("Switch to Patient Dashboard?")) {
        console.log("Switching to patient...");
    }
  };

  const handleAddSlot = () => {
    if (newSlotInput.trim()) {
      setAvailableSlots([...availableSlots, newSlotInput.trim()]);
      setNewSlotInput("");
    }
  };

  const handleRemoveSlot = (idx) => {
    setAvailableSlots(availableSlots.filter((_, i) => i !== idx));
  };

  return (
    <div className="dashboard-stack">
      {/* Navigation */}
      <div className="dashboard-nav">
        <span 
            className={`nav-tab ${activeTab === "overview" ? "active" : ""}`} 
            onClick={() => setActiveTab("overview")}
        >
            Overview
        </span>
        <span 
            className={`nav-tab ${activeTab === "patients" ? "active" : ""}`} 
            onClick={() => setActiveTab("patients")}
        >
            My Patients
        </span>

        {/* --- NEW EARNINGS TAB --- */}
        <span 
            className={`nav-tab ${activeTab === "earnings" ? "active" : ""}`} 
            onClick={() => setActiveTab("earnings")}
        >
            Earnings
        </span>

        <DoctorNotificationsTab
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadCount={unreadCount}
        />

        <span 
            className={`nav-tab ${activeTab === "reviews" ? "active" : ""}`} 
            onClick={() => setActiveTab("reviews")}
        >
            Reputation
        </span>
      </div>

      {/* VIEW: OVERVIEW */}
      {activeTab === "overview" && (
        <>
          {/* Control Bar */}
          <div className="dashboard-control-bar">
            <div className="status-group">
                <span className="status-label">Availability:</span>
                <label className="toggle-switch">
                    <input type="checkbox" checked={isOnline} onChange={toggleStatus} />
                    <span className="slider"></span>
                </label>
                <span className={`status-text ${isOnline ? 'online' : 'offline'}`}>
                    {isOnline ? 'Online • Accepting' : 'Offline'}
                </span>
            </div>
            
            <button className="btn-outline small" onClick={handleRoleSwitch}>
                🔄 Switch Role
            </button>
          </div>

          <div className="doctor-grid">
            {/* LEFT COLUMN */}
            <div className="column-flex">
              
              {/* Active Session Card (DYNAMIC) */}
              {liveSession ? (
                  <div className="active-session-card shadow">
                    <div className="flex-between mb-15">
                      <span className="badge bg-white color-primary">🔴 Live</span>
                      <span className="session-timer">⏱ {formatTime(sessionTimer)}</span>
                    </div>
                    
                    <div className="flex-between align-center">
                      <div className="flex-center gap-15">
                        <div className="avatar-lg bg-white color-primary">
                            {liveSession.patient_name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <h2 className="m-0">{liveSession.patient_name}</h2>
                          <p className="opacity-80 small">{liveSession.type}</p>
                        </div>
                      </div>
                      <button className="btn bg-white color-primary font-bold">EMR</button>
                    </div>

                    <div className="mt-20 flex gap-10">
                        <button 
                            className={`btn-outline small white-border text-white ${showChat ? 'active-chat-btn' : ''}`}
                            onClick={() => setShowChat(!showChat)}
                        >
                          {showChat ? '❌ Close Chat' : '💬 Chat'}
                        </button>
                    </div>

                    {/* Chat Drawer */}
                    {showChat && (
                      <div className="live-chat-drawer">
                        <div className="chat-history">
                          {messages.length > 0 ? (
                            messages.map((msg) => (
                              <div key={msg.id} className={`chat-bubble ${msg.sender === 'doctor' ? 'sent' : 'received'}`}>
                                 {msg.text}
                              </div>
                            ))
                          ) : (
                            <div className="text-center small color-muted mt-20">No messages yet.</div>
                          )}
                        </div>
                        <div className="chat-input-row">
                          <input 
                            type="text" 
                            placeholder="Type message..." 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          />
                          <button onClick={handleSendMessage}>Send</button>
                        </div>
                      </div>
                    )}
                  </div>
              ) : (
                <div className="card p-20 text-center color-muted">
                    <h3 className="m-0">No Active Consultation</h3>
                    <p>Your next appointment is scheduled for 10:00 AM.</p>
                </div>
              )}

              {/* Today's Schedule */}
              <div className="card p-0 overflow-hidden">
                <div className="p-20 border-bottom">
                  <h3 className="m-0">Today's Schedule</h3>
                </div>
                <div>
                  {isLoadingSchedule ? (
                    <div className="p-20 text-center color-muted">Loading...</div>
                  ) : todaySchedule.length > 0 ? (
                    todaySchedule.map((appt) => (
                      <div key={appt.id} className="schedule-block">
                        <div className="schedule-time">{appt.time}</div>
                        <div className="flex-1">
                          <div className="flex-between">
                              <strong>{appt.patient}</strong>
                              <span className="badge badge-neutral">{appt.status}</span>
                          </div>
                          <div className="small color-muted">{appt.type}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-20 text-center color-muted">No appointments.</div>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="column-flex">
              
              {/* Requests */}
              <div className="card p-20 bg-soft-accent">
                <div className="flex-between mb-15">
                    <h3 className="m-0">Requests</h3>
                    {requests.length > 0 && <span className="badge badge-warn">{requests.length} New</span>}
                </div>
                {requests.length > 0 ? (
                    requests.map(req => (
                    <div key={req.id} className="request-card">
                        <div className="flex-between">
                        <strong>{req.patient}</strong>
                        <small>{req.requestedTime}</small>
                        </div>
                        <div className="small color-muted mt-5">{req.reason}</div>
                        <div className="action-buttons">
                        <button className="btn-outline small color-crimson border-crimson" onClick={() => handleRequestAction(req.id, "Rejected")}>Reject</button>
                        <button className="btn small bg-emerald" onClick={() => handleRequestAction(req.id, "Approved")}>Approve</button>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="text-center color-muted small">No pending requests</div>
                )}
              </div>

              {/* Quick Slots */}
              <div className="card p-20">
                 <div className="flex-between align-center">
                    <h4 className="m-0 color-muted uppercase small">Quick Availability</h4>
                    <span className="small color-primary cursor-pointer" onClick={() => setIsEditingSlots(!isEditingSlots)}>
                      {isEditingSlots ? "Done" : "Edit"}
                    </span>
                 </div>
                 <div className="slots-container">
                    {availableSlots.map((slot, idx) => (
                        <div key={idx} className={`slot-badge available ${isEditingSlots ? 'shake-animation' : ''}`}>
                            {slot}
                            {isEditingSlots && <span className="delete-slot-btn" onClick={() => handleRemoveSlot(idx)}>×</span>}
                        </div>
                    ))}
                    {isEditingSlots && (
                        <div className="add-slot-group">
                            <input className="add-slot-input" value={newSlotInput} onChange={e => setNewSlotInput(e.target.value)} placeholder="18:00" />
                            <button className="btn add-slot-btn" onClick={handleAddSlot}>+</button>
                        </div>
                    )}
                 </div>
              </div>

              {/* PERFORMANCE */}
              <div className="card p-20">
                <h4 className="m-0 color-muted uppercase small">Performance</h4>
                <div className="stats-grid mt-15">
                  <div className="text-center">
                    <h2 className="m-0 color-primary">4.8</h2>
                    <small>Avg Rating</small>
                  </div>
                  <div className="text-center">
                    <h2 className="m-0">12</h2>
                    <small>Patients</small>
                  </div>
                </div>
              </div>

              {/* Feedback Snippet */}
              <div className="card p-20">
                <h3 className="m-0 mb-15">Latest Feedback</h3>
                {REVIEWS.slice(0, 1).map(rev => (
                   <div key={rev.id}>
                      <div className="flex-between">
                        <strong className="small">{rev.user}</strong>
                        <span className="star-rating">{"★".repeat(rev.rating)}</span>
                      </div>
                      <p className="small m-0 mt-5 italic">"{rev.text}"</p>
                   </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* VIEW: EARNINGS (NEW TAB) */}
      {activeTab === "earnings" && (
         <div className="p-20" style={{ maxWidth: '800px', margin: '0 auto' }}>
             {/* Reusing the card component here in a centered container */}
             <DoctorEarningsCard />
         </div>
      )}

      {/* VIEW: PATIENTS */}
      {activeTab === "patients" && (
        <MyPatients appointments={allPatients} />
      )}

      {/* VIEW: NOTIFICATIONS */}
      {activeTab === "notifications" && (
        <DoctorNotificationsPanel 
            notifications={notifications}
            setNotifications={setNotifications}
        />
      )}

      {/* VIEW: REPUTATION */}
      {activeTab === "reviews" && (
        <div className="card p-20 reputation-card-container">
          <h3 className="m-0 mb-15">Reputation & Feedback</h3>
          {REVIEWS.map(rev => (
             <div key={rev.id} className="border-bottom pb-15 mb-15">
                <div className="flex-between mb-5">
                  <strong>{rev.user}</strong>
                  <span className="star-rating">{"★".repeat(rev.rating)}</span>
                </div>
                <p className="m-0 italic color-muted">"{rev.text}"</p>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}