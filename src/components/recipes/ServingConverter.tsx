import { Minus, Plus } from 'lucide-react'
import { t } from '../../i18n'

interface ServingConverterProps {
  servings: number
  baseServings: number
  onChange: (servings: number) => void
}

export function ServingConverter({ servings, baseServings, onChange }: ServingConverterProps) {
  return (
    <div className="flex items-center justify-between bg-orange-50 rounded-xl px-4 py-3 mb-6">
      <span className="text-sm font-medium text-gray-700">
        {servings === 1 ? t('recipes.serving') : t('recipes.servings')}
      </span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(1, servings - 1))}
          disabled={servings <= 1}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 disabled:opacity-30"
        >
          <Minus size={16} />
        </button>
        <span className="text-lg font-bold text-orange-600 w-8 text-center">{servings}</span>
        <button
          onClick={() => onChange(servings + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200"
        >
          <Plus size={16} />
        </button>
      </div>
      {servings !== baseServings && (
        <button
          onClick={() => onChange(baseServings)}
          className="text-xs text-orange-500 underline ml-2"
        >
          Reset
        </button>
      )}
    </div>
  )
}
