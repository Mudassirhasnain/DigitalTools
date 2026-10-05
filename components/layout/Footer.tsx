import React from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { ShieldCheck, Lock, Cpu, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      {/* Honesty & Trust Banner */}
      <div className="border-b border-slate-200/80 dark:border-slate-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  Client-First Architecture
                </h4>
                <p className="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
                  Sensitive documents, passwords, hashes, and photos are processed directly in your browser memory whenever possible.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  Zero Hidden Traps
                </h4>
                <p className="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
                  No forced registration, no surprise credit card requirements, no paywalls, and no watermarks on generated files.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  Honest Processing Disclosures
                </h4>
                <p className="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
                  Every tool explicitly states its compute model, whether 100% offline client-side execution or external API translation routing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Brand Info */}
          <div className="col-span-2">
            <Link
              href="/"
              className="text-base font-bold text-slate-900 dark:text-white inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
            >
              Digital<span className="text-blue-600 dark:text-blue-400">Toools</span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400 max-w-sm">
              Free, modern, privacy-respecting online utilities engineered for software developers, designers, freelancers, and students.
            </p>
            <p className="mt-4 text-[11px] text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} DigitalToools. All rights reserved.
            </p>
          </div>

          {/* Categories Links (All Categories) */}
          <div className="col-span-2 md:col-span-2 lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Tool Categories
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm py-0.5"
                >
                  {cat.name} ({cat.count})
                </Link>
              ))}
            </div>
          </div>

          {/* Platform / Legal Links */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Company & Legal
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/about"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                >
                  About DigitalToools
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                >
                  Global FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                >
                  Contact & Feedback
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
