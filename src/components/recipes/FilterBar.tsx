import { useState } from 'react'
import { ChevronDown, Heart } from 'lucide-react'
import { CATEGORY_TAGS } from '../../lib/constants'
import { t } from '../../i18n'
import type { RecipeFilters, Cookbook, CategoryTag } from '../../lib/types'

interface FilterBarProps {
  filters: RecipeFilters
  onFiltersChange: (filters: RecipeFilters) => void
  cookbooks: Cookbook[]
}

export function FilterBar({ filters, onFiltersChange, cookbooks }: FilterBarProps) {
  const [expanded, setExpanded] = useState(false)

  function toggleCategory(tag: CategoryTag) {
    const categories = filters.categories.includes(tag)
      ? filters.categories.filter((c) => c !== tag)
      : [...filters.categories, tag]
    onFiltersChange({ ...filters, categories })
  }

  return (
    <div>
      {/* Category chips + favorites + expand */}
      <div className="flex gap-2 items-center overflow-x-auto pb-2 scrollbar-hide">
        {/* Favorites toggle */}
        <button
          onClick={() => onFiltersChange({ ...filters, favoritesOnly: !filters.favoritesOnly })}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
            filters.favoritesOnly
              ? 'bg-red-50 text-red-500 border border-red-200'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          <Heart size={12} />
          {t('filter.favorites')}
        </button>

        {/* Category chips */}
        {CATEGORY_TAGS.map((cat) => (
          <button
            key={cat.value}
            onClick={() => toggleCategory(cat.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
              filters.categories.includes(cat.value)
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {cat.label}
          </button>
        ))}

        {/* Expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 shrink-0"
        >
          Mehr
          <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="mt-2 p-3 bg-white rounded-xl border border-gray-200 space-y-3">
          {/* Cookbook */}
          {cookbooks.length > 0 && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t('filter.cookbook')}</label>
              <select
                value={filters.cookbookId ?? ''}
                onChange={(e) =>
                  onFiltersChange({ ...filters, cookbookId: e.target.value || null })
                }
                className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm"
              >
                <option value="">{t('filter.all')}</option>
                {cookbooks.map((cb) => (
                  <option key={cb.id} value={cb.id}>
                    {cb.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Max prep time */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              {t('filter.maxPrepTime')} {filters.prepTimeMax ? `(${filters.prepTimeMax} Min.)` : ''}
            </label>
            <input
              type="range"
              min={0}
              max={120}
              step={5}
              value={filters.prepTimeMax ?? 120}
              onChange={(e) => {
                const val = parseInt(e.target.value)
                onFiltersChange({ ...filters, prepTimeMax: val >= 120 ? null : val })
              }}
              className="w-full accent-orange-500"
            />
          </div>

          {/* Sort */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t('filter.sort')}</label>
            <div className="flex gap-2">
              {[
                { value: 'title' as const, label: t('filter.sortAlpha') },
                { value: 'calories' as const, label: t('filter.sortCalories') },
                { value: 'prep_time' as const, label: t('filter.sortTime') },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (filters.sortBy === opt.value) {
                      onFiltersChange({
                        ...filters,
                        sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc',
                      })
                    } else {
                      onFiltersChange({ ...filters, sortBy: opt.value, sortDirection: 'asc' })
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filters.sortBy === opt.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {opt.label} {filters.sortBy === opt.value && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
