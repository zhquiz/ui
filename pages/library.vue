<template>
  <section>
    <div class="LibraryPage">
      <form class="field is-grouped" @submit.prevent="q = q0">
        <b-field class="is-expanded" label="Search" label-position="on-border">
          <input
            v-model="q0"
            class="input"
            type="search"
            name="q"
            placeholder="Type here to search"
            aria-label="search"
          />
        </b-field>
      </form>

      <div class="columns">
        <div class="column">
          <section>
            <LibraryCard
              v-for="(it, i) in local.result"
              :key="i"
              :title="it.title"
              :entries="it.entries"
            />
          </section>

          <b-pagination
            v-if="local.count > local.perPage"
            v-model="local.page"
            :total="local.count"
            :per-page="local.perPage"
            icon-prev="angle-left"
            icon-next="angle-right"
            @change="(p) => (local.page = p)"
          />
        </div>
        <div class="column">
          <section>
            <LibraryCard
              v-for="(it, i) in online.result"
              :key="i"
              :title="it.title"
              :entries="it.entries"
            />
          </section>

          <b-pagination
            v-if="online.count > online.perPage"
            v-model="online.page"
            :total="online.count"
            :per-page="online.perPage"
            icon-prev="angle-left"
            icon-next="angle-right"
            @change="(p) => (online.page = p)"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'nuxt-property-decorator'

@Component<LibraryPage>({
  layout: 'logged-in',
  async created() {
    await Promise.all([this.updateLocal(), this.updateOnline()])
  },
})
export default class LibraryPage extends Vue {
  q0 = ''

  local: {
    result: {
      title: string
      entries: string[]
    }[]
    count: number
    page: number
    perPage: number
  } = {
    result: [],
    count: 0,
    page: 1,
    perPage: 10,
  }

  online: {
    result: {
      title: string
      entries: string[]
    }[]
    count: number
    page: number
    perPage: number
  } = {
    result: [],
    count: 0,
    page: 1,
    perPage: 10,
  }

  get q() {
    const q = this.$route.query.q
    return (Array.isArray(q) ? q[0] : q) || ''
  }

  set q(q: string) {
    this.$router.push({ query: { q } })
  }

  @Watch('q')
  @Watch('local.page')
  async updateLocal() {
    const r = await this.$axios.$get('/api/library/q', {
      params: {
        q: this.q,
        page: this.local.page,
        perPage: this.local.perPage,
      },
    })

    this.local = {
      ...this.local,
      ...r,
    }
  }

  @Watch('q')
  @Watch('online.page')
  async updateOnline() {
    const r = await this.$axios.$get('https://www.zhquiz.cc/api/library', {
      params: {
        q: this.q,
        page: this.online.page,
        perPage: this.online.perPage,
      },
    })

    this.online = {
      ...this.online,
      ...r,
    }
  }
}
</script>

<style scoped>
.column > section {
  margin-bottom: 1rem;
}
</style>
