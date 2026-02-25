'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import KpiCards from '@/components/KpiCards';
import { ChartSpeedDist, ChartReasons, ChartTimeline, ChartTracks, ChartLines } from '@/components/Charts';
import { getAllLTVs, computeStats, getLTVServerData } from '@/lib/data';
import type { Stats } from '@/lib/data';
import type { FlatLTV } from '@/lib/types';
import styles from './page.module.css';

export default function DashboardPage() {
    const t = useTranslations('dashboard');
    const [allLtvs, setAllLtvs] = useState<FlatLTV[]>([]);
    const [fullStats, setFullStats] = useState<Stats | null>(null);
    const [filteredStats, setFilteredStats] = useState<Stats | null>(null);
    const [activeOnly, setActiveOnly] = useState(true);
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

        let filteredLtvs = allLtvs;
        if (activeOnly) {
            filteredLtvs = allLtvs.filter(l => l.active);
        }
        setFilteredStats(computeStats(filteredLtvs));
    }, [allLtvs, activeOnly]);

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

                {loading || !filteredStats || !fullStats ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                    </div>
                ) : (
                    <>
                        <KpiCards stats={filteredStats} />

                        <div className={styles.chartsGrid}>
                            <div className={styles.spanFull}>
                                <ChartTimeline data={fullStats.timelineData} />
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
