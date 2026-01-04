/**
 * Comprehensive text cleaner for removing ALL markdown formatting
 */

export function cleanText(text: string): string {
    if (!text || typeof text !== 'string') return '';

    let cleaned = text;

    // 1. Remove ALL markdown headers (single # to ######)
    cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

    // 2. Remove bold/italic markdown (**text**, *text*)
    cleaned = cleaned.replace(/\*\*/g, '');
    cleaned = cleaned.replace(/\*/g, '');

    // 3. Remove inline code and code blocks
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/`/g, '');

    // 4. Remove markdown lists (both * and -)
    cleaned = cleaned.replace(/^\s*[\*\-]\s+/gm, '• ');

    // 5. Remove numbered lists
    cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');

    // 6. Remove horizontal rules
    cleaned = cleaned.replace(/^\s*[-*_]{3,}\s*$/gm, '');

    // 7. Remove blockquotes
    cleaned = cleaned.replace(/^\s*>\s+/gm, '');

    // 8. Remove markdown links [text](url)
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // 9. Remove any remaining HTML tags (just in case)
    cleaned = cleaned.replace(/<[^>]*>/g, '');

    // 10. Clean up extra whitespace
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
    cleaned = cleaned.replace(/[ \t]+/g, ' ');

    // 11. Trim and return
    return cleaned.trim();
}

/**
 * Ultra-aggressive cleaning for stubborn API responses
 */
export function aggressiveClean(text: string): string {
    if (!text || typeof text !== 'string') return '';

    let cleaned = text;

    // Remove ALL special markdown characters
    cleaned = cleaned.replace(/[#*`_\-~>\[\]\(\)]/g, '');

    // Fix list formatting
    cleaned = cleaned.replace(/^\s*[•\-]\s+/gm, '• ');

    // Normalize line breaks
    cleaned = cleaned.replace(/\r\n/g, '\n');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    return cleaned.trim();
}

/**
 * Check if text contains markdown
 */
export function hasMarkdown(text: string): boolean {
    const markdownPatterns = [
        /^#{1,6}\s+/m,
        /\*\*/,
        /\*/,
        /```/,
        /`/,
        /^[\*\-]\s+/m,
        /^\d+\.\s+/m,
        /\[.*\]\(.*\)/
    ];

    return markdownPatterns.some(pattern => pattern.test(text));
}