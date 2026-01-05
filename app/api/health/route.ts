import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: {
      markdown_cleaning: 'active',
      agents: ['planner', 'negotiator', 'concierge'],
      deployment: 'vercel',
      last_updated: '2024-01-05'
    },
    services: {
      api: 'operational',
      ai_agents: 'operational',
      formatting: 'clean',
      memory: 'simplified'
    }
  });
}

export const dynamic = 'force-dynamic';
