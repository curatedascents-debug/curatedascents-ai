import { http, HttpResponse } from 'msw';

/**
 * Mock Cloudflare R2 (S3-compatible) API.
 * Intercepts PutObject and DeleteObject calls from the Next.js server.
 */
export const r2Handlers = [
  // PutObject — upload file to R2
  http.put(/https:\/\/.*\.r2\.cloudflarestorage\.com\/.*/, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        ETag: '"mock-etag-' + Date.now() + '"',
        'x-amz-request-id': 'mock-request-id',
      },
    });
  }),

  // DeleteObject — delete file from R2
  http.delete(/https:\/\/.*\.r2\.cloudflarestorage\.com\/.*/, () => {
    return new HttpResponse(null, {
      status: 204,
    });
  }),

  // HeadObject — check if file exists
  http.head(/https:\/\/.*\.r2\.cloudflarestorage\.com\/.*/, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Content-Length': '1024',
        'Content-Type': 'image/webp',
        ETag: '"mock-etag"',
      },
    });
  }),
];
