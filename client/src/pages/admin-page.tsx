import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Users, DollarSign, Settings, Command } from "lucide-react";

export default function AdminPage() {
  const [command, setCommand] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banReason, setBanReason] = useState("");
  const { toast } = useToast();

  // Check if user has admin access by trying to fetch users
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/users", undefined, {
        'admin-key': adminKey || localStorage.getItem('adminKey') || ''
      });
      return res.json();
    },
    enabled: !!adminKey || !!localStorage.getItem('adminKey'),
    retry: false,
  });

  const executeCommandMutation = useMutation({
    mutationFn: async (cmd: string) => {
      const res = await apiRequest("POST", "/api/admin/command", 
        { command: cmd, adminKey }, 
        { 'admin-key': adminKey }
      );
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Command Executed! ⚙️",
        description: data.message,
      });
      setCommand("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Command Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/ban`, 
        { reason }, 
        { 'admin-key': adminKey }
      );
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "User Banned! 🔨",
        description: "User has been banned successfully.",
      });
      setSelectedUser(null);
      setBanReason("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Ban Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAdminKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey) {
      localStorage.setItem('adminKey', adminKey);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    }
  };

  const handleExecuteCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      executeCommandMutation.mutate(command.trim());
    }
  };

  // Show admin key input if not authenticated
  if (!adminKey && !localStorage.getItem('adminKey')) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto border-destructive/20">
            <CardHeader className="text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <CardTitle className="font-impact text-2xl text-destructive">
                🔧 ADMIN ACCESS REQUIRED
              </CardTitle>
              <CardDescription>
                Enter the admin key to access the control panel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdminKeySubmit} className="space-y-4">
                <div>
                  <Label htmlFor="admin-key">Admin Key</Label>
                  <Input
                    id="admin-key"
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="Enter admin key"
                    data-testid="input-admin-key"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full font-comic bg-destructive hover:bg-destructive/80"
                  data-testid="button-submit-admin-key"
                >
                  🔓 ACCESS ADMIN PANEL
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error if authentication failed
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto border-destructive">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-bold text-destructive mb-2">Access Denied</h3>
              <p className="text-muted-foreground mb-4">Invalid admin key or insufficient permissions.</p>
              <Button 
                onClick={() => {
                  localStorage.removeItem('adminKey');
                  setAdminKey("");
                }}
                variant="outline"
                data-testid="button-try-again"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-8">
        <div className="text-center">
          <h1 className="font-impact text-4xl text-destructive mb-2" data-testid="admin-title">
            🔧 ADMIN PANEL 🔧
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage users, economy, and system settings
          </p>
          <Badge variant="destructive" className="mt-2">
            RESTRICTED ACCESS
          </Badge>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        ) : (
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users" data-testid="tab-users">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="economy" data-testid="tab-economy">
                <DollarSign className="w-4 h-4 mr-2" />
                Economy
              </TabsTrigger>
              <TabsTrigger value="system" data-testid="tab-system">
                <Settings className="w-4 h-4 mr-2" />
                System
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-impact text-2xl text-primary">👥 USER MANAGEMENT</CardTitle>
                  <CardDescription>
                    Manage user accounts, bans, and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary" data-testid="total-users">
                          {users.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Users</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-500" data-testid="active-users">
                          {users.filter((u: any) => !u.banned).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Active Users</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-destructive" data-testid="banned-users">
                          {users.filter((u: any) => u.banned).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Banned Users</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {users.map((user: any) => (
                      <div 
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        data-testid={`user-${user.id}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                            {user.username[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-foreground flex items-center space-x-2">
                              <span>{user.username}</span>
                              {user.banned && <Badge variant="destructive">BANNED</Badge>}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Level {user.level} • {user.coins.toLocaleString()} coins
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {user.email} • Joined {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!user.banned ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setSelectedUser(user)}
                              data-testid={`button-ban-${user.id}`}
                            >
                              Ban User
                            </Button>
                          ) : (
                            <div className="text-xs text-destructive">
                              Banned: {user.banReason}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ban User Modal */}
              {selectedUser && (
                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive">
                      Ban User: {selectedUser.username}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="ban-reason">Ban Reason</Label>
                      <Input
                        id="ban-reason"
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        placeholder="Enter reason for ban"
                        data-testid="input-ban-reason"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="destructive"
                        onClick={() => banUserMutation.mutate({ 
                          userId: selectedUser.id, 
                          reason: banReason 
                        })}
                        disabled={!banReason.trim() || banUserMutation.isPending}
                        data-testid="button-confirm-ban"
                      >
                        {banUserMutation.isPending ? "Banning..." : "Confirm Ban"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(null);
                          setBanReason("");
                        }}
                        data-testid="button-cancel-ban"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="economy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-impact text-2xl text-accent">💰 ECONOMY CONTROLS</CardTitle>
                  <CardDescription>
                    Manage the game economy and user finances
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-accent" data-testid="total-coins">
                          💰 {users.reduce((sum: number, u: any) => sum + u.coins, 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Coins in Circulation</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-secondary" data-testid="avg-level">
                          ⭐ {Math.round(users.reduce((sum: number, u: any) => sum + u.level, 0) / users.length || 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Average User Level</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary" data-testid="richest-user">
                          👑 {Math.max(...users.map((u: any) => u.coins)).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Richest User</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-muted-foreground" data-testid="avg-coins">
                          📊 {Math.round(users.reduce((sum: number, u: any) => sum + u.coins, 0) / users.length || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Average Coins</div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-impact text-2xl text-destructive">⚙️ SYSTEM CONTROLS</CardTitle>
                  <CardDescription>
                    Execute administrative commands and system maintenance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleExecuteCommand} className="space-y-4">
                    <div>
                      <Label htmlFor="command">Custom Command</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="command"
                          value={command}
                          onChange={(e) => setCommand(e.target.value)}
                          placeholder="e.g., giveAll 100"
                          className="flex-1"
                          data-testid="input-command"
                        />
                        <Button
                          type="submit"
                          disabled={!command.trim() || executeCommandMutation.isPending}
                          className="font-comic bg-destructive hover:bg-destructive/80"
                          data-testid="button-execute-command"
                        >
                          <Command className="w-4 h-4 mr-2" />
                          {executeCommandMutation.isPending ? "Executing..." : "EXECUTE"}
                        </Button>
                      </div>
                    </div>
                  </form>

                  <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                    <h4 className="font-bold mb-2">Available Commands:</h4>
                    <ul className="space-y-1">
                      <li><code className="bg-background px-2 py-1 rounded">giveAll [amount]</code> - Give coins to all active users</li>
                      <li><code className="bg-background px-2 py-1 rounded">resetEconomy</code> - Reset all user balances (dangerous!)</li>
                      <li><code className="bg-background px-2 py-1 rounded">clearTransactions</code> - Clear all transaction history</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <Footer />
    </div>
  );
}
