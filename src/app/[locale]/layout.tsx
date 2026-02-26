import type { Metadata } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from '@/components/ThemeProvider';
import '../globals.css';

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const titles: Record<string, string> = {
        ca: 'LTV – Limitacions Temporals de Velocitat',
        es: 'LTV – Limitaciones Temporales de Velocidad',
        en: 'LTV – Temporary Speed Limitations',
    };
    return {
        title: titles[locale] ?? titles['ca'],
        description: 'Anàlisi de les Limitacions Temporals de Velocitat de la Xarxa Ferroviària d\'Interès General',
    };
}

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) notFound();
    const messages = await getMessages();

    return (
        <html lang={locale}>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body style={{ visibility: 'hidden' }}>
                <script dangerouslySetInnerHTML={{
                    __html: `
                    (function() {
                        try {
                            var theme = localStorage.getItem('theme') || 'system';
                            var support = ['dark', 'light', 'system'];
                            if (!support.includes(theme)) theme = 'system';
                            var resolved = theme;
                            if (theme === 'system') {
                                resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                            }
                            document.documentElement.setAttribute('data-theme', resolved);
                            document.body.style.visibility = 'visible';
                        } catch (e) {}
                    })();
                ` }} />
                <NextIntlClientProvider messages={messages}>
                    <ThemeProvider>
                        {children}
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
