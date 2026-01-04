/**
 * Utility functions for cleaning and formatting AI responses
 */

/**
 * Cleans AI text by removing markdown formatting
 */
export function cleanAIText(text: string): string {
    if (!text) return text;

    let cleaned = text;

    // Remove markdown headers
    cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

    // Remove bold markers
    cleaned = cleaned.replace(/\*\*/g, '');

    // Remove italic markers but keep text
    cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');

    // Remove inline code markers
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

    // Convert markdown bullets to • (preserving indentation)
    cleaned = cleaned.replace(/^(\s*)[-*+]\s+/gm, '$1• ');

    // Convert numbered lists (keep numbers)
    cleaned = cleaned.replace(/^(\s*)\d+\.\s+/gm, '$1$&');

    // Remove code blocks
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');

    // Clean up multiple newlines (keep max 2)
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // Clean up multiple spaces
    cleaned = cleaned.replace(/[ \t]{2,}/g, ' ');

    return cleaned.trim();
}

/**
 * Formats text for HTML display (safe for dangerouslySetInnerHTML)
 */
export function formatTextForHTML(text: string): string {
    const cleaned = cleanAIText(text);

    // Convert to HTML with basic formatting
    return cleaned
        .split('\n')
        .map(line => {
            if (!line.trim()) return '<br>';

            // Check if line looks like a header (short, no period, ends with colon)
            if (line.length < 50 && !line.includes('.') && line.trim().endsWith(':')) {
                return `<h3 class="text-lg font-bold mt-4 mb-2 text-gray-900">${line.replace(':', '')}</h3>`;
            }

            // Check if line is a bullet point
            if (line.trim().startsWith('•')) {
                return `<div class="flex items-start mt-1">
                  <span class="mr-2 mt-1">•</span>
                  <span>${line.replace('•', '').trim()}</span>
                </div>`;
            }

            // Check if line is a numbered item
            if (line.match(/^\s*\d+\./)) {
                return `<div class="ml-4 my-1">${line}</div>`;
            }

            // Regular paragraph
            return `<p class="my-2">${line}</p>`;
        })
        .join('');
}

/**
 * Simple clean for immediate display (no HTML)
 */
export function simpleClean(text: string): string {
    return text
        .replace(/^#+\s*/gm, '')
        .replace(/\*\*/g, '')
        .replace(/\*(?!\s)([^*]+)(?<!\s)\*/g, '$1')
        .replace(/^\s*[-*+]\s+/gm, '• ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Extract budget tier from AI response
 */
export function extractBudgetTier(text: string): 'Ultra-Luxury' | 'Luxury' | 'Premium' | null {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('ultra-luxury') || lowerText.includes('$25,000') || lowerText.includes('25000')) {
        return 'Ultra-Luxury';
    }

    if (lowerText.includes('luxury') ||
        (lowerText.includes('$10,000') && lowerText.includes('$25,000')) ||
        (lowerText.includes('10000') && lowerText.includes('25000'))) {
        return 'Luxury';
    }

    if (lowerText.includes('premium') || lowerText.includes('$5,000') || lowerText.includes('5000')) {
        return 'Premium';
    }

    return null;
}