// components/common/FamilyComponent.jsx
import React, { useState } from "react";
import "../../styles/layout.css";
import Layout from "../layout/Layout";

const FamilyPage = () => {
  const [loading, setLoading] = useState(false);
  
  // State for Health Report
  const [reportFile, setReportFile] = useState(null);

  const [familyData, setFamilyData] = useState({
    name: "", 
    relationship: "Child", 
    dob: "", 
    phone: "", 
    avatar: null
  });
  
  const [previewImage, setPreviewImage] = useState("");

  const handleChange = (e) => {
    setFamilyData({ ...familyData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setFamilyData({ ...familyData, avatar: file }); 
    }
  };

  // Handler for Health Report Upload
  const handleReportUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        setReportFile(file);
        // In a real app, you might upload this to S3 immediately or append to FormData below
        console.log("Selected Health Report:", file.name);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token") || localStorage.getItem("access_token"); 

    if (!token) {
      alert("Authentication Error: No login token found. Please log in again.");
      setLoading(false);
      return;
    }

    // Prepare the data
    // Note: If you are sending files (avatar/reportFile), you usually need `new FormData()` 
    // instead of JSON. For this UI demo, we kept JSON payload structure.
    const payload = {
      name: familyData.name,
      relationship: familyData.relationship,
      dob: familyData.dob,
      phone: familyData.phone || null,
      healthReportName: reportFile ? reportFile.name : null // Example of sending report metadata
    };

    try {
      const response = await fetch("http://localhost:8000/api/family-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Success:", data);
        
        let successMsg = `Successfully added ${familyData.name}!`;
        if (reportFile) successMsg += ` (Health Report Attached)`;
        
        alert(successMsg);
        window.location.hash = "/dashboard";
      } else {
        if (response.status === 401) {
            alert("Your session has expired. Please log out and log in again.");
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.detail || "Failed to add member"}`);
        }
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Could not connect to the server. Is your backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
    <div className="card page-content family-card-container">
      <h2 className="page-heading-bordered">
        Add New Family Member
      </h2>
      
      <form onSubmit={handleSave} className="page-form">
        {/* Photo Section */}
        <div className="photo-section">
          <div className="large-profile-preview">
            {previewImage ? (
                <img src={previewImage} alt="Preview" className="profile-img-cover" />
            ) : (
                <div className="profile-placeholder-icon">👤</div>
            )}
          </div>
          <label className="btn-outline photo-upload-label">
            Upload Photo
            <input type="file" accept="image/*" className="hidden-input" onChange={handlePhotoUpload} />
          </label>
        </div>

        {/* Details Section */}
        <div className="details-section">
          <div>
            <label className="form-label">Full Name</label>
            <input 
                name="name" 
                type="text" 
                placeholder="e.g. Sarah Doe" 
                value={familyData.name} 
                onChange={handleChange} 
                className="input-field" 
                required 
            />
          </div>

          <div className="form-grid-2">
            <div>
              <label className="form-label">Relationship</label>
              <select 
                name="relationship" 
                value={familyData.relationship} 
                onChange={handleChange} 
                className="input-field select-field"
              >
                <option value="Child">Child</option>
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Date of Birth</label>
              <input 
                name="dob" 
                type="date" 
                value={familyData.dob} 
                onChange={handleChange} 
                className="input-field" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="form-label">Emergency Phone (Optional)</label>
            <input 
                name="phone" 
                type="tel" 
                placeholder="+1 234 567 890" 
                value={familyData.phone} 
                onChange={handleChange} 
                className="input-field" 
            />
          </div>

          {/* --- NEW: Medical Records Section --- */}
          {/* Reusing classes from layout.css designed for ProfilePage */}
          <div className="medical-section">
            <h3 className="section-title">Initial Health Report</h3>
            
            <div className="medical-actions-row">
                <label className="btn-health-upload">
                    <span>📄</span> Upload Report
                    <input 
                        type="file" 
                        accept=".pdf,.doc,.docx,.jpg,.png" 
                        className="hidden-input"
                        onChange={handleReportUpload}
                    />
                </label>

                {/* Success Feedback */}
                {reportFile && (
                    <div className="upload-success">
                        <span>✅</span> 
                        <strong className="file-name-truncate">
                          {reportFile.name}
                        </strong> 
                        <span>attached</span>
                    </div>
                )}
            </div>
            <p className="photo-hint text-left">
                Upload past prescriptions or medical history (PDF/Images).
            </p>
          </div>
          {/* ----------------------------------- */}

          <div className="form-actions">
            <button type="button" onClick={() => window.location.hash = "/dashboard"} className="btn-outline">Cancel</button>
            <button type="submit" className="btn" disabled={loading}>
                {loading ? "Saving..." : "Add Member"}
            </button>
          </div>
        </div>
      </form>
    </div>
    </Layout>
  );
};

export default FamilyPage;