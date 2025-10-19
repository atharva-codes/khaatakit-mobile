import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type NotificationType = 'income' | 'expense' | 'insight' | 'reminder';
export type NotificationPriority = 'high' | 'medium' | 'low';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  category?: string;
  amount?: number;
  is_read: boolean;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  app_notifications_enabled: boolean;
  sms_alerts_enabled: boolean;
  phone_number?: string;
  notify_on_income: boolean;
  notify_on_expense: boolean;
  notify_on_insights: boolean;
  notify_on_reminders: boolean;
  expense_threshold?: number;
  created_at: string;
  updated_at: string;
}
