/**
 * @type {{
  isReady: boolean
  speak: 'web' | 'server'
  plausible?: string
  cotter?: string
  user?: string
}}
 */
export const g = {
  isReady: false,
  speak: 'web',
}

export async function fetchSettings() {
  if (g.isReady) {
    return g
  }

  return fetch('/server/settings')
    .then((r) => r.json())
    .then((r) => {
      g.isReady = true

      return /** @type {typeof g} */ (Object.assign(g, r))
    })
}
