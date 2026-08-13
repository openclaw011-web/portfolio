import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { scrollToTarget } from '../lib/lenis'
import { useI18n } from '../lib/i18n'
import type { Locale } from '../lib/types'
import './nav.css'

interface Props {
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  locale: Locale
  onSetLocale: (l: Locale) => void
}

const LINKS = [
  { id: 'about', key: 'about' },
  { id: 'work', key: 'work' },
  { id: 'capabilities', key: 'capabilities' },
  { id: 'journey', key: 'journey' },
  { id: 'contact', key: 'contact' },
] as const

export default function Nav({ theme, onToggleTheme, locale, onSetLocale }: Props) {
  const { t } = useI18n()
  const ref = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: -64, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          delay: 3.3,
          ease: 'power3.out',
          onComplete: () => gsap.set(el, { clearProps: 'transform' }),
        }
      )
    }, el)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
  }, [menuOpen])

  const go = (id: string) => {
    setMenuOpen(false)
    setTimeout(() => scrollToTarget('#' + id), menuOpen ? 450 : 0)
  }

  return (
    <header ref={ref} className={'nav' + (scrolled ? ' nav--scrolled' : '')}>
      <div className="nav-inner container">
        <a
          className="nav-logo"
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            go('top')
          }}
          aria-label="Prabesh Amgain — home"
        >
          <span className="nav-logo-mark display">P</span>
          <span className="nav-logo-name mono">Prabesh Amgain</span>
        </a>

        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.id} href={'#' + l.id} onClick={(e) => { e.preventDefault(); go(l.id) }}>
              <span className="nav-link-num mono">0{LINKS.indexOf(l) + 1}</span>
              {t.nav[l.key]}
            </a>
          ))}
        </nav>

        <div className="nav-controls">
          <button
            className="nav-control mono"
            onClick={() => onSetLocale(locale === 'en' ? 'ne' : 'en')}
            aria-label={t.footer.lang}
            title={t.footer.lang}
          >
            {locale === 'en' ? 'ने' : 'EN'}
          </button>
          <button
            className="nav-control mono"
            onClick={onToggleTheme}
            aria-label={t.footer.theme}
            title={t.footer.theme}
          >
            {theme === 'dark' ? '☾' : '☀'}
          </button>
          <span className="nav-avail pill">
            <span className="dot-live" />
            {t.nav.available}
          </span>
          <button
            className={'nav-burger' + (menuOpen ? ' nav-burger--open' : '')}
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t.nav.close : t.nav.menu}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={'nav-menu' + (menuOpen ? ' nav-menu--open' : '')} aria-hidden={!menuOpen}>
        <div className="nav-menu-links container">
          {LINKS.map((l, i) => (
            <a key={l.id} href={'#' + l.id} onClick={(e) => { e.preventDefault(); go(l.id) }} className="nav-menu-link display">
              <span className="mono nav-link-num">0{i + 1}</span>
              {t.nav[l.key]}
            </a>
          ))}
        </div>
        <div className="nav-menu-foot container mono">
          <span>{t.hero.location}</span>
          <span>{t.nav.available}</span>
        </div>
      </div>
    </header>
  )
}
