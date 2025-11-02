import axios from 'axios';

// --- 1. Create a Base URL ---
// Make sure this port matches your running backend (e.g., 8081 or 8082 if you changed it)
const API_URL = process.env.REACT_APP_API_URL;

// --- 2. Create the API Client ---
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    // Default headers for JSON data
    'Content-Type': 'application/json',
  },
});

// --- 3. Add Token Interceptor ---
// Automatically attaches the JWT token to secured requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Don't overwrite Content-Type if it's explicitly set for FormData
      if (!config.headers['Content-Type'] || config.headers['Content-Type'] === 'application/json') {
         config.headers['Authorization'] = `Bearer ${token}`;
      } else if (config.headers['Content-Type'] === 'multipart/form-data') {
         config.headers['Authorization'] = `Bearer ${token}`;
         // Let Axios handle the Content-Type for FormData
         // delete config.headers['Content-Type']; // Axios does this automatically
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- 4. Define Your API Endpoints ---
export const apiService = {
  // --- Auth Endpoints ---
  login: (username, password) => {
    return apiClient.post('/auth/login', { username, password });
  },
  register: (username, password) => {
    return apiClient.post('/auth/register', { username, password });
  },
  changePassword: (passwords) => {
    // passwords should be { currentPassword, newPassword, confirmationPassword }
    return apiClient.post('/auth/change-password', passwords);
  },

  // --- Profile Endpoints ---
  uploadProfilePhoto: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    // Send POST request with FormData
    // Axios sets Content-Type to multipart/form-data automatically
    return apiClient.post('/profile/photo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data' // Explicitly set, though Axios often infers
        }
    });
  },
  getProfilePhotoUrl: () => {
    return apiClient.get('/profile/photo-url');
  },

  // --- Data Endpoints (Secured) ---
  getBudget: () => {
    return apiClient.get('/data/budget');
  },
  setBudget: (budget) => {
    return apiClient.post('/data/budget', { budget });
  },
  getExpenses: () => {
    return apiClient.get('/data/expenses');
  },
  addExpense: (expense) => {
    // 'expense' should be an object: { name, category, amount }
    return apiClient.post('/data/expenses', expense);
  },
  deleteExpense: (id) => {
    return apiClient.delete(`/data/expenses/${id}`);
  },
  // Inside api.js -> apiService object

  register: (userData) => {
    // userData should be an object like:
    // { username, password, fullName, email, village, phoneNumber }
    return apiClient.post('/auth/register', userData);
  },
  getUserProfile: () => {
    return apiClient.get('/profile'); // Calls GET /api/profile
  },
  // Inside api.js -> apiService object

  // --- Profile Endpoints ---
  // ... (uploadProfilePhoto, getProfilePhotoUrl, getUserProfile)

  // --- NEW: Update User Profile Details ---
  updateUserProfile: (profileData) => {
    // profileData should be { fullName, email, village, phoneNumber }
    return apiClient.put('/profile', profileData); // Calls PUT /api/profile
  },
};