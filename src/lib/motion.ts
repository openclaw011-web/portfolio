import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Split an element's text into per-char spans for staggered reveals. */
export function splitChars(el: HTMLElement): HTMLSpanElement[] {
  const text = el.textContent ?? ''
  el.textContent = ''
  const frag = document.createDocumentFragment()
  const spans: HTMLSpanElement[] = []
  const words = text.split(' ')
  words.forEach((word, wi) => {
    const w = document.createElement('span')
    w.style.display = 'inline-block'
    w.style.whiteSpace = 'nowrap'
    for (const ch of word) {
      const s = document.createElement('span')
      s.style.display = 'inline-block'
      s.style.willChange = 'transform'
      s.textContent = ch
      w.appendChild(s)
      spans.push(s)
    }
    const ws = document.createElement('span')
    ws.style.display = 'inline-block'
    ws.innerHTML = '&nbsp;'
    w.appendChild(ws)
    frag.appendChild(w)
    if (wi === words.length - 1) w.lastElementChild?.remove()
  })
  el.appendChild(frag)
  return spans
}

/** Split into per-word spans (keeps wrapping natural). */
export function splitWords(el: HTMLElement): HTMLSpanElement[] {
  const text = el.textContent ?? ''
  el.textContent = ''
  const frag = document.createDocumentFragment()
  const spans: HTMLSpanElement[] = []
  text.split(' ').forEach((word, i) => {
    const s = document.createElement('span')
    s.style.display = 'inline-block'
    s.style.willChange = 'transform'
    s.textContent = word
    frag.appendChild(s)
    spans.push(s)
    if (i < text.split(' ').length - 1) {
      frag.appendChild(document.createTextNode(' '))
    }
  })
  el.appendChild(frag)
  return spans
}

/** Set text after splitChars/words (used by resize-safe re-splits). */
export function isTouchDevice(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
}

/** register ScrollTrigger with Lenis scroll for sync */
export function syncScrollTriggerWithLenis(lenis: { raf: (t: number) => void; scrollTo: (t: number, o?: unknown) => void } | null) {
  if (!lenis) return () => {}
  lenis.raf(performance.now())
  const onScroll = ScrollTrigger.update
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => window.removeEventListener('scroll', onScroll)
}
