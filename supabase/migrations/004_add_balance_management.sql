-- Check if balance column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'balance'
    ) THEN
        ALTER TABLE profiles ADD COLUMN balance integer DEFAULT 1000 CHECK (balance >= 0);
    END IF;
END $$;

-- Update existing users who don't have balance set
UPDATE profiles SET balance = 1000 WHERE balance IS NULL;

-- Update the auto-profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, favorite_teams, favorite_sports, balance)
  VALUES (NEW.id, '[]'::jsonb, '[]'::jsonb, 1000);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add balance-related RLS policies (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can update own balance'
    ) THEN
        CREATE POLICY "Users can update own balance" ON public.profiles
          FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- Function to safely update user balance
CREATE OR REPLACE FUNCTION update_user_balance(user_id uuid, amount_change integer)
RETURNS boolean AS $$
DECLARE
  current_balance integer;
  new_balance integer;
BEGIN
  -- Get current balance
  SELECT balance INTO current_balance 
  FROM public.profiles 
  WHERE id = user_id;
  
  -- Calculate new balance
  new_balance := current_balance + amount_change;
  
  -- Check if new balance would be negative
  IF new_balance < 0 THEN
    RETURN false;
  END IF;
  
  -- Update balance
  UPDATE public.profiles 
  SET balance = new_balance, updated_at = now()
  WHERE id = user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 