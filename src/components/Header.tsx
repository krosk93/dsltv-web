'use client';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { Train, BarChart2, Table2, Map } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import styles from './Header.module.css';

export default function Header() {
    const t = useTranslations();
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();

    const locales = ['ca', 'es', 'en'] as const;

    const switchLocale = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
    };


    return (
        <header className={styles.header}>
            <div className={`${styles.inner} page-container`}>
                <div className={styles.brand}>
                    <div className={styles.logo}>
                        <Train size={22} strokeWidth={2} />
                    </div>
                    <div>
                        <div className={styles.title}>LTV</div>
                        <div className={styles.subtitle}>{t('header.subtitle')}</div>
                    </div>
                </div>

                <nav className={styles.nav}>
                    {/* Navigation hidden */}
                </nav>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <ThemeToggle />
                    <div className={styles.langSwitcher}>
                        {locales.map((loc) => (
                            <button
                                key={loc}
                                onClick={() => switchLocale(loc)}
                                className={`${styles.langBtn} ${locale === loc ? styles.langActive : ''}`}
                            >
                                {loc.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
}
