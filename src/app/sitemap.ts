import type { MetadataRoute } from 'next';
import { MODULE_META } from '@/core/registry';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-playground.vercel.app';
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];

  // Tier pages
  const tierIds = [...new Set(MODULE_META.map((m) => m.tierId))];
  const tierPages: MetadataRoute.Sitemap = tierIds.map((tierId) => ({
    url: `${siteUrl}/tier/${tierId}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Module pages (hub, guided, playground, challenge)
  const modulePages: MetadataRoute.Sitemap = MODULE_META.flatMap((mod) => {
    const base = `${siteUrl}/tier/${mod.tierId}/${mod.id}`;
    return [
      { url: base, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 },
      { url: `${base}/guided`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 },
      { url: `${base}/playground`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.6 },
      { url: `${base}/challenge`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.6 },
    ];
  });

  return [...staticPages, ...tierPages, ...modulePages];
}
