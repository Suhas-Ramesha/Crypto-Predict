import { Model, CoinInfo } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Brain, Calendar } from "lucide-react";

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
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Version:</span>
          <span className="font-mono text-sm text-foreground">{model.version}</span>
        </div>
      </div>

      {/* Large Accuracy Display */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm text-muted-foreground">Model Accuracy</span>
        </div>
        <div className="text-5xl font-bold text-success mb-1">
          {model.accuracy.toFixed(1)}%
        </div>
      </div>

      {/* Metrics Grid - MSE, MAE, R² Score */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">MSE</p>
          <p className="text-lg font-semibold text-foreground">
            {model.mse >= 1000000
              ? (model.mse / 1000000).toFixed(2) + 'M'
              : model.mse >= 1000
                ? (model.mse / 1000).toFixed(2) + 'K'
                : model.mse.toFixed(4)}
          </p>
        </div>
        <div className="text-center border-x border-border/50">
          <p className="text-xs text-muted-foreground mb-1">MAE</p>
          <p className="text-lg font-semibold text-foreground">
            {model.mae >= 1000
              ? (model.mae / 1000).toFixed(2) + 'K'
              : model.mae.toFixed(4)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">R² Score</p>
          <p className="text-lg font-semibold text-success">
            {(model.r2 * 100).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Model Details */}
      <div className="space-y-3 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Algorithm</span>
          <span className="font-medium text-foreground">{model.algorithm}</span>
        </div>
        <div className="text-xs text-muted-foreground italic">
          {model.notes}
        </div>
      </div>
    </div>
  );
};
