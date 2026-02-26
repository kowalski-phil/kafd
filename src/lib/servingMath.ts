import type { Ingredient } from './types'

export function convertServings(
  ingredients: Ingredient[],
  baseServings: number,
  targetServings: number
): Ingredient[] {
  if (baseServings === targetServings) return ingredients
  const ratio = targetServings / baseServings
  return ingredients.map((ing) => ({
    ...ing,
    amount: smartRound(ing.amount * ratio, ing.unit, ing.name),
  }))
}

export function convertCalories(
  baseCalories: number | null,
  baseServings: number,
  targetServings: number
): number | null {
  if (baseCalories == null) return null
  return Math.round(baseCalories * (targetServings / baseServings))
}

function smartRound(value: number, unit: string, name: string): number {
  if (value <= 0) return 0

  // Eggs: round up to whole numbers
  if (isEgg(name)) {
    return Math.ceil(value)
  }

  // Spices: minimum thresholds
  const unitLower = unit.toLowerCase()
  if (unitLower === 'prise') {
    return Math.max(1, Math.round(value))
  }
  if (unitLower === 'tl' || unitLower === 'messerspitze') {
    return Math.max(0.25, roundToNearest(value, 0.25))
  }

  // Liquids: round to 10ml
  if (isLiquidUnit(unitLower)) {
    return Math.max(10, roundToNearest(value, 10))
  }

  // Weights: tiered rounding
  if (isWeightUnit(unitLower)) {
    if (value < 50) return Math.max(5, roundToNearest(value, 5))
    if (value < 200) return roundToNearest(value, 10)
    return roundToNearest(value, 25)
  }

  // Pieces (Stück): round to nearest 0.5
  if (unitLower === 'stück' || unitLower === 'stk') {
    return Math.max(0.5, roundToNearest(value, 0.5))
  }

  // Default: 1 decimal
  return Math.round(value * 10) / 10
}

function roundToNearest(value: number, increment: number): number {
  return Math.round(value / increment) * increment
}

function isEgg(name: string): boolean {
  const n = name.toLowerCase()
  return n === 'ei' || n === 'eier' || n.includes('ei(er)') || n === 'eigelb' || n === 'eiweiß'
}

function isLiquidUnit(unit: string): boolean {
  return ['ml', 'l', 'cl', 'dl'].includes(unit)
}

function isWeightUnit(unit: string): boolean {
  return ['g', 'kg'].includes(unit)
}
