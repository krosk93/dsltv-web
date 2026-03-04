import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

const baseUrl = 'https://limitacions.vatard.com';

export default function sitemap(): MetadataRoute.Sitemap {
    const routes = ['', '/map', '/table'];
    const locales = routing.locales;

    const entries: MetadataRoute.Sitemap = [];

    locales.forEach((locale) => {
        routes.forEach((route) => {
            entries.push({
                url: `${baseUrl}/${locale}${route}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: route === '' ? 1 : 0.8,
            });
        });
    });

    return entries;
}
