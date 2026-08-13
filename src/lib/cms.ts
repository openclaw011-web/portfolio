import type { Content, Locale } from './types'

/**
 * Headless CMS content layer.
 *
 * The site ships with fully bundled content (src/content/*.json) so it works
 * anywhere with zero credentials. When you want to manage content through a
 * headless CMS instead, point VITE_CMS_URL at any endpoint that serves:
 *
 *   { "en": { ...Content }, "ne": { ...Content } }
 *
 * Compatible with Sanity (GROQ/HTTP API), Contentful (delivery API) or any
 * serverless JSON endpoint. Example wiring is documented in the README.
 */

const CMS_URL = import.meta.env.VITE_CMS_URL as string | undefined

let remoteCache: Record<Locale, Content> | null = null
let remoteCachePromise: Promise<Record<Locale, Content> | null> | null = null

export function isCmsConfigured(): boolean {
  return Boolean(CMS_URL)
}

/** Fetch remote content once; falls back to null (caller uses local dicts). */
export function fetchRemoteContent(): Promise<Record<Locale, Content> | null> {
  if (!CMS_URL) return Promise.resolve(null)
  if (remoteCache) return Promise.resolve(remoteCache)
  if (!remoteCachePromise) {
    remoteCachePromise = (async () => {
      try {
        const res = await fetch(CMS_URL, { cache: 'no-store' })
        if (!res.ok) return null
        const json = (await res.json()) as Partial<Record<Locale, Content>>
        const en = json.en && json.en.hero ? json.en : null
        const ne = json.ne && json.ne.hero ? json.ne : null
        if (!en && !ne) return null
        remoteCache = {
          en: en ?? (json.ne as Content),
          ne: ne ?? (json.en as Content),
        }
        return remoteCache
      } catch {
        return null
      }
    })()
  }
  return remoteCachePromise
}
