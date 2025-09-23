import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, Briefcase, Search, DollarSign, Skull, Target, Pickaxe, Smartphone, TrendingUp, Gamepad2, Ticket } from "lucide-react";

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

  const crimeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/economy/crime");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? "Crime Success! 🦹" : "Crime Failed! 🚔",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Crime Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const huntMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/economy/hunt");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Hunt Success! 🏹",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Hunt Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const digMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/economy/dig");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Dig Success! ⛏️",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Dig Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const postmemeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/economy/postmeme");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Meme Posted! 📱",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Post Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const streamMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/economy/stream");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Stream Complete! 📺",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Stream Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const scratchMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/economy/scratch");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? "Scratch Win! 🎫✨" : "Scratch Loss! 🎫💸",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Scratch Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Highlow form schema
  const highlowSchema = z.object({
    guess: z.enum(['higher', 'lower']),
    betAmount: z.number().min(10, "Minimum bet is 10 coins").max(100000, "Maximum bet is 100,000 coins")
  });

  const highlowForm = useForm<z.infer<typeof highlowSchema>>({
    resolver: zodResolver(highlowSchema),
    defaultValues: {
      guess: 'higher',
      betAmount: 50
    }
  });

  const highlowMutation = useMutation({
    mutationFn: async (data: z.infer<typeof highlowSchema>) => {
      const res = await apiRequest("POST", "/api/economy/highlow", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? "Highlow Win! 🎯" : "Highlow Loss! 📉",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      highlowForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Highlow Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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

              <Card className="bg-gradient-to-r from-red-500 to-red-700 hover:scale-105 transition-transform glow-red">
                <CardContent className="p-4 text-center">
                  <Skull className="mx-auto mb-2 text-2xl text-white" />
                  <h3 className="font-comic font-bold text-white">Crime</h3>
                  <Button
                    onClick={() => crimeMutation.mutate()}
                    disabled={crimeMutation.isPending}
                    className="mt-2 w-full bg-transparent hover:bg-white/20"
                    size="sm"
                    data-testid="button-crime"
                  >
                    {crimeMutation.isPending ? "Committing..." : "Crime Now!"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-600 to-green-800 hover:scale-105 transition-transform glow-green">
                <CardContent className="p-4 text-center">
                  <Target className="mx-auto mb-2 text-2xl text-white" />
                  <h3 className="font-comic font-bold text-white">Hunt</h3>
                  <Button
                    onClick={() => huntMutation.mutate()}
                    disabled={huntMutation.isPending}
                    className="mt-2 w-full bg-transparent hover:bg-white/20"
                    size="sm"
                    data-testid="button-hunt"
                  >
                    {huntMutation.isPending ? "Hunting..." : "Hunt Now!"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:scale-105 transition-transform glow-yellow">
                <CardContent className="p-4 text-center">
                  <Pickaxe className="mx-auto mb-2 text-2xl text-white" />
                  <h3 className="font-comic font-bold text-white">Dig</h3>
                  <Button
                    onClick={() => digMutation.mutate()}
                    disabled={digMutation.isPending}
                    className="mt-2 w-full bg-transparent hover:bg-white/20"
                    size="sm"
                    data-testid="button-dig"
                  >
                    {digMutation.isPending ? "Digging..." : "Dig Now!"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-transform glow-purple">
                <CardContent className="p-4 text-center">
                  <Smartphone className="mx-auto mb-2 text-2xl text-white" />
                  <h3 className="font-comic font-bold text-white">Post Meme</h3>
                  <Button
                    onClick={() => postmemeMutation.mutate()}
                    disabled={postmemeMutation.isPending}
                    className="mt-2 w-full bg-transparent hover:bg-white/20"
                    size="sm"
                    data-testid="button-postmeme"
                  >
                    {postmemeMutation.isPending ? "Posting..." : "Post Meme!"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 transition-transform glow-blue">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="mx-auto mb-2 text-2xl text-white" />
                  <h3 className="font-comic font-bold text-white">Stream</h3>
                  <Button
                    onClick={() => streamMutation.mutate()}
                    disabled={streamMutation.isPending}
                    className="mt-2 w-full bg-transparent hover:bg-white/20"
                    size="sm"
                    data-testid="button-stream"
                  >
                    {streamMutation.isPending ? "Streaming..." : "Stream Now!"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-red-500 hover:scale-105 transition-transform glow-orange">
                <CardContent className="p-4 text-center">
                  <Ticket className="mx-auto mb-2 text-2xl text-white" />
                  <h3 className="font-comic font-bold text-white">Scratch</h3>
                  <Button
                    onClick={() => scratchMutation.mutate()}
                    disabled={scratchMutation.isPending}
                    className="mt-2 w-full bg-transparent hover:bg-white/20"
                    size="sm"
                    data-testid="button-scratch"
                  >
                    {scratchMutation.isPending ? "Scratching..." : "Scratch Now!"}
                  </Button>
                </CardContent>
              </Card>

              <Dialog>
                <DialogTrigger asChild>
                  <Card className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:scale-105 transition-transform glow-cyan cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="mx-auto mb-2 text-2xl text-white" />
                      <h3 className="font-comic font-bold text-white">High-Low</h3>
                      <Button
                        className="mt-2 w-full bg-transparent hover:bg-white/20"
                        size="sm"
                        data-testid="button-highlow"
                      >
                        Play Now!
                      </Button>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>High-Low Game 🎯</DialogTitle>
                    <DialogDescription>
                      Guess if the next number (1-100) will be higher or lower than the current number!
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...highlowForm}>
                    <form onSubmit={highlowForm.handleSubmit((data) => highlowMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={highlowForm.control}
                        name="betAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bet Amount (coins)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="50"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                data-testid="input-bet-amount"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={highlowForm.control}
                        name="guess"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Guess</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-guess">
                                  <SelectValue placeholder="Choose your guess" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="higher">Higher ⬆️</SelectItem>
                                <SelectItem value="lower">Lower ⬇️</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        disabled={highlowMutation.isPending}
                        className="w-full"
                        data-testid="button-place-bet"
                      >
                        {highlowMutation.isPending ? "Playing..." : "Place Bet!"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
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
