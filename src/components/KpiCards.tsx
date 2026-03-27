'use client';
import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import type { Stats } from '@/lib/data';
import { formatDuration } from '@/lib/types';
import { AlertTriangle, Activity, TrendingUp, GitFork, Zap, Route, Clock } from 'lucide-react';
import ExportButton from './ExportButton';
import styles from './KpiCards.module.css';

interface Props { stats: Stats; }

export default function KpiCards({ stats }: Props) {
    const t = useTranslations('dashboard');
    const containerRef = useRef<HTMLDivElement>(null);

    const cards = [
        {
            label: t('kpi_total'),
            value: stats.total.toLocaleString(),
            sub: t('records'),
            icon: <Activity size={22} />,
            color: '#6366f1',
            delay: 0,
        },
        {
            label: t('kpi_lines'),
            value: stats.lines.toLocaleString(),
            sub: '',
            icon: <Route size={22} />,
            color: '#06b6d4',
            delay: 1,
        },
        {
            label: t('kpi_critical'),
            value: stats.criticalCount.toLocaleString(),
            sub: `${((stats.criticalCount / stats.total) * 100).toFixed(1)}%`,
            icon: <AlertTriangle size={22} />,
            color: '#ef4444',
            delay: 2,
        },
        {
            label: t('kpi_csv'),
            value: stats.csvCount.toLocaleString(),
            sub: `${((stats.csvCount / stats.total) * 100).toFixed(1)}%`,
            icon: <Zap size={22} />,
            color: '#22c55e',
            delay: 3,
        },
        {
            label: t('kpi_avg_speed'),
            value: stats.avgSpeed.toLocaleString(),
            sub: t('kmh'),
            icon: <TrendingUp size={22} />,
            color: '#3b82f6',
            delay: 4,
        },
        {
            label: t('kpi_avg_delay'),
            value: formatDuration(stats.avgDelay),
            sub: '',
            icon: <Clock size={22} />,
            color: '#f97316',
            delay: 5,
        },
        {
            label: t('kpi_total_km'),
            value: stats.totalKm.toFixed(1),
            sub: t('km'),
            icon: <GitFork size={22} />,
            color: '#8b5cf6',
            delay: 6,
        },
    ];

    return (
        <div style={{ position: 'relative' }}>
            <ExportButton
                elementRef={containerRef}
                filename="kpis"
                style={{ position: 'absolute', top: -45, right: 0 }}
            />
            <div ref={containerRef} className={styles.grid} style={{ background: 'var(--bg)', padding: '4px' }}>
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className={`${styles.card} glass-card animate-fade-up`}
                        style={{ animationDelay: `${card.delay * 0.08}s` }}
                    >
                        <div className={styles.iconWrap} style={{ background: `${card.color}20`, color: card.color }}>
                            {card.icon}
                        </div>
                        <div className={styles.body}>
                            <div className={styles.label}>{card.label}</div>
                            <div className={styles.value} style={{ color: card.color }}>
                                {card.value}
                                {card.sub && <span className={styles.sub}> {card.sub}</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
