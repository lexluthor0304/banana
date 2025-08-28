import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pack } from '../lib/types';

interface Props {
  onBuy: (pack: Pack) => void;
}

const BuyCreditsButton: React.FC<Props> = ({ onBuy }) => {
  const { t } = useTranslation();
  const [pack, setPack] = useState<Pack>('10');
  return (
    <div className="space-x-2">
      <select
        value={pack}
        onChange={(e) => setPack(e.target.value as Pack)}
        className="border p-1"
      >
        <option value="10">10</option>
        <option value="50">50</option>
      </select>
      <button
        onClick={() => onBuy(pack)}
        className="px-4 py-2 bg-purple-600 text-white"
      >
        {t('buy_credits')}
      </button>
    </div>
  );
};

export default BuyCreditsButton;
