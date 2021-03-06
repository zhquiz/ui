import { Plugin } from '@nuxt/types'
import rison from 'rison-node'

const onInit: Plugin = ({ $axios }) => {
  $axios.defaults.paramsSerializer = (query: Record<string, any>) => {
    const q = Object.entries(query)
      .map(([k, v]) => {
        if (!v) {
          return
        }

        if (k === '_') {
          return `_=${rison.encode(v)}`
        }

        return `${encodeURIMin(k)}=${encodeURIMin(v)}`
      })
      .filter((s) => s)
      .join('&')

    return q
  }
}

export default onInit

function encodeURIMin(s: string) {
  s = (s || '').toString()

  const re = /(?![\x20-\x7F])[!,]/g
  const segs = s.match(re)
  if (segs) {
    return s
      .split(re)
      .map((s0, i) => encodeURIComponent(s0) + (segs[i] || ''))
      .join('')
  }

  return s
}
