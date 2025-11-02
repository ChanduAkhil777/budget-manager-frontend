import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import './Login.css'; 
import backgroundImage from '../assets/budget-background.jpg'; 

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); 

    try {
      // Call the API Service
      const response = await apiService.login(username, password);
      
      // On success, save the token and navigate
      const token = response.data.token;
      localStorage.setItem('token', token); 
      
      console.log('Login successful, token saved.');
      navigate('/dashboard'); // Navigate to the main app

    } catch (err) {
      // On failure, show an error
      console.error("Login failed:", err);
      if (err.response && (err.response.status === 403 || err.response.status === 401)) {
        setError('Invalid username or password.');
      } else {
        setError('Login failed. Please try again later.');
      }
    }
  };

  const loginBackgroundStyle = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="login-container" style={loginBackgroundStyle}>
      <div className="login-box animate-fade-in"> 
        <h2>Welcome Back!</h2>
        <p>Login to manage your budget.</p>
        <form onSubmit={handleLogin}>
          
          {/* Add the error message display */}
          {error && <p className="error-message">{error}</p>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn login-btn">
            Login
          </button>
        </form>
        
        {/* Updated link to the Register page */}
        <p className="forgot-password">
          <Link to="/register">Don't have an account? Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;