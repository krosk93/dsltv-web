import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
    return {
        locale: locale || 'ca',
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
