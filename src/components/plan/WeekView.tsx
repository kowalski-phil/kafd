import type { MealPlanWithRecipe } from '../../lib/types'
import { getWeekDates, toDateString } from '../../lib/dateUtils'
import { DayColumn } from './DayColumn'

interface WeekViewProps {
  weekStart: Date
  plans: MealPlanWithRecipe[]
  onTapMeal: (plan: MealPlanWithRecipe) => void
}

export function WeekView({ weekStart, plans, onTapMeal }: WeekViewProps) {
  const dates = getWeekDates(weekStart)

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 px-4 snap-x snap-mandatory">
      {dates.map((date) => {
        const dateStr = toDateString(date)
        const dayPlans = plans.filter((p) => p.date === dateStr)
        return (
          <DayColumn
            key={dateStr}
            date={date}
            plans={dayPlans}
            onTapMeal={onTapMeal}
          />
        )
      })}
    </div>
  )
}
