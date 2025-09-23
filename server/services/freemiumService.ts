import { storage } from "../storage";

export class FreemiumService {
  static async claimFreemium(username: string) {
    const user = await storage.getUserByUsername(username);
    if (!user) throw new Error("User not found");

    const now = Date.now();
    const freemiumCooldown = 10 * 1000; // 10 seconds

    if (user.lastFreemiumClaim && (now - user.lastFreemiumClaim) < freemiumCooldown) {
      const remaining = freemiumCooldown - (now - user.lastFreemiumClaim);
      throw new Error(`Freemium cooldown: ${Math.ceil(remaining / (60 * 60 * 1000))} hours remaining`);
    }

    // Get loot table
    const lootTable = await storage.db?.get('freemium:loot') || {
      coins: { weight: 40, min: 100, max: 500 },
      common: { weight: 25 },
      uncommon: { weight: 15 },
      rare: { weight: 10 },
      epic: { weight: 5 },
      legendary: { weight: 5 }
    };

    // Weighted random selection
    const totalWeight = Object.values(lootTable).reduce((sum: number, item: any) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedReward = 'coins';
    for (const [reward, data] of Object.entries(lootTable)) {
      random -= (data as any).weight;
      if (random <= 0) {
        selectedReward = reward;
        break;
      }
    }

    let result: any = { type: selectedReward };

    if (selectedReward === 'coins') {
      const coinData = lootTable.coins as any;
      const amount = coinData.min + Math.floor(Math.random() * (coinData.max - coinData.min + 1));
      
      await storage.updateUser(user.id, {
        coins: user.coins + amount,
        lastFreemiumClaim: now
      });

      await storage.createTransaction({
        user: username,
        type: 'freemium',
        amount,
        description: `Freemium daily reward: ${amount} coins`
      });

      result = {
        type: 'coins',
        amount,
        newBalance: user.coins + amount,
        message: `You received ${amount} coins! 💰`
      };
    } else {
      // Item reward
      const items = await storage.getAllItems();
      const rarityItems = items.filter(item => item.rarity === selectedReward);
      
      if (rarityItems.length === 0) {
        // Fallback to coins if no items of that rarity
        const amount = 250;
        await storage.updateUser(user.id, {
          coins: user.coins + amount,
          lastFreemiumClaim: now
        });

        result = {
          type: 'coins',
          amount,
          newBalance: user.coins + amount,
          message: `You received ${amount} coins! 💰 (backup reward)`
        };
      } else {
        const selectedItem = rarityItems[Math.floor(Math.random() * rarityItems.length)];
        
        // Handle lootbox special case
        if (selectedItem.type === 'lootbox') {
          const lootboxResult = await this.openLootbox(user, selectedItem);
          
          await storage.updateUser(user.id, {
            inventory: user.inventory,
            lastFreemiumClaim: now
          });

          result = {
            type: 'lootbox',
            item: selectedItem,
            lootboxContents: lootboxResult,
            message: `You received a ${selectedItem.name}! It contained: ${lootboxResult.map((item: any) => item.name).join(', ')}`
          };
        } else {
          // Regular item
          const existingItem = user.inventory.find(item => item.itemId === selectedItem.id);
          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            user.inventory.push({
              itemId: selectedItem.id,
              quantity: 1,
              equipped: false
            });
          }

          await storage.updateUser(user.id, {
            inventory: user.inventory,
            lastFreemiumClaim: now
          });

          result = {
            type: 'item',
            item: selectedItem,
            rarity: selectedReward,
            message: `You received a ${selectedItem.name}! ✨`
          };
        }

        await storage.createTransaction({
          user: username,
          type: 'freemium',
          amount: 0,
          description: `Freemium daily reward: ${selectedItem.name} (${selectedReward})`
        });
      }
    }

    return result;
  }

  private static async openLootbox(user: any, lootbox: any) {
    const items = await storage.getAllItems();
    const nonLootboxItems = items.filter(item => item.type !== 'lootbox');
    
    const numItems = 2 + Math.floor(Math.random() * 4); // 2-5 items
    const lootboxContents = [];
    
    for (let i = 0; i < numItems; i++) {
      // Weighted selection favoring common items
      const random = Math.random();
      let selectedRarity = 'common';
      
      if (random < 0.05) selectedRarity = 'legendary';
      else if (random < 0.15) selectedRarity = 'epic';
      else if (random < 0.3) selectedRarity = 'rare';
      else if (random < 0.5) selectedRarity = 'uncommon';
      
      const rarityItems = nonLootboxItems.filter(item => item.rarity === selectedRarity);
      if (rarityItems.length === 0) continue;
      
      const selectedItem = rarityItems[Math.floor(Math.random() * rarityItems.length)];
      
      // Add to user inventory
      const existingItem = user.inventory.find((item: any) => item.itemId === selectedItem.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        user.inventory.push({
          itemId: selectedItem.id,
          quantity: 1,
          equipped: false
        });
      }
      
      lootboxContents.push(selectedItem);
    }
    
    return lootboxContents;
  }

  // Get time until next claim
  static async getNextClaimTime(username: string) {
    const user = await storage.getUserByUsername(username);
    if (!user) return null;

    if (!user.lastFreemiumClaim) return 0; // Can claim now

    const freemiumCooldown = 10 * 1000; // 10 seconds
    const nextClaimTime = user.lastFreemiumClaim + freemiumCooldown;
    const now = Date.now();

    return Math.max(0, nextClaimTime - now);
  }
}
