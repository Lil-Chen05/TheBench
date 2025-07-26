import { createClient } from "@/lib/supabase/server";

export interface UserProfile {
  id: string;
  favorite_teams: string[];
  favorite_sports: string[];
  balance: number;
  created_at: string;
  updated_at: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
}

export async function createUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      favorite_teams: [],
      favorite_sports: [],
      balance: 0.00
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
  
  return data;
}

export async function updateFavoriteTeams(userId: string, favoriteTeams: string[]): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      favorite_teams: favoriteTeams,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating favorite teams:', error);
    return false;
  }
  
  return true;
}

export async function updateFavoriteSports(userId: string, favoriteSports: string[]): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      favorite_sports: favoriteSports,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating favorite sports:', error);
    return false;
  }
  
  return true;
}

export async function updateBalance(userId: string, balance: number): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      balance: balance,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating balance:', error);
    return false;
  }
  
  return true;
}

export async function getUserProfileOrCreate(userId: string): Promise<UserProfile | null> {
  let profile = await getUserProfile(userId);
  
  if (!profile) {
    profile = await createUserProfile(userId);
  }
  
  return profile;
}

export async function hasFavoriteTeams(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return profile ? profile.favorite_teams.length > 0 : false;
}

export async function hasFavoriteSports(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return profile ? profile.favorite_sports.length > 0 : false;
}

export async function addFavoriteTeam(userId: string, teamId: string): Promise<boolean> {
  const profile = await getUserProfileOrCreate(userId);
  if (!profile) return false;
  
  const currentFavorites = profile.favorite_teams || [];
  if (!currentFavorites.includes(teamId)) {
    currentFavorites.push(teamId);
    return await updateFavoriteTeams(userId, currentFavorites);
  }
  
  return true;
}

export async function removeFavoriteTeam(userId: string, teamId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  if (!profile) return false;
  
  const currentFavorites = profile.favorite_teams || [];
  const updatedFavorites = currentFavorites.filter(id => id !== teamId);
  return await updateFavoriteTeams(userId, updatedFavorites);
} 