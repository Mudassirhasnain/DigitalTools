import { MetadataRoute } from 'next';
import { TOOLS } from '@/lib/tools';
import { CATEGORIES } from '@/lib/categories';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://digitaltoools.vercel.app';
  const currentDate = new Date();

  // Core static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
    },
  ];

  // Category pages
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: currentDate,
  }));

  // Tool dynamic pages (all tools from lib/tools.ts)
  const toolRoutes: MetadataRoute.Sitemap = TOOLS.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: currentDate,
  }));

  return [...staticRoutes, ...categoryRoutes, ...toolRoutes];
}
