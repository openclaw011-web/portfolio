import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { useReveal } from '../hooks/useReveal'
import { useI18n } from '../lib/i18n'
import { GH_PROFILE } from '../lib/github'
import SectionHeading from './SectionHeading'
import './about.css'

export default function About() {
  const { t } = useI18n()
  const gridRef = useReveal<HTMLDivElement>({ y: 40 })
  const focusRef = useReveal<HTMLDivElement>({ y: 40, delay: 0.1 })
  const counterRef = useRef<HTMLDivElement>(null)

  // animate the stat counters when visible
  useEffect(() => {
    const el = counterRef.current
    if (!el || prefersReducedMotion()) return
    const nums = el.querySelectorAll<HTMLElement>('[data-count]')
    const ctx = gsap.context(() => {
      nums.forEach((num) => {
        const target = Number(num.dataset.count ?? 0)
        const obj = { v: 0 }
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          onUpdate: () => {
            num.textContent = String(Math.round(obj.v))
          },
        })
      })
    }, el)
    return () => ctx.revert()
  }, [])

  const focusItems = t.about.focus.items

  return (
    <section className="section container" id="about">
      <SectionHeading label={t.about.label} heading={t.about.heading} />
      <div className="about-grid">
        <div className="about-lead" ref={gridRef}>
          <p className="about-lead-text">{t.about.lead}</p>
          <p className="about-body">{t.about.body}</p>
          <a className="btn btn-ghost" href={GH_PROFILE} target="_blank" rel="noreferrer" data-cursor>
            {t.about.cta} ↗
          </a>
        </div>

        <div className="about-side">
          <div className="about-focus" ref={focusRef}>
            <h3 className="about-focus-title mono">{t.about.focus.title}</h3>
            <ul className="about-focus-list">
              {focusItems.map((item) => (
                <li key={item} className="about-focus-item">
                  <span className="about-focus-dot" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="about-counters" ref={counterRef}>
        <div className="about-counter">
          <span className="about-counter-num display" data-count={23}>0</span>
          <span className="about-counter-label mono">{t.hero.stats.repos}</span>
        </div>
        <div className="about-counter">
          <span className="about-counter-num display" data-count={6}>0</span>
          <span className="about-counter-label mono">Featured builds</span>
        </div>
        <div className="about-counter">
          <span className="about-counter-num display" data-count={5}>0</span>
          <span className="about-counter-label mono">Languages</span>
        </div>
        <div className="about-counter">
          <span className="about-counter-num display" data-count={8}>0</span>
          <span className="about-counter-label mono">Months building</span>
        </div>
      </div>
    </section>
  )
}
