import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'

interface Options {
  y?: number
  duration?: number
  delay?: number
  stagger?: number
  start?: string
  once?: boolean
}

/**
 * Fade/slide an element into view when it enters the viewport.
 * Respects prefers-reduced-motion (no transform).
 */
export function useReveal<T extends HTMLElement>(opts: Options = {}) {
  const ref = useRef<T | null>(null)
  const {
    y = 48,
    duration = 1.1,
    delay = 0,
    stagger = 0,
    start = 'top 85%',
    once = true,
  } = opts

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      const targets = el.children.length ? Array.from(el.children) : [el]
      gsap.fromTo(
        targets,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration,
          delay,
          stagger,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start, once },
        }
      )
    }, el)

    return () => ctx.revert()
  }, [y, duration, delay, stagger, start, once])

  return ref
}
