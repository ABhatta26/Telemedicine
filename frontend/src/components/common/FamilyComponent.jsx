// components/common/FamilyPage.jsx
import React, { useState } from "react";
import "../../styles/layout.css";
import Layout from "../layout/Layout";

const FamilyPage = () => {
  const [familyData, setFamilyData] = useState({
    name: "", relationship: "Child", dob: "", phone: "", avatar: null
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
      setFamilyData({ ...familyData, avatar: imageUrl });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Adding family member:", familyData);
    alert(`Successfully added ${familyData.name} (${familyData.relationship})!`);
    window.location.hash = "/dashboard";
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
            <button type="submit" className="btn">Add Member</button>
          </div>
        </div>
      </form>
    </div>
    </Layout>
  );
};

export default FamilyPage;