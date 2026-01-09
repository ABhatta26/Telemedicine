// components/Dashboard/Doctor/DoctorProfile.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import "../../../styles/layout.css";
import Layout from "../../layout/Layout";

const DoctorProfile = () => {
  const { user } = useAuth();

  // State to toggle between View and Edit modes
  const [isEditing, setIsEditing] = useState(false);

  // State for the uploaded file
  const [reportFile, setReportFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false); // Loading state

  // --- SPECIALIZATION is added here in State ---
  const [formData, setFormData] = useState({
    name: "",
    specialization: "", 
    email: "",
    phone: "",
    address: "",
    avatar: ""
  });

  const [previewImage, setPreviewImage] = useState("");

  // Helper to reset form to current user data
  const resetForm = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        // --- SPECIALIZATION loads here (defaults to 'General User') ---
        specialization: user.specialization || "General User", 
        email: user.email || "",
        phone: user.phone || "+91 98765 43210",
        address: user.address || "123 Maple Street",
        avatar: user.avatarUrl || ""
      });
      setPreviewImage(user.avatarUrl || "");
    }
  };

  // Load initial data
  useEffect(() => {
    resetForm();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setFormData({ ...formData, avatar: imageUrl });
    }
  };

  // Handler for Health Report Selection
  const handleReportUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReportFile(file);
    }
  };

  // --- INTEGRATION: Function to send file to Backend ---
  const uploadReportToBackend = async (file) => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("report_type", "General");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/health-reports`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: uploadData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload report");
      }

      const result = await response.json();
      console.log("Upload success:", result);
      return true;
    } catch (error) {
      console.error("Error uploading report:", error);
      alert("Error uploading health report. Please try again.");
      return false;
    }
  };

  // --- Main Save Handler ---
  const handleSave = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // 1. If a report file is selected, upload it first
      if (reportFile) {
        const uploadSuccess = await uploadReportToBackend(reportFile);
        if (uploadSuccess) {
          alert(`Health Report "${reportFile.name}" uploaded successfully!`);
          setReportFile(null);
        }
      }

      // 2. Logic to update profile details (Name, Specialization, etc.)
      console.log("Saving Profile Data (including Specialization):", formData);
      alert("Profile Updated Successfully!");
      setIsEditing(false);

    } catch (error) {
      console.error("Save failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setReportFile(null);
    setIsEditing(false);
  };

  return (
    <Layout>
      <div className="profile-container">
        
        {/* Page Header with Top-Right Action */}
        <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 className="page-title">Profile Settings</h1>
            <p className="text-muted">Manage your personal information and credentials.</p>
          </div>
          
          {/* Top-Right Action Button */}
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)} 
              className="btn flex-center"
            >
              <span>✏️</span> <span className="hide-mobile">Edit Profile</span>
            </button>
          )}
        </div>

        {/* Page Content Card */}
        <div className="card p-24">
          <form onSubmit={handleSave} className="profile-form-layout">
            
            {/* Left Col: Photo & Avatar */}
            <div className="profile-photo-col">
              <div className="large-profile-preview">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="profile-img-cover" />
                ) : (
                  <div className="profile-placeholder-icon">👤</div>
                )}
              </div>
              
              {isEditing && (
                <label className="btn-outline" style={{ cursor: "pointer", marginTop: '1rem' }}>
                  Change Photo
                  <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden-input" 
                      onChange={handlePhotoUpload} 
                  />
                </label>
              )}
            </div>

            {/* Right Col: Personal Details */}
            <div className="profile-details-col">
              <h3 className="section-title">Identity & Credentials</h3>
              
              {/* Full Name & Specialization Row */}
              <div className="form-grid-2">
                <div>
                  <label className="form-label">Full Name</label>
                  <input 
                    name="name" 
                    type="text" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="input-field"
                    placeholder="e.g. Dr. Saatwik Sen"
                    disabled={!isEditing} 
                  />
                </div>
                {/* --- SPECIALIZATION INPUT FIELD --- */}
                <div>
                  <label className="form-label">Specialization</label>
                  <input 
                    name="specialization" 
                    type="text" 
                    value={formData.specialization} 
                    onChange={handleChange} 
                    className="input-field"
                    placeholder="e.g. Cardiologist / Software Engineer"
                    disabled={!isEditing} 
                  />
                </div>
              </div>

              <div className="form-grid-2">
                 <div>
                    <label className="form-label">Phone Number</label>
                    <input 
                      name="phone" 
                      type="tel" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      className="input-field"
                      disabled={!isEditing} 
                    />
                 </div>
                 <div className="input-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      name="email" 
                      type="email" 
                      value={formData.email} 
                      className="input-field input-disabled" 
                      disabled={true} 
                    />
                 </div>
              </div>

              <div className="input-group">
                <label className="form-label">Address</label>
                <input 
                  name="address" 
                  type="text" 
                  value={formData.address} 
                  onChange={handleChange} 
                  className="input-field" 
                  placeholder="Enter your full address"
                  disabled={!isEditing} 
                />
              </div>

              {/* --- Medical Records Section --- */}
              <div className="medical-section">
                  <h3 className="section-title">Medical Records</h3>
                  
                  <div className="medical-actions-row">
                      <label className={`btn-health-upload ${!isEditing ? 'disabled-label' : ''}`}>
                          <span>📄</span> {reportFile ? "Change File" : "Upload Health Report"}
                          <input 
                              type="file" 
                              accept=".pdf,.doc,.docx,.jpg,.png" 
                              className="hidden-input"
                              onChange={handleReportUpload}
                              disabled={!isEditing}
                          />
                      </label>

                      {reportFile && (
                          <div className="upload-success">
                              <span>📎</span> 
                              <strong className="file-name-truncate">
                                {reportFile.name}
                              </strong> 
                              <span style={{fontSize:'0.8rem', marginLeft:'5px'}}>(Pending Save)</span>
                          </div>
                      )}
                  </div>
              </div>

              {/* Actions (Visible only when Editing) */}
              {isEditing && (
                <div className="form-actions-row">
                  <button type="button" onClick={handleCancel} className="btn-outline">Cancel</button>
                  <button type="submit" className="btn" disabled={isUploading}>
                    {isUploading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorProfile;