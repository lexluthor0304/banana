import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="border p-1"
    >
      <option value="en">EN</option>
      <option value="ja">日本語</option>
      <option value="zh">中文</option>
    </select>
  );
};

export default LanguageSwitcher;
