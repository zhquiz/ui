import { Plugin } from '@nuxt/types'
import { cotter, getCotterConfig } from '~/service/auth'
import {
  LoadingProgrammatic as Loading,
  SnackbarProgrammatic as Snackbar,
} from 'buefy'

const onInit: Plugin = async ({ $axios, app }) => {
  let loading: {
    close(): any
    requestEnded?: boolean
  } | null = null
  let requestTimeout: number | null = null

  $axios.interceptors.request.use((config) => {
    if (!loading) {
      if (requestTimeout) {
        clearTimeout(requestTimeout)
        requestTimeout = null
      }

      requestTimeout = window.setTimeout(() => {
        if (!loading) {
          loading = Loading.open({
            isFullPage: true,
            canCancel: true,
            onCancel: () => {
              if (loading && !loading.requestEnded) {
                Snackbar.open('API request is loading in background.')
              }
            },
          })
        }
      }, 1000)
    }

    return config
  })

  $axios.interceptors.request.use(async (config) => {
    if (cotter) {
      const cfg = await getCotterConfig()
      config.headers = Object.assign(config.headers || {}, cfg)

      try {
        app.$accessor.updateUser(cfg['X-User'] || null)
      } catch (_) {
        app.$accessor.updateUser(null)
      }
    }

    return config
  })

  $axios.interceptors.response.use(
    (config) => {
      if (loading) {
        loading.requestEnded = true
        loading.close()
        loading = null
      }

      if (requestTimeout) {
        clearTimeout(requestTimeout)
        requestTimeout = null
      }

      return config
    },
    (err) => {
      if (loading) {
        loading.close()
        loading = null
      }

      if (requestTimeout) {
        clearTimeout(requestTimeout)
        requestTimeout = null
      }

      // eslint-disable-next-line no-console
      console.error(err)
      Snackbar.open(err.message)

      const { status } = err.response || {}

      if (app.router && (status === 401 || status === 403)) {
        app.router.push('/')

        return {}
      }

      return err
    }
  )
}

export default onInit
