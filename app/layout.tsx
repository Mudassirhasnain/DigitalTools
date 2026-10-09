import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Analytics } from "@vercel/analytics/next"
import { TOOLS } from '@/lib/tools';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// Every tool contributes its own top keywords, so no tool is left out and nothing repeats.
const SITE_KEYWORDS: string[] = Array.from(
  new Set([
    'free online tools',
    'online utilities',
    'browser based tools',
    ...TOOLS.flatMap((tool) => tool.keywords.slice(0, 3)),
  ])
);

export const metadata: Metadata = {
  metadataBase: new URL('https://digitaltoools.vercel.app'),
  title: {
    default: 'DigitalToools: Free, Fast & Private Online Tools',
    template: '%s',
  },
  description:
    'Free online tools for developers, creators, and freelancers. Resume builder, PDF generator, EXIF scrubber, EMI calculator, and code formatters.',
  keywords: SITE_KEYWORDS,
  authors: [{ name: 'DigitalToools Engineering Team' }],
  creator: 'DigitalToools',
  publisher: 'DigitalToools',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://digitaltoools.vercel.app',
    siteName: 'DigitalToools',
    title: 'DigitalToools: 38 Free, Fast & Private Online Utilities',
    description:
      'Free, privacy-focused online tools for developers, creators, and professionals. 100% client-side processing wherever possible.',
    images: [
      {
        url: 'https://digitaltoools.vercel.app/og-default.png',
        width: 1200,
        height: 630,
        alt: 'DigitalToools - 38 Free, Fast & Private Online Utilities',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DigitalToools: 38 Free, Fast & Private Online Utilities',
    description:
      'Free, privacy-first online tools for developers and creators. No tracking, zero paywalls, instant browser compute.',
    images: ['https://digitaltoools.vercel.app/og-default.png'],
  },
  icons: {
    icon: '/icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#030712',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white transition-colors duration-150">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
