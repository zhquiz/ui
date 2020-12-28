import 'firebase/auth'
import 'firebase/analytics'

import { Plugin } from '@nuxt/types'
import firebase from 'firebase/app'

const onInit: Plugin = async ({ app, $axios, route }) => {
  try {
    const firebaseConfig = await $axios.$get('/firebase/config.json')

    firebase.initializeApp(firebaseConfig)
    firebase.analytics()

    firebase.auth().onAuthStateChanged(async (user) => {
      $axios.defaults.headers = $axios.defaults.headers || {}
      if (user) {
        $axios.defaults.headers.Authorization = `Bearer ${await user.getIdToken()}`
      } else {
        delete $axios.defaults.headers.Authorization
      }

      if (app.router) {
        if (user) {
          if (route.path === '/') {
            app.router.push('/random')
          }
        } else {
          if (route.path !== '/') {
            app.router.push('/')
          }
        }
      }

      app.$accessor.updateUser(user)
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
}

export default onInit
