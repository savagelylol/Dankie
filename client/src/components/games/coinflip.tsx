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

export default function Coinflip() {
  const [bet, setBet] = useState(100);
  const [choice, setChoice] = useState<'heads' | 'tails' | null>(null);
  const [gameResult, setGameResult] = useState<any>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const playMutation = useMutation({
    mutationFn: async ({ betAmount, selectedChoice }: { betAmount: number; selectedChoice: 'heads' | 'tails' }) => {
      const res = await apiRequest("POST", "/api/games/coinflip", { bet: betAmount, choice: selectedChoice });
      return res.json();
    },
    onSuccess: (data) => {
      // Add flipping animation delay
      setIsFlipping(true);
      setTimeout(() => {
        setIsFlipping(false);
        setGameResult(data);
        toast({
          title: data.win ? "Coinflip Win! 🪙" : "Coinflip Loss 😔",
          description: `The coin landed on ${data.result}! You ${data.win ? 'won' : 'lost'} ${Math.abs(data.amount)} coins!`,
          variant: data.win ? "default" : "destructive",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        
        // Confetti effect for wins
        if (data.win) {
          createConfetti();
        }
      }, 2000);
    },
    onError: (error: Error) => {
      setIsFlipping(false);
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

  const handleFlip = () => {
    if (!choice) {
      toast({
        title: "Choose Your Side",
        description: "Select heads or tails before flipping",
        variant: "destructive",
      });
      return;
    }

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

    setGameResult(null);
    playMutation.mutate({ betAmount: bet, selectedChoice: choice });
  };

  const quickBets = [10, 50, 100, 500, 1000];

  return (
    <div className="space-y-6">
      <Card className="glow-accent border-accent/20">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4 animate-bounce-slow">🪙</div>
          <CardTitle className="font-impact text-3xl text-accent">COINFLIP</CardTitle>
          <CardDescription>Call it in the air - heads or tails?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Coin Display */}
          <Card className="bg-muted p-6">
            <div className="flex justify-center mb-6">
              <div
                className={`w-32 h-32 rounded-full border-4 border-accent flex items-center justify-center text-6xl bg-gradient-to-br from-yellow-400 to-yellow-600 ${
                  isFlipping ? 'animate-spin' : ''
                }`}
                data-testid="coin-display"
              >
                {isFlipping ? '🪙' : (gameResult ? (gameResult.result === 'heads' ? '👑' : '🎯') : '🪙')}
              </div>
            </div>
            
            {gameResult && !isFlipping && (
              <div className="text-center">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Result: {gameResult.result.toUpperCase()}
                </Badge>
              </div>
            )}
          </Card>

          {/* Choice Selection */}
          <div className="space-y-4">
            <Label className="text-center block text-lg font-semibold">Choose Your Side</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={choice === 'heads' ? 'default' : 'outline'}
                onClick={() => setChoice('heads')}
                className="h-20 font-comic text-lg bg-primary hover:bg-primary/80"
                disabled={isFlipping || playMutation.isPending}
                data-testid="button-choose-heads"
              >
                <div className="text-center">
                  <div className="text-3xl">👑</div>
                  <div>HEADS</div>
                </div>
              </Button>
              <Button
                variant={choice === 'tails' ? 'default' : 'outline'}
                onClick={() => setChoice('tails')}
                className="h-20 font-comic text-lg bg-secondary hover:bg-secondary/80"
                disabled={isFlipping || playMutation.isPending}
                data-testid="button-choose-tails"
              >
                <div className="text-center">
                  <div className="text-3xl">🎯</div>
                  <div>TAILS</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Betting Interface */}
          <div className="space-y-4">
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
                data-testid="input-coinflip-bet"
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

            <div className="text-center text-sm text-muted-foreground mb-4">
              <p>Payout: 1.95x (Win {Math.floor(bet * 0.95)} coins)</p>
            </div>

            <Button
              onClick={handleFlip}
              disabled={!choice || isFlipping || playMutation.isPending || !user || user.coins < bet}
              className="w-full font-comic text-lg bg-accent hover:bg-accent/80 glow-accent"
              data-testid="button-flip-coin"
            >
              {isFlipping ? "FLIPPING..." : playMutation.isPending ? "Loading..." : `FLIP COIN! (${bet} coins)`}
            </Button>
          </div>

          {/* Game Result */}
          {gameResult && !isFlipping && (
            <Card className={`${gameResult.win ? 'border-green-500 glow-accent' : 'border-destructive'}`}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">
                  {gameResult.win ? "🎉" : "😔"}
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${gameResult.win ? 'text-green-500' : 'text-destructive'}`}>
                  {gameResult.win ? "YOU WIN!" : "YOU LOSE!"}
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-center items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl">{gameResult.choice === 'heads' ? '👑' : '🎯'}</div>
                      <div className="text-sm text-muted-foreground">Your Choice</div>
                      <div className="font-semibold">{gameResult.choice.toUpperCase()}</div>
                    </div>
                    <div className="text-2xl">vs</div>
                    <div className="text-center">
                      <div className="text-2xl">{gameResult.result === 'heads' ? '👑' : '🎯'}</div>
                      <div className="text-sm text-muted-foreground">Result</div>
                      <div className="font-semibold">{gameResult.result.toUpperCase()}</div>
                    </div>
                  </div>
                </div>
                <p className={`text-lg font-semibold ${gameResult.win ? 'text-green-500' : 'text-destructive'}`}>
                  {gameResult.win ? '+' : ''}{gameResult.amount} coins
                </p>
                <p className="text-muted-foreground">
                  New Balance: {gameResult.newBalance.toLocaleString()} coins
                </p>
                <Button
                  onClick={() => {
                    setGameResult(null);
                    setChoice(null);
                  }}
                  className="mt-4 font-comic"
                  data-testid="button-play-again-coinflip"
                >
                  Flip Again
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
              <p>• Choose heads (👑) or tails (🎯)</p>
              <p>• Place your bet (10 to 10,000 coins)</p>
              <p>• Win: 1.95x payout (small house edge)</p>
              <p>• Simple 50/50 chance game</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
