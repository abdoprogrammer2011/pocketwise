/**
 * Button Component
 * Reusable button with multiple variants and states.
 */

import { forwardRef } from 'react';

const Button = forwardRef(({ children, variant = 'primary', size = 'md', disabled = false, loading = false, className = '', ...props }, ref) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950 shadow-sm',
    secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus-visible:ring-gray-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950 shadow-sm',
    danger: 'bg-error-600 text-white hover:bg-error-700 focus-visible:ring-error-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950 shadow-sm',
    ghost: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-gray-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950',
    glass: 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-glass border border-white/20 dark:border-gray-700/50 text-gray-900 dark:text-gray-50 hover:bg-white/80 dark:hover:bg-gray-800/80 focus-visible:ring-brand-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950 shadow-glass',
    outline: 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 focus-visible:ring-brand-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
    icon: 'p-2.5',
  };

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;