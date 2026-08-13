import { chromium } from 'playwright-core'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
const page = await ctx.newPage()
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(5600)
const info = await page.evaluate(() => {
  const row = document.querySelector('.hero-meta-row')
  const style = getComputedStyle(row)
  const items = Array.from(row.children).map((c) => {
    const r = c.getBoundingClientRect()
    return { cls: String(c.className).split(' ')[0], x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
  })
  const btn = document.querySelector('.hero-github')
  const br = btn.getBoundingClientRect()
  return {
    cols: style.gridTemplateColumns,
    rows: style.gridTemplateRows,
    items,
    btn: { x: Math.round(br.x), y: Math.round(br.y), w: Math.round(br.width), h: Math.round(br.height), radius: getComputedStyle(btn).borderRadius, rowY: items[0] ? items[0].y : 0 },
  }
})
console.log(JSON.stringify(info, null, 1))
await browser.close()
