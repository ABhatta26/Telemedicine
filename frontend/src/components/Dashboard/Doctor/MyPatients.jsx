// MyPatients.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../../styles/layout.css"; 
import "../../../styles/base.css";
import "../../../styles/variables.css";

// --- STYLES FOR PAGINATION (Internal for quick setup) ---
const paginationStyles = `
  .pagination-footer {
    display: flex;
    justify-content: flex-end; /* Align to right */
    padding: 20px;
    border-top: 1px solid #eee;
    gap: 8px;
  }
  .page-btn {
    min-width: 32px;
    height: 32px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #555;
    transition: all 0.2s ease;
  }
  .page-btn:hover {
    background: #f9fafb;
    border-color: #ccc;
  }
  .page-btn.active {
    background: #007bff; /* Primary Blue */
    color: white;
    border-color: #007bff;
    font-weight: bold;
  }
`;

// --- CONSTANTS ---
const ITEMS_PER_PAGE = 6;

// --- HELPER: ROBUST DATE CHECK ---
const isDateInCurrentWeek = (dateString) => {
  if (!dateString) return false;

  const targetDate = new Date(dateString);
  const now = new Date();

  now.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const dayOfWeek = now.getDay(); 
  const distanceToMonday = (dayOfWeek + 6) % 7; 
  
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return targetDate >= monday && targetDate <= sunday;
};

// --- HELPER: GET LOCAL DATE STRING ---
const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const MyPatients = () => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);

  // Helper to get class based on status
  const getStatusClass = (status) => {
      if (!status) return '';
      switch(status.toLowerCase()) {
          case 'confirmed': return 'confirmed';
          case 'pending': return 'pending';
          case 'completed': return 'completed';
          case 'in progress': return 'pending';
          case 'upcoming': return 'confirmed';
          case 'approved': return 'confirmed'; 
          case 'rejected': return 'completed';
          default: return '';
      }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/all-records`);
        
        const { appointments = [], request_history = [] } = response.data;
        const rawData = [...appointments, ...request_history];

        const mappedData = rawData.map(item => {
          let realDate = item.date;
          if (item.date && item.date.toLowerCase().includes("today")) {
              realDate = getLocalDateString();
          }

          return {
            id: item.id,
            name: item.patient_name || item.patient || "Unknown", 
            age: 30, 
            gender: "N/A", 
            time: item.time_slot || item.requested_time || item.time || "09:00 AM", 
            date: realDate || getLocalDateString(), 
            reason: item.type || item.reason || "Consultation", 
            status: item.status || "Pending"
          };
        });

        const weeklyPatients = mappedData.filter(appt => 
          isDateInCurrentWeek(appt.date)
        );

        setPatients(weeklyPatients);
        setIsLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Could not load records.");
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = patients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(patients.length / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="patients-container">
      <style>{paginationStyles}</style>
      
      {/* Header Section */}
      <div className="patients-header">
        <div>
          <h2 className="patients-title">My Patients</h2>
          <p className="patients-subtitle">Scheduled & Processed Records (This Week)</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="patients-card">
        
        {isLoading ? (
          <div className="state-container">
            <span>Loading records...</span>
          </div>
        ) : error ? (
           <div className="state-container color-crimson">
            <span>⚠️ {error}</span>
          </div>
        ) : patients.length === 0 ? (
          <div className="state-container">
            <span className="empty-icon">📅</span>
            <p>No records found for this week.</p>
          </div>
        ) : (
          <>
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* RENDER ONLY CURRENT PAGE ITEMS */}
                {currentItems.map((patient) => (
                  <tr key={patient.id} className="patient-row">
                    <td>
                      <div className="patient-profile-cell">
                          <div className="patient-avatar">
                              {patient.name.charAt(0)}
                          </div>
                          <div className="patient-info">
                              <h4>{patient.name}</h4>
                              <div className="patient-meta">{patient.age} Yrs • {patient.gender}</div>
                          </div>
                      </div>
                    </td>
                    <td>
                      <div className="date-primary">{patient.date}</div>
                      <div className="time-badge">{patient.time}</div>
                    </td>
                    <td className="reason-text">{patient.reason}</td>
                    <td>
                      <span className={`status-pill ${getStatusClass(patient.status)}`}>
                        <span className="status-dot"></span>
                        {patient.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button className="btn-view">
                          View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* --- PAGINATION CONTROLS --- */}
            {patients.length > ITEMS_PER_PAGE && (
              <div className="pagination-footer">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button 
                    key={i + 1} 
                    onClick={() => handlePageChange(i + 1)}
                    className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyPatients;