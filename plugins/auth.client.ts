import { Plugin } from '@nuxt/types'
import { getCotterConfig, setCotter } from '~/service/auth'
import Cotter from 'cotter'

declare global {
  interface Window {
    onNuxtReady: (handler: () => void) => void
  }
}

const onInit: Plugin = async ({ $axios, app, route }) => {
  try {
    const cotterConfig: {
      apiKey: string
    } = await fetch('/server/auth/cotter').then((r) => r.json())

    const cotter = new Cotter(cotterConfig.apiKey)
    setCotter(cotter)

    const config = await getCotterConfig()
    $axios.defaults.headers = Object.assign($axios.defaults.headers, config)
    app.$accessor.updateUser(config['X-User'] || null)

    window.onNuxtReady(() => {
      if (app.$accessor.user) {
        if (route.path === '/') {
          window.$nuxt.$router.push('/random')
        }
      } else {
        if (route.path !== '/') {
          window.$nuxt.$router.push('/')
        }
      }
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
}

export default onInit
