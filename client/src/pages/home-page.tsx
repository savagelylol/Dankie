import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import DailyRewards from "@/components/freemium/daily-rewards";
import Bank from "@/components/economy/bank";
import Transfer from "@/components/economy/transfer";
import Chat from "@/components/social/chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Gift, Briefcase, Search, DollarSign } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/user/transactions"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/transactions?limit=10");
      return res.json();
    },
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["/api/leaderboard"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/leaderboard?limit=5");
      return res.json();
    },
  });

  const workMutation = useMutation({
    mutationFn: async (jobType: string) => {
      const res = await apiRequest("POST", "/api/economy/work", { jobType });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: `Work Complete! 💼`,
        description: `You earned ${data.coins} coins as a ${data.job}!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Work Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const begMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/economy/beg");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? "Begging Success! 🥺" : "Begging Failed 😔",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Begging Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const searchMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/economy/search");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Search Complete! 🔍",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  const levelProgress = (user.xp % (user.level * 1000)) / (user.level * 1000) * 100;
  const nextLevelXP = user.level * 1000;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Welcome Section */}
        <Card className="glow-primary border-primary/20" data-testid="welcome-card">
          <CardContent className="p-6 text-center">
            <h2 className="font-impact text-4xl text-primary mb-2" data-testid="welcome-title">
              Welcome back, <span className="text-accent">{user.username}</span>! 🚀
            </h2>
            <p className="text-muted-foreground text-lg mb-6">Ready to meme your way to riches? 💰</p>
            
            {/* Level Progress */}
            <div className="mb-6 max-w-md mx-auto" data-testid="level-progress">
              <div className="flex justify-between items-center mb-2">
                <span className="text-foreground font-semibold">Level Progress</span>
                <span className="text-muted-foreground text-sm">
                  {user.xp} / {nextLevelXP} XP
                </span>
              </div>
              <Progress value={levelProgress} className="h-3" />
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DailyRewards />
              
              <Card className="bg-gradient-to-r from-secondary to-primary hover:scale-105 transition-transform glow-secondary">
                <CardContent className="p-4 text-center">
                  <Briefcase className="mx-auto mb-2 text-2xl" />
                  <h3 className="font-comic font-bold text-secondary-foreground">Work</h3>
                  <Button
                    onClick={() => workMutation.mutate('meme-farmer')}
                    disabled={workMutation.isPending}
                    className="mt-2 w-full bg-transparent hover:bg-white/20"
                    size="sm"
                    data-testid="button-work"
                  >
                    {workMutation.isPending ? "Working..." : "Work Now!"}
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-accent to-secondary hover:scale-105 transition-transform glow-accent">
                <CardContent className="p-4 text-center">
                  <span className="text-2xl mb-2 block">🥺</span>
                  <h3 className="font-comic font-bold text-accent-foreground">Beg</h3>
                  <Button
                    onClick={() => begMutation.mutate()}
                    disabled={begMutation.isPending}
                    className="mt-2 w-full bg-transparent hover:bg-white/20"
                    size="sm"
                    data-testid="button-beg"
                  >
                    {begMutation.isPending ? "Begging..." : "Beg Now!"}
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-transform">
                <CardContent className="p-4 text-center">
                  <Search className="mx-auto mb-2 text-2xl" />
                  <h3 className="font-comic font-bold text-primary-foreground">Search</h3>
                  <Button
                    onClick={() => searchMutation.mutate()}
                    disabled={searchMutation.isPending}
                    className="mt-2 w-full bg-transparent hover:bg-white/20"
                    size="sm"
                    data-testid="button-search"
                  >
                    {searchMutation.isPending ? "Searching..." : "Search Now!"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Economy and Social Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Economy Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Bank />
              <Transfer />
            </div>
            
            {/* Recent Activity */}
            <Card data-testid="activity-feed">
              <CardHeader>
                <CardTitle className="font-impact text-2xl text-primary">💰 Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No recent activity</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {transactions.map((transaction: any, index: number) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg" data-testid={`transaction-${index}`}>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={transaction.type === 'earn' ? 'default' : 'destructive'}>
                          {transaction.type === 'earn' ? '+' : '-'}{transaction.amount} coins
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            {/* Leaderboard Preview */}
            <Card data-testid="leaderboard-preview">
              <CardHeader>
                <CardTitle className="font-impact text-xl text-accent">🏆 Top Players</CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Loading leaderboard...</p>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((player: any, index: number) => (
                      <div key={player.username} className="flex items-center justify-between" data-testid={`leaderboard-${index}`}>
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary">#{index + 1}</Badge>
                          <div>
                            <p className="font-bold text-foreground">{player.username}</p>
                            <p className="text-sm text-muted-foreground">Level {player.level}</p>
                          </div>
                        </div>
                        <p className="font-bold text-accent">{player.coins.toLocaleString()} coins</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Chat */}
            <Chat />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
