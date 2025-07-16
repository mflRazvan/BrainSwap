import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

interface UserData {
  id: number;
  username: string;
  email: string;
  balance: number;
  skills: { name: string }[];
}

interface NavbarProps {
  isAuthenticated: boolean;
  activeTab: 'TEACHING' | 'LEARN';
  setActiveTab: (tab: 'TEACHING' | 'LEARN') => void;
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
}

export default function Navbar({ isAuthenticated, activeTab, setActiveTab, userData, setUserData }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user data for balance/profile
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (isAuthenticated && token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const userId = tokenPayload.id;
        axiosInstance.get(`/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => setUserData(res.data))
          .catch(() => setUserData(null));
      } catch (error) {
        console.error('Error parsing token:', error);
        setUserData(null);
      }
    }
  }, [isAuthenticated]);

  // For floating Add Post button
  const showAddPost = isAuthenticated && location.pathname === '/home';

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserData(null);
    navigate('/');
  };

  return (
    <>
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.7rem 2.5rem',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-card)',
        position: 'relative',
        zIndex: 20,
      }}>
        {/* Left: App Name + Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.2rem' }}>
          <Link to="/home" style={{ fontWeight: 700, fontSize: '1.6rem', color: 'var(--accent-primary)', letterSpacing: 0.5 }}>BrainSwap</Link>
          {isAuthenticated && location.pathname === '/home' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 16, padding: '0.2rem 0.4rem' }}>
              <button
                onClick={() => setActiveTab('TEACHING')}
                style={{
                  background: activeTab === 'TEACHING' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'TEACHING' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 12,
                  padding: '0.5rem 1.2rem',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'TEACHING' ? '0 2px 8px rgba(251,191,36,0.07)' : 'none',
                  transition: 'all 0.2s',
                }}
              >Teaching</button>
              <button
                onClick={() => setActiveTab('LEARN')}
                style={{
                  background: activeTab === 'LEARN' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'LEARN' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 12,
                  padding: '0.5rem 1.2rem',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'LEARN' ? '0 2px 8px rgba(251,191,36,0.07)' : 'none',
                  transition: 'all 0.2s',
                }}
              >Learn Together</button>
            </div>
          )}
        </div>

        {/* Right: Balance and User or Auth Buttons */}
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            {/* Balance */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(251,191,36,0.07)', border: '1.5px solid var(--accent-primary)', borderRadius: 16, padding: '0.5rem 1.2rem', fontWeight: 600, color: 'var(--accent-primary)', fontSize: '1.1rem' }}>
              <span style={{ marginRight: 6 }}>Balance:</span>
              <span style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--accent-primary)' }}>
                {(userData && userData.balance != null ? userData.balance : 0).toFixed(2)} <span style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>BS</span>
              </span>
              <Link to="/add-balance" style={{ textDecoration: 'none' }}>
                <button
                  style={{
                    marginLeft: 10,
                    background: 'var(--accent-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(251,191,36,0.09)',
                    transition: 'background 0.2s',
                    padding: 0,
                  }}
                  title="Add Balance"
                ><span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>+</span></button>
              </Link>
            </div>
            {/* User Photo Placeholder */}
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: 500,
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                }}>
                  <span role="img" aria-label="user">👤</span>
                </div>
              </div>
            </Link>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-primary)',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s',
              }}
              title="Logout"
            >
              ⏻
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', fontSize: '1.08rem', fontWeight: 600 }}>
            <Link
              to="/login"
              style={{
                color: '#fbbf24', // orange/yellow
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              Login
            </Link>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '1.2rem', margin: '0 0.2rem' }}>|</span>
            <Link
              to="/register"
              style={{
                color: '#34d399', // green
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              Register
            </Link>
          </div>
        )}
      </nav>
      {/* Floating Add Post Button */}
      {showAddPost && (
        <Link to="/add-post" state={{ activeTab }} style={{ textDecoration: 'none' }}>
          <button
            style={{
              position: 'fixed',
              top: 80,
              right: 36,
              zIndex: 30,
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 60,
              height: 60,
              fontSize: 32,
              fontWeight: 700,
              boxShadow: '0 8px 32px rgba(251,191,36,0.13)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
              padding: 0,
            }}
            title="Add Post"
          ><span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>+</span></button>
        </Link>
      )}
    </>
  );
}
