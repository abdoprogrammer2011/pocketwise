import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, User, Users, Loader2 } from 'lucide-react';
import { registerParent, registerChild } from '../../services/authService';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSwitcher from '../Layout/LanguageSwitcher';

export default function Signup() {
  const { t } = useLanguage();
  const [role, setRole] = useState('child');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [linkCode, setLinkCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setSubmitting(true);
    try {
      if (role === 'parent') {
        await registerParent({ name, email, password });
      } else {
        await registerChild({ name, email, password, linkCode: linkCode.trim().toUpperCase() });
      }
      // AuthContext picks up the new session automatically once Firebase resolves it.
    } catch (err) {
      if (err.message === 'INVALID_LINK_CODE') setError(t('auth.invalidLinkCode'));
      else if (err.code === 'auth/email-already-in-use') setError(t('auth.emailInUse'));
      else setError(t('auth.genericError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
        <LanguageSwitcher />
      </div>

      <div className="glass-card w-full max-w-md p-8 animate-fade-up">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-primary-600 text-white p-3 rounded-2xl mb-3 shadow-lg shadow-primary-600/30">
            <Wallet size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">{t('common.appName')}</h1>
          <p className="text-slate-500 text-sm mt-1">{t('auth.createAccount')}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            type="button"
            onClick={() => setRole('child')}
            className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${
              role === 'child'
                ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                : 'bg-white/60 border-white/60 text-slate-600'
            }`}
          >
            <User size={20} />
            <span className="text-sm font-semibold">{t('auth.roleChild')}</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('parent')}
            className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${
              role === 'parent'
                ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                : 'bg-white/60 border-white/60 text-slate-600'
            }`}
          >
            <Users size={20} />
            <span className="text-sm font-semibold">{t('auth.roleParent')}</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-100/80 text-red-700 text-sm px-3 py-2 rounded-xl mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">{t('auth.name')}</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">{t('auth.email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">{t('auth.password')}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>

          {role === 'child' && (
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">{t('auth.linkCode')}</label>
              <input
                required
                value={linkCode}
                onChange={(e) => setLinkCode(e.target.value)}
                className="input-field uppercase tracking-widest"
                placeholder="ABC123"
                maxLength={6}
              />
              <p className="text-xs text-slate-400 mt-1">{t('auth.linkCodeHint')}</p>
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
            {submitting && <Loader2 size={18} className="animate-spin" />}
            {t('auth.signupBtn')}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/" className="text-primary-600 font-semibold hover:underline">
            {t('auth.loginBtn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
