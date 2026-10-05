import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | DigitalTools Support',
  description:
    'Answers to common questions about DigitalTools: privacy standards, client-side execution, pricing, offline support, and file format capabilities.',
  alternates: {
    canonical: 'https://digitaltools.dev/faq',
  },
};

const GLOBAL_FAQS = [
  {
    question: 'Are DigitalTools web utilities completely free to use?',
    answer:
      'Yes. All 26 tools are completely free for personal, commercial, and educational use. There are no subscriptions, paywalls, or usage limits.',
  },
  {
    question: 'Are my private files and images uploaded to your servers?',
    answer:
      'No. The vast majority of our tools—including the Image Format Converter, Photo EXIF Remover, Resume Builder, and Cryptographic Hash Generator—process everything client-side inside your browser runtime memory. Your files never touch a remote server.',
  },
  {
    question: 'Which tools send data to an external server?',
    answer:
      'Only the Universal Translator sends data externally, transmitting input text through our server-side route handler to an open LibreTranslate-compatible endpoint to execute multi-lingual machine translation. This is explicitly stated on that tool page.',
  },
  {
    question: 'Do generated PDF files contain watermarks or promotional logos?',
    answer:
      'No. All exported PDF files from our Document to PDF Maker, Resume Builder, and Invoice Generator are completely clean and unbranded.',
  },
  {
    question: 'Can I use DigitalTools while offline?',
    answer:
      'Yes! Because client-side tools execute entirely with JavaScript in your local browser, once you load the webpage, tools like Unit Converter, Password Generator, and Text Manipulation Suite will function without an active internet connection.',
  },
  {
    question: 'Do generated QR codes ever expire or stop working?',
    answer:
      'No. Unlike dynamic QR services that route through paid redirect proxies, our QR Code Generator creates direct, static QR codes that encode your URL or text directly into the pixel matrix. They work indefinitely.',
  },
  {
    question: 'Are loan calculations and financial figures legally binding?',
    answer:
      'No. All financial calculations—such as Loan EMI and Discount figures—are mathematical estimations intended solely for financial planning. Official terms must be verified with your lending institution.',
  },
];

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GLOBAL_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Knowledge Base &amp; Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          Clear, straightforward answers about how our platform handles privacy, client-side compute,
          and file formats.
        </p>
      </header>

      {/* FAQ Accordion / Cards */}
      <div className="space-y-4">
        {GLOBAL_FAQS.map((faq, idx) => (
          <Card key={idx} className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {faq.question}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {faq.answer}
            </p>
          </Card>
        ))}
      </div>

      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span>Have a question not addressed in this FAQ?</span>
        <Link
          href="/contact"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors"
        >
          Contact Our Team
        </Link>
      </div>
    </div>
  );
}
