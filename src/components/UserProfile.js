import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import './UserProfile.css';
import { jwtDecode } from "jwt-decode";
import defaultAvatar from '../assets/default-avatar.jpg'; // Ensure correct extension

const UserProfile = () => {
  const navigate = useNavigate();
  // State for fetched/displayed data - Initialize all fields
  const [profileData, setProfileData] = useState({
    username: 'User',
    fullName: '',
    email: '',
    village: '',
    phoneNumber: '',
    profilePhotoUrl: defaultAvatar // Start with default
  });
  // State for edited data in the form
  const [editData, setEditData] = useState({ fullName: '', email: '', village: '', phoneNumber: '' });
  // State to toggle edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(''); // General message state
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info' for general message
  const [passwordMessage, setPasswordMessage] = useState(''); // Specific message for password form
  const [passwordMessageType, setPasswordMessageType] = useState('');

  // --- State for Change Password Form ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmationPassword, setConfirmationPassword] = useState('');

  // --- State for Photo Upload ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // --- Fetch Profile Data on load ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      handleLogout(); // Redirect if no token
      return;
    }

    // Decode token just to confirm validity (optional)
    try {
      jwtDecode(token);
    } catch (error) {
      console.error("Invalid token:", error);
      handleLogout();
      return;
    }

    // --- Corrected Fetch Logic ---
    const fetchProfile = async () => {
        setIsLoading(true); // Start loading
        try {
            // Call the API service to get profile data
            const response = await apiService.getUserProfile();

            // Update the state with the data from the backend
            setProfileData({
                username: response.data.username || 'User',
                fullName: response.data.fullName || '',
                email: response.data.email || '',
                village: response.data.village || '',     // Added
                phoneNumber: response.data.phoneNumber || '', // Added
                profilePhotoUrl: response.data.profilePhotoUrl || defaultAvatar
            });
        } catch (error) {
            console.error("Failed to fetch profile data:", error);
            // Handle error, maybe show a message or use defaults
            setProfileData(prev => ({
                ...prev, // Keep existing fields like username if possible
                profilePhotoUrl: defaultAvatar // Use default avatar on error
             }));
             // Optionally add an error message for the user
             setMessage('Could not load profile details.');
             setMessageType('error');
        } finally {
            setIsLoading(false); // Finish loading
        }
    };
    // --- End of Corrected Fetch Logic ---

    fetchProfile(); // Call the async function
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on component mount


  // --- Edit Mode Handlers ---
  const handleEdit = () => {
    setEditData({
      fullName: profileData.fullName || '',
      email: profileData.email || '',
      village: profileData.village || '',
      phoneNumber: profileData.phoneNumber || '',
    });
    setIsEditing(true);
    setMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ fullName: '', email: '', village: '', phoneNumber: '' });
    setMessage('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prevData => ({ ...prevData, [name]: value }));
  };

  // --- Save Profile Changes ---
  const handleSaveProfile = async (e) => {
      e.preventDefault();
      setMessage('Saving profile...');
      setMessageType('info');
      try {
          const response = await apiService.updateUserProfile(editData);
          setProfileData(response.data); // Update displayed data
          setIsEditing(false); // Exit edit mode
          setMessage('Profile updated successfully!');
          setMessageType('success');
      } catch (err) {
          console.error("Failed to update profile:", err);
          setMessage(err.response?.data?.error || 'Failed to update profile.');
          setMessageType('error');
      }
  };

  // --- Other handlers ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleChangePassword = async (e) => {
      e.preventDefault();
      setPasswordMessage(''); setPasswordMessageType('');
      if (!currentPassword || !newPassword || !confirmationPassword) {
         setPasswordMessage('Please fill in all password fields.'); setPasswordMessageType('error'); return;
      }
      if (newPassword !== confirmationPassword) {
         setPasswordMessage('New passwords do not match.'); setPasswordMessageType('error'); return;
      }
      // Add other password validation (length, complexity) if desired
      try {
          const response = await apiService.changePassword({ currentPassword, newPassword, confirmationPassword });
          setPasswordMessage(response.data.message || 'Password changed!'); setPasswordMessageType('success');
          setCurrentPassword(''); setNewPassword(''); setConfirmationPassword(''); // Clear fields
      } catch (err) {
          console.error("PW change failed:", err);
          setPasswordMessage(err.response?.data?.error || 'Failed to change password.'); setPasswordMessageType('error');
      }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMessage(''); setMessageType('');
    } else {
      setSelectedFile(null); setPreviewUrl(null);
      setMessage('Please select a valid image file (JPEG, PNG, GIF).'); setMessageType('error');
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file to upload.'); setMessageType('error'); return;
    }
    setMessage('Uploading...'); setMessageType('info');
    try {
      const response = await apiService.uploadProfilePhoto(selectedFile);
      // Update the profileData state with the new URL
      setProfileData(prev => ({...prev, profilePhotoUrl: response.data.fileUrl }));
      setSelectedFile(null); setPreviewUrl(null); // Clear selection/preview
      setMessage(response.data.message || 'Photo updated successfully!'); setMessageType('success');
    } catch (err) {
      console.error("Photo upload failed:", err);
      setMessage(err.response?.data?.error || 'Failed to upload photo.'); setMessageType('error');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // --- Loading State ---
  if (isLoading) {
    return <div className="loading-message">Loading profile...</div>;
  }

  // --- Render JSX ---
  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>User Profile</h1>
        <button onClick={handleLogout} className="btn btn-logout-profile">Logout</button>
      </div>

      <div className="card profile-card">
        {/* General Messages */}
        {message && messageType && (
            <p className={`form-message ${messageType === 'error' ? 'error-message' : (messageType === 'success' ? 'success-message' : 'info-message')}`}>
                {message}
            </p>
        )}

        <div className="profile-main-content">
            {/* --- Profile Photo Section --- */}
            <div className="profile-photo-section">
                <img
                    src={previewUrl || profileData.profilePhotoUrl || defaultAvatar}
                    alt="Profile Avatar"
                    className="profile-avatar"
                    onError={(e) => { e.target.onerror = null; e.target.src=defaultAvatar }} // Fallback if URL fails
                />
                <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} style={{ display: 'none' }} />
                <button onClick={triggerFileInput} className="btn btn-secondary btn-sm change-photo-btn">Change Photo</button>
                {selectedFile && (
                    <button onClick={handlePhotoUpload} className="btn btn-primary btn-sm upload-photo-btn">Upload New Photo</button>
                )}
            </div>

            {/* --- Profile Details Section (Conditional Rendering) --- */}
            <div className="profile-details-section">
                {!isEditing ? (
                    // --- Display Mode ---
                    <div className="profile-details display-mode">
                        <h2>Welcome, {profileData.fullName || profileData.username}!</h2>
                        <p><strong>Username:</strong> {profileData.username}</p>
                        <p><strong>Full Name:</strong> {profileData.fullName || 'Not set'}</p>
                        <p><strong>Email:</strong> {profileData.email}</p>
                        <p><strong>Village:</strong> {profileData.village || 'Not set'}</p>
                        <p><strong>Phone:</strong> {profileData.phoneNumber || 'Not set'}</p>
                        <button onClick={handleEdit} className="btn btn-secondary edit-btn">Edit Profile</button>
                    </div>
                ) : (
                    // --- Edit Mode ---
                    <form onSubmit={handleSaveProfile} className="profile-details edit-mode">
                        <h2>Edit Profile</h2>
                        <div className="form-group">
                            <label htmlFor="editFullName">Full Name *</label>
                            <input type="text" id="editFullName" name="fullName" value={editData.fullName} onChange={handleEditChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="editEmail">Email *</label>
                            <input type="email" id="editEmail" name="email" value={editData.email} onChange={handleEditChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="editVillage">Village *</label>
                            <input type="text" id="editVillage" name="village" value={editData.village} onChange={handleEditChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="editPhoneNumber">Phone Number</label>
                            <input type="tel" id="editPhoneNumber" name="phoneNumber" value={editData.phoneNumber} onChange={handleEditChange} />
                        </div>
                        <div className="edit-actions">
                            <button type="submit" className="btn btn-primary">Save Changes</button>
                            <button type="button" onClick={handleCancel} className="btn btn-secondary">Cancel</button>
                        </div>
                    </form>
                )}
            </div>
        </div> {/* End profile-main-content */}

        {/* --- Change Password Form --- */}
        <div className="password-change-section">
            <h3>Change Password</h3>
            {passwordMessage && passwordMessageType && (
              <p className={`form-message ${passwordMessageType === 'error' ? 'error-message' : 'success-message'}`}>
                {passwordMessage}
              </p>
            )}
            <form onSubmit={handleChangePassword}>
               <div className="form-group">
                 <label htmlFor="currentPassword">Current Password</label>
                 <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
               </div>
               <div className="form-group">
                 <label htmlFor="newPassword">New Password</label>
                 <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
               </div>
               <div className="form-group">
                 <label htmlFor="confirmationPassword">Confirm New Password</label>
                 <input type="password" id="confirmationPassword" value={confirmationPassword} onChange={(e) => setConfirmationPassword(e.target.value)} required />
               </div>
               <button type="submit" className="btn btn-primary">Update Password</button>
            </form>
        </div>

        <Link to="/dashboard" className="btn btn-secondary back-link">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default UserProfile;