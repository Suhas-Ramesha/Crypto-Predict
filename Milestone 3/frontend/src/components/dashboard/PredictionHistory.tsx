import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePredictions, SavedPrediction } from '@/hooks/usePredictions';
import { getCoinInfo, formatCurrency } from '@/lib/mockData';
import { History, Trash2, Target, Clock } from 'lucide-react';

export const PredictionHistory = () => {
  const { predictions, isLoading, deletePrediction } = usePredictions();

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.85) return { label: 'High', className: 'border-success/50 text-success' };
    if (confidence >= 0.75) return { label: 'Medium', className: 'border-warning/50 text-warning' };
    return { label: 'Low', className: 'border-muted-foreground/50 text-muted-foreground' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <History className="h-5 w-5 text-primary" />
          Prediction History
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : predictions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No predictions saved yet</p>
                <p className="text-xs mt-1">Run predictions to see them here</p>
              </div>
            ) : (
              predictions.map((prediction, index) => {
                const coin = getCoinInfo(prediction.coin_symbol);
                const confidence = getConfidenceBadge(prediction.confidence);

                return (
                  <motion.div
                    key={prediction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.03 }}
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
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {prediction.coin_symbol}
                          </span>
                          <Badge variant="outline" className={`text-[10px] ${confidence.className}`}>
                            {confidence.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(prediction.created_at)}
                          <span className="ml-1">• {prediction.horizon_days}d forecast</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-mono font-medium text-foreground">
                          {formatCurrency(prediction.predicted_price, prediction.coin_symbol)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {prediction.model_version}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        onClick={() => deletePrediction(prediction.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
