export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://anjalicreation.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/cart',
          '/checkout',
          '/payment',
          '/order',
          '/wishlist',
          '/favourites',
          '/api/',
          '/_next/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
