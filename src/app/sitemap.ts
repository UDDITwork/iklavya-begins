import type { MetadataRoute } from 'next'

const SITE_URL = 'https://iklavya.in'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/students', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/for-employers', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/ai-interview', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/ai-courses', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/skill-assessment', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/certifications', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/live-quiz', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/support', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/login', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/register', priority: 0.4, changeFrequency: 'yearly' as const },
  ]

  return staticPages.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))
}
