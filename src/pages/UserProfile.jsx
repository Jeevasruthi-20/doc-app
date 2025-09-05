import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "./UserProfile.css";

const ProfileStat = ({ label, value }) => (
  <div className="profile-stat">
    <span className="stat-label">{label}</span>
    <span className="stat-value">{value || "—"}</span>
  </div>
);

const InfoItem = ({ icon, label, value, isEditable = false, onEdit, fieldName }) => (
  <div className="info-item">
    <span className="info-icon" aria-hidden="true">{icon}</span>
    <div className="info-content">
      <span className="info-label">{label}</span>
      <span className="info-value">{value || "—"}</span>
    </div>
    {isEditable && (
      <button 
        className="edit-btn" 
        onClick={() => onEdit(fieldName, value)}
        aria-label={`Edit ${label}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
    )}
  </div>
);

const Avatar = ({ name, photoUrl, onPhotoChange }) => {
  const handlePhotoClick = () => {
    if (onPhotoChange) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          onPhotoChange(file);
        }
      };
      input.click();
    }
  };

  if (photoUrl) {
    return (
      <div className="avatar-container">
        <img className="avatar" src={photoUrl} alt={name} />
        <button className="photo-edit-btn" onClick={handlePhotoClick}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>
    );
  }
  
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";
    
  return (
    <div className="avatar-container">
      <div className="avatar initials">{initials}</div>
      <button className="photo-edit-btn" onClick={handlePhotoClick}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
    </div>
  );
};

const EditModal = ({ isOpen, onClose, field, currentValue, onSave }) => {
  const [value, setValue] = useState(currentValue || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(field, value);
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getFieldConfig = (field) => {
    switch (field) {
      case 'displayName':
        return { label: 'Full Name', type: 'text', placeholder: 'Enter your full name' };
      case 'phoneNumber':
        return { label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 123-4567' };
      case 'dob':
        return { label: 'Date of Birth', type: 'date', placeholder: '' };
      case 'address':
        return { label: 'Address', type: 'text', placeholder: 'Enter your address' };
      case 'bloodGroup':
        return { label: 'Blood Group', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] };
      case 'allergies':
        return { label: 'Allergies', type: 'text', placeholder: 'Enter any allergies or "None"' };
      case 'heightCm':
        return { label: 'Height (cm)', type: 'number', placeholder: '170' };
      case 'weightKg':
        return { label: 'Weight (kg)', type: 'number', placeholder: '70' };
      case 'emergencyContactName':
        return { label: 'Emergency Contact Name', type: 'text', placeholder: 'Enter emergency contact name' };
      case 'emergencyContactPhone':
        return { label: 'Emergency Contact Phone', type: 'tel', placeholder: '+1 (555) 123-4567' };
      case 'emergencyContactRelation':
        return { label: 'Emergency Contact Relation', type: 'text', placeholder: 'e.g., Spouse, Parent, Sibling' };
      default:
        return { label: field, type: 'text', placeholder: 'Enter value' };
    }
  };

  const config = getFieldConfig(field);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit {config.label}</h3>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          {config.type === 'select' ? (
            <select 
              value={value} 
              onChange={(e) => setValue(e.target.value)}
              className="form-input"
            >
              <option value="">Select {config.label}</option>
              {config.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input
              type={config.type}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={config.placeholder}
              className="form-input"
            />
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn secondary-btn" onClick={onClose}>Cancel</button>
          <button 
            className="btn primary-btn" 
            onClick={handleSave}
            disabled={loading || !value.trim()}
          >
            {loading ? <span className="loading"></span> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

const API_BASE_URL = "http://localhost:5000/api";

const UserProfile = () => {
  const { currentUser, userProfile, updateUserProfile, getDisplayName, getPhotoURL, getCreationTime } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, field: '', currentValue: '' });
  const [loading, setLoading] = useState(false);

  // Extended user data with additional fields
  const [extendedProfile, setExtendedProfile] = useState({
    dob: "",
    address: "",
    bloodGroup: "",
    allergies: "None",
    heightCm: "",
    weightKg: "",
    emergencyContact: {
      name: "",
      phone: "",
      relation: ""
    }
  });

  // Load extended profile data from backend API and localStorage on component mount
  useEffect(() => {
    if (currentUser?.email) {
      fetch(`${API_BASE_URL}/profile/${currentUser.email}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.message) {
            setExtendedProfile({
              dob: data.dob,
              address: data.address?.street || "",
              bloodGroup: data.bloodGroup,
              allergies: Array.isArray(data.allergies) ? data.allergies.map(a => a.name).join(", ") : data.allergies || "None",
              heightCm: data.height,
              weightKg: data.weight,
              emergencyContact: {
                name: data.emergencyContact?.name || "",
                phone: data.emergencyContact?.phone || "",
                relation: data.emergencyContact?.relationship || ""
              }
            });
          }
        })
        .catch(err => console.error("Failed to fetch profile:", err));
    }
  }, [currentUser]);

  // Save extended profile data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('extendedProfile', JSON.stringify(extendedProfile));
  }, [extendedProfile]);

  const handleEdit = (field, currentValue) => {
    setEditModal({ isOpen: true, field, currentValue });
  };

  const handleSave = async (field, value) => {
    setLoading(true);
    try {
      if (field === 'displayName' || field === 'photoURL') {
        // Update Firebase profile
        await updateUserProfile({ [field]: value });
      } else if (field.startsWith('emergencyContact')) {
        // Update emergency contact fields
        const contactField = field.replace('emergencyContact', '').toLowerCase();
        const updatedProfile = {
          ...extendedProfile,
          emergencyContact: {
            ...extendedProfile.emergencyContact,
            [contactField]: value
          }
        };
        setExtendedProfile(updatedProfile);
      } else {
        // Update other extended profile fields
        setExtendedProfile(prev => ({
          ...prev,
          [field]: value
        }));
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = async (file) => {
    try {
      // For now, we'll just update the display name to show the photo was changed
      // In a real app, you'd upload the file to Firebase Storage and get the URL
      await updateUserProfile({ 
        displayName: getDisplayName() + ' (Photo Updated)' 
      });
    } catch (error) {
      console.error('Photo update failed:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="card">
            <p>Please log in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  const user = {
    name: getDisplayName(),
    email: currentUser.email,
    phone: currentUser.phoneNumber || extendedProfile.phoneNumber || "",
    photoUrl: getPhotoURL(),
    address: extendedProfile.address,
    bloodGroup: extendedProfile.bloodGroup,
    allergies: extendedProfile.allergies,
    heightCm: extendedProfile.heightCm,
    weightKg: extendedProfile.weightKg,
    emergencyContact: extendedProfile.emergencyContact,
    signupDate: getCreationTime()
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header card">
          <div className="profile-identity">
            <Avatar 
              name={user.name} 
              photoUrl={user.photoUrl} 
              onPhotoChange={handlePhotoChange}
            />
            <div>
              <h1 className="profile-name">{user.name}</h1>
              <p className="profile-subtitle">Patient</p>
              <p className="profile-email">{user.email}</p>
              {currentUser.emailVerified ? (
                <span className="verification-badge verified">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Email Verified
                </span>
              ) : (
                <span className="verification-badge unverified">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Email Not Verified
                </span>
              )}
              {user.signupDate && (
                <p className="profile-signup-date">
                  Member since {new Date(user.signupDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div className="profile-stats">
            <ProfileStat label="Height" value={user.heightCm ? `${user.heightCm} cm` : null} />
            <ProfileStat label="Weight" value={user.weightKg ? `${user.weightKg} kg` : null} />
            <ProfileStat label="Blood" value={user.bloodGroup} />
          </div>
        </div>

        <div className="profile-grid">
          <div className="card">
            <h2 className="section-heading">Contact</h2>
            <div className="info-list">
              <InfoItem icon="📧" label="Email" value={user.email} />
              <InfoItem 
                icon="📱" 
                label="Phone" 
                value={user.phone} 
                isEditable={true}
                onEdit={handleEdit}
                fieldName="phoneNumber"
              />
              <InfoItem 
                icon="📍" 
                label="Address" 
                value={user.address} 
                isEditable={true}
                onEdit={handleEdit}
                fieldName="address"
              />
            </div>
          </div>

          <div className="card">
            <h2 className="section-heading">Personal</h2>
            <div className="info-list">
              <InfoItem 
                icon="🎂" 
                label="Date of Birth" 
                value={extendedProfile.dob ? new Date(extendedProfile.dob).toLocaleDateString() : null} 
                isEditable={true}
                onEdit={handleEdit}
                fieldName="dob"
              />
              <InfoItem 
                icon="🩸" 
                label="Blood Group" 
                value={user.bloodGroup} 
                isEditable={true}
                onEdit={handleEdit}
                fieldName="bloodGroup"
              />
              <InfoItem 
                icon="⚠️" 
                label="Allergies" 
                value={user.allergies} 
                isEditable={true}
                onEdit={handleEdit}
                fieldName="allergies"
              />
              <InfoItem 
                icon="📏" 
                label="Height" 
                value={user.heightCm ? `${user.heightCm} cm` : null} 
                isEditable={true}
                onEdit={handleEdit}
                fieldName="heightCm"
              />
              <InfoItem 
                icon="⚖️" 
                label="Weight" 
                value={user.weightKg ? `${user.weightKg} kg` : null} 
                isEditable={true}
                onEdit={handleEdit}
                fieldName="weightKg"
              />
            </div>
          </div>

          <div className="card">
            <h2 className="section-heading">Emergency Contact</h2>
            <div className="info-list">
              <InfoItem 
                icon="👤" 
                label="Name" 
                value={user.emergencyContact?.name} 
                isEditable={true}
                onEdit={handleEdit}
                fieldName="emergencyContactName"
              />
              <InfoItem 
                icon="🤝" 
                label="Relation" 
                value={user.emergencyContact?.relation} 
                isEditable={true}
                onEdit={handleEdit}
                fieldName="emergencyContactRelation"
              />
              <InfoItem 
                icon="📞" 
                label="Phone" 
                value={user.emergencyContact?.phone} 
                isEditable={true}
                onEdit={handleEdit}
                fieldName="emergencyContactPhone"
              />
            </div>
          </div>
        </div>
      </div>

      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, field: '', currentValue: '' })}
        field={editModal.field}
        currentValue={editModal.currentValue}
        onSave={handleSave}
      />
    </div>
  );
};

export default UserProfile;
