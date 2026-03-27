import { LTVData, FlatLTV, getReductionCategory } from './types';

let cachedRaw: FlatLTV[] | null = null;
let cachedStats: Stats | null = null;

export interface ServerData {
    raw: FlatLTV[];
    stats: Stats;
}

export async function getLTVServerData(): Promise<ServerData> {
    if (cachedRaw && cachedStats) {
        return { raw: cachedRaw, stats: cachedStats };
    }

    const res = await fetch('/api/data');
    const data: ServerData = await res.json();

    cachedRaw = data.raw;
    cachedStats = data.stats;

    return data;
}

export async function getAllLTVs(): Promise<FlatLTV[]> {
    const { raw } = await getLTVServerData();
    return raw;
}

export interface Stats {
    total: number;
    activeCount: number;
    lines: number;
    avgSpeed: number;
    avgDelay: number;
    minSpeed: number;
    maxSpeed: number;
    criticalCount: number;
    csvCount: number;
    totalKm: number;
    speedDistribution: { speed: number; count: number }[];
    reductionDistribution: { reduction: number; count: number }[];
    reasonDistribution: { reason: string; count: number }[];
    timelineData: {
        date: number;
        dateStr: string;
        count_conv: number;
        resolved_conv: number;
        active_conv: number;
        count_av: number;
        resolved_av: number;
        active_av: number;
    }[];
    trackDistribution: { track: string; count: number }[];
    lineData: { line: string; count: number; avgSpeed: number }[];
    stateDistribution: { state: string; count: number }[];
    provinceDistribution: { province: string; count: number }[];
}

export function computeStats(ltvs: FlatLTV[]): Stats {
    const total = ltvs.length;
    const activeCount = ltvs.filter(l => l.active).length;
    const lines = new Set(ltvs.map(l => l.line)).size;
    const speeds = ltvs.map(l => l.speedNum).filter(s => s > 0);
    const avgSpeed = speeds.length ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0;
    const minSpeed = speeds.length ? Math.min(...speeds) : 0;
    const maxSpeed = speeds.length ? Math.max(...speeds) : 0;
    const criticalCount = ltvs.filter(l => getReductionCategory(l.reductionPercentage) === 'critical').length;
    const csvCount = ltvs.filter(l => l.csv).length;
    const totalKm = ltvs.reduce((a, l) => a + l.kmLength, 0);
    const avgDelay = ltvs.length ? ltvs.reduce((a, l) => a + (l.delaySeconds || 0), 0) / ltvs.length : 0;

    // Speed buckets
    const speedBuckets: Record<number, number> = {};
    for (const ltv of ltvs) {
        const bucket = Math.floor(ltv.speedNum / 10) * 10;
        speedBuckets[bucket] = (speedBuckets[bucket] || 0) + 1;
    }
    const speedDistribution = Object.entries(speedBuckets)
        .map(([speed, count]) => ({ speed: parseInt(speed), count }))
        .sort((a, b) => a.speed - b.speed);

    // Reduction buckets
    const reductionBuckets: Record<number, number> = {};
    for (const ltv of ltvs) {
        const bucket = Math.floor(ltv.reductionPercentage / 10) * 10;
        reductionBuckets[bucket] = (reductionBuckets[bucket] || 0) + 1;
    }
    const reductionDistribution = Object.entries(reductionBuckets)
        .map(([reduction, count]) => ({ reduction: parseInt(reduction), count }))
        .sort((a, b) => a.reduction - b.reduction);

    // Reason distribution
    const reasonMap: Record<string, number> = {};
    for (const ltv of ltvs) {
        const r = ltv.reason.trim().toUpperCase() || 'UNKNOWN';
        reasonMap[r] = (reasonMap[r] || 0) + 1;
    }
    const reasonDistribution = Object.entries(reasonMap)
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12);

    // Timeline
    const allDates = Array.from(new Set(ltvs.map(l => l.firstAppearanceDate).filter(Boolean))).sort();
    // Skip the first date since LTVs may be older than that date
    const dates = allDates.slice(1);
    const timelineData = dates.map((date, idx) => {
        // Compute for Conventional
        const newCountConv = ltvs.filter(l => l.railType === 'conventional' && l.firstAppearanceDate === date).length;
        const activeAtDateConv = ltvs.filter(l => l.railType === 'conventional' && l.firstAppearanceDate <= date && l.lastSeen >= date).length;
        let resolvedCountConv = 0;

        // Compute for High-Speed
        const newCountAv = ltvs.filter(l => l.railType === 'high-speed' && l.firstAppearanceDate === date).length;
        const activeAtDateAv = ltvs.filter(l => l.railType === 'high-speed' && l.firstAppearanceDate <= date && l.lastSeen >= date).length;
        let resolvedCountAv = 0;

        // Search in the original allDates to correctly calculate resolution since last snapshot
        const dateIdxInAll = allDates.indexOf(date);
        if (dateIdxInAll > 0) {
            const prevDate = allDates[dateIdxInAll - 1];
            resolvedCountConv = ltvs.filter(l => l.railType === 'conventional' && l.firstAppearanceDate <= prevDate && l.lastSeen === prevDate).length;
            resolvedCountAv = ltvs.filter(l => l.railType === 'high-speed' && l.firstAppearanceDate <= prevDate && l.lastSeen === prevDate).length;
        }

        // Return timestamp for proportional graphing
        return {
            date: new Date(date).getTime(),
            dateStr: date,
            count_conv: newCountConv,
            resolved_conv: resolvedCountConv,
            active_conv: activeAtDateConv,
            count_av: newCountAv,
            resolved_av: resolvedCountAv,
            active_av: activeAtDateAv
        };
    });

    // Track distribution
    const trackMap: Record<string, number> = {};
    for (const ltv of ltvs) {
        const t = ltv.track || '?';
        trackMap[t] = (trackMap[t] || 0) + 1;
    }
    const trackDistribution = Object.entries(trackMap)
        .map(([track, count]) => ({ track, count }))
        .sort((a, b) => b.count - a.count);

    // Line summary
    const lineMap: Record<string, { count: number; totalSpeed: number }> = {};
    for (const ltv of ltvs) {
        if (!lineMap[ltv.line]) lineMap[ltv.line] = { count: 0, totalSpeed: 0 };
        lineMap[ltv.line].count++;
        lineMap[ltv.line].totalSpeed += ltv.speedNum;
    }
    const lineData = Object.entries(lineMap)
        .map(([line, { count, totalSpeed }]) => ({
            line,
            count,
            avgSpeed: count ? Math.round(totalSpeed / count) : 0,
        }))
        .sort((a, b) => b.count - a.count);

    // State distribution
    const stateMap: Record<string, number> = {};
    for (const ltv of ltvs) {
        if (ltv.state) {
            stateMap[ltv.state] = (stateMap[ltv.state] || 0) + 1;
        }
    }
    const stateDistribution = Object.entries(stateMap)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count);

    // Province distribution
    const provinceMap: Record<string, number> = {};
    for (const ltv of ltvs) {
        if (ltv.province) {
            provinceMap[ltv.province] = (provinceMap[ltv.province] || 0) + 1;
        }
    }
    const provinceDistribution = Object.entries(provinceMap)
        .map(([province, count]) => ({ province, count }))
        .sort((a, b) => b.count - a.count);

    return {
        total, activeCount, lines, avgSpeed, avgDelay, minSpeed, maxSpeed,
        criticalCount, csvCount, totalKm,
        speedDistribution, reductionDistribution, reasonDistribution,
        timelineData, trackDistribution, lineData,
        stateDistribution, provinceDistribution,
    };
}
