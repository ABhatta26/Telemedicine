// components/common/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/layout.css";
import Layout from "../layout/Layout";

const ProfilePage = () => {
  const { user } = useAuth(); 

  // State to toggle between View and Edit modes
  const [isEditing, setIsEditing] = useState(false);

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

  const handleSave = (e) => {
    e.preventDefault();
    // API Call to update profile would go here
    console.log("Saving Profile:", formData);
    
    // UI Feedback
    alert("Profile Updated Successfully!");
    
    // Switch back to view mode
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset data to original and turn off edit mode
    resetForm();
    setIsEditing(false);
  };
  
  const handle2Facto = () => {
    window.location.hash = "/2facto";
  };

  return (
    <Layout>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
          
          {/* Page Header */}
          <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 className="page-title" style={{ margin: 0 }}>Profile Settings</h1>
            
            {/* Edit Button (Visible only when NOT editing) */}
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="btn"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span>✏️</span> Edit Profile
              </button>
            )}
          </div>

          {/* Page Content Card */}
          <div className="card page-content">
            <form onSubmit={handle2Facto} className="page-form">
              
              {/* Left Col: Photo & Avatar */}
              <div className="photo-section">
                <div className="large-profile-preview">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="profile-img-cover" />
                  ) : (
                    <div className="profile-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                      👤
                    </div>
                  )}
                </div>
                
                {/* Show Upload Button only in Edit Mode */}
                {isEditing && (
                  <label className="btn-outline" style={{ cursor: "pointer", fontSize: "0.85rem" }}>
                    Change Photo
                    <input type="file" accept="image/*" className="hidden-input" onChange={handlePhotoUpload} />
                  </label>
                )}
                
                <p className="photo-hint">
                  Supported: *.jpeg, *.jpg, *.png<br/>
                  Max size: 5MB
                </p>
              </div>

              {/* Right Col: Personal Details */}
              <div className="details-section">
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
                      disabled={!isEditing} // Disabled when not editing
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

                <div>
                  <label className="form-label">Email Address</label>
                  <input 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="input-field" 
                    disabled={true} // Email always disabled (usually requires separate flow)
                    style={{ opacity: 0.6, cursor: "not-allowed" }}
                  />
                  <span className="field-note">Email address cannot be changed for security reasons.</span>
                </div>

                <div>
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

                {/* Actions (Visible only when Editing) */}
                {isEditing && (
                  <div className="form-actions">
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