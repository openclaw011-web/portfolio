import { chromium } from 'playwright-core'
const browser = await chromium.launch()
for (const vp of [{ w: 1440, h: 900 }, { w: 1280, h: 800 }, { w: 1024, h: 768 }, { w: 800, h: 900 }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, colorScheme: 'dark' })
  const page = await ctx.newPage()
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(5600)
  const info = await page.evaluate(() => {
    const row = document.querySelector('.hero-meta-row')
    const style = getComputedStyle(row)
    const items = Array.from(row.children).map((c) => {
      const r = c.getBoundingClientRect()
      return { cls: String(c.className).split(' ')[0], x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) }
    })
    // cursor ring over the button
    const btn = document.querySelector('.hero-github')
    const br = btn.getBoundingClientRect()
    const cx = br.x + br.width / 2
    const cy = br.y + br.height / 2
    return { cols: style.gridTemplateColumns, items, btnRadius: getComputedStyle(btn).borderRadius }
  })
  console.log(vp.w + 'x' + vp.h + ': ' + JSON.stringify(info))
  await ctx.close()
}
await browser.close()
