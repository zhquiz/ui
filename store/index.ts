import { logOut } from '~/service/auth'
import { actionTree, getAccessorType, mutationTree } from 'nuxt-typed-vuex'

interface ISettings {
  level: number | null
  levelMin: number | null
  sentenceMin: number | null
  sentenceMax: number | null
}

export const state = () => ({
  isAuthReady: false,
  user: null as string | null,
  settings: {
    level: null,
    levelMin: null,
    sentenceMin: null,
    sentenceMax: null,
  } as ISettings,
})

export type RootState = ReturnType<typeof state>

export const mutations = mutationTree(state, {
  SET_USER(state, user: string | null) {
    state.isAuthReady = true
    state.user = JSON.parse(JSON.stringify(user))
  },
  SET_SETTINGS(state, settings: ISettings) {
    state.settings = settings
  },
})

export const actions = actionTree(
  { state, mutations },
  {
    async updateUser({ commit }, user: string | null) {
      let r: any

      try {
        if (user) {
          r = await this.$axios.$get('/api/user/', {
            params: {
              select: [
                'level',
                'levelMin',
                'settings.sentence.min',
                'settings.sentence.max',
              ],
            },
          })
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }

      if (r) {
        commit('SET_SETTINGS', {
          level: r.level || 3,
          levelMin: r.levelMin || 1,
          sentenceMin: r['settings.sentence.min'] || null,
          sentenceMax: r['settings.sentence.max'] || null,
        })
        commit('SET_USER', user)
      } else {
        await logOut()
        commit('SET_SETTINGS', {
          levelMin: null,
          level: null,
          sentenceMin: null,
          sentenceMax: null,
        })
        commit('SET_USER', null)
      }
    },
  }
)

export const accessorType = getAccessorType({
  state,
  mutations,
  actions,
  // modules: {
  //   dictionary,
  // },
})
