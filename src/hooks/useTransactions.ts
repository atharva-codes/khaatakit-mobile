import { useState, useEffect } from 'react';
import { supabase, Transaction } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading transactions',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const addTransaction = async (
    amount: number,
    type: 'income' | 'expense',
    category: string,
    date: string,
    inventoryItemId?: string,
    quantityChanged?: number
  ) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          amount,
          type,
          category,
          date,
          inventory_item_id: inventoryItemId || null,
          quantity_changed: quantityChanged || 0,
        }])
        .select()
        .single();

      if (error) throw error;

      if (inventoryItemId && quantityChanged) {
        const { data: item } = await supabase
          .from('inventory_items')
          .select('quantity')
          .eq('id', inventoryItemId)
          .single();

        if (item) {
          const newQuantity = item.quantity + quantityChanged;
          await supabase
            .from('inventory_items')
            .update({
              quantity: newQuantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', inventoryItemId);
        }
      }

      setTransactions([data, ...transactions]);
      toast({
        title: 'Transaction added',
        description: `₹${amount} ${type} recorded successfully`,
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Error adding transaction',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(transactions.filter(t => t.id !== id));
      toast({
        title: 'Transaction deleted',
        description: 'Transaction removed successfully',
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Error deleting transaction',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const getTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const getCurrentBalance = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  return {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    getTotalIncome,
    getTotalExpenses,
    getCurrentBalance,
    refetch: fetchTransactions,
  };
};
