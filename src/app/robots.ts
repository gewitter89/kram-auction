import type { MetadataRoute } from 'next'
import { absoluteUrl, siteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/cabinet', '/messages', '/notifications', '/api', '/lots/*/edit'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteUrl,
  }
}
