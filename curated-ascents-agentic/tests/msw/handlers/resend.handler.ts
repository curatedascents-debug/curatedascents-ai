import { http, HttpResponse } from 'msw';

/**
 * Mock Resend email API.
 * Intercepts email sending calls from the Next.js server.
 */
export const resendHandlers = [
  // Send email
  http.post('https://api.resend.com/emails', async ({ request }) => {
    const body = await request.json() as { to?: string; subject?: string };
    console.log(`[MSW/Resend] Intercepted email to: ${body.to}, subject: ${body.subject}`);

    return HttpResponse.json({
      id: 'mock-email-' + Date.now(),
      from: 'noreply@curatedascents.com',
      to: body.to || 'test@example.com',
      created_at: new Date().toISOString(),
    });
  }),

  // Get email status
  http.get(/https:\/\/api\.resend\.com\/emails\/.*/, () => {
    return HttpResponse.json({
      id: 'mock-email-id',
      object: 'email',
      status: 'delivered',
    });
  }),
];
