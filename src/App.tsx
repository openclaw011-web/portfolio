import { useEffect } from 'react'
import { useTheme } from './lib/theme'
import { getLenis } from './lib/lenis'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import About from './components/About'
import Work from './components/Work'
import Capabilities from './components/Capabilities'
import Journey from './components/Journey'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ScrollProgress from './components/ScrollProgress'
import { useI18n } from './lib/i18n'

export default function App() {
  const { theme, toggle } = useTheme()
  const { locale, setLocale } = useI18n()

  useEffect(() => {
    getLenis()
  }, [])

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Preloader />
      <Cursor />
      <ScrollProgress />
      <Nav theme={theme} onToggleTheme={toggle} locale={locale} onSetLocale={setLocale} />
      <main id="main">
        <Hero />
        <Marquee />
        <About />
        <Work />
        <Capabilities />
        <Journey />
        <Contact />
        <Footer />
      </main>
    </>
  )
}
