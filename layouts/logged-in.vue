<template>
  <b-loading v-if="!(store.state.isAuthReady && store.state.user)" active />
  <section v-else class="AppLayout">
    <nav class="vertical-nav">
      <div class="icon-nav">
        <component
          :is="nav.to ? 'router-link' : 'a'"
          v-for="nav in navItems"
          :key="nav.name"
          :to="nav.to"
          :class="{ active: $route.path === nav.to }"
          :href="nav.href"
          :rel="nav.href ? 'noopener noreferrer' : undefined"
          :target="nav.href ? '_blank' : undefined"
        >
          <fontawesome v-if="nav.icon" :icon="nav.icon" />
          <span
            v-if="nav.character || nav.text"
            class="icon"
            :class="{ 'font-han': nav.character }"
          >
            {{ nav.character || nav.text }}
          </span>
          <span>{{ nav.name }}</span>
        </component>
      </div>

      <div class="flex-grow" />

      <div class="icon-nav">
        <b-tooltip label="Click to logout">
          <a class="w-full" @click="doLogout" @keypress="doLogout">
            <figure class="image is-48x48">
              <img
                class="is-rounded"
                :src="getGravatarUrl()"
                :alt="getUserName()"
              />
            </figure>
            <span>{{ getUserName() }}</span>
          </a>
        </b-tooltip>
      </div>
    </nav>

    <b-navbar class="main-nav has-shadow is-warning">
      <template slot="brand">
        <b-navbar-item tag="router-link" to="/">
          <strong>Zh</strong>
          <span>Quiz</span>
        </b-navbar-item>
      </template>
      <template slot="start">
        <b-navbar-item
          v-for="nav in navItems"
          :key="nav.name"
          :tag="nav.to ? 'router-link' : 'a'"
          :to="nav.to"
          :active="$route.path === nav.to"
          :href="nav.href"
          :rel="nav.href ? 'noopener noreferrer' : undefined"
          :target="nav.href ? '_blank' : undefined"
        >
          <span class="prefix">
            <fontawesome v-if="nav.icon" :icon="nav.icon" />
            <span
              v-if="nav.character || nav.text"
              class="icon"
              :class="{ 'font-zh-simp': nav.character }"
            >
              {{ nav.character || nav.text }}
            </span>
          </span>
          <span>{{ nav.name }}</span>
        </b-navbar-item>
      </template>
      <template slot="end">
        <b-navbar-item tag="div" class="flex flex-row flex-wrap items-center">
          <div>Signed in as {{ getUserName() }}</div>
          <div class="flex flex-row flex-grow">
            <div class="flex-grow" />
            <button
              class="button is-danger"
              @click="doLogout"
              @keypress="doLogout"
            >
              Logout
            </button>
          </div>
        </b-navbar-item>
      </template>
    </b-navbar>

    <nuxt class="main" />
  </section>
</template>

<script lang="ts">
import 'firebase/auth'

import firebase from 'firebase/app'
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class AppLayout extends Vue {
  get navItems() {
    return [
      {
        name: 'Random',
        to: '/random',
        icon: 'random',
      },
      {
        name: 'Quiz',
        to: '/quiz',
        icon: 'question-circle',
      },
      {
        name: 'Hanzi',
        to: '/hanzi',
        character: '字',
      },
      {
        name: 'Vocab',
        to: '/vocab',
        character: '词',
      },
      {
        name: 'Level',
        to: '/level',
        text: this.level,
      },
      {
        name: 'Extra',
        to: '/extra',
        icon: 'folder-plus',
      },
      {
        name: 'Library',
        to: '/library',
        icon: 'book-open',
      },
      {
        name: 'Settings',
        to: '/settings',
        icon: 'cog',
      },
      {
        name: 'About',
        href: 'https://github.com/patarapolw/zhquiz',
        icon: ['fab', 'github'],
      },
    ]
  }

  get level() {
    const { level } = this.$accessor
    return level ? level.toString() : ' '
  }

  getGravatarUrl() {
    const { user } = this.$accessor

    if (user) {
      return user.photoURL || '/svg/user-svgrepo-com.svg'
    }

    return '/svg/user-svgrepo-com.svg'
  }

  getUserName() {
    const { user } = this.$accessor

    if (user) {
      return user.displayName || (user as any).name
    }

    return ''
  }

  doLogout() {
    return firebase.auth().signOut()
  }
}
</script>

<style scoped>
.AppLayout {
  display: flex;
  width: 100vw;
  height: 100vh;
  flex-direction: column;
}

.vertical-nav {
  display: none;
  overflow: scroll;
  z-index: 10;
  display: flex;
  flex-direction: column;
  width: 300px;
  min-width: 300px;
  max-height: 100vh;
  background-image: radial-gradient(
    circle at center right,
    rgb(255, 233, 162),
    rgb(255, 220, 106)
  );
}

.vertical-nav .svg-inline--fa,
.vertical-nav .icon {
  --icon-size: 30px;

  font-size: 20px;
  font-weight: 600;
  width: var(--icon-size);
  height: var(--icon-size);
  margin: 10px;
  align-self: center;
}

.icon-nav {
  display: flex;
  flex-direction: column;
}

.icon-nav:first-child {
  margin-top: 1rem;
}

.icon-nav:last-child {
  margin-bottom: 0.5rem;
}

.icon-nav a {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.icon-nav a.active {
  background-color: rgba(255, 255, 0, 0.5);
}

.icon-nav:last-child figure {
  margin-left: 0.5rem;
  margin-right: 1rem;
}

.main-nav {
  z-index: 20;
  display: flex;
  background-image: radial-gradient(
    circle at center right,
    rgb(255, 233, 162),
    rgb(255, 220, 106)
  );
}

.main-nav >>> .navbar-start:not(.is-active) :not(button) {
  background-color: white;
}

.main-nav >>> .prefix {
  width: 2em;
  display: inline-block;
}

.main {
  max-height: 100vh;
  overflow: scroll;
  flex-grow: 1;
  padding: 1rem;
  background-color: rgb(250, 250, 250);
}

@media screen and (max-width: 1024px) {
  .AppLayout {
    flex-direction: column;
  }

  .vertical-nav {
    display: none;
  }

  .main-nav {
    display: flex;
    flex-direction: column;
  }
}

@media (min-width: 1025px) {
  .AppLayout {
    flex-direction: row;
  }

  .vertical-nav {
    display: flex;
  }

  .main-nav {
    display: none;
  }
}
</style>