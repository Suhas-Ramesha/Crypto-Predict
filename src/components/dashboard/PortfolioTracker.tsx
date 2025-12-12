import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePortfolio, PortfolioHolding } from '@/hooks/usePortfolio';
import { coins, formatCurrency, formatPercentage, getCoinInfo } from '@/lib/mockData';
import { useBinancePrices } from '@/hooks/useBinancePrice';
import {
  Wallet,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  PieChart,
  DollarSign,
} from 'lucide-react';

export const PortfolioTracker = () => {
  const { holdings, isLoading, addHolding, deleteHolding } = usePortfolio();
  const { prices, isConnected } = useBinancePrices(coins.map(c => c.symbol));
  const [isOpen, setIsOpen] = useState(false);
  const [newHolding, setNewHolding] = useState({
    coinSymbol: 'BTC',
    amount: '',
    buyPrice: '',
    notes: '',
  });

  const handleAddHolding = async () => {
    if (!newHolding.amount || !newHolding.buyPrice) return;

    await addHolding({
      coinSymbol: newHolding.coinSymbol,
      amount: parseFloat(newHolding.amount),
      buyPrice: parseFloat(newHolding.buyPrice),
      notes: newHolding.notes,
    });

    setNewHolding({ coinSymbol: 'BTC', amount: '', buyPrice: '', notes: '' });
    setIsOpen(false);
  };

  // Calculate portfolio stats
  const portfolioStats = holdings.reduce((acc, holding) => {
    const currentPrice = prices[holding.coin_symbol]?.price || holding.buy_price;
    const value = holding.amount * currentPrice;
    const cost = holding.amount * holding.buy_price;
    const pnl = value - cost;
    const pnlPercent = cost > 0 ? pnl / cost : 0;

    acc.totalValue += value;
    acc.totalCost += cost;
    acc.totalPnl += pnl;

    return acc;
  }, { totalValue: 0, totalCost: 0, totalPnl: 0 });

  const totalPnlPercent = portfolioStats.totalCost > 0 
    ? portfolioStats.totalPnl / portfolioStats.totalCost 
    : 0;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Wallet className="h-5 w-5 text-primary" />
            Portfolio Tracker
          </CardTitle>
          <div className="flex items-center gap-2">
            {isConnected && (
              <Badge variant="outline" className="text-xs border-success/50 text-success">
                Live
              </Badge>
            )}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Add Holding</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Coin</Label>
                    <Select
                      value={newHolding.coinSymbol}
                      onValueChange={(v) => setNewHolding({ ...newHolding, coinSymbol: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {coins.map(coin => (
                          <SelectItem key={coin.symbol} value={coin.symbol}>
                            <span className="flex items-center gap-2">
                              <span style={{ color: coin.color }}>{coin.icon}</span>
                              {coin.name} ({coin.symbol})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={newHolding.amount}
                      onChange={(e) => setNewHolding({ ...newHolding, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Buy Price (USD)</Label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={newHolding.buyPrice}
                      onChange={(e) => setNewHolding({ ...newHolding, buyPrice: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Input
                      placeholder="e.g., DCA purchase"
                      value={newHolding.notes}
                      onChange={(e) => setNewHolding({ ...newHolding, notes: e.target.value })}
                    />
                  </div>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90" 
                    onClick={handleAddHolding}
                    disabled={!newHolding.amount || !newHolding.buyPrice}
                  >
                    Add to Portfolio
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Portfolio Summary */}
        <motion.div 
          className="grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <PieChart className="h-3 w-3" />
              Total Value
            </div>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(portfolioStats.totalValue)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <DollarSign className="h-3 w-3" />
              Total Cost
            </div>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(portfolioStats.totalCost)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              {portfolioStats.totalPnl >= 0 ? (
                <TrendingUp className="h-3 w-3 text-success" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              Total P&L
            </div>
            <p className={`text-lg font-bold ${
              portfolioStats.totalPnl >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {formatCurrency(portfolioStats.totalPnl)}
              <span className="text-xs ml-1">
                ({formatPercentage(totalPnlPercent)})
              </span>
            </p>
          </div>
        </motion.div>

        {/* Holdings List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          <AnimatePresence>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : holdings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No holdings yet. Add your first position!
              </div>
            ) : (
              holdings.map((holding, index) => {
                const coin = getCoinInfo(holding.coin_symbol);
                const currentPrice = prices[holding.coin_symbol]?.price || holding.buy_price;
                const value = holding.amount * currentPrice;
                const pnl = value - (holding.amount * holding.buy_price);
                const pnlPercent = holding.buy_price > 0 ? pnl / (holding.amount * holding.buy_price) : 0;

                return (
                  <motion.div
                    key={holding.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
                        style={{ 
                          backgroundColor: `${coin?.color}20`, 
                          color: coin?.color 
                        }}
                      >
                        {coin?.icon || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {holding.amount} {holding.coin_symbol}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Bought @ {formatCurrency(holding.buy_price, holding.coin_symbol)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          {formatCurrency(value)}
                        </p>
                        <p className={`text-xs ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)} ({formatPercentage(pnlPercent)})
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        onClick={() => deleteHolding(holding.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};
