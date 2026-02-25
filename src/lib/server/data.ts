import fs from 'fs';
import path from 'path';
import { LTVData, FlatLTV, getSpeedCategory } from '../types';
import { Stats, computeStats } from '../data';

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'ltv.json');

interface CachedData {
    raw: FlatLTV[];
    stats: Stats;
}

let cache: CachedData | null = null;
let watcher: fs.FSWatcher | null = null;

function processData(): CachedData {
    console.log('[DataService] Processing LTV data...');
    const fileContent = fs.readFileSync(DATA_PATH, 'utf-8');
    const data: LTVData = JSON.parse(fileContent);

    const flat: FlatLTV[] = [];
    let latestSeenDate = "";

    // First pass to find the latest seen date
    for (const records of Object.values(data)) {
        for (const record of records) {
            if (record.lastSeen > latestSeenDate) {
                latestSeenDate = record.lastSeen;
            }
        }
    }

    for (const [line, records] of Object.entries(data)) {
        for (const record of records) {
            const speedNum = parseFloat(record.speed) || 0;
            const startKm = parseFloat(record.startKm) || 0;
            const endKm = parseFloat(record.endKm) || 0;
            const kmLength = Math.abs(endKm - startKm);
            flat.push({
                ...record,
                line,
                speedNum,
                kmLength,
                active: record.lastSeen === latestSeenDate,
            });
        }
    }

    const stats = computeStats(flat);
    console.log(`[DataService] Processed ${flat.length} records.`);
    return { raw: flat, stats };
}

export function getData(): CachedData {
    if (!cache) {
        cache = processData();
        setupWatcher();
    }
    return cache;
}

function setupWatcher() {
    if (watcher) return;

    try {
        console.log(`[DataService] Watching file: ${DATA_PATH}`);
        watcher = fs.watch(DATA_PATH, (eventType) => {
            if (eventType === 'change') {
                console.log(`[DataService] Data file changed, reloading...`);
                try {
                    cache = processData();
                } catch (err) {
                    console.error('[DataService] Error reloading data:', err);
                }
            }
        });
    } catch (err) {
        console.error('[DataService] Could not setup watcher:', err);
    }
}
