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
      if (user) {
        const { level = 1, levelMin = 1 } = await this.$axios.$get(
          '/api/user/',
          {
            params: {
              select: ['level', 'levelMin'],
            },
          }
        )
        commit('SET_LEVEL', { level, levelMin })
      } else {
        await this.$axios.$delete('/api/user/signOut')
        commit('SET_LEVEL', { levelMin: null, level: null })
      }

      commit('SET_USER', user)
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
