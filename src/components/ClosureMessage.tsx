'use client';
import { useTranslations } from 'next-intl';

export default function ClosureMessage() {
    const t = useTranslations('closure');
    const content = t('content');

    return (
        <div className="animate-fade-up" style={{
            maxWidth: '800px',
            margin: '60px auto',
            padding: '40px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(10px)'
        }}>
            <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                marginBottom: '32px',
                textAlign: 'center'
            }}>
                <span className="gradient-text">{t('title')}</span>
            </h1>

            <div style={{
                fontSize: '1.15rem',
                lineHeight: '1.8',
                color: 'var(--text-main)',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                textAlign: 'justify'
            }}>
                {content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                ))}
            </div>

            <div style={{
                marginTop: '48px',
                paddingTop: '32px',
                borderTop: '1px solid var(--border-color)',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.9rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
            }}>
                Dignitat a les Vies
            </div>
        </div>
    );
}
