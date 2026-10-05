'use client';

import React from 'react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="text-xs text-slate-400">An unexpected error occurred while rendering the page.</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
