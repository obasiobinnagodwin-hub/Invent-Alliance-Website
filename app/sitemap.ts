import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.inventallianceco.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/about-us',
    '/our-team',
    '/products-services',
    '/blog',
    '/careers',
    '/invent-academy-registration',
    '/contacts',
    '/an-appreciation-from-lead-fort-gate-college',
    '/national-open-university-students-tour-at-the-invent',
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/blog' ? 'weekly' : 'monthly',
    priority: route === '' ? 1.0 : route === '/about-us' || route === '/products-services' ? 0.9 : 0.7,
  }));
}

