'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  label = 'Copy',
  copiedLabel = 'Copied!',
  className = '',
  size = 'md',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sizeClasses =
    size === 'sm' ? 'px-2.5 py-1 text-xs gap-1.5' : 'px-3 py-1.5 text-sm gap-2';

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? copiedLabel : label}
      className={`inline-flex items-center justify-center font-medium rounded-md transition-colors border select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        copied
          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700'
      } ${sizeClasses} ${className}`}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
      )}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
};
