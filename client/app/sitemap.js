export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://anjali-creation.vercel.app';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://saree-i37o.onrender.com/api';

  // 1. Core static pages
  const staticPages = [
    { route: '', priority: 1.0, changeFrequency: 'daily' },
    { route: '/sarees', priority: 0.9, changeFrequency: 'daily' },
    { route: '/category', priority: 0.9, changeFrequency: 'weekly' },
    { route: '/sitemap', priority: 0.85, changeFrequency: 'weekly' },
    { route: '/about', priority: 0.8, changeFrequency: 'weekly' },
    { route: '/contact', priority: 0.8, changeFrequency: 'monthly' },
    { route: '/cart', priority: 0.6, changeFrequency: 'monthly' },
    { route: '/favourites', priority: 0.6, changeFrequency: 'monthly' },
  ];

  const staticRoutes = staticPages.map(({ route, priority, changeFrequency }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  // Helper to construct category slug
  const getCategorySlug = (cat) => {
    if (!cat) return "";
    if (cat.slug) return cat.slug;
    if (cat.name) return cat.name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    return cat._id || "";
  };

  let categoryRoutes = [];
  let productRoutes = [];

  // 2. Fetch categories & subcategories dynamically from API
  try {
    const catRes = await fetch(`${apiUrl}/categories?includeSubcategories=true&isActive=true`, {
      next: { revalidate: 3600 },
      headers: { 'Accept': 'application/json' },
    });

    if (catRes.ok) {
      const catData = await catRes.json();
      const categoryList = catData.data || catData || [];

      if (Array.isArray(categoryList)) {
        categoryList.forEach((cat) => {
          const catSlug = getCategorySlug(cat);
          if (catSlug) {
            // Category main URL
            categoryRoutes.push({
              url: `${baseUrl}/saree/${catSlug}`,
              lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
              changeFrequency: 'daily',
              priority: 0.85,
            });

            // Subcategory URLs
            if (Array.isArray(cat.subCategories)) {
              cat.subCategories.forEach((sub) => {
                categoryRoutes.push({
                  url: `${baseUrl}/saree/${catSlug}?subCategory=${sub._id}`,
                  lastModified: sub.updatedAt ? new Date(sub.updatedAt) : new Date(),
                  changeFrequency: 'weekly',
                  priority: 0.75,
                });
              });
            }
          }
        });
      }
    }
  } catch (error) {
    console.warn('Sitemap generator: Failed to fetch dynamic categories:', error.message);
  }

  // 3. Fetch product routes dynamically from API
  try {
    const prodRes = await fetch(`${apiUrl}/sarees?limit=500`, {
      next: { revalidate: 3600 },
      headers: { 'Accept': 'application/json' },
    });

    if (prodRes.ok) {
      const prodData = await prodRes.json();
      const sarees = prodData.sarees || prodData.data || (Array.isArray(prodData) ? prodData : []);

      if (Array.isArray(sarees)) {
        productRoutes = sarees.map((saree) => ({
          url: `${baseUrl}/product/${saree._id || saree.id}`,
          lastModified: saree.updatedAt ? new Date(saree.updatedAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.70,
        }));
      }
    }
  } catch (error) {
    console.warn('Sitemap generator: Failed to fetch dynamic products:', error.message);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
