export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const now = new Date();

  const routes = [
    '',
    '/about',
    '/faq',
    '/contactus',
    '/signup',
    '/login',
    '/privacy-policy',
    '/terms-condition',
    '/how-it-works',
  ];

  return routes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));
}

