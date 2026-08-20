/**
 * Auth Page
 * Main authentication page with login/register flow.
 */

import { useState } from 'react';
import { PiggyBank } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <PiggyBank className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">PocketWise</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Smart money habits for kids & teens</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-8">
          {mode === 'login' ? (
            <LoginForm
              onSuccess={onAuthSuccess}
              onSwitchToRegister={() => setMode('register')}
            />
          ) : (
            <RegisterForm
              onSuccess={onAuthSuccess}
              onSwitchToLogin={() => setMode('login')}
            />
          )}
        </div>

        {/* Features hint */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}