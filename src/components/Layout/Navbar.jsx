import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { logout } from '../../services/authService';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { profile } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-lg bg-white/50 border-b border-white/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary-600 text-white p-1.5 rounded-xl">
            <Wallet size={20} />
          </div>
          <span className="font-extrabold text-slate-800 text-lg">{t('common.appName')}</span>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {profile && (
            <div className="hidden sm:flex items-center gap-2 glass-panel px-3 py-2">
              <span className="text-sm font-semibold text-slate-700">{profile.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 font-medium">
                {profile.role === 'parent' ? t('auth.roleParent') : t('auth.roleChild')}
              </span>
            </div>
          )}

          <button
            onClick={logout}
            className="p-2.5 rounded-xl bg-white/60 hover:bg-white text-slate-500 hover:text-red-500 transition-colors"
            aria-label={t('nav.logout')}
            title={t('nav.logout')}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
