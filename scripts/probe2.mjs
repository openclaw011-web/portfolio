import { chromium } from 'playwright-core'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
const page = await ctx.newPage()
await page.addInitScript(() => {
  window.__long = []
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        window.__long.push({ at: Math.round(e.startTime), dur: Math.round(e.duration) })
      }
    }).observe({ entryTypes: ['longtask'] })
  } catch {}
  window.__frames = []
  let last = performance.now()
  const loop = (t) => {
    const d = t - last; last = t
    if (window.__frames.length < 500) window.__frames.push({ at: Math.round(t), d: Math.round(d * 10) / 10 })
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
})
await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(6000)
const data = await page.evaluate(() => {
  // preloader gone time: approximate by when loader element disappears
  return {
    long: window.__long,
    slowFrames: window.__frames.filter((f) => f.d > 50),
    fontLoadTime: (() => {
      let t = 0
      try { t = Math.round(performance.getEntriesByType('resource').find((r) => r.name.includes('fonts.gstatic') && r.name.includes('fraunces'))?.responseEnd ?? 0) } catch {}
      return t
    })(),
  }
})
console.log(JSON.stringify(data, null, 1))
await browser.close()
