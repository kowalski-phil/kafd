import { t } from '../../i18n'

interface CalorieSummaryProps {
  target: number
  planned: number
  consumed: number
}

export function CalorieSummary({ target, planned, consumed }: CalorieSummaryProps) {
  const remaining = target - consumed
  const percentage = Math.min(100, Math.round((consumed / target) * 100))

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      {/* Progress bar */}
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percentage > 100 ? 'bg-red-400' : percentage > 80 ? 'bg-orange-400' : 'bg-green-400'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-lg font-bold text-gray-800">{consumed}</div>
          <div className="text-[10px] text-gray-400 uppercase">{t('today.consumed')}</div>
        </div>
        <div>
          <div className="text-lg font-bold text-orange-500">{remaining > 0 ? remaining : 0}</div>
          <div className="text-[10px] text-gray-400 uppercase">{t('today.remaining')}</div>
        </div>
        <div>
          <div className="text-lg font-bold text-gray-400">{target}</div>
          <div className="text-[10px] text-gray-400 uppercase">{t('today.target')}</div>
        </div>
      </div>

      {/* Planned indicator if different from consumed */}
      {planned > consumed && (
        <div className="text-center text-xs text-gray-400 mt-2">
          {planned} kcal {t('today.planned')}
        </div>
      )}
    </div>
  )
}
