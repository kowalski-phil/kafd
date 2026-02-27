import { supabase } from './supabase'
import type { UserSettings } from '../lib/types'

export async function getUserSettings(): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .limit(1)
    .single()
  if (error && error.code === 'PGRST116') return null // no rows
  if (error) throw error
  return data
}

export async function upsertUserSettings(
  settings: Partial<Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>>
): Promise<UserSettings> {
  // Try to get existing row
  const existing = await getUserSettings()

  if (existing) {
    const { data, error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase
      .from('user_settings')
      .insert(settings)
      .select()
      .single()
    if (error) throw error
    return data
  }
}
