import { NextResponse } from 'next/server';
import { getExecutions, getDashboardStats } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = getDashboardStats();
    const recentExecutions = getExecutions();

    return NextResponse.json({
      stats,
      recentExecutions: recentExecutions.slice(0, 5), // Apenas as 5 mais recentes para o feed
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao buscar telemetria' }, { status: 500 });
  }
}
