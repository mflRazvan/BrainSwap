import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthPage from './pages/AuthPage';
import PostDetails from './pages/PostDetails';
import AddPost from './pages/AddPost';
import Profile from './pages/Profile';
import AddBalance from './pages/AddBalance';
import axiosInstance from './utils/axiosConfig';

interface UserData {
  id: number;
  username: string;
  email: string;
  balance: number;
  skills: { name: string }[];
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState<'TEACHING' | 'LEARN'>('TEACHING');
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Add global axios error handler
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      response => response,
      error => {
        if (!error.response) {
          // Network error or server is down
          console.error('Server connection error:', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUserData(null);
          window.location.href = '/';
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, []);

  // Fetch user data when authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUserData(null);
        return;
      }

      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const userId = tokenPayload.id;
        const response = await axiosInstance.get(`/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData(null);
        // If we get a 401/403, clear auth and redirect to login
        if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  // Handle error messages from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorMessage = params.get('error');
    if (errorMessage) {
      setError(errorMessage);
      // Remove error from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Listen for token expiration or removal
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setUserData(null);
      } else {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp && Date.now() >= payload.exp * 1000) {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUserData(null);
          }
        } catch {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUserData(null);
        }
      }
    };
    window.addEventListener('storage', checkToken);
    const interval = setInterval(checkToken, 2000);
    return () => {
      window.removeEventListener('storage', checkToken);
      clearInterval(interval);
    };
  }, []);

  return (
    <Router>
      <Navbar 
        isAuthenticated={isAuthenticated} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userData={userData}
        setUserData={setUserData}
      />
      {error && !isAuthenticated && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            padding: '1rem 2rem',
            backgroundColor: 'rgba(245, 101, 101, 0.1)',
            border: '1px solid rgba(245, 101, 101, 0.3)',
            borderRadius: '12px',
            color: '#f56565',
            textAlign: 'center',
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            fontSize: '1rem',
            fontWeight: 500,
          }}>
            {error}
          </div>
        </div>
      )}
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/home" /> : 
              <Login setAuth={setIsAuthenticated} />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? 
              <Navigate to="/home" /> : 
              <Register setAuth={setIsAuthenticated} />
          } 
        />
        <Route 
          path="/home" 
          element={
            isAuthenticated ? 
              <Home activeTab={activeTab} /> : 
              <Navigate to="/" />
          } 
        />
        <Route 
          path="/posts/:id" 
          element={
            isAuthenticated ? 
              <PostDetails /> : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/add-post" 
          element={
            isAuthenticated ? 
              <AddPost /> : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/profile" 
          element={
            isAuthenticated ? 
              <Profile /> : 
              <Navigate to="/" />
          } 
        />
        <Route 
          path="/add-balance" 
          element={
            isAuthenticated ? 
              <AddBalance setUserData={setUserData} /> : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <Navigate to="/home" /> : 
              <AuthPage />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;