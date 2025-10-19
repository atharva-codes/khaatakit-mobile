import { useState, useEffect } from 'react';
import { supabase, InventoryItem } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading inventory',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const addItem = async (name: string, quantity: number, price: number) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([{ name, quantity, price }])
        .select()
        .single();

      if (error) throw error;

      setItems([data, ...items]);
      toast({
        title: 'Item added',
        description: `${name} added to inventory`,
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Error adding item',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setItems(items.map(item => item.id === id ? data : item));
      toast({
        title: 'Item updated',
        description: 'Inventory item updated successfully',
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Error updating item',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(items.filter(item => item.id !== id));
      toast({
        title: 'Item deleted',
        description: 'Item removed from inventory',
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Error deleting item',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const getTotalValue = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    getTotalValue,
    refetch: fetchItems,
  };
};
