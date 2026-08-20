/**
 * Register Form
 * Account creation with role selection (Child/Parent).
 */

import { useState } from 'react';
import { Eye, EyeOff, Loader2, Baby, Users } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { registerUser } from '../../services/auth';
import { isValidEmail, validatePassword } from '../../utils/helpers';
import { USER_ROLES } from '../../constants';

export function RegisterForm({ onSuccess, onSwitchToLogin }) {
  const [step, setStep] = useState(1); // 1: role selection, 2: details
  const [role, setRole] = useState(USER_ROLES.CHILD);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [childCode, setChildCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateStep1 = () => {
    if (!role) {
      setErrors({ role: 'Please select a role' });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!displayName.trim()) {
      newErrors.displayName = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    const pwdValidation = validatePassword(password);
    if (!pwdValidation.isValid) {
      newErrors.password = pwdValidation.errors.join(', ');
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (role === USER_ROLES.CHILD && !childCode.trim()) {
      newErrors.childCode = 'Parent code is required for child accounts';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    try {
      await registerUser({
        email,
        password,
        displayName,
        role,
        childCode: role === USER_ROLES.CHILD ? childCode.toUpperCase() : undefined,
      });
      onSuccess();
    } catch (error) {
      setErrors({ form: getAuthErrorMessage(error.code) });
    } finally {
      setLoading(false);
    }
  };

  const getAuthErrorMessage = (code) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/invalid-email':
        return 'Invalid email address';
      default:
        return 'Registration failed. Please try again';
    }
  };

  const RoleOption = ({ value, label, description, icon: Icon }) => (
    <button
      type="button"
      onClick={() => { setRole(value); setErrors({}); }}
      className={`relative p-6 rounded-2xl border-2 transition-all duration-200 w-full text-left ${
        role === value
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
          value === USER_ROLES.CHILD ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
        }`}>
          <Icon className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">{label}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
        {role === value && (
          <svg className="w-6 h-6 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </button>
  );

  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Create your account</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Choose how you'll use PocketWise</p>
        </div>

        <div className="space-y-4">
          <RoleOption
            value={USER_ROLES.CHILD}
            label="Child / Teen"
            description="Track your spending, set savings goals, and earn badges"
            icon={Baby}
          />
          <RoleOption
            value={USER_ROLES.PARENT}
            label="Parent / Guardian"
            description="Monitor your child's spending, set allowances, and guide their habits"
            icon={Users}
          />
        </div>

        {errors.role && (
          <p className="text-sm text-error-600 dark:text-error-400 text-center" role="alert">
            {errors.role}
          </p>
        )}

        <Button variant="primary" onClick={handleNext} className="w-full" loading={loading}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6" noValidate>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
          {role === USER_ROLES.CHILD ? 'Kid\'s Account Setup' : 'Parent Account Setup'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {role === USER_ROLES.CHILD
            ? 'Enter your details and the code from your parent'
            : 'Enter your details to create a family account'}
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          error={errors.displayName}
          required
        />

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
          autoComplete="new-password"
          placeholder="At least 8 characters"
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

        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Repeat password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          required
        />

        {role === USER_ROLES.CHILD && (
          <Input
            label="Parent Code"
            type="text"
            autoComplete="off"
            placeholder="PW-XXXXXX"
            value={childCode.toUpperCase()}
            onChange={(e) => setChildCode(e.target.value.toUpperCase())}
            error={errors.childCode}
            required
            helpText="Get this code from your parent's app"
          />
        )}
      </div>

      {errors.form && (
        <div className="text-sm text-error-600 dark:text-error-400 text-center" role="alert">
          {errors.form}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="ghost" type="button" onClick={() => setStep(1)} className="flex-1" disabled={loading}>
          Back
        </Button>
        <Button variant="primary" type="submit" className="flex-1" loading={loading}>
          Create Account
        </Button>
      </div>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}