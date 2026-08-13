export type Locale = 'en' | 'ne'

export interface Project {
  id: string
  name: string
  repo: string
  tag: string
  year: string
  description: string
  tech: string[]
  link: string
}

export interface JourneyItem {
  period: string
  title: string
  detail: string
  tag: string
}

export interface SkillGroup {
  title: string
  items: string[]
}

export interface Content {
  meta: { title: string; description: string }
  nav: {
    work: string
    about: string
    capabilities: string
    journey: string
    contact: string
    available: string
    menu: string
    close: string
  }
  hero: {
    kicker: string
    greeting: string
    name: string
    roles: string[]
    lede: string
    scroll: string
    location: string
    stats: { repos: string; followers: string; following: string; joined: string }
  }
  marquee: string[]
  about: {
    label: string
    heading: string
    lead: string
    body: string
    cta: string
    focus: { title: string; items: string[] }
  }
  work: {
    label: string
    heading: string
    sub: string
    view: string
    visit: string
    detail: string
    close: string
    live: string
    archived: string
    projects: Project[]
  }
  skills: { label: string; heading: string; sub: string; groups: SkillGroup[] }
  journey: { label: string; heading: string; sub: string; items: JourneyItem[] }
  contact: {
    label: string
    heading: string
    sub: string
    email: string
    cta: string
    github: string
    location: string
    localTime: string
  }
  footer: { note: string; rights: string; backToTop: string; theme: string; lang: string }
}

export interface RepoMeta {
  name: string
  full_name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  html_url: string
  homepage: string | null
  topics: string[]
}

export interface UserMeta {
  login: string
  avatar_url: string
  html_url: string
  followers: number
  following: number
  public_repos: number
  created_at: string
  location: string | null
}
