import { NextResponse } from 'next/server';

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: Request) {
  const { b64 } = await request.json();
  const apiKey = process.env.RESEND_API_KEY;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'CuratedAscents <onboarding@resend.dev>',
      to: ['curatedascents@gmail.com'],
      subject: 'Nepal Hotel Rates Template — xlsx attachment',
      html: '<p>Please find the Nepal Hotel Rates Template attached. Forward to the Nepal team at info@e-tourchannel.com.</p>',
      attachments: [{ filename: 'Nepal_Hotel_Rates_Template.xlsx', content: b64 }],
    }),
  });
  const body = await res.json();
  const response = NextResponse.json({ ok: res.ok, status: res.status, resend: body });
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}
