/**
 * Text cleaner utilities for removing markdown formatting
 */

export function cleanText(text: string): string {
    if (!text || typeof text !== 'string') return '';

    let cleaned = text;

    // Remove all markdown symbols
    cleaned = cleaned.replace(/[#*`_\-~>\[\]\(\)]/g, '');

    // Convert lists to bullet points
    cleaned = cleaned.replace(/^\s*[\*\-]\s+/gm, '• ');
    cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '$1) ');

    // Remove code blocks
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');

    // Clean up whitespace
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.replace(/\s+/g, ' ');

    return cleaned.trim();
}

export function hasMarkdown(text: string): boolean {
    if (!text) return false;
    return /[#*`_\-~>\[\]\(\)]/.test(text);
}