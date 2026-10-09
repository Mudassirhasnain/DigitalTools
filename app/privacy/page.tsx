import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ShieldCheck, Lock, Globe, Server, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy & Data Transparency | DigitalToools',
  description:
    'Complete transparency on how DigitalToools handles your data: client-side processing details, serverless file manipulation, and translation API disclosure.',
  alternates: {
    canonical: 'https://digitaltoools.vercel.app/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <header className="space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Trust &amp; Transparency
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Privacy Policy &amp; Architecture Standards
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          At DigitalToools (https://digitaltoools.vercel.app), we hold user privacy as an absolute architectural
          principle. This policy provides complete, honest technical details regarding how data is
          processed across our 38 utilities.
        </p>
      </header>

      {/* Two Categories of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <Lock className="w-4 h-4" />
            <span>25 Client-Side Only Tools (Zero Server Uploads)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            The following 25 tools process all files, inputs, and documents strictly inside your local browser
            runtime using the HTML5 Canvas, Web Crypto, Web Audio, and File APIs:
          </p>
          <ul className="text-xs space-y-1 text-slate-500 dark:text-slate-400 list-disc pl-4 leading-relaxed">
            <li>Resume Builder &amp; Cover Letter Generator</li>
            <li>Text Manipulation Suite, Lorem Ipsum, Markdown Previewer</li>
            <li>Document to PDF Maker, Image Converter, Resizer, EXIF Scrubber, Base64</li>
            <li>Loan EMI Calculator, Invoice Generator, Discount, Age, Typing, Audio Recorder, Signature</li>
            <li>Unit Converter, Unix Epoch Clock, Color Contrast Checker</li>
            <li>JSON Validator, QR Code, Barcode, Password &amp; Hash Generators</li>
          </ul>
          <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            For these 25 tools: No text, images, audio, or passwords are ever transmitted to our server or any third party.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
            <Server className="w-4 h-4" />
            <span>1 Server-Routed Tool (Universal Translator)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Due to the neural network computational requirements of multi-language translation, the
            <strong> Universal Translator</strong> tool routes submitted text through our Next.js API route
            (<code>/api/translate</code>) to an open LibreTranslate-compatible machine translation endpoint.
          </p>
          <ul className="text-xs space-y-1 text-slate-500 dark:text-slate-400 list-disc pl-4 leading-relaxed">
            <li>Your input text is transmitted securely over HTTPS.</li>
            <li>No database logs or text transcripts are recorded or stored.</li>
            <li>Input queries are discarded immediately after delivering the translation payload.</li>
          </ul>
          <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            This external routing is transparently disclosed on the tool page.
          </p>
        </Card>
      </div>

      {/* Detailed Technical Disclosures */}
      <section className="space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            1. Analytics and Cookie Usage
          </h2>
          <p>
            DigitalToools does not deploy tracking cookies, fingerprinting scripts, or behavioral advertising
            pixels. We store your UI theme preference (dark vs. light mode) in your browser’s local storage
            (<code>localStorage.getItem(&apos;dt_theme&apos;)</code>), which never leaves your device.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            2. Photo EXIF Stripping Details
          </h2>
          <p>
            When utilizing our Photo EXIF Remover, your image is drawn onto an isolated HTML5 Canvas element
            and re-encoded as clean pixel data. This irreversibly strips all EXIF header metadata (GPS coordinates,
            camera serial numbers, device model, and capture timestamps). The visible image pixels remain completely
            unaltered.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            3. Financial and Estimator Disclaimers
          </h2>
          <p>
            Our Loan EMI Calculator and Percentage &amp; Discount Calculator are mathematical estimation tools
            designed for personal educational and planning purposes. They do not constitute certified financial,
            banking, legal, or tax advice. Confirm final financing amortizations with qualified financial
            institutions.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            4. Cryptographic Guarantees
          </h2>
          <p>
            Our Secure Password Generator and Cryptographic Hash Generator use the standard W3C Web Cryptography
            API (<code>window.crypto.getRandomValues</code> and <code>crypto.subtle.digest</code>). Random numbers are
            seeded directly from operating system hardware entropy.
          </p>
        </div>
      </section>

      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
        <span className="text-slate-400">Effective Date: October 2026</span>
        <Link href="/contact" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          Contact Privacy Officer →
        </Link>
      </div>
    </div>
  );
}
