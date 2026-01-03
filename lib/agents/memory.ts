// lib/agents/memory.ts

interface MemoryEntry {
  lastInteraction: string;
  agentMode: string;
  conversationSummary: string;
  preferences?: Record<string, any>;
  timestamp: string;
}

export async function getAgentMemory(sessionId: string): Promise<Record<string, any>> {
  if (typeof window === 'undefined') {
    // Server-side: return empty object
    return {};
  }
  
  try {
    const memoryKey = `curatedascents_memory_${sessionId}`;
    const stored = localStorage.getItem(memoryKey);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to get agent memory:', error);
    return {};
  }
}

export async function updateAgentMemory(
  sessionId: string, 
  data: Partial<MemoryEntry>
): Promise<void> {
  if (typeof window === 'undefined') {
    // Server-side: do nothing
    return;
  }
  
  try {
    const memoryKey = `curatedascents_memory_${sessionId}`;
    const existing = await getAgentMemory(sessionId);
    const updated = {
      ...existing,
      ...data,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(memoryKey, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to update agent memory:', error);
  }
}

export async function clearAgentMemory(sessionId: string): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const memoryKey = `curatedascents_memory_${sessionId}`;
    localStorage.removeItem(memoryKey);
  } catch (error) {
    console.error('Failed to clear agent memory:', error);
  }
}

// Initialize with luxury travel context
export const luxuryTravelContext = {
  expertise: "25+ years Himalayan luxury travel",
  specializations: [
    "Private helicopter tours",
    "Exclusive monastery access",
    "Luxury mountain villas",
    "Personal butler service",
    "VIP cultural experiences"
  ],
  budgetTiers: {
    "ultra-luxury": "$25,000+",
    "luxury": "$10,000 - $25,000",
    "premium": "$5,000 - $10,000"
  },
  destinations: [
    "Bhutan",
    "Nepal",
    "Ladakh",
    "Sikkim",
    "Tibet",
    "Darjeeling"
  ]
};
