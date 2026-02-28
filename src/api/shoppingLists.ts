import { supabase } from './supabase'
import type { ShoppingList, ShoppingListItem, Ingredient } from '../lib/types'

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

/** Add recipe ingredients to the current week's shopping list, merging duplicates */
export async function addRecipeToShoppingList(
  weekStart: string,
  ingredients: Ingredient[]
): Promise<void> {
  const existing = await getShoppingList(weekStart)
  const currentItems = existing?.items ?? []

  // Merge: if same name+unit exists, add amounts; otherwise append
  const merged = [...currentItems]
  for (const ing of ingredients) {
    if (!ing.name.trim()) continue
    const key = `${ing.name.toLowerCase().trim()}|${ing.unit.toLowerCase().trim()}`
    const existingIdx = merged.findIndex(
      m => `${m.name.toLowerCase().trim()}|${m.unit.toLowerCase().trim()}` === key
    )
    if (existingIdx >= 0) {
      merged[existingIdx] = {
        ...merged[existingIdx],
        amount: Math.round((merged[existingIdx].amount + ing.amount) * 10) / 10,
      }
    } else {
      merged.push({
        name: ing.name,
        amount: Math.round(ing.amount * 10) / 10,
        unit: ing.unit,
        category: ing.category,
        is_checked: false,
      })
    }
  }

  await upsertShoppingList(weekStart, merged)
}
