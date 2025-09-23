import { users, items, transactions, notifications, type User, type InsertUser, type Item, type Transaction, type Notification } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.SessionStore;

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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(userData: InsertUser & { passwordHash: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        username: userData.username,
        email: userData.email,
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
    // Check if we already have items in the database
    const existingItems = await this.getAllItems();
    if (existingItems.length > 0) return;

    // Create sample items
    const sampleItems = [
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
        stock: Infinity,
        currentPrice: 5000
      },
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
        name: "Luck Potion",
        description: "+15% win rate for 1 hour",
        price: 2500,
        type: 'powerup' as const,
        rarity: 'uncommon' as const,
        effects: {
          passive: { winRateBoost: 0, coinsPerHour: 0 },
          active: { useCooldown: 3600000, duration: 3600000, effect: "luck_boost" }
        },
        stock: 50,
        currentPrice: 2500
      },
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
      }
    ];

    for (const itemData of sampleItems) {
      await this.createItem(itemData);
    }

    // Note: Trivia questions and freemium loot table can be stored as JSON
    // For now, we'll skip these initialization steps as they're not critical
    console.log("Database initialized with sample items");
  }
}

export const storage = new DatabaseStorage();
