/**
 * WhatsApp Message Formatters
 * Handles markdown conversion and message chunking for WhatsApp
 */

// WhatsApp message character limit
const MAX_MESSAGE_LENGTH = 4096;
const SAFE_MESSAGE_LENGTH = 4000; // Leave buffer for chunking indicators

/**
 * Convert standard markdown to WhatsApp format
 * WhatsApp uses different markdown syntax
 */
export function convertToWhatsAppMarkdown(text: string): string {
  let result = text;

  // Bold: **text** -> *text*
  result = result.replace(/\*\*([^*]+)\*\*/g, '*$1*');

  // Italic: _text_ stays the same
  // (WhatsApp also supports _text_)

  // Strikethrough: ~~text~~ -> ~text~
  result = result.replace(/~~([^~]+)~~/g, '~$1~');

  // Links: [text](url) -> text: url
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1: $2');

  // Headers: # Header -> *Header*
  result = result.replace(/^#{1,6}\s+(.+)$/gm, '*$1*');

  // Code blocks: ```code``` -> ```code```
  // WhatsApp supports triple backticks for monospace
  // (keep as is)

  // Inline code: `code` -> ```code```
  result = result.replace(/`([^`]+)`/g, '```$1```');

  // Bullet points: - item -> • item
  result = result.replace(/^[-*]\s+/gm, '• ');

  // Numbered lists: keep as is, WhatsApp handles them well

  // Horizontal rules: --- -> ─────────────────
  result = result.replace(/^-{3,}$/gm, '─────────────────');

  // Remove HTML tags
  result = result.replace(/<[^>]+>/g, '');

  // Normalize multiple newlines to max 2
  result = result.replace(/\n{3,}/g, '\n\n');

  return result.trim();
}

/**
 * Split a long message into chunks that fit WhatsApp's character limit
 */
export function chunkMessage(text: string): string[] {
  if (text.length <= MAX_MESSAGE_LENGTH) {
    return [text];
  }

  const chunks: string[] = [];
  let remainingText = text;
  let chunkNumber = 1;

  while (remainingText.length > 0) {
    let chunkEnd = SAFE_MESSAGE_LENGTH;

    if (remainingText.length <= MAX_MESSAGE_LENGTH) {
      // Last chunk
      chunks.push(remainingText);
      break;
    }

    // Try to find a good break point
    const breakPoints = [
      remainingText.lastIndexOf('\n\n', chunkEnd), // Paragraph break
      remainingText.lastIndexOf('\n', chunkEnd),   // Line break
      remainingText.lastIndexOf('. ', chunkEnd),   // Sentence end
      remainingText.lastIndexOf('! ', chunkEnd),   // Exclamation
      remainingText.lastIndexOf('? ', chunkEnd),   // Question
      remainingText.lastIndexOf(', ', chunkEnd),   // Comma
      remainingText.lastIndexOf(' ', chunkEnd),    // Word break
    ];

    // Find the best break point (highest value that's still > 0)
    const breakPoint = Math.max(...breakPoints.filter(p => p > 0));

    if (breakPoint > SAFE_MESSAGE_LENGTH / 2) {
      chunkEnd = breakPoint + 1; // Include the break character
    }

    let chunk = remainingText.substring(0, chunkEnd).trim();

    // Add continuation indicator for multi-chunk messages
    const totalChunks = Math.ceil(text.length / SAFE_MESSAGE_LENGTH);
    if (totalChunks > 1) {
      chunk = `(${chunkNumber}/${totalChunks})\n\n${chunk}`;
    }

    chunks.push(chunk);
    remainingText = remainingText.substring(chunkEnd).trim();
    chunkNumber++;
  }

  return chunks;
}

/**
 * Format a price for WhatsApp display
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date for WhatsApp display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Create a formatted list
 */
export function formatList(items: string[], numbered: boolean = false): string {
  if (numbered) {
    return items.map((item, i) => `${i + 1}. ${item}`).join('\n');
  }
  return items.map((item) => `• ${item}`).join('\n');
}

/**
 * Create a formatted section with header and content
 */
export function formatSection(header: string, content: string): string {
  return `*${header}*\n${content}`;
}

/**
 * Format AI response for WhatsApp
 * Combines markdown conversion and chunking
 */
export function formatAIResponse(response: string): string[] {
  // First convert markdown
  const formatted = convertToWhatsAppMarkdown(response);

  // Then chunk if needed
  return chunkMessage(formatted);
}

/**
 * Create a quick reply button text
 */
export function formatQuickReply(text: string, maxLength: number = 20): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Escape special characters for WhatsApp
 */
export function escapeWhatsAppCharacters(text: string): string {
  // Escape asterisks that shouldn't be bold
  // Only escape if they're not paired
  let result = text;

  // Count asterisks
  const asteriskCount = (result.match(/\*/g) || []).length;
  if (asteriskCount % 2 !== 0) {
    // Odd number - escape the last one
    const lastIndex = result.lastIndexOf('*');
    result = result.substring(0, lastIndex) + '\\*' + result.substring(lastIndex + 1);
  }

  // Similar for underscores (italic)
  const underscoreCount = (result.match(/_/g) || []).length;
  if (underscoreCount % 2 !== 0) {
    const lastIndex = result.lastIndexOf('_');
    result = result.substring(0, lastIndex) + '\\_' + result.substring(lastIndex + 1);
  }

  // Similar for tildes (strikethrough)
  const tildeCount = (result.match(/~/g) || []).length;
  if (tildeCount % 2 !== 0) {
    const lastIndex = result.lastIndexOf('~');
    result = result.substring(0, lastIndex) + '\\~' + result.substring(lastIndex + 1);
  }

  return result;
}

/**
 * Strip all formatting from text
 */
export function stripFormatting(text: string): string {
  return text
    .replace(/\*([^*]+)\*/g, '$1')  // Bold
    .replace(/_([^_]+)_/g, '$1')    // Italic
    .replace(/~([^~]+)~/g, '$1')    // Strikethrough
    .replace(/```([^`]+)```/g, '$1') // Code
    .replace(/• /g, '- ')           // Bullets
    .replace(/─+/g, '---')          // Horizontal rules
    .trim();
}

/**
 * Create a greeting based on time of day
 */
export function getTimeBasedGreeting(timezone: string = 'Asia/Kathmandu'): string {
  const now = new Date();
  const hour = parseInt(
    now.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false, timeZone: timezone })
  );

  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Format a quote summary for WhatsApp
 */
export function formatQuoteSummary(quote: {
  quoteNumber: string;
  destination: string;
  startDate: string;
  endDate: string;
  numberOfPax: number;
  totalSellPrice: number;
  currency: string;
}): string {
  return `*Quote: ${quote.quoteNumber}*

📍 *Destination:* ${quote.destination}
📅 *Dates:* ${formatDate(quote.startDate)} - ${formatDate(quote.endDate)}
👥 *Travelers:* ${quote.numberOfPax}
💰 *Total:* ${formatPrice(quote.totalSellPrice, quote.currency)}

_Reply to discuss or customize this quote._`;
}

/**
 * Format a booking confirmation for WhatsApp
 */
export function formatBookingConfirmation(booking: {
  bookingReference: string;
  destination: string;
  startDate: string;
  endDate: string;
  numberOfPax: number;
  status: string;
}): string {
  const statusEmoji = booking.status === 'confirmed' ? '✅' : '⏳';

  return `*Booking Confirmed!* ${statusEmoji}

📋 *Reference:* ${booking.bookingReference}
📍 *Destination:* ${booking.destination}
📅 *Dates:* ${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}
👥 *Travelers:* ${booking.numberOfPax}

_We'll send your detailed itinerary and travel documents soon._`;
}

/**
 * Format error message for user
 */
export function formatErrorMessage(error?: string): string {
  return `I apologize, but I encountered an issue processing your request. ${
    error ? `(${error})` : ''
  }

Please try again, or type *help* for assistance.`;
}

/**
 * Create typing indicator message
 */
export function getTypingMessage(): string {
  return '...';
}
