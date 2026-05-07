// One-shot script: sends Nepal_Hotel_Rates_Template.xlsx via Resend
// Run with: node send-hotel-rates.js
// Requires Node 18+ (built-in fetch). Delete this file once done.

const fs   = require('fs');
const path = require('path');

// ── Read API key from .env.local ─────────────────────────────────────────────
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('Could not find .env.local — make sure you run this from the project root.');
  process.exit(1);
}
const envContent = fs.readFileSync(envPath, 'utf-8');
const apiKeyMatch = envContent.match(/^RESEND_API_KEY=(.+)$/m);
if (!apiKeyMatch) {
  console.error('RESEND_API_KEY not found in .env.local');
  process.exit(1);
}
const apiKey = apiKeyMatch[1].trim();
console.log('API key loaded ✓');

// ── Read xlsx ────────────────────────────────────────────────────────────────
const xlsxPath = path.join(__dirname, 'Nepal_Hotel_Rates_Template.xlsx');
if (!fs.existsSync(xlsxPath)) {
  console.error(`File not found: ${xlsxPath}`);
  process.exit(1);
}
const xlsxBuffer = fs.readFileSync(xlsxPath);
const b64 = xlsxBuffer.toString('base64');
console.log(`xlsx loaded — ${xlsxBuffer.length} bytes → ${b64.length} base64 chars ✓`);

// ── Validate it's a real zip/xlsx (PK magic bytes) ──────────────────────────
if (xlsxBuffer[0] !== 0x50 || xlsxBuffer[1] !== 0x4b) {
  console.error('File does not look like a valid xlsx (missing PK header). Aborting.');
  process.exit(1);
}
console.log('xlsx magic bytes OK (PK) ✓');

// ── Send via Resend ──────────────────────────────────────────────────────────
async function send() {
  console.log('Calling Resend API…');
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
      html: '<p>Please find the Nepal Hotel Rates Template attached. Forward to the Nepal team.</p>',
      attachments: [{
        filename: 'Nepal_Hotel_Rates_Template.xlsx',
        content: b64,
      }],
    }),
  });

  const body = await res.text();
  if (res.ok) {
    console.log(`✅ Email sent! Status ${res.status}: ${body}`);
    console.log('\nCheck curatedascents@gmail.com — then forward to info@e-tourchannel.com');
  } else {
    console.error(`❌ Resend error ${res.status}: ${body}`);
  }
}

send().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
