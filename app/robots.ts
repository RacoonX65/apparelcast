import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/checkout/',
          '/account/',
          '/_next/',
          '/private/',
        ],
      },
    ],
    sitemap: 'https://apparelcast.shop/sitemap.xml',
    host: 'https://apparelcast.shop',
  }
}