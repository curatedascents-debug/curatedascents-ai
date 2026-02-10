import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW server for intercepting external API calls in the Next.js server process.
 * Started via src/instrumentation.ts when ENABLE_MSW=true.
 */
export const server = setupServer(...handlers);

export function startMswServer() {
  server.listen({
    onUnhandledRequest: 'bypass',
  });
  console.log('[MSW] Mock server started — intercepting external APIs');
}

export function stopMswServer() {
  server.close();
  console.log('[MSW] Mock server stopped');
}

export function resetMswHandlers() {
  server.resetHandlers();
}
