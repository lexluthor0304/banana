import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoginForm from '../components/LoginForm';
import LanguageSwitcher from '../components/LanguageSwitcher';

interface Props {
  onLoggedIn: () => void;
}

const LoginPage: React.FC<Props> = ({ onLoggedIn }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLoggedIn = async () => {
    await onLoggedIn();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <LanguageSwitcher />
        </div>
        <LoginForm onLoggedIn={handleLoggedIn} />
        <Link to="/register" className="text-sm text-blue-600 underline">
          Go register
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;

