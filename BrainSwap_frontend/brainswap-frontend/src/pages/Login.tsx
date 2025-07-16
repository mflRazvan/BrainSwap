import { useState } from 'react';
import { Check, X, Eye, EyeOff } from 'lucide-react';
import axiosInstance from '../utils/axiosConfig';

type Props = {
  setAuth: (auth: boolean) => void;
};

export default function Login({ setAuth }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await axiosInstance.post('/auth/login', {
        username,
        password,
      });
      const { accesToken } = res.data;
      localStorage.setItem('token', accesToken);
      setAuth(true);
    } catch (err: any) {
      if (!err.response) {
        // Server is down - the interceptor will handle the redirect
        return;
      }
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const styles = {
    authContainer: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative' as const,
      background: 'linear-gradient(135deg, #0c1810 0%, #1a2e1a 50%, #2d3748 100%)',
    },
    authCard: {
      background: 'rgba(45, 55, 72, 0.4)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(160, 174, 192, 0.2)',
      borderRadius: '24px',
      padding: '3rem',
      maxWidth: '420px',
      width: '100%',
      position: 'relative' as const,
      zIndex: 10,
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      transition: 'all 0.3s ease',
    },
    authHeader: {
      textAlign: 'center' as const,
      marginBottom: '2.5rem',
    },
    authTitle: {
      fontSize: '2.5rem',
      fontWeight: 700,
      margin: '0 0 1rem 0',
      background: 'linear-gradient(135deg, #fbbf24, #34d399)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: 1.2,
    },
    authSubtitle: {
      fontSize: '1.125rem',
      color: '#e2e8f0',
      margin: 0,
      lineHeight: 1.6,
    },
    authForm: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    formLabel: {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: '#e2e8f0',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
    formInput: {
      padding: '1rem 1.25rem',
      border: '2px solid rgba(160, 174, 192, 0.2)',
      borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.05)',
      color: '#f7fafc',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      outline: 'none',
    },
    passwordInputContainer: {
      position: 'relative' as const,
      display: 'flex',
      alignItems: 'center',
    },
    passwordInput: {
      paddingRight: '3.5rem',
      width: '100%',
    },
    passwordToggle: {
      position: 'absolute' as const,
      right: '1rem',
      background: 'none',
      border: 'none',
      color: '#a0aec0',
      cursor: 'pointer',
      padding: '0.25rem',
      borderRadius: '6px',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorMessage: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1rem',
      background: 'rgba(245, 101, 101, 0.1)',
      border: '1px solid rgba(245, 101, 101, 0.3)',
      borderRadius: '8px',
      color: '#f56565',
      fontSize: '0.875rem',
    },
    authButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '1rem 2rem',
      fontSize: '1.1rem',
      fontWeight: 600,
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative' as const,
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      color: 'white',
      boxShadow: '0 8px 25px rgba(251, 191, 36, 0.4)',
    },
    loadingSpinner: {
      width: '16px',
      height: '16px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    authDivider: {
      textAlign: 'center' as const,
      marginTop: '1rem',
      fontSize: '0.875rem',
      color: '#a0aec0',
    },
    registerLink: {
      color: '#34d399',
      fontWeight: 600,
      marginLeft: '0.5rem',
      transition: 'color 0.3s ease',
      textDecoration: 'none',
    },
    bgDecoration: {
      position: 'absolute' as const,
      borderRadius: '50%',
      opacity: 0.08,
      pointerEvents: 'none' as const,
    },
    bgDecoration1: {
      width: '350px',
      height: '350px',
      background: 'linear-gradient(135deg, #34d399, #2dd4bf)',
      top: '15%',
      left: '-12%',
    },
    bgDecoration2: {
      width: '250px',
      height: '250px',
      background: 'linear-gradient(45deg, #fbbf24, #a78bfa)',
      bottom: '10%',
      right: '-8%',
    },
    bgDecoration3: {
      width: '180px',
      height: '180px',
      background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
      top: '50%',
      left: '85%',
    },
  };

  return (
    <div style={styles.authContainer}>
      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .form-input:focus {
          border-color: #fbbf24 !important;
          background: rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1) !important;
        }
        
        .form-input::placeholder {
          color: #a0aec0;
        }
        
        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .password-toggle:hover {
          color: #e2e8f0 !important;
          background: rgba(255, 255, 255, 0.1) !important;
        }
        
        .auth-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .auth-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #f59e0b, #d97706) !important;
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(251, 191, 36, 0.5) !important;
        }
        
        .register-link:hover {
          color: #10b981 !important;
        }
        
        .auth-card:hover {
          background: rgba(45, 55, 72, 0.6) !important;
          transform: translateY(-4px);
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
        }
        
        @media (max-width: 640px) {
          .auth-card {
            padding: 2rem !important;
            margin: 1rem !important;
          }
          
          .auth-title {
            font-size: 2rem !important;
          }
        }
      `}</style>
      
      {/* Background decorations */}
      <div style={{...styles.bgDecoration, ...styles.bgDecoration1}}></div>
      <div style={{...styles.bgDecoration, ...styles.bgDecoration2}}></div>
      <div style={{...styles.bgDecoration, ...styles.bgDecoration3}}></div>
      
      <div className="auth-card" style={styles.authCard}>
        <div style={styles.authHeader}>
          <h1 style={styles.authTitle}>Welcome Back</h1>
          <p style={styles.authSubtitle}>Sign in to continue your learning journey</p>
        </div>

        <div style={styles.authForm}>
          <div style={styles.formGroup}>
            
            <input
              id="username"
              type="text"
              className="form-input"
              style={{...styles.formInput}}
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            
            <div style={styles.passwordInputContainer}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{...styles.formInput, ...styles.passwordInput}}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                style={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.errorMessage}>
              <X size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            className="auth-button"
            style={styles.authButton}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <div style={styles.loadingSpinner}></div>
                Signing In...
              </>
            ) : (
              <>
                <Check size={20} />
                Sign In
              </>
            )}
          </button>

          <div style={styles.authDivider}>
            <span>Don't have an account?</span>
            <a href="/register" className="register-link" style={styles.registerLink}>Register here</a>
          </div>
        </div>
      </div>
    </div>
  );
}