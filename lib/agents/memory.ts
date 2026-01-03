// Save this file at: lib/agents/memory.ts
export class AgentMemory {
  private sessionMemory: Map<string, any>;
  private longTermMemory: any[] = [];
  private memoryKeys: string[] = [];

  constructor() {
    this.sessionMemory = new Map();
    this.loadInitialMemory();
    this.loadFromStorage();
  }

  private loadInitialMemory() {
    this.longTermMemory = [
      { 
        key: 'luxury_tiers', 
        value: {
          'Ultra-Luxury': '$25,000+',
          'Luxury': '$10,000 - $25,000', 
          'Premium': '$5,000 - $10,000'
        }, 
        category: 'business' 
      },
      { 
        key: 'himalayan_seasons', 
        value: {
          'Best': ['October-November', 'March-April'],
          'Monsoon': ['June-September (lush, fewer crowds)'],
          'Winter': ['December-February (cold, clear skies)']
        }, 
        category: 'destination' 
      },
      { 
        key: 'signature_experiences', 
        value: [
          'Everest Base Camp Helicopter Tour',
          'Annapurna Sanctuary Luxury Trek',
          'Bhutan Cultural Immersion',
          'Tibetan Monastery Retreat'
        ], 
        category: 'experiences' 
      }
    ];
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('curatedascents_agent_memory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.longTermMemory)) {
          this.longTermMemory = [...this.longTermMemory, ...parsed.longTermMemory];
        }
        if (Array.isArray(parsed.memoryKeys)) {
          this.memoryKeys = parsed.memoryKeys;
        }
      }
    } catch (e) {
      console.warn('Failed to load agent memory from storage:', e);
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    
    const toSave = {
      longTermMemory: this.longTermMemory.filter(m => 
        m.category && ['preferences', 'user_data'].includes(m.category)
      ),
      memoryKeys: this.memoryKeys.slice(-100),
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem('curatedascents_agent_memory', JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save agent memory:', e);
    }
  }

  async remember(key: string, value: any, ttl?: number): Promise<void> {
    const memoryObject = {
      value,
      timestamp: Date.now(),
      ttl: ttl || 24 * 60 * 60 * 1000,
      accessCount: 0
    };

    this.sessionMemory.set(key, memoryObject);
    this.memoryKeys.push(key);

    if (this.isSignificantMemory(value)) {
      this.longTermMemory.push({
        key,
        value,
        timestamp: Date.now(),
        category: this.categorizeMemory(key, value)
      });
      
      this.saveToStorage();
    }

    if (this.sessionMemory.size > 100) {
      this.cleanupOldMemories();
    }
  }

  async recall(key: string): Promise<any | null> {
    const memory = this.sessionMemory.get(key);
    if (!memory) {
      const ltMemory = this.longTermMemory.find(m => m.key === key);
      return ltMemory ? ltMemory.value : null;
    }

    if (memory.ttl && Date.now() - memory.timestamp > memory.ttl) {
      this.sessionMemory.delete(key);
      return null;
    }

    memory.accessCount = (memory.accessCount || 0) + 1;
    return memory.value;
  }

  async getRelevantMemories(context: string, limit: number = 4): Promise<any[]> {
    const keywords = context.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const luxuryTerms = ['luxury', 'exclusive', 'private', 'helicopter', 'vip', '5-star'];
    
    const scored: Array<{memory: any, score: number}> = [];

    // Score session memories
    for (const [key, mem] of this.sessionMemory.entries()) {
      let score = 0;
      const memStr = JSON.stringify(mem.value).toLowerCase();
      
      keywords.forEach(kw => {
        if (memStr.includes(kw)) score += 3;
      });
      
      luxuryTerms.forEach(term => {
        if (memStr.includes(term)) score += 5;
      });
      
      if (score > 0) scored.push({
        memory: { key, ...mem },
        score
      });
    }

    // Score long-term memories
    this.longTermMemory.forEach(ltMem => {
      let score = 0;
      const memStr = JSON.stringify(ltMem.value).toLowerCase();
      
      keywords.forEach(kw => {
        if (memStr.includes(kw)) score += 2;
      });
      
      if (ltMem.category === 'business') score += 4;
      if (ltMem.category === 'destination') score += 3;
      
      if (score > 0) scored.push({
        memory: ltMem,
        score
      });
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.memory);
  }

  async getLuxuryPreferences(): Promise<string[]> {
    const prefs = new Set<string>();
    
    for (const [key, mem] of this.sessionMemory.entries()) {
      if (key.includes('preference') || key.includes('interest')) {
        const val = mem.value;
        if (Array.isArray(val)) {
          val.forEach((v: string) => prefs.add(v));
        } else if (typeof val === 'string') {
          prefs.add(val);
        }
      }
    }
    
    return Array.from(prefs);
  }

  private isSignificantMemory(value: any): boolean {
    const str = JSON.stringify(value).toLowerCase();
    const triggers = ['budget', 'date', 'luxury', 'exclusive', 'preference', 'interest'];
    return triggers.some(t => str.includes(t));
  }

  private categorizeMemory(key: string, value: any): string {
    const str = JSON.stringify(value).toLowerCase();
    if (str.includes('budget') || str.includes('$')) return 'budget';
    if (str.includes('date') || str.includes('month') || str.includes('season')) return 'timing';
    if (str.includes('preference') || str.includes('interest')) return 'preferences';
    return 'general';
  }

  private cleanupOldMemories(): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    for (const [key, mem] of this.sessionMemory.entries()) {
      if (now - mem.timestamp > (mem.ttl || 86400000)) {
        toDelete.push(key);
      }
    }
    
    toDelete.forEach(k => this.sessionMemory.delete(k));
    
    if (this.memoryKeys.length > 150) {
      this.memoryKeys = this.memoryKeys.slice(-150);
    }
  }
}