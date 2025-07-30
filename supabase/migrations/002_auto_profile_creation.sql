-- Function to create profile automatically when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, favorite_teams, favorite_sports, balance)
  VALUES (NEW.id, '[]'::jsonb, '[]'::jsonb, 0.00);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Allow the trigger to insert profiles (if not already exists)
CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (true); 