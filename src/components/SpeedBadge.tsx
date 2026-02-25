'use client';
import { getSpeedBgClass } from '@/lib/types';

interface Props {
    speed: number;
}

export default function SpeedBadge({ speed }: Props) {
    return (
        <span className={`speed-badge ${getSpeedBgClass(speed)}`}>
            {speed} <span style={{ fontWeight: 400, opacity: 0.8 }}>km/h</span>
        </span>
    );
}
