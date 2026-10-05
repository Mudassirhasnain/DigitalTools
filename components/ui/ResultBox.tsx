import React from 'react';
import { CopyButton } from './CopyButton';

export interface ResultBoxProps {
  title?: string;
  value?: string;
  children?: React.ReactNode;
  copyable?: boolean;
  copyText?: string;
  downloadAction?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const ResultBox: React.FC<ResultBoxProps> = ({
  title = 'Result',
  value,
  children,
  copyable = true,
  copyText,
  downloadAction,
  actions,
  className = '',
}) => {
  const textToCopy = copyText || value || '';

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60 ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800 gap-2 flex-wrap">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {title}
        </span>
        <div className="flex items-center gap-2">
          {actions}
          {downloadAction}
          {copyable && textToCopy && (
            <CopyButton textToCopy={textToCopy} size="sm" />
          )}
        </div>
      </div>
      <div className="pt-3">
        {value ? (
          <pre className="font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-all select-all bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-850 overflow-x-auto max-h-96">
            {value}
          </pre>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
