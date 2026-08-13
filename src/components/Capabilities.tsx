import { useI18n } from '../lib/i18n'
import { useReveal } from '../hooks/useReveal'
import SectionHeading from './SectionHeading'
import './capabilities.css'

export default function Capabilities() {
  const { t } = useI18n()
  const gridRef = useReveal<HTMLDivElement>({ y: 40, stagger: 0.12 })

  return (
    <section className="section container" id="capabilities">
      <SectionHeading label={t.skills.label} heading={t.skills.heading} sub={t.skills.sub} />
      <div className="caps-grid" ref={gridRef}>
        {t.skills.groups.map((group) => (
          <div key={group.title} className="caps-card">
            <h3 className="caps-title mono">{group.title}</h3>
            <ul className="caps-list">
              {group.items.map((item) => (
                <li key={item} className="caps-item">
                  <span className="caps-item-arrow mono">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
