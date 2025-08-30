import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RegisterForm from '../components/RegisterForm';
import LanguageSwitcher from '../components/LanguageSwitcher';

interface Props {
  onRegistered: () => void;
}

const RegisterPage: React.FC<Props> = ({ onRegistered }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleRegistered = async () => {
    await onRegistered();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <LanguageSwitcher />
        </div>
        <RegisterForm onRegistered={handleRegistered} />
        <Link to="/login" className="text-sm text-blue-600 underline">
          Go login
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;

