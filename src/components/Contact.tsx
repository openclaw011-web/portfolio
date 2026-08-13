import { useEffect, useState } from 'react'
import { useI18n } from '../lib/i18n'
import { GH_PROFILE } from '../lib/github'
import { useReveal } from '../hooks/useReveal'
import './contact.css'

export default function Contact() {
  const { t, locale } = useI18n()
  const wrapRef = useReveal<HTMLDivElement>({ y: 48 })
  const [time, setTime] = useState('')

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString(locale === 'ne' ? 'ne-NP' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    setTime(fmt())
    const id = setInterval(() => setTime(fmt()), 1000)
    return () => clearInterval(id)
  }, [locale])

  return (
    <section className="section container contact" id="contact">
      <div ref={wrapRef}>
        <div className="contact-label mono">{t.contact.label}</div>
        <h2 className="contact-heading display">
          {t.contact.heading.split(' ').map((word, i) => (
            <span key={i} className={'contact-word' + (i % 2 ? ' contact-word--italic' : '')}>
              {word}
            </span>
          ))}
        </h2>
        <p className="contact-sub">{t.contact.sub}</p>

        <div className="contact-actions">
          <a className="btn btn-solid contact-cta" href={'mailto:' + t.contact.email} data-cursor>
            {t.contact.cta} ↗
          </a>
          <a className="btn btn-ghost" href={GH_PROFILE} target="_blank" rel="noreferrer" data-cursor>
            {t.contact.github} ↗
          </a>
        </div>

        <div className="contact-meta mono">
          <span>{t.contact.email}</span>
          <span>{t.contact.location}</span>
          <span>
            {t.contact.localTime} — <span className="contact-clock">{time}</span>
          </span>
        </div>
      </div>
    </section>
  )
}
