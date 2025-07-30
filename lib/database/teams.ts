import { createClient } from "@/lib/supabase/server";

export interface BasketballTeam {
  id: number;
  team_name: string;
  abbr: string;
  city: string;
  province: string;
}

export async function getAllTeams(): Promise<BasketballTeam[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('basketballteams')
    .select('*')
    .order('team_name');
  
  if (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
  
  return data || [];
}

export async function getTeamsByProvince(province: string): Promise<BasketballTeam[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('basketballteams')
    .select('*')
    .eq('province', province)
    .order('team_name');
  
  if (error) {
    console.error('Error fetching teams by province:', error);
    return [];
  }
  
  return data || [];
}

export async function getTeamById(id: number): Promise<BasketballTeam | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('basketballteams')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching team by ID:', error);
    return null;
  }
  
  return data;
}

export async function getTeamByAbbr(abbr: string): Promise<BasketballTeam | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('basketballteams')
    .select('*')
    .eq('abbr', abbr)
    .single();
  
  if (error) {
    console.error('Error fetching team by abbreviation:', error);
    return null;
  }
  
  return data;
}

export async function getProvinces(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('basketballteams')
    .select('province')
    .order('province');
  
  if (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
  
  // Remove duplicates and return unique provinces
  const provinces = [...new Set(data?.map(team => team.province) || [])];
  return provinces;
} 