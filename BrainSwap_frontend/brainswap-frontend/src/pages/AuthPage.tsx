import { Link } from 'react-router-dom';

export default function AuthPage() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome to BrainSwap</h2>
          <p className="auth-subtitle">Please log in or register to continue.</p>
        </div>
        
        <div className="auth-actions">
          <Link to="/login" className="auth-button auth-button-primary">
            Login
          </Link>
          <Link to="/register" className="auth-button auth-button-secondary">
            Register
          </Link>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="bg-decoration bg-decoration-1"></div>
      <div className="bg-decoration bg-decoration-2"></div>
      <div className="bg-decoration bg-decoration-3"></div>
    </div>
  );
}