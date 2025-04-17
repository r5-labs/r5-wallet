import { useState, useEffect } from 'react'
import { VersionApiUrl } from '../constants'

export interface ReleaseInfo {
  tag: string
  htmlUrl: string
}

const GITHUB_API_LATEST = VersionApiUrl

export function useLatestRelease() {
  const [latest, setLatest] = useState<ReleaseInfo | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch(GITHUB_API_LATEST)
      .then(async (res) => {
        if (!res.ok)
          throw new Error(`GitHub API error: ${res.status} ${res.statusText}`)
        const json = await res.json()
        setLatest({
          tag: (json.tag_name as string).replace(/^v/, ''),
          htmlUrl: json.html_url as string,
        })
      })
      .catch((err) => setError(err))
  }, [])

  return { latest, error }
}
