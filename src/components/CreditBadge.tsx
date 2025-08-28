import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  credits: number;
}

const CreditBadge: React.FC<Props> = ({ credits }) => {
  const { t } = useTranslation();
  return (
    <div className="p-2 bg-gray-100 rounded">
      {credits > 0 ? t('credits_left', { count: credits }) : t('no_credits')}
    </div>
  );
};

export default CreditBadge;
