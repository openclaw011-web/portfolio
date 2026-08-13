import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { useI18n } from '../lib/i18n'
import './marquee.css'

export default function Marquee() {
  const { t } = useI18n()
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const x = gsap.to(track, {
        xPercent: -50,
        ease: 'none',
        duration: 28,
        repeat: -1,
      })
      // velocity-reactive: pause on hover
      const onEnter = () => x.timeScale(0.15)
      const onLeave = () => x.timeScale(1)
      track.addEventListener('mouseenter', onEnter)
      track.addEventListener('mouseleave', onLeave)
      return () => {
        track.removeEventListener('mouseenter', onEnter)
        track.removeEventListener('mouseleave', onLeave)
      }
    }, track)
    return () => ctx.revert()
  }, [t.marquee])

  // duplicate content for seamless loop
  const items = [...t.marquee, ...t.marquee]

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track" ref={trackRef}>
        {items.map((item, i) => (
          <span key={i} className="marquee-item display">
            {item}
            <span className="marquee-star">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
