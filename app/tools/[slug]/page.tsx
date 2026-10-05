import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TOOLS, getToolBySlug } from '@/lib/tools';
import { ToolLayout } from '@/components/ui/ToolLayout';
import { ToolRenderer } from '@/components/tools/registry';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return TOOLS.map((t) => ({
    slug: t.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  const pageUrl = `https://digitaltoools.vercel.app/tools/${tool.slug}`;

  return {
    title: tool.seoTitle,
    description: tool.metaDescription,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      url: pageUrl,
      title: tool.seoTitle,
      description: tool.metaDescription,
      siteName: 'DigitalToools',
      images: [
        {
          url: 'https://digitaltoools.vercel.app/og-default.png',
          width: 1200,
          height: 630,
          alt: tool.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.seoTitle,
      description: tool.metaDescription,
      images: ['https://digitaltoools.vercel.app/og-default.png'],
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  // Structured Data (JSON-LD): WebApplication + FAQPage + BreadcrumbList
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `https://digitaltoools.vercel.app/tools/${tool.slug}#app`,
        name: tool.name,
        url: `https://digitaltoools.vercel.app/tools/${tool.slug}`,
        description: tool.metaDescription,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `https://digitaltoools.vercel.app/tools/${tool.slug}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://digitaltoools.vercel.app',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: tool.category,
            item: `https://digitaltoools.vercel.app/category/${tool.categorySlug}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: tool.name,
            item: `https://digitaltoools.vercel.app/tools/${tool.slug}`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `https://digitaltoools.vercel.app/tools/${tool.slug}#faq`,
        mainEntity: tool.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      {/* Server-Rendered JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ToolLayout tool={tool}>
        <ToolRenderer slug={tool.slug} />
      </ToolLayout>
    </>
  );
}
