import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CATEGORIES, getCategoryBySlug } from '@/lib/categories';
import { TOOLS } from '@/lib/tools';
import { ToolSearchGrid } from '@/components/ui/ToolSearchGrid';
import { ChevronRight } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};

  const pageUrl = `https://digitaltools.dev/category/${category.slug}`;
  const title = `${category.name} Tools: Free Online Utilities | DigitalTools`;
  const description = `Explore free, privacy-first ${category.name.toLowerCase()} tools. ${category.description}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      url: pageUrl,
      title,
      description,
      siteName: 'DigitalTools',
      images: [
        {
          url: 'https://digitaltools.dev/og-default.png',
          width: 1200,
          height: 630,
          alt: category.name,
        },
      ],
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} Tools`,
    description: category.description,
    url: `https://digitaltools.dev/category/${category.slug}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://digitaltools.dev',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: category.name,
          item: `https://digitaltools.dev/category/${category.slug}`,
        },
      ],
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
        <span className="text-slate-900 dark:text-slate-200 font-medium" aria-current="page">
          {category.name}
        </span>
      </nav>

      {/* Header with exactly ONE H1 */}
      <header className="space-y-3 max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Curated Category Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {category.name} Online Tools
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {category.description} Each utility runs within your local browser runtime to safeguard
          your sensitive data with zero paywalls and zero tracking cookies.
        </p>
      </header>

      {/* Real-time Fuzzy Search Grid within this Category */}
      <ToolSearchGrid
        tools={TOOLS}
        initialCategory={category.slug}
        lockCategory={true}
        searchPlaceholder={`Search within ${category.name} tools (e.g., name, keywords, actions)...`}
      />
    </div>
  );
}
