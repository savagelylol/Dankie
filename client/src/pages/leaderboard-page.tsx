import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function LeaderboardPage() {
  const { user } = useAuth();
  
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/leaderboard?limit=50");
      return res.json();
    },
  });

  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);
  const userRank = leaderboard.findIndex((player: any) => player.username === user?.username) + 1;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈"; 
      case 3: return "🥉";
      default: return "🏅";
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "from-accent to-primary";
      case 2: return "from-muted to-secondary";
      case 3: return "from-accent/50 to-muted";
      default: return "from-muted to-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-8">
        <div className="text-center">
          <h1 className="font-impact text-4xl text-accent mb-2" data-testid="leaderboard-title">
            🏆 LEADERBOARD 🏆
          </h1>
          <p className="text-muted-foreground text-lg">
            See who's dominating the meme economy!
          </p>
          {userRank > 0 && (
            <div className="mt-4">
              <Badge variant="outline" className="text-lg px-4 py-2" data-testid="user-rank">
                Your Rank: #{userRank}
              </Badge>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12" data-testid="empty-leaderboard">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-muted-foreground mb-2">No rankings yet</h3>
            <p className="text-muted-foreground">Be the first to claim the throne!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top 3 Podium */}
            <div className="lg:col-span-1">
              <Card className="glow-accent">
                <CardHeader>
                  <CardTitle className="font-impact text-2xl text-center text-primary">
                    👑 TOP 3 MEMERS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topThree.map((player: any, index: number) => (
                    <Card 
                      key={player.username}
                      className={`bg-gradient-to-r ${getRankColor(index + 1)} p-4 ${index === 0 ? 'glow-accent' : ''}`}
                      data-testid={`top-player-${index + 1}`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{getRankIcon(index + 1)}</div>
                        <div className="font-bold text-lg text-primary-foreground">
                          {player.username}
                        </div>
                        <div className="text-primary-foreground/80">
                          💰 {player.coins.toLocaleString()}
                        </div>
                        <Badge variant="secondary" className="mt-2">
                          Level {player.level}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Full Rankings */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-impact text-2xl text-secondary">
                    📊 FULL RANKINGS
                  </CardTitle>
                  <CardDescription>
                    Rankings based on total net worth (coins + bank balance)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto" data-testid="full-leaderboard">
                    {/* Show top 3 again for mobile */}
                    <div className="lg:hidden space-y-2">
                      {topThree.map((player: any, index: number) => (
                        <div 
                          key={player.username}
                          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                            player.username === user?.username ? 'bg-primary/20 border border-primary' : 'bg-muted hover:bg-muted/80'
                          }`}
                          data-testid={`player-rank-${index + 1}`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{getRankIcon(index + 1)}</span>
                              <Badge variant="secondary" className="font-bold">
                                #{index + 1}
                              </Badge>
                            </div>
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                                {player.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className={`font-bold ${player.username === user?.username ? 'text-primary' : 'text-foreground'}`}>
                                {player.username}
                                {player.username === user?.username && (
                                  <Badge variant="outline" className="ml-2">YOU</Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">Level {player.level}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-accent">
                              💰 {player.coins.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">Net Worth</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Rest of rankings */}
                    {restOfLeaderboard.map((player: any, index: number) => (
                      <div 
                        key={player.username}
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                          player.username === user?.username ? 'bg-primary/20 border border-primary' : 'bg-muted hover:bg-muted/80'
                        }`}
                        data-testid={`player-rank-${index + 4}`}
                      >
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className="font-bold w-12 justify-center">
                            #{index + 4}
                          </Badge>
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">
                              {player.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className={`font-bold ${player.username === user?.username ? 'text-primary' : 'text-foreground'}`}>
                              {player.username}
                              {player.username === user?.username && (
                                <Badge variant="outline" className="ml-2">YOU</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">Level {player.level}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-accent">
                            💰 {player.coins.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">Net Worth</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
