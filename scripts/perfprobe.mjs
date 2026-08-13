import { chromium } from 'playwright-core'
const url = process.argv[2] || 'http://localhost:4173/'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
const page = await ctx.newPage()
// instrument BEFORE any page script runs
await page.addInitScript(() => {
  window.__perf = { frames: [], long: [], fontStatus: [] }
  let last = performance.now()
  const sample = (t) => {
    const d = t - last
    last = t
    if (window.__perf.frames.length < 480) window.__perf.frames.push(d) // ~8s @60fps
  }
  const loop = (t) => { sample(t); requestAnimationFrame(loop) }
  requestAnimationFrame(loop)
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) window.__perf.long.push(e.duration)
    }).observe({ entryTypes: ['longtask'] })
  } catch {}
  const snap = () => {
    window.__perf.fontStatus.push({
      t: Math.round(performance.now()),
      status: document.fonts.status,
      fraunces: document.fonts.check('16px Fraunces'),
    })
  }
  window.__fontSnaps = setInterval(snap, 500)
  window.setTimeout(() => clearInterval(window.__fontSnaps), 6000)
})
await page.goto(url, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(6500)
const perf = await page.evaluate(() => {
  const f = window.__perf.frames
  // split: loader window = frames while preloader present; we recorded timestamps? approximate by first 3.7s
  const byWindow = { all: f }
  const sorted = [...f].sort((a, b) => a - b)
  const p95 = sorted[Math.floor(sorted.length * 0.95)]
  const p99 = sorted[Math.floor(sorted.length * 0.99)]
  const max = sorted[sorted.length - 1]
  const janky = f.filter((d) => d > 50).length // frames > 50ms = visible stutter
  return {
    p95ms: Math.round(p95 * 10) / 10,
    p99ms: Math.round(p99 * 10) / 10,
    maxMs: Math.round(max),
    framesOver50ms: janky,
    totalFrames: f.length,
    longTasks: window.__perf.long.map((d) => Math.round(d) + 'ms'),
    fontSnaps: window.__perf.fontStatus.slice(0, 8),
  }
})
console.log(JSON.stringify(perf, null, 1))
await browser.close()
