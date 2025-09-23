import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Menu, X, LogOut } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/user/notifications"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/notifications");
      return res.json();
    },
    enabled: !!user,
  });

  if (!user) return null;

  const unreadCount = notifications.filter((n: any) => !n.read).length;
  const levelProgress = (user.xp % (user.level * 1000)) / (user.level * 1000) * 100;

  const navItems = [
    { href: "/", label: "Dashboard", active: location === "/" },
    { href: "/games", label: "Games", active: location === "/games" },
    { href: "/shop", label: "Shop", active: location === "/shop" },
    { href: "/inventory", label: "Inventory", active: location === "/inventory" },
    { href: "/leaderboard", label: "Leaderboard", active: location === "/leaderboard" },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-4" data-testid="logo-link">
              <h1 className="font-impact text-3xl text-primary glow-primary">WEB MEMER</h1>
              <span className="text-muted-foreground text-sm hidden md:block">
                💰 Your Meme Economy Awaits!
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-foreground hover:text-primary transition-colors ${
                  item.active ? 'text-primary font-bold' : ''
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          {/* User Stats and Controls */}
          <div className="flex items-center space-x-4">
            {/* User Stats Display */}
            <div className="hidden lg:flex items-center space-x-4 bg-muted px-4 py-2 rounded-lg">
              <div className="text-center" data-testid="header-coins">
                <div className="text-accent font-bold">💰 {user.coins.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Coins</div>
              </div>
              <div className="text-center" data-testid="header-level">
                <div className="text-secondary font-bold">⭐ Level {user.level}</div>
                <div className="text-xs text-muted-foreground">
                  <Progress value={levelProgress} className="w-16 h-1" />
                </div>
              </div>
              <div className="text-center" data-testid="header-bank">
                <div className="text-primary font-bold">🏦 {user.bank?.toLocaleString() || 0}</div>
                <div className="text-xs text-muted-foreground">Bank</div>
              </div>
            </div>
            
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 text-xs rounded-full flex items-center justify-center"
                      data-testid="notification-count"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-2">
                  <h3 className="font-bold text-sm text-foreground mb-2">Notifications</h3>
                  {notifications.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      No notifications yet
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto" data-testid="notifications-list">
                      {notifications.slice(0, 5).map((notification: any) => (
                        <div
                          key={notification.id}
                          className={`p-2 rounded text-sm ${
                            notification.read ? 'bg-muted/50' : 'bg-primary/10 border border-primary/20'
                          }`}
                          data-testid={`notification-${notification.id}`}
                        >
                          <p className="text-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center space-x-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Level {user.level} • {user.coins.toLocaleString()} coins
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" data-testid="menu-profile">
                    👤 Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/inventory" data-testid="menu-inventory">
                    🎒 Inventory
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin" data-testid="menu-admin">
                    🔧 Admin Panel
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logoutMutation.mutate()}
                  className="text-destructive cursor-pointer"
                  data-testid="menu-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-foreground hover:text-primary transition-colors py-2 px-4 rounded ${
                    item.active ? 'bg-primary/10 text-primary font-bold' : ''
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            {/* Mobile User Stats */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-accent font-bold">💰 {user.coins.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Coins</div>
                </div>
                <div>
                  <div className="text-secondary font-bold">⭐ Level {user.level}</div>
                  <div className="text-xs text-muted-foreground">
                    <Progress value={levelProgress} className="w-full h-1 mt-1" />
                  </div>
                </div>
                <div>
                  <div className="text-primary font-bold">🏦 {user.bank?.toLocaleString() || 0}</div>
                  <div className="text-xs text-muted-foreground">Bank</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
