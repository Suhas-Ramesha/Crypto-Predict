import { motion, AnimatePresence } from 'framer-motion';
import { useBinancePrice } from '@/hooks/useBinancePrice';
import { CoinInfo, formatCurrency, formatPercentage, formatVolume } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Wifi, WifiOff, Activity } from 'lucide-react';

interface LivePriceDisplayProps {
  coin: CoinInfo;
}

export const LivePriceDisplay = ({ coin }: LivePriceDisplayProps) => {
  const { price, isConnected, error } = useBinancePrice(coin.symbol);

  return (
    <motion.div 
      className="glass-card p-4 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 30% 50%, ${coin.color}40 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: `${coin.color}20`, color: coin.color }}
            >
              {coin.icon}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{coin.symbol}/USDT</h3>
              <p className="text-xs text-muted-foreground">Binance</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs ${
              isConnected 
                ? 'border-success/50 text-success' 
                : 'border-destructive/50 text-destructive'
            }`}
          >
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Live
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
        </div>

        {/* Price */}
        <AnimatePresence mode="wait">
          {price ? (
            <motion.div
              key={price.price}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-foreground font-mono">
                  {formatCurrency(price.price, coin.symbol)}
                </span>
                <motion.span 
                  className={`flex items-center text-sm font-medium ${
                    price.priceChangePercent >= 0 ? 'text-success' : 'text-destructive'
                  }`}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  {price.priceChangePercent >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {formatPercentage(price.priceChangePercent / 100)}
                </motion.span>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-secondary/50">
                  <p className="text-muted-foreground mb-0.5">24h High</p>
                  <p className="font-mono text-foreground">{formatCurrency(price.high, coin.symbol)}</p>
                </div>
                <div className="p-2 rounded-lg bg-secondary/50">
                  <p className="text-muted-foreground mb-0.5">24h Low</p>
                  <p className="font-mono text-foreground">{formatCurrency(price.low, coin.symbol)}</p>
                </div>
                <div className="p-2 rounded-lg bg-secondary/50">
                  <p className="text-muted-foreground mb-0.5">Volume</p>
                  <p className="font-mono text-foreground">{formatVolume(price.volume * price.price)}</p>
                </div>
              </div>

              {/* Pulse indicator */}
              <div className="absolute top-4 right-4">
                <motion.div
                  className="w-2 h-2 rounded-full bg-success"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-[100px]"
            >
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Activity className="h-4 w-4 animate-pulse" />
                  Connecting...
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Last updated */}
        {price && (
          <p className="text-[10px] text-muted-foreground mt-2 text-right">
            Updated: {price.lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
    </motion.div>
  );
};
