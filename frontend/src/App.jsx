import { useState } from 'react';
import './App.css';
import { translations, detectLocale } from './i18n';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

function App() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);

  const locale = detectLocale();
  const t = (key) => translations[locale][key] || translations.en[key];

  const handlePayment = async () => {
    try {
      const stripe = await stripePromise;
      // TODO: Replace with server-side call to create a Checkout session
      alert('Stripe checkout placeholder.');
      if (stripe) {
        // After real checkout success, setPaid(true)
        setPaid(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = () => {
    if (!file || !prompt) return;
    setProcessing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(',')[1];
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  { inline_data: { mime_type: file.type, data: base64 } }
                ]
              }
            ]
          })
        });
        const data = await response.json();
        const imageData = data?.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data;
        if (imageData) {
          setResult(`data:image/png;base64,${imageData}`);
        }
      } catch (err) {
        console.error(err);
      }
      setProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const downloadResult = () => {
    const a = document.createElement('a');
    a.href = result;
    a.download = 'result.png';
    a.click();
  };

  return (
    <div className="container">
      <h1>{t('title')}</h1>
      {!paid && (
        <button onClick={handlePayment}>{t('payButton')}</button>
      )}
      {paid && (
        <div className="editor">
          <label>{t('uploadLabel')}
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
          </label>
          <input
            type="text"
            placeholder={t('promptPlaceholder')}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button onClick={handleEdit} disabled={!file || !prompt || processing}>
            {processing ? '...' : t('editButton')}
          </button>
        </div>
      )}
      {result && (
        <div className="result">
          <h2>{t('resultTitle')}</h2>
          <img src={result} alt="result" />
          <button onClick={downloadResult}>{t('downloadButton')}</button>
        </div>
      )}
    </div>
  );
}

export default App;
