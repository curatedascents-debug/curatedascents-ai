/**
 * Text cleaner utilities for removing markdown formatting
 */

export function cleanText(text: string): string {
    if (!text || typeof text !== 'string') return '';

    let cleaned = text;

    // First, fix common formatting issues
    cleaned = cleaned
        // Fix spaced-out punctuation
        .replace(/\s+\./g, '.')
        .replace(/\s+,/g, ',')
        .replace(/\s+:/g, ':')
        .replace(/\s+;/g, ';')
        // Fix day formatting
        .replace(/(\d+)\s*-\s*day/g, '$1-day')
        .replace(/(\d+)\s*day/g, '$1-day')
        // Remove markdown symbols
        .replace(/[#*`_\-~>\[\]\(\)]/g, '')
        // Fix bullet points
        .replace(/^\s*[\*\-]\s+/gm, '• ')
        .replace(/^•\s*/gm, '• ')
        // Fix numbered lists
        .replace(/^\s*\d+\.\s+/gm, '$1) ')
        // Fix multiple spaces
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n\s*\n/g, '\n\n');

    // Add spacing after sentences
    cleaned = cleaned.replace(/([.!?])\s*([A-Z])/g, '$1\n\n$2');

    // Format day sections
    cleaned = cleaned.replace(/(Day \d+):/gi, '\n\n$1:\n');
    cleaned = cleaned.replace(/(Days? \d+\s*-\s*\d+):/gi, '\n\n$1:\n');

    return cleaned.trim();
}

export function aggressiveClean(text: string): string {
    if (!text || typeof text !== 'string') return '';

    // More aggressive cleaning
    return text
        .replace(/[#*`_\-~>\[\]\(\)~=+]/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .replace(/([.!?])\s*([A-Z])/g, '$1\n\n$2')
        .trim();
}

export function hasMarkdown(text: string): boolean {
    if (!text) return false;
    return /[#*`_\-~>\[\]\(\)]/.test(text);
}