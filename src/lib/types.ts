export interface LTV {
  code: string;
  stations: string;
  track: string;
  startKm: string;
  endKm: string;
  speed: string;
  reason: string;
  startDateTime: string;
  endDateTime: string;
  schedule: string;
  csv: boolean;
  comment: string;
  firstAppearanceDate: string;
  lastSeen: string;
  latitude?: number;
  longitude?: number;
  state?: string;
  province?: string;
  designSpeed?: number;
  delaySeconds?: number;
  path?: [number, number][];
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m > 0) return `${m}m ${s}s`;
  return `${seconds.toFixed(1)}s`;
}

export interface LTVData {
  [line: string]: LTV[];
}

export type RailType = 'conventional' | 'high-speed' | 'both';

export interface FlatLTV extends LTV {
  line: string;
  speedNum: number;
  kmLength: number;
  active: boolean;
  railType: RailType;
  reductionPercentage: number;
}

export type ReductionCategory = 'critical' | 'high' | 'medium' | 'low' | 'reduced';

export function getReductionCategory(reduction: number): ReductionCategory {
  if (reduction > 70) return 'critical';
  if (reduction > 50) return 'high';
  if (reduction > 30) return 'medium';
  if (reduction > 10) return 'low';
  return 'reduced';
}

export function getReductionColor(reduction: number): string {
  if (reduction > 70) return '#ef4444';
  if (reduction > 50) return '#f97316';
  if (reduction > 30) return '#eab308';
  if (reduction > 10) return '#22c55e';
  return '#3b82f6';
}

export function getReductionBgClass(reduction: number): string {
  if (reduction > 70) return 'speed-critical';
  if (reduction > 50) return 'speed-low';
  if (reduction > 30) return 'speed-medium';
  if (reduction > 10) return 'speed-high';
  return 'speed-reduced';
}
