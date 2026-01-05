/**
 * Enhanced Text Cleaning Utilities
 * Handles markdown removal, Chinese-English spacing, and proper formatting
 */

/**
 * Clean text by removing markdown and fixing common issues
 */
export function cleanText(text: string): string {
    if (!text) return '';

    let cleaned = text
        // Remove all markdown symbols first
        .replace(/[#*`_~\[\]()>|]/g, '')
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, '')
        // Remove inline code
        .replace(/`[^`]*`/g, '')
        // Remove HTML tags if any
        .replace(/<[^>]*>/g, '')
        .trim();

    // Fix specific spacing issues between Chinese and English characters
    cleaned = cleaned
        // Add space between Chinese and English (文化A -> 文化 A)
        .replace(/([\u4e00-\u9fff])([A-Za-z])/g, '$1 $2')
        // Add space between English and Chinese (A文化 -> A 文化)
        .replace(/([A-Za-z])([\u4e00-\u9fff])/g, '$1 $2')
        // Add space between Chinese and numbers (文化1 -> 文化 1)
        .replace(/([\u4e00-\u9fff])(\d)/g, '$1 $2')
        // Add space between numbers and Chinese (1文化 -> 1 文化)
        .replace(/(\d)([\u4e00-\u9fff])/g, '$1 $2');

    // Fix compound words and hyphenation
    cleaned = cleaned
        .replace(/\b(\d+)(minute|min|hour|hr|day|month|year|star)\b/gi, '$1-$2')
        .replace(/\b(last|low|high|first|second|third)(minute|effort|reward|class|rate)\b/gi, '$1-$2')
        .replace(/\b(full|half|quarter)(day|board|moon)\b/gi, '$1-$2')
        .replace(/\b(everest|annapurna)(view|range|experience)\b/gi, '$1 $2')
        .replace(/\b(private|luxury|guided)(tour|transfer|helicopter)\b/gi, '$1 $2');

    // Normalize spaces and line breaks
    cleaned = cleaned
        .replace(/\s+/g, ' ') // Multiple spaces to single space
        .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
        .trim();

    return cleaned;
}

/**
 * Check if text contains markdown
 */
export function hasMarkdown(text: string): boolean {
    if (!text) return false;
    return /[#*`_~\[\]()>|]|```/.test(text);
}

/**
 * Aggressive cleaning for stubborn markdown
 */
export function aggressiveClean(text: string): string {
    if (!text) return '';

    let cleaned = text
        // Remove all special characters except basic punctuation and letters
        .replace(/[#*`_~\[\](){}|\\>]/g, '')
        // Remove any markdown-like patterns
        .replace(/^#{1,6}\s*/gm, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/__(.*?)__/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        .trim();

    return cleanText(cleaned);
}

/**
 * Format text for beautiful display with proper structure
 */
export function formatForDisplay(text: string): string {
    let cleaned = cleanText(text);

    // First, split by major sections (Days)
    const daySections = cleaned.split(/(Day \d+|Days \d+-\d+)/i);

    if (daySections.length > 1) {
        // Reconstruct with better formatting
        let formatted = '';
        for (let i = 0; i < daySections.length; i++) {
            if (i % 2 === 0) {
                // This is text before a day section
                formatted += formatParagraphs(daySections[i]);
            } else {
                // This is a day section header
                const dayText = daySections[i];
                const details = daySections[i + 1] || '';
                formatted += `\n\n**${dayText.trim()}**${details}`;
                i++; // Skip the next element since we used it
            }
        }
        cleaned = formatted;
    } else {
        // No day sections found, just format paragraphs
        cleaned = formatParagraphs(cleaned);
    }

    return cleaned.trim();
}

/**
 * Format paragraphs with proper line breaks and bullet points
 */
function formatParagraphs(text: string): string {
    if (!text) return '';

    // Split by double line breaks first
    let paragraphs = text.split(/\n\n+/);

    // If no double line breaks, try to create logical paragraphs
    if (paragraphs.length <= 1 && text.length > 200) {
        paragraphs = text.split(/(?<=[.!?])\s+(?=[A-Z])/);
    }

    return paragraphs
        .map(paragraph => {
            const trimmed = paragraph.trim();
            if (!trimmed) return '';

            // Check for bullet points
            if (trimmed.match(/^[•\-\*]\s/)) {
                const items = trimmed.split(/(?<=[.!?])\s+[•\-\*]\s/);
                if (items.length > 1) {
                    return items
                        .map(item => `• ${item.replace(/^[•\-\*]\s/, '').trim()}`)
                        .join('\n');
                }
                return trimmed;
            }

            return trimmed;
        })
        .filter(p => p.length > 0)
        .join('\n\n');
}

/**
 * Convert text to HTML with proper formatting
 */
export function textToHtml(text: string): string {
    const cleaned = formatForDisplay(text);

    // Convert to HTML with proper structure
    return cleaned
        .split('\n\n')
        .map(paragraph => {
            const trimmed = paragraph.trim();
            if (!trimmed) return '';

            // Day sections become headers
            if (trimmed.match(/^\*\*Day \d+\*\*|\*\*Days \d+-\d+\*\*/i)) {
                return `<div class="day-section"><strong>${trimmed.replace(/\*\*/g, '')}</strong></div>`;
            }

            // Bullet points become lists
            if (trimmed.includes('•')) {
                const items = trimmed.split('\n')
                    .filter(line => line.trim())
                    .map(line => line.replace('•', '').trim());

                if (items.length > 1) {
                    const listItems = items.map(item => `<li>${item}</li>`).join('');
                    return `<ul class="bulleted-list">${listItems}</ul>`;
                }
            }

            // Regular paragraphs
            return `<p>${trimmed}</p>`;
        })
        .join('');
}