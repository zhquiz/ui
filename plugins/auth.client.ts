import { Plugin } from '@nuxt/types'
import { getCotterConfig, setCotter } from '~/service/auth'
import Cotter from 'cotter'

const onInit: Plugin = async ({ $axios, app, route }) => {
  try {
    const cotterConfig = await $axios.$get<{
      apiKey: string
    }>('/server/auth/cotter')

    const cotter = new Cotter(cotterConfig.apiKey)
    setCotter(cotter)
    const config = await getCotterConfig()

    $axios.defaults.headers = Object.assign($axios.defaults.headers, config)

    if (app.router) {
      if (config.Authorization) {
        if (route.path === '/') {
          app.router.push('/random')
        }
      } else {
        if (route.path !== '/') {
          app.router.push('/')
        }
      }
    }

    app.$accessor.updateUser(config['X-User'] || null)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
}

export default onInit
