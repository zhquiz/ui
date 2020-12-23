import { NuxtAxiosInstance } from '@nuxtjs/axios'

// eslint-disable-next-line import/no-mutable-exports
export let api: NuxtAxiosInstance

export function setClient(newclient: NuxtAxiosInstance) {
  api = newclient
}
