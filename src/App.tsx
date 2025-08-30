import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UploadForm from './components/UploadForm';
import ResultViewer from './components/ResultViewer';
import LanguageSwitcher from './components/LanguageSwitcher';
import CreditBadge from './components/CreditBadge';
import BuyCreditsButton from './components/BuyCreditsButton';
import * as api from './lib/api';
import { Pack } from './lib/types';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const App: React.FC = () => {
  const { t } = useTranslation();
  const [credits, setCredits] = useState<number>(0);
  const [orig, setOrig] = useState<string | null>(null);
  const [edited, setEdited] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const refresh = async () => {
    try {
      const r = await api.getMeCredits();
      setCredits(r.credits);
      setLoggedIn(true);
    } catch {
      setLoggedIn(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onEdit = async (file: File, prompt: string) => {
    try {
      setError(null);
      const blob = await api.edit(file, prompt);
      setOrig(URL.createObjectURL(file));
      setEdited(URL.createObjectURL(blob));
      setCredits((c) => c - 1);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error_api';
      setError(t(msg));
    }
  };

  const onBuy = async (pack: Pack) => {
    try {
      const { url } = await api.checkout(pack);
      window.location.href = url;
    } catch (e: unknown) {
      setError(t('error_api'));
    }
  };

  const MainPage = () => (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6 rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <LanguageSwitcher />
        </div>
        <CreditBadge credits={credits} />
        {error && <div className="text-sm text-red-500">{error}</div>}
        <UploadForm onEdit={onEdit} disabled={credits <= 0} />
        {edited && orig && <ResultViewer original={orig} edited={edited} />}
        <BuyCreditsButton onBuy={onBuy} />
      </div>
    </div>
  );

  const CheckoutMessage: React.FC<{ success: boolean }> = ({ success }) => (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <LanguageSwitcher />
        </div>
        <p>{success ? t('go_to_checkout') : t('cancel')}</p>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLoggedIn={refresh} />} />
      <Route path="/register" element={<RegisterPage onRegistered={refresh} />} />
      <Route path="/success" element={<CheckoutMessage success={true} />} />
      <Route path="/cancel" element={<CheckoutMessage success={false} />} />
      <Route path="/" element={loggedIn ? <MainPage /> : <Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;

