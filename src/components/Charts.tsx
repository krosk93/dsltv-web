'use client';
import { useTranslations } from 'next-intl';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid, AreaChart, Area,
} from 'recharts';
import { getSpeedColor } from '@/lib/types';
import type { Stats } from '@/lib/data';

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

export function ChartSpeedDist({ data }: { data: Stats['speedDistribution'] }) {
    const t = useTranslations('dashboard');
    return (
        <div style={CARD_STYLE} className="animate-fade-up-delay-1">
            <ChartTitle>{t('chart_speed')}</ChartTitle>
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
                            <Cell key={entry.speed} fill={getSpeedColor(entry.speed)} fillOpacity={0.85} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function ChartReasons({ data }: { data: Stats['reasonDistribution'] }) {
    const t = useTranslations('dashboard');
    const truncate = (s: string) => s.length > 38 ? s.slice(0, 36) + '…' : s;
    return (
        <div style={CARD_STYLE} className="animate-fade-up-delay-2">
            <ChartTitle>{t('chart_reasons')}</ChartTitle>
            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16 }}>
                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="reason" tick={{ fill: '#9ca3af', fontSize: 10.5 }} axisLine={false} tickLine={false} width={200} tickFormatter={truncate} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} fillOpacity={0.85} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function ChartTimeline({ data }: { data: Stats['timelineData'] }) {
    const t = useTranslations('dashboard');
    return (
        <div style={CARD_STYLE} className="animate-fade-up-delay-3">
            <ChartTitle>{t('chart_timeline')}</ChartTitle>
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
                    <Area type="monotone" dataKey="active" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf611" dot={false} name={t('chart_legend_active')} />
                    <Area type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} fill="none" dot={false} name={t('chart_legend_resolved')} />
                    <Area type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={1.5} fill="none" dot={false} name={t('chart_legend_new')} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export function ChartTracks({ data }: { data: Stats['trackDistribution'] }) {
    const t = useTranslations('dashboard');
    const COLORS = ['#6366f1', '#06b6d4', '#22c55e', '#f97316', '#eab308', '#8b5cf6', '#ec4899'];
    return (
        <div style={CARD_STYLE} className="animate-fade-up-delay-1">
            <ChartTitle>{t('chart_tracks')}</ChartTitle>
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
        </div>
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
        <div style={CARD_STYLE} className="animate-fade-up-delay-2">
            <ChartTitle>{t('chart_lines')}</ChartTitle>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={top} margin={{ left: -10, right: 0 }}>
                    <XAxis dataKey="line" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={truncate} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(l) => l} />
                    <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} fillOpacity={0.85} name={t('count')} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
