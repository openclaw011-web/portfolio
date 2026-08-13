import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './motion'

let lenis: Lenis | null = null

/** Create the smooth-scroll instance once; returns the singleton. */
export function getLenis(): Lenis | null {
  if (typeof window === 'undefined') return null
  if (lenis) return lenis

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) return null

  lenis = new Lenis({
    duration: 1.15,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
  })

  // Drive ScrollTrigger off Lenis's scroll position
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  // expose for debugging + programmatic scrolls (used by the QA suite)
  ;(window as unknown as { __lenis: Lenis | null }).__lenis = lenis

  return lenis
}

export function scrollToTarget(target: string | number) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.4, offset: 0 })
  } else {
    if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' })
    else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  }
}

export function stopScroll(locked: boolean) {
  if (!lenis) return
  if (locked) lenis.stop()
  else lenis.start()
}
