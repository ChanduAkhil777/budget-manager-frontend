import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import './Login.css'; // Reusing Login CSS
import backgroundImage from '../assets/budget-background.jpg';

const Register = () => {
  // Existing state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  // --- NEW State ---
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [village, setVillage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  // ---

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // --- Frontend Validation ---
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) { // Example minimum length
        setError("Password must be at least 6 characters.");
        return;
    }
    // Basic email format check (more robust validation is possible)
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError("Please enter a valid email address.");
        return;
    }
    // Add checks for other required fields if necessary
    if (!fullName || !email || !village) {
        setError("Please fill in all required fields (*).");
        return;
    }
    // ---

    try {
      // --- Create userData object ---
      const userData = {
        username,
        password,
        fullName,
        email,
        village,
        phoneNumber // Send phone number even if empty
      };
      // ---

      // Call the register endpoint with all data
      const response = await apiService.register(userData);

      const token = response.data.token;
      localStorage.setItem('token', token);
      console.log('Registration successful, token saved.');
      navigate('/dashboard');

    } catch (err) {
      console.error("Registration failed:", err);
      if (err.response && err.response.data && err.response.data.message) {
         // Try to get specific backend message first
         setError(err.response.data.message);
      } else if (err.response && err.response.data && err.response.data.error) {
         // Fallback for other backend errors
         setError(err.response.data.error);
      } else {
        setError('Registration failed. Please try again later.');
      }
    }
  };

  const registerBackgroundStyle = { /* ... same as before ... */ };

  return (
    <div className="login-container" style={registerBackgroundStyle}>
      <div className="login-box animate-fade-in register-box"> {/* Optional: Add register-box class for specific styles */}
        <h2>Create Account</h2>
        <p>Start managing your budget today.</p>
        <form onSubmit={handleRegister}>

          {error && <p className="error-message">{error}</p>}

          {/* --- NEW Fields --- */}
          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {/* --- */}

          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {/* --- NEW Fields --- */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="village">Village *</label>
            <input type="text" id="village" value={village} onChange={(e) => setVillage(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label> {/* Not required */}
            <input type="tel" id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </div>
          {/* --- */}

          <button type="submit" className="btn login-btn">Sign Up</button>
        </form>
        <p className="forgot-password">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;