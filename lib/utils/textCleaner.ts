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
  
  // Clean up whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  return cleaned.trim();
}

export function aggressiveClean(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  // More aggressive cleaning
  return text
    .replace(/[#*`_\-~>\[\]\(\)~=+]/g, '')
    .replace(/^\s*[•\-]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function hasMarkdown(text: string): boolean {
  if (!text) return false;
  return /[#*`_\-~>\[\]\(\)]/.test(text);
}
