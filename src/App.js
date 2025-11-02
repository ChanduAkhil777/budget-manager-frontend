import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Welcome from './components/Welcome';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import UserProfile from './components/UserProfile'; // <-- 1. IMPORT UserProfile

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* --- 2. ADD THIS LINE --- */}
        <Route path="/profile" element={<UserProfile />} /> 
        {/* --- */}
      </Routes>
    </Router>
  );
}

export default App;