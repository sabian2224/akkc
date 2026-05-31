'use client';

import { useEffect, useState } from 'react';
import { useForm } from '@/contexts/FormContext';

const CATEGORIES = [
  'Procedura e aplikimit',
  'Dokumentacioni i nevojshëm',
  'Statusi i aplikimit',
  'Llojet e licencës',
  'Çështje teknike (platforma online)',
  'Tjetër',
];

type SendState = 'idle' | 'sending' | 'sent' | 'error';

export default function ChatWidget() {
  const { state } = useForm();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  // The e-mail is taken from Section 1 when filled, but can be overridden here.
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SendState>('idle');
  const [error, setError] = useState('');

  // Keep the e-mail in sync with Section 1 until the user edits the form here.
  const sectionEmail = state.subjectEmail?.trim() ?? '';
  const [emailTouched, setEmailTouched] = useState(false);
  useEffect(() => {
    if (!emailTouched && sectionEmail) setEmail(sectionEmail);
  }, [sectionEmail, emailTouched]);

  // Close the popup with Escape for accessibility.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !category || !subject.trim() || !message.trim()) {
      setError('Plotësoni të gjitha fushat e detyrueshme.');
      return;
    }
    if (!consent) {
      setError('Duhet të pranoni përdorimin e të dhënave.');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          category,
          subject: subject.trim(),
          message: message.trim(),
          applicationId: state.applicationId || undefined,
          consent,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Dërgimi dështoi.');
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Dërgimi dështoi. Provoni përsëri.');
    }
  }

  function resetAndClose() {
    setOpen(false);
    // Reset the form a moment after closing so the success view isn't seen fading out.
    setTimeout(() => {
      setStatus('idle');
      setCategory('');
      setSubject('');
      setMessage('');
      setConsent(false);
      setError('');
    }, 250);
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          className="chat-fab"
          onClick={() => setOpen(true)}
          aria-label="Hap formularin e pyetjeve"
        >
          Keni pyetje?
        </button>
      )}

      {open && (
        <div className="chat-popup" role="dialog" aria-modal="true" aria-label="Dërgo pyetje/kërkesë">
          <div className="chat-head">
            <strong>Dërgo pyetje/kërkesë për informacion</strong>
            <button type="button" className="chat-close" onClick={resetAndClose} aria-label="Mbyll">
              ×
            </button>
          </div>

          <div className="chat-body">
            {status === 'sent' ? (
              <div className="chat-success">
                <div className="chat-success-icon" aria-hidden>✓</div>
                <h3>Kërkesa u dërgua</h3>
                <p>
                  Faleminderit! Pyetja juaj u regjistrua. Do t'ju përgjigjemi në adresën e-mail që
                  keni dhënë.
                </p>
                <button type="button" className="chat-send" onClick={resetAndClose}>
                  Mbyll
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <div className="chat-notice">
                  Të dhënat e subjektit merren nga Seksioni 1; nuk është e nevojshme t'i plotësoni
                  përsëri.
                </div>

                <div className="chat-field">
                  <label>
                    Email <span className="req">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Shkruani email-in"
                    value={email}
                    onChange={(e) => {
                      setEmailTouched(true);
                      setEmail(e.target.value);
                    }}
                  />
                </div>

                <div className="chat-field">
                  <label>
                    Kategoria e pyetjes/kërkesës <span className="req">*</span>
                  </label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Zgjidhni kategorinë</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="chat-field">
                  <label>
                    Subjekti i pyetjes/kërkesës <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Shkruani subjektin"
                    maxLength={200}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="chat-field">
                  <label>
                    Pyetja/kërkesa juaj <span className="req">*</span>
                  </label>
                  <textarea
                    placeholder="Shkruani pyetjen ose kërkesën tuaj..."
                    maxLength={5000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <label className="chat-consent">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>
                    Pranoj që të dhënat e vendosura dhe të dhënat e subjektit të përdoren vetëm për
                    trajtimin e kësaj kërkese. <span className="req">*</span>
                  </span>
                </label>

                {error && <div className="chat-error">{error}</div>}

                <button type="submit" className="chat-send" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Duke dërguar…' : 'Dërgo kërkesën'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
