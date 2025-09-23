import { z } from "zod";

// User schema for Replit Database
export const insertUserSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8),
});

export const userSchema = insertUserSchema.extend({
  id: z.string(),
  passwordHash: z.string(),
  coins: z.number().default(500),
  bank: z.number().default(0),
  bankCapacity: z.number().default(10000),
  level: z.number().default(1),
  xp: z.number().default(0),
  inventory: z.array(z.object({
    itemId: z.string(),
    quantity: z.number(),
    equipped: z.boolean().default(false)
  })).default([]),
  friends: z.array(z.string()).default([]),
  bio: z.string().max(200).default(""),
  avatarUrl: z.string().default(""),
  onlineStatus: z.boolean().default(false),
  createdAt: z.number().default(() => Date.now()),
  lastActive: z.number().default(() => Date.now()),
  banned: z.boolean().default(false),
  banReason: z.string().default(""),
  lastFreemiumClaim: z.number().nullable().default(null),
  lastDailyClaim: z.number().nullable().default(null),
  lastWork: z.number().nullable().default(null),
  lastBeg: z.number().nullable().default(null),
  lastSearch: z.number().nullable().default(null),
  lastRob: z.number().nullable().default(null),
  dailyEarn: z.number().default(0),
  lastIP: z.string().default(""),
  achievements: z.array(z.string()).default([]),
  gameStats: z.object({
    blackjackWins: z.number().default(0),
    blackjackLosses: z.number().default(0),
    slotsWins: z.number().default(0),
    slotsLosses: z.number().default(0),
    coinflipWins: z.number().default(0),
    coinflipLosses: z.number().default(0),
    triviaWins: z.number().default(0),
    triviaLosses: z.number().default(0)
  }).default({})
});

export const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().min(1),
  type: z.enum(['tool', 'collectible', 'powerup', 'consumable', 'lootbox']),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  effects: z.object({
    passive: z.object({
      winRateBoost: z.number().default(0),
      coinsPerHour: z.number().default(0)
    }).default({}),
    active: z.object({
      useCooldown: z.number().default(0),
      duration: z.number().default(0),
      effect: z.string().default("")
    }).default({})
  }).default({}),
  stock: z.number().default(Infinity),
  currentPrice: z.number().optional()
});

export const transactionSchema = z.object({
  id: z.string(),
  user: z.string(),
  type: z.enum(['earn', 'spend', 'transfer', 'rob', 'fine', 'freemium']),
  amount: z.number(),
  targetUser: z.string().optional(),
  description: z.string(),
  timestamp: z.number().default(() => Date.now())
});

export const notificationSchema = z.object({
  id: z.string(),
  user: z.string(),
  message: z.string(),
  type: z.enum(['trade', 'friend', 'event', 'system', 'rob']),
  read: z.boolean().default(false),
  timestamp: z.number().default(() => Date.now())
});

export const eventSchema = z.object({
  id: z.string(),
  name: z.string(),
  startDate: z.number(),
  endDate: z.number(),
  multipliers: z.object({
    xp: z.number().default(1),
    coins: z.number().default(1)
  }).default({})
});

export const chatMessageSchema = z.object({
  id: z.string(),
  username: z.string(),
  message: z.string(),
  timestamp: z.number().default(() => Date.now())
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof userSchema>;
export type Item = z.infer<typeof itemSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type Event = z.infer<typeof eventSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
