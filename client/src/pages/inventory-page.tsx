import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ItemFilter = 'all' | 'tool' | 'collectible' | 'powerup' | 'consumable' | 'lootbox';

export default function InventoryPage() {
  const [selectedFilter, setSelectedFilter] = useState<ItemFilter>('all');
  const { toast } = useToast();

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["/api/user/inventory"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/inventory");
      return res.json();
    },
  });

  const useItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      // This would be implemented when the use item functionality is added to the backend
      const res = await apiRequest("POST", `/api/inventory/use/${itemId}`);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Item Used! ✨",
        description: data.message || "Item used successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Cannot Use Item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filters = [
    { id: 'all', name: 'All Items', icon: '🎒' },
    { id: 'tool', name: 'Tools', icon: '🔧' },
    { id: 'collectible', name: 'Collectibles', icon: '🎭' },
    { id: 'powerup', name: 'Powerups', icon: '⚡' },
    { id: 'consumable', name: 'Consumables', icon: '🧪' },
    { id: 'lootbox', name: 'Lootboxes', icon: '📦' }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500 bg-gray-500/10';
      case 'uncommon': return 'border-green-500 bg-green-500/10';
      case 'rare': return 'border-blue-500 bg-blue-500/10';
      case 'epic': return 'border-purple-500 bg-purple-500/10';
      case 'legendary': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
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

  const filteredInventory = inventory.filter((item: any) => {
    return selectedFilter === 'all' || item.type === selectedFilter;
  });

  const totalValue = inventory.reduce((sum: number, item: any) => {
    return sum + ((item.currentPrice || item.price || 0) * item.quantity);
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-8">
        <div className="text-center">
          <h1 className="font-impact text-4xl text-primary mb-2" data-testid="inventory-title">
            🎒 INVENTORY
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your collection of meme items and power-ups
          </p>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl text-primary font-bold" data-testid="total-items">
                {inventory.reduce((sum: number, item: any) => sum + item.quantity, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl text-accent font-bold" data-testid="unique-items">
                {inventory.length}
              </div>
              <div className="text-sm text-muted-foreground">Unique Items</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl text-secondary font-bold" data-testid="inventory-value">
                💰 {totalValue.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Estimated Value</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "default" : "outline"}
              onClick={() => setSelectedFilter(filter.id as ItemFilter)}
              className="font-comic"
              data-testid={`button-filter-${filter.id}`}
            >
              {filter.icon} {filter.name}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your inventory...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="text-center py-12" data-testid="empty-inventory">
            <div className="text-4xl mb-4">🎒</div>
            <h3 className="text-xl font-bold text-muted-foreground mb-2">
              {selectedFilter === 'all' ? 'Your inventory is empty' : `No ${selectedFilter} items`}
            </h3>
            <p className="text-muted-foreground mb-4">
              {selectedFilter === 'all' 
                ? 'Visit the shop to buy your first items!' 
                : `Try switching to a different category or visit the shop to buy ${selectedFilter} items.`}
            </p>
            <Button 
              onClick={() => window.location.href = '/shop'}
              className="font-comic"
              data-testid="button-go-to-shop"
            >
              🛒 Visit Shop
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredInventory.map((item: any, index: number) => (
              <Card 
                key={`${item.id}-${index}`}
                className={`hover:scale-105 transition-transform cursor-pointer ${getRarityColor(item.rarity)}`}
                onClick={() => item.type === 'lootbox' ? useItemMutation.mutate(item.id) : null}
                data-testid={`inventory-item-${item.id}`}
              >
                <CardContent className="p-4 text-center space-y-2">
                  <div className="text-2xl relative">
                    {getItemIcon(item.type, item.name)}
                    {item.type === 'lootbox' && (
                      <span className="animate-pulse-glow absolute -top-1 -right-1">✨</span>
                    )}
                  </div>
                  
                  <div className="font-bold text-sm text-foreground truncate" title={item.name}>
                    {item.name}
                  </div>
                  
                  <Badge variant="secondary" className="text-xs">
                    Qty: {item.quantity}
                  </Badge>
                  
                  {item.equipped && (
                    <Badge variant="default" className="text-xs bg-green-500">
                      ✅ Equipped
                    </Badge>
                  )}
                  
                  <Badge className={`text-xs capitalize ${getRarityColor(item.rarity).split(' ')[0]}`}>
                    {item.rarity}
                  </Badge>
                  
                  {/* Action buttons for different item types */}
                  {item.type === 'lootbox' && (
                    <Button
                      size="sm"
                      className="w-full text-xs font-comic bg-gradient-to-r from-primary to-accent"
                      disabled={useItemMutation.isPending}
                      data-testid={`button-open-${item.id}`}
                    >
                      {useItemMutation.isPending ? "Opening..." : "OPEN BOX"}
                    </Button>
                  )}
                  
                  {item.type === 'consumable' && (
                    <Button
                      size="sm"
                      className="w-full text-xs font-comic"
                      onClick={(e) => {
                        e.stopPropagation();
                        useItemMutation.mutate(item.id);
                      }}
                      disabled={useItemMutation.isPending}
                      data-testid={`button-use-${item.id}`}
                    >
                      USE
                    </Button>
                  )}
                  
                  {item.type === 'tool' && !item.equipped && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs font-comic"
                      onClick={(e) => {
                        e.stopPropagation();
                        useItemMutation.mutate(item.id);
                      }}
                      disabled={useItemMutation.isPending}
                      data-testid={`button-equip-${item.id}`}
                    >
                      EQUIP
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {filteredInventory.length > 0 && (
          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline" 
              className="font-comic"
              disabled
              data-testid="button-sell-duplicates"
            >
              🪙 SELL DUPLICATES
            </Button>
            <Button 
              variant="outline" 
              className="font-comic"
              disabled
              data-testid="button-trade-items"
            >
              🔄 TRADE ITEMS
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
