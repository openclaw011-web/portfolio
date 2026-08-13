import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion, splitWords } from '../lib/motion'
import { loaderReady } from '../lib/loader'
import './section-heading.css'

interface Props {
  label: string
  heading: string
  sub?: string
  align?: 'left' | 'center'
}

export default function SectionHeading({ label, heading, sub, align = 'left' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) return
    let ctx: gsap.Context | null = null
    let alive = true
    loaderReady.then(() => {
      if (!alive || !el) return
      const words = el.querySelectorAll('.sh-words')
      ctx = gsap.context(() => {
        words.forEach((w) => {
          const spans = splitWords(w as HTMLElement)
          gsap.fromTo(
            spans,
            { yPercent: 120, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 1,
              stagger: 0.045,
              ease: 'power4.out',
              scrollTrigger: { trigger: el, start: 'top 82%', once: true },
            }
          )
        })
      }, el)
    })
    return () => {
      alive = false
      ctx?.revert()
    }
  }, [])

  return (
    <div ref={ref} className={'section-heading' + (align === 'center' ? ' section-heading--center' : '')}>
      <div className="sh-label mono">{label}</div>
      <h2 className="sh-title display">
        <span className="sh-words">{heading}</span>
      </h2>
      {sub ? <p className="sh-sub">{sub}</p> : null}
    </div>
  )
}
