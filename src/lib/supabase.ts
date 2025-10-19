import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  inventory_item_id?: string | null;
  quantity_changed?: number;
  created_at: string;
};
