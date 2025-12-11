import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Model, formatCurrency } from "@/lib/mockData";
import { Play, Loader2, TrendingUp, Target, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PredictionPanelProps {
  selectedModel: Model | null;
  onRunPrediction: () => void;
  showPredictions: boolean;
  onTogglePredictions: (show: boolean) => void;
  latestPrediction: number | null;
  isLoading: boolean;
}

export const PredictionPanel = ({
  selectedModel,
  onRunPrediction,
  showPredictions,
  onTogglePredictions,
  latestPrediction,
  isLoading,
}: PredictionPanelProps) => {
  const [horizon, setHorizon] = useState([7]);
  const { toast } = useToast();

  const handleRunPrediction = () => {
    if (!selectedModel) {
      toast({
        title: "No model selected",
        description: "Please select a model before running predictions.",
        variant: "destructive",
      });
      return;
    }
    onRunPrediction();
  };

  return (
    <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "0.4s" }}>
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Prediction Controls</h3>
      </div>

      <div className="space-y-5">
        {/* Prediction Horizon */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">
              Forecast Horizon
            </Label>
            <span className="font-mono text-sm text-primary">{horizon[0]} days</span>
          </div>
          <Slider
            value={horizon}
            onValueChange={setHorizon}
            min={1}
            max={14}
            step={1}
            className="w-full"
          />
        </div>

        {/* Show Predictions Toggle */}
        <div className="flex items-center justify-between py-2">
          <Label className="text-sm text-muted-foreground">
            Show Predictions on Chart
          </Label>
          <Switch
            checked={showPredictions}
            onCheckedChange={onTogglePredictions}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        {/* Run Prediction Button */}
        <Button
          onClick={handleRunPrediction}
          disabled={!selectedModel || isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-300 hover:glow-primary"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Model...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Prediction
            </>
          )}
        </Button>

        {/* Latest Prediction Result */}
        {latestPrediction && (
          <div className="mt-4 p-4 bg-gradient-to-br from-primary/10 to-chart-prediction/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Next Day Prediction
              </span>
            </div>
            <p className="text-2xl font-bold font-mono text-gradient-primary">
              {formatCurrency(latestPrediction)}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs text-success font-mono">
                87% confidence
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
