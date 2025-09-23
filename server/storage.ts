import { users, items, transactions, notifications, type User, type InsertUser, type Item, type Transaction, type Notification } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser & { passwordHash: string }): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Items
  getItem(id: string): Promise<Item | undefined>;
  getAllItems(): Promise<Item[]>;
  createItem(item: Omit<Item, 'id'>): Promise<Item>;
  updateItem(id: string, updates: Partial<Item>): Promise<Item>;
  deleteItem(id: string): Promise<void>;
  
  // Transactions
  createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction>;
  getUserTransactions(username: string, limit?: number): Promise<Transaction[]>;
  
  // Notifications
  createNotification(notification: Omit<Notification, 'id'>): Promise<Notification>;
  getUserNotifications(username: string): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
  
  // Leaderboard
  getLeaderboard(limit?: number): Promise<Array<{username: string, coins: number, level: number}>>;
  
  // System
  initializeData(): Promise<void>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users);
    return allUsers;
  }


  async createUser(userData: InsertUser & { passwordHash: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        username: userData.username,
        passwordHash: userData.passwordHash,
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error('User not found');
    }
    
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getItem(id: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item || undefined;
  }

  async getAllItems(): Promise<Item[]> {
    return await db.select().from(items);
  }

  async createItem(itemData: Omit<Item, 'id'>): Promise<Item> {
    const [item] = await db
      .insert(items)
      .values(itemData)
      .returning();
    return item;
  }

  async updateItem(id: string, updates: Partial<Item>): Promise<Item> {
    const [updatedItem] = await db
      .update(items)
      .set(updates)
      .where(eq(items.id, id))
      .returning();
    
    if (!updatedItem) {
      throw new Error('Item not found');
    }
    
    return updatedItem;
  }

  async deleteItem(id: string): Promise<void> {
    await db.delete(items).where(eq(items.id, id));
  }

  async createTransaction(transactionData: Omit<Transaction, 'id'>): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  async getUserTransactions(username: string, limit = 20): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.user, username))
      .orderBy(desc(transactions.timestamp))
      .limit(limit);
  }

  async createNotification(notificationData: Omit<Notification, 'id'>): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(notificationData)
      .returning();
    return notification;
  }

  async getUserNotifications(username: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.user, username))
      .orderBy(desc(notifications.timestamp))
      .limit(50);
  }

  async markNotificationRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }

  async getLeaderboard(limit = 20): Promise<Array<{username: string, coins: number, level: number}>> {
    const usersData = await db
      .select({
        username: users.username,
        coins: users.coins,
        bank: users.bank,
        level: users.level
      })
      .from(users)
      .where(eq(users.banned, false))
      .limit(limit * 2); // Get more in case we need to filter
    
    return usersData
      .map(user => ({
        username: user.username,
        coins: user.coins + user.bank, // Net worth
        level: user.level
      }))
      .sort((a, b) => b.coins - a.coins)
      .slice(0, limit);
  }

  async initializeData(): Promise<void> {
    // Get existing items to check what's already in the database
    const existingItems = await this.getAllItems();
    const existingItemNames = new Set(existingItems.map(item => item.name));

    // Create sample items
    const sampleItems = [
      // Tools (Equipment that provides passive benefits)
      {
        name: "Fishing Rod",
        description: "Passive +50 coins/hour",
        price: 5000,
        type: 'tool' as const,
        rarity: 'common' as const,
        effects: {
          passive: { winRateBoost: 0, coinsPerHour: 50 },
          active: { useCooldown: 0, duration: 0, effect: "" }
        },
        stock: 2147483647,
        currentPrice: 5000
      },
      {
        name: "Hunting Rifle",
        description: "Passive +75 coins/hour, +5% gambling luck",
        price: 8000,
        type: 'tool' as const,
        rarity: 'uncommon' as const,
        effects: {
          passive: { winRateBoost: 5, coinsPerHour: 75 },
          active: { useCooldown: 0, duration: 0, effect: "" }
        },
        stock: 2147483647,
        currentPrice: 8000
      },
      {
        name: "Laptop",
        description: "Work from home! Passive +100 coins/hour",
        price: 15000,
        type: 'tool' as const,
        rarity: 'rare' as const,
        effects: {
          passive: { winRateBoost: 0, coinsPerHour: 100 },
          active: { useCooldown: 0, duration: 0, effect: "" }
        },
        stock: 2147483647,
        currentPrice: 15000
      },
      {
        name: "Golden Pickaxe",
        description: "Epic mining tool! Passive +200 coins/hour, +10% luck",
        price: 50000,
        type: 'tool' as const,
        rarity: 'epic' as const,
        effects: {
          passive: { winRateBoost: 10, coinsPerHour: 200 },
          active: { useCooldown: 0, duration: 0, effect: "" }
        },
        stock: 2147483647,
        currentPrice: 50000
      },
      
      // Collectibles (Rare items for prestige and trading)
      {
        name: "Rare Pepe",
        description: "Legendary collectible meme",
        price: 25000,
        type: 'collectible' as const,
        rarity: 'rare' as const,
        effects: {
          passive: { winRateBoost: 0, coinsPerHour: 0 },
          active: { useCooldown: 0, duration: 0, effect: "" }
        },
        stock: 100,
        currentPrice: 25000
      },
      {
        name: "Dank Crown",
        description: "Show off your wealth! Ultimate status symbol",
        price: 1000000,
        type: 'collectible' as const,
        rarity: 'legendary' as const,
        effects: {
          passive: { winRateBoost: 0, coinsPerHour: 0 },
          active: { useCooldown: 0, duration: 0, effect: "" }
        },
        stock: 1,
        currentPrice: 1000000
      },
      {
        name: "Meme Trophy",
        description: "Award for exceptional meme quality",
        price: 75000,
        type: 'collectible' as const,
        rarity: 'epic' as const,
        effects: {
          passive: { winRateBoost: 0, coinsPerHour: 0 },
          active: { useCooldown: 0, duration: 0, effect: "" }
        },
        stock: 25,
        currentPrice: 75000
      },
      {
        name: "Shiny Rock",
        description: "It's shiny... and it's a rock",
        price: 5000,
        type: 'collectible' as const,
        rarity: 'common' as const,
        effects: {
          passive: { winRateBoost: 0, coinsPerHour: 0 },
          active: { useCooldown: 0, duration: 0, effect: "" }
        },
        stock: 500,
        currentPrice: 5000
      },
      
      // Consumables (One-time use items with temporary effects)
      {
        name: "Luck Potion",
        description: "+15% win rate for 1 hour",
        price: 2500,
        type: 'consumable' as const,
        rarity: 'uncommon' as const,
        effects: {
          passive: { winRateBoost: 0, coinsPerHour: 0 },
          active: { useCooldown: 3600000, duration: 3600000, effect: "luck_boost" }
        },
        stock: 50,
        currentPrice: 2500
      },
      {
        name: "Energy Drink",
        description: "Skip all cooldowns for 30 minutes",
        price: 5000,
        type: 'consumable' as const,
        rarity: 'rare' as const,
        effects: {
          passive: { winRateBoost: 0, coinsPerHour: 0 },
          active: { useCooldown: 1800000, duration: 1800000, effect: "no_cooldowns" }
        },
        stock: 25,
        currentPrice: 5000
      },
      {
        name: "Coin Multiplier",
        description: "2x coin earnings for 2 hours",
        price: 10000,
        type: 'consumable' as const,
        rarity: 'epic' as const,
        effects: {
          passive: { winRateBoost: 0, coinsPerHour: 0 },
          active: { useCooldown: 7200000, duration: 7200000, effect: "coin_multiplier" }
        },
        stock: 10,
        currentPrice: 10000
      },
      {
        name: "XP Booster",
        description: "Double XP gains for 1 hour",
        price: 3000,
        type: 'consumable' as const,
        rarity: 'uncommon' as const,
        effects: {
          passive: { winRateBoost: 0, coinsPerHour: 0 },
          active: { useCooldown: 3600000, duration: 3600000, effect: "xp_boost" }
        },
        stock: 30,
        currentPrice: 3000
      },
      
      // Loot Boxes (Mystery containers with random rewards)
      {
        name: "Dank Box",
        description: "Contains 2-5 random items!",
        price: 10000,
        type: 'lootbox' as const,
        rarity: 'epic' as const,
        effects: {
          passive: { winRateBoost: 0, coinsPerHour: 0 },
          active: { useCooldown: 0, duration: 0, effect: "lootbox" }
        },
        stock: 20,
        currentPrice: 10000
      },
      {
        name: "Starter Pack",
        description: "Perfect for new players! Contains basic items",
        price: 2500,
        type: 'lootbox' as const,
        rarity: 'common' as const,
        effects: {
          passive: { winRateBoost: 0, coinsPerHour: 0 },
          active: { useCooldown: 0, duration: 0, effect: "starter_lootbox" }
        },
        stock: 100,
        currentPrice: 2500
      },
      {
        name: "Legendary Chest",
        description: "Ultra rare items await! 1% chance legendary",
        price: 50000,
        type: 'lootbox' as const,
        rarity: 'legendary' as const,
        effects: {
          passive: { winRateBoost: 0, coinsPerHour: 0 },
          active: { useCooldown: 0, duration: 0, effect: "legendary_lootbox" }
        },
        stock: 5,
        currentPrice: 50000
      },
      {
        name: "Mystery Bundle",
        description: "Could contain anything... even a boat!",
        price: 7500,
        type: 'lootbox' as const,
        rarity: 'rare' as const,
        effects: {
          passive: { winRateBoost: 0, coinsPerHour: 0 },
          active: { useCooldown: 0, duration: 0, effect: "mystery_lootbox" }
        },
        stock: 40,
        currentPrice: 7500
      }
    ];

    // Upsert items - add new ones and update existing ones to ensure consistency
    let addedCount = 0;
    let updatedCount = 0;
    
    for (const itemData of sampleItems) {
      if (!existingItemNames.has(itemData.name)) {
        // Item doesn't exist, create it
        await this.createItem(itemData);
        addedCount++;
      } else {
        // Item exists, update it to ensure consistency across environments
        const existingItem = existingItems.find(item => item.name === itemData.name);
        if (existingItem) {
          await this.updateItem(existingItem.id, itemData);
          updatedCount++;
        }
      }
    }

    if (addedCount > 0 || updatedCount > 0) {
      console.log(`Database initialized: ${addedCount} new items added, ${updatedCount} items updated`);
    } else {
      console.log("All sample items are up to date in database");
    }
  }
}

export const storage = new DatabaseStorage();
