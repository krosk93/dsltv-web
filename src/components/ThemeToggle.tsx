'use client';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '2px', border: '1px solid var(--border)' }}>
            <button
                onClick={() => setTheme('light')}
                style={{
                    background: theme === 'light' ? 'var(--bg-card)' : 'transparent',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '6px',
                    cursor: 'pointer',
                    color: theme === 'light' ? 'var(--accent)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                }}
                title="Modo claro"
            >
                <Sun size={16} />
            </button>
            <button
                onClick={() => setTheme('dark')}
                style={{
                    background: theme === 'dark' ? 'var(--bg-card)' : 'transparent',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '6px',
                    cursor: 'pointer',
                    color: theme === 'dark' ? 'var(--accent)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                }}
                title="Modo oscuro"
            >
                <Moon size={16} />
            </button>
            <button
                onClick={() => setTheme('system')}
                style={{
                    background: theme === 'system' ? 'var(--bg-card)' : 'transparent',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '6px',
                    cursor: 'pointer',
                    color: theme === 'system' ? 'var(--accent)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                }}
                title="Sistema"
            >
                <Monitor size={16} />
            </button>
        </div>
    );
}
