import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Analytics } from "@vercel/analytics/next"

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

export const metadata: Metadata = {
  metadataBase: new URL('https://digitaltoools.vercel.app'),
  title: {
    default: 'DigitalToools: 26 Free, Fast & Private Online Utilities',
    template: '%s',
  },
  description:
    'Free online tools for developers, creators, and freelancers. Resume builder, PDF generator, EXIF scrubber, EMI calculator, and code formatters.',
  keywords: [
    'cv maker online',
    'free online tools',
    'resume builder online',
    'loan emi calculator',
    'photo exif remover',
    'qr code generator',
    'markdown previewer',
    'unit converter',
    'base64 image converter',
    'create qr code free',
    'qr code generator qr code generator qr code generator',
    'qr code generator free',
    'invoice generator',
    'cod qr generator',
    'qr code generator generator',
    'make qr online',
    'qr creator free',
    'password password generator',
    'qr code qr code generator',
    'lorem lipsum',
    'qr barcode generator',
    'generate qr codes for free',
    'qr maker free',
    'qr maker online',
    'qr creator online',
    'password generator',
    'qr barcode generator free',
    'generate the barcode',
    'qr code create free',
    'password generator password generator',
    'free qr code builder',
    'qr code generator',
    'generate barcode',
    'lorem generator',
    'cv generator',
    'resume creator online',
    'resume building',
    'cv online generator',
    'rasume online genarator',
  ],
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
    title: 'DigitalToools: 26 Free, Fast & Private Online Utilities',
    description:
      'Free, privacy-focused online tools for developers, creators, and professionals. 100% client-side processing wherever possible.',
    images: [
      {
        url: 'https://digitaltoools.vercel.app/og-default.png',
        width: 1200,
        height: 630,
        alt: 'DigitalToools - 26 Free, Fast & Private Online Utilities',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DigitalToools: 26 Free, Fast & Private Online Utilities',
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
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white transition-colors duration-150">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
