import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { auth, googleProvider, facebookProvider, appleProvider } from "../firebaseConfig";
import "./Signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    password: "",
    confirmPassword: "",
    // Additional profile fields
    address: "",
    bloodGroup: "",
    allergies: "",
    heightCm: "",
    weightKg: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("email");
  const navigate = useNavigate();

  // Phone number validation and formatting
  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  };

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return `+${cleaned}`;
    if (cleaned.length <= 6) return `+${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 10) return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)} ${cleaned.slice(10)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    setError("");
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Email/Password signup
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long!");
      setLoading(false);
      return;
    }

    if (!validatePhoneNumber(formData.phone)) {
      setError("Please enter a valid phone number with country code");
      setLoading(false);
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update user profile
      await updateProfile(userCredential.user, {
        displayName: formData.name,
        phoneNumber: formData.phone.replace(/\s/g, ''),
      });

      // Save complete profile information to localStorage
      const extendedProfile = {
        dob: formData.dob,
        phoneNumber: formData.phone.replace(/\s/g, ''),
        address: formData.address,
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies || "None",
        heightCm: formData.heightCm,
        weightKg: formData.weightKg,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relation: formData.emergencyContactRelation
        }
      };
      localStorage.setItem('extendedProfile', JSON.stringify(extendedProfile));

      // Send email verification
      await sendEmailVerification(userCredential.user);

      setSuccess("Account created successfully! Please check your email for verification.");
      
      // Redirect to profile after 3 seconds
      setTimeout(() => navigate("/profile"), 3000);
    } catch (error) {
      let errorMessage = "Signup failed";
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "An account with this email already exists";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email address";
          break;
        case 'auth/weak-password':
          errorMessage = "Password is too weak. Please choose a stronger password";
          break;
        case 'auth/operation-not-allowed':
          errorMessage = "Email/password accounts are not enabled. Please contact support";
          break;
        default:
          errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Google signup
  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if this is a new user
      if (result._tokenResponse?.isNewUser) {
        setSuccess("Account created successfully with Google!");
      } else {
        setSuccess("Signed in with Google successfully!");
      }
      
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      let errorMessage = "Google signup failed";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Signup popup was closed. Please try again.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Popup was blocked. Please allow popups for this site.";
      } else {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Facebook signup
  const handleFacebookSignup = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      
      if (result._tokenResponse?.isNewUser) {
        setSuccess("Account created successfully with Facebook!");
      } else {
        setSuccess("Signed in with Facebook successfully!");
      }
      
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      let errorMessage = "Facebook signup failed";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Signup popup was closed. Please try again.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Popup was blocked. Please allow popups for this site.";
      } else {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Apple signup
  const handleAppleSignup = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const result = await signInWithPopup(auth, appleProvider);
      
      if (result._tokenResponse?.isNewUser) {
        setSuccess("Account created successfully with Apple!");
      } else {
        setSuccess("Signed in with Apple successfully!");
      }
      
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      let errorMessage = "Apple signup failed";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Signup popup was closed. Please try again.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Popup was blocked. Please allow popups for this site.";
      } else {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <Link to="/" className="back-home">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Home
          </Link>
        </div>
        
        <div className="signup-card">
          <div className="signup-logo">
            <div className="logo-icon">🏥</div>
            <h1>Create Account</h1>
            <p>Join MedConnect and take control of your health</p>
          </div>

          {/* Error and Success Messages */}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="signup-tabs">
            <button 
              className={`tab-btn ${activeTab === 'email' ? 'active' : ''}`}
              onClick={() => setActiveTab('email')}
            >
              Email Signup
            </button>
            <button 
              className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`}
              onClick={() => setActiveTab('social')}
            >
              Social Signup
            </button>
          </div>

          {activeTab === 'email' ? (
            <form className="signup-form" onSubmit={handleEmailSignup}>
              {/* Basic Information */}
              <div className="form-section">
                <h3 className="section-title">Basic Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      name="name"
                      type="text"
                      className="form-input"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      name="email"
                      type="email"
                      className="form-input"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      name="phone"
                      type="tel"
                      className="form-input"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      required
                    />
                    <small className="form-hint">Enter your phone number with country code</small>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date of Birth *</label>
                    <input
                      name="dob"
                      type="date"
                      className="form-input"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="form-section">
                <h3 className="section-title">Medical Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input
                      name="address"
                      type="text"
                      className="form-input"
                      placeholder="Enter your address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select
                      name="bloodGroup"
                      className="form-input"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Allergies</label>
                    <input
                      name="allergies"
                      type="text"
                      className="form-input"
                      placeholder="Enter any allergies or 'None'"
                      value={formData.allergies}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row two-columns">
                  <div className="form-group">
                    <label className="form-label">Height (cm)</label>
                    <input
                      name="heightCm"
                      type="number"
                      className="form-input"
                      placeholder="170"
                      min="50"
                      max="300"
                      value={formData.heightCm}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Weight (kg)</label>
                    <input
                      name="weightKg"
                      type="number"
                      className="form-input"
                      placeholder="70"
                      min="20"
                      max="300"
                      value={formData.weightKg}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="form-section">
                <h3 className="section-title">Emergency Contact</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Emergency Contact Name</label>
                    <input
                      name="emergencyContactName"
                      type="text"
                      className="form-input"
                      placeholder="Enter emergency contact name"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row two-columns">
                  <div className="form-group">
                    <label className="form-label">Emergency Contact Phone</label>
                    <input
                      name="emergencyContactPhone"
                      type="tel"
                      className="form-input"
                      placeholder="+1 (555) 123-4567"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Relationship</label>
                    <input
                      name="emergencyContactRelation"
                      type="text"
                      className="form-input"
                      placeholder="e.g., Spouse, Parent, Sibling"
                      value={formData.emergencyContactRelation}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Account Security */}
              <div className="form-section">
                <h3 className="section-title">Account Security</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input
                      name="password"
                      type="password"
                      className="form-input"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <small className="form-hint">Must be at least 6 characters</small>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Confirm Password *</label>
                    <input
                      name="confirmPassword"
                      type="password"
                      className="form-input"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn primary-btn signup-btn"
                disabled={loading}
              >
                {loading ? <span className="loading"></span> : 'Create Account'}
              </button>
            </form>
          ) : (
            <div className="social-signup">
              <p className="social-signup-text">Choose your preferred signup method:</p>
              
              <div className="social-login">
                <button 
                  className="btn social-btn google-btn"
                  onClick={handleGoogleSignup}
                  disabled={loading}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <button 
                  className="btn social-btn facebook-btn"
                  onClick={handleFacebookSignup}
                  disabled={loading}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </button>

                <button 
                  className="btn social-btn apple-btn"
                  onClick={handleAppleSignup}
                  disabled={loading}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Continue with Apple
                </button>
              </div>

              <div className="social-signup-info">
                <p>By continuing with social login, you agree to our Terms of Service and Privacy Policy.</p>
              </div>
            </div>
          )}

          <div className="signup-footer">
            <p>Already have an account? <Link to="/login" className="link">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
