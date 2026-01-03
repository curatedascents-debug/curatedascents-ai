// lib/agents/memory.ts
export class AgentMemory {
  private sessionMemory: Map<string, any>;
  private longTermMemory: any[] = [];
  private memoryKeys: string[] = [];

  constructor() {
    this.sessionMemory = new Map();
    this.loadInitialMemory();
  }

  private loadInitialMemory() {
    // Pre-load with travel expertise
    this.longTermMemory = [
      { key: 'luxury_indicators', value: ['helicopter', 'private', 'exclusive', 'VIP', '5-star', 'butler'], category: 'preferences' },
      { key: 'nepal_seasons', value: { best: ['Oct-Nov', 'Mar-Apr'], monsoon: ['Jun-Sep'], winter: ['Dec-Feb'] }, category: 'destination' },
      { key: 'budget_tiers', value: ['Ultra-Luxury ($25k+)', 'Luxury ($10k-25k)', 'Premium ($5k-10k)'], category: 'business' }
    ];
  }

  async remember(key: string, value: any, ttl?: number): Promise<void> {
    const memoryObject = {
      value,
      timestamp: Date.now(),
      ttl: ttl || 24 * 60 * 60 * 1000, // Default 24 hours
      accessCount: 0
    };

    this.sessionMemory.set(key, memoryObject);
    this.memoryKeys.push(key);

    // Store significant memories long-term
    if (this.isSignificantMemory(value)) {
      this.longTermMemory.push({
        key,
        value,
        timestamp: Date.now(),
        category: this.categorizeMemory(key, value)
      });
    }

    // Keep memory from growing too large
    if (this.sessionMemory.size > 50) {
      this.cleanupOldMemories();
    }
  }

  async recall(key: string): Promise<any | null> {
    const memory = this.sessionMemory.get(key);
    if (!memory) {
      // Try to find in long-term memory
      const ltMemory = this.longTermMemory.find(m => m.key === key);
      return ltMemory ? ltMemory.value : null;
    }

    // Check if memory has expired
    if (memory.ttl && Date.now() - memory.timestamp > memory.ttl) {
      this.sessionMemory.delete(key);
      return null;
    }

    // Update access count
    memory.accessCount = (memory.accessCount || 0) + 1;
    
    return memory.value;
  }

  async getRelevantMemories(context: string, limit: number = 5): Promise<any[]> {
    // Simple relevance scoring based on keyword matching
    const keywords = context.toLowerCase().split(' ');
    
    const relevantMemories: Array<{memory: any, score: number}> = [];
    
    // Check session memories
    for (const [key, memory] of this.sessionMemory.entries()) {
      const memoryStr = JSON.stringify(memory.value).toLowerCase();
      let score = 0;
      
      for (const keyword of keywords) {
        if (keyword.length > 3 && memoryStr.includes(keyword)) {
          score += 2;
        }
      }
      
      if (score > 0) {
        relevantMemories.push({ memory: { key, ...memory }, score });
      }
    }
    
    // Check long-term memories
    for (const ltMemory of this.longTermMemory) {
      const memoryStr = JSON.stringify(ltMemory.value).toLowerCase();
      let score = 0;
      
      for (const keyword of keywords) {
        if (keyword.length > 3 && memoryStr.includes(keyword)) {
          score += 1;
        }
      }
      
      if (score > 0) {
        relevantMemories.push({ memory: ltMemory, score });
      }
    }
    
    // Sort by relevance score and return top results
    return relevantMemories
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.memory);
  }

  async getConversationHistory(limit: number = 10): Promise<any[]> {
    const history = [];
    const messageKeys = this.memoryKeys.filter(key => key.startsWith('message_') || key.startsWith('reasoning_'));
    
    for (const key of messageKeys.slice(-limit)) {
      const memory = await this.recall(key);
      if (memory) {
        history.push({ key, ...memory });
      }
    }
    
    return history;
  }

  private isSignificantMemory(value: any): boolean {
    const str = JSON.stringify(value).toLowerCase();
    const significanceTriggers = [
      'budget', 'date', 'luxury', 'exclusive', 'private',
      'helicopter', 'spa', 'wellness', 'hiking', 'tour',
      'guide', 'hotel', 'resort', 'flight'
    ];
    
    return significanceTriggers.some(trigger => str.includes(trigger));
  }

  private categorizeMemory(key: string, value: any): string {
    if (key.includes('budget')) return 'budget';
    if (key.includes('date')) return 'dates';
    if (key.includes('preference') || key.includes('interest')) return 'preferences';
    if (key.includes('itinerary')) return 'itinerary';
    return 'general';
  }

  private cleanupOldMemories(): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    for (const [key, memory] of this.sessionMemory.entries()) {
      if (now - memory.timestamp > (memory.ttl || 24 * 60 * 60 * 1000)) {
        toDelete.push(key);
      }
    }
    
    for (const key of toDelete) {
      this.sessionMemory.delete(key);
    }
    
    // Keep only recent 100 memory keys
    if (this.memoryKeys.length > 100) {
      this.memoryKeys = this.memoryKeys.slice(-100);
    }
  }
}