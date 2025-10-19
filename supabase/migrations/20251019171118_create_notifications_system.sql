/*
  # Notifications System for KhaataKitab

  ## Overview
  Creates a comprehensive notification system that tracks in-app alerts and SMS notifications
  for transaction activities, insights, and reminders.

  ## New Tables
  
  ### `notifications`
  - `id` (uuid, primary key) - Unique identifier for each notification
  - `user_id` (uuid, not null) - References the user who receives the notification
  - `type` (text, not null) - Category: 'income', 'expense', 'insight', 'reminder'
  - `title` (text, not null) - Short notification title
  - `message` (text, not null) - Full notification message content
  - `is_read` (boolean, default false) - Whether user has read the notification
  - `created_at` (timestamptz, default now()) - When notification was created
  - `metadata` (jsonb, nullable) - Additional data like transaction_id, amount, etc.

  ### `user_preferences`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, unique, not null) - References the user
  - `app_notifications_enabled` (boolean, default true) - Toggle for in-app notifications
  - `sms_alerts_enabled` (boolean, default false) - Toggle for SMS alerts
  - `phone_number` (text, nullable) - User's phone number for SMS
  - `updated_at` (timestamptz, default now()) - Last preference update time

  ## Security
  - Row Level Security (RLS) enabled on both tables
  - Users can only access their own notifications
  - Users can only access and modify their own preferences

  ## Important Notes
  - Notifications are categorized for easy filtering
  - Metadata field stores flexible JSON data for context
  - SMS feature is optional and requires phone number
  - All timestamps use timezone-aware format
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense', 'insight', 'reminder')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  metadata jsonb
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  app_notifications_enabled boolean DEFAULT true,
  sms_alerts_enabled boolean DEFAULT false,
  phone_number text,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

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

-- User preferences policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);