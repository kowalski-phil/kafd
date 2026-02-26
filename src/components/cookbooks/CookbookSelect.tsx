import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { getCookbooks, createCookbook } from '../../api/cookbooks'
import { t } from '../../i18n'
import type { Cookbook } from '../../lib/types'

interface CookbookSelectProps {
  value: string | null
  onChange: (id: string | null) => void
}

export function CookbookSelect({ value, onChange }: CookbookSelectProps) {
  const [cookbooks, setCookbooks] = useState<Cookbook[]>([])
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getCookbooks().then(setCookbooks).catch(console.error)
  }, [])

  async function handleCreateCookbook() {
    if (!newName.trim()) return
    setSaving(true)
    try {
      const cb = await createCookbook(newName.trim(), newAuthor.trim() || undefined)
      setCookbooks([...cookbooks, cb])
      onChange(cb.id)
      setShowNew(false)
      setNewName('')
      setNewAuthor('')
    } catch (err) {
      console.error('Failed to create cookbook:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 block">
        {t('cookbook.select')}
      </label>

      <div className="flex gap-2">
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="flex-1 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">{t('cookbook.none')}</option>
          {cookbooks.map((cb) => (
            <option key={cb.id} value={cb.id}>
              {cb.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setShowNew(!showNew)}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
        >
          <Plus size={18} />
        </button>
      </div>

      {showNew && (
        <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
          <input
            type="text"
            placeholder={t('cookbook.name')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            placeholder={t('cookbook.author')}
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="button"
            onClick={handleCreateCookbook}
            disabled={!newName.trim() || saving}
            className="w-full py-2 bg-orange-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {saving ? t('general.loading') : t('general.save')}
          </button>
        </div>
      )}
    </div>
  )
}
