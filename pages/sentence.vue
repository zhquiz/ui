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
          <span class="hover-blue cursor-pointer">
            {{ props.row.chinese }}
          </span>
        </b-table-column>
        <b-table-column v-slot="props" field="english" label="English" sortable>
          {{ props.row.english }}
        </b-table-column>
      </b-table>
    </div>

    <ContextMenu ref="context" type="sentence" :entry="selected" />
  </section>
</template>

<script lang="ts">
import { Vue, Component, Watch, Ref } from 'nuxt-property-decorator'
import ContextMenu from '~/components/ContextMenu.vue'

@Component<SentencePage>({
  layout: 'logged-in',
  created() {
    this.q0 = this.q
    this.reload()
  },
})
export default class SentencePage extends Vue {
  @Ref() context!: ContextMenu

  q0 = ''
  tablePagedData: any[] = []
  count = 0
  perPage = 5
  page = 1

  selected = ''

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
    }>('/api/sentence/q', {
      params: {
        q: this.q,
        page: this.page,
        perPage: this.perPage,
      },
    })

    this.tablePagedData = result
    this.count = count
  }

  async onTableContextmenu(row: any, evt: MouseEvent) {
    evt.preventDefault()

    this.selected = row.chinese
    await this.context.open(evt)
  }
}
</script>

<style lang="scss" scoped>
.hover-blue:hover {
  color: blue;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
