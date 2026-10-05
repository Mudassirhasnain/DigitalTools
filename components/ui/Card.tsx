import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all dark:border-slate-800 dark:bg-slate-900/90 ${
        hoverable
          ? 'hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 dark:hover:border-slate-700 dark:hover:bg-slate-850'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
