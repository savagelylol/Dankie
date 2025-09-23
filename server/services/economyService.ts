import { storage } from "../storage";

export class EconomyService {
  // Bank operations
  static async deposit(username: string, amount: number) {
    const user = await storage.getUserByUsername(username);
    if (!user) throw new Error("User not found");

    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }

    if (user.coins < amount) {
      throw new Error("Insufficient coins");
    }

    const newBankAmount = user.bank + amount;
    if (newBankAmount > user.bankCapacity) {
      throw new Error("Bank capacity exceeded");
    }

    await storage.updateUser(user.id, {
      coins: user.coins - amount,
      bank: newBankAmount
    });

    await storage.createTransaction({
      user: username,
      type: 'transfer',
      amount,
      description: `Deposited ${amount} coins to bank`
    });

    return { success: true, newCoins: user.coins - amount, newBank: newBankAmount };
  }

  static async withdraw(username: string, amount: number) {
    const user = await storage.getUserByUsername(username);
    if (!user) throw new Error("User not found");

    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }

    if (user.bank < amount) {
      throw new Error("Insufficient bank balance");
    }

    const fee = Math.floor(amount * 0.01); // 1% fee
    const netAmount = amount - fee;

    await storage.updateUser(user.id, {
      coins: user.coins + netAmount,
      bank: user.bank - amount
    });

    await storage.createTransaction({
      user: username,
      type: 'transfer',
      amount: netAmount,
      description: `Withdrew ${amount} coins from bank (${fee} fee)`
    });

    return { 
      success: true, 
      newCoins: user.coins + netAmount, 
      newBank: user.bank - amount,
      fee 
    };
  }

  // Transfer coins
  static async transfer(username: string, targetUsername: string, amount: number, message?: string) {
    const user = await storage.getUserByUsername(username);
    const targetUser = await storage.getUserByUsername(targetUsername);

    if (!user) throw new Error("User not found");
    if (!targetUser) throw new Error("Target user not found");

    if (username === targetUsername) {
      throw new Error("Cannot transfer to yourself");
    }

    if (amount < 10) {
      throw new Error("Minimum transfer amount is 10 coins");
    }

    const fee = amount > 1000 ? Math.floor(amount * 0.05) : 0; // 5% fee for >1000
    const totalCost = amount + fee;

    if (user.coins < totalCost) {
      throw new Error("Insufficient coins (including fee)");
    }

    await storage.updateUser(user.id, {
      coins: user.coins - totalCost
    });

    await storage.updateUser(targetUser.id, {
      coins: targetUser.coins + amount
    });

    // Create transactions
    await storage.createTransaction({
      user: username,
      type: 'transfer',
      amount: totalCost,
      targetUser: targetUsername,
      description: `Sent ${amount} coins to ${targetUsername}${fee > 0 ? ` (${fee} fee)` : ''}`
    });

    await storage.createTransaction({
      user: targetUsername,
      type: 'earn',
      amount: amount,
      targetUser: username,
      description: `Received ${amount} coins from ${username}`
    });

    // Create notification
    await storage.createNotification({
      user: targetUsername,
      message: `${username} sent you ${amount} coins${message ? `: ${message}` : ''}`,
      type: 'system'
    });

    return { 
      success: true, 
      sent: amount, 
      fee, 
      newBalance: user.coins - totalCost 
    };
  }

  // Rob system
  static async rob(username: string, targetUsername: string, betAmount: number) {
    const user = await storage.getUserByUsername(username);
    const targetUser = await storage.getUserByUsername(targetUsername);

    if (!user) throw new Error("User not found");
    if (!targetUser) throw new Error("Target user not found");

    if (username === targetUsername) {
      throw new Error("Cannot rob yourself");
    }

    // Check cooldown
    const now = Date.now();
    const robCooldown = 2 * 60 * 60 * 1000; // 2 hours
    
    if (user.lastRob && (now - user.lastRob) < robCooldown) {
      const remaining = robCooldown - (now - user.lastRob);
      throw new Error(`Rob cooldown: ${Math.ceil(remaining / (60 * 1000))} minutes remaining`);
    }

    const maxBet = Math.floor(user.coins * 0.2); // Max 20% of coins
    if (betAmount > maxBet) {
      throw new Error(`Maximum bet is 20% of your coins (${maxBet})`);
    }

    if (user.coins < betAmount) {
      throw new Error("Insufficient coins to bet");
    }

    if (targetUser.coins < betAmount * 0.5) {
      throw new Error("Target doesn't have enough coins to rob");
    }

    // Calculate success chance based on level difference and items
    const levelDiff = user.level - targetUser.level;
    let successChance = 0.3 + (levelDiff * 0.05); // Base 30% + 5% per level advantage
    
    // Apply item effects (simplified)
    const luckPotion = user.inventory.find(item => 
      item.itemId.includes('luck') && item.equipped
    );
    if (luckPotion) successChance += 0.15;

    successChance = Math.max(0.1, Math.min(0.8, successChance)); // Clamp between 10% and 80%

    const success = Math.random() < successChance;
    
    if (success) {
      const stolenAmount = Math.floor(betAmount * (0.2 + Math.random() * 0.3)); // 20-50% of bet
      
      await storage.updateUser(user.id, {
        coins: user.coins + stolenAmount,
        lastRob: now
      });

      await storage.updateUser(targetUser.id, {
        coins: Math.max(0, targetUser.coins - stolenAmount)
      });

      // Transactions
      await storage.createTransaction({
        user: username,
        type: 'rob',
        amount: stolenAmount,
        targetUser: targetUsername,
        description: `Successfully robbed ${stolenAmount} coins from ${targetUsername}`
      });

      await storage.createTransaction({
        user: targetUsername,
        type: 'fine',
        amount: stolenAmount,
        targetUser: username,
        description: `Robbed by ${username} for ${stolenAmount} coins`
      });

      // Notify target
      await storage.createNotification({
        user: targetUsername,
        message: `${username} robbed ${stolenAmount} coins from you! 💸`,
        type: 'rob'
      });

      return {
        success: true,
        stolen: stolenAmount,
        newBalance: user.coins + stolenAmount,
        message: `Successfully robbed ${stolenAmount} coins! 💰`
      };
    } else {
      // Failed rob - lose bet amount + fine
      const fine = Math.floor(betAmount * 0.5);
      const totalLoss = betAmount + fine;

      await storage.updateUser(user.id, {
        coins: Math.max(0, user.coins - totalLoss),
        lastRob: now
      });

      await storage.createTransaction({
        user: username,
        type: 'fine',
        amount: totalLoss,
        targetUser: targetUsername,
        description: `Failed rob attempt on ${targetUsername} - lost ${totalLoss} coins`
      });

      // Notify target of failed attempt
      await storage.createNotification({
        user: targetUsername,
        message: `${username} tried to rob you but failed! They lost ${totalLoss} coins 😂`,
        type: 'rob'
      });

      return {
        success: false,
        lost: totalLoss,
        newBalance: Math.max(0, user.coins - totalLoss),
        message: `Rob failed! Lost ${totalLoss} coins (${betAmount} bet + ${fine} fine) 💸`
      };
    }
  }

  // Daily commands
  static async claimDaily(username: string) {
    const user = await storage.getUserByUsername(username);
    if (!user) throw new Error("User not found");

    const now = Date.now();
    const dailyCooldown = 24 * 60 * 60 * 1000; // 24 hours

    if (user.lastDailyClaim && (now - user.lastDailyClaim) < dailyCooldown) {
      const remaining = dailyCooldown - (now - user.lastDailyClaim);
      throw new Error(`Daily cooldown: ${Math.ceil(remaining / (60 * 60 * 1000))} hours remaining`);
    }

    const amount = 200 + Math.floor(Math.random() * 801); // 200-1000 coins
    const xpGain = 50;
    
    // 5% chance for bonus item
    let bonusItem = null;
    if (Math.random() < 0.05) {
      const items = await storage.getAllItems();
      const rareItems = items.filter(item => item.rarity === 'rare');
      if (rareItems.length > 0) {
        bonusItem = rareItems[Math.floor(Math.random() * rareItems.length)];
      }
    }

    const updates: any = {
      coins: user.coins + amount,
      xp: user.xp + xpGain,
      lastDailyClaim: now
    };

    if (bonusItem) {
      const existingItem = user.inventory.find(item => item.itemId === bonusItem.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        user.inventory.push({
          itemId: bonusItem.id,
          quantity: 1,
          equipped: false
        });
      }
      updates.inventory = user.inventory;
    }

    await storage.updateUser(user.id, updates);

    await storage.createTransaction({
      user: username,
      type: 'earn',
      amount,
      description: `Daily reward: ${amount} coins, ${xpGain} XP${bonusItem ? ` + ${bonusItem.name}` : ''}`
    });

    return {
      success: true,
      coins: amount,
      xp: xpGain,
      bonusItem,
      newBalance: user.coins + amount,
      newXP: user.xp + xpGain
    };
  }

  static async work(username: string, jobType: string) {
    const user = await storage.getUserByUsername(username);
    if (!user) throw new Error("User not found");

    const now = Date.now();
    const workCooldown = 30 * 60 * 1000; // 30 minutes

    if (user.lastWork && (now - user.lastWork) < workCooldown) {
      const remaining = workCooldown - (now - user.lastWork);
      throw new Error(`Work cooldown: ${Math.ceil(remaining / (60 * 1000))} minutes remaining`);
    }

    const jobs = {
      'meme-farmer': { min: 100, max: 300, name: 'Meme Farmer' },
      'doge-miner': { min: 50, max: 500, name: 'Doge Miner' },
      'pepe-trader': { min: 150, max: 400, name: 'Pepe Trader' }
    };

    const job = jobs[jobType as keyof typeof jobs];
    if (!job) {
      throw new Error("Invalid job type");
    }

    const amount = job.min + Math.floor(Math.random() * (job.max - job.min + 1));
    const xpGain = 5;

    await storage.updateUser(user.id, {
      coins: user.coins + amount,
      xp: user.xp + xpGain,
      lastWork: now
    });

    await storage.createTransaction({
      user: username,
      type: 'earn',
      amount,
      description: `Work as ${job.name}: ${amount} coins, ${xpGain} XP`
    });

    return {
      success: true,
      job: job.name,
      coins: amount,
      xp: xpGain,
      newBalance: user.coins + amount,
      newXP: user.xp + xpGain
    };
  }

  static async beg(username: string) {
    const user = await storage.getUserByUsername(username);
    if (!user) throw new Error("User not found");

    const now = Date.now();
    const begCooldown = 5 * 60 * 1000; // 5 minutes

    if (user.lastBeg && (now - user.lastBeg) < begCooldown) {
      const remaining = begCooldown - (now - user.lastBeg);
      throw new Error(`Beg cooldown: ${Math.ceil(remaining / (60 * 1000))} minutes remaining`);
    }

    const success = Math.random() > 0.3; // 70% success rate
    if (!success) {
      const failMessages = [
        "A wild Elon appears and ignores you! 😔",
        "The meme gods are not pleased today",
        "Someone threw a banana at you instead of coins",
        "You got distracted by a cute doggo and forgot to beg"
      ];
      
      await storage.updateUser(user.id, { lastBeg: now });
      
      return {
        success: false,
        message: failMessages[Math.floor(Math.random() * failMessages.length)],
        coins: 0,
        newBalance: user.coins
      };
    }

    const amount = Math.floor(Math.random() * 151); // 0-150 coins
    const xpGain = 2;

    await storage.updateUser(user.id, {
      coins: user.coins + amount,
      xp: user.xp + xpGain,
      lastBeg: now
    });

    await storage.createTransaction({
      user: username,
      type: 'earn',
      amount,
      description: `Begging: ${amount} coins, ${xpGain} XP`
    });

    return {
      success: true,
      coins: amount,
      xp: xpGain,
      newBalance: user.coins + amount,
      newXP: user.xp + xpGain,
      message: `Someone took pity on you and gave ${amount} coins! 🥺`
    };
  }

  static async search(username: string) {
    const user = await storage.getUserByUsername(username);
    if (!user) throw new Error("User not found");

    const now = Date.now();
    const searchCooldown = 15 * 60 * 1000; // 15 minutes

    if (user.lastSearch && (now - user.lastSearch) < searchCooldown) {
      const remaining = searchCooldown - (now - user.lastSearch);
      throw new Error(`Search cooldown: ${Math.ceil(remaining / (60 * 1000))} minutes remaining`);
    }

    const locations = [
      "under the couch",
      "in the meme vault", 
      "behind a dumpster",
      "in Pepe's pond",
      "under a rock",
      "in your mom's purse"
    ];

    const location = locations[Math.floor(Math.random() * locations.length)];
    const amount = 10 + Math.floor(Math.random() * 91); // 10-100 coins
    
    // 10% chance for item
    let foundItem = null;
    if (Math.random() < 0.1) {
      const items = await storage.getAllItems();
      const commonItems = items.filter(item => item.rarity === 'common');
      if (commonItems.length > 0) {
        foundItem = commonItems[Math.floor(Math.random() * commonItems.length)];
      }
    }

    const updates: any = {
      coins: user.coins + amount,
      xp: user.xp + 2,
      lastSearch: now
    };

    if (foundItem) {
      const existingItem = user.inventory.find(item => item.itemId === foundItem.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        user.inventory.push({
          itemId: foundItem.id,
          quantity: 1,
          equipped: false
        });
      }
      updates.inventory = user.inventory;
    }

    await storage.updateUser(user.id, updates);

    await storage.createTransaction({
      user: username,
      type: 'earn',
      amount,
      description: `Searched ${location}: ${amount} coins${foundItem ? ` + ${foundItem.name}` : ''}`
    });

    return {
      success: true,
      location,
      coins: amount,
      foundItem,
      newBalance: user.coins + amount,
      message: `You searched ${location} and found ${amount} coins!${foundItem ? ` You also found a ${foundItem.name}!` : ''}`
    };
  }

  // Calculate and apply bank interest
  static async applyBankInterest(username: string) {
    const user = await storage.getUserByUsername(username);
    if (!user || user.bank <= 0) return;

    const daysSinceLastActive = (Date.now() - user.lastActive) / (24 * 60 * 60 * 1000);
    if (daysSinceLastActive < 1) return; // Must be at least 1 day

    const dailyRate = 0.005; // 0.5% daily
    const daysToApply = Math.min(7, Math.floor(daysSinceLastActive)); // Max 7 days
    const interest = Math.floor(user.bank * dailyRate * daysToApply);

    if (interest > 0) {
      await storage.updateUser(user.id, {
        bank: user.bank + interest
      });

      await storage.createTransaction({
        user: username,
        type: 'earn',
        amount: interest,
        description: `Bank interest: ${daysToApply} day(s) at 0.5% daily`
      });
    }

    return interest;
  }
}
