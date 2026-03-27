'use client';
import { getReductionBgClass } from '@/lib/types';

interface Props {
    speed: number;
    reduction: number;
}

export default function SpeedBadge({ speed, reduction }: Props) {
    return (
        <span className={`speed-badge ${getReductionBgClass(reduction)}`}>
            {speed === 999 ? '∞' : speed} <span style={{ fontWeight: 400, opacity: 0.8 }}>km/h</span>
        </span>
    );
}
