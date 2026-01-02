// components/common/FamilyComponent.jsx
import React, { useState } from "react";
import "../../styles/layout.css";
import Layout from "../layout/Layout";

const FamilyPage = () => {
  const [loading, setLoading] = useState(false);
  const [reportFile, setReportFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const [familyData, setFamilyData] = useState({
    name: "", 
    relationship: "Child", 
    gender: "Male", // 1. Added default gender
    dob: "", 
    phone: "", 
    avatar: null
  });

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

  const handleReportUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        setReportFile(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token") || localStorage.getItem("access_token"); 

    if (!token) {
      alert("Authentication Error: You are not logged in.");
      setLoading(false);
      return;
    }

    // 2. Prepare Payload (Including Gender)
    const payload = {
      name: familyData.name,
      relation: familyData.relationship, 
      gender: familyData.gender, // <--- Sending Gender now
      dob: familyData.dob, 
      phone: familyData.phone || null,
      health_report_name: reportFile ? reportFile.name : null 
    };

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      
      const response = await fetch(`${apiUrl}/api/family-member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(`Successfully added ${familyData.name}!`);
        window.location.href = "/dashboard"; 
      } else {
        const errorData = await response.json();
        
        let errorMsg = "Failed to add member";
        if (response.status === 422 && Array.isArray(errorData.detail)) {
             errorMsg = errorData.detail.map(err => `${err.loc[1]}: ${err.msg}`).join("\n");
        } else if (errorData.detail) {
             errorMsg = errorData.detail;
        }
        
        alert(`Error:\n${errorMsg}`);
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Network Error: Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
    <div className="card page-content family-card-container">
      <h2 className="page-heading-bordered">Add New Family Member</h2>
      
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

          {/* 3. Updated Grid to include Gender */}
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
               <label className="form-label">Gender</label>
               <select 
                 name="gender" 
                 value={familyData.gender} 
                 onChange={handleChange} 
                 className="input-field select-field"
               >
                 <option value="Male">Male</option>
                 <option value="Female">Female</option>
                 <option value="Other">Other</option>
               </select>
            </div>
          </div>

          <div className="form-grid-2">
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
            <div>
                <label className="form-label">Emergency Phone</label>
                <input 
                    name="phone" 
                    type="tel" 
                    placeholder="+1 234 567 890" 
                    value={familyData.phone} 
                    onChange={handleChange} 
                    className="input-field" 
                />
            </div>
          </div>

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
                {reportFile && (
                    <div className="upload-success">
                        <span>✅</span> 
                        <strong className="file-name-truncate">{reportFile.name}</strong> 
                    </div>
                )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => window.location.href = "/dashboard"} className="btn-outline">Cancel</button>
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