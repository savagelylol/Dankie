import { z } from "zod";
import { pgTable, varchar, integer, boolean, timestamp, jsonb, text, serial } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";


// Drizzle table definitions
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 20 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  coins: integer("coins").default(500).notNull(),
  bank: integer("bank").default(0).notNull(),
  bankCapacity: integer("bank_capacity").default(10000).notNull(),
  level: integer("level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  inventory: jsonb("inventory").default([]).notNull(),
  friends: jsonb("friends").default([]).notNull(),
  bio: varchar("bio", { length: 200 }).default("").notNull(),
  avatarUrl: text("avatar_url").default("").notNull(),
  onlineStatus: boolean("online_status").default(false).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  lastActive: timestamp("last_active").default(sql`now()`).notNull(),
  banned: boolean("banned").default(false).notNull(),
  banReason: text("ban_reason").default("").notNull(),
  lastFreemiumClaim: timestamp("last_freemium_claim"),
  lastDailyClaim: timestamp("last_daily_claim"),
  lastWork: timestamp("last_work"),
  lastBeg: timestamp("last_beg"),
  lastSearch: timestamp("last_search"),
  lastRob: timestamp("last_rob"),
  lastFish: timestamp("last_fish"),
  lastMine: timestamp("last_mine"),
  lastVote: timestamp("last_vote"),
  lastAdventure: timestamp("last_adventure"),
  lastCrime: timestamp("last_crime"),
  lastPostMeme: timestamp("last_post_meme"),
  lastStream: timestamp("last_stream"),
  lastHighLow: timestamp("last_high_low"),
  dailyEarn: integer("daily_earn").default(0).notNull(),
  lastIP: varchar("last_ip").default("").notNull(),
  achievements: jsonb("achievements").default([]).notNull(),
  gameStats: jsonb("game_stats").default(sql`'{}'`).notNull(),
});

export const items = pgTable("items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  type: varchar("type", { enum: ['tool', 'collectible', 'powerup', 'consumable', 'lootbox'] }).notNull(),
  rarity: varchar("rarity", { enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'] }).notNull(),
  effects: jsonb("effects").default(sql`'{}'`).notNull(),
  stock: integer("stock").default(sql`2147483647`).notNull(), // Max int for "infinity"
  currentPrice: integer("current_price"),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user: varchar("user").notNull(),
  type: varchar("type", { enum: ['earn', 'spend', 'transfer', 'rob', 'fine', 'freemium', 'fish', 'mine', 'vote', 'adventure', 'crime', 'postmeme', 'stream', 'highlow'] }).notNull(),
  amount: integer("amount").notNull(),
  targetUser: varchar("target_user"),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").default(sql`now()`).notNull(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user: varchar("user").notNull(),
  message: text("message").notNull(),
  type: varchar("type", { enum: ['trade', 'friend', 'event', 'system', 'rob'] }).notNull(),
  read: boolean("read").default(false).notNull(),
  timestamp: timestamp("timestamp").default(sql`now()`).notNull(),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  multipliers: jsonb("multipliers").default(sql`'{}'`).notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").default(sql`now()`).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  notifications: many(notifications),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.user],
    references: [users.username],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.user],
    references: [users.username],
  }),
}));

// Create insert and select schemas from tables
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, lastActive: true });
export const selectUserSchema = createSelectSchema(users);
export const insertItemSchema = createInsertSchema(items).omit({ id: true });
export const selectItemSchema = createSelectSchema(items);
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, timestamp: true });
export const selectTransactionSchema = createSelectSchema(transactions);
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, timestamp: true });
export const selectNotificationSchema = createSelectSchema(notifications);

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Item = typeof items.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Event = typeof events.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
