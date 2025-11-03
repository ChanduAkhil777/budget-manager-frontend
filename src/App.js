import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Welcome from './components/Welcome';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import UserProfile from './components/UserProfile'; // <-- 1. IMPORT UserProfile

function App() {
  return (
    // --- THIS IS THE FIX ---
    // Add the basename prop with your repository name
    <Router basename="/budget-manager-frontend">
    {/* --- */}
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<UserProfile />} /> 
      </Routes>
    </Router>
  );
}

export default App;