import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['ca', 'es', 'en'],

    // Used when no locale matches
    defaultLocale: 'ca'
});