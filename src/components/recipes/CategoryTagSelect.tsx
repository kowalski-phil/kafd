import { CATEGORY_TAGS } from '../../lib/constants'
import type { CategoryTag } from '../../lib/types'

interface CategoryTagSelectProps {
  selected: CategoryTag[]
  onChange: (tags: CategoryTag[]) => void
}

export function CategoryTagSelect({ selected, onChange }: CategoryTagSelectProps) {
  function toggle(tag: CategoryTag) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag))
    } else {
      onChange([...selected, tag])
    }
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {CATEGORY_TAGS.map((cat) => (
        <button
          key={cat.value}
          type="button"
          onClick={() => toggle(cat.value)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected.includes(cat.value)
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
