import React, { useState } from 'react';
import * as api from '../lib/api';

interface Props {
  onRegistered: () => void;
}

const RegisterForm: React.FC<Props> = ({ onRegistered }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.register(username, password);
      await api.login(username, password);
      onRegistered();
    } catch {
      setError('register failed');
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && <div className="text-sm text-red-500">{error}</div>}
      <input
        className="w-full border p-2"
        placeholder="Username"
        value={username}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setUsername(e.target.value)
        }
      />
      <input
        type="password"
        className="w-full border p-2"
        placeholder="Password"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setPassword(e.target.value)
        }
      />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white">
        Register
      </button>
    </form>
  );
};

export default RegisterForm;
