export type LocalizedString = { en: string; hi: string } | string

/**
 * Resolves a field that may be either a plain string (old docs) or a
 * { en, hi } object (bilingual docs) into the correct locale string.
 * Falls back to English if the requested locale is missing.
 */
export function getLocalized(
  field: LocalizedString | null | undefined,
  locale: string,
): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  const map = field as Record<string, string>
  return map[locale] ?? map.en ?? ''
}
