'use client';
import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import KpiCards from '@/components/KpiCards';
import { ChartSpeedDist, ChartReasons, ChartTimeline, ChartTracks, ChartLines, ChartStates } from '@/components/Charts';
import { computeStats, getLTVServerData } from '@/lib/data';
import type { Stats } from '@/lib/data';
import type { FlatLTV } from '@/lib/types';
import styles from './page.module.css';

export default function DashboardPage() {
    const t = useTranslations('dashboard');
    const tStates = useTranslations('states');
    const [allLtvs, setAllLtvs] = useState<FlatLTV[]>([]);
    const [fullStats, setFullStats] = useState<Stats | null>(null);
    const [filteredStats, setFilteredStats] = useState<Stats | null>(null);
    const [stateFilteredStats, setStateFilteredStats] = useState<Stats | null>(null);
    const [activeOnly, setActiveOnly] = useState(true);
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLTVServerData().then((data) => {
            setAllLtvs(data.raw);
            setFullStats(data.stats);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (allLtvs.length === 0) return;

        const full = computeStats(allLtvs);
        setFullStats(full);

        // State-only filter (no active toggle) → for the timeline chart
        const stateLtvs = selectedState ? allLtvs.filter(l => l.state === selectedState) : allLtvs;
        setStateFilteredStats(computeStats(stateLtvs));

        // Full filter (state + active) → for KPIs and all other charts
        let filteredLtvs = stateLtvs;
        if (activeOnly) {
            filteredLtvs = filteredLtvs.filter(l => l.active);
        }
        setFilteredStats(computeStats(filteredLtvs));
    }, [allLtvs, activeOnly, selectedState]);

    // All distinct states from the full dataset
    const allStates = useMemo(() => {
        const stateSet = new Set(allLtvs.map(l => l.state).filter(Boolean) as string[]);
        return Array.from(stateSet).sort();
    }, [allLtvs]);

    const translateState = (key: string) => {
        try { return tStates(key as Parameters<typeof tStates>[0]); } catch { return key; }
    };

    return (
        <div style={{ minHeight: '100vh' }}>
            <Header />
            <main className="page-container" style={{ padding: '32px 24px' }}>
                <div className={`${styles.pageHeader} animate-fade-up`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 className={styles.heading}>
                            <span className="gradient-text">{t('title')}</span>
                        </h1>
                        <p className={styles.subheading}>{t('subtitle')}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {/* State filter */}
                        <div className="glass-card" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <label htmlFor="state-filter" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
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
                                    fontWeight: 600,
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
                        {/* Active-only filter */}
                        <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <input
                                type="checkbox"
                                id="active-filter"
                                checked={activeOnly}
                                onChange={e => setActiveOnly(e.target.checked)}
                                style={{ cursor: 'pointer', accentColor: '#6366f1', width: 16, height: 16 }}
                            />
                            <label htmlFor="active-filter" style={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                                {t('filter_active')}
                            </label>
                        </div>
                    </div>
                </div>

                {/* Active state pill */}
                {selectedState && (
                    <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)',
                            borderRadius: 20, padding: '4px 12px',
                            fontSize: '0.82rem', fontWeight: 600, color: '#818cf8',
                        }}>
                            {translateState(selectedState)}
                            <button
                                onClick={() => setSelectedState(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', fontSize: '1rem', lineHeight: 1, padding: 0 }}
                                aria-label="Clear state filter"
                            >
                                ×
                            </button>
                        </span>
                    </div>
                )}

                {loading || !filteredStats || !fullStats || !stateFilteredStats ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                    </div>
                ) : (
                    <>
                        <KpiCards stats={filteredStats} />

                        <div className={styles.chartsGrid}>
                            <div className={styles.spanFull}>
                                <ChartTimeline data={stateFilteredStats.timelineData} />
                            </div>
                            <div className={styles.spanFull}>
                                <ChartStates
                                    stateData={filteredStats.stateDistribution}
                                    provinceData={filteredStats.provinceDistribution}
                                    selectedState={selectedState}
                                />
                            </div>
                            <ChartSpeedDist data={filteredStats.speedDistribution} />
                            <div className={styles.spanFull}>
                                <ChartLines data={filteredStats.lineData} />
                            </div>
                            <div className={styles.spanFull}>
                                <ChartReasons data={filteredStats.reasonDistribution} />
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
