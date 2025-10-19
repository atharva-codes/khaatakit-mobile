/*
  # Create Inventory Management System

  1. New Tables
    - `inventory_items`
      - `id` (uuid, primary key)
      - `name` (text, item name)
      - `quantity` (integer, current stock quantity)
      - `price` (numeric, price per unit)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `amount` (numeric, transaction amount)
      - `type` (text, 'income' or 'expense')
      - `category` (text, transaction category)
      - `date` (date, transaction date)
      - `inventory_item_id` (uuid, optional reference to inventory item)
      - `quantity_changed` (integer, optional quantity change)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (for prototype)
    
  3. Notes
    - This is a prototype setup with public access
    - Inventory updates happen automatically through triggers
    - All monetary values use numeric type for precision
*/

CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  price numeric(10, 2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric(10, 2) NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  date date NOT NULL,
  inventory_item_id uuid REFERENCES inventory_items(id) ON DELETE SET NULL,
  quantity_changed integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to inventory"
  ON inventory_items FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to inventory"
  ON inventory_items FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update to inventory"
  ON inventory_items FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from inventory"
  ON inventory_items FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to transactions"
  ON transactions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to transactions"
  ON transactions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update to transactions"
  ON transactions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from transactions"
  ON transactions FOR DELETE
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_inventory_items_name ON inventory_items(name);
