import { Clock, Flame, Heart } from 'lucide-react'
import { CATEGORY_TAGS } from '../../lib/constants'
import { t } from '../../i18n'
import type { Recipe } from '../../lib/types'

interface RecipeCardProps {
  recipe: Recipe
  onClick: () => void
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left active:bg-gray-50 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-800 truncate">{recipe.title}</h3>
            {recipe.is_favorite && (
              <Heart size={14} className="fill-red-500 text-red-500 shrink-0" />
            )}
          </div>

          {recipe.cookbook && (
            <p className="text-xs text-gray-400 mb-2 truncate">{recipe.cookbook.name}</p>
          )}

          <div className="flex gap-3 text-xs text-gray-500 mb-2">
            {recipe.calories != null && (
              <span className="flex items-center gap-1">
                <Flame size={12} className="text-orange-400" />
                {recipe.calories} {t('recipes.calories')}
              </span>
            )}
            {recipe.prep_time_minutes != null && (
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-gray-400" />
                {recipe.prep_time_minutes} {t('recipes.minutes')}
              </span>
            )}
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {recipe.category_tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-medium"
              >
                {CATEGORY_TAGS.find((c) => c.value === tag)?.label ?? tag}
              </span>
            ))}
          </div>
        </div>

        {recipe.photo_url && (
          <img
            src={recipe.photo_url}
            alt=""
            className="w-16 h-16 rounded-lg object-cover ml-3 shrink-0"
          />
        )}
      </div>
    </button>
  )
}
