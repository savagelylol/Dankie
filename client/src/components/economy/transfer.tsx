import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Send, Sword } from "lucide-react";

export default function Transfer() {
  const [transferData, setTransferData] = useState({
    username: "",
    amount: "",
    message: ""
  });
  const [robData, setRobData] = useState({
    username: "",
    amount: ""
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const transferMutation = useMutation({
    mutationFn: async (data: { targetUsername: string; amount: number; message?: string }) => {
      const res = await apiRequest("POST", "/api/economy/transfer", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Transfer Successful! 💸",
        description: `Sent ${data.sent} coins to ${transferData.username}${data.fee > 0 ? ` (Fee: ${data.fee} coins)` : ''}`,
      });
      setTransferData({ username: "", amount: "", message: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Transfer Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const robMutation = useMutation({
    mutationFn: async (data: { targetUsername: string; betAmount: number }) => {
      const res = await apiRequest("POST", "/api/economy/rob", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? "Rob Successful! 💰" : "Rob Failed! 💸",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
      setRobData({ username: "", amount: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Confetti for successful robs
      if (data.success) {
        createConfetti();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Rob Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createConfetti = () => {
    for (let i = 0; i < 30; i++) {
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

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(transferData.amount);
    
    if (!transferData.username || !amount || amount < 10) {
      toast({
        title: "Invalid Transfer",
        description: "Please enter a valid username and amount (minimum 10 coins)",
        variant: "destructive",
      });
      return;
    }

    transferMutation.mutate({
      targetUsername: transferData.username,
      amount,
      message: transferData.message || undefined
    });
  };

  const handleRob = (e: React.FormEvent) => {
    e.preventDefault();
    const betAmount = parseInt(robData.amount);
    
    if (!robData.username || !betAmount || betAmount <= 0) {
      toast({
        title: "Invalid Rob",
        description: "Please enter a valid username and bet amount",
        variant: "destructive",
      });
      return;
    }

    const maxBet = Math.floor((user?.coins || 0) * 0.2);
    if (betAmount > maxBet) {
      toast({
        title: "Bet Too High",
        description: `Maximum bet is 20% of your coins (${maxBet.toLocaleString()} coins)`,
        variant: "destructive",
      });
      return;
    }

    robMutation.mutate({
      targetUsername: robData.username,
      betAmount
    });
  };

  if (!user) return null;

  const maxRobBet = Math.floor((user?.coins || 0) * 0.2);

  return (
    <Card className="border-secondary/20" data-testid="transfer-card">
      <CardHeader>
        <CardTitle className="font-impact text-2xl text-secondary flex items-center">
          <Send className="mr-2" />
          💸 TRANSFERS & HEISTS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Transfer Section */}
        <div className="space-y-4">
          <h4 className="font-bold text-accent flex items-center">
            <Send className="w-4 h-4 mr-2" />
            Send Coins
          </h4>
          <form onSubmit={handleTransfer} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="transfer-username">Username</Label>
              <Input
                id="transfer-username"
                value={transferData.username}
                onChange={(e) => setTransferData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter recipient's username"
                data-testid="input-transfer-username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transfer-amount">Amount</Label>
              <Input
                id="transfer-amount"
                type="number"
                min="10"
                value={transferData.amount}
                onChange={(e) => setTransferData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Minimum 10 coins"
                data-testid="input-transfer-amount"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transfer-message">Message (Optional)</Label>
              <Textarea
                id="transfer-message"
                value={transferData.message}
                onChange={(e) => setTransferData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Add a message with your transfer"
                rows={2}
                data-testid="input-transfer-message"
              />
            </div>
            
            <Button
              type="submit"
              disabled={transferMutation.isPending || !transferData.username || parseInt(transferData.amount) < 10}
              className="w-full font-comic bg-accent text-accent-foreground hover:bg-accent/80"
              data-testid="button-send-transfer"
            >
              {transferMutation.isPending ? "Sending..." : "SEND COINS"}
            </Button>
          </form>
          
          <div className="text-xs text-muted-foreground text-center">
            💡 Fee: 5% for transfers over 1,000 coins
          </div>
        </div>
        
        <Separator />
        
        {/* Rob Section */}
        <div className="space-y-4">
          <h4 className="font-bold text-destructive flex items-center">
            <Sword className="w-4 h-4 mr-2" />
            Rob User
          </h4>
          <form onSubmit={handleRob} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="rob-username">Target Username</Label>
              <Input
                id="rob-username"
                value={robData.username}
                onChange={(e) => setRobData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter target username"
                data-testid="input-rob-username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rob-amount">Bet Amount</Label>
              <Input
                id="rob-amount"
                type="number"
                min="1"
                max={maxRobBet}
                value={robData.amount}
                onChange={(e) => setRobData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder={`Max: ${maxRobBet.toLocaleString()} coins (20%)`}
                data-testid="input-rob-amount"
              />
            </div>
            
            <Button
              type="submit"
              disabled={robMutation.isPending || !robData.username || parseInt(robData.amount) <= 0}
              className="w-full font-comic bg-destructive text-destructive-foreground hover:bg-destructive/80"
              data-testid="button-rob-user"
            >
              {robMutation.isPending ? "Robbing..." : "ROB USER! 💀"}
            </Button>
          </form>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>⚠️ Rob success based on level difference and items</p>
            <p>💀 Failed robs result in fines</p>
            <p>⏰ 2 hour cooldown between rob attempts</p>
            <p>🎯 You can bet up to 20% of your coins</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
