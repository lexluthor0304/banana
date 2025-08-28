import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  onEdit: (file: File, prompt: string) => Promise<void>;
  disabled?: boolean;
}

const UploadForm: React.FC<Props> = ({ onEdit, disabled }) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert(t('error_upload_required'));
      return;
    }
    setLoading(true);
    try {
      await onEdit(file, prompt);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="file"
        accept="image/*"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setFile(e.target.files?.[0] || null)
        }
      />
      <textarea
        className="w-full border p-2"
        rows={3}
        placeholder={t('enter_prompt')}
        value={prompt}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setPrompt(e.target.value)
        }
      />
      <button
        type="submit"
        disabled={disabled || loading}
        className="px-4 py-2 bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? t('processing') : t('start_editing')}
      </button>
    </form>
  );
};

export default UploadForm;
