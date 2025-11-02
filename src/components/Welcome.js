import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css'; 
import backgroundImage from '../assets/budget-background.jpg'; 

const Welcome = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/login'); // <-- This is the corrected line
  };

  const welcomeStyle = {
    backgroundImage: `url(${backgroundImage})`,
    height: '100vh',
    width: '100vw',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="welcome-container" style={welcomeStyle}>
      <div className="welcome-content">
        <h1>Budget Manager</h1>
        <p>A simple and effective way to manage your personal finances.</p>
        <button onClick={handleStart} className="start-btn">
          GET STARTED
        </button>
      </div>
    </div>
  );
};

export default Welcome;