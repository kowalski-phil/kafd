import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { t } from '../../i18n'

interface PantryStaplesInputProps {
  staples: string[]
  onChange: (staples: string[]) => void
}

export function PantryStaplesInput({ staples, onChange }: PantryStaplesInputProps) {
  const [input, setInput] = useState('')

  function addStaple() {
    const trimmed = input.trim()
    if (trimmed && !staples.includes(trimmed)) {
      onChange([...staples, trimmed])
      setInput('')
    }
  }

  function removeStaple(index: number) {
    onChange(staples.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 block">
        {t('settings.pantryStaples')}
      </label>
      <p className="text-xs text-gray-400 mb-2">{t('settings.pantryHint')}</p>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addStaple() } }}
          className="flex-1 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="z.B. Salz, Pfeffer..."
        />
        <button
          type="button"
          onClick={addStaple}
          className="w-10 h-10 flex items-center justify-center bg-orange-500 text-white rounded-xl"
        >
          <Plus size={18} />
        </button>
      </div>
      {staples.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {staples.map((staple, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-medium"
            >
              {staple}
              <button
                type="button"
                onClick={() => removeStaple(i)}
                className="hover:text-orange-800"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
