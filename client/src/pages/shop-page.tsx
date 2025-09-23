import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type ItemType = 'all' | 'tool' | 'collectible' | 'powerup' | 'consumable' | 'lootbox';

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<ItemType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["/api/shop/items"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/shop/items");
      return res.json();
    },
  });

  const buyItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity?: number }) => {
      const res = await apiRequest("POST", "/api/shop/buy", { itemId, quantity });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Purchase Successful! 🛒",
        description: `You bought ${data.quantity}x ${data.item}!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const categories = [
    { id: 'all', name: 'All', icon: '🛒' },
    { id: 'tool', name: 'Tools', icon: '🔧' },
    { id: 'collectible', name: 'Collectibles', icon: '🎭' },
    { id: 'powerup', name: 'Powerups', icon: '⚡' },
    { id: 'consumable', name: 'Consumables', icon: '🧪' },
    { id: 'lootbox', name: 'Lootboxes', icon: '📦' }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getItemIcon = (type: string, name: string) => {
    if (name.toLowerCase().includes('fishing')) return '🎣';
    if (name.toLowerCase().includes('pepe')) return '🐸';
    if (name.toLowerCase().includes('luck') || name.toLowerCase().includes('potion')) return '🧪';
    if (name.toLowerCase().includes('box')) return '📦';
    if (name.toLowerCase().includes('diamond')) return '💎';
    if (name.toLowerCase().includes('trophy')) return '🏆';
    
    switch (type) {
      case 'tool': return '🔧';
      case 'collectible': return '🎭';
      case 'powerup': return '⚡';
      case 'consumable': return '🧪';
      case 'lootbox': return '📦';
      default: return '🎁';
    }
  };

  const filteredItems = items.filter((item: any) => {
    const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-8">
        <div className="text-center">
          <h1 className="font-impact text-4xl text-accent mb-2" data-testid="shop-title">
            🛒 MEME SHOP 🛒
          </h1>
          <p className="text-muted-foreground text-lg">
            Buy powerful items to boost your meme economy game!
          </p>
        </div>

        {/* Search and Categories */}
        <div className="space-y-4">
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md mx-auto"
            data-testid="input-search-items"
          />
          
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id as ItemType)}
                className="font-comic"
                data-testid={`button-category-${category.id}`}
              >
                {category.icon} {category.name}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading shop items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12" data-testid="no-items-message">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-xl font-bold text-muted-foreground mb-2">No items found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "No items available in this category"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item: any) => (
              <Card 
                key={item.id}
                className="hover:scale-105 transition-transform border-primary/20 hover:border-primary"
                data-testid={`item-card-${item.id}`}
              >
                <CardHeader className="text-center">
                  <div className="text-3xl mb-2 relative">
                    {getItemIcon(item.type, item.name)}
                    {item.type === 'lootbox' && (
                      <span className="animate-pulse-glow">✨</span>
                    )}
                  </div>
                  <CardTitle className="font-bold text-primary">{item.name}</CardTitle>
                  <Badge 
                    className={`${getRarityColor(item.rarity)} text-white capitalize`}
                    data-testid={`badge-rarity-${item.id}`}
                  >
                    {item.rarity}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="text-center min-h-[2.5rem]">
                    {item.description}
                  </CardDescription>
                  
                  {/* Item Effects */}
                  {item.effects?.passive?.coinsPerHour > 0 && (
                    <div className="text-xs text-green-400 text-center">
                      💰 +{item.effects.passive.coinsPerHour} coins/hour
                    </div>
                  )}
                  
                  {item.effects?.passive?.winRateBoost > 0 && (
                    <div className="text-xs text-blue-400 text-center">
                      🍀 +{(item.effects.passive.winRateBoost * 100).toFixed(0)}% win rate
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-accent font-bold" data-testid={`price-${item.id}`}>
                      💰 {(item.currentPrice || item.price).toLocaleString()}
                    </span>
                    {item.stock < 100 && item.stock > 0 && (
                      <span className="text-xs text-yellow-400">
                        Stock: {item.stock}
                      </span>
                    )}
                  </div>
                  
                  <Button 
                    onClick={() => buyItemMutation.mutate({ itemId: item.id })}
                    disabled={buyItemMutation.isPending || item.stock === 0}
                    className={`w-full font-comic ${
                      item.type === 'lootbox' 
                        ? 'bg-gradient-to-r from-primary to-accent hover:scale-105' 
                        : 'bg-primary hover:bg-primary/80'
                    }`}
                    data-testid={`button-buy-${item.id}`}
                  >
                    {buyItemMutation.isPending ? "Buying..." : 
                     item.stock === 0 ? "SOLD OUT" : "BUY NOW"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
