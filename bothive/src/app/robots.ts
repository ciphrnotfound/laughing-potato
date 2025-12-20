import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/dashboard/', '/checkout/'],
        },
        sitemap: 'https://bothive.cloud/sitemap.xml',
    };
}
