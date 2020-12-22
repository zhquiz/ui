import 'firebase/auth'
import 'firebase/analytics'

import { Plugin } from '@nuxt/types'
import firebase from 'firebase/app'

const onInit: Plugin = ({ app }) => {
  firebase.analytics()

  firebase.auth().onAuthStateChanged((user) => {
    app.$accessor.updateUser(user)
  })
}

export default onInit
