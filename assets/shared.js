/**
 * @type {{
  speak: 'web' | 'server'
  plausible?: string
  isReady: boolean
}}
 */
export const g = {
  speak: 'web',
  isReady: false,
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
