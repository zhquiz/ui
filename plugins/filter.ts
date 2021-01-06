import { Duration } from '~/assets/duration'
import Vue from 'vue'

Vue.filter('format', (v: any) => {
  if (typeof v === 'number') {
    return v || v === 0 ? v.toLocaleString() : ''
  } else if (v instanceof Date) {
    return v.toLocaleDateString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    })
  } else if (v && typeof v === 'object') {
    return JSON.stringify(v)
  }
  return v
})

Vue.filter('formatDate', (v: any) => {
  return v
    ? new Date(v).toLocaleDateString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      })
    : ''
})

Vue.filter('duration', (v: any) => {
  return v
    ? new Duration(new Date(v), new Date()).toString({
        sign: false,
        granularity: 2,
      })
    : ''
})
