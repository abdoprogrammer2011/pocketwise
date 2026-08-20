import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Mail, Lock, Loader2 } from 'lucide-react';
import { login } from '../../services/authService';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSwitcher from '../Layout/LanguageSwitcher';

export default function Login() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ email, password });
      // No manual navigation needed: AuthContext's onAuthStateChanged listener
      // picks up the new session and App.jsx swaps in the right dashboard.
    } catch (err) {
      setError(t('auth.invalidCredentials'));
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
          <p className="text-slate-500 text-sm mt-1">{t('auth.welcomeBack')}</p>
        </div>

        {error && (
          <div className="bg-red-100/80 text-red-700 text-sm px-3 py-2 rounded-xl mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">{t('auth.email')}</label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10 rtl:pl-3.5 rtl:pr-10"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">{t('auth.password')}</label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 rtl:pl-3.5 rtl:pr-10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
            {submitting && <Loader2 size={18} className="animate-spin" />}
            {t('auth.loginBtn')}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          {t('auth.dontHaveAccount')}{' '}
          <Link to="/signup" className="text-primary-600 font-semibold hover:underline">
            {t('auth.signupBtn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
