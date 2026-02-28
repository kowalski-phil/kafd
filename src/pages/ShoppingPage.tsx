import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Loader2, Plus, ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import { t } from '../i18n'
import { getShoppingList, upsertShoppingList, updateShoppingItems } from '../api/shoppingLists'
import { getMealPlansForDateRange } from '../api/mealPlans'
import { getUserSettings } from '../api/userSettings'
import { aggregateIngredients } from '../lib/shoppingAggregator'
import { getWeekStart, getWeekDates, toDateString, formatDateRange, offsetWeek } from '../lib/dateUtils'
import { INGREDIENT_CATEGORIES } from '../lib/constants'
import type { ShoppingList, ShoppingListItem, IngredientCategory } from '../lib/types'
import { ChevronLeft } from 'lucide-react'

export function ShoppingPage() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const [list, setList] = useState<ShoppingList | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

  const weekDates = getWeekDates(weekStart)
  const startStr = toDateString(weekDates[0])
  const endStr = toDateString(weekDates[6])

  const loadList = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getShoppingList(startStr)
      setList(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [startStr])

  useEffect(() => { loadList() }, [loadList])

  async function handleGenerate() {
    setGenerating(true)
    try {
      const [plans, settings] = await Promise.all([
        getMealPlansForDateRange(startStr, endStr),
        getUserSettings(),
      ])
      const items = aggregateIngredients(plans, settings?.pantry_staples ?? [])
      const saved = await upsertShoppingList(startStr, items)
      setList(saved)
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  async function handleToggleItem(index: number) {
    if (!list) return
    const updated = list.items.map((item, i) =>
      i === index ? { ...item, is_checked: !item.is_checked } : item
    )
    setList({ ...list, items: updated })
    try {
      await updateShoppingItems(list.id, updated)
    } catch {
      // revert on error
      setList(list)
    }
  }

  async function handleAddItem() {
    if (!list || !newItemName.trim()) return
    const newItem: ShoppingListItem = {
      name: newItemName.trim(),
      amount: 0,
      unit: '',
      category: 'other',
      is_checked: false,
    }
    const updated = [...list.items, newItem]
    setList({ ...list, items: updated })
    setNewItemName('')
    try {
      await updateShoppingItems(list.id, updated)
    } catch {
      // silently fail
    }
  }

  async function handleDeleteItem(index: number) {
    if (!list) return
    const updated = list.items.filter((_, i) => i !== index)
    setList({ ...list, items: updated })
    try {
      await updateShoppingItems(list.id, updated)
    } catch {
      // silently fail
    }
  }

  function toggleCategory(cat: string) {
    setCollapsedCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  // Group items by category
  const grouped = new Map<IngredientCategory, { item: ShoppingListItem; index: number }[]>()
  list?.items.forEach((item, index) => {
    const group = grouped.get(item.category) ?? []
    group.push({ item, index })
    grouped.set(item.category, group)
  })

  const checkedCount = list?.items.filter(i => i.is_checked).length ?? 0
  const totalCount = list?.items.length ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with week navigation */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <button onClick={() => setWeekStart(offsetWeek(weekStart, -1))} className="p-2 -ml-2">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-sm font-semibold text-gray-700">
          {formatDateRange(weekDates[0], weekDates[6])}
        </h1>
        <button onClick={() => setWeekStart(offsetWeek(weekStart, 1))} className="p-2 -mr-2">
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="px-4 py-4 space-y-4 pb-24">
        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-2.5 bg-orange-500 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {t('shopping.generating')}
            </>
          ) : list ? (
            <>
              <RefreshCw size={16} />
              {t('shopping.regenerate')}
            </>
          ) : (
            t('shopping.generate')
          )}
        </button>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-orange-500" />
          </div>
        ) : !list ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {t('shopping.empty')}
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="text-xs text-gray-400 text-center">
              {checkedCount} / {totalCount} {t('shopping.checked')}
            </div>

            {/* Category sections */}
            {INGREDIENT_CATEGORIES.map(cat => {
              const entries = grouped.get(cat.value)
              if (!entries || entries.length === 0) return null
              const isCollapsed = collapsedCategories.has(cat.value)
              return (
                <div key={cat.value} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => toggleCategory(cat.value)}
                    className="w-full px-4 py-3 flex items-center justify-between"
                  >
                    <span className="text-sm font-semibold text-gray-700">{cat.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {entries.filter(e => e.item.is_checked).length}/{entries.length}
                      </span>
                      {isCollapsed ? <ChevronRight size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </button>
                  {!isCollapsed && (
                    <div className="border-t border-gray-50">
                      {entries.map(({ item, index }) => (
                        <div key={index} className="flex items-center px-4 py-2.5">
                          <button
                            onClick={() => handleToggleItem(index)}
                            className="flex-1 flex items-center gap-3 active:bg-gray-50 min-w-0"
                          >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                              item.is_checked ? 'bg-green-500 border-green-500' : 'border-gray-300'
                            }`}>
                              {item.is_checked && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                            <span className={`flex-1 text-left text-sm truncate ${item.is_checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                              {item.amount > 0 && `${item.amount} ${item.unit} `}
                              {item.name}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteItem(index)}
                            className="p-1.5 ml-1 text-gray-300 hover:text-red-500 flex-shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Manual add */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                placeholder={t('shopping.addItem')}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm"
              />
              <button
                onClick={handleAddItem}
                disabled={!newItemName.trim()}
                className="px-3 py-2 bg-orange-500 text-white rounded-xl disabled:opacity-50"
              >
                <Plus size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
