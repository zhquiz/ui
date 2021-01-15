module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'prettier',
    'prettier/vue',
    'plugin:prettier/recommended',
    'plugin:nuxt/recommended',
  ],
  plugins: ['prettier'],
  // add your custom rules here
  rules: {
    'vue/no-v-html': 0,
    'require-await': 0,
    'import/order': 0,
    'no-lonely-if': 0,
    'no-use-before-define': 0,
    'unicorn/escape-case': 0,
  },
}
