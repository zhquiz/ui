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
      script: [
        {
          async: true,
          defer: true,
          'data-domain': 'zhquiz.cc',
          src: 'https://plausible.io/js/plausible.js',
        },
      ],
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
      '~/plugins/axios-loading.client.ts',
      '~/plugins/axios-query.ts',
      '~/plugins/codemirror.client.js',
      '~/plugins/filter.ts',
      '~/plugins/firebase-auth.client.ts',
      '~/plugins/vue-context.client.js',
      '~/plugins/webcomponents.client.ts',
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
              'faQuestionCircle',
              'faFolderPlus',
              'faCog',
              'faBookOpen',
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
      [
        '@nuxtjs/firebase',
        {
          config: JSON.parse(process.env.FIREBASE_CONFIG!),
          services: {
            auth: true,
            storage: true,
          },
        },
      ],
    ],
    proxy: {
      '/api/': 'http://localhost:8080',
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
      // @ts-ignore
      extend: (config) => {
        config.module!.rules.push({
          test: /\.ya?ml$/,
          type: 'json', // Required by Webpack v4
          use: 'yaml-loader',
        })
      },
    },
  }
}
