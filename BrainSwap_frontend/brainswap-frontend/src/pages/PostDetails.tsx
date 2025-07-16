import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';

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
  isActive: boolean;
  calls: Call[];
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

interface Skill {
  id: number;
  name: string;
}

// Helper to capitalize only the first letter
function formatEnum(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Get current user ID from token
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(tokenPayload.id);
    } catch (error) {
      console.error('Error parsing token:', error);
      navigate('/login');
      return;
    }

    setLoading(true);
    // Fetch post by ID (which includes calls)
    axiosInstance.get(`/posts/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setPost(res.data);
      })
      .catch(err => {
        console.error('Error fetching post:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setPost(null);
        }
      });

    // Fetch all skills
    axiosInstance.get('/skills/public')
      .then(res => setSkills(res.data))
      .catch(err => {
        console.error('Error fetching skills:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setSkills([]);
        }
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const getSkillName = (skillId: number) => {
    const skill = skills.find(s => s.id === skillId);
    return skill ? skill.name : 'Skill';
  };

  const handleScheduleCall = async (callId: number) => {
    const token = localStorage.getItem('token');
    if (!token || !currentUserId) {
      navigate('/login');
      return;
    }

    try {
      const response = await axiosInstance.post('/calls/schedule', {
        callId,
        userId: currentUserId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the post with the new call data
      if (post) {
        setPost({
          ...post,
          calls: post.calls.map(call => 
            call.id === callId ? response.data : call
          )
        });
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.status === 409) {
        alert('You have already scheduled this call');
      } else {
        alert('Failed to schedule call. Please try again.');
      }
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!post) return <div style={{ padding: '2rem' }}>Post not found.</div>;

  const isLearnTogether = post.type === 'LEARN_TOGETHER';
  const isOwner = currentUserId === post.owner.id;

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        padding: '2.5rem 2rem',
        width: '90vw',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}>
        <div style={{ fontWeight: 700, fontSize: '2rem', color: 'var(--text-primary)', marginBottom: 8 }}>{post.title}</div>
        <hr style={{ border: 'none', borderTop: '1.5px solid rgba(160,174,192,0.18)', margin: '16px 0' }} />
        <div style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', marginBottom: 8 }}>{post.description}</div>
        <hr style={{ border: 'none', borderTop: '1.5px solid rgba(160,174,192,0.18)', margin: '16px 0' }} />
        <div style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: 8 }}>
          <b>{isLearnTogether ? 'User' : 'Teacher'}:</b> {post.owner.username}
        </div>
        <hr style={{ border: 'none', borderTop: '1.5px solid rgba(160,174,192,0.18)', margin: '16px 0' }} />
        <div style={{ color: 'var(--accent-primary)', fontSize: '1.05rem', marginBottom: 8 }}><b>Skill:</b> {getSkillName(post.skillId)}</div>
        <hr style={{ border: 'none', borderTop: '1.5px solid rgba(160,174,192,0.18)', margin: '16px 0' }} />
        <div style={{ color: 'var(--accent-secondary)', fontSize: '1.05rem', marginBottom: 8 }}><b>Learning Type:</b> {formatEnum(post.learningType)}</div>
        <hr style={{ border: 'none', borderTop: '1.5px solid rgba(160,174,192,0.18)', margin: '16px 0' }} />
        <div style={{ color: 'var(--accent-tertiary)', fontSize: '1.05rem', marginBottom: 8 }}><b>Price:</b> {post.price} BrainSwap coins</div>
        <hr style={{ border: 'none', borderTop: '1.5px solid rgba(160,174,192,0.18)', margin: '16px 0' }} />

        {/* Scheduled Calls Section */}
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Scheduled Calls
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {post.calls.map(call => (
              <div
                key={call.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatDateTime(call.scheduledTime)}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Available seats: {call.maxParticipants - call.currentParticipants} / {call.maxParticipants}
                  </div>
                </div>
                {!isOwner && call.isActive && call.currentParticipants < call.maxParticipants && (
                  <button
                    onClick={() => handleScheduleCall(call.id)}
                    style={{
                      background: 'var(--accent-primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem 1.5rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    Schedule Call
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <button onClick={() => navigate(-1)} style={{ marginTop: '2.5rem', fontSize: '1.1rem', padding: '0.8rem 2.2rem' }}>&larr; Back</button>
    </div>
  );
}
