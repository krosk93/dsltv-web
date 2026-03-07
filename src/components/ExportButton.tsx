'use client';
import { useState, type RefObject } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';

interface ExportButtonProps {
    elementRef: RefObject<HTMLElement | null>;
    filename: string;
    className?: string;
    style?: React.CSSProperties;
}

export default function ExportButton({ elementRef, filename, className, style }: ExportButtonProps) {
    const [exporting, setExporting] = useState(false);

    const handleExport = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!elementRef.current || exporting) return;

        try {
            setExporting(true);

            // Wait a bit to ensure animations or re-renders are settled if any
            await new Promise(resolve => setTimeout(resolve, 100));

            const dataUrl = await toPng(elementRef.current, {
                cacheBust: true,
                backgroundColor: 'transparent',
                // Increased pixel ratio for "good quality"
                pixelRatio: 2,
                style: {
                    // Ensure fonts and other things are captured correctly
                    // Sometimes hidden elements or weird transforms causes issues
                }
            });

            const link = document.createElement('a');
            link.download = `${filename}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Export failed', err);
        } finally {
            setExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={exporting}
            title="Export as PNG"
            className={className}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                zIndex: 10,
                ...style
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = 'var(--text-muted)';
            }}
        >
            {exporting ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <Download size={16} />
            )}
        </button>
    );
}
