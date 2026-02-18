/**
 * Input Guardrails for AI Chat
 * Detects prompt injection attempts, enforces message limits, and filters harmful content
 */

// ─── CONFIGURATION ────────────────────────────────────────────────────────────

const MAX_MESSAGE_LENGTH = 2000;
const MAX_CONVERSATION_LENGTH = 50;

// ─── INJECTION DETECTION PATTERNS ─────────────────────────────────────────────

const INJECTION_PATTERNS: Array<{ pattern: RegExp; severity: "high" | "medium"; label: string }> = [
  // Direct instruction override attempts
  { pattern: /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|guidelines?)/i, severity: "high", label: "instruction_override" },
  { pattern: /disregard\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?)/i, severity: "high", label: "instruction_override" },
  { pattern: /forget\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?)/i, severity: "high", label: "instruction_override" },
  { pattern: /override\s+(system|previous|prior)\s+(prompt|instructions?|rules?)/i, severity: "high", label: "instruction_override" },

  // Role manipulation
  { pattern: /you\s+are\s+now\s+(a|an|the)\s+/i, severity: "high", label: "role_manipulation" },
  { pattern: /pretend\s+(you\s+are|to\s+be|you're)\s+(a|an|the)\s+/i, severity: "high", label: "role_manipulation" },
  { pattern: /act\s+as\s+(a|an|if\s+you\s+are)\s+/i, severity: "medium", label: "role_manipulation" },
  { pattern: /switch\s+to\s+(developer|admin|debug|root|sudo|god)\s+mode/i, severity: "high", label: "role_manipulation" },
  { pattern: /enter\s+(developer|admin|debug|jailbreak|DAN)\s+mode/i, severity: "high", label: "role_manipulation" },

  // System prompt extraction
  { pattern: /what\s+(is|are)\s+(your|the)\s+(system\s+)?prompt/i, severity: "high", label: "prompt_extraction" },
  { pattern: /show\s+(me\s+)?(your|the)\s+(system\s+)?prompt/i, severity: "high", label: "prompt_extraction" },
  { pattern: /reveal\s+(your|the)\s+(system\s+)?prompt/i, severity: "high", label: "prompt_extraction" },
  { pattern: /print\s+(your|the)\s+(system\s+)?prompt/i, severity: "high", label: "prompt_extraction" },
  { pattern: /repeat\s+(your|the)\s+(system\s+)?(prompt|instructions?)\s+(back|verbatim|exactly)/i, severity: "high", label: "prompt_extraction" },
  { pattern: /what\s+were\s+you\s+told\s+to\s+do/i, severity: "medium", label: "prompt_extraction" },

  // Cost/margin probing
  { pattern: /what\s+(is|are)\s+(your|the)\s+(cost|margin|markup|profit|commission)/i, severity: "high", label: "cost_probing" },
  { pattern: /how\s+much\s+(do\s+you|does\s+it)\s+(mark\s*up|profit|earn|make)/i, severity: "high", label: "cost_probing" },
  { pattern: /show\s+(me\s+)?(the\s+)?(cost|supplier|wholesale)\s+price/i, severity: "high", label: "cost_probing" },
  { pattern: /what\s+does\s+(the\s+)?(hotel|supplier|vendor)\s+charge\s+you/i, severity: "high", label: "cost_probing" },
  { pattern: /break\s*down\s+(the\s+)?(cost|price|pricing)\s+(per|for\s+each|by)\s+(service|item|night|hotel)/i, severity: "medium", label: "cost_probing" },

  // Delimiter injection
  { pattern: /```\s*(system|assistant|prompt)/i, severity: "high", label: "delimiter_injection" },
  { pattern: /<\/?system>/i, severity: "high", label: "delimiter_injection" },
  { pattern: /\[INST\]|\[\/INST\]/i, severity: "high", label: "delimiter_injection" },
  { pattern: /<<\s*SYS\s*>>|<<\s*\/SYS\s*>>/i, severity: "high", label: "delimiter_injection" },
  { pattern: /\bBEGIN\s+SYSTEM\s+MESSAGE\b/i, severity: "high", label: "delimiter_injection" },

  // Encoded/obfuscated attempts
  { pattern: /base64[:\s]|atob\s*\(|btoa\s*\(/i, severity: "medium", label: "encoding_attack" },
  { pattern: /\\u[0-9a-f]{4}/i, severity: "medium", label: "encoding_attack" },

  // DAN/jailbreak patterns
  { pattern: /\bDAN\b.*\bmode\b/i, severity: "high", label: "jailbreak" },
  { pattern: /\bjailbreak\b/i, severity: "high", label: "jailbreak" },
  { pattern: /do\s+anything\s+now/i, severity: "high", label: "jailbreak" },
];

// ─── CONTENT FILTER PATTERNS ──────────────────────────────────────────────────

const CONTENT_FILTER_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\b(bomb|explosive|weapon|firearm|gun)\s+(make|build|create|assemble)/i, label: "violence" },
  { pattern: /\b(hack|exploit|breach|compromise)\s+(this|the|a)\s+(system|server|database|account)/i, label: "hacking" },
  { pattern: /\b(steal|phish|scam|fraud)\b/i, label: "fraud" },
];

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface GuardrailResult {
  allowed: boolean;
  reason?: string;
  severity?: "high" | "medium" | "low";
  label?: string;
  sanitizedMessage?: string;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

// ─── MAIN FUNCTION ────────────────────────────────────────────────────────────

/**
 * Run all input guardrails on a user message.
 * Returns { allowed: true } if safe, or { allowed: false, reason, severity, label } if blocked.
 */
export function checkInputGuardrails(
  message: string,
  conversationHistory: Message[] = []
): GuardrailResult {
  // 1. Message length check
  if (message.length > MAX_MESSAGE_LENGTH) {
    return {
      allowed: false,
      reason: `Message too long (${message.length} chars). Please keep messages under ${MAX_MESSAGE_LENGTH} characters.`,
      severity: "low",
      label: "message_too_long",
    };
  }

  // 2. Empty message check
  if (!message.trim()) {
    return {
      allowed: false,
      reason: "Please enter a message.",
      severity: "low",
      label: "empty_message",
    };
  }

  // 3. Conversation length check
  if (conversationHistory.length > MAX_CONVERSATION_LENGTH) {
    return {
      allowed: false,
      reason: "This conversation has reached its limit. Please start a new conversation to continue.",
      severity: "low",
      label: "conversation_too_long",
    };
  }

  // 4. Prompt injection detection
  for (const { pattern, severity, label } of INJECTION_PATTERNS) {
    if (pattern.test(message)) {
      // High severity: block completely
      if (severity === "high") {
        return {
          allowed: false,
          reason: "I'm your Expedition Architect, here to help plan luxury adventures in Nepal, Bhutan, Tibet, and India. How can I assist with your travel plans?",
          severity,
          label,
        };
      }
      // Medium severity: allow but flag for logging
      return {
        allowed: true,
        severity,
        label,
        sanitizedMessage: message,
      };
    }
  }

  // 5. Content filter
  for (const { pattern, label } of CONTENT_FILTER_PATTERNS) {
    if (pattern.test(message)) {
      return {
        allowed: false,
        reason: "I specialize in luxury adventure travel. Let me know how I can help plan your journey to Nepal, Bhutan, Tibet, or India!",
        severity: "high",
        label: `content_filter_${label}`,
      };
    }
  }

  // 6. Repetition/spam detection (same message repeated 3+ times in history)
  const recentUserMessages = conversationHistory
    .filter((m) => m.role === "user")
    .slice(-5)
    .map((m) => m.content.trim().toLowerCase());
  const normalizedCurrent = message.trim().toLowerCase();
  const repeatCount = recentUserMessages.filter((m) => m === normalizedCurrent).length;
  if (repeatCount >= 3) {
    return {
      allowed: false,
      reason: "It looks like you're sending the same message repeatedly. Could you rephrase your question? I'm happy to help!",
      severity: "low",
      label: "spam_repetition",
    };
  }

  return { allowed: true };
}
