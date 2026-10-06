export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://anjali-creation.vercel.app';

  // Static routes
  const routes = ['', '/sarees', '/about', '/contact'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: route === '' || route === '/sarees' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/sarees' ? 0.9 : 0.8,
  }));

  // Fetch product routes dynamically from API if available
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/sarees?limit=100`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const sarees = data.sarees || data.data || [];
      const productRoutes = sarees.map((saree) => ({
        url: `${baseUrl}/product/${saree._id || saree.id}`,
        lastModified: saree.updatedAt
          ? new Date(saree.updatedAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
      return [...routes, ...productRoutes];
    }
  } catch (error) {
    console.warn('Sitemap generator: Could not fetch dynamic product URLs, fallback to static routes.', error.message);
  }

  return routes;
}
