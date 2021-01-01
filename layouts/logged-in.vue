<template>
  <b-loading v-if="!($store.state.isAuthReady && $store.state.user)" active />
  <section v-else class="AppLayout">
    <nav class="vertical-nav">
      <div class="icon-nav" style="overflow-y: scroll">
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

      <div class="icon-nav">
        <div class="login-banner">
          <div>Signed in as {{ getUserName() }}</div>
          <button
            class="button is-danger"
            @click="doLogout"
            @keypress="doLogout"
          >
            Logout
          </button>
        </div>
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
import { Component, Vue } from 'nuxt-property-decorator'
import { logOut } from '~/service/auth'

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
        icon: 'chalkboard-teacher',
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
        name: 'Sentence',
        to: '/sentence',
        character: '句',
      },
      {
        name: 'Extra',
        to: '/extra',
        icon: 'user-edit',
      },
      {
        name: 'Library',
        to: '/library',
        icon: 'book-reader',
      },
      {
        name: 'Level',
        to: '/level',
        text: this.level,
      },
      {
        name: 'Settings',
        to: '/settings',
        icon: 'cog',
      },
      {
        name: 'About',
        href: 'https://github.com/zhquiz/zhquiz',
        icon: ['fab', 'github'],
      },
    ]
  }

  get level() {
    const { level } = this.$accessor.settings
    return level ? level.toString() : ' '
  }

  getUserName() {
    return this.$accessor.user || ''
  }

  async doLogout() {
    await logOut(this.$router)
  }
}
</script>

<style lang="scss" scoped>
.AppLayout {
  display: flex;
  width: 100vw;
  height: 100vh;
  flex-direction: column;
}

.vertical-nav {
  display: grid;
  grid-template-rows: 1fr 4rem;

  overflow: scroll;
  z-index: 10;
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

.vertical-nav,
.icon-nav {
  scrollbar-width: none; /* For Firefox */
  -ms-overflow-style: none; /* For Internet Explorer and Edge */

  &::-webkit-scrollbar {
    width: 0px; /* For Chrome, Safari, and Opera */
  }
}

.icon-nav {
  display: flex;
  flex-direction: column;
}

.icon-nav:first-child {
  padding-top: 1rem;
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

.b-tooltip {
  width: 100%;
  height: 100%;
}

.login-banner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;

  background-color: rgba(90, 90, 90, 0.2);
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

  .main-nav {
    display: none;
  }
}
</style>
