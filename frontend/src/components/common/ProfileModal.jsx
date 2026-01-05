// components/common/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/layout.css";
import Layout from "../layout/Layout";

const ProfilePage = () => {
  const { user } = useAuth(); 

  // State to toggle between View and Edit modes
  const [isEditing, setIsEditing] = useState(false);

  // State for the uploaded file
  const [reportFile, setReportFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
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
        email: user.email || "",
        phone: "+91 98765 43210", 
        address: "123 Maple Street", 
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

  // New handler for Health Report
  const handleReportUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        setReportFile(file);
        // Simulate API upload
        console.log("Uploading Health Report:", file.name);
        alert(`Health Report "${file.name}" uploaded successfully!`);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Saving Profile:", formData);
    alert("Profile Updated Successfully!");
    setIsEditing(false);
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };
  
  const handle2Facto = () => {
    window.location.hash = "/2facto";
  };

  return (
    <Layout>
      <div className="profile-container">
          
          {/* Page Header */}
          <div className="page-header-row">
            <h1 className="page-title">Profile Settings</h1>
            
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
            <form onSubmit={handle2Facto} className="profile-form-layout">
              
              {/* Left Col: Photo & Avatar */}
              <div className="profile-photo-col">
                <div className="large-profile-preview">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="profile-img-cover" />
                  ) : (
                    <div className="profile-placeholder-icon">
                      👤
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <label className="btn-outline" style={{ cursor: "pointer" }}>
                    Change Photo
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden-input" 
                        onChange={handlePhotoUpload} 
                    />
                  </label>
                )}
                
                <p className="photo-hint">
                  Supported: *.jpeg, *.jpg, *.png<br/>
                  Max size: 5MB
                </p>
              </div>

              {/* Right Col: Personal Details */}
              <div className="profile-details-col">
                <h3 className="section-title">Personal Information</h3>
                
                <div className="form-grid-2">
                  <div>
                    <label className="form-label">Full Name</label>
                    <input 
                      name="name" 
                      type="text" 
                      value={formData.name} 
                      onChange={handleChange} 
                      className="input-field"
                      disabled={!isEditing} 
                    />
                  </div>
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
                </div>

                <div className="input-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="input-field input-disabled" 
                    disabled={true} 
                  />
                  <span className="field-note">Email address cannot be changed for security reasons.</span>
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
                        <label className="btn-health-upload">
                            <span>📄</span> Upload Health Report
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
                        Upload PDF, DOCX, or Images of your prescriptions or reports.
                    </p>
                </div>

                {/* Actions (Visible only when Editing) */}
                {isEditing && (
                  <div className="form-actions-row">
                    <button type="button" onClick={handleCancel} className="btn-outline">Cancel</button>
                    <button type="submit" onClick={handle2Facto} className="btn">Save Changes</button>
                  </div>
                )}
              </div>

            </form>
          </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;