import { Plugin } from '@nuxt/types'
import { fetchSettings } from '~/assets/shared'
import { getCotterConfig, setCotter } from '~/service/auth'
import Cotter from 'cotter'

declare global {
  interface Window {
    onNuxtReady: (handler: () => void) => void
  }
}

const onInit: Plugin = async ({ $axios, app, route }) => {
  const g = await fetchSettings()

  if (g.cotter) {
    const cotter = new Cotter(g.cotter)
    setCotter(cotter)

    const config = await getCotterConfig()
    $axios.defaults.headers = Object.assign($axios.defaults.headers, config)
    await app.$accessor.updateUser(config['X-User'] || null)
  } else {
    await app.$accessor.updateUser(g.user || '')
  }

  window.onNuxtReady(() => {
    if (app.$accessor.user !== null) {
      if (route.path === '/') {
        window.$nuxt.$router.push('/random')
      }
    } else {
      if (route.path !== '/') {
        window.$nuxt.$router.push('/')
      }
    }
  })
}

export default onInit
