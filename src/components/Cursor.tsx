import { useEffect, useRef, useState } from 'react'
import { gsap, isTouchDevice } from '../lib/motion'
import './cursor.css'

/** Custom cursor: trailing ring + dot, grows over interactive elements. */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const scale = useRef(1)

  useEffect(() => {
    if (isTouchDevice() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setEnabled(true)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const dot = dotRef.current!
    const ring = ringRef.current!

    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let rx = mx
    let ry = my
    let raf = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      gsap.set(dot, { x: mx, y: my })
    }

    const loop = () => {
      rx += (mx - rx) * 0.16
      ry += (my - ry) * 0.16
      gsap.set(ring, { x: rx, y: ry })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const hoverable = 'a, button, [data-cursor], input, textarea, select, [role="button"]'
    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(hoverable)
      if (target) {
        scale.current = 2.2
        gsap.to(ring, { scale: 2.2, duration: 0.3, ease: 'power3.out' })
        gsap.to(dot, { scale: 0.4, duration: 0.3, ease: 'power3.out' })
        ring.classList.add('cursor-ring--hover')
      } else {
        scale.current = 1
        gsap.to(ring, { scale: 1, duration: 0.3, ease: 'power3.out' })
        gsap.to(dot, { scale: 1, duration: 0.3, ease: 'power3.out' })
        ring.classList.remove('cursor-ring--hover')
      }
    }

    const onLeave = () => {
      gsap.to([ring, dot], { opacity: 0, duration: 0.25 })
    }
    const onEnter = () => {
      gsap.to([ring, dot], { opacity: 1, duration: 0.25 })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
      cancelAnimationFrame(raf)
    }
  }, [enabled])

  if (!enabled) return null
  void scale

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  )
}
