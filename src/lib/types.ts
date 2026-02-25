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
}

export interface LTVData {
  [line: string]: LTV[];
}

export interface FlatLTV extends LTV {
  line: string;
  speedNum: number;
  kmLength: number;
  active: boolean;
}

export type SpeedCategory = 'critical' | 'low' | 'medium' | 'high' | 'reduced';

export function getSpeedCategory(speed: number): SpeedCategory {
  if (speed <= 30) return 'critical';
  if (speed <= 60) return 'low';
  if (speed <= 80) return 'medium';
  if (speed <= 120) return 'high';
  return 'reduced';
}

export function getSpeedColor(speed: number): string {
  if (speed <= 30) return '#ef4444';
  if (speed <= 60) return '#f97316';
  if (speed <= 80) return '#eab308';
  if (speed <= 120) return '#22c55e';
  return '#3b82f6';
}

export function getSpeedBgClass(speed: number): string {
  if (speed <= 30) return 'speed-critical';
  if (speed <= 60) return 'speed-low';
  if (speed <= 80) return 'speed-medium';
  if (speed <= 120) return 'speed-high';
  return 'speed-reduced';
}
