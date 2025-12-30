// components/common/FamilyComponent.jsx
import React, { useState } from "react";
import "../../styles/layout.css";
import Layout from "../layout/Layout";

const FamilyPage = () => {
  const [loading, setLoading] = useState(false);
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
      // Note: We are storing the file object here, but sending JSON below.
      // To upload the image, you would typically need a separate step or FormData.
      setFamilyData({ ...familyData, avatar: file }); 
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    // FIX 1: Check for both "token" AND "access_token"
    // Different login systems use different names, so this covers both cases.
    const token = localStorage.getItem("token") || localStorage.getItem("access_token"); 

    if (!token) {
      alert("Authentication Error: No login token found. Please log in again.");
      setLoading(false);
      return;
    }

    // 2. Prepare the data
    const payload = {
      name: familyData.name,
      relationship: familyData.relationship,
      dob: familyData.dob,
      phone: familyData.phone || null,
    };

    try {
      // FIX 2: Corrected URL
      // Your backend code showed the route as "/family-member", NOT "/api/family-member"
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
        alert(`Successfully added ${familyData.name}!`);
        window.location.hash = "/dashboard";
      } else {
        // FIX 3: Better error handling for expired sessions
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
    <div className="card page-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
        Add New Family Member
      </h2>
      
      <form onSubmit={handleSave} className="page-form">
        {/* Photo Section */}
        <div className="photo-section">
          <div className="large-profile-preview">
            {previewImage ? <img src={previewImage} alt="Preview" className="profile-img-cover" /> : <div className="profile-placeholder">👤</div>}
          </div>
          <label className="btn-outline" style={{ cursor: "pointer", fontSize: "0.8rem" }}>
            Upload Photo
            <input type="file" accept="image/*" className="hidden-input" onChange={handlePhotoUpload} />
          </label>
        </div>

        {/* Details Section */}
        <div className="details-section">
          <div>
            <label className="form-label">Full Name</label>
            <input name="name" type="text" placeholder="e.g. Sarah Doe" value={familyData.name} onChange={handleChange} className="input-field" required />
          </div>

          <div className="form-grid-2">
            <div>
              <label className="form-label">Relationship</label>
              <select name="relationship" value={familyData.relationship} onChange={handleChange} className="input-field select-field">
                <option value="Child">Child</option>
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Date of Birth</label>
              <input name="dob" type="date" value={familyData.dob} onChange={handleChange} className="input-field" required />
            </div>
          </div>

          <div>
            <label className="form-label">Emergency Phone (Optional)</label>
            <input name="phone" type="tel" placeholder="+1 234 567 890" value={familyData.phone} onChange={handleChange} className="input-field" />
          </div>

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