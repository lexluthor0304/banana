import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  original: string;
  edited: string;
}

const ResultViewer: React.FC<Props> = ({ original, edited }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">{t('result')}</h2>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-1">
          <p className="text-center text-sm">{t('original')}</p>
          <img src={original} alt="original" className="w-full" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-center text-sm">{t('edited')}</p>
          <img src={edited} alt="edited" className="w-full" />
          <a
            href={edited}
            download="edited.png"
            className="inline-block px-4 py-2 bg-green-600 text-white"
          >
            {t('download')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResultViewer;
