import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion, splitChars } from '../lib/motion'
import { useI18n } from '../lib/i18n'
import { fetchGitHubData, GH_PROFILE } from '../lib/github'
import type { UserMeta } from '../lib/types'
import OrbitField from './OrbitField'
import './hero.css'

const ROTATE_MS = 2600

export default function Hero() {
  const { t, locale } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const roleRef = useRef<HTMLSpanElement>(null)
  const [user, setUser] = useState<UserMeta | null>(null)
  const [roleIdx, setRoleIdx] = useState(0)

  // live github stats (graceful fallback to content defaults)
  useEffect(() => {
    fetchGitHubData().then(({ user }) => setUser(user))
  }, [])

  // rotating roles
  useEffect(() => {
    if (t.hero.roles.length <= 1) return
    const id = setInterval(() => setRoleIdx((i) => (i + 1) % t.hero.roles.length), ROTATE_MS)
    return () => clearInterval(id)
  }, [t.hero.roles.length])

  // role transition + entrance animations
  useEffect(() => {
    if (!roleRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        roleRef.current,
        { yPercent: 60, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
      )
    }, roleRef)
    return () => ctx.revert()
  }, [roleIdx])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 3.25, defaults: { ease: 'power4.out' } })

      const nameLines = Array.from(el.querySelectorAll('.hero-name-line'))
      if (nameLines.length) {
        const chars: HTMLSpanElement[] = []
        nameLines.forEach((line) => chars.push(...splitChars(line as HTMLElement)))
        tl.fromTo(
          chars,
          { yPercent: 118, rotate: 4, opacity: 0 },
          { yPercent: 0, rotate: 0, opacity: 1, duration: 1.05, stagger: 0.03 },
          0.15
        )
      }

      const role = el.querySelector('.hero-role')
      if (role) tl.fromTo(role, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8 }, 0.75)

      const lede = el.querySelector('.hero-lede')
      if (lede) tl.fromTo(lede, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.9 }, 0.9)

      const meta = el.querySelector('.hero-meta-row')
      if (meta) tl.fromTo(meta, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 1.05)

      const cue = el.querySelector('.hero-cue')
      if (cue) tl.fromTo(cue, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.3)
    }, el)
    return () => ctx.revert()
  }, [])

  const nameParts = t.hero.name.split(' ')

  return (
    <section ref={ref} className="hero section container" id="top">
      <OrbitField />
      <h1 className="hero-name display" aria-label={t.hero.name}>
        {nameParts.map((part, i) => (
          <span key={i} className={'hero-name-line' + (i % 2 ? ' hero-name-line--italic' : '')}>
            {part}
          </span>
        ))}
      </h1>

      <div className="hero-role-wrap mono">
        <span className="hero-role mono" ref={roleRef}>
          {t.hero.roles[roleIdx]}
        </span>
        <span className="hero-role-index mono">0{roleIdx + 1} / 0{t.hero.roles.length}</span>
      </div>

      <div className="hero-grid">
        <div className="hero-left">
          <p className="hero-lede">{t.hero.lede}</p>
          <a className="btn btn-ghost hero-github" href={GH_PROFILE} target="_blank" rel="noreferrer" data-cursor>
            GitHub ↗
          </a>
        </div>

        <div className="hero-meta-row">
          <div className="hero-stat">
            <span className="hero-stat-num display" data-count={user?.public_repos ?? 23}>
              {user?.public_repos ?? 23}
            </span>
            <span className="hero-stat-label mono">{t.hero.stats.repos}</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num display" data-count={user?.followers ?? 4}>
              {user?.followers ?? 4}
            </span>
            <span className="hero-stat-label mono">{t.hero.stats.followers}</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num display" data-count={user?.following ?? 5}>
              {user?.following ?? 5}
            </span>
            <span className="hero-stat-label mono">{t.hero.stats.following}</span>
          </div>
          <div className="hero-stat hero-stat--wide">
            <span className="hero-stat-num hero-stat-num--text display">
              {user?.created_at ? new Date(user.created_at).getUTCFullYear() : '2025'}
            </span>
            <span className="hero-stat-label mono">{t.hero.stats.joined}</span>
          </div>
        </div>
      </div>

      <div className="hero-cue mono" aria-hidden="true">
        <span className="hero-cue-line" />
        <span>{t.hero.scroll}</span>
      </div>
    </section>
  )
}
