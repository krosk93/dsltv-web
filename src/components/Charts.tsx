'use client';
import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid, AreaChart, Area,
} from 'recharts';
import { getReductionColor } from '@/lib/types';
import type { Stats } from '@/lib/data';
import ExportButton from './ExportButton';

const CARD_STYLE: React.CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '20px 24px',
};

const TOOLTIP_STYLE = {
    backgroundColor: 'var(--bg-card-hover)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text)',
    fontSize: '0.85rem',
};

function ChartTitle({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 16, fontSize: '0.875rem', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {children}
        </div>
    );
}

function ChartWrapper({
    children,
    title,
    filename,
    className
}: {
    children: React.ReactNode;
    title: string;
    filename: string;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    return (
        <div style={{ ...CARD_STYLE, position: 'relative' }} className={className} ref={ref}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <ChartTitle>{title}</ChartTitle>
                <ExportButton elementRef={ref} filename={filename} style={{ marginTop: -4, marginRight: -8 }} />
            </div>
            {children}
        </div>
    );
}

export function ChartSpeedDist({ data }: { data: Stats['speedDistribution'] }) {
    const t = useTranslations('dashboard');
    return (
        <ChartWrapper title={t('chart_speed')} filename="speed_distribution" className="animate-fade-up-delay-1">
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data} margin={{ left: -10, right: 0 }}>
                    <XAxis
                        dataKey="speed"
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        axisLine={false} tickLine={false}
                        tickFormatter={(v) => `${v}`}
                    />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(val) => [val, t('count')]}
                        labelFormatter={(l) => `${l}–${Number(l) + 9} km/h`}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {data.map((entry) => (
                            <Cell key={entry.speed} fill="#6366f1" fillOpacity={0.85} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
}

export function ChartReductionDist({ data }: { data: Stats['reductionDistribution'] }) {
    const t = useTranslations('dashboard');
    return (
        <ChartWrapper title={t('chart_reduction')} filename="reduction_distribution" className="animate-fade-up-delay-1">
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data} margin={{ left: -10, right: 0 }}>
                    <XAxis
                        dataKey="reduction"
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        axisLine={false} tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                    />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(val) => [val, t('count')]}
                        labelFormatter={(l) => `${l}% – ${Number(l) + 9}% red.`}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {data.map((entry) => (
                            <Cell key={entry.reduction} fill={getReductionColor(entry.reduction)} fillOpacity={0.85} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
}

export function ChartReasons({ data }: { data: Stats['reasonDistribution'] }) {
    const t = useTranslations('dashboard');
    const truncate = (s: string) => s.length > 38 ? s.slice(0, 36) + '…' : s;
    return (
        <ChartWrapper title={t('chart_reasons')} filename="reasons_distribution" className="animate-fade-up-delay-2">
            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16 }}>
                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="reason" tick={{ fill: '#9ca3af', fontSize: 10.5 }} axisLine={false} tickLine={false} width={200} tickFormatter={truncate} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} fillOpacity={0.85} />
                </BarChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
}

export function ChartTimeline({ data }: { data: Stats['timelineData'] }) {
    const t = useTranslations('dashboard');
    return (
        <ChartWrapper title={t('chart_timeline')} filename="timeline" className="animate-fade-up-delay-3">
            <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data} margin={{ left: -10, right: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => new Date(v).toISOString().slice(0, 7)}
                    />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        labelFormatter={(v) => new Date(v).toISOString().slice(0, 10)}
                    />
                    <Area type="monotone" dataKey="active_conv" connectNulls stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf611" dot={false} name={`${t('chart_legend_active')} (Conv)`} />
                    <Area type="monotone" dataKey="active_av" connectNulls stroke="#d946ef" strokeWidth={2} fill="#d946ef11" dot={false} name={`${t('chart_legend_active')} (AV)`} />
                    <Area type="monotone" dataKey="resolved_conv" connectNulls stroke="#22c55e" strokeWidth={2} fill="none" dot={false} name={`${t('chart_legend_resolved')} (Conv)`} />
                    <Area type="monotone" dataKey="resolved_av" connectNulls stroke="#84cc16" strokeWidth={2} fill="none" dot={false} name={`${t('chart_legend_resolved')} (AV)`} />
                    <Area type="monotone" dataKey="count_conv" connectNulls stroke="#06b6d4" strokeWidth={1.5} fill="none" dot={false} name={`${t('chart_legend_new')} (Conv)`} />
                    <Area type="monotone" dataKey="count_av" connectNulls stroke="#0ea5e9" strokeWidth={1.5} fill="none" dot={false} name={`${t('chart_legend_new')} (AV)`} />
                </AreaChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
}

export function ChartTracks({ data }: { data: Stats['trackDistribution'] }) {
    const t = useTranslations('dashboard');
    const COLORS = ['#6366f1', '#06b6d4', '#22c55e', '#f97316', '#eab308', '#8b5cf6', '#ec4899'];
    return (
        <ChartWrapper title={t('chart_tracks')} filename="tracks_distribution" className="animate-fade-up-delay-1">
            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Pie data={data} dataKey="count" nameKey="track" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3}>
                        {data.map((entry, i) => (
                            <Cell key={entry.track} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
                        ))}
                    </Pie>
                    <Legend formatter={(val) => <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{val}</span>} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
}

export function ChartLines({ data }: { data: Stats['lineData'] }) {
    const t = useTranslations('dashboard');
    const top = data.slice(0, 15);
    const truncate = (s: string) => {
        const match = s.match(/LÍNEA\s+(\d+)/i);
        return match ? `L${match[1]}` : s.slice(0, 8);
    };
    return (
        <ChartWrapper title={t('chart_lines')} filename="lines_distribution" className="animate-fade-up-delay-2">
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={top} margin={{ left: -10, right: 0 }}>
                    <XAxis dataKey="line" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={truncate} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(l) => l} />
                    <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} fillOpacity={0.85} name={t('count')} />
                </BarChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
}

export function ChartStates({
    stateData,
    provinceData,
    selectedState,
}: {
    stateData: Stats['stateDistribution'];
    provinceData: Stats['provinceDistribution'];
    selectedState: string | null;
}) {
    const t = useTranslations('dashboard');
    const tStates = useTranslations('states');

    const translateState = (key: string) => {
        try { return tStates(key as Parameters<typeof tStates>[0]); } catch { return key; }
    };

    const title = selectedState ? t('chart_provinces') : t('chart_states');
    const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#22c55e', '#f97316', '#eab308', '#ec4899', '#14b8a6', '#f43f5e', '#a855f7', '#3b82f6', '#84cc16', '#fb923c', '#e879f9', '#2dd4bf'];

    if (selectedState) {
        const barHeight = Math.max(220, provinceData.length * 30);
        return (
            <ChartWrapper title={title} filename={`provinces_${selectedState}`} className="animate-fade-up-delay-1">
                <ResponsiveContainer width="100%" height={barHeight}>
                    <BarChart data={provinceData} layout="vertical" margin={{ left: 4, right: 24 }}>
                        <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="province" tick={{ fill: '#9ca3af', fontSize: 10.5 }} axisLine={false} tickLine={false} width={140} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(val) => [val, t('count')]} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} fillOpacity={0.85}>
                            {provinceData.map((entry, i) => (
                                <Cell key={entry.province} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartWrapper>
        );
    }

    const displayData = stateData.map((d) => ({ ...d, displayName: translateState(d.state) }));
    const barHeight = Math.max(240, displayData.length * 30);
    return (
        <ChartWrapper title={title} filename="states_distribution" className="animate-fade-up-delay-1">
            <ResponsiveContainer width="100%" height={barHeight}>
                <BarChart data={displayData} layout="vertical" margin={{ left: 4, right: 24 }}>
                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="displayName" tick={{ fill: '#9ca3af', fontSize: 10.5 }} axisLine={false} tickLine={false} width={160} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(val) => [val, t('count')]} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} fillOpacity={0.85}>
                        {displayData.map((entry, i) => (
                            <Cell key={entry.state} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
}
