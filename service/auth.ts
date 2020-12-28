import Cotter from 'cotter'

// eslint-disable-next-line import/no-mutable-exports
export let cotter: Cotter | null = null

export function setCotter(c: Cotter) {
  cotter = c
}

export async function getCotterConfig() {
  if (cotter) {
    try {
      const token = await cotter.tokenHandler.getAccessToken()

      if (token) {
        return {
          Authorization: `Bearer ${token.token}`,
          'X-User': cotter.getLoggedInUser().identifier,
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  return {
    Authorization: undefined,
    'X-User': undefined,
  }
}
