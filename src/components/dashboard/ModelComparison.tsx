import { mockModels, coins, formatCurrency } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Award } from "lucide-react";

export const ModelComparison = () => {
  const sortedModels = [...mockModels].sort((a, b) => b.accuracy - a.accuracy);

  return (
    <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "0.5s" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Model Accuracy Comparison</h3>
        </div>
        <Badge variant="outline" className="text-xs bg-secondary/50 border-border/50">
          Linear Regression
        </Badge>
      </div>

      <div className="space-y-3">
        {sortedModels.map((model, index) => {
          const coin = coins.find((c) => c.symbol === model.coin);
          if (!coin) return null;

          return (
            <div
              key={model.id}
              className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/50">
                {index === 0 ? (
                  <Award className="h-4 w-4 text-warning" />
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">
                    #{index + 1}
                  </span>
                )}
              </div>

              {/* Coin Info */}
              <div className="flex items-center gap-2 flex-1">
                <span
                  className="text-lg font-bold"
                  style={{ color: coin.color }}
                >
                  {coin.icon}
                </span>
                <div>
                  <p className="font-medium text-foreground">{coin.name}</p>
                  <p className="text-xs text-muted-foreground">{model.version}</p>
                </div>
              </div>

              {/* Accuracy Bar */}
              <div className="flex-1 hidden md:block">
                <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${model.accuracy}%`,
                      backgroundColor: coin.color,
                    }}
                  />
                </div>
              </div>

              {/* Accuracy Value */}
              <div className="text-right">
                <p
                  className="font-mono text-lg font-semibold"
                  style={{ color: coin.color }}
                >
                  {model.accuracy.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">R² Score</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
