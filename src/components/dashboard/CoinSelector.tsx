import { coins, CoinInfo } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface CoinSelectorProps {
  selectedCoin: CoinInfo;
  onSelectCoin: (coin: CoinInfo) => void;
}

export const CoinSelector = ({ selectedCoin, onSelectCoin }: CoinSelectorProps) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {coins.map((coin) => (
        <button
          key={coin.symbol}
          onClick={() => onSelectCoin(coin)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200",
            selectedCoin.symbol === coin.symbol
              ? "border-primary bg-primary/10"
              : "border-border/50 bg-secondary/30 hover:bg-secondary/50 hover:border-border"
          )}
        >
          <span
            className="text-lg font-bold"
            style={{ color: coin.color }}
          >
            {coin.icon}
          </span>
          <span
            className={cn(
              "font-medium text-sm",
              selectedCoin.symbol === coin.symbol ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {coin.symbol}
          </span>
        </button>
      ))}
    </div>
  );
};
