import { Model } from "@/lib/mockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Calendar, TrendingUp } from "lucide-react";

interface ModelSelectorProps {
  models: Model[];
  selectedModel: Model | null;
  onSelectModel: (model: Model) => void;
}

export const ModelSelector = ({
  models,
  selectedModel,
  onSelectModel,
}: ModelSelectorProps) => {
  return (
    <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Model Selection</h3>
      </div>

      <Select
        value={selectedModel?.id.toString()}
        onValueChange={(value) => {
          const model = models.find((m) => m.id.toString() === value);
          if (model) onSelectModel(model);
        }}
      >
        <SelectTrigger className="w-full bg-secondary/50 border-border/50 hover:border-primary/50 transition-colors">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {models.map((model) => (
            <SelectItem
              key={model.id}
              value={model.id.toString()}
              className="cursor-pointer hover:bg-accent/50"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{model.version}</span>
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                  R² {(model.r2 * 100).toFixed(1)}%
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedModel && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Created:</span>
            <span className="font-mono text-foreground">
              {new Date(selectedModel.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-secondary/30 rounded-lg p-2 text-center">
              <p className="text-xs text-muted-foreground">MSE</p>
              <p className="font-mono text-sm text-foreground">
                {selectedModel.mse.toFixed(4)}
              </p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-2 text-center">
              <p className="text-xs text-muted-foreground">MAE</p>
              <p className="font-mono text-sm text-foreground">
                {selectedModel.mae.toFixed(4)}
              </p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-2 text-center">
              <p className="text-xs text-muted-foreground">R²</p>
              <p className="font-mono text-sm text-success">
                {(selectedModel.r2 * 100).toFixed(2)}%
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground italic">
            {selectedModel.notes}
          </p>
        </div>
      )}
    </div>
  );
};
