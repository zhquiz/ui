<template>
  <section>
    <div class="SentencePage container">
      <form class="field" @submit.prevent="q = q0">
        <div class="control">
          <input
            v-model="q0"
            class="input"
            type="search"
            name="q"
            placeholder="Type here to search."
            aria-label="search"
          />
        </div>
      </form>

      <b-table
        :data="tablePagedData"
        paginated
        backend-pagination
        :total="count"
        :per-page="perPage"
        :current-page.sync="page"
        @contextmenu="onTableContextmenu"
      >
        <b-table-column v-slot="props" field="chinese" label="Chinese" sortable>
          {{ props.row.chinese }}
        </b-table-column>
        <b-table-column v-slot="props" field="english" label="English" sortable>
          {{ props.row.english }}
        </b-table-column>
      </b-table>
    </div>
  </section>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'

@Component<SentencePage>({
  layout: 'logged-in',
  created() {
    this.q0 = this.q
    this.reload()
  },
})
export default class SentencePage extends Vue {
  q0 = ''
  tablePagedData: any[] = []
  count = 0
  perPage = 5
  page = 1

  get q() {
    const q = this.$route.query.q
    return (Array.isArray(q) ? q[0] : q) || ''
  }

  set q(q: string) {
    this.$router.push({ query: { q } })
  }

  @Watch('page')
  @Watch('perPage')
  @Watch('q')
  async reload() {
    const { result, count } = await this.$axios.$get<{
      result: any[]
      count: number
    }>(this.q ? '/api/sentence/q' : '/api/sentence/all', {
      params: {
        q: this.q,
        page: this.page,
        perPage: this.perPage,
        level: this.$accessor.level,
        levelMin: this.$accessor.levelMin,
      },
    })

    this.tablePagedData = result
    this.count = count
  }

  onTableContextmenu() {}
}
</script>
