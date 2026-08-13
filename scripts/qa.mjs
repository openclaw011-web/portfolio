/**
 * Headless QA suite for the portfolio.
 * Requires: chromium (npx playwright-core install chromium) + a running preview/dev server.
 *
 * Usage:
 *   npm run build && npm run preview &   # serve dist/ on :4173
 *   node scripts/qa.mjs [url]            # default http://localhost:4173
 */
import { chromium } from 'playwright-core'
import fs from 'node:fs'

const URL = process.argv[2] || 'http://localhost:4173/'
const OUT = 'docs/screenshots/qa'
fs.mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const results = []
const check = (name, ok, detail) => results.push((ok ? 'PASS' : 'FAIL') + ' | ' + name + (detail ? ' | ' + detail : ''))
const errors = []
const shot = (page, name) => page.screenshot({ path: OUT + '/' + name + '.png' })

function watchErrors(page) {
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    if (m.text().startsWith('Failed to load resource')) return
    if (m.text().includes('api.github.com')) return
    errors.push('[console] ' + m.text())
  })
  page.on('response', (res) => {
    if (res.status() >= 400 && !res.url().includes('api.github.com')) {
      errors.push('[http ' + res.status() + '] ' + res.url())
    }
  })
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message))
}

// ── desktop dark ──────────────────────────────
let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
let page = await ctx.newPage()
watchErrors(page)
await page.goto(URL, { waitUntil: 'networkidle' })

// preloader counter: sample rapidly to prove visible counting (robust to load timing)
const samples = []
for (let i = 0; i < 14; i++) {
  samples.push(await page.evaluate(() => {
    const pre = document.querySelector('.preloader')
    const num = document.querySelector('.pre-num')
    return { shown: !!pre, num: num ? num.textContent : null }
  }))
  await page.waitForTimeout(160)
}
const ticks = samples.filter((s) => s.shown && s.num !== null)
check('counter visible while loader up', ticks.length > 3, 'samples=' + ticks.length)
const midTicks = ticks.filter((s) => /^\d{3}$/.test(s.num) && s.num !== '000' && s.num !== '100')
check('counter counts visibly (mid values)', midTicks.length > 0, 'mid=' + midTicks.map((s) => s.num).join(','))

// keep sampling until the loader disappears; the count must hit 100 before exit
const landSeq = []
let guard = 0
while (guard < 30) {
  const s = await page.evaluate(() => ({
    shown: !!document.querySelector('.preloader'),
    num: document.querySelector('.pre-num') ? document.querySelector('.pre-num').textContent : null,
  }))
  landSeq.push(s)
  if (!s.shown) break
  await page.waitForTimeout(120)
  guard++
}
const sawHundred = landSeq.some((s) => s.shown && s.num === '100')
check('counter lands on 100 before exit', sawHundred, 'seq=' + landSeq.map((s) => s.num).join(','))

await page.waitForTimeout(600)
check('preloader exits', !(await page.evaluate(() => !!document.querySelector('.preloader'))), '')

const fonts = await page.evaluate(() => [document.fonts.check('16px Fraunces'), document.fonts.check('16px "Space Grotesk"'), document.fonts.check('16px "Space Mono"')])
check('fonts loaded', fonts.every(Boolean), JSON.stringify(fonts))
check('custom cursor', await page.evaluate(() => document.querySelectorAll('.cursor-ring, .cursor-dot').length === 2), '')
const charCount = await page.evaluate(() => document.querySelectorAll('.hero-name-line > span > span').length)
check('hero chars split', charCount > 10, charCount)
const r1 = await page.textContent('.hero-role')
await page.waitForTimeout(2700)
const r2 = await page.textContent('.hero-role')
check('role rotator', r1 !== r2, r1 + ' -> ' + r2)
check('dark at load', (await page.evaluate(() => document.documentElement.getAttribute('data-theme'))) === 'dark', '')

// theme
await page.click('.nav-control >> nth=1')
await page.waitForTimeout(900)
const light = await page.evaluate(() => ({ t: document.documentElement.getAttribute('data-theme'), bg: getComputedStyle(document.body).backgroundColor }))
check('theme -> light w/ bone bg', light.t === 'light' && light.bg === 'rgb(242, 237, 228)', JSON.stringify(light))
await page.click('.nav-control >> nth=1')
await page.waitForTimeout(900)

// locale
await page.click('.nav-control >> nth=0')
await page.waitForTimeout(600)
check('locale -> ne', /[\u0900-\u097F]/.test(await page.evaluate(() => document.querySelector('.hero-role')?.textContent ?? '')), await page.evaluate(() => document.documentElement.lang))
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
check('locale persists', (await page.evaluate(() => document.documentElement.lang)) === 'ne', '')
await page.click('.nav-control >> nth=0')
await page.waitForTimeout(400)

// work section: pin + horizontal + no overlap
await page.evaluate(() => {
  // drive Lenis (not raw window.scrollTo, which fights its internal target):
  // jump to just BEFORE the pin start, then animate forward through it —
  // engages the pin deterministically, same as a real user scrolling
  const spacer = document.querySelector('.pin-spacer')
  const target = spacer.getBoundingClientRect().top + window.scrollY - 400
  window.__lenis?.scrollTo(target, { immediate: true })
})
await page.waitForTimeout(600)
await page.evaluate(() => {
  window.__lenis?.scrollTo(window.scrollY + 800, { duration: 1.2 })
})
await page.waitForTimeout(2400)
const pin = await page.evaluate(() => ({ pos: getComputedStyle(document.querySelector('.work')).position, top: Math.round(document.querySelector('.work').getBoundingClientRect().top), x: Math.round(document.querySelector('.work-track').getBoundingClientRect().x) }))
check('work pinned', pin.pos === 'fixed' && pin.top === 0, JSON.stringify(pin))

const overlap = await page.evaluate(() => {
  const head = document.querySelector('.work-head').getBoundingClientRect()
  const card = document.querySelector('.work-card').getBoundingClientRect()
  const label = document.querySelector('.work-head .sh-label').getBoundingClientRect()
  const nav = document.querySelector('.nav').getBoundingClientRect()
  return {
    headBelowNav: label.top >= nav.bottom - 2,
    boxesOverlap: head.bottom > card.top && head.top < card.bottom,
    cardStartsAtOrBelowHead: card.top >= head.bottom - 2,
  }
})
check('heading clear of nav', overlap.headBelowNav, JSON.stringify(overlap))
check('heading clear of cards', !overlap.boxesOverlap && overlap.cardStartsAtOrBelowHead, JSON.stringify(overlap))
await shot(page, 'work-no-overlap')

await page.evaluate(() => window.scrollBy(0, 1200))
await page.waitForTimeout(1800)
const scrub = await page.evaluate(() => ({ top: Math.round(document.querySelector('.work').getBoundingClientRect().top), x: Math.round(document.querySelector('.work-track').getBoundingClientRect().x) }))
check('horizontal scrub while pinned', scrub.top === 0 && scrub.x < pin.x, pin.x + ' -> ' + scrub.x)

const midOverlap = await page.evaluate(() => {
  const head = document.querySelector('.work-head').getBoundingClientRect()
  const card = document.querySelector('.work-card').getBoundingClientRect()
  return head.bottom > card.top && head.top < card.bottom
})
check('no overlap mid-scroll', !midOverlap, '')

await page.evaluate(() => window.scrollBy(0, 6000))
await page.waitForTimeout(1800)
check('pin releases', (await page.evaluate(() => getComputedStyle(document.querySelector('.work')).position)) !== 'fixed', '')

// marquee
const mx1 = await page.evaluate(() => document.querySelector('.marquee-track').getBoundingClientRect().x)
await page.waitForTimeout(1200)
const mx2 = await page.evaluate(() => document.querySelector('.marquee-track').getBoundingClientRect().x)
check('marquee animates', mx1 !== mx2, Math.round(mx1) + ' -> ' + Math.round(mx2))

// about counters
await page.evaluate(() => {
  const sec = document.getElementById('about')
  window.scrollTo(0, sec.getBoundingClientRect().top + window.scrollY - 100)
})
await page.waitForTimeout(2600)
check('about counter -> 23', (await page.evaluate(() => document.querySelector('.about-counter-num')?.textContent)) === '23', '')
await ctx.close()

// ── card content visibility across viewport sizes ──
for (const vp of [{ w: 1920, h: 1080 }, { w: 1440, h: 900 }, { w: 1366, h: 768 }, { w: 1280, h: 720 }]) {
  const vctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, colorScheme: 'dark' })
  const vpage = await vctx.newPage()
  await vpage.goto(URL, { waitUntil: 'networkidle' })
  await vpage.waitForTimeout(4500)
  await vpage.evaluate(() => {
    const spacer = document.querySelector('.pin-spacer')
    window.scrollTo(0, spacer.getBoundingClientRect().top + window.scrollY + 80)
  })
  await vpage.waitForTimeout(1600)
  const cs = await vpage.evaluate(() => {
    const card = document.querySelector('.work-card')
    const cr = card.getBoundingClientRect()
    const links = card.querySelector('.work-card-links').getBoundingClientRect()
    const tech = card.querySelector('.work-card-tech').getBoundingClientRect()
    const desc = card.querySelector('.work-card-desc').getBoundingClientRect()
    const section = document.querySelector('.work').getBoundingClientRect()
    const br = card.getBoundingClientRect()
    return {
      descVisible: desc.bottom <= cr.bottom - 4,
      techVisible: tech.bottom <= cr.bottom - 4,
      linksVisible: links.bottom <= cr.bottom - 4 && links.bottom <= section.bottom - 2,
      bottomBorderVisible: br.bottom <= section.bottom - 2 && br.bottom >= section.top + 2,
      cardHeight: cr.height,
    }
  })
  check(vp.w + 'x' + vp.h + ' desc visible', cs.descVisible, '')
  check(vp.w + 'x' + vp.h + ' tech chips visible', cs.techVisible, '')
  check(vp.w + 'x' + vp.h + ' buttons visible', cs.linksVisible, 'cardH=' + Math.round(cs.cardHeight) + 'px')
  check(vp.w + 'x' + vp.h + ' bottom border not clipped', cs.bottomBorderVisible, 'cardH=' + Math.round(cs.cardHeight) + 'px')
  await vctx.close()
}

// ── mobile ────────────────────────────────────
ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' })
page = await ctx.newPage()
watchErrors(page)
await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForTimeout(4500)
check('mobile no overflow', (await page.evaluate(() => document.body.scrollWidth - window.innerWidth)) <= 1, '')
check('mobile cursor hidden', (await page.evaluate(() => getComputedStyle(document.querySelector('.cursor-dot')).display)) === 'none', '')
await page.click('.nav-burger')
await page.waitForTimeout(900)
const menuH = await page.evaluate(() => Math.round(document.querySelector('.nav-menu').getBoundingClientRect().height))
check('mobile menu fullscreen', menuH >= 842, menuH + 'px')
await page.click('.nav-menu-link >> nth=1')
await page.waitForTimeout(2600)
check('menu navigates to work', await page.evaluate(() => { const t = document.getElementById('work').getBoundingClientRect().top; return t > -200 && t < 250 }), '')
await shot(page, 'mobile-work')
await ctx.close()

// ── reduced motion ────────────────────────────
ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark', reducedMotion: 'reduce' })
page = await ctx.newPage()
await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForTimeout(2200)
const rm = await page.evaluate(() => ({
  pre: !!document.querySelector('.preloader'),
  dir: getComputedStyle(document.querySelector('.work-track')).flexDirection,
  spacer: !!document.querySelector('.pin-spacer'),
}))
check('rm: no preloader', !rm.pre, '')
check('rm: vertical stack', rm.dir === 'column', rm.dir)
check('rm: no pin', !rm.spacer, '')
await ctx.close()

await browser.close()
check('no JS errors', errors.length === 0, errors.slice(0, 2).join(' | '))

const fails = results.filter((r) => r.startsWith('FAIL'))
console.log(results.join('\n'))
console.log(fails.length ? '\n' + fails.length + ' FAILURES' : '\nALL ' + results.length + ' CHECKS PASSED')
process.exit(fails.length ? 1 : 0)
