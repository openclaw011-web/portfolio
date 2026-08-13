import { useI18n } from '../lib/i18n'
import { useReveal } from '../hooks/useReveal'
import SectionHeading from './SectionHeading'
import './journey.css'

const TAG_COLOR: Record<string, string> = {
  start: 'var(--accent)',
  web: '#4cc9f0',
  ai: 'var(--accent)',
  theory: '#9b8cff',
}

export default function Journey() {
  const { t } = useI18n()
  const listRef = useReveal<HTMLOListElement>({ y: 36, stagger: 0.14 })

  return (
    <section className="section container" id="journey">
      <SectionHeading label={t.journey.label} heading={t.journey.heading} sub={t.journey.sub} />
      <ol className="journey" ref={listRef}>
        {t.journey.items.map((item, i) => (
          <li key={i} className="journey-item">
            <div className="journey-rail">
              <span className="journey-dot" style={{ background: TAG_COLOR[item.tag] ?? 'var(--accent)' }} />
              {i < t.journey.items.length - 1 ? <span className="journey-line" /> : null}
            </div>
            <div className="journey-body">
              <div className="journey-meta mono">
                <span className="journey-period">{item.period}</span>
                <span className="journey-tag">{item.tag}</span>
              </div>
              <h3 className="journey-title display">{item.title}</h3>
              <p className="journey-detail">{item.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
