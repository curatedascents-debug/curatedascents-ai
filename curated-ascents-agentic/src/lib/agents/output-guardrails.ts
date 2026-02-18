/**
 * Output Guardrails for AI Chat
 * Scans AI responses for leaked sensitive data, off-topic content, and hallucinations
 */

// ─── COST/MARGIN LEAK DETECTION ───────────────────────────────────────────────

const COST_LEAK_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  // Direct cost mentions
  { pattern: /\b(our|the)\s+cost\s+(is|was|would\s+be|comes?\s+to)\s*\$?[\d,]+/i, label: "cost_disclosure" },
  { pattern: /\bcost\s*price\s*[:=]\s*\$?[\d,]+/i, label: "cost_disclosure" },
  { pattern: /\bsupplier\s+(rate|price|cost|charge)\s*(is|of|:)\s*\$?[\d,]+/i, label: "supplier_rate_leak" },
  { pattern: /\bwholesale\s+(rate|price|cost)\s*(is|of|:)\s*\$?[\d,]+/i, label: "wholesale_leak" },

  // Margin/markup mentions
  { pattern: /\b(margin|markup|mark-up|profit)\s*(is|of|:)\s*\d+\s*%/i, label: "margin_disclosure" },
  { pattern: /\bwe\s+(mark\s*up|add|charge)\s*(\d+\s*%|\$[\d,]+)\s*(on\s+top|above|over)/i, label: "markup_disclosure" },
  { pattern: /\b(commission|profit\s+margin)\s*(is|of|:)\s*\d+/i, label: "commission_disclosure" },

  // Per-item price breakdowns (hotel: $X, guide: $Y pattern)
  { pattern: /\b(hotel|accommodation)\s*[:=]\s*\$[\d,]+\s*(per|\/)\s*(night|room|person)/i, label: "itemized_pricing" },
  { pattern: /\b(guide|porter|sherpa)\s*[:=]\s*\$[\d,]+\s*(per|\/)\s*(day|trip)/i, label: "itemized_pricing" },
  { pattern: /\b(transport|vehicle|jeep|flight)\s*[:=]\s*\$[\d,]+/i, label: "itemized_pricing" },
  { pattern: /\b(permit|visa)\s*[:=]\s*\$[\d,]+/i, label: "itemized_pricing" },

  // Internal pricing language
  { pattern: /\bcredit\s*limit\b/i, label: "internal_term" },
  { pattern: /\bsell\s*price\b/i, label: "internal_term" },
  { pattern: /\bprice\s*tier\b/i, label: "internal_term" },
];

// ─── OFF-TOPIC DETECTION ──────────────────────────────────────────────────────

const OFF_TOPIC_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  // Completely unrelated topics the AI might get tricked into
  { pattern: /\b(here'?s?\s+(a\s+)?(python|javascript|java|c\+\+|ruby)\s+(code|script|program))/i, label: "code_generation" },
  { pattern: /\b(def\s+\w+\s*\(|function\s+\w+\s*\(|class\s+\w+\s*[{:])/i, label: "code_output" },
  { pattern: /\b(SELECT\s+\*?\s+FROM|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM)/i, label: "sql_output" },
  { pattern: /\bsudo\s+(rm|apt|yum|chmod|chown)/i, label: "system_commands" },
];

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface OutputGuardrailResult {
  safe: boolean;
  violations: Array<{
    label: string;
    category: "cost_leak" | "off_topic" | "hallucination";
    match: string;
  }>;
  sanitizedResponse?: string;
}

// ─── MAIN FUNCTION ────────────────────────────────────────────────────────────

/**
 * Check AI response for policy violations.
 * Returns { safe: true } if clean, or { safe: false, violations, sanitizedResponse } if issues found.
 */
export function checkOutputGuardrails(response: string): OutputGuardrailResult {
  const violations: OutputGuardrailResult["violations"] = [];

  // 1. Cost/margin leak detection
  for (const { pattern, label } of COST_LEAK_PATTERNS) {
    const match = response.match(pattern);
    if (match) {
      violations.push({
        label,
        category: "cost_leak",
        match: match[0],
      });
    }
  }

  // 2. Off-topic detection
  for (const { pattern, label } of OFF_TOPIC_PATTERNS) {
    const match = response.match(pattern);
    if (match) {
      violations.push({
        label,
        category: "off_topic",
        match: match[0],
      });
    }
  }

  if (violations.length === 0) {
    return { safe: true, violations: [] };
  }

  // If cost leaks found, redact the response
  const hasCostLeak = violations.some((v) => v.category === "cost_leak");
  if (hasCostLeak) {
    const sanitized = redactCostLeaks(response);
    return {
      safe: false,
      violations,
      sanitizedResponse: sanitized,
    };
  }

  // Off-topic violations are logged but response is still sent
  return { safe: false, violations };
}

/**
 * Redact cost/margin information from a response.
 * Replaces leaked pricing with a generic message.
 */
function redactCostLeaks(response: string): string {
  let cleaned = response;

  // Remove lines containing cost/margin leaks
  for (const { pattern } of COST_LEAK_PATTERNS) {
    cleaned = cleaned.replace(pattern, "[pricing details available upon request]");
  }

  return cleaned;
}

/**
 * Add safety disclaimer to responses that mention estimated/approximate pricing.
 * Only adds if the response references estimates but doesn't already have a disclaimer.
 */
export function addPricingDisclaimer(response: string): string {
  const hasEstimateLanguage = /\b(estimated?|approximate(ly)?|rough(ly)?|ballpark|market\s+rate|typical(ly)?)\b/i.test(response);
  const hasDisclaimer = /\b(subject\s+to\s+change|final\s+pricing|confirmed?\s+quote|exact\s+pricing)\b/i.test(response);
  const hasPriceAmount = /\$[\d,]+/i.test(response);

  if (hasEstimateLanguage && hasPriceAmount && !hasDisclaimer) {
    return response + "\n\n*Prices shown are estimates and subject to change based on travel dates, group size, and availability. Contact us for a confirmed quote.*";
  }

  return response;
}
