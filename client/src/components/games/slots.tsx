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

export default function Slots() {
  const [bet, setBet] = useState(100);
  const [gameResult, setGameResult] = useState<any>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const playMutation = useMutation({
    mutationFn: async (betAmount: number) => {
      const res = await apiRequest("POST", "/api/games/slots", { bet: betAmount });
      return res.json();
    },
    onSuccess: (data) => {
      // Add spinning animation delay
      setIsSpinning(true);
      setTimeout(() => {
        setIsSpinning(false);
        setGameResult(data);
        toast({
          title: data.win ? "Slots Win! 🎰" : "Slots Loss 😔",
          description: `${data.reels.join(' ')} - ${data.win ? `${data.multiplier}x multiplier!` : 'Better luck next time!'}`,
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
      setIsSpinning(false);
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

    setGameResult(null);
    playMutation.mutate(bet);
  };

  const quickBets = [10, 50, 100, 500, 1000];
  const symbols = ['🐸', '💎', '🚀', '💰', '🔥'];

  return (
    <div className="space-y-6">
      <Card className="glow-secondary border-secondary/20">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🎰</div>
          <CardTitle className="font-impact text-3xl text-secondary">MEME SLOTS</CardTitle>
          <CardDescription>Spin the reels and match the meme symbols!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Slot Machine Display */}
          <Card className="bg-muted p-6">
            <div className="flex justify-center space-x-4 mb-6">
              {(isSpinning ? ['❓', '❓', '❓'] : (gameResult?.reels || ['🐸', '💎', '🚀'])).map((symbol, index) => (
                <div
                  key={index}
                  className={`w-20 h-20 bg-background border-2 border-primary rounded-lg flex items-center justify-center text-4xl ${
                    isSpinning ? 'animate-spin' : ''
                  }`}
                  data-testid={`slot-reel-${index}`}
                >
                  {symbol}
                </div>
              ))}
            </div>
            
            {/* Symbol Payouts */}
            <div className="grid grid-cols-5 gap-2 text-center text-sm mb-4">
              {symbols.map((symbol, index) => (
                <div key={symbol} className="space-y-1">
                  <div className="text-2xl">{symbol}</div>
                  <div className="text-xs text-muted-foreground">
                    {symbol === '💰' ? '50x' : symbol === '💎' ? '25x' : symbol === '🚀' ? '15x' : symbol === '🔥' ? '10x' : '5x'}
                  </div>
                </div>
              ))}
            </div>
          </Card>

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
                data-testid="input-slots-bet"
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
              disabled={playMutation.isPending || isSpinning || !user || user.coins < bet}
              className="w-full font-comic text-lg bg-secondary hover:bg-secondary/80 glow-secondary"
              data-testid="button-spin-slots"
            >
              {isSpinning ? "SPINNING..." : playMutation.isPending ? "Loading..." : `SPIN! (${bet} coins)`}
            </Button>
          </form>

          {/* Game Result */}
          {gameResult && !isSpinning && (
            <Card className={`${gameResult.win ? 'border-green-500 glow-accent' : 'border-destructive'}`}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">
                  {gameResult.win ? "🎉" : "😔"}
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${gameResult.win ? 'text-green-500' : 'text-destructive'}`}>
                  {gameResult.win ? "JACKPOT!" : "NO MATCH!"}
                </h3>
                <div className="flex justify-center space-x-2 text-3xl mb-4">
                  {gameResult.reels.map((symbol: string, index: number) => (
                    <span key={index} className="p-2 bg-muted rounded">
                      {symbol}
                    </span>
                  ))}
                </div>
                {gameResult.win && (
                  <Badge variant="default" className="text-lg px-4 py-2 mb-2">
                    {gameResult.multiplier}x Multiplier!
                  </Badge>
                )}
                <p className={`text-lg font-semibold ${gameResult.win ? 'text-green-500' : 'text-destructive'}`}>
                  {gameResult.win ? '+' : ''}{gameResult.amount} coins
                </p>
                <p className="text-muted-foreground">
                  New Balance: {gameResult.newBalance.toLocaleString()} coins
                </p>
                <Button
                  onClick={() => setGameResult(null)}
                  className="mt-4 font-comic"
                  data-testid="button-play-again-slots"
                >
                  Spin Again
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
              <p>• Match 3 symbols to win</p>
              <p>• Different symbols have different multipliers</p>
              <p>• 💰 = 50x, 💎 = 25x, 🚀 = 15x, 🔥 = 10x, 🐸 = 5x</p>
              <p>• Two matching symbols = 2x multiplier</p>
              <p>• Bet between 10 and 10,000 coins</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
