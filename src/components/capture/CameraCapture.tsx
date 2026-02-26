import { useRef } from 'react'
import { Camera, ImagePlus } from 'lucide-react'
import { t } from '../../i18n'

interface CameraCaptureProps {
  onCapture: (file: File) => void
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onCapture(file)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <Camera size={64} className="text-gray-300 mb-6" />
      <h2 className="text-xl font-semibold text-gray-700 mb-2">{t('capture.title')}</h2>
      <p className="text-sm text-gray-400 text-center mb-8">
        Fotografiere eine Kochbuchseite, um das Rezept automatisch zu erfassen.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {/* Camera capture (mobile) */}
        <label className="flex items-center justify-center gap-2 w-full py-3 bg-orange-500 text-white rounded-xl text-sm font-medium active:bg-orange-600 cursor-pointer">
          <Camera size={20} />
          {t('capture.takePhoto')}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleChange}
            className="hidden"
          />
        </label>

        {/* Gallery select */}
        <label className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium active:bg-gray-200 cursor-pointer">
          <ImagePlus size={20} />
          {t('capture.selectPhoto')}
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  )
}
