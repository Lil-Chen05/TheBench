-- Create profiles table extending auth.users
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  favorite_teams jsonb DEFAULT '[]'::jsonb,
  favorite_sports jsonb DEFAULT '[]'::jsonb,
  balance decimal(10,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create basketballteams table
CREATE TABLE public.basketballteams (
  id serial PRIMARY KEY,
  team_name text NOT NULL,
  abbr text NOT NULL,
  city text NOT NULL,
  province text NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.basketballteams ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Everyone can view teams" ON public.basketballteams
  FOR SELECT TO authenticated USING (true);

-- Insert basketball teams data
INSERT INTO public.basketballteams (team_name, abbr, city, province) VALUES
('Acadia Axemen', 'ACA', 'Wolfville', 'NS'),
('Algoma Thunderbirds', 'ALG', 'Sault Ste. Marie', 'ON'),
('Alberta Golden Bears', 'ALB', 'Edmonton', 'AB'),
('Bishop''s Gaiters', 'BIS', 'Sherbrooke', 'QC'),
('Brandon Bobcats', 'BRA', 'Brandon', 'MB'),
('Brock Badgers', 'BRO', 'St. Catharines', 'ON'),
('Calgary Dinos', 'CGY', 'Calgary', 'AB'),
('Cape Breton Capers', 'CBR', 'Sydney', 'NS'),
('Carleton Ravens', 'CAR', 'Ottawa', 'ON'),
('Concordia Stingers', 'CON', 'Montreal', 'QC'),
('Dalhousie Tigers', 'DAL', 'Halifax', 'NS'),
('Guelph Gryphons', 'GUE', 'Guelph', 'ON'),
('Lakehead Thunderwolves', 'LAK', 'Thunder Bay', 'ON'),
('Laurentian Voyageurs', 'LAU', 'Sudbury', 'ON'),
('Laval Rouge et Or', 'LAV', 'Quebec City', 'QC'),
('Lethbridge Pronghorns', 'LET', 'Lethbridge', 'AB'),
('MacEwan Griffins', 'MCE', 'Edmonton', 'AB'),
('McGill Redbirds', 'MCG', 'Montreal', 'QC'),
('McMaster Marauders', 'MCM', 'Hamilton', 'ON'),
('Memorial Sea-Hawks', 'SEA', 'St. John''s', 'NL'),
('Mount Royal University Cougars', 'MRU', 'Calgary', 'AB'),
('Manitoba Bisons', 'MAN', 'Winnipeg', 'MB'),
('Nipissing Lakers', 'NIP', 'North Bay', 'ON'),
('Ontario Tech Ridgebacks', 'ONT', 'Oshawa', 'ON'),
('Ottawa Gee Gees', 'OTT', 'Ottawa', 'ON'),
('Prince Edward Island Panthers', 'UPEI', 'Charlottetown', 'PE'),
('Queen''s Gaels', 'QUE', 'Kingston', 'ON'),
('Regina Cougars', 'REG', 'Regina', 'SK'),
('St. Francis Xavier X-Men', 'STX', 'Antigonish', 'NS'),
('Saint Mary''s Huskies', 'SMU', 'Halifax', 'NS'),
('Saskatchewan Huskies', 'SAS', 'Saskatoon', 'SK'),
('Toronto Varsity Blues', 'TOR', 'Toronto', 'ON'),
('TMU Bold', 'TMU', 'Toronto', 'ON'),
('Thompson Rivers WolfPack', 'TRU', 'Kamloops', 'BC'),
('Trinity Western Spartans', 'TWU', 'Langley', 'BC'),
('UBC Thunderbirds', 'UBC', 'Vancouver', 'BC'),
('UBC Okanagan Heat', 'OKA', 'Kelowna', 'BC'),
('UFV Cascades', 'UFV', 'Abbotsford', 'BC'),
('UNB Reds', 'UNB', 'Fredericton', 'NB'),
('UNBC Timberwolves', 'UNC', 'Prince George', 'BC'),
('UQAM Citadins', 'UQA', 'Montreal', 'QC'),
('Victoria Vikes', 'VIU', 'Victoria', 'BC'),
('Waterloo Warriors', 'WAT', 'Waterloo', 'ON'),
('Western Mustangs', 'WES', 'London', 'ON'),
('Wilfrid Laurier Golden Hawks', 'WLH', 'Waterloo', 'ON'),
('Windsor Lancers', 'WIN', 'Windsor', 'ON'),
('Winnipeg Wesmen', 'WWM', 'Winnipeg', 'MB'),
('York Lions', 'YOR', 'Toronto', 'ON'); 