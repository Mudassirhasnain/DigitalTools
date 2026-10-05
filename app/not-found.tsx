import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Wrench } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 sm:py-32 text-center space-y-6">
      <div className="inline-flex p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
        <Wrench className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          404 – Page Not Found
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          The requested tool or page could not be located. It may have been moved, renamed, or
          does not exist in our directory.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors shadow-sm"
        >
          <Home className="w-4 h-4" />
          <span>Return to All Tools</span>
        </Link>
      </div>
    </div>
  );
}
