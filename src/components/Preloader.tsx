import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { stopScroll } from '../lib/lenis'
import { markLoaderDone } from '../lib/loader'
import { useI18n } from '../lib/i18n'
import './preloader.css'

/**
 * Cinematic preloader:
 *  - name masked-reveals from below
 *  - hairline rule + bottom accent edge track the counter
 *  - counter eases 000 → 100, lands exactly as the exit begins
 *  - exit is a two-layer wipe: content lifts, panel slides up with a
 *    trailing accent edge for a crisp cut
 */
export default function Preloader() {
  const { t } = useI18n()
  const rootRef = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)
  const nameRef = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)
  const lastVal = useRef(-1)

  useEffect(() => {
    if (prefersReducedMotion()) {
      markLoaderDone()
      setGone(true)
      return
    }
    stopScroll(true)
    document.documentElement.classList.add('is-loading')

    // Wait for the display font (capped) so the reveal never shows a swap.
    // The name is masked until its reveal, so this keeps the loader perfectly
    // smooth typographically, even on slow networks.
    let ctx: gsap.Context | null = null
    let alive = true
    const ready = Promise.race([
      Promise.all([
        document.fonts.load('400 16px Fraunces'),
        document.fonts.load('italic 300 16px Fraunces'),
      ]).catch(() => {}),
      new Promise((res) => setTimeout(res, 1400)),
    ])

    ready.then(() => {
      if (!alive) return
      ctx = gsap.context(() => {
        const counter = { v: 0 }

      // counter — ramps visibly, settles on 100 right before the exit
      const counterTween = gsap.to(counter, {
        v: 100,
        duration: 2.0,
        ease: 'power2.inOut',
        onUpdate: () => {
          const val = Math.round(counter.v)
          if (numRef.current && val !== lastVal.current) {
            lastVal.current = val
            numRef.current.textContent = String(val).padStart(3, '0')
          }
        },
      })

      const tl = gsap.timeline({
        defaults: { ease: 'power4.out' },
        onComplete: () => {
          stopScroll(false)
          document.documentElement.classList.remove('is-loading')
          markLoaderDone()
          setGone(true)
        },
      })

      // phase 1 — name reveal (masked rise)
      tl.fromTo(
        nameRef.current,
        { yPercent: 118 },
        { yPercent: 0, duration: 0.9 },
        0.05
      )
      tl.fromTo('.pre-label', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.55 }, 0.15)

      // phase 2 — progress rule + bottom edge grow in sync with the counter
      tl.fromTo(
        '.pre-rule',
        { scaleX: 0 },
        { scaleX: 1, duration: 1.75, ease: 'power3.inOut' },
        0.35
      )
      tl.fromTo(
        '.pre-edge',
        { scaleX: 0 },
        { scaleX: 1, duration: 1.75, ease: 'power3.inOut' },
        0.35
      )

      // phase 3 — counter lands on 100: gentle pulse
      tl.to('.pre-num', { scale: 1.2, duration: 0.2, ease: 'power2.out' }, 2.15)
      tl.to('.pre-num', { scale: 1, duration: 0.38, ease: 'power3.out' })

      // phase 4 — exit: content lifts & fades, panel sweeps up with a
      // trailing accent edge for a crisp cut
      tl.to('.pre-inner', { yPercent: -18, opacity: 0, duration: 0.38, ease: 'power2.in' }, 2.78)
      tl.to('.pre-edge', { yPercent: -100, duration: 0.85, ease: 'power4.inOut' }, 2.83)
      tl.to(rootRef.current, { yPercent: -100, duration: 0.85, ease: 'power4.inOut' }, 2.83)

        void counterTween
      }, rootRef)
    })

    return () => {
      alive = false
      ctx?.revert()
      stopScroll(false)
      document.documentElement.classList.remove('is-loading')
    }
  }, [])

  // safety net: never trap the user behind the loader
  useEffect(() => {
    const t = setTimeout(() => {
      stopScroll(false)
      document.documentElement.classList.remove('is-loading')
      markLoaderDone()
      setGone(true)
    }, 5600)
    return () => clearTimeout(t)
  }, [])

  if (gone) return null

  return (
    <div ref={rootRef} className="preloader" aria-hidden="true">
      <div className="pre-edge" />
      <div className="pre-inner">
        <div className="pre-label mono">{t.hero.kicker}</div>
        <div className="pre-name display" ref={nameRef}>
          {t.hero.greeting}
        </div>
        <div className="pre-meta mono">
          <span className="pre-who">Prabesh Amgain</span>
          <span className="pre-rule" />
          <span ref={numRef} className="pre-num">000</span>
        </div>
      </div>
    </div>
  )
}
