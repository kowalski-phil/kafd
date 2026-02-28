import { supabase } from './supabase'
import type { MealPlan, MealPlanWithRecipe } from '../lib/types'

export async function getMealPlansForDateRange(
  startDate: string,
  endDate: string
): Promise<MealPlanWithRecipe[]> {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('*, recipe:recipes(id, title, calories, prep_time_minutes, photo_url, base_servings, ingredients, steps, category_tags)')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')
    .order('meal_type')
  if (error) throw error
  return data ?? []
}

export async function getMealPlansForDate(date: string): Promise<MealPlanWithRecipe[]> {
  return getMealPlansForDateRange(date, date)
}

export async function upsertMealPlans(
  plans: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>[]
): Promise<MealPlan[]> {
  const { data, error } = await supabase
    .from('meal_plans')
    .upsert(plans, { onConflict: 'date,meal_type' })
    .select()
  if (error) throw error
  return data ?? []
}

export async function updateMealPlan(
  id: string,
  updates: Partial<MealPlan>
): Promise<MealPlan> {
  const { data, error } = await supabase
    .from('meal_plans')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteMealPlansForDateRange(
  startDate: string,
  endDate: string,
  keepCompleted = true
): Promise<void> {
  let query = supabase
    .from('meal_plans')
    .delete()
    .gte('date', startDate)
    .lte('date', endDate)
  if (keepCompleted) {
    query = query.eq('is_completed', false)
  }
  const { error } = await query
  if (error) throw error
}

export async function completeMealPlan(id: string): Promise<void> {
  const { error } = await supabase
    .from('meal_plans')
    .update({ is_completed: true })
    .eq('id', id)
  if (error) throw error
}

export async function uncompleteMealPlan(id: string): Promise<void> {
  const { error } = await supabase
    .from('meal_plans')
    .update({
      is_completed: false,
      is_free_meal: false,
      free_meal_calories: null,
      free_meal_note: null,
    })
    .eq('id', id)
  if (error) throw error
}

export async function markFreeMeal(
  id: string,
  calories: number,
  note: string
): Promise<void> {
  const { error } = await supabase
    .from('meal_plans')
    .update({
      is_completed: true,
      is_free_meal: true,
      free_meal_calories: calories,
      free_meal_note: note,
      recipe_id: null,
    })
    .eq('id', id)
  if (error) throw error
}
