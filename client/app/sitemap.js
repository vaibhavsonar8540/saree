export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://anjali-creation.vercel.app';

  // 1. Core static pages
  const staticPages = [
    { route: '', priority: 1.0, changeFrequency: 'daily' },
    { route: '/sarees', priority: 0.9, changeFrequency: 'daily' },
    { route: '/about', priority: 0.8, changeFrequency: 'weekly' },
    { route: '/contact', priority: 0.8, changeFrequency: 'monthly' },
    { route: '/wishlist', priority: 0.5, changeFrequency: 'monthly' },
  ];

  const staticRoutes = staticPages.map(({ route, priority, changeFrequency }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  // 2. Fetch product routes dynamically from API
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://saree-i37o.onrender.com/api';
    const res = await fetch(`${apiUrl}/sarees?limit=200`, {
      next: { revalidate: 3600 },
      headers: {
        'Accept': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      const sarees = data.sarees || data.data || (Array.isArray(data) ? data : []);

      const productRoutes = sarees.map((saree) => ({
        url: `${baseUrl}/product/${saree._id || saree.id}`,
        lastModified: saree.updatedAt ? new Date(saree.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));

      return [...staticRoutes, ...productRoutes];
    }
  } catch (error) {
    console.warn('Sitemap generator: Could not fetch dynamic product URLs, returning static routes.', error.message);
  }

  return staticRoutes;
}
