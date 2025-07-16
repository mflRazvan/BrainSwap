import axios from 'axios';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 5000, // 5 second timeout
});

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors (server down, no connection, etc.)
    if (!error.response) {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      
      // Redirect to home page with error message
      window.location.href = '/?error=Unable to connect to the server. Please try again later.';
      return Promise.reject(error);
    }

    // Handle other types of errors
    return Promise.reject(error);
  }
);

export default axiosInstance; 