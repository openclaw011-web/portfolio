import type { RepoMeta, UserMeta } from './types'

const USER = 'Prabeshamgain'
const API = 'https://api.github.com'

/** Fetch profile + repo metadata; every failure degrades gracefully. */
export async function fetchGitHubData(): Promise<{ user: UserMeta | null; repos: RepoMeta[] }> {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`${API}/users/${USER}`, { headers: { Accept: 'application/vnd.github+json' } }),
      fetch(`${API}/users/${USER}/repos?per_page=100&sort=updated`, {
        headers: { Accept: 'application/vnd.github+json' },
      }),
    ])
    const [user, repos] = await Promise.all([userRes.json(), reposRes.json()])
    if (!userRes.ok || !Array.isArray(repos)) return { user: null, repos: [] }
    const list: RepoMeta[] = repos
      .filter((r: RepoMeta) => !r.name.startsWith('aistudio') && !r.name.startsWith('random'))
      .map((r: RepoMeta) => ({
        name: r.name,
        full_name: r.full_name,
        description: r.description,
        language: r.language,
        stargazers_count: r.stargazers_count ?? 0,
        forks_count: r.forks_count ?? 0,
        updated_at: r.updated_at ?? '',
        html_url: r.html_url,
        homepage: r.homepage ?? null,
        topics: r.topics ?? [],
      }))
    return { user, repos: list }
  } catch {
    return { user: null, repos: [] }
  }
}

export function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale === 'ne' ? 'ne-NP' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

export const GH_PROFILE = `https://github.com/${USER}`
