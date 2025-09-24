import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireAdmin } from "./auth";
import { GameService } from "./services/gameService";
import { EconomyService } from "./services/economyService";
import { FreemiumService } from "./services/freemiumService";
import rateLimit from "express-rate-limit";

// Rate limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests" },
  standardHeaders: true,
  legacyHeaders: false,
});

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Apply rate limiting to all API routes
  app.use('/api', apiLimiter);

  // Initialize data on startup
  storage.initializeData().catch(console.error);

  // Economy routes
  app.post('/api/economy/deposit', requireAuth, async (req, res) => {
    try {
      const { amount } = req.body;
      const result = await EconomyService.deposit(req.user!.username, amount);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/economy/withdraw', requireAuth, async (req, res) => {
    try {
      const { amount } = req.body;
      const result = await EconomyService.withdraw(req.user!.username, amount);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/economy/transfer', requireAuth, async (req, res) => {
    try {
      const { targetUsername, amount, message } = req.body;
      const result = await EconomyService.transfer(req.user!.username, targetUsername, amount, message);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/economy/rob', requireAuth, async (req, res) => {
    try {
      const { targetUsername, betAmount } = req.body;
      const result = await EconomyService.rob(req.user!.username, targetUsername, betAmount);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/economy/daily', requireAuth, async (req, res) => {
    try {
      const result = await EconomyService.claimDaily(req.user!.username);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/economy/work', requireAuth, async (req, res) => {
    try {
      const { jobType } = req.body;
      const result = await EconomyService.work(req.user!.username, jobType);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/economy/beg', requireAuth, async (req, res) => {
    try {
      const result = await EconomyService.beg(req.user!.username);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/economy/search', requireAuth, async (req, res) => {
    try {
      const result = await EconomyService.search(req.user!.username);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // New earning methods
  app.post('/api/economy/fish', requireAuth, async (req, res) => {
    try {
      const result = await EconomyService.fish(req.user!.username);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/economy/mine', requireAuth, async (req, res) => {
    try {
      const result = await EconomyService.mine(req.user!.username);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/economy/vote', requireAuth, async (req, res) => {
    try {
      const result = await EconomyService.vote(req.user!.username);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/economy/adventure', requireAuth, async (req, res) => {
    try {
      const result = await EconomyService.adventure(req.user!.username);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // New Dank Memer inspired earning methods
  app.post('/api/economy/crime', requireAuth, async (req, res) => {
    try {
      const result = await EconomyService.crime(req.user!.username);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/economy/hunt', requireAuth, async (req, res) => {
    try {
      const result = await EconomyService.hunt(req.user!.username);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/economy/dig', requireAuth, async (req, res) => {
    try {
      const result = await EconomyService.dig(req.user!.username);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/economy/postmeme', requireAuth, async (req, res) => {
    try {
      const result = await EconomyService.postmeme(req.user!.username);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/economy/highlow', requireAuth, async (req, res) => {
    try {
      const highlowSchema = z.object({
        guess: z.enum(['higher', 'lower']),
        betAmount: z.number().min(10).max(100000)
      });
      
      const { guess, betAmount } = highlowSchema.parse(req.body);
      const result = await EconomyService.highlow(req.user!.username, guess, betAmount);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/economy/stream', requireAuth, async (req, res) => {
    try {
      const result = await EconomyService.stream(req.user!.username);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/economy/scratch', requireAuth, async (req, res) => {
    try {
      const result = await EconomyService.scratch(req.user!.username);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/economy/achievements/:username', requireAuth, async (req, res) => {
    try {
      const { username } = req.params;
      const result = await EconomyService.checkAchievements(username);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Game routes
  app.post('/api/games/blackjack', requireAuth, async (req, res) => {
    try {
      const { bet } = req.body;
      const result = await GameService.playBlackjack(req.user!.username, bet);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/games/slots', requireAuth, async (req, res) => {
    try {
      const { bet } = req.body;
      const result = await GameService.playSlots(req.user!.username, bet);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/games/coinflip', requireAuth, async (req, res) => {
    try {
      const { bet, choice } = req.body;
      const result = await GameService.playCoinflip(req.user!.username, bet, choice);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/games/trivia', requireAuth, async (req, res) => {
    try {
      const result = await GameService.playTrivia(req.user!.username);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/games/trivia', requireAuth, async (req, res) => {
    try {
      const { questionId, answer } = req.body;
      const result = await GameService.submitTriviaAnswer(req.user!.username, questionId, answer);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Freemium routes
  app.post('/api/freemium/claim', requireAuth, async (req, res) => {
    try {
      const result = await FreemiumService.claimFreemium(req.user!.username);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/freemium/next', requireAuth, async (req, res) => {
    try {
      const nextClaimTime = await FreemiumService.getNextClaimTime(req.user!.username);
      res.json({ nextClaimTime });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Shop routes
  app.get('/api/shop/items', requireAuth, async (req, res) => {
    try {
      const items = await storage.getAllItems();
      res.json(items);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/shop/buy', requireAuth, async (req, res) => {
    try {
      const { itemId, quantity = 1 } = req.body;
      const item = await storage.getItem(itemId);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }

      const user = await storage.getUserByUsername(req.user!.username);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const totalCost = item.currentPrice! * quantity;
      if (user.coins < totalCost) {
        return res.status(400).json({ error: "Insufficient coins" });
      }

      // Update user inventory and coins
      const existingItem = user.inventory.find(invItem => invItem.itemId === itemId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        user.inventory.push({
          itemId,
          quantity,
          equipped: false
        });
      }

      await storage.updateUser(user.id, {
        coins: user.coins - totalCost,
        inventory: user.inventory
      });

      await storage.createTransaction({
        user: req.user!.username,
        type: 'spend',
        amount: totalCost,
        description: `Bought ${quantity}x ${item.name} for ${totalCost} coins`
      });

      res.json({ 
        success: true, 
        newBalance: user.coins - totalCost,
        item: item.name,
        quantity 
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // User routes
  app.get('/api/user/inventory', requireAuth, async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.user!.username);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get full item details for inventory
      const inventory = [];
      for (const invItem of user.inventory) {
        const item = await storage.getItem(invItem.itemId);
        if (item) {
          inventory.push({
            ...item,
            quantity: invItem.quantity,
            equipped: invItem.equipped
          });
        }
      }

      res.json(inventory);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/user/transactions', requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const transactions = await storage.getUserTransactions(req.user!.username, limit);
      res.json(transactions);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get('/api/user/notifications', requireAuth, async (req, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.user!.username);
      res.json(notifications);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/user/notifications/:id/read', requireAuth, async (req, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Leaderboard route
  app.get('/api/leaderboard', requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Admin routes
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const users = allUsers.map(user => ({
        id: user.id,
        username: user.username,
        coins: user.coins,
        level: user.level,
        banned: user.banned,
        banReason: user.banReason,
        tempBanUntil: user.tempBanUntil,
        createdAt: user.createdAt
      }));
      
      res.json(users);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/admin/users/:id/ban', requireAdmin, async (req, res) => {
    try {
      const { reason } = req.body;
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await storage.updateUser(user.id, {
        banned: true,
        banReason: reason || "No reason provided"
      });

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Unban user
  app.post('/api/admin/users/:id/unban', requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await storage.updateUser(user.id, {
        banned: false,
        banReason: "",
        tempBanUntil: null
      });

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Temporary ban user
  app.post('/api/admin/users/:id/tempban', requireAdmin, async (req, res) => {
    try {
      const { reason, duration } = req.body; // duration in hours
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!duration || isNaN(parseInt(duration))) {
        return res.status(400).json({ error: "Invalid duration" });
      }

      const tempBanUntil = new Date();
      tempBanUntil.setHours(tempBanUntil.getHours() + parseInt(duration));

      await storage.updateUser(user.id, {
        banned: false, // Keep permanent ban false for temp bans
        banReason: reason || "Temporary ban",
        tempBanUntil
      });

      res.json({ success: true, message: `User temporarily banned for ${duration} hours` });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Give coins to specific user
  app.post('/api/admin/users/:id/give-coins', requireAdmin, async (req, res) => {
    try {
      const { amount } = req.body;
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!amount || isNaN(parseInt(amount))) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const coinAmount = parseInt(amount);
      await storage.updateUser(user.id, {
        coins: user.coins + coinAmount
      });

      await storage.createTransaction({
        user: user.username,
        type: 'earn',
        amount: coinAmount,
        description: `Admin gave ${coinAmount} coins`,
        targetUser: null,
        timestamp: new Date()
      });

      res.json({ success: true, message: `Gave ${coinAmount} coins to ${user.username}` });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Kick user (force disconnect)
  app.post('/api/admin/users/:id/kick', requireAdmin, async (req, res) => {
    try {
      const { reason } = req.body;
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update user's online status
      await storage.updateUser(user.id, {
        onlineStatus: false
      });

      // Send kick notification via WebSocket if connected
      // This would need WebSocket instance access - simplified for now
      
      res.json({ success: true, message: `Kicked user ${user.username}` });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post('/api/admin/command', requireAdmin, async (req, res) => {
    try {
      const { command } = req.body;
      const [action, ...params] = command.split(' ');

      switch (action) {
        case 'giveAll':
          const amount = parseInt(params[0]);
          if (isNaN(amount)) {
            return res.status(400).json({ error: "Invalid amount" });
          }

          const allUsers = await storage.getAllUsers();
          let affected = 0;
          
          for (const user of allUsers) {
            if (user && !user.banned) {
              await storage.updateUser(user.id, {
                coins: user.coins + amount
              });
              
              await storage.createTransaction({
                user: user.username,
                type: 'earn',
                amount,
                description: `Admin command: giveAll ${amount}`,
                targetUser: null,
                timestamp: new Date()
              });
              
              affected++;
            }
          }

          res.json({ success: true, message: `Gave ${amount} coins to ${affected} users` });
          break;

        case 'resetUser':
          const resetUsername = params[0];
          if (!resetUsername) {
            return res.status(400).json({ error: "Username required" });
          }

          const resetUser = await storage.getUserByUsername(resetUsername);
          if (!resetUser) {
            return res.status(404).json({ error: "User not found" });
          }

          await storage.updateUser(resetUser.id, {
            coins: 500,
            bank: 0,
            level: 1,
            xp: 0,
            inventory: [],
            achievements: []
          });

          res.json({ success: true, message: `Reset user ${resetUsername} to default state` });
          break;

        case 'setLevel':
          const levelUsername = params[0];
          const newLevel = parseInt(params[1]);
          if (!levelUsername || isNaN(newLevel)) {
            return res.status(400).json({ error: "Usage: setLevel <username> <level>" });
          }

          const levelUser = await storage.getUserByUsername(levelUsername);
          if (!levelUser) {
            return res.status(404).json({ error: "User not found" });
          }

          await storage.updateUser(levelUser.id, {
            level: Math.max(1, newLevel),
            xp: Math.max(0, (newLevel - 1) * 1000) // Rough XP calculation
          });

          res.json({ success: true, message: `Set ${levelUsername} to level ${newLevel}` });
          break;

        case 'clearInventory':
          const invUsername = params[0];
          if (!invUsername) {
            return res.status(400).json({ error: "Username required" });
          }

          const invUser = await storage.getUserByUsername(invUsername);
          if (!invUser) {
            return res.status(404).json({ error: "User not found" });
          }

          await storage.updateUser(invUser.id, {
            inventory: []
          });

          res.json({ success: true, message: `Cleared inventory for ${invUsername}` });
          break;

        case 'clearAllBans':
          const allUsersForUnban = await storage.getAllUsers();
          let unbanned = 0;
          
          for (const user of allUsersForUnban) {
            if (user && (user.banned || user.tempBanUntil)) {
              await storage.updateUser(user.id, {
                banned: false,
                banReason: "",
                tempBanUntil: null
              });
              unbanned++;
            }
          }

          res.json({ success: true, message: `Unbanned ${unbanned} users` });
          break;

        case 'serverMessage':
          const message = params.join(' ');
          if (!message) {
            return res.status(400).json({ error: "Message required" });
          }

          // This would broadcast a server message via WebSocket
          // Simplified implementation for now
          res.json({ success: true, message: `Server message sent: ${message}` });
          break;

        default:
          res.status(400).json({ error: "Unknown command" });
      }
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (data: string) => {
      try {
        const message = JSON.parse(data);
        
        // Handle different message types
        switch (message.type) {
          case 'chat':
            // Broadcast to all connected clients
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'chat',
                  username: message.username,
                  message: message.message,
                  timestamp: Date.now()
                }));
              }
            });
            break;
            
          case 'join':
            ws.send(JSON.stringify({
              type: 'system',
              message: 'Connected to Funny Economy chat!'
            }));
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  return httpServer;
}
