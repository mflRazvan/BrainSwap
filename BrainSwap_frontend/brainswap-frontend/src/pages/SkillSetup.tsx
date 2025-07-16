import { useState } from 'react';
import axios from 'axios';

type Props = {
  userId: number;
};

export default function SkillSetup({ userId }: Props) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [message, setMessage] = useState('');

  const predefinedSkills = ['JavaScript', 'React', 'Spring Boot', 'Python'];

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const saveSkills = async () => {
    try {
      await axios.put(`http://localhost:8080/users/${userId}/skills`, {
        skills: selectedSkills,
      });
      setMessage('Skills saved successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to save skills.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Select Your Skills</h2>

      <div style={{ marginBottom: '1rem' }}>
        {predefinedSkills.map(skill => (
          <label key={skill} style={{ marginRight: '1rem' }}>
            <input
              type="checkbox"
              checked={selectedSkills.includes(skill)}
              onChange={() => toggleSkill(skill)}
            />
            {skill}
          </label>
        ))}
      </div>

      <input
        value={customSkill}
        onChange={e => setCustomSkill(e.target.value)}
        placeholder="Add custom skill"
      />
      <button onClick={addCustomSkill}>Add</button>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={saveSkills}>Save Skills</button>
      </div>

      {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
    </div>
  );
}
