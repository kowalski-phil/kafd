import { de } from './de'

type TranslationKey = keyof typeof de

export function t(key: TranslationKey): string {
  return de[key]
}
