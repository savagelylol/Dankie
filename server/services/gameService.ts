import { storage } from "../storage";
import { randomBytes } from "crypto";

export class GameService {
  // Blackjack implementation
  static async playBlackjack(username: string, bet: number) {
    const user = await storage.getUserByUsername(username);
    if (!user) throw new Error("User not found");

    if (bet < 10 || bet > 10000) {
      throw new Error("Bet must be between 10 and 10,000 coins");
    }

    if (user.coins < bet) {
      throw new Error("Insufficient coins");
    }

    // Simple blackjack simulation
    const dealerScore = this.getRandomCardValue();
    const playerScore = this.getRandomCardValue();
    
    const win = playerScore > dealerScore && playerScore <= 21;
    const amount = win ? Math.floor(bet * 1.95) : -bet; // House edge
    
    // Update user coins and stats
    await storage.updateUser(user.id, {
      coins: user.coins + amount,
      gameStats: {
        ...user.gameStats,
        blackjackWins: user.gameStats.blackjackWins + (win ? 1 : 0),
        blackjackLosses: user.gameStats.blackjackLosses + (win ? 0 : 1)
      }
    });

    // Create transaction
    await storage.createTransaction({
      user: username,
      type: win ? 'earn' : 'spend',
      amount: Math.abs(amount),
      description: `Blackjack ${win ? 'win' : 'loss'}: ${playerScore} vs ${dealerScore}`
    });

    return {
      win,
      amount,
      playerScore,
      dealerScore,
      newBalance: user.coins + amount
    };
  }

  // Slots implementation
  static async playSlots(username: string, bet: number) {
    const user = await storage.getUserByUsername(username);
    if (!user) throw new Error("User not found");

    if (bet < 10 || bet > 10000) {
      throw new Error("Bet must be between 10 and 10,000 coins");
    }

    if (user.coins < bet) {
      throw new Error("Insufficient coins");
    }

    // Slot symbols and their payouts
    const symbols = ['🐸', '💎', '🚀', '💰', '🔥'];
    const reels = [
      symbols[this.getSecureRandom() % symbols.length],
      symbols[this.getSecureRandom() % symbols.length],
      symbols[this.getSecureRandom() % symbols.length]
    ];

    let multiplier = 0;
    
    // Check for matches
    if (reels[0] === reels[1] && reels[1] === reels[2]) {
      // All three match
      if (reels[0] === '💰') multiplier = 50;
      else if (reels[0] === '💎') multiplier = 25;
      else if (reels[0] === '🚀') multiplier = 15;
      else if (reels[0] === '🔥') multiplier = 10;
      else multiplier = 5;
    } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
      // Two match
      multiplier = 2;
    }

    const win = multiplier > 0;
    const amount = win ? bet * multiplier - bet : -bet;

    // Update user
    await storage.updateUser(user.id, {
      coins: user.coins + amount,
      gameStats: {
        ...user.gameStats,
        slotsWins: user.gameStats.slotsWins + (win ? 1 : 0),
        slotsLosses: user.gameStats.slotsLosses + (win ? 0 : 1)
      }
    });

    await storage.createTransaction({
      user: username,
      type: win ? 'earn' : 'spend',
      amount: Math.abs(amount),
      description: `Slots ${win ? 'win' : 'loss'}: ${reels.join(' ')} (${multiplier}x)`
    });

    return {
      win,
      amount,
      reels,
      multiplier,
      newBalance: user.coins + amount
    };
  }

  // Coinflip implementation
  static async playCoinflip(username: string, bet: number, choice: 'heads' | 'tails') {
    const user = await storage.getUserByUsername(username);
    if (!user) throw new Error("User not found");

    if (bet < 10 || bet > 10000) {
      throw new Error("Bet must be between 10 and 10,000 coins");
    }

    if (user.coins < bet) {
      throw new Error("Insufficient coins");
    }

    const result = this.getSecureRandom() % 2 === 0 ? 'heads' : 'tails';
    const win = choice === result;
    const amount = win ? Math.floor(bet * 0.95) : -bet; // 1.95x payout with house edge

    await storage.updateUser(user.id, {
      coins: user.coins + amount,
      gameStats: {
        ...user.gameStats,
        coinflipWins: user.gameStats.coinflipWins + (win ? 1 : 0),
        coinflipLosses: user.gameStats.coinflipLosses + (win ? 0 : 1)
      }
    });

    await storage.createTransaction({
      user: username,
      type: win ? 'earn' : 'spend',
      amount: Math.abs(amount),
      description: `Coinflip ${win ? 'win' : 'loss'}: ${choice} vs ${result}`
    });

    return {
      win,
      amount,
      result,
      choice,
      newBalance: user.coins + amount
    };
  }

  // Trivia implementation
  static async playTrivia(username: string) {
    const user = await storage.getUserByUsername(username);
    if (!user) throw new Error("User not found");

    const questions = await storage.db?.get('trivia:questions') || [];
    if (questions.length === 0) {
      throw new Error("No trivia questions available");
    }

    const question = questions[this.getSecureRandom() % questions.length];
    
    return {
      question: question.question,
      options: question.options,
      questionId: questions.indexOf(question)
    };
  }

  static async submitTriviaAnswer(username: string, questionId: number, answer: number) {
    const user = await storage.getUserByUsername(username);
    if (!user) throw new Error("User not found");

    const questions = await storage.db?.get('trivia:questions') || [];
    const question = questions[questionId];
    
    if (!question) {
      throw new Error("Invalid question");
    }

    const win = answer === question.correct;
    const amount = win ? 100 : 0; // Fixed reward for trivia

    if (win) {
      await storage.updateUser(user.id, {
        coins: user.coins + amount,
        xp: user.xp + 20,
        gameStats: {
          ...user.gameStats,
          triviaWins: user.gameStats.triviaWins + 1
        }
      });

      await storage.createTransaction({
        user: username,
        type: 'earn',
        amount,
        description: `Trivia correct answer: +${amount} coins, +20 XP`
      });
    } else {
      await storage.updateUser(user.id, {
        gameStats: {
          ...user.gameStats,
          triviaLosses: user.gameStats.triviaLosses + 1
        }
      });
    }

    return {
      win,
      amount,
      correctAnswer: question.options[question.correct],
      newBalance: user.coins + amount,
      newXP: user.xp + (win ? 20 : 0)
    };
  }

  // Helper methods
  private static getRandomCardValue(): number {
    // Simplified blackjack - return value between 15-25
    return 15 + (this.getSecureRandom() % 11);
  }

  private static getSecureRandom(): number {
    return randomBytes(4).readUInt32BE(0);
  }
}
