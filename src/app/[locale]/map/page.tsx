'use client';
import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import SpeedBadge from '@/components/SpeedBadge';
import { getAllLTVs } from '@/lib/data';
import type { FlatLTV, RailType } from '@/lib/types';
import styles from './map.module.css';

// Dynamically import Leaflet map (no SSR)
const LtvMap = dynamic(() => import('@/components/LtvMap'), { ssr: false });

export default function MapPage() {
    const t = useTranslations('map');
    const tSpeed = useTranslations('speed');
    const tStates = useTranslations('states');
    const tRailType = useTranslations('rail_type');
    const [all, setAll] = useState<FlatLTV[]>([]);
    const [loading, setLoading] = useState(true);
    const [minReduction, setMinReduction] = useState(0);
    const [activeOnly, setActiveOnly] = useState(true);
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [selectedRailType, setSelectedRailType] = useState<RailType>('both');

    useEffect(() => {
        getAllLTVs().then((data) => { setAll(data); setLoading(false); });
    }, []);

    // All distinct states from the full dataset
    const allStates = useMemo(() => {
        const stateSet = new Set(all.map(l => l.state).filter(Boolean) as string[]);
        return Array.from(stateSet).sort();
    }, [all]);

    const translateState = (key: string) => {
        try { return tStates(key as Parameters<typeof tStates>[0]); } catch { return key; }
    };

    const filtered = useMemo(() => {
        let res = all.filter(l => l.reductionPercentage >= minReduction);
        if (activeOnly) res = res.filter(l => l.active);
        if (selectedState) res = res.filter(l => l.state === selectedState);
        if (selectedRailType !== 'both') res = res.filter(l => l.railType === selectedRailType);
        return res;
    }, [all, minReduction, activeOnly, selectedState, selectedRailType]);

    const reductionBuckets = [
        { label: tSpeed('critical'), min: 70, color: '#ef4444' },
        { label: tSpeed('high'), min: 50, color: '#f97316' },
        { label: tSpeed('medium'), min: 30, color: '#eab308' },
        { label: tSpeed('low'), min: 10, color: '#22c55e' },
        { label: tSpeed('reduced'), min: 0, color: '#3b82f6' },
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

                {/* Filter row */}
                <div className={`glass-card ${styles.filterBar} animate-fade-up-delay-1`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 16, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                        <label htmlFor="railtype-filter" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
                            {tRailType('label')}:
                        </label>
                        <select
                            id="railtype-filter"
                            value={selectedRailType}
                            onChange={e => setSelectedRailType(e.target.value as RailType)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text)',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                outline: 'none',
                                accentColor: '#6366f1',
                            }}
                        >
                            <option value="both">{tRailType('all')}</option>
                            <option value="conventional">{tRailType('conventional')}</option>
                            <option value="high-speed">{tRailType('high_speed')}</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 16, paddingRight: 16, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                        <label htmlFor="state-filter" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
                            {t('filter_state_label')}:
                        </label>
                        <select
                            id="state-filter"
                            value={selectedState ?? ''}
                            onChange={e => setSelectedState(e.target.value || null)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text)',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                outline: 'none',
                                accentColor: '#6366f1',
                            }}
                        >
                            <option value="">{t('filter_state')}</option>
                            {allStates.map(s => (
                                <option key={s} value={s}>{translateState(s)}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 16 }}>
                        <span style={{ color: '#6b7280', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {t('filter_speed')}
                        </span>
                        <div className={styles.buckets}>
                            {reductionBuckets.map(b => (
                                <button
                                    key={b.min}
                                    className={styles.bucketBtn}
                                    style={{
                                        background: minReduction === b.min ? `${b.color}22` : undefined,
                                        borderColor: minReduction === b.min ? `${b.color}66` : undefined,
                                        color: minReduction === b.min ? b.color : '#6b7280',
                                    }}
                                    onClick={() => setMinReduction(minReduction === b.min ? 0 : b.min)}
                                >
                                    <span className={styles.dot} style={{ background: b.color }} />
                                    {b.label}
                                </button>
                            ))}
                        </div>
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
                        <span style={{ color: '#6b7280', fontSize: '0.82rem' }}>Min %:</span>
                        <input
                            type="range" min={0} max={100} step={5} value={minReduction}
                            onChange={e => setMinReduction(Number(e.target.value))}
                            style={{ width: 140, accentColor: '#6366f1' }}
                        />
                        <span style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 600, width: 40, textAlign: 'right' }}>
                            {minReduction}%
                        </span>
                        <span style={{ color: '#6b7280', fontSize: '0.8rem', marginLeft: 12 }}>
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
                        <LtvMap ltvs={filtered} minReduction={minReduction} activeOnly={activeOnly} />
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
