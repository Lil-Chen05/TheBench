import { createClient } from "@/lib/supabase/client";

export interface UserProfile {
  id: string;
  favorite_teams: string[];
  favorite_sports: string[];
  balance: number;
  created_at: string;
  updated_at: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient();
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
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      favorite_teams: [],
      favorite_sports: [],
      balance: 1000
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
  const supabase = createClient();
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
  const supabase = createClient();
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
  const supabase = createClient();
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

export async function getBalanceOnly(userId: string): Promise<number | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('balance')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user balance:', error);
    return null;
  }
  
  return data?.balance || null;
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
  const profile = await getUserProfile(userId);
  if (!profile) return false;
  
  const updatedTeams = [...profile.favorite_teams, teamId];
  return await updateFavoriteTeams(userId, updatedTeams);
}

export async function removeFavoriteTeam(userId: string, teamId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  if (!profile) return false;
  
  const updatedTeams = profile.favorite_teams.filter(id => id !== teamId);
  return await updateFavoriteTeams(userId, updatedTeams);
}

export async function getUserBalance(userId: string): Promise<number> {
  const balance = await getBalanceOnly(userId);
  return balance || 0;
}

export async function updateUserBalance(userId: string, amount: number): Promise<boolean> {
  const currentBalance = await getUserBalance(userId);
  const newBalance = currentBalance + amount;
  
  if (newBalance < 0) {
    console.error('Insufficient balance');
    return false;
  }
  
  return await updateBalance(userId, newBalance);
}

export async function addCreditsToUser(userId: string, amount: number): Promise<boolean> {
  return await updateUserBalance(userId, amount);
}

export async function deductCreditsFromUser(userId: string, amount: number): Promise<boolean> {
  return await updateUserBalance(userId, -amount);
}

export async function checkUserBalance(userId: string, requiredAmount: number): Promise<boolean> {
  const currentBalance = await getUserBalance(userId);
  return currentBalance >= requiredAmount;
} 