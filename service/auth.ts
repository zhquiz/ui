import Cotter from 'cotter'

// eslint-disable-next-line import/no-mutable-exports
export let cotter: Cotter | null = null

export function setCotter(c: Cotter) {
  cotter = c
}

export async function getCotterConfig() {
  if (cotter) {
    const token = await cotter.tokenHandler.getAccessToken()

    if (token) {
      return {
        Authorization: `Bearer ${token.token}`,
        'X-User': cotter.getLoggedInUser().identifier,
      }
    }
  }

  return {
    Authorization: undefined,
    'X-User': undefined,
  }
}
