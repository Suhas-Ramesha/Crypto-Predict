import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SavedPrediction {
  id: string;
  coin_symbol: string;
  predicted_price: number;
  actual_price: number | null;
  model_version: string;
  confidence: number;
  horizon_days: number;
  created_at: string;
}

export const usePredictions = () => {
  const [predictions, setPredictions] = useState<SavedPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchPredictions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPredictions(data || []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePrediction = useCallback(async (prediction: {
    coinSymbol: string;
    predictedPrice: number;
    modelVersion: string;
    confidence: number;
    horizonDays: number;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please sign in to save predictions",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('predictions')
        .insert({
          user_id: user.id,
          coin_symbol: prediction.coinSymbol,
          predicted_price: prediction.predictedPrice,
          model_version: prediction.modelVersion,
          confidence: prediction.confidence,
          horizon_days: prediction.horizonDays,
        })
        .select()
        .single();

      if (error) throw error;

      setPredictions(prev => [data, ...prev]);
      toast({
        title: "Prediction Saved",
        description: `${prediction.coinSymbol} prediction stored successfully`,
      });

      return data;
    } catch (error) {
      console.error('Error saving prediction:', error);
      toast({
        title: "Error",
        description: "Failed to save prediction",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const deletePrediction = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('predictions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPredictions(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Deleted",
        description: "Prediction removed",
      });
    } catch (error) {
      console.error('Error deleting prediction:', error);
    }
  }, [toast]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  return {
    predictions,
    isLoading,
    savePrediction,
    deletePrediction,
    refetch: fetchPredictions,
  };
};
