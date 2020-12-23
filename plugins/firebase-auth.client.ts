import 'firebase/auth'
import 'firebase/analytics'

import { Plugin } from '@nuxt/types'
import firebase from 'firebase/app'

const onInit: Plugin = async ({ app, $axios, route }) => {
  const firebaseConfig = await $axios.$get('/api/firebase-config.json')

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
}

export default onInit
