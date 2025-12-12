import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PortfolioHolding {
  id: string;
  coin_symbol: string;
  amount: number;
  buy_price: number;
  bought_at: string;
  notes: string | null;
  created_at: string;
}

export const usePortfolio = () => {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchHoldings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHoldings(data || []);
    } catch (error) {
      console.error('Error fetching holdings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addHolding = useCallback(async (holding: {
    coinSymbol: string;
    amount: number;
    buyPrice: number;
    boughtAt?: Date;
    notes?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please sign in to add holdings",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('portfolio_holdings')
        .insert({
          user_id: user.id,
          coin_symbol: holding.coinSymbol,
          amount: holding.amount,
          buy_price: holding.buyPrice,
          bought_at: holding.boughtAt?.toISOString() || new Date().toISOString(),
          notes: holding.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      setHoldings(prev => [data, ...prev]);
      toast({
        title: "Holding Added",
        description: `${holding.amount} ${holding.coinSymbol} added to portfolio`,
      });

      return data;
    } catch (error) {
      console.error('Error adding holding:', error);
      toast({
        title: "Error",
        description: "Failed to add holding",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const updateHolding = useCallback(async (id: string, updates: Partial<{
    amount: number;
    buyPrice: number;
    notes: string;
  }>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.buyPrice !== undefined) updateData.buy_price = updates.buyPrice;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const { data, error } = await supabase
        .from('portfolio_holdings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setHoldings(prev => prev.map(h => h.id === id ? data : h));
      toast({
        title: "Updated",
        description: "Holding updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating holding:', error);
      toast({
        title: "Error",
        description: "Failed to update holding",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const deleteHolding = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_holdings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHoldings(prev => prev.filter(h => h.id !== id));
      toast({
        title: "Deleted",
        description: "Holding removed from portfolio",
      });
    } catch (error) {
      console.error('Error deleting holding:', error);
    }
  }, [toast]);

  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  return {
    holdings,
    isLoading,
    addHolding,
    updateHolding,
    deleteHolding,
    refetch: fetchHoldings,
  };
};
