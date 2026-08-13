import { useI18n } from '../lib/i18n'
import { scrollToTarget } from '../lib/lenis'
import './footer.css'

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          <p className="footer-note display">{t.footer.note}</p>
          <button className="btn btn-ghost footer-top" onClick={() => scrollToTarget(0)} data-cursor>
            ↑ {t.footer.backToTop}
          </button>
        </div>
        <div className="footer-bar mono">
          <span>{t.footer.rights}</span>
          <span>
            <a href="https://github.com/Prabeshamgain" target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
