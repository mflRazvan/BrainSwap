import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';

interface UserData {
  id: number;
  username: string;
  email: string;
  balance: number;
  skills: { name: string }[];
}

interface AddBalanceProps {
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
}

export default function AddBalance({ setUserData }: AddBalanceProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAddBalance = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.id;
      const balanceToAdd = parseInt(amount);

      if (isNaN(balanceToAdd) || balanceToAdd <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      const response = await axiosInstance.post('/users/add-balance', {
        id: userId,
        balance: balanceToAdd
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the user data in the parent component
      setUserData(response.data);
    } catch (error) {
      setError('Failed to add balance. Please try again.');
    }
  };

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
      }}>
        <h1 style={{ 
          fontSize: '1.8rem', 
          fontWeight: 700, 
          color: 'var(--text-primary)',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          Add Balance
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ 
              color: 'var(--text-primary)',
              fontWeight: 500,
              fontSize: '1rem'
            }}>
              Amount to Add (BS)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              style={{
                padding: '0.8rem 1rem',
                borderRadius: '12px',
                border: '1.5px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          {error && (
            <div style={{ 
              color: 'var(--error)',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleAddBalance}
            style={{
              background: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              padding: '0.8rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
              marginTop: '1rem',
            }}
          >
            Add Balance
          </button>
        </div>
      </div>
    </div>
  );
} 