import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/motion'
import { loaderReady } from '../lib/loader'
import { useI18n } from '../lib/i18n'
import { fetchGitHubData, formatDate } from '../lib/github'
import type { Project, RepoMeta } from '../lib/types'
import SectionHeading from './SectionHeading'
import './work.css'

export default function Work() {
  const { t, locale } = useI18n()
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const [meta, setMeta] = useState<Record<string, RepoMeta>>({})

  useEffect(() => {
    fetchGitHubData().then(({ repos }) => {
      const map: Record<string, RepoMeta> = {}
      repos.forEach((r) => {
        map[r.name.toLowerCase()] = r
      })
      setMeta(map)
    })
  }, [])

  // pinned horizontal scroll on desktop; natural stack on mobile.
  // deferred until the preloader completes so the pin measurement never
  // competes with the loader animation
  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    const bar = barRef.current
    if (!section || !track) return

    let mm: gsap.MatchMedia | null = null
    let alive = true
    loaderReady.then(() => {
      if (!alive) return
      mm = gsap.matchMedia()
      mm.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {
      const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth)
      const dist = () => getDistance()

      const tween = gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => '+=' + dist(),
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      if (bar) {
        gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            transformOrigin: 'left center',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => '+=' + dist(),
              scrub: 0.6,
            },
          }
        )
      }

        return () => {
          tween.scrollTrigger?.kill()
        }
      })
    })

    return () => {
      alive = false
      mm?.revert()
    }
  }, [])

  const projects = t.work.projects

  return (
    <section ref={sectionRef} className="work" id="work">
      <div className="work-head container">
        <SectionHeading label={t.work.label} heading={t.work.heading} sub={t.work.sub} />
      </div>

      <div className="work-track" ref={trackRef}>
        {projects.map((p, i) => (
          <WorkCard
            key={p.id}
            project={p}
            index={i + 1}
            total={projects.length}
            meta={meta[p.repo.toLowerCase()]}
            locale={locale}
            tWork={t.work}
          />
        ))}

        <div className="work-end">
          <a
            className="work-end-link display"
            href="https://github.com/Prabeshamgain?tab=repositories"
            target="_blank"
            rel="noreferrer"
            data-cursor
          >
            View all 23 repos <span className="work-end-arrow">↗</span>
          </a>
        </div>
      </div>

      <div className="work-bar-wrap">
        <div className="work-bar" ref={barRef} />
      </div>
    </section>
  )
}

function WorkCard({
  project,
  index,
  total,
  meta,
  locale,
  tWork,
}: {
  project: Project
  index: number
  total: number
  meta?: RepoMeta
  locale: string
  tWork: {
    view: string
    visit: string
    live: string
    archived: string
  }
}) {
  const stars = meta?.stargazers_count ?? 0
  const updated = meta ? formatDate(meta.updated_at, locale) : ''

  return (
    <article className="work-card" data-cursor>
      <div className="work-card-top mono">
        <span className="work-card-index">
          {String(index).padStart(2, '0')} <span className="work-card-total">/ {String(total).padStart(2, '0')}</span>
        </span>
        <span className="work-card-tag">{project.tag}</span>
        <span className="work-card-year">{project.year}</span>
      </div>

      <h3 className="work-card-name display">{project.name}</h3>

      <p className="work-card-desc">{project.description}</p>

      <div className="work-card-tech mono">
        {project.tech.map((tech) => (
          <span key={tech} className="work-card-tech-item">{tech}</span>
        ))}
      </div>

      <div className="work-card-meta mono">
        <span>{stars > 0 ? '★ ' + stars : '★ new'}</span>
        {updated ? <span>upd. {updated}</span> : null}
      </div>

      <div className="work-card-links">
        <a
          className="btn btn-solid"
          href={meta?.html_url ?? 'https://github.com/Prabeshamgain'}
          target="_blank"
          rel="noreferrer"
        >
          {tWork.view} ↗
        </a>
        {project.link ? (
          <a className="btn btn-ghost" href={project.link} target="_blank" rel="noreferrer">
            {tWork.visit} ↗
          </a>
        ) : (
          <span className="work-card-status mono">
            <span className="dot-live" /> {tWork.archived}
          </span>
        )}
      </div>
    </article>
  )
}
