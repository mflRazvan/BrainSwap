import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosConfig';
import axios from 'axios';
import { Eye, EyeOff, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Skill {
  name: string;
}

interface Call {
  id: number;
  scheduledTime: string;
  maxParticipants: number;
  currentParticipants: number;
  owner: {
    id: number;
    username: string;
  };
  participants: {
    id: number;
    username: string;
  }[];
  participantPrice: number;
  status: string;
  isActive: boolean;
  zoomJoinUrl: string;
  zoomMeetingId: string;
  zoomPassword: string;
  zoomHostKey: string;
}

interface User {
  username: string;
  email: string;
  balance: number;
  skills: Skill[];
  scheduledCalls: Call[];
}

interface Post {
  id: number;
  title: string;
  description: string;
  owner: {
    id: number;
    username: string;
  };
  skillId: number;
  price: number;
  learningType: string;
  type: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [error, setError] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Map skillId to skill name
  const getSkillName = (skillId: number) => {
    const skill = allSkills.find(s => s.name === skillId.toString());
    return skill ? skill.name : 'Skill';
  };

  // Helper to capitalize only the first letter
  const formatEnum = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Fetch user details and posts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.id;
      
      axiosInstance.get(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setUser(res.data);
          setUsername(res.data.username);
          setEmail(res.data.email);
          setSkills(res.data.skills);
        })
        .catch(() => navigate('/login'));

      // Fetch all skills
      axios.get('http://localhost:8080/skills/public')
        .then(res => setAllSkills(res.data))
        .catch(() => setAllSkills([]));

      // Fetch user posts
      axiosInstance.get(`/posts/user/id/${userId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      })
        .then(res => setPosts(res.data))
        .catch(() => setPosts([]))
        .finally(() => setLoading(false));
    } catch (error) {
      console.error('Error parsing token:', error);
      navigate('/login');
    }
  }, [navigate]);

  // Filter skills for dropdown
  const filteredSkills = allSkills.filter(skill =>
    skill.name.toLowerCase().includes(skillSearch.toLowerCase()) && !skills.some(s => s.name === skill.name)
  );

  // Add custom skill
  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (!trimmed || skills.some(s => s.name === trimmed)) return;
    setSkills(prev => [...prev, { name: trimmed }]);
    setCustomSkill('');
    setSkillSearch('');
    setIsSkillDropdownOpen(false);
  };

  // Remove skill
  const removeSkill = (name: string) => {
    setSkills(prev => prev.filter(s => s.name !== name));
  };

  // Save changes
  const handleSave = async () => {
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.id;

      await axiosInstance.put(`/users/${userId}`, {
        username,
        email,
        password: password || undefined,
        balance: null,
        skills: skills.map(s => ({ name: s.name })),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditing(false);
      setPassword('');
      // Refetch user data
      const res = await axiosInstance.get(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setSkills(res.data.skills);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleDeletePost = async (postId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Remove the deleted post from the state
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  if (loading || !user) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        padding: '2.5rem 2rem',
        width: '60vw',
        maxWidth: '520px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        position: 'relative',
      }}>
        {/* Edit button */}
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              background: 'var(--accent-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1.2rem',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 8px rgba(251,191,36,0.09)',
            }}
          >
            <Pencil size={18} /> Edit
          </button>
        )}
        {/* User avatar */}
        <div style={{
          width: 90,
          height: 90,
          borderRadius: '12px',
          background: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          color: 'var(--text-muted)',
          margin: '0 auto 1.2rem auto',
          boxShadow: '0 2px 8px rgba(251,191,36,0.07)',
        }}>
          <span role="img" aria-label="user">👤</span>
        </div>
        {/* Username under avatar */}
        <div style={{
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '1.5rem',
          color: 'var(--text-primary)',
          marginBottom: 18,
        }}>{editing ? (
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{
              fontWeight: 700,
              fontSize: '1.5rem',
              color: 'var(--text-primary)',
              background: 'transparent',
              border: 'none',
              borderBottom: '2px solid var(--accent-primary)',
              outline: 'none',
              textAlign: 'center',
              margin: 0,
              padding: '0.2rem 0',
              width: '60%',
              minWidth: 120,
              maxWidth: 300,
            }}
          />
        ) : user.username}</div>
        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 500, margin: '0 auto', width: '100%' }}>
          {/* Email */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontWeight: 600, minWidth: 90 }}>Email:</span>
            {editing ? (
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ flex: 1, padding: '0.7rem 1rem', borderRadius: 8, border: '1.5px solid var(--border-color)', fontSize: '1rem' }}
              />
            ) : (
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{user.email}</span>
            )}
          </div>
          {/* Password */}
          {editing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 600, minWidth: 90 }}>Password:</span>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem',
                    borderRadius: 8,
                    border: '1.5px solid var(--border-color)',
                    fontSize: '1rem',
                    background: '#fff',
                    boxShadow: 'none',
                  }}
                  placeholder="New password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: 0,
                    zIndex: 2,
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}
          {/* Skills */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 24 }}>
            <span style={{ fontWeight: 600, minWidth: 90, marginTop: 6 }}>Skills:</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', minHeight: 48 }}>
                {/* Skill tags */}
                {skills.map(skill => (
                  <span key={skill.name} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 0.8rem',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    position: 'relative',
                  }}>
                    {skill.name}
                    {editing && (
                      <button
                        onClick={() => removeSkill(skill.name)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          lineHeight: 1,
                          padding: 0,
                          margin: 0,
                          marginLeft: 4,
                        }}
                        title="Remove skill"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
                {/* Add Skill Tag */}
                {editing && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.4rem 0.8rem',
                      background: 'var(--bg-secondary)',
                      color: 'var(--accent-primary)',
                      border: '2px dashed var(--accent-primary)',
                      borderRadius: '20px',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    onClick={() => setIsSkillDropdownOpen(s => !s)}
                  >
                    + Add Skill
                  </span>
                )}
              </div>
              {/* Dropdown */}
              {editing && isSkillDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  marginTop: 8,
                  minWidth: 320,
                  background: '#23272f',
                  border: '2px solid var(--border-color)',
                  borderRadius: 12,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.13)',
                  zIndex: 100,
                  maxHeight: 350,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}>
                  {/* Search */}
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <input
                      type="text"
                      placeholder="Search skills..."
                      value={skillSearch}
                      onChange={e => setSkillSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  {/* Skills List */}
                  <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                    {filteredSkills.length === 0 ? (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        No skills found matching "{skillSearch}"
                      </div>
                    ) : (
                      filteredSkills.map(skill => (
                        <div
                          key={skill.name}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 1rem',
                            cursor: 'pointer',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            fontWeight: 500,
                            fontSize: '1rem',
                            color: 'var(--text-primary)',
                            background: skills.some(s => s.name === skill.name) ? 'rgba(251,191,36,0.1)' : undefined,
                            transition: 'background 0.2s',
                          }}
                          onClick={() => {
                            setSkills(prev => [...prev, skill]);
                            setIsSkillDropdownOpen(false);
                            setSkillSearch('');
                          }}
                        >
                          <span>{skill.name}</span>
                          {skills.some(s => s.name === skill.name) && <span style={{ color: 'var(--accent-primary)', marginLeft: 8 }}>✓</span>}
                        </div>
                      ))
                    )}
                  </div>
                  {/* Add Custom Skill */}
                  <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                    <input
                      type="text"
                      placeholder="Add custom skill..."
                      value={customSkill}
                      onChange={e => setCustomSkill(e.target.value)}
                      onKeyPress={e => { if (e.key === 'Enter') addCustomSkill(); }}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {error && <div style={{ color: 'var(--error)', marginTop: 16, textAlign: 'center' }}>{error}</div>}
        {/* Save/Cancel buttons */}
        {editing && (
          <div style={{ display: 'flex', gap: 16, marginTop: 24, justifyContent: 'space-between' }}>
            <button
              onClick={() => {
                setEditing(false);
                setUsername(user.username);
                setEmail(user.email);
                setPassword('');
                setSkills(user.skills);
                setError('');
              }}
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '2px solid orange',
                borderRadius: 8,
                padding: '0.7rem 2.2rem',
                fontWeight: 700,
                fontSize: '1.1rem',
                cursor: 'pointer',
                order: 1,
                boxShadow: 'none',
              }}
            >Cancel</button>
            <button
              onClick={handleSave}
              style={{
                background: 'var(--accent-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.7rem 2.2rem',
                fontWeight: 700,
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(251,191,36,0.09)',
                order: 2,
              }}
            >Save</button>
          </div>
        )}
      </div>
      {/* User's Posts */}
      <div style={{ marginTop: '3.5rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: 18, textAlign: 'center' }}>Your Posts</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
          {posts.length === 0 && <p>No posts yet.</p>}
          {posts.map(post => (
            <div
              key={post.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                padding: '2rem',
                minWidth: '340px',
                maxWidth: '360px',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s, transform 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.2rem',
                position: 'relative',
              }}
            >
              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePost(post.id);
                }}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'var(--error)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                Delete
              </button>

              <div 
                onClick={() => navigate(`/posts/${post.id}`)}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '12px', background: 'var(--bg-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'var(--text-muted)',
                    flexShrink: 0
                  }}>
                    <span role="img" aria-label="user">👤</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{post.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 4 }}>{post.owner.username}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                  {[
                    { key: 'skill', value: getSkillName(post.skillId), color: 'var(--accent-primary)', bg: 'rgba(251,191,36,0.07)' },
                    { key: 'learningType', value: formatEnum(post.learningType), color: 'var(--accent-secondary)', bg: 'rgba(52,211,153,0.07)' },
                    { key: 'price', value: `${post.price} BS`, color: 'var(--accent-tertiary)', bg: 'rgba(167,139,250,0.07)' }
                  ].map(({ key, value, color, bg }) => (
                    <div
                      key={key}
                      style={{
                        border: '1.5px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '0.4rem 1.1rem',
                        fontSize: '0.95rem',
                        color,
                        background: bg
                      }}
                    >
                      {value}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Scheduled Calls Section */}
      {user.scheduledCalls && user.scheduledCalls.length > 0 && (
        <div style={{ marginTop: '3.5rem', width: '100%' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: 18, textAlign: 'center' }}>Your Scheduled Calls</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
            {user.scheduledCalls.map(call => (
              <div
                key={call.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  padding: '2rem',
                  minWidth: '340px',
                  maxWidth: '360px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.2rem',
                  position: 'relative',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  Scheduled for: {new Date(call.scheduledTime).toLocaleString()}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Host: {call.owner.username}
                </div>
                <div style={{ color: 'var(--accent-tertiary)', fontSize: '1.05rem' }}>
                  Participants: {call.currentParticipants} / {call.maxParticipants}
                </div>
                <div style={{ color: call.isActive ? 'green' : 'red', fontWeight: 500 }}>
                  Status: {call.isActive ? 'Active' : 'Inactive'}
                </div>
                {call.zoomJoinUrl && (
                  <a href={call.zoomJoinUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>
                    Join Zoom
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
