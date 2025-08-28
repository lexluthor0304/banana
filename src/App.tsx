import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import UploadForm from './components/UploadForm';
import ResultViewer from './components/ResultViewer';
import LanguageSwitcher from './components/LanguageSwitcher';
import CreditBadge from './components/CreditBadge';
import BuyCreditsButton from './components/BuyCreditsButton';
import * as api from './lib/api';
import { Pack } from './lib/types';

const App: React.FC = () => {
  const { t } = useTranslation();
  const [credits, setCredits] = useState<number>(0);
  const [orig, setOrig] = useState<string | null>(null);
  const [edited, setEdited] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getMeCredits()
      .then((r) => setCredits(r.credits))
      .catch(() => {});
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

  const path = window.location.pathname;
  if (path === '/success' || path === '/cancel') {
    return (
      <div className="p-4">
        <LanguageSwitcher />
        <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
        <p>{path === '/success' ? t('go_to_checkout') : t('cancel')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <LanguageSwitcher />
      </div>
      <CreditBadge credits={credits} />
      {error && <div className="text-red-500">{error}</div>}
      <UploadForm onEdit={onEdit} disabled={credits <= 0} />
      {edited && orig && <ResultViewer original={orig} edited={edited} />}
      <BuyCreditsButton onBuy={onBuy} />
    </div>
  );
};

export default App;
