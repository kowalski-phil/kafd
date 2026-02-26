import { supabase } from './supabase'
import type { Cookbook } from '../lib/types'

export async function getCookbooks(): Promise<Cookbook[]> {
  const { data, error } = await supabase
    .from('cookbooks')
    .select('*')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function createCookbook(name: string, author?: string): Promise<Cookbook> {
  const { data, error } = await supabase
    .from('cookbooks')
    .insert({ name, author: author || null })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCookbook(id: string, updates: Partial<Pick<Cookbook, 'name' | 'author'>>): Promise<Cookbook> {
  const { data, error } = await supabase
    .from('cookbooks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCookbook(id: string): Promise<void> {
  const { error } = await supabase.from('cookbooks').delete().eq('id', id)
  if (error) throw error
}
