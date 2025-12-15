import { Prediction, formatCurrency, mockModels } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp } from "lucide-react";

interface RecentPredictionsProps {
  predictions: Prediction[];
}

export const RecentPredictions = ({ predictions }: RecentPredictionsProps) => {
  const getModelVersion = (modelId: number) => {
    const model = mockModels.find((m) => m.id === modelId);
    return model?.version || "Unknown";
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "0.5s" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Recent Predictions</h3>
        </div>
        <Badge variant="outline" className="text-xs bg-secondary/50 border-border/50">
          Last 24h
        </Badge>
      </div>

      <div className="space-y-3">
        {predictions.map((prediction, index) => (
          <div
            key={prediction.id}
            className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
            style={{ animationDelay: `${0.6 + index * 0.1}s` }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-mono text-sm font-medium text-foreground">
                  {formatCurrency(prediction.prediction)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getModelVersion(prediction.modelId)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge
                variant="outline"
                className={`text-xs ${
                  prediction.confidence >= 0.85
                    ? "bg-success/10 text-success border-success/30"
                    : prediction.confidence >= 0.75
                    ? "bg-warning/10 text-warning border-warning/30"
                    : "bg-muted/50 text-muted-foreground border-border/50"
                }`}
              >
                {(prediction.confidence * 100).toFixed(0)}% conf
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {formatTime(prediction.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
