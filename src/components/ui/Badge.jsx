/**
 * Badge Component
 * Reusable badge with variants for status, categories, etc.
 */

import { forwardRef } from 'react';

const Badge = forwardRef(({ children, variant = 'gray', size = 'md', className = '', ...props }, ref) => {
  const variantClasses = {
    primary: 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800',
    success: 'bg-success-100 dark:bg-success-900/50 text-success-700 dark:text-success-300 border border-success-200 dark:border-success-800',
    warning: 'bg-warning-100 dark:bg-warning-900/50 text-warning-700 dark:text-warning-300 border border-warning-200 dark:border-warning-800',
    error: 'bg-error-100 dark:bg-error-900/50 text-error-700 dark:text-error-300 border border-error-200 dark:border-error-800',
    gray: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
    outline: 'bg-transparent text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      ref={ref}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;