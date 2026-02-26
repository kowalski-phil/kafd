import { supabase } from './supabase'
import type { Recipe } from '../lib/types'

export async function getRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*, cookbook:cookbooks(id, name)')
    .order('title')
  if (error) throw error
  return data ?? []
}

export async function getRecipe(id: string): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*, cookbook:cookbooks(id, name)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createRecipe(recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'cookbook'>): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .insert(recipe)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe> {
  const { cookbook: _, ...cleanUpdates } = updates as Record<string, unknown>
  const { data, error } = await supabase
    .from('recipes')
    .update(cleanUpdates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase.from('recipes').delete().eq('id', id)
  if (error) throw error
}

export async function toggleFavorite(id: string, current: boolean): Promise<void> {
  const { error } = await supabase
    .from('recipes')
    .update({ is_favorite: !current })
    .eq('id', id)
  if (error) throw error
}
