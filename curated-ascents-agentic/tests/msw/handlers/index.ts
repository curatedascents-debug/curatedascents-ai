import { deepseekHandlers } from './deepseek.handler';
import { r2Handlers } from './r2.handler';
import { stripeHandlers } from './stripe.handler';
import { resendHandlers } from './resend.handler';

export const handlers = [
  ...deepseekHandlers,
  ...r2Handlers,
  ...stripeHandlers,
  ...resendHandlers,
];
