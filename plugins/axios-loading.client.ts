import { Plugin } from '@nuxt/types'
import { cotter, getCotterConfig, logOut } from '~/service/auth'
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

  $axios.interceptors.request.use(async (config) => {
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
      }, 5000)
    }

    if (cotter) {
      const cfg = await getCotterConfig()
      config.headers = Object.assign(config.headers || {}, cfg)
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
    async (err) => {
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

      if (status === 401 || status === 403) {
        await logOut(app.router)
        return {}
      }

      return err
    }
  )
}

export default onInit
