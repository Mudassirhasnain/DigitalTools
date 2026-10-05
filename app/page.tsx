import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { TOOLS } from '@/lib/tools';
import { CATEGORIES } from '@/lib/categories';
import { ToolSearchGrid } from '@/components/ui/ToolSearchGrid';
import {
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
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'DigitalTools: 26 Free, Fast & Private Online Utilities',
  description:
    'Explore 26 fast, private, and free online tools for developers, creators, and freelancers. Resume builder, PDF generator, EXIF scrubber, and EMI calculator.',
  alternates: {
    canonical: 'https://digitaltoools.vercel.app',
  },
};

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

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://digitaltoools.vercel.app/#website',
        url: 'https://digitaltoools.vercel.app',
        name: 'DigitalTools',
        description:
          'Free online tools for developers, creators, and freelancers with client-first privacy.',
        publisher: {
          '@id': 'https://digitaltoools.vercel.app/#organization',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://digitaltoools.vercel.app/#organization',
        name: 'DigitalTools',
        url: 'https://digitaltoools.vercel.app',
        logo: {
          '@type': 'ImageObject',
          url: 'https://digitaltoools.vercel.app/logo.png',
        },
      },
    ],
  };

  return (
    <div className="space-y-16 py-10 sm:py-16">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section with ONE H1 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 text-xs font-semibold text-blue-700 dark:text-blue-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privacy-First Architecture · 100% Free · No Registration</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
          Fast, Free &amp; Private <span className="text-blue-600 dark:text-blue-400">Digital Tools</span> for Modern Work
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Access 26 purpose-built web utilities designed for developers, creators, and professionals.
          Every tool processes your sensitive files and calculations client-side in your browser
          with zero paywalls and zero tracking.
        </p>
      </section>

      {/* Interactive Real-Time Fuzzy Search & Filter Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ToolSearchGrid
          tools={TOOLS}
          categories={CATEGORIES}
          searchPlaceholder="Search all 26 tools by name, keyword, or acronym (e.g., pdf, emi, exif, qr)..."
        />
      </section>

      {/* All Tools Grouped by Category for Deep SEO Indexing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Explore Utilities by Category
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Browse our complete collection of 26 browser-based web tools organized into 6 core operational domains.
          </p>
        </div>

        {CATEGORIES.map((category) => {
          const categoryTools = TOOLS.filter((t) => t.categorySlug === category.slug);

          return (
            <section key={category.slug} id={category.slug} className="scroll-mt-24 space-y-6">
              {/* Category Header */}
              <div className="flex items-baseline justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-2">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {category.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {category.description}
                  </p>
                </div>
                <Link
                  href={`/category/${category.slug}`}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm py-1"
                >
                  <span>Explore category</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Tool Grid: Real Next/Link anchors */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categoryTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="group rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-500 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-blue-500 flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition-transform">
                          {TOOL_ICONS[tool.slug] || <FileText className="w-5 h-5 text-blue-500" />}
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {tool.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                        {tool.intro}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        Launch Tool
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-blue-600 dark:text-blue-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
