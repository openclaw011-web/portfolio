import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/motion'
import { loaderReady } from '../lib/loader'

/** Hairline scroll progress bar pinned to the top edge. */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let ctx: gsap.Context | null = null
    let alive = true
    loaderReady.then(() => {
      if (!alive || !el) return
      ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            transformOrigin: 'left center',
            scrollTrigger: {
              trigger: document.documentElement,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.3,
            },
          }
        )
      }, el)
    })
    return () => {
      alive = false
      ctx?.revert()
    }
  }, [])

  return <div ref={ref} className="scroll-progress" aria-hidden="true" />
}
