import { supabase } from './supabase'
import type { ShoppingList, ShoppingListItem } from '../lib/types'

export async function getShoppingList(weekStart: string): Promise<ShoppingList | null> {
  const { data, error } = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('week_start', weekStart)
    .single()
  if (error && error.code === 'PGRST116') return null
  if (error) throw error
  return data
}

export async function upsertShoppingList(
  weekStart: string,
  items: ShoppingListItem[]
): Promise<ShoppingList> {
  const { data, error } = await supabase
    .from('shopping_lists')
    .upsert({ week_start: weekStart, items }, { onConflict: 'week_start' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateShoppingItems(
  id: string,
  items: ShoppingListItem[]
): Promise<void> {
  const { error } = await supabase
    .from('shopping_lists')
    .update({ items })
    .eq('id', id)
  if (error) throw error
}
