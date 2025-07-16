import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface Skill {
  id: number;
  name: string;
}

interface UserData {
  id: number;
  username: string;
  email: string;
  balance: number;
  skills: { name: string }[];
  scheduledCalls: Call[];
}

interface Call {
  scheduledTime: Date;
  maxParticipants: number;
}

type LearningType = 'VISUAL' | 'AUDITORY' | 'PHYSICAL' | 'SOCIAL' | null;

export default function AddPost() {
  const navigate = useNavigate();
  const location = useLocation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [learningType, setLearningType] = useState<LearningType>(null);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [maxParticipants, setMaxParticipants] = useState<number>(1);
  const [calls, setCalls] = useState<Call[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Get post type from the current tab
  const postType = location.state?.activeTab === 'LEARN' ? 'LEARN_TOGETHER' : 'TEACHING';

  // Fetch user data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.id;

      // Fetch user data to get their skills
      axiosInstance.get(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setUserData(res.data))
        .catch(err => {
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            localStorage.removeItem('token');
            navigate('/login');
          }
        });
    } catch (error) {
      console.error('Error parsing token:', error);
      navigate('/login');
    }
  }, [navigate]);

  // Fetch all skills
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    axiosInstance.get('/skills/public')
      .then(res => {
        setAllSkills(res.data);
      })
      .catch(err => {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setAllSkills([]);
        }
      });
  }, [navigate]);

  // Filter skills based on search and tab
  const filteredSkills = allSkills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(skillSearch.toLowerCase());
    if (postType === 'TEACHING') {
      return matchesSearch && userData?.skills.some(userSkill => userSkill.name === skill.name);
    }
    return matchesSearch;
  });

  // Reset selected skill when tab changes
  useEffect(() => {
    setSelectedSkillId(null);
  }, [postType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate calls based on post type
    if (postType === 'LEARN_TOGETHER') {
      if (calls.length !== 1) {
        alert('Learn Together posts must have exactly one scheduled call');
        return;
      }
    } else {
      if (calls.length === 0) {
        alert('Please add at least one scheduled call');
        return;
      }
    }
    
    if (!title || !description || !selectedSkillId) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate no duplicate calls
    const hasDuplicates = calls.some((call, index) => {
      const callDate = new Date(call.scheduledTime);
      return calls.findIndex(c => {
        const compareDate = new Date(c.scheduledTime);
        return callDate.getDate() === compareDate.getDate() &&
               callDate.getMonth() === compareDate.getMonth() &&
               callDate.getFullYear() === compareDate.getFullYear() &&
               callDate.getHours() === compareDate.getHours();
      }) !== index;
    });

    if (hasDuplicates) {
      alert('Please remove duplicate calls before submitting');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // Get user ID from token's id claim
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.id;

      // Create the post first
      const postResponse = await axiosInstance.post('/posts', {
        title,
        description,
        skillId: selectedSkillId,
        ownerId: userId,
        learningType,
        type: postType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Create calls for the post
      if (calls.length > 0) {
        await Promise.all(calls.map(call => 
          axiosInstance.post('/calls', {
            postId: postResponse.data.id,
            ownerId: userId,
            scheduledTime: call.scheduledTime.toISOString(),
            maxParticipants: call.maxParticipants,
            isLearnTogether: postType === 'LEARN_TOGETHER'
          }, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ));
      }
      
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create post');
    }
  };

  const handleAddCall = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }

    // Create a new date object for the selected date and time
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const callDate = new Date(selectedDate);
    callDate.setHours(hours, minutes);

    // Check for duplicate date and time
    const isDuplicate = calls.some(call => {
      const existingCallDate = new Date(call.scheduledTime);
      return existingCallDate.getDate() === callDate.getDate() &&
             existingCallDate.getMonth() === callDate.getMonth() &&
             existingCallDate.getFullYear() === callDate.getFullYear() &&
             existingCallDate.getHours() === callDate.getHours();
    });

    if (isDuplicate) {
      alert('A call at this time already exists for this date and time');
      return;
    }

    const newCall = {
      scheduledTime: callDate,
      maxParticipants: maxParticipants,
      isLearnTogether: postType === 'LEARN_TOGETHER'
    };

    setCalls(prev => [...prev, newCall]);
    setSelectedTime(''); // Reset time selection
    setMaxParticipants(1); // Reset max participants
    // Don't reset selectedDate or hide time picker
  };

  const removeCall = (index: number) => {
    setCalls(prev => prev.filter((_, i) => i !== index));
  };

  const getSelectedSkillName = () => {
    const skill = allSkills.find(s => s.id === selectedSkillId);
    return skill ? skill.name : 'Select a skill';
  };

  const styles = {
    container: {
      padding: '2rem',
      width: '100%',
      maxWidth: '100%',
      margin: '0 auto',
    },
    form: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '24px',
      padding: '2.5rem',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem',
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 700,
      color: 'var(--text-primary)',
      marginBottom: '1rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    label: {
      fontSize: '1rem',
      fontWeight: 600,
      color: 'var(--text-secondary)',
    },
    input: {
      padding: '1rem 1.2rem',
      fontSize: '1rem',
      border: '2px solid var(--border-color)',
      borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.05)',
      color: 'var(--text-primary)',
      outline: 'none',
      transition: 'all 0.3s ease',
    },
    textarea: {
      padding: '1rem 1.2rem',
      fontSize: '1rem',
      border: '2px solid var(--border-color)',
      borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.05)',
      color: 'var(--text-primary)',
      outline: 'none',
      transition: 'all 0.3s ease',
      minHeight: '150px',
      resize: 'vertical' as const,
    },
    select: {
      padding: '1rem 1.2rem',
      fontSize: '1rem',
      border: '2px solid var(--border-color)',
      borderRadius: '12px',
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      outline: 'none',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      WebkitAppearance: 'none' as const,
      MozAppearance: 'none' as const,
      appearance: 'none' as const,
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1rem center',
      backgroundSize: '1em',
    },
    submitButton: {
      background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      padding: '1rem 2rem',
      fontSize: '1.1rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '1rem',
    },
    errorMessage: {
      color: 'var(--error)',
      fontSize: '0.9rem',
      marginTop: '0.5rem',
    },
    skillsDropdownContainer: {
      position: 'relative' as const,
    },
    skillsDropdownTrigger: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 1.2rem',
      border: '2px solid var(--border-color)',
      borderRadius: '12px',
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
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
    noSkillsMessage: {
      padding: '2rem 1rem',
      textAlign: 'center' as const,
      color: 'var(--text-muted)',
      fontSize: '0.9rem',
    },
    sectionDescription: {
      fontSize: '0.875rem',
      color: 'var(--text-secondary)',
      marginBottom: '1rem',
    },
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => 
    `${i.toString().padStart(2, '0')}:00`
  );

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>Create New Post</h1>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
            placeholder="Enter post title"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.textarea}
            placeholder="Enter post description"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Skill *</label>
          <div style={styles.skillsDropdownContainer}>
            <div 
              style={styles.skillsDropdownTrigger}
              onClick={() => setIsSkillDropdownOpen(!isSkillDropdownOpen)}
            >
              <span>{getSelectedSkillName()}</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>▼</span>
            </div>

            {isSkillDropdownOpen && (
              <div style={styles.skillsDropdown}>
                <div style={styles.skillsSearch}>
                  <input
                    type="text"
                    placeholder="Search skills..."
                    value={skillSearch}
                    onChange={e => setSkillSearch(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>

                <div style={styles.skillsListContainer}>
                  {filteredSkills.length === 0 ? (
                    <div style={styles.noSkillsMessage}>
                      No skills found matching "{skillSearch}"
                    </div>
                  ) : (
                    filteredSkills.map(skill => (
                      <div
                        key={skill.id}
                        style={{
                          ...styles.skillItem,
                          ...(selectedSkillId === skill.id ? styles.skillItemSelected : {})
                        }}
                        onClick={() => {
                          setSelectedSkillId(skill.id);
                          setIsSkillDropdownOpen(false);
                        }}
                      >
                        <span>{skill.name}</span>
                        {selectedSkillId === skill.id && (
                          <span style={{ color: 'var(--accent-primary)' }}>✓</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Learning Type</label>
          <select
            value={learningType || ''}
            onChange={(e) => setLearningType(e.target.value as LearningType)}
            style={styles.select}
          >
            <option value="">No preference</option>
            <option value="VISUAL">Visual</option>
            <option value="AUDITORY">Auditory</option>
            <option value="PHYSICAL">Physical</option>
            <option value="SOCIAL">Social</option>
          </select>
        </div>

        {/* Call Scheduling Section */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Schedule Calls</label>
          <p style={styles.sectionDescription}>
            {postType === 'LEARN_TOGETHER' 
              ? 'Add exactly one scheduled call for your Learn Together session'
              : 'Add at least one scheduled call for your teaching session'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => {
                  if (date) {
                    setSelectedDate(date);
                    setShowTimePicker(true);
                  }
                }}
                minDate={new Date()}
                dateFormat="MMMM d, yyyy"
                placeholderText="Select a date"
                className="custom-datepicker"
              />
            </div>
            {showTimePicker && (
              <div style={{ flex: 1 }}>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  style={styles.select}
                >
                  <option value="">Select time&nbsp;&nbsp;&nbsp;&nbsp;</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            )}
            {selectedTime && (
              <button
                type="button"
                onClick={handleAddCall}
                style={{
                  background: 'var(--accent-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0 1.5rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                Add
              </button>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={styles.label}>Max Participants per Call</label>
            <input
              type="number"
              min="1"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
              style={styles.input}
            />
          </div>

          {calls.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Scheduled Calls:</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {calls.map((call, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: '8px',
                    }}
                  >
                    <span>
                      {call.scheduledTime.toLocaleString()} (Max: {call.maxParticipants})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCall(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--error)',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <div style={styles.errorMessage}>{error}</div>}

        <button type="submit" style={styles.submitButton}>
          Create Post
        </button>
      </form>

      <style>
        {`
          .custom-datepicker {
            width: 100%;
            padding: 1rem 1.2rem;
            font-size: 1rem;
            border: 2px solid var(--border-color);
            border-radius: 12px;
            background: var(--bg-card);
            color: var(--text-primary);
            outline: none;
          }

          .react-datepicker {
            background-color: var(--bg-card) !important;
            border: 2px solid var(--border-color) !important;
            border-radius: 12px !important;
            font-family: inherit !important;
            backdrop-filter: none !important;
            opacity: 1 !important;
          }

          .react-datepicker-popper {
            background-color: var(--bg-card) !important;
            border: 2px solid var(--border-color) !important;
            border-radius: 12px !important;
            backdrop-filter: none !important;
            opacity: 1 !important;
          }

          .react-datepicker__header {
            background-color: var(--bg-secondary) !important;
            border-bottom: 2px solid var(--border-color) !important;
            border-top-left-radius: 10px !important;
            border-top-right-radius: 10px !important;
            backdrop-filter: none !important;
            opacity: 1 !important;
          }

          .react-datepicker__current-month,
          .react-datepicker__day-name,
          .react-datepicker__day {
            color: var(--text-primary) !important;
            background-color: transparent !important;
          }

          .react-datepicker__day:hover {
            background-color: var(--accent-primary) !important;
            color: white !important;
          }

          .react-datepicker__day--selected {
            background-color: var(--accent-primary) !important;
            color: white !important;
          }

          .react-datepicker__day--keyboard-selected {
            background-color: var(--accent-primary) !important;
            color: white !important;
          }

          .react-datepicker__navigation {
            top: 12px !important;
            background-color: transparent !important;
          }

          .react-datepicker__navigation-icon::before {
            border-color: var(--text-primary) !important;
          }

          .react-datepicker__day--disabled {
            color: var(--text-muted) !important;
            background-color: transparent !important;
          }

          .react-datepicker__triangle {
            display: none !important;
          }
        `}
      </style>
    </div>
  );
} 