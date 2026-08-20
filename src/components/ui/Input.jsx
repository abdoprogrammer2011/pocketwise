/**
 * Input Component
 * Reusable form input with label, error state, and validation.
 */

import { forwardRef, useId } from 'react';

const Input = forwardRef(({ label, error, hint, helpText, id: providedId, className = '', rightIcon, ...props }, ref) => {
  const generatedId = useId();
  const id = providedId || generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const helpId = `${id}-help`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
          {props.required && <span className="text-error-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={id}
          className={`input-field ${error ? 'input-error' : ''} ${rightIcon ? 'pr-12' : ''}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : hint ? hintId : helpText ? helpId : undefined}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="error-text" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {hint}
        </p>
      )}
      {helpText && !error && !hint && (
        <p id={helpId} className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {helpText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;