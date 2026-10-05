import React from 'react';
import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import { Mail, MessageSquare, ShieldCheck, Github } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact DigitalTools: Engineering Feedback & Support',
  description:
    'Get in touch with the DigitalTools development team. Submit bug reports, suggest new client-side utilities, or request technical support.',
  alternates: {
    canonical: 'https://digitaltools.dev/contact',
  },
};

export default function ContactPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact DigitalTools',
    description: 'Get in touch with the DigitalTools engineering team.',
    url: 'https://digitaltools.dev/contact',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Contact Engineering &amp; Support
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          We welcome bug reports, algorithmic feature suggestions, and inquiries regarding privacy
          implementation standards across DigitalTools.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="space-y-3">
          <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 w-fit">
            <Mail className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Direct Email</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            For security audits, press inquiries, or general feedback.
          </p>
          <a
            href="mailto:contact@digitaltools.dev"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline block pt-1"
          >
            contact@digitaltools.dev
          </a>
        </Card>

        <Card className="space-y-3">
          <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 w-fit">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Tool Requests</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Need a specific offline calculator or file manipulator built?
          </p>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block pt-1">
            Submit ideas via email
          </span>
        </Card>

        <Card className="space-y-3">
          <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 w-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Security Vulnerabilities</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Responsible vulnerability disclosures receive priority response within 24 hours.
          </p>
          <a
            href="mailto:security@digitaltools.dev"
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline block pt-1"
          >
            security@digitaltools.dev
          </a>
        </Card>
      </div>

      {/* Interactive Contact Form (Client Component simulation inside form) */}
      <Card className="p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Send a Direct Message
        </h2>
        <form
          action="mailto:contact@digitaltools.dev"
          method="GET"
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="name-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Your Name
              </label>
              <input
                id="name-input"
                name="name"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Full Name"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="subject-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Topic / Subject
              </label>
              <input
                id="subject-input"
                name="subject"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. Bug Report or Tool Feedback"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="body-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Message Details
            </label>
            <textarea
              id="body-input"
              name="body"
              rows={5}
              required
              className="w-full p-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-y"
              placeholder="Describe your inquiry, browser version, or feature suggestion..."
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            Send Inquiry
          </button>
        </form>
      </Card>
    </div>
  );
}
