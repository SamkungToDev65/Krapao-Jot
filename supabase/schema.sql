-- =========================================================================
-- Krapao Jot (กระเป๋าจด) - Supabase Database Schema & Security Policies (RLS)
-- Run this SQL in your Supabase Project: SQL Editor -> New Query -> Run
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT,
  full_name TEXT,
  currency TEXT DEFAULT 'THB',
  theme TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure username column exists if table was already created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_username_lower ON public.profiles(LOWER(username));

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Function & trigger to auto-create public.profiles row when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    LOWER(NULLIF(NEW.raw_user_meta_data->>'username', ''))
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
      username = COALESCE(NULLIF(EXCLUDED.username, ''), profiles.username);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Security Definer RPC for resolving username to email on login
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT email INTO v_email
  FROM public.profiles
  WHERE LOWER(username) = LOWER(TRIM(p_username))
  LIMIT 1;
  RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_email_by_username(TEXT) TO anon, authenticated;


-- 2. ACCOUNTS TABLE (Wallets, Bank Accounts, E-Wallets)
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'credit_card', 'e_wallet')),
  balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'THB',
  icon TEXT,
  color TEXT,
  account_number TEXT,
  bank_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can perform CRUD on own accounts" 
ON public.accounts FOR ALL USING (auth.uid() = user_id);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view default or own categories" 
ON public.categories FOR SELECT 
USING (is_default = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can manage own categories" 
ON public.categories FOR ALL 
USING (auth.uid() = user_id);

-- 4. CREDIT CARDS TABLE
CREATE TABLE IF NOT EXISTS public.credit_cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  bank TEXT NOT NULL,
  last_four_digits VARCHAR(4) NOT NULL,
  credit_limit NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  current_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  statement_day INT NOT NULL CHECK (statement_day BETWEEN 1 AND 31),
  due_day INT NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  card_color TEXT DEFAULT '#1E293B',
  is_paid_this_month BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own credit cards" 
ON public.credit_cards FOR ALL 
USING (auth.uid() = user_id);

-- 5. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  currency TEXT DEFAULT 'THB',
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  category TEXT NOT NULL,
  next_billing_date DATE NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  linked_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscriptions" 
ON public.subscriptions FOR ALL 
USING (auth.uid() = user_id);

-- 6. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount NUMERIC(14, 2) NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  to_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name TEXT,
  category_icon TEXT,
  credit_card_id UUID REFERENCES public.credit_cards(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  slip_url TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transactions" 
ON public.transactions FOR ALL 
USING (auth.uid() = user_id);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_accounts_user ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_cards_user ON public.credit_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);

-- 7. LOANS TABLE (Money Lent to Others)
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  borrower_name TEXT NOT NULL,
  borrower_contact TEXT,
  original_amount NUMERIC(14, 2) NOT NULL,
  total_paid NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  lent_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  from_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own loans" 
ON public.loans FOR ALL 
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_loans_user ON public.loans(user_id);

-- 8. LOAN REPAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.loan_repayments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  to_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own loan repayments" 
ON public.loan_repayments FOR ALL 
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_loan_repayments_loan ON public.loan_repayments(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_repayments_user ON public.loan_repayments(user_id);

-- 9. Seed Default Categories
INSERT INTO public.categories (name, type, icon, color, is_default) VALUES
  ('อาหารและเครื่องดื่ม', 'expense', 'Utensils', '#F59E0B', TRUE),
  ('เดินทาง / คมนาคม', 'expense', 'Car', '#3B82F6', TRUE),
  ('ช้อปปิ้ง / ของใช้', 'expense', 'ShoppingBag', '#EC4899', TRUE),
  ('ที่พัก / สาธารณูปโภค', 'expense', 'Home', '#8B5CF6', TRUE),
  ('สุขภาพ / ยารักษาโรค', 'expense', 'HeartPulse', '#EF4444', TRUE),
  ('ความบันเทิง', 'expense', 'Film', '#06B6D4', TRUE),
  ('เงินเดือน / รายได้หลัก', 'income', 'Briefcase', '#10B981', TRUE),
  ('โบนัส / ค่าล่วงเวลา', 'income', 'Sparkles', '#14B8A6', TRUE),
  ('การลงทุน / ปันผล', 'income', 'TrendingUp', '#6366F1', TRUE),
  ('รายได้พิเศษ / ฟรีแลนซ์', 'income', 'Laptop', '#84CC16', TRUE),
  ('เงินให้ยืม / ลูกหนี้', 'expense', 'HandCoins', '#F97316', TRUE),
  ('รับคืนเงินยืม / ได้เงินคืน', 'income', 'HandCoins', '#10B981', TRUE)
ON CONFLICT DO NOTHING;

-- 10. INVESTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  platform_name TEXT,
  asset_type TEXT NOT NULL,
  units NUMERIC(16, 6) NOT NULL DEFAULT 0,
  avg_buy_price NUMERIC(16, 4) NOT NULL DEFAULT 0,
  current_price NUMERIC(16, 4) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  exchange_rate NUMERIC(10, 4) DEFAULT 35.5,
  note TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own investments" 
ON public.investments FOR ALL 
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_investments_user ON public.investments(user_id);

-- 11. INVESTMENT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.investment_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  holding_id UUID REFERENCES public.investments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'dividend')),
  units NUMERIC(16, 6) NOT NULL,
  price_per_unit NUMERIC(16, 4) NOT NULL,
  total_amount NUMERIC(16, 4) NOT NULL,
  exchange_rate NUMERIC(10, 4) DEFAULT 35.5,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  from_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.investment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own investment transactions" 
ON public.investment_transactions FOR ALL 
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_inv_txs_user ON public.investment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_inv_txs_holding ON public.investment_transactions(holding_id);

