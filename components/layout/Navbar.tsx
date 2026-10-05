'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Wrench, Menu, X, ChevronDown, Search } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-slate-900 dark:text-white group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md py-1 px-1"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white shadow-xs group-hover:bg-blue-500 transition-colors">
            <Wrench className="w-4 h-4" />
          </div>
          <span>
            Digital<span className="text-blue-600 dark:text-blue-400">Tools</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
          >
            All Tools
          </Link>

          {/* Categories dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              onBlur={() => setTimeout(() => setCategoryDropdownOpen(false), 200)}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
              aria-expanded={categoryDropdownOpen}
            >
              <span>Categories</span>
              <ChevronDown className="w-4 h-4 opacity-70" />
            </button>

            {categoryDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900 z-50">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="flex flex-col p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {cat.count} tools available
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/about"
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
          >
            About
          </Link>
          <Link
            href="/faq"
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
          >
            FAQ
          </Link>
          <Link
            href="/contact"
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
          >
            Contact
          </Link>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <Link
            href="/#search"
            aria-label="Search tools"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-xs text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search...</span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-850 text-slate-500">
              /
            </kbd>
          </Link>

          <ThemeToggle />

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col space-y-3 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-slate-700 dark:text-slate-200"
            >
              All Tools (26)
            </Link>
            <div className="border-t border-slate-100 dark:border-slate-850 pt-2 pb-1">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Categories
              </span>
              <div className="grid grid-cols-1 gap-1.5 mt-2">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-1 text-slate-600 dark:text-slate-300 hover:text-blue-600"
                  >
                    {cat.name} ({cat.count})
                  </Link>
                ))}
              </div>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-850 pt-2 flex flex-col space-y-2">
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-slate-700 dark:text-slate-300"
              >
                About DigitalTools
              </Link>
              <Link
                href="/faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-slate-700 dark:text-slate-300"
              >
                Frequently Asked Questions
              </Link>
              <Link
                href="/privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-slate-700 dark:text-slate-300"
              >
                Privacy Policy
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-slate-700 dark:text-slate-300"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
