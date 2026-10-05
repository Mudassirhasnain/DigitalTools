import React from 'react';
import Link from 'next/link';
import { ToolDefinition, getToolBySlug } from '@/lib/tools';
import { ChevronRight, Shield, Info, CheckCircle2, ArrowRight } from 'lucide-react';

export interface ToolLayoutProps {
  tool: ToolDefinition;
  children: React.ReactNode;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({ tool, children }) => {
  const relatedTools = tool.relatedSlugs
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is ToolDefinition => !!t);

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-6 flex-wrap">
        <Link
          href="/"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
        >
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
        <Link
          href={`/category/${tool.categorySlug}`}
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
        >
          {tool.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
        <span className="text-slate-900 dark:text-slate-200 font-medium truncate max-w-xs" aria-current="page">
          {tool.name}
        </span>
      </nav>

      {/* Header with exactly ONE H1 */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
          <span>{tool.category}</span>
          <span aria-hidden="true">·</span>
          <span>Free Online Utility</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          {tool.h1}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          {tool.intro}
        </p>

        {/* Honest Processing Disclosure */}
        <aside
          aria-label="Privacy and computation notice"
          className="mt-5 flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 max-w-3xl"
        >
          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <span className="leading-normal">{tool.processingNote}</span>
        </aside>
      </header>

      {/* Main Interactive Tool UI Area */}
      <section aria-label={`${tool.name} interactive application`} className="mb-14">
        {children}
      </section>

      {/* How to Use Section (3 Steps) */}
      <section className="mb-14 pt-8 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
          How to Use the {tool.name}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tool.howToSteps.map((step, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold">
                  {idx + 1}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Step {idx + 1}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {step}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Editorial Guide (250-400 words of original, useful copy) */}
      <section className="mb-14 pt-8 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
          {tool.detailedGuide.heading}
        </h2>
        <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 space-y-4">
          {tool.detailedGuide.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions Section (FAQPage schema source) */}
      <section className="mb-14 pt-8 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {tool.faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/50"
            >
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                {faq.question}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Tools Section (Exactly 3 links) */}
      <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
          Related Digital Utilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {relatedTools.map((rel) => (
            <Link
              key={rel.slug}
              href={`/tools/${rel.slug}`}
              className="group rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-500 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-blue-500 flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {rel.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-1 mb-2">
                  {rel.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {rel.intro}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>Launch Tool</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
};
