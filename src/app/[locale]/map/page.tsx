'use client';
import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import SpeedBadge from '@/components/SpeedBadge';
import { getAllLTVs } from '@/lib/data';
import type { FlatLTV } from '@/lib/types';
import styles from './map.module.css';

// Dynamically import Leaflet map (no SSR)
const LtvMap = dynamic(() => import('@/components/LtvMap'), { ssr: false });

export default function MapPage() {
    const t = useTranslations('map');
    const tSpeed = useTranslations('speed');
    const [all, setAll] = useState<FlatLTV[]>([]);
    const [loading, setLoading] = useState(true);
    const [maxSpeed, setMaxSpeed] = useState(300);
    const [activeOnly, setActiveOnly] = useState(true);

    useEffect(() => {
        getAllLTVs().then((data) => { setAll(data); setLoading(false); });
    }, []);

    const filtered = useMemo(() => {
        let res = all.filter(l => l.speedNum <= maxSpeed);
        if (activeOnly) res = res.filter(l => l.active);
        return res;
    }, [all, maxSpeed, activeOnly]);

    const speedBuckets = [
        { label: tSpeed('critical'), max: 30, color: '#ef4444' },
        { label: tSpeed('low'), max: 60, color: '#f97316' },
        { label: tSpeed('medium'), max: 80, color: '#eab308' },
        { label: tSpeed('high'), max: 120, color: '#22c55e' },
        { label: tSpeed('reduced'), max: 300, color: '#3b82f6' },
    ];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main className="page-container" style={{ padding: '24px 24px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Page header */}
                <div className="animate-fade-up">
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
                        <span className="gradient-text">{t('title')}</span>
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{t('subtitle')}</p>
                </div>

                {/* Speed filter row */}
                <div className={`glass-card ${styles.filterBar} animate-fade-up-delay-1`}>
                    <span style={{ color: '#6b7280', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {t('filter_speed')}
                    </span>
                    <div className={styles.buckets}>
                        {speedBuckets.map(b => (
                            <button
                                key={b.max}
                                className={styles.bucketBtn}
                                style={{
                                    background: maxSpeed === b.max ? `${b.color}22` : undefined,
                                    borderColor: maxSpeed === b.max ? `${b.color}66` : undefined,
                                    color: maxSpeed === b.max ? b.color : '#6b7280',
                                }}
                                onClick={() => setMaxSpeed(maxSpeed === b.max ? 300 : b.max)}
                            >
                                <span className={styles.dot} style={{ background: b.color }} />
                                {b.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 16, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 16 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.82rem', color: '#e2e8f0' }}>
                            <input
                                type="checkbox"
                                checked={activeOnly}
                                onChange={e => setActiveOnly(e.target.checked)}
                                style={{ accentColor: '#6366f1' }}
                            />
                            {t('filter_active')}
                        </label>
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input
                            type="range" min={10} max={300} step={10} value={maxSpeed}
                            onChange={e => setMaxSpeed(Number(e.target.value))}
                            style={{ width: 140, accentColor: '#6366f1' }}
                        />
                        <SpeedBadge speed={maxSpeed === 300 ? 999 : maxSpeed} />
                        <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                            {filtered.length} / {all.length} LTV
                        </span>
                    </div>
                </div>

                {/* Map */}
                <div className={`${styles.mapWrap} animate-fade-up-delay-2`}>
                    {loading ? (
                        <div className={styles.loadingBox}>
                            <div className={styles.spinner} />
                        </div>
                    ) : (
                        <LtvMap ltvs={all} maxSpeed={maxSpeed} activeOnly={activeOnly} />
                    )}
                </div>
            </main>
            {/* Import Leaflet CSS */}
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            />
        </div>
    );
}
