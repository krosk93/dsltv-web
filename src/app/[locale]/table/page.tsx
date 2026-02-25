'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import SpeedBadge from '@/components/SpeedBadge';
import { getAllLTVs } from '@/lib/data';
import type { FlatLTV } from '@/lib/types';
import { RotateCcw, ChevronUp, ChevronDown, Search } from 'lucide-react';
import styles from './table.module.css';

type SortKey = keyof FlatLTV;
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 50;

export default function TablePage() {
    const t = useTranslations();
    const [all, setAll] = useState<FlatLTV[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedLine, setSelectedLine] = useState('');
    const [maxSpeed, setMaxSpeed] = useState(300);
    const [reasonSearch, setReasonSearch] = useState('');
    const [selectedTrack, setSelectedTrack] = useState('');
    const [csvOnly, setCsvOnly] = useState(false);
    const [activeOnly, setActiveOnly] = useState(true);
    const [page, setPage] = useState(0);
    const [sortKey, setSortKey] = useState<SortKey>('firstAppearanceDate');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    useEffect(() => {
        getAllLTVs().then((data) => { setAll(data); setLoading(false); });
    }, []);

    const lines = useMemo(() => Array.from(new Set(all.map(l => l.line))).sort(), [all]);
    const tracks = useMemo(() => Array.from(new Set(all.map(l => l.track))).sort(), [all]);

    const filtered = useMemo(() => {
        let res = all;
        if (selectedLine) res = res.filter(l => l.line === selectedLine);
        if (maxSpeed < 300) res = res.filter(l => l.speedNum <= maxSpeed);
        if (reasonSearch) res = res.filter(l => l.reason.toLowerCase().includes(reasonSearch.toLowerCase()));
        if (selectedTrack) res = res.filter(l => l.track === selectedTrack);
        if (csvOnly) res = res.filter(l => l.csv);
        if (activeOnly) res = res.filter(l => l.active);

        res = [...res].sort((a, b) => {
            const av = a[sortKey] ?? '';
            const bv = b[sortKey] ?? '';
            const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
            return sortDir === 'asc' ? cmp : -cmp;
        });
        return res;
    }, [all, selectedLine, maxSpeed, reasonSearch, selectedTrack, csvOnly, activeOnly, sortKey, sortDir]);

    const paginated = useMemo(() => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [filtered, page]);
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

    const handleSort = useCallback((key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
        setPage(0);
    }, [sortKey]);

    const reset = () => {
        setSelectedLine(''); setMaxSpeed(300); setReasonSearch('');
        setSelectedTrack(''); setCsvOnly(false); setActiveOnly(true); setPage(0);
    };

    const SortIcon = ({ k }: { k: SortKey }) =>
        sortKey === k
            ? (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)
            : null;

    const thStyle = (k: SortKey): React.CSSProperties => ({
        cursor: 'pointer', userSelect: 'none',
        background: sortKey === k ? 'rgba(99,102,241,0.1)' : undefined,
    });

    return (
        <div style={{ minHeight: '100vh' }}>
            <Header />
            <main className="page-container" style={{ padding: '32px 24px' }}>

                {/* Page header */}
                <div style={{ marginBottom: 28 }} className="animate-fade-up">
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
                        <span className="gradient-text">{t('table.title')}</span>
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{t('table.subtitle')}</p>
                </div>

                {/* Filters bar */}
                <div className={`${styles.filters} glass-card animate-fade-up-delay-1`}>
                    <div className={styles.filterRow}>
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>{t('table.filter_line')}</label>
                            <select className="control" value={selectedLine} onChange={e => { setSelectedLine(e.target.value); setPage(0); }}
                                style={{ minWidth: 200 }}>
                                <option value="">{t('table.all_lines')}</option>
                                {lines.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>{t('table.filter_track')}</label>
                            <select className="control" value={selectedTrack} onChange={e => { setSelectedTrack(e.target.value); setPage(0); }}>
                                <option value="">{t('table.all_tracks')}</option>
                                {tracks.map(tr => <option key={tr} value={tr}>{tr}</option>)}
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>{t('table.filter_speed')}: <strong style={{ color: '#818cf8' }}>{maxSpeed === 300 ? '∞' : maxSpeed} km/h</strong></label>
                            <input type="range" min={10} max={300} step={10} value={maxSpeed}
                                onChange={e => { setMaxSpeed(Number(e.target.value)); setPage(0); }}
                                className={styles.slider} />
                        </div>

                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>{t('table.filter_reason')}</label>
                            <div style={{ position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                                <input type="text" className="control" value={reasonSearch}
                                    onChange={e => { setReasonSearch(e.target.value); setPage(0); }}
                                    placeholder="…" style={{ paddingLeft: 30, width: 200 }} />
                            </div>
                        </div>

                        <div className={styles.filterGroup} style={{ gap: 16 }}>
                            <label className={`${styles.checkLabel}`}>
                                <input type="checkbox" checked={csvOnly} onChange={e => { setCsvOnly(e.target.checked); setPage(0); }} />
                                {t('table.filter_csv')}
                            </label>
                            <label className={`${styles.checkLabel}`}>
                                <input type="checkbox" checked={activeOnly} onChange={e => { setActiveOnly(e.target.checked); setPage(0); }} />
                                {t('table.filter_active')}
                            </label>
                        </div>

                        <button className="btn btn-ghost" onClick={reset} style={{ alignSelf: 'flex-end' }}>
                            <RotateCcw size={14} />{t('table.reset')}
                        </button>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 8 }}>
                        {t('table.showing')} <strong style={{ color: '#e2e8f0' }}>{filtered.length.toLocaleString()}</strong>{' '}
                        {t('table.of')} <strong style={{ color: '#e2e8f0' }}>{all.length.toLocaleString()}</strong>
                    </div>
                </div>

                {/* Table */}
                <div className={`${styles.tableWrap} glass-card animate-fade-up-delay-2`}>
                    {loading ? (
                        <div className={styles.loadingBox}><div className={styles.spinner} /></div>
                    ) : filtered.length === 0 ? (
                        <div className={styles.noResults}>{t('table.no_results')}</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={thStyle('code')} onClick={() => handleSort('code')}>
                                            {t('table.col_code')} <SortIcon k="code" />
                                        </th>
                                        <th style={thStyle('line')} onClick={() => handleSort('line')}>
                                            {t('table.col_line')} <SortIcon k="line" />
                                        </th>
                                        <th style={thStyle('stations')} onClick={() => handleSort('stations')}>
                                            {t('table.col_stations')} <SortIcon k="stations" />
                                        </th>
                                        <th style={thStyle('track')} onClick={() => handleSort('track')}>
                                            {t('table.col_track')} <SortIcon k="track" />
                                        </th>
                                        <th style={thStyle('startKm')} onClick={() => handleSort('startKm')}>
                                            {t('table.col_km')} <SortIcon k="startKm" />
                                        </th>
                                        <th style={thStyle('kmLength')} onClick={() => handleSort('kmLength')}>
                                            {t('table.col_length')} <SortIcon k="kmLength" />
                                        </th>
                                        <th style={thStyle('speedNum')} onClick={() => handleSort('speedNum')}>
                                            {t('table.col_speed')} <SortIcon k="speedNum" />
                                        </th>
                                        <th style={thStyle('reason')} onClick={() => handleSort('reason')}>
                                            {t('table.col_reason')} <SortIcon k="reason" />
                                        </th>
                                        <th style={thStyle('csv')} onClick={() => handleSort('csv')}>
                                            {t('table.col_csv')} <SortIcon k="csv" />
                                        </th>
                                        <th style={thStyle('active')} onClick={() => handleSort('active')}>
                                            {t('table.col_active')} <SortIcon k="active" />
                                        </th>
                                        <th style={thStyle('firstAppearanceDate')} onClick={() => handleSort('firstAppearanceDate')}>
                                            {t('table.col_date')} <SortIcon k="firstAppearanceDate" />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.map((ltv) => (
                                        <tr key={`${ltv.code}-${ltv.line}`}>
                                            <td className="mono" style={{ fontSize: '0.78rem', color: '#818cf8' }}>{ltv.code}</td>
                                            <td style={{ fontSize: '0.78rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                title={ltv.line}>{ltv.line.replace(/LÍNEA\s+/, 'L').split(' ')[0]}</td>
                                            <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                title={ltv.stations}>{ltv.stations}</td>
                                            <td>
                                                <span style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', padding: '2px 8px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600 }}>
                                                    {ltv.track}
                                                </span>
                                            </td>
                                            <td className="mono" style={{ fontSize: '0.8rem' }}>{ltv.startKm}</td>
                                            <td className="mono" style={{ fontSize: '0.8rem' }}>{ltv.kmLength.toFixed(3)} km</td>
                                            <td><SpeedBadge speed={ltv.speedNum} /></td>
                                            <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                title={ltv.reason}>{ltv.reason}</td>
                                            <td>
                                                {ltv.csv
                                                    ? <span className="csv-yes">✓ CSV</span>
                                                    : <span className="csv-no">—</span>}
                                            </td>
                                            <td>
                                                {ltv.active
                                                    ? <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                                                        {t('table.active')}
                                                    </span>
                                                    : <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>{t('table.inactive')}</span>}
                                            </td>
                                            <td className="mono" style={{ fontSize: '0.78rem' }}>{ltv.firstAppearanceDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button className="btn btn-ghost" disabled={page === 0} onClick={() => setPage(0)}>«</button>
                        <button className="btn btn-ghost" disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹</button>
                        <span style={{ color: '#9ca3af', fontSize: '0.875rem', padding: '0 12px' }}>
                            {page + 1} / {totalPages}
                        </span>
                        <button className="btn btn-ghost" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>›</button>
                        <button className="btn btn-ghost" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>»</button>
                    </div>
                )}
            </main>
        </div>
    );
}
