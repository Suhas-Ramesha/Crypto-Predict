import { Model, CoinInfo } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Brain, Calendar, TrendingUp, Target } from "lucide-react";

interface ModelInfoProps {
  model: Model | undefined;
  coin: CoinInfo;
}

export const ModelInfo = ({ model, coin }: ModelInfoProps) => {
  if (!model) {
    return (
      <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Model Information</h3>
        </div>
        <p className="text-muted-foreground text-sm">No model available for this coin.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Model Information</h3>
        </div>
        <Badge
          className="text-xs"
          style={{ backgroundColor: `${coin.color}20`, color: coin.color, borderColor: `${coin.color}50` }}
        >
          {coin.symbol}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Algorithm */}
        <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Algorithm</span>
          </div>
          <span className="font-medium text-foreground">{model.algorithm}</span>
        </div>

        {/* Version */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Version:</span>
          <span className="font-mono text-foreground">{model.version}</span>
        </div>

        {/* Accuracy Score (highlighted) */}
        <div className="p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-lg border border-success/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-sm text-muted-foreground">Model Accuracy</span>
          </div>
          <p className="text-3xl font-bold font-mono text-success">
            {model.accuracy.toFixed(1)}%
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">MSE</p>
            <p className="font-mono text-sm text-foreground">
              {model.mse.toFixed(4)}
            </p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">MAE</p>
            <p className="font-mono text-sm text-foreground">
              {model.mae.toFixed(4)}
            </p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">R² Score</p>
            <p className="font-mono text-sm text-success">
              {(model.r2 * 100).toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Notes */}
        <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3">
          {model.notes}
        </p>
      </div>
    </div>
  );
};
