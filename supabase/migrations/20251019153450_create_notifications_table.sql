/*
  # Create Notifications System

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `type` (text) - 'income' | 'expense' | 'insight' | 'reminder'
      - `title` (text)
      - `message` (text)
      - `category` (text) - optional category for grouping
      - `amount` (numeric) - optional transaction amount
      - `is_read` (boolean, default false)
      - `priority` (text) - 'high' | 'medium' | 'low'
      - `created_at` (timestamptz, default now())
      - `metadata` (jsonb) - additional data
    
    - `notification_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, unique)
      - `app_notifications_enabled` (boolean, default true)
      - `sms_alerts_enabled` (boolean, default false)
      - `phone_number` (text, nullable)
      - `notify_on_income` (boolean, default true)
      - `notify_on_expense` (boolean, default true)
      - `notify_on_insights` (boolean, default true)
      - `notify_on_reminders` (boolean, default true)
      - `expense_threshold` (numeric, nullable) - alert if expense exceeds this
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on both tables
    - Users can only access their own notifications
    - Users can only access their own settings
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('income', 'expense', 'insight', 'reminder')),
  title text NOT NULL,
  message text NOT NULL,
  category text,
  amount numeric,
  is_read boolean DEFAULT false,
  priority text DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  app_notifications_enabled boolean DEFAULT true,
  sms_alerts_enabled boolean DEFAULT false,
  phone_number text,
  notify_on_income boolean DEFAULT true,
  notify_on_expense boolean DEFAULT true,
  notify_on_insights boolean DEFAULT true,
  notify_on_reminders boolean DEFAULT true,
  expense_threshold numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Notification settings policies
CREATE POLICY "Users can view own settings"
  ON notification_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON notification_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON notification_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notification_settings
DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON notification_settings;
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
