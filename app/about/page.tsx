import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ShieldCheck, Cpu, Code2, HeartHandshake, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About DigitalTools: Modern, Private Web Utilities',
  description:
    'Learn why DigitalTools was built: fast, transparent, and client-first digital utilities without ads, paywalls, or privacy-invasive tracking.',
  alternates: {
    canonical: 'https://digitaltoools.vercel.app/about',
  },
};

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About DigitalTools',
    description: 'Learn about DigitalTools mission, client-first architecture, and transparency.',
    url: 'https://digitaltoools.vercel.app/about',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Our Architecture &amp; Mission
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Building the Honest Web Utility Suite
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          The modern web is inundated with utility sites that demand user logins, hide simple PDF downloads
          behind recurring subscriptions, and quietly upload private photos and contracts to remote servers.
          DigitalTools was conceived as a principled alternative.
        </p>
      </header>

      {/* Core Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-3">
          <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 w-fit">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Client-Side by Default
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Whenever technically feasible, our utilities process inputs directly in your browser using the
            HTML5 Canvas, Web Crypto, and File APIs. Your confidential files, resumes, and hashes never touch
            an external backend.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 w-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Radical Transparency
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            We clearly label how every tool works. When a feature requires external routing, such as the Universal
            Translator calling an open translation API, we state it explicitly on the page rather than masking it.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 w-fit">
            <Code2 className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Open Web Standards
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            All code generators produce standard, unmediated outputs: static QR codes that never expire, clean
            vector PDFs without promotional watermarks, and cryptographic digests matching official NIST standards.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 w-fit">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Zero Deceptive Patterns
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            No countdown timers forcing account signups, no deceptive download buttons that trick users into clicking
            affiliate ads, and no recurring monthly paywalls for simple format conversions.
          </p>
        </Card>
      </div>

      {/* Narrative Section */}
      <section className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Why Serverless Client Utilities Matter
        </h2>
        <p>
          Every day, millions of individuals upload sensitive documents, such as passport scans, employment contracts,
          and proprietary API payloads, to obscure online conversion websites. Most users are unaware that many of these
          sites retain uploaded files indefinitely, index their contents, or monetize user data.
        </p>
        <p>
          DigitalTools reclaims user privacy by leveraging modern browser capabilities. Modern desktop and mobile
          browsers possess immense compute power: they can compile vector PDFs, re-encode multi-megabyte images, and
          execute cryptographic hashing in milliseconds without sending a single byte across a network socket.
        </p>
        <p>
          We are committed to maintaining DigitalTools as a free, open, and dependable resource for the global
          software and creator community.
        </p>
      </section>

      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
        <Link href="/" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          ← Back to All Tools
        </Link>
        <Link href="/privacy" className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
          Read Our Privacy Policy →
        </Link>
      </div>
    </div>
  );
}
