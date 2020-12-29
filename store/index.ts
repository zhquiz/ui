import { logOut } from '~/service/auth'
import { actionTree, getAccessorType, mutationTree } from 'nuxt-typed-vuex'

export const state = () => ({
  isAuthReady: false,
  user: null as string | null,
  /**
   * This is necessary for layout display
   */
  level: null as number | null,
  levelMin: null as number | null,
})

export type RootState = ReturnType<typeof state>

export const mutations = mutationTree(state, {
  SET_USER(state, user: string | null) {
    state.isAuthReady = true
    state.user = JSON.parse(JSON.stringify(user))
  },
  SET_LEVEL(
    state,
    lv: {
      level: number | null
      levelMin: number | null
    }
  ) {
    state.level = lv.level
    state.levelMin = lv.levelMin
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
              select: ['level', 'levelMin'],
            },
          })
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }

      if (r) {
        commit('SET_LEVEL', { level: r.level || 1, levelMin: r.levelMin || 1 })
        commit('SET_USER', user)
      } else {
        await logOut()
        commit('SET_LEVEL', { levelMin: null, level: null })
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
