'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { FlatLTV } from '@/lib/types';
import { getSpeedColor } from '@/lib/types';
import styles from './LtvMap.module.css';

interface Props {
    ltvs: FlatLTV[];
    maxSpeed: number;
    activeOnly?: boolean;
}

// Build a geographically plausible lat/lng for a LTV entry.
// Strategy: parse the line number and use PK to interpolate along railway corridors.
// Spanish conventional rail lines are mostly longitude [-9, 4], latitude [36, 44].
function estimateLatLng(ltv: FlatLTV): [number, number] | null {
    const lineMatch = ltv.line.match(/\d+/);
    if (!lineMatch) return null;

    const lineNum = parseInt(lineMatch[0]);
    const startKm = parseFloat(ltv.startKm) || 0;

    // Map line number ranges to rough geographic corridors of Spanish railway
    // These are deliberately approximate for data-analyst positioning purposes
    const corridors: Array<{ minLine: number; lat: number; lng: number; dlat: number; dlng: number }> = [
        { minLine: 0, lat: 43.4, lng: -1.7, dlat: 0.00, dlng: 0.010 }, // L100 Irun direction
        { minLine: 26, lat: 40.5, lng: -6.0, dlat: -0.010, dlng: 0.009 }, // L026 Plasencia
        { minLine: 50, lat: 43.2, lng: -8.5, dlat: 0.002, dlng: 0.009 }, // Galicia
        { minLine: 100, lat: 43.4, lng: -1.7, dlat: 0.000, dlng: 0.010 }, // Irun–Madrid
        { minLine: 110, lat: 41.0, lng: -3.8, dlat: -0.012, dlng: 0.011 }, // Madrid–Barcelona
        { minLine: 120, lat: 40.0, lng: -4.0, dlat: -0.010, dlng: 0.010 }, // Madrid–Cáceres
        { minLine: 130, lat: 38.5, lng: -5.0, dlat: -0.010, dlng: 0.009 }, // Madrid–Sevilla conv.
        { minLine: 150, lat: 39.5, lng: -5.5, dlat: -0.010, dlng: 0.010 }, // Madrid–Badajoz
        { minLine: 160, lat: 37.3, lng: -5.9, dlat: 0.002, dlng: 0.010 }, // Sevilla surrounds
        { minLine: 200, lat: 37.5, lng: -4.5, dlat: -0.009, dlng: 0.009 }, // Córdoba–Málaga
        { minLine: 300, lat: 40.0, lng: -5.0, dlat: -0.010, dlng: 0.010 }, // Mérida area
        { minLine: 310, lat: 37.5, lng: -5.5, dlat: -0.008, dlng: 0.009 }, // Sevilla
        { minLine: 400, lat: 41.5, lng: 1.8, dlat: 0.008, dlng: 0.010 }, // Catalonia
        { minLine: 420, lat: 41.4, lng: 2.1, dlat: 0.007, dlng: 0.009 }, // Barcelona area
        { minLine: 500, lat: 39.0, lng: -1.0, dlat: -0.009, dlng: 0.010 }, // Valencia–Albacete
        { minLine: 600, lat: 37.2, lng: -3.0, dlat: -0.008, dlng: 0.009 }, // Almería–Granada
        { minLine: 700, lat: 40.0, lng: -6.5, dlat: -0.010, dlng: 0.010 }, // Lusitana
        { minLine: 800, lat: 42.8, lng: -4.5, dlat: 0.005, dlng: 0.009 }, // Palencia–Santander
        { minLine: 900, lat: 43.2, lng: -5.5, dlat: 0.003, dlng: 0.009 }, // Asturias
    ];

    let best = corridors[0];
    for (const c of corridors) {
        if (lineNum >= c.minLine) best = c;
        else break;
    }

    const jitter = ((lineNum * 7 + parseInt(ltv.code.slice(-3) || '0')) % 50) * 0.003;
    const lat = best.lat + best.dlat * startKm * 0.4 + jitter * 0.5;
    const lng = best.lng + best.dlng * startKm * 0.4 + jitter;

    // Clamp to Spain bounds
    if (lat < 35 || lat > 44.5 || lng < -10 || lng > 5) return null;
    return [lat, lng];
}

export default function LtvMap({ ltvs, maxSpeed, activeOnly }: Props) {
    const t = useTranslations('map');
    const tSpeed = useTranslations('speed');
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<import('leaflet').Map | null>(null);
    const layerGroupRef = useRef<import('leaflet').LayerGroup | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const [visibleCount, setVisibleCount] = useState(0);
    const [useORM, setUseORM] = useState(true);
    const ormLayerRef = useRef<import('leaflet').TileLayer | null>(null);

    const filtered = useMemo(() => {
        let res = ltvs.filter(l => l.speedNum <= maxSpeed);
        if (activeOnly) res = res.filter(l => l.active);
        return res;
    }, [ltvs, maxSpeed, activeOnly]);

    // Initialize map once
    useEffect(() => {
        if (mapRef.current || !containerRef.current) return;

        import('leaflet').then((L) => {
            if (mapRef.current) return; // guard double-init

            const map = L.map(containerRef.current!, {
                center: [40.4, -3.7],
                zoom: 6,
                zoomControl: true,
            });

            // OSM base layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            // OpenRailwayMap infrastructure layer
            const orm = L.tileLayer(
                'https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png',
                { attribution: '© OpenRailwayMap', maxZoom: 19, opacity: 0.9 }
            );
            orm.addTo(map);
            ormLayerRef.current = orm;

            mapRef.current = map;
            layerGroupRef.current = L.layerGroup().addTo(map);
            setMapReady(true);
        });

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                layerGroupRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Toggle ORM overlay
    useEffect(() => {
        if (!mapRef.current || !ormLayerRef.current) return;
        if (useORM) {
            ormLayerRef.current.addTo(mapRef.current);
        } else {
            mapRef.current.removeLayer(ormLayerRef.current);
        }
    }, [useORM, mapReady]);

    // Add/update circle markers whenever data or filter changes
    useEffect(() => {
        if (!mapReady || !layerGroupRef.current) return;

        import('leaflet').then((L) => {
            layerGroupRef.current!.clearLayers();
            let count = 0;

            for (const ltv of filtered) {
                let pos: [number, number] | null = null;
                if (ltv.latitude && ltv.longitude && ltv.latitude !== 0 && ltv.longitude !== 0) {
                    pos = [ltv.latitude, ltv.longitude];
                } else {
                    pos = estimateLatLng(ltv);
                }

                if (!pos) continue;

                const color = getSpeedColor(ltv.speedNum);
                const radius = Math.max(5, Math.min(14, (200 - ltv.speedNum) / 14));

                const circle = L.circleMarker(pos, {
                    radius,
                    fillColor: color,
                    fillOpacity: 0.82,
                    color: ltv.active ? '#fff' : '#ffffff44',
                    weight: ltv.active ? 2 : 1,
                });

                const lineName = ltv.line;
                circle.bindPopup(`
          <div style="min-width:240px;font-family:'Inter',sans-serif">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2px">
              <div style="font-size:0.7rem;color:#6b7280">${t('popup_line')}</div>
              ${ltv.active ? '<span style="background:#3b82f6;color:white;padding:1px 6px;border-radius:4px;font-size:0.6rem;font-weight:800;text-transform:uppercase;letter-spacing:0.05em">ACTIVE</span>' : ''}
            </div>
            <div style="font-size:0.82rem;color:#e2e8f0;margin-bottom:8px;font-weight:600;line-height:1.3">${lineName}</div>
            <div style="font-size:0.7rem;color:#6b7280">${t('popup_stations') ?? 'Stations'}</div>
            <div style="font-size:0.8rem;margin-bottom:6px">${ltv.stations}</div>
            <div style="font-size:0.7rem;color:#6b7280">${t('popup_km')}</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:0.82rem;color:#818cf8;margin-bottom:6px">${ltv.startKm} → ${ltv.endKm}</div>
            <div style="font-size:0.7rem;color:#6b7280">${t('popup_track')}: <strong style="color:#9ca3af">${ltv.track}</strong></div>
            <div style="font-size:0.7rem;color:#6b7280;margin-top:4px;margin-bottom:8px">${t('popup_reason')}: <span style="color:#9ca3af">${ltv.reason}</span></div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <span style="background:${color}22;color:${color};border:1px solid ${color}55;padding:3px 10px;border-radius:999px;font-weight:700;font-size:0.82rem">${ltv.speedNum} km/h</span>
              ${ltv.csv ? '<span style="background:rgba(34,197,94,0.15);color:#22c55e;border:1px solid rgba(34,197,94,0.35);padding:2px 8px;border-radius:999px;font-size:0.75rem;font-weight:600">CSV</span>' : ''}
            </div>
            <div style="margin-top:10px;display:flex;justify-content:space-between;font-size:0.68rem;color:#6b7280;border-top:1px solid rgba(255,255,255,0.1);padding-top:8px">
              <div>${t('popup_date')}: <span style="color:#9ca3af">${ltv.firstAppearanceDate}</span></div>
              <div style="text-align:right">Last: <span style="color:#9ca3af">${ltv.lastSeen}</span></div>
            </div>
            ${ltv.comment ? `<div style="margin-top:5px;font-size:0.72rem;color:#9ca3af;font-style:italic">${ltv.comment}</div>` : ''}
          </div>
        `);

                layerGroupRef.current!.addLayer(circle);
                count++;
            }
            setVisibleCount(count);
        });
    }, [mapReady, filtered, t]);

    const legendItems = [
        { label: tSpeed('critical'), color: '#ef4444' },
        { label: tSpeed('low'), color: '#f97316' },
        { label: tSpeed('medium'), color: '#eab308' },
        { label: tSpeed('high'), color: '#22c55e' },
        { label: tSpeed('reduced'), color: '#3b82f6' },
    ];

    return (
        <div className={styles.wrapper}>
            <div ref={containerRef} className={styles.mapContainer} />

            {/* Controls */}
            <div className={styles.controls}>
                <label className={styles.toggleLabel}>
                    <input type="checkbox" checked={useORM} onChange={e => setUseORM(e.target.checked)} />
                    <span>{t('layer_ormap')}</span>
                </label>
            </div>

            {/* Legend */}
            <div className={styles.legend}>
                <div className={styles.legendTitle}>{t('legend')}</div>
                {legendItems.map(item => (
                    <div key={item.label} className={styles.legendRow}>
                        <span className={styles.legendDot} style={{ background: item.color }} />
                        <span className={styles.legendLabel}>{item.label}</span>
                    </div>
                ))}
                <div className={styles.legendDivider} />
                <div className={styles.legendCount}>{visibleCount.toLocaleString()} LTV</div>
            </div>

            <div className={styles.disclaimer}>{t('disclaimer')}</div>
        </div>
    );
}
