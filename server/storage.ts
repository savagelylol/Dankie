import { type User, type InsertUser, type Item, type Transaction, type Notification } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./database";
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

export class ReplitStorage implements IStorage {
  public sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return await db.get(`user:${id}`);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const userIds = await db.get('users:list') || [];
    for (const userId of userIds) {
      const user = await db.get(`user:${userId}`);
      if (user && user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const userIds = await db.get('users:list') || [];
    for (const userId of userIds) {
      const user = await db.get(`user:${userId}`);
      if (user && user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData: InsertUser & { passwordHash: string }): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...userData,
      id,
      coins: 500, // Welcome bonus
      bank: 0,
      bankCapacity: 10000,
      level: 1,
      xp: 0,
      inventory: [],
      friends: [],
      bio: "",
      avatarUrl: "",
      onlineStatus: false,
      createdAt: Date.now(),
      lastActive: Date.now(),
      banned: false,
      banReason: "",
      lastFreemiumClaim: null,
      lastDailyClaim: null,
      lastWork: null,
      lastBeg: null,
      lastSearch: null,
      lastRob: null,
      dailyEarn: 0,
      lastIP: "",
      achievements: [],
      gameStats: {
        blackjackWins: 0,
        blackjackLosses: 0,
        slotsWins: 0,
        slotsLosses: 0,
        coinflipWins: 0,
        coinflipLosses: 0,
        triviaWins: 0,
        triviaLosses: 0
      }
    };

    await db.set(`user:${id}`, user);
    
    // Update users list
    const usersList = await db.get('users:list') || [];
    usersList.push(id);
    await db.set('users:list', usersList);

    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = { ...user, ...updates, lastActive: Date.now() };
    await db.set(`user:${id}`, updatedUser);
    
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(`user:${id}`);
    
    const usersList = await db.get('users:list') || [];
    const filteredList = usersList.filter((userId: string) => userId !== id);
    await db.set('users:list', filteredList);
  }

  async getItem(id: string): Promise<Item | undefined> {
    return await db.get(`item:${id}`);
  }

  async getAllItems(): Promise<Item[]> {
    const itemIds = await db.get('items:list') || [];
    const items: Item[] = [];
    
    for (const itemId of itemIds) {
      const item = await db.get(`item:${itemId}`);
      if (item) {
        items.push(item);
      }
    }
    
    return items;
  }

  async createItem(itemData: Omit<Item, 'id'>): Promise<Item> {
    const id = randomUUID();
    const item: Item = { ...itemData, id };

    await db.set(`item:${id}`, item);
    
    const itemsList = await db.get('items:list') || [];
    itemsList.push(id);
    await db.set('items:list', itemsList);

    return item;
  }

  async updateItem(id: string, updates: Partial<Item>): Promise<Item> {
    const item = await this.getItem(id);
    if (!item) {
      throw new Error('Item not found');
    }

    const updatedItem = { ...item, ...updates };
    await db.set(`item:${id}`, updatedItem);
    
    return updatedItem;
  }

  async deleteItem(id: string): Promise<void> {
    await db.delete(`item:${id}`);
    
    const itemsList = await db.get('items:list') || [];
    const filteredList = itemsList.filter((itemId: string) => itemId !== id);
    await db.set('items:list', filteredList);
  }

  async createTransaction(transactionData: Omit<Transaction, 'id'>): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = { ...transactionData, id, timestamp: Date.now() };

    await db.set(`transaction:${id}`, transaction);
    
    // Add to user's transaction list
    const userTransactions = await db.get(`user:${transaction.user}:transactions`) || [];
    userTransactions.unshift(id); // Add to beginning
    
    // Keep only last 100 transactions per user
    if (userTransactions.length > 100) {
      userTransactions.splice(100);
    }
    
    await db.set(`user:${transaction.user}:transactions`, userTransactions);

    return transaction;
  }

  async getUserTransactions(username: string, limit = 20): Promise<Transaction[]> {
    const transactionIds = await db.get(`user:${username}:transactions`) || [];
    const transactions: Transaction[] = [];
    
    const limitedIds = transactionIds.slice(0, limit);
    
    for (const transactionId of limitedIds) {
      const transaction = await db.get(`transaction:${transactionId}`);
      if (transaction) {
        transactions.push(transaction);
      }
    }
    
    return transactions;
  }

  async createNotification(notificationData: Omit<Notification, 'id'>): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = { ...notificationData, id, timestamp: Date.now() };

    await db.set(`notification:${id}`, notification);
    
    // Add to user's notification list
    const userNotifications = await db.get(`user:${notification.user}:notifications`) || [];
    userNotifications.unshift(id);
    
    // Keep only last 50 notifications per user
    if (userNotifications.length > 50) {
      userNotifications.splice(50);
    }
    
    await db.set(`user:${notification.user}:notifications`, userNotifications);

    return notification;
  }

  async getUserNotifications(username: string): Promise<Notification[]> {
    const notificationIds = await db.get(`user:${username}:notifications`) || [];
    const notifications: Notification[] = [];
    
    for (const notificationId of notificationIds) {
      const notification = await db.get(`notification:${notificationId}`);
      if (notification) {
        notifications.push(notification);
      }
    }
    
    return notifications.sort((a, b) => b.timestamp - a.timestamp);
  }

  async markNotificationRead(id: string): Promise<void> {
    const notification = await db.get(`notification:${id}`);
    if (notification) {
      notification.read = true;
      await db.set(`notification:${id}`, notification);
    }
  }

  async getLeaderboard(limit = 20): Promise<Array<{username: string, coins: number, level: number}>> {
    const userIds = await db.get('users:list') || [];
    const leaderboard: Array<{username: string, coins: number, level: number}> = [];
    
    for (const userId of userIds) {
      const user = await db.get(`user:${userId}`);
      if (user && !user.banned) {
        leaderboard.push({
          username: user.username,
          coins: user.coins + user.bank, // Net worth
          level: user.level
        });
      }
    }
    
    return leaderboard
      .sort((a, b) => b.coins - a.coins)
      .slice(0, limit);
  }

  async initializeData(): Promise<void> {
    const initialized = await db.get('initialized');
    if (initialized) return;

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

    // Initialize trivia questions
    const triviaQuestions = [
      { question: "What year was the 'Distracted Boyfriend' meme created?", options: ["2015", "2016", "2017", "2018"], correct: 2 },
      { question: "Which meme features a dog sitting in a burning room?", options: ["Grumpy Cat", "This is Fine", "Doge", "Pepe"], correct: 1 },
      { question: "What does 'HODL' originally stand for?", options: ["Hold On for Dear Life", "Hold On, Don't Leave", "Nothing, it's a typo", "Hold On, Double Loss"], correct: 2 },
      // Add more questions as needed
    ];

    await db.set('trivia:questions', triviaQuestions);

    // Initialize freemium loot table
    const freemiumLoot = {
      coins: { weight: 40, min: 100, max: 500 },
      common: { weight: 25 },
      uncommon: { weight: 15 },
      rare: { weight: 10 },
      epic: { weight: 5 },
      legendary: { weight: 5 }
    };

    await db.set('freemium:loot', freemiumLoot);

    await db.set('initialized', true);
  }
}

export const storage = new ReplitStorage();
