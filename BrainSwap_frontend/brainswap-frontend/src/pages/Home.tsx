import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';

// Define the Post and Skill types based on the backend DTO
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

interface Skill {
  id: number;
  name: string;
}

export default function Home({ activeTab }: { activeTab: 'TEACHING' | 'LEARN' }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    // Fetch posts
    axiosInstance.get('/posts', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setPosts(res.data))
      .catch(err => {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setPosts([]);
        }
      });
    // Fetch all skills
    axiosInstance.get('/skills/public')
      .then(res => setSkills(res.data))
      .catch(err => {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setSkills([]);
        }
      });
  }, [navigate]);

  // Map skillId to skill name
  const getSkillName = (skillId: number) => {
    const skill = skills.find(s => s.id === skillId);
    return skill ? skill.name : 'Skill';
  };

  // Filter posts by type
  const filteredPosts = posts.filter(post =>
    (activeTab === 'TEACHING' && post.type === 'TEACHING') ||
    (activeTab === 'LEARN' && post.type !== 'TEACHING')
  );

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{activeTab === 'TEACHING' ? 'Available Teaching Posts' : 'Available Learn Together Posts'}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '2rem' }}>
        {filteredPosts.length === 0 && <p>No posts available.</p>}
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => navigate(`/posts/${post.id}`, { state: { postType: post.type } })}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginTop: '1rem' }}>
              <div style={{
                border: '1.5px solid var(--border-color)', borderRadius: '16px', padding: '0.4rem 1.1rem', fontSize: '0.95rem', color: 'var(--accent-primary)', background: 'rgba(251,191,36,0.07)'
              }}>{getSkillName(post.skillId)}</div>
              <div style={{
                border: '1.5px solid var(--border-color)', borderRadius: '16px', padding: '0.4rem 1.1rem', fontSize: '0.95rem', color: 'var(--accent-secondary)', background: 'rgba(52,211,153,0.07)'
              }}>{post.learningType}</div>
              <div style={{
                border: '1.5px solid var(--border-color)', borderRadius: '16px', padding: '0.4rem 1.1rem', fontSize: '0.95rem', color: 'var(--accent-tertiary)', background: 'rgba(167,139,250,0.07)'
              }}>{post.price} BS</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}