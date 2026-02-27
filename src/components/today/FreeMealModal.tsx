import { useState } from 'react'
import { t } from '../../i18n'

interface FreeMealModalProps {
  onSave: (calories: number, note: string) => void
  onClose: () => void
}

export function FreeMealModal({ onSave, onClose }: FreeMealModalProps) {
  const [calories, setCalories] = useState('')
  const [note, setNote] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('today.freeMealTitle')}</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {t('today.freeMealCalories')}
            </label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="kcal"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {t('today.freeMealNote')}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm"
            >
              {t('general.cancel')}
            </button>
            <button
              onClick={() => onSave(Number(calories) || 0, note)}
              className="flex-1 py-2 bg-orange-500 text-white rounded-xl font-medium text-sm"
            >
              {t('general.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
