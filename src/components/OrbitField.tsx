import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/motion'
import './orbit-field.css'

/**
 * Abstract "intelligence network" — a constellation of nodes orbiting a
 * vermilion core, connected by thin distance-based links.
 * Canvas 2D, visibility-paused, resolution-capped, reduced-motion safe.
 */
export default function OrbitField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = prefersReducedMotion()
    const INK = '240, 237, 228'
    const ACCENT = '255, 92, 53'

    // orbital particles (elliptical paths so the field fills the wide box)
    const N = 48
    const parts = Array.from({ length: N }, (_, i) => {
      const accent = i % 9 === 0
      return {
        // 0..1 radial band, biased outward for a fuller field
        r: 0.12 + Math.pow(Math.random(), 1.5) * 0.85,
        squash: 0.42 + Math.random() * 0.25, // vertical compression per particle
        speed: (0.12 + Math.random() * 0.5) * (Math.random() > 0.5 ? 1 : -1),
        phase: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.06,
        size: accent ? 2.0 + Math.random() * 1.7 : 0.9 + Math.random() * 1.4,
        accent,
      }
    })

    let raf = 0
    let running = true
    let last = performance.now()
    let time = 0
    let glowGrad: CanvasGradient | null = null
    let fadeGrad: CanvasGradient | null = null

    const resize = () => {
      // large background canvas: render at dpr 1 — it's a soft ambient visual,
      // and this keeps the per-frame fill cost low enough for smooth 60fps
      const dpr = 1
      canvas.width = Math.max(2, Math.round(Math.min(canvas.clientWidth, 1420) * dpr))
      canvas.height = Math.max(2, Math.round(Math.min(canvas.clientHeight, 800) * dpr))
    }
    resize()

    const render = () => {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)
      const cx = W * 0.66
      const cy = H * 0.5
      const R = Math.min(W, H) * 0.58 // max orbit radius in px
      const linkDist = R * 0.5

      // node positions
      const pos: { x: number; y: number; accent: boolean }[] = []
      for (const p of parts) {
        const a = p.phase + time * p.speed
        const x = cx + Math.cos(a) * p.r * R
        const y = cy + Math.sin(a) * p.r * R * p.squash + Math.sin(time * 0.4 + p.phase) * p.drift * R
        pos.push({ x, y, accent: p.accent })
      }

      // links (distance-based, fading with distance)
      for (let i = 0; i < pos.length; i++) {
        for (let j = i + 1; j < pos.length; j++) {
          const dx = pos[i].x - pos[j].x
          const dy = pos[i].y - pos[j].y
          const d2 = dx * dx + dy * dy
          const ld2 = linkDist * linkDist
          if (d2 < ld2) {
            const alpha = (1 - Math.sqrt(d2) / linkDist) * 0.16
            const accentLink = pos[i].accent || pos[j].accent
            ctx.strokeStyle = accentLink ? 'rgba(' + ACCENT + ',' + alpha * 1.4 + ')' : 'rgba(' + INK + ',' + alpha + ')'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(pos[i].x, pos[i].y)
            ctx.lineTo(pos[j].x, pos[j].y)
            ctx.stroke()
          }
        }
      }

      // nodes
      for (let i = 0; i < pos.length; i++) {
        const p = parts[i]
        const tw = 0.65 + 0.35 * Math.sin(time * 1.5 + p.phase * 3)
        ctx.fillStyle = p.accent ? 'rgba(' + ACCENT + ',' + (0.75 * tw + 0.2) + ')' : 'rgba(' + INK + ',' + (0.45 * tw + 0.25) + ')'
        ctx.beginPath()
        ctx.arc(pos[i].x, pos[i].y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }

      // core: vermilion glow + pulse (gradient pre-created once — per-frame
      // gradient allocation is expensive; pulse via globalAlpha instead)
      const coreR = R * 0.09
      if (!glowGrad) {
        glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3)
        glowGrad.addColorStop(0, 'rgba(' + ACCENT + ',0.5)')
        glowGrad.addColorStop(0.4, 'rgba(' + ACCENT + ',0.14)')
        glowGrad.addColorStop(1, 'rgba(' + ACCENT + ',0)')
      }
      const pulse = 1 + 0.08 * Math.sin(time * 1.6)
      ctx.globalAlpha = pulse
      ctx.fillStyle = glowGrad
      ctx.beginPath()
      ctx.arc(cx, cy, coreR * 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.fillStyle = 'rgba(' + ACCENT + ',0.95)'
      ctx.beginPath()
      ctx.arc(cx, cy, coreR * pulse, 0, Math.PI * 2)
      ctx.fill()

      // edge fade baked into the pixels (cheaper than a CSS mask)
      if (!fadeGrad) {
        const outer = Math.sqrt(Math.max(cx, W - cx) ** 2 + Math.max(cy, H - cy) ** 2)
        fadeGrad = ctx.createRadialGradient(cx, cy, R * 0.62, cx, cy, outer)
        fadeGrad.addColorStop(0, 'rgba(0,0,0,0)')
        fadeGrad.addColorStop(1, 'rgba(0,0,0,1)')
      }
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = fadeGrad
      ctx.fillRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'source-over'
    }

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (!running || document.hidden) return
      const dt = (t - last) / 1000
      last = t
      time = reduced ? 0 : time + dt
      render()
    }
    raf = requestAnimationFrame(loop)

    const io = new IntersectionObserver(
      (entries) => {
        running = entries[0]?.isIntersecting ?? true
        if (running) last = performance.now()
      },
      { rootMargin: '100px' }
    )
    io.observe(canvas)

    const onResize = () => {
      resize()
      if (reduced) render()
    }
    window.addEventListener('resize', onResize)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="orbit-field" aria-hidden="true" />
}
