// Temporary one-shot route — delete after use
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const xlsxPath = path.join(process.cwd(), 'Nepal_Hotel_Rates_Template.xlsx');
    if (!fs.existsSync(xlsxPath)) {
      return NextResponse.json({ error: 'xlsx file not found', path: xlsxPath }, { status: 404 });
    }
    const xlsxBuffer = fs.readFileSync(xlsxPath);

    if (xlsxBuffer[0] !== 0x50 || xlsxBuffer[1] !== 0x4b) {
      return NextResponse.json({ error: 'Not a valid xlsx (bad magic bytes)' }, { status: 500 });
    }

    const b64 = xlsxBuffer.toString('base64');
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 500 });
    }

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
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      resend: body,
      fileSizeBytes: xlsxBuffer.length,
      b64Length: b64.length,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
