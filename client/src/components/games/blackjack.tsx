import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function Blackjack() {
  const [bet, setBet] = useState(100);
  const [gameResult, setGameResult] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const playMutation = useMutation({
    mutationFn: async (betAmount: number) => {
      const res = await apiRequest("POST", "/api/games/blackjack", { bet: betAmount });
      return res.json();
    },
    onSuccess: (data) => {
      setGameResult(data);
      toast({
        title: data.win ? "Blackjack Win! 🃏" : "Blackjack Loss 😔",
        description: `You ${data.win ? 'won' : 'lost'} ${Math.abs(data.amount)} coins!`,
        variant: data.win ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Confetti effect for wins
      if (data.win) {
        createConfetti();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Game Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createConfetti = () => {
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 3 + 's';
      confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, 3000);
    }
  };

  const handlePlay = (e: React.FormEvent) => {
    e.preventDefault();
    if (bet < 10 || bet > 10000) {
      toast({
        title: "Invalid Bet",
        description: "Bet must be between 10 and 10,000 coins",
        variant: "destructive",
      });
      return;
    }
    
    if (!user || user.coins < bet) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough coins for this bet",
        variant: "destructive",
      });
      return;
    }

    playMutation.mutate(bet);
  };

  const quickBets = [10, 50, 100, 500, 1000];

  return (
    <div className="space-y-6">
      <Card className="glow-primary border-primary/20">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🃏</div>
          <CardTitle className="font-impact text-3xl text-primary">BLACKJACK</CardTitle>
          <CardDescription>Beat the dealer and win big!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Betting Interface */}
          <form onSubmit={handlePlay} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bet-amount">Bet Amount</Label>
              <Input
                id="bet-amount"
                type="number"
                min="10"
                max="10000"
                value={bet}
                onChange={(e) => setBet(Number(e.target.value))}
                className="text-center text-lg font-bold"
                data-testid="input-blackjack-bet"
              />
              <div className="flex justify-center space-x-2">
                {quickBets.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setBet(amount)}
                    className="font-comic"
                    data-testid={`button-quick-bet-${amount}`}
                  >
                    {amount}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={playMutation.isPending || !user || user.coins < bet}
              className="w-full font-comic text-lg bg-primary hover:bg-primary/80 glow-primary"
              data-testid="button-play-blackjack"
            >
              {playMutation.isPending ? "Dealing..." : `HIT ME! (${bet} coins)`}
            </Button>
          </form>

          {/* Game Result */}
          {gameResult && (
            <Card className={`${gameResult.win ? 'border-green-500 glow-accent' : 'border-destructive'}`}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">
                  {gameResult.win ? "🎉" : "😔"}
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${gameResult.win ? 'text-green-500' : 'text-destructive'}`}>
                  {gameResult.win ? "YOU WIN!" : "YOU LOSE!"}
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Your Hand:</span>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {gameResult.playerScore}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Dealer Hand:</span>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {gameResult.dealerScore}
                    </Badge>
                  </div>
                </div>
                <p className={`text-lg font-semibold ${gameResult.win ? 'text-green-500' : 'text-destructive'}`}>
                  {gameResult.win ? '+' : ''}{gameResult.amount} coins
                </p>
                <p className="text-muted-foreground">
                  New Balance: {gameResult.newBalance.toLocaleString()} coins
                </p>
                <Button
                  onClick={() => setGameResult(null)}
                  className="mt-4 font-comic"
                  data-testid="button-play-again-blackjack"
                >
                  Play Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Game Rules */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">How to Play</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Try to get as close to 21 as possible without going over</p>
              <p>• Beat the dealer's hand to win</p>
              <p>• Win: 1.95x payout (small house edge)</p>
              <p>• Bet between 10 and 10,000 coins</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
