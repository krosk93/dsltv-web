import { NextResponse } from 'next/server';
import { getData } from '@/lib/server/data';

export async function GET() {
    try {
        const data = getData();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] Error fetching LTV data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
