// Replit Database wrapper for Web Memer
class ReplitDatabase {
  private store = new Map<string, any>();
  private cache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();
  private CACHE_TTL = 30000; // 30 seconds

  async get(key: string): Promise<any> {
    // Check cache first
    if (this.cache.has(key)) {
      const expiry = this.cacheExpiry.get(key) || 0;
      if (Date.now() < expiry) {
        return this.cache.get(key);
      }
    }

    try {
      // Use in-memory store for server-side persistence
      const value = this.store.get(key);
      
      // Cache the result
      if (value !== undefined) {
        this.cache.set(key, value);
        this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
      }
      
      return value;
    } catch (error) {
      console.error(`Database get error for key ${key}:`, error);
      return undefined;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      // Store in memory
      this.store.set(key, value);
      
      // Update cache
      this.cache.set(key, value);
      this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
    } catch (error) {
      console.error(`Database set error for key ${key}:`, error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      this.store.delete(key);
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    } catch (error) {
      console.error(`Database delete error for key ${key}:`, error);
    }
  }

  async list(prefix: string = ""): Promise<string[]> {
    try {
      const keys: string[] = [];
      for (const key of this.store.keys()) {
        if (key.startsWith(prefix)) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      console.error(`Database list error for prefix ${prefix}:`, error);
      return [];
    }
  }

  // Helper method to clear expired cache entries
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now >= expiry) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }
}

export const db = new ReplitDatabase();

// Clear expired cache every 5 minutes
setInterval(() => {
  db.clearExpiredCache();
}, 300000);
