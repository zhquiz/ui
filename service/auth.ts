import Cotter from 'cotter'
import VueRouter from 'vue-router'

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

export async function logOut(router?: VueRouter) {
  if (cotter) {
    await cotter.logOut()
  }

  await fetch('/api/user/signOut', { method: 'DELETE' })

  if (router && router.currentRoute.path !== '/') {
    router.push('/')
  }
}
