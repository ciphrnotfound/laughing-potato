import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://bothive.cloud';

    const routes = [
        '',
        '/pricing',
        '/features',
        '/marketplace',
        '/founder',
        '/about',
        '/contact',
        '/blog',
        '/docs',
        '/careers',
        '/changelog',
        '/integrations',
        '/waitlist',
        '/guides',
        '/hivestore',
        '/templates',
        '/getting-started',
        '/developers',
        '/developer',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return routes;
}
