import React, { useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  leftAddon,
  rightAddon,
  className = '',
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all overflow-hidden">
        {leftAddon && (
          <div className="pl-3 pr-2 text-slate-400 dark:text-slate-500 flex items-center select-none text-sm">
            {leftAddon}
          </div>
        )}
        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {rightAddon && (
          <div className="pr-3 pl-2 text-slate-400 dark:text-slate-500 flex items-center select-none text-sm">
            {rightAddon}
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-xs text-rose-600 dark:text-rose-400" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
};
