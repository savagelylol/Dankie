import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Blackjack from "@/components/games/blackjack";
import Slots from "@/components/games/slots";
import Coinflip from "@/components/games/coinflip";
import Trivia from "@/components/games/trivia";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function GamesPage() {
  const { user } = useAuth();
  const [activeGame, setActiveGame] = useState<string | null>(null);

  if (!user) return null;

  const games = [
    {
      id: "blackjack",
      name: "BLACKJACK",
      icon: "🃏",
      description: "Beat the dealer!",
      minBet: 10,
      maxBet: 10000,
      component: Blackjack,
      color: "primary"
    },
    {
      id: "slots",
      name: "MEME SLOTS",
      icon: "🎰",
      description: "Spin to win!",
      minBet: 10,
      maxBet: 10000,
      component: Slots,
      color: "secondary"
    },
    {
      id: "coinflip",
      name: "COINFLIP",
      icon: "🪙",
      description: "Heads or tails?",
      minBet: 10,
      maxBet: 10000,
      component: Coinflip,
      color: "accent"
    },
    {
      id: "trivia",
      name: "MEME TRIVIA",
      icon: "🧠",
      description: "Test your meme knowledge!",
      minBet: 0,
      maxBet: 0,
      component: Trivia,
      color: "primary"
    }
  ];

  const selectedGame = games.find(game => game.id === activeGame);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-8">
        <div className="text-center">
          <h1 className="font-impact text-4xl text-secondary mb-2" data-testid="games-title">
            🎮 MEME CASINO 🎮
          </h1>
          <p className="text-muted-foreground text-lg">
            Test your luck and skill in our collection of meme-themed games!
          </p>
        </div>

        {!activeGame ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Card 
                key={game.id}
                className={`hover:scale-105 transition-transform cursor-pointer border-${game.color}/20 hover:border-${game.color} ${game.color === 'primary' ? 'glow-primary' : game.color === 'secondary' ? 'glow-secondary' : 'glow-accent'}`}
                onClick={() => setActiveGame(game.id)}
                data-testid={`game-card-${game.id}`}
              >
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2 animate-bounce-slow">{game.icon}</div>
                  <CardTitle className={`font-impact text-xl text-${game.color}`}>
                    {game.name}
                  </CardTitle>
                  <CardDescription>{game.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {game.minBet > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Min Bet:</span>
                        <span className="text-accent">💰 {game.minBet}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Max Bet:</span>
                        <span className="text-accent">💰 {game.maxBet}</span>
                      </div>
                    </>
                  )}
                  {game.id === "trivia" && (
                    <div className="text-sm text-center">
                      <div className="text-accent">Questions: 100+</div>
                      <div className="text-muted-foreground">Various difficulties</div>
                    </div>
                  )}
                  <Button 
                    className={`w-full font-comic bg-${game.color} text-${game.color}-foreground hover:bg-${game.color}/80`}
                    data-testid={`button-play-${game.id}`}
                  >
                    PLAY NOW!
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{selectedGame?.icon}</div>
                <div>
                  <h2 className="font-impact text-2xl text-primary">{selectedGame?.name}</h2>
                  <p className="text-muted-foreground">{selectedGame?.description}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveGame(null)}
                data-testid="button-back-to-games"
              >
                ← Back to Games
              </Button>
            </div>
            
            {selectedGame && <selectedGame.component />}
          </div>
        )}

        {/* User Game Stats */}
        <Card data-testid="game-stats">
          <CardHeader>
            <CardTitle className="font-impact text-2xl text-primary">🏆 Your Game Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl mb-2">🃏</div>
                <div className="font-bold text-primary">Blackjack</div>
                <div className="text-sm text-muted-foreground">
                  W: {user.gameStats?.blackjackWins || 0} / L: {user.gameStats?.blackjackLosses || 0}
                </div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl mb-2">🎰</div>
                <div className="font-bold text-secondary">Slots</div>
                <div className="text-sm text-muted-foreground">
                  W: {user.gameStats?.slotsWins || 0} / L: {user.gameStats?.slotsLosses || 0}
                </div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl mb-2">🪙</div>
                <div className="font-bold text-accent">Coinflip</div>
                <div className="text-sm text-muted-foreground">
                  W: {user.gameStats?.coinflipWins || 0} / L: {user.gameStats?.coinflipLosses || 0}
                </div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl mb-2">🧠</div>
                <div className="font-bold text-primary">Trivia</div>
                <div className="text-sm text-muted-foreground">
                  W: {user.gameStats?.triviaWins || 0} / L: {user.gameStats?.triviaLosses || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
