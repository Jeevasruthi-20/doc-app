import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider, facebookProvider, appleProvider } from "../firebaseConfig";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("email");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(true);
  const navigate = useNavigate();

  // Phone number validation
  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  };

  // Format phone number for display
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return `+${cleaned}`;
    if (cleaned.length <= 6) return `+${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 10) return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)} ${cleaned.slice(10)}`;
  };

  // Handle phone number input change
  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    setError("");
  };

  // OTP countdown timer
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

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

  // Step 1: Email/Password login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess("Logged in successfully!");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      let errorMessage = "Login failed";
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email address";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email address";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please try again later";
          break;
        default:
          errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccess("Logged in with Google successfully!");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      let errorMessage = "Google login failed";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Login popup was closed. Please try again.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Popup was blocked. Please allow popups for this site.";
      } else {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Facebook login
  const handleFacebookLogin = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await signInWithPopup(auth, facebookProvider);
      setSuccess("Logged in with Facebook successfully!");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      let errorMessage = "Facebook login failed";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Login popup was closed. Please try again.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Popup was blocked. Please allow popups for this site.";
      } else {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Apple login
  const handleAppleLogin = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await signInWithPopup(auth, appleProvider);
      setSuccess("Logged in with Apple successfully!");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      let errorMessage = "Apple login failed";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Login popup was closed. Please try again.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Popup was blocked. Please allow popups for this site.";
      } else {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP
  const sendOtp = async () => {
    if (!phone) {
      setError("Please enter a phone number");
      return;
    }
    
    if (!validatePhoneNumber(phone)) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          { size: "invisible" }
        );
      }
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone.replace(/\s/g, ''), appVerifier);
      setConfirmationResult(result);
      setSuccess("OTP sent successfully!");
      setOtpTimer(60);
      setCanResendOtp(false);
    } catch (error) {
      let errorMessage = "Failed to send OTP";
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = "Invalid phone number format";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many attempts. Please try again later";
      } else {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    if (!canResendOtp) return;
    await sendOtp();
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (!otp) {
      setError("Please enter OTP");
      return;
    }
    
    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await confirmationResult.confirm(otp);
      setSuccess("Phone login successful!");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      let errorMessage = "Invalid OTP";
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = "Invalid OTP code";
      } else if (error.code === 'auth/code-expired') {
        errorMessage = "OTP has expired. Please request a new one";
        setConfirmationResult(null);
        setOtp("");
      } else {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }
    
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent! Check your inbox.");
    } catch (error) {
      let errorMessage = "Failed to send reset email";
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email address";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address";
      } else {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <Link to="/" className="back-home">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Home
          </Link>
        </div>
        
        <div className="login-card">
          <div className="login-logo">
            <div className="logo-icon">🏥</div>
            <h1>Welcome Back</h1>
            <p>Sign in to your MedConnect account</p>
          </div>

          {/* Error and Success Messages */}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="login-tabs">
            <button 
              className={`tab-btn ${activeTab === 'email' ? 'active' : ''}`}
              onClick={() => setActiveTab('email')}
            >
              Email Login
            </button>
            <button 
              className={`tab-btn ${activeTab === 'phone' ? 'active' : ''}`}
              onClick={() => setActiveTab('phone')}
            >
              Phone Login
            </button>
          </div>

          {activeTab === 'email' ? (
            <div className="login-form">
              <form onSubmit={handleEmailLogin}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn primary-btn login-btn"
                  disabled={isLoading}
                >
                  {isLoading ? <span className="loading"></span> : 'Sign In'}
                </button>
              </form>

              <div className="divider">
                <span>or</span>
              </div>

              {/* Social Login Buttons */}
              <div className="social-login">
                <button 
                  className="btn social-btn google-btn"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
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
                  onClick={handleFacebookLogin}
                  disabled={isLoading}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </button>

                <button 
                  className="btn social-btn apple-btn"
                  onClick={handleAppleLogin}
                  disabled={isLoading}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Continue with Apple
                </button>
              </div>

              <div className="login-footer">
                <p>Don't have an account? <Link to="/signup" className="link">Sign up</Link></p>
                <button 
                  type="button" 
                  className="forgot-link" 
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>
            </div>
          ) : (
            <div className="phone-login">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={handlePhoneChange}
                />
                <small className="form-hint">Enter your phone number with country code</small>
              </div>
              
              <button 
                className="btn primary-btn"
                onClick={sendOtp}
                disabled={isLoading || !phone || !validatePhoneNumber(phone)}
              >
                {isLoading ? <span className="loading"></span> : 'Send OTP'}
              </button>

              {confirmationResult && (
                <div className="otp-section">
                  <div className="form-group">
                    <label className="form-label">Enter OTP</label>
                    <input
                      type="text"
                      className="form-input otp-input"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      maxLength="6"
                    />
                    <div className="otp-timer">
                      {otpTimer > 0 ? (
                        <span>Resend OTP in {otpTimer}s</span>
                      ) : (
                        <button 
                          className="resend-btn"
                          onClick={resendOtp}
                          disabled={!canResendOtp}
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    className="btn primary-btn"
                    onClick={verifyOtp}
                    disabled={isLoading || !otp || otp.length !== 6}
                  >
                    {isLoading ? <span className="loading"></span> : 'Verify OTP'}
                  </button>
                </div>
              )}
              
              <div id="recaptcha-container"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
