import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Banknote, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

export default function Bank() {
  const [amount, setAmount] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const depositMutation = useMutation({
    mutationFn: async (depositAmount: number) => {
      const res = await apiRequest("POST", "/api/economy/deposit", { amount: depositAmount });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Deposit Successful! 🏦",
        description: `Deposited ${amount} coins to your bank!`,
      });
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Deposit Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (withdrawAmount: number) => {
      const res = await apiRequest("POST", "/api/economy/withdraw", { amount: withdrawAmount });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Withdrawal Successful! 💰",
        description: `Withdrew ${amount} coins from your bank! Fee: ${data.fee} coins`,
      });
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const depositAmount = parseInt(amount);
    
    if (!depositAmount || depositAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to deposit",
        variant: "destructive",
      });
      return;
    }

    depositMutation.mutate(depositAmount);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseInt(amount);
    
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to withdraw",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate(withdrawAmount);
  };

  if (!user) return null;

  const bankUsagePercent = ((user.bank || 0) / (user.bankCapacity || 10000)) * 100;

  return (
    <Card className="border-primary/20" data-testid="bank-card">
      <CardHeader>
        <CardTitle className="font-impact text-2xl text-primary flex items-center">
          <Banknote className="mr-2" />
          🏦 MEME BANK
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bank Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg" data-testid="bank-balance">
            <div className="text-accent font-bold text-lg">
              💰 {(user.bank || 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Bank Balance</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg" data-testid="bank-capacity">
            <div className="text-secondary font-bold text-lg">
              💰 {(user.bankCapacity || 10000).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Capacity</div>
          </div>
        </div>

        {/* Bank Usage Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Bank Usage</span>
            <span className="text-xs text-muted-foreground">
              {bankUsagePercent.toFixed(1)}%
            </span>
          </div>
          <Progress value={bankUsagePercent} className="h-2" />
        </div>
        
        {/* Banking Interface */}
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank-amount">Amount</Label>
            <Input
              id="bank-amount"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="text-center"
              data-testid="input-bank-amount"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              onClick={handleDeposit}
              disabled={depositMutation.isPending || !amount || parseInt(amount) <= 0 || parseInt(amount) > (user.coins || 0)}
              className="font-comic bg-primary text-primary-foreground hover:bg-primary/80"
              data-testid="button-deposit"
            >
              <ArrowDownToLine className="w-4 h-4 mr-1" />
              {depositMutation.isPending ? "Depositing..." : "DEPOSIT"}
            </Button>
            <Button
              type="button"
              onClick={handleWithdraw}
              disabled={withdrawMutation.isPending || !amount || parseInt(amount) <= 0 || parseInt(amount) > (user.bank || 0)}
              className="font-comic bg-secondary text-secondary-foreground hover:bg-secondary/80"
              data-testid="button-withdraw"
            >
              <ArrowUpFromLine className="w-4 h-4 mr-1" />
              {withdrawMutation.isPending ? "Withdrawing..." : "WITHDRAW"}
            </Button>
          </div>
          
          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setAmount("100")}
              className="text-xs"
              data-testid="button-quick-100"
            >
              100
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setAmount("1000")}
              className="text-xs"
              data-testid="button-quick-1000"
            >
              1K
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setAmount("10000")}
              className="text-xs"
              data-testid="button-quick-10000"
            >
              10K
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setAmount(user?.coins?.toString() || "0")}
              className="text-xs"
              data-testid="button-quick-all"
            >
              All
            </Button>
          </div>
        </form>
        
        {/* Bank Info */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>💰 Daily Interest: 0.5%</p>
          <p>⚠️ Withdrawal Fee: 1%</p>
          <p>🔒 Secure storage for your coins</p>
        </div>
      </CardContent>
    </Card>
  );
}
