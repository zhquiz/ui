import { NuxtConfig } from '@nuxt/types'

export default (): NuxtConfig => {
  return {
    /*
     ** Nuxt rendering mode
     ** See https://nuxtjs.org/api/configuration-mode
     */
    ssr: false,
    /*
     ** Nuxt target
     ** See https://nuxtjs.org/api/configuration-target
     */
    target: 'static',
    /*
     ** Headers of the page
     ** See https://nuxtjs.org/api/configuration-head
     */
    head: {
      title: 'ZhQuiz - Hanzi, Vocab and Sentences quizzing',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          hid: 'description',
          name: 'description',
          content: process.env.npm_package_description || '',
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content: 'chinese,mandarin,srs,quiz',
        },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
    /*
     ** Global CSS
     */
    css: ['~/assets/app.css', '~/assets/buefy-mod.css'],
    /*
     ** Plugins to load before mounting the App
     ** https://nuxtjs.org/guide/plugins
     */
    plugins: [
      '~/plugins/axios-nuxt.ts',
      '~/plugins/axios-query.ts',
      '~/plugins/filter.ts',
      '~/plugins/plausible.client.js',
      '~/plugins/vue-context.client.js',
      '~/plugins/webcomponents.client.ts',

      '~/plugins/auth.client.ts',
      '~/plugins/axios-loading.client.ts',
    ],
    /*
     ** Auto import components
     ** See https://nuxtjs.org/api/configuration-components
     */
    components: true,
    /*
     ** Nuxt.js dev-modules
     */
    buildModules: [
      '@nuxt/typescript-build',
      '@nuxtjs/pwa',
      'nuxt-typed-vuex',
      [
        '@nuxtjs/fontawesome',
        {
          component: 'fontawesome',
          icons: {
            solid: [
              'faSearch',
              'faCaretDown',
              'faCaretUp',
              'faTag',
              'faExclamationCircle',
              'faInfoCircle',
              'faExclamationTriangle',
              'faRandom',
              'faAngleLeft',
              'faAngleRight',
              'faAngleUp',
              'faArrowUp',
              'faEyeSlash',
              'faEye',
              'faCog',
              'faBookReader',
              'faUserEdit',
              'faChalkboardTeacher',
            ],
            brands: ['faGithub', 'faGoogle'],
          },
        },
      ],
    ],
    /*
     ** Nuxt.js modules
     */
    modules: [
      [
        'nuxt-buefy',
        {
          materialDesignIcons: false,
          defaultIconPack: 'fas',
          defaultIconComponent: 'fontawesome',
        },
      ],
      [
        '@nuxtjs/axios',
        {
          proxy: true,
          validateStatus: (status: number) => {
            if (status === 401) {
              return true
            }

            return status >= 200 && status < 300 // default
          },
        },
      ],
    ],
    proxy: {
      '/api/': `http://localhost:${process.env.SERVER_PORT}`,
      '/media/': `http://localhost:${process.env.SERVER_PORT}`,
      '/server/': `http://localhost:${process.env.SERVER_PORT}`,
    },
    pwa: {
      meta: {
        name: 'ZhQuiz',
      },
    },
    /*
     ** Build configuration
     ** See https://nuxtjs.org/api/configuration-build/
     */
    build: {
      transpile: [/typed-vuex/],
      extend(config) {
        if (!config.node) {
          config.node = {}
        }

        config.node.fs = 'empty'
      },
    },
    generate: {
      dir: '../server/public',
    },
  }
}
