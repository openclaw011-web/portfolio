import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Content, Locale } from './types'
import en from '../content/en.json'
import ne from '../content/ne.json'
import { fetchRemoteContent, isCmsConfigured } from './cms'

let DICTS: Record<Locale, Content> = { en, ne }
const KEY = 'pa-locale'

interface I18nCtx {
  locale: Locale
  content: Content
  setLocale: (l: Locale) => void
  t: Content
}

const Ctx = createContext<I18nCtx | null>(null)

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  const saved = localStorage.getItem(KEY)
  if (saved === 'en' || saved === 'ne') return saved
  const nav = navigator.languages ?? [navigator.language ?? 'en']
  return nav.some((l) => l.toLowerCase().startsWith('ne')) ? 'ne' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)
  const [, forceRender] = useState(0)

  // Hydrate from the headless CMS when configured; otherwise bundled dicts.
  useEffect(() => {
    if (!isCmsConfigured()) return
    let alive = true
    fetchRemoteContent().then((remote) => {
      if (remote && alive) {
        DICTS = remote
        forceRender((n) => n + 1)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(KEY, locale)
    document.documentElement.lang = locale
    document.title = DICTS[locale].meta.title
  }, [locale, forceRender])

  const setLocale = useCallback((l: Locale) => setLocaleState(l), [])

  const value = useMemo<I18nCtx>(
    () => ({ locale, content: DICTS[locale], t: DICTS[locale], setLocale }),
    [locale, setLocale]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n(): I18nCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
