import { useEffect, useState } from 'react';
import axios from 'axios';
import axiosInstance from '../utils/axiosConfig';

type Props = {
  setAuth: (auth: boolean) => void;
};

type Skill = {
  id: number;
  name: string;
  popularity: number;
  marketValue: number;
  predefined: boolean;
};

export default function Register({ setAuth }: Props) {
  // Add CSS for form input focus states
  const formInputStyles = `
    .form-input:focus {
      border-color: var(--accent-primary) !important;
      background: rgba(255, 255, 255, 0.1) !important;
      box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1) !important;
    }
    
    .form-input::placeholder {
      color: var(--text-muted);
    }
    
    .register-link:hover {
      color: var(--accent-secondary-hover) !important;
    }
  `;
  const [step, setStep] = useState<'credentials' | 'skills'>('credentials');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [skillsFetchError, setSkillsFetchError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8080/skills/public')
      .then(res => {
        setAllSkills(res.data);
        setSkillsFetchError('');
      })
      .catch(() => {
        setAllSkills([]);
        setSkillsFetchError('Unable to connect to the server. Please try again later.');
      });
  }, []);

  // Filter skills based on search
  const filteredSkills = allSkills.filter(skill =>
    skill.name.toLowerCase().includes(search.toLowerCase())
  );

  // Separate and sort skills
  const predefinedSkills = filteredSkills
    .filter(skill => skill.predefined)
    .sort((a, b) => a.name.localeCompare(b.name));
  
  const customSkills = filteredSkills
    .filter(skill => !skill.predefined)
    .sort((a, b) => a.name.localeCompare(b.name));

  const toggleSkill = (skillName: string) => {
    setSkills(prev =>
      prev.includes(skillName) ? prev.filter(s => s !== skillName) : [...prev, skillName]
    );
  };

  const addCustomSkill = () => {
    if (!customSkill.trim()) return;

    const trimmedSkill = customSkill.trim();
    const exists = allSkills.some(s => s.name.toLowerCase() === trimmedSkill.toLowerCase());
    
    if (exists) {
      setError('This skill already exists.');
      return;
    }

    const newSkill: Skill = {
      id: Date.now(),
      name: trimmedSkill,
      popularity: 0,
      marketValue: 0,
      predefined: false
    };

    setAllSkills(prev => [...prev, newSkill]);
    setSkills(prev => [...prev, trimmedSkill]);
    setCustomSkill('');
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addCustomSkill();
    }
  };

  const handleContinue = () => {
    if (!username || !email || !password) {
      setError('All fields are required.');
      return;
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    // Password validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter.');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number.');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError('Password must contain at least one special character.');
      return;
    }
    setError('');
    setStep('skills');
  };

  const handleRegister = async () => {
    try {
      // Convert skill names to BasicSkillDTO format
      const skillsToSend = skills.map(skillName => ({
        name: skillName
      }));

      console.log('Sending registration data:', {
        username,
        email,
        password,
        skills: skillsToSend
      });

      const res = await axiosInstance.post('/auth/register', {
        username,
        email,
        password,
        skills: skillsToSend
      });
      const { accesToken } = res.data;
      localStorage.setItem('token', accesToken);
      setTimeout(() => setAuth(true), 0);
    } catch (err: any) {
      if (!err.response) {
        // Server is down - the interceptor will handle the redirect
        return;
      }
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.response?.data || 'Registration failed');
    }
  };

  // Define styles as objects
  const styles = {
    authForm: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
    },
    formInput: {
      padding: '1rem 1.5rem',
      fontSize: '1rem',
      border: '2px solid var(--border-color)',
      borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.05)',
      color: 'var(--text-primary)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
      outline: 'none',
    },
    skillsSection: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem',
    },
    skillsDropdownContainer: {
      position: 'relative' as const,
    },
    skillsDropdownTrigger: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 1.5rem',
      border: '2px solid var(--border-color)',
      borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.05)',
      color: 'var(--text-primary)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    dropdownArrow: {
      marginLeft: 'auto',
      transition: 'transform 0.3s ease',
      fontSize: '0.8rem',
    },
    dropdownArrowOpen: {
      marginLeft: 'auto',
      transition: 'transform 0.3s ease',
      transform: 'rotate(180deg)',
      fontSize: '0.8rem',
    },
    skillsDropdown: {
      position: 'absolute' as const,
      top: '100%',
      left: 0,
      right: 0,
      marginTop: '0.5rem',
      background: 'var(--bg-card)',
      border: '2px solid var(--border-color)',
      borderRadius: '12px',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      zIndex: 100,
      maxHeight: '350px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    skillsSearch: {
      padding: '1rem',
      borderBottom: '1px solid var(--border-color)',
      flexShrink: 0,
    },
    searchInput: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      background: 'rgba(255, 255, 255, 0.05)',
      color: 'var(--text-primary)',
      fontSize: '0.9rem',
      outline: 'none',
    },
    skillsListContainer: {
      flex: 1,
      overflowY: 'auto' as const,
      minHeight: 0,
    },
    skillItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    },
    skillItemHover: {
      background: 'rgba(255, 255, 255, 0.05)',
    },
    skillItemSelected: {
      background: 'rgba(251, 191, 36, 0.1)',
      color: 'var(--accent-primary)',
    },
    skillName: {
      fontSize: '0.9rem',
      flex: 1,
    },
    skillIndicator: {
      fontSize: '1rem',
      fontWeight: 'bold' as const,
      color: 'var(--accent-primary)',
      width: '20px',
      textAlign: 'center' as const,
    },
    skillIndicatorRemove: {
      fontSize: '1rem',
      fontWeight: 'bold' as const,
      color: 'var(--error)',
      width: '20px',
      textAlign: 'center' as const,
    },
    skillsSeparator: {
      padding: '0.75rem 1rem',
      fontSize: '0.75rem',
      fontWeight: 600,
      color: 'var(--text-muted)',
      background: 'rgba(255, 255, 255, 0.02)',
      borderBottom: '1px solid var(--border-color)',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      opacity: 0.7,
    },
    customSkillInput: {
      padding: '1rem',
      borderTop: '1px solid var(--border-color)',
      background: 'rgba(255, 255, 255, 0.02)',
      flexShrink: 0,
    },
    customInput: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      background: 'rgba(255, 255, 255, 0.05)',
      color: 'var(--text-primary)',
      fontSize: '0.9rem',
      outline: 'none',
    },
    selectedSkills: {
      marginTop: '1rem',
    },
    selectedSkillsTitle: {
      margin: '0 0 0.75rem 0',
      fontSize: '0.9rem',
      color: 'var(--text-secondary)',
    },
    skillsTags: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.5rem',
    },
    skillTag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.4rem 0.8rem',
      background: 'var(--accent-primary)',
      color: 'white',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: 500,
    },
    removeSkill: {
      background: 'none',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      fontSize: '1rem',
      lineHeight: 1,
      padding: 0,
      margin: 0,
    },
    errorMessage: {
      padding: '0.75rem',
      background: 'rgba(245, 101, 101, 0.1)',
      border: '1px solid var(--error)',
      borderRadius: '8px',
      color: 'var(--error)',
      textAlign: 'center' as const,
      fontSize: '0.9rem',
    },
    authDivider: {
      textAlign: 'center' as const,
      marginTop: '1rem',
      fontSize: '0.875rem',
      color: 'var(--text-muted)',
    },
    loginLink: {
      color: 'var(--accent-secondary)',
      fontWeight: 600,
      marginLeft: '0.5rem',
      transition: 'color 0.3s ease',
      textDecoration: 'none',
      cursor: 'pointer',
    },
    noSkillsMessage: {
      padding: '2rem 1rem',
      textAlign: 'center' as const,
      color: 'var(--text-muted)',
      fontSize: '0.9rem',
    },
  };

  return (
    <div className="auth-container">
      {/* Inject CSS styles */}
      <style>{formInputStyles}</style>
      
      {/* Background decorations */}
      <div className="bg-decoration bg-decoration-1"></div>
      <div className="bg-decoration bg-decoration-2"></div>
      <div className="bg-decoration bg-decoration-3"></div>

      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            {step === 'credentials' ? 'Ready to learn together?' : 'Select Your Skills'}
          </h1>
          <p className="auth-subtitle">
            {step === 'credentials' 
              ? 'Create your account to start learning and teaching'
              : 'Choose skills you want to learn or teach (optional)'
            }
          </p>
        </div>

        {step === 'credentials' ? (
          <div style={styles.authForm}>
            <div style={styles.formGroup}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={styles.formInput}
                className="form-input"
              />
            </div>
            <div style={styles.formGroup}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={styles.formInput}
                className="form-input"
              />
            </div>
            <div style={styles.formGroup}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={styles.formInput}
                className="form-input"
              />
            </div>
            
            {error && <div style={styles.errorMessage}>{error}</div>}
            
            <button onClick={handleContinue} className="auth-button auth-button-primary">
              Continue
            </button>
            
            <div style={styles.authDivider}>
              <span>Already have an account?</span>
              <a href="/login" className="register-link" style={styles.loginLink}>
                Login here
              </a>
            </div>
          </div>
        ) : (
          <div style={styles.skillsSection}>
            {skillsFetchError && (
              <div style={{ color: '#f56565', marginBottom: '1rem', textAlign: 'center', fontWeight: 500 }}>
                {skillsFetchError}
              </div>
            )}
            <div style={styles.skillsDropdownContainer}>
              <div 
                style={styles.skillsDropdownTrigger}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>
                  {skills.length > 0 
                    ? `${skills.length} skill${skills.length > 1 ? 's' : ''} selected`
                    : 'Select skills...'
                  }
                </span>
                <span style={isDropdownOpen ? styles.dropdownArrowOpen : styles.dropdownArrow}>▼</span>
              </div>

              {isDropdownOpen && (
                <div style={styles.skillsDropdown}>
                  {/* Fixed Search at top */}
                  <div style={styles.skillsSearch}>
                    <input
                      type="text"
                      placeholder="Search skills..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      style={styles.searchInput}
                    />
                  </div>

                  {/* Scrollable Skills List */}
                  <div style={styles.skillsListContainer}>
                    {predefinedSkills.length === 0 && customSkills.length === 0 && search ? (
                      <div style={styles.noSkillsMessage}>
                        No skills found matching "{search}"
                      </div>
                    ) : (
                      <>
                        {/* Predefined Skills */}
                        {predefinedSkills.map(skill => (
                          <div
                            key={skill.id}
                            style={{
                              ...styles.skillItem,
                              ...(skills.includes(skill.name) ? styles.skillItemSelected : {}),
                              ...(hoveredSkill === skill.name && !skills.includes(skill.name) ? styles.skillItemHover : {})
                            }}
                            onClick={() => toggleSkill(skill.name)}
                            onMouseEnter={() => setHoveredSkill(skill.name)}
                            onMouseLeave={() => setHoveredSkill(null)}
                          >
                            <span style={styles.skillName}>{skill.name}</span>
                            <span style={
                              skills.includes(skill.name) && hoveredSkill === skill.name 
                                ? styles.skillIndicatorRemove 
                                : styles.skillIndicator
                            }>
                              {skills.includes(skill.name) 
                                ? (hoveredSkill === skill.name ? '×' : '✓')
                                : '+'
                              }
                            </span>
                          </div>
                        ))}

                        {/* Separator */}
                        {customSkills.length > 0 && predefinedSkills.length > 0 && (
                          <div style={styles.skillsSeparator}>Custom Skills</div>
                        )}

                        {/* Custom Skills */}
                        {customSkills.map(skill => (
                          <div
                            key={skill.id}
                            style={{
                              ...styles.skillItem,
                              ...(skills.includes(skill.name) ? styles.skillItemSelected : {}),
                              ...(hoveredSkill === skill.name && !skills.includes(skill.name) ? styles.skillItemHover : {})
                            }}
                            onClick={() => toggleSkill(skill.name)}
                            onMouseEnter={() => setHoveredSkill(skill.name)}
                            onMouseLeave={() => setHoveredSkill(null)}
                          >
                            <span style={styles.skillName}>{skill.name}</span>
                            <span style={
                              skills.includes(skill.name) && hoveredSkill === skill.name 
                                ? styles.skillIndicatorRemove 
                                : styles.skillIndicator
                            }>
                              {skills.includes(skill.name) 
                                ? (hoveredSkill === skill.name ? '×' : '✓')
                                : '+'
                              }
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Fixed Add Custom Skill at bottom */}
                  <div style={styles.customSkillInput}>
                    <input
                      type="text"
                      placeholder="Add custom skill..."
                      value={customSkill}
                      onChange={e => {
                        setCustomSkill(e.target.value);
                        // Clear the "skill already exists" error when typing
                        if (error === 'This skill already exists.') {
                          setError('');
                        }
                      }}
                      onKeyPress={handleKeyPress}
                      style={styles.customInput}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Selected Skills Display */}
            {skills.length > 0 && (
              <div style={styles.selectedSkills}>
                <h4 style={styles.selectedSkillsTitle}>Selected Skills:</h4>
                <div style={styles.skillsTags}>
                  {skills.map(skill => (
                    <span key={skill} style={styles.skillTag}>
                      {skill}
                      <button
                        onClick={() => toggleSkill(skill)}
                        style={styles.removeSkill}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {error && <div style={styles.errorMessage}>{error}</div>}

            <div className="auth-actions">
              <button onClick={handleRegister} className="auth-button auth-button-primary">
                Complete Registration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}