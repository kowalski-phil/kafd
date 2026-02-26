import type { Ingredient } from '../../lib/types'

interface IngredientListProps {
  ingredients: Ingredient[]
}

function formatAmount(amount: number): string {
  if (amount === 0) return ''
  if (Number.isInteger(amount)) return amount.toString()
  return amount.toFixed(1).replace(/\.0$/, '')
}

export function IngredientList({ ingredients }: IngredientListProps) {
  return (
    <ul className="space-y-2">
      {ingredients.map((ing, i) => (
        <li key={i} className="flex items-baseline gap-2 text-sm">
          <span className="text-gray-400 shrink-0 w-16 text-right">
            {formatAmount(ing.amount)} {ing.unit}
          </span>
          <span className="text-gray-700">{ing.name}</span>
        </li>
      ))}
    </ul>
  )
}
