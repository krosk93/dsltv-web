'use client';
import Header from '@/components/Header';
import ClosureMessage from '@/components/ClosureMessage';

export default function DashboardPage() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main className="page-container" style={{ padding: '24px' }}>
                <ClosureMessage />
            </main>
        </div>
    );
}
