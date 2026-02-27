import { supabase } from './supabase'
import type { WeightLogEntry } from '../lib/types'

export async function getWeightLog(limit = 90): Promise<WeightLogEntry[]> {
  const { data, error } = await supabase
    .from('weight_log')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function logWeight(date: string, weight_kg: number): Promise<WeightLogEntry> {
  const { data, error } = await supabase
    .from('weight_log')
    .upsert({ date, weight_kg }, { onConflict: 'date' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteWeightEntry(id: string): Promise<void> {
  const { error } = await supabase.from('weight_log').delete().eq('id', id)
  if (error) throw error
}
