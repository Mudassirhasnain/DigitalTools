'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Tool } from '@/lib/tools';
import { Category } from '@/lib/categories';
import { searchTools } from '@/lib/fuzzy-search';
import {
  Search,
  X,
  ArrowRight,
  Filter,
  Sparkles,
  FileText,
  FileCode,
  Globe,
  Scissors,
  AlignLeft,
  FileCheck,
  Image as ImageIcon,
  Minimize,
  ShieldAlert,
  Binary,
  Calculator,
  Receipt,
  Percent,
  Calendar,
  Zap,
  Mic,
  PenTool,
  Scale,
  Clock,
  Palette,
  Braces,
  QrCode,
  Barcode,
  Key,
  Hash,
} from 'lucide-react';

const TOOL_ICONS: Record<string, React.ReactNode> = {
  'resume-builder': <FileText className="w-5 h-5 text-blue-500" />,
  'cover-letter-generator': <FileCheck className="w-5 h-5 text-indigo-500" />,
  'universal-translator': <Globe className="w-5 h-5 text-cyan-500" />,
  'text-manipulation-suite': <Scissors className="w-5 h-5 text-teal-500" />,
  'lorem-ipsum-generator': <AlignLeft className="w-5 h-5 text-emerald-500" />,
  'markdown-previewer': <FileCode className="w-5 h-5 text-sky-500" />,
  'document-to-pdf-maker': <FileText className="w-5 h-5 text-rose-500" />,
  'image-format-converter': <ImageIcon className="w-5 h-5 text-pink-500" />,
  'image-resizer-compressor': <Minimize className="w-5 h-5 text-purple-500" />,
  'photo-exif-remover': <ShieldAlert className="w-5 h-5 text-amber-500" />,
  'base64-image-converter': <Binary className="w-5 h-5 text-orange-500" />,
  'loan-emi-calculator': <Calculator className="w-5 h-5 text-emerald-500" />,
  'invoice-generator': <Receipt className="w-5 h-5 text-blue-500" />,
  'percentage-discount-calculator': <Percent className="w-5 h-5 text-violet-500" />,
  'exact-age-calculator': <Calendar className="w-5 h-5 text-amber-500" />,
  'typing-speed-test': <Zap className="w-5 h-5 text-yellow-500" />,
  'voice-audio-recorder': <Mic className="w-5 h-5 text-red-500" />,
  'digital-signature-generator': <PenTool className="w-5 h-5 text-teal-500" />,
  'unit-converter': <Scale className="w-5 h-5 text-blue-500" />,
  'unix-timestamp-converter': <Clock className="w-5 h-5 text-indigo-500" />,
  'color-converter-contrast-checker': <Palette className="w-5 h-5 text-fuchsia-500" />,
  'json-formatter-validator': <Braces className="w-5 h-5 text-cyan-500" />,
  'qr-code-generator': <QrCode className="w-5 h-5 text-emerald-500" />,
  'barcode-generator': <Barcode className="w-5 h-5 text-sky-500" />,
  'secure-password-generator': <Key className="w-5 h-5 text-amber-500" />,
  'cryptographic-hash-generator': <Hash className="w-5 h-5 text-rose-500" />,
};

const POPULAR_QUERIES = [
  'PDF',
  'EMI Calculator',
  'QR Code',
  'EXIF GPS',
  'Password',
  'Base64',
  'Translator',
  'JSON Formatter',
  'Signature',
  'WPM Test',
];

interface ToolSearchGridProps {
  tools: Tool[];
  categories?: Category[];
  initialCategory?: string;
  lockCategory?: boolean;
  searchPlaceholder?: string;
}

export const ToolSearchGrid: React.FC<ToolSearchGridProps> = ({
  tools,
  categories,
  initialCategory = 'all',
  lockCategory = false,
  searchPlaceholder = 'Search all 26 tools by name, keyword, or acronym (e.g., pdf, emi, exif, qr)...',
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (/ or Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' && document.activeElement !== inputRef.current && !['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) ||
        ((e.metaKey || e.ctrlKey) && e.key === 'k')
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setQuery('');
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered tools based on fuzzy search and category
  const filteredTools = useMemo(() => {
    return searchTools(tools, query, selectedCategory);
  }, [tools, query, selectedCategory]);

  return (
    <div id="search" className="space-y-8 scroll-mt-24" role="search" aria-label="Tool Finder and Filter">
      {/* Search Input Box */}
      <div className="space-y-4">
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search digital tools"
            className="w-full pl-11 pr-24 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm sm:text-base transition-all"
          />

          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                aria-label="Clear search input"
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              /
            </kbd>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-500" /> Popular:
          </span>
          {POPULAR_QUERIES.map((keyword) => (
            <button
              key={keyword}
              type="button"
              onClick={() => {
                setQuery(keyword);
                inputRef.current?.focus();
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {keyword}
            </button>
          ))}
        </div>

        {/* Category Pills (Homepage only when not locked) */}
        {!lockCategory && categories && categories.length > 0 && (
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-500'
              }`}
            >
              All Tools ({tools.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-500'
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        )}

        {/* Search Result Status Line */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <span>
            {query ? (
              <>
                Found <strong className="text-slate-900 dark:text-white">{filteredTools.length}</strong>{' '}
                {filteredTools.length === 1 ? 'tool' : 'tools'} matching &quot;{query}&quot;
              </>
            ) : selectedCategory !== 'all' ? (
              <>
                Showing <strong className="text-slate-900 dark:text-white">{filteredTools.length}</strong>{' '}
                tools in category
              </>
            ) : (
              <>
                Showing all <strong className="text-slate-900 dark:text-white">{filteredTools.length}</strong>{' '}
                production utilities
              </>
            )}
          </span>

          {(query || (selectedCategory !== 'all' && !lockCategory)) && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                if (!lockCategory) setSelectedCategory('all');
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Results */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => {
            const icon = TOOL_ICONS[tool.slug] || <FileText className="w-5 h-5 text-blue-500" />;

            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-blue-500 flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                      {icon}
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {tool.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-1 mb-2">
                    {tool.name}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {tool.intro}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <span>Launch Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No matching tools found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We couldn&apos;t find any utility matching &quot;<strong className="text-slate-800 dark:text-slate-200">{query}</strong>&quot;.
              Try checking for typos or searching a broader term like &quot;pdf&quot;, &quot;image&quot;, or &quot;converter&quot;.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setQuery('');
                if (!lockCategory) setSelectedCategory('all');
                inputRef.current?.focus();
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
            >
              Clear Search Query
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
