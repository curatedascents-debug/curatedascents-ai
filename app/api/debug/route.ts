import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    deepseekApiKey: {
      exists: !!apiKey,
      length: apiKey ? apiKey.length : 0,
      firstChars: apiKey ? apiKey.substring(0, 5) + '...' : 'none',
    },
    relatedEnvVars: Object.keys(process.env).filter(k => 
      k.toLowerCase().includes('deepseek') || 
      k.toLowerCase().includes('api') || 
      k.toLowerCase().includes('key')
    ).sort(),
  });
}
