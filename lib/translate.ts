/** Translates English text to Hindi using the free MyMemory API (no key needed). */
export async function translateToHindi(text: string): Promise<string> {
  if (!text.trim()) return text
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|hi`
    const res  = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return text
    const data = await res.json()
    const translated: unknown = data?.responseData?.translatedText
    return typeof translated === 'string' && translated ? translated : text
  } catch {
    return text
  }
}
