import fs from 'fs';
import path from 'path';
import { LTVData, FlatLTV, getReductionCategory } from '../types';
import { Stats, computeStats } from '../data';

const DATA_PATH_CONV = path.join(process.cwd(), 'public', 'data', 'ltv.json');
const DATA_PATH_AV = path.join(process.cwd(), 'public', 'data', 'ltv_av.json');

interface CachedData {
    raw: FlatLTV[];
    stats: Stats;
}

let cache: CachedData | null = null;
let watcher: fs.FSWatcher | null = null;

function processData(): CachedData {
    console.log('[DataService] Processing LTV data...');
    let flat: FlatLTV[] = [];

    const processFile = (filePath: string, railType: 'conventional' | 'high-speed') => {
        if (!fs.existsSync(filePath)) {
            console.warn(`[DataService] File not found: ${filePath}`);
            return;
        }
        
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data: LTVData = JSON.parse(fileContent);

        let latestSeenDate = "";

        // First pass to find the latest seen date for this file
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
                
                // Calculate reduction percentage
                let reductionPercentage = 0;
                if (record.designSpeed && record.designSpeed > 0 && speedNum > 0) {
                    reductionPercentage = Math.max(0, ((record.designSpeed - speedNum) / record.designSpeed) * 100);
                }

                flat.push({
                    ...record,
                    line,
                    speedNum,
                    kmLength,
                    active: record.lastSeen === latestSeenDate,
                    railType,
                    reductionPercentage
                });
            }
        }
    };

    processFile(DATA_PATH_CONV, 'conventional');
    processFile(DATA_PATH_AV, 'high-speed');

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
        console.log(`[DataService] Watching files: ${DATA_PATH_CONV}, ${DATA_PATH_AV}`);
        const reload = () => {
            console.log(`[DataService] Data file changed, reloading...`);
            try {
                cache = processData();
            } catch (err) {
                console.error('[DataService] Error reloading data:', err);
            }
        };

        if (fs.existsSync(DATA_PATH_CONV)) {
            watcher = fs.watch(DATA_PATH_CONV, (eventType) => {
                if (eventType === 'change') reload();
            });
        }
        if (fs.existsSync(DATA_PATH_AV)) {
            const avWatcher = fs.watch(DATA_PATH_AV, (eventType) => {
                if (eventType === 'change') reload();
            });
        }
    } catch (err) {
        console.error('[DataService] Could not setup watcher:', err);
    }
}
