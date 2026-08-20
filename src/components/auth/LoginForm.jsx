/**
 * Login Form
 * Email/password authentication with validation.
 */

import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { loginUser, resetPassword } from '../../services/auth';
import { isValidEmail, validatePassword } from '../../utils/helpers';

export function LoginForm({ onSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      await loginUser(email, password);
      onSuccess();
    } catch (error) {
      setErrors({ form: getAuthErrorMessage(error.code) });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrors({ email: 'Enter your email first' });
      return;
    }
    if (!isValidEmail(email)) {
      setErrors({ email: 'Please enter a valid email' });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
      setForgotPassword(false);
    } catch (error) {
      setErrors({ form: getAuthErrorMessage(error.code) });
    } finally {
      setLoading(false);
    }
  };

  const getAuthErrorMessage = (code) => {
    switch (code) {
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later';
      default:
        return 'Login failed. Please try again';
    }
  };

  if (forgotPassword) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Reset Password</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />

          {errors.form && (
            <div className="text-sm text-error-600 dark:text-error-400 text-center" role="alert">
              {errors.form}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setForgotPassword(false)} disabled={loading}>
              Back to Login
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              Send Reset Link
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (resetSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 mx-auto bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-success-600 dark:text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Check your email</h2>
        <p className="text-gray-500 dark:text-gray-400">
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <Button variant="primary" onClick={() => setResetSent(false)}>
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Welcome back</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your PocketWise account</p>
      </div>

      <div className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
        />

        {errors.form && (
          <div className="text-sm text-error-600 dark:text-error-400 text-center" role="alert">
            {errors.form}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
        </label>
        <button
          type="button"
          onClick={() => setForgotPassword(true)}
          className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          Forgot password?
        </button>
      </div>

      <Button variant="primary" type="submit" className="w-full" loading={loading}>
        Sign In
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">Or</span>
        </div>
      </div>

      <Button variant="outline" type="button" className="w-full" onClick={onSwitchToRegister}>
        Create an account
      </Button>
    </form>
  );
}