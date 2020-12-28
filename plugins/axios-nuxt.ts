import { Plugin } from '@nuxt/types'
import { setClient } from '~/service/api'

const plugin: Plugin = ({ $axios, error }) => {
  setClient($axios)

  $axios.defaults.baseURL = location.origin

  $axios.interceptors.response.use((r) => {
    if (r.data?.error) {
      error({
        statusCode: r.status,
        message: r.data.error,
      })
      throw new Error(r.data.error)
    }

    return r
  })
}

export default plugin
