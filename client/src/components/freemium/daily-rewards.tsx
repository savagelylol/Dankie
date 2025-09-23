import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gift, Clock } from "lucide-react";

export default function DailyRewards() {
  const [claiming, setClaiming] = useState(false);
  const { toast } = useToast();

  const { data: nextClaimTime = 0 } = useQuery({
    queryKey: ["/api/freemium/next"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/freemium/next");
      const data = await res.json();
      return data.nextClaimTime;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/freemium/claim");
      return res.json();
    },
    onSuccess: (data) => {
      setClaiming(true);
      
      // Show reward with delay for excitement
      setTimeout(() => {
        setClaiming(false);
        let title = "Daily Reward Claimed! 🎁";
        let description = "";
        
        switch (data.type) {
          case 'coins':
            title = "Coin Reward! 💰";
            description = `You received ${data.amount} coins!`;
            break;
          case 'item':
            title = `${data.rarity.charAt(0).toUpperCase() + data.rarity.slice(1)} Item! ✨`;
            description = `You received a ${data.item.name}!`;
            break;
          case 'lootbox':
            title = "Lootbox Reward! 📦";
            description = `You received a ${data.item.name} with ${data.lootboxContents.length} items inside!`;
            break;
        }
        
        toast({
          title,
          description,
        });
        
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/freemium/next"] });
        
        // Confetti effect
        createConfetti();
      }, 2000);
    },
    onError: (error: Error) => {
      setClaiming(false);
      toast({
        title: "Claim Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createConfetti = () => {
    for (let i = 0; i < 100; i++) {
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

  const formatTimeRemaining = (milliseconds: number) => {
    if (milliseconds <= 0) return "Ready!";
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const canClaim = nextClaimTime <= 0;
  const timeRemaining = formatTimeRemaining(nextClaimTime);

  return (
    <Card className="bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform glow-primary" data-testid="daily-rewards-card">
      <CardContent className="p-4 text-center">
        <div className="flex items-center justify-center mb-2">
          <Gift className="mr-1 text-2xl" />
          {claiming && (
            <div className="animate-spin ml-2">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
        
        <h3 className="font-comic font-bold text-primary-foreground">
          {claiming ? "Opening..." : "Daily Reward"}
        </h3>
        
        {claiming ? (
          <div className="space-y-2 mt-2">
            <div className="text-4xl animate-bounce">🎁</div>
            <Progress value={50} className="h-2 bg-white/20" />
            <p className="text-sm text-primary-foreground/80">
              Generating your reward...
            </p>
          </div>
        ) : (
          <>
            {canClaim ? (
              <Button
                onClick={() => claimMutation.mutate()}
                disabled={claimMutation.isPending || claiming}
                className="mt-2 w-full bg-transparent hover:bg-white/20 border border-white/30"
                size="sm"
                data-testid="button-claim-daily"
              >
                <Gift className="w-4 h-4 mr-1" />
                CLAIM NOW!
              </Button>
            ) : (
              <div className="mt-2 space-y-2">
                <Badge variant="secondary" className="bg-white/20 text-primary-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  {timeRemaining}
                </Badge>
                <p className="text-xs text-primary-foreground/80">
                  Next reward available
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
