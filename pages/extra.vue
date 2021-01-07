<template>
  <section>
    <div class="ExtraPage container">
      <form class="field" @submit.prevent="q = q0">
        <div class="control">
          <input
            v-model="q0"
            class="input"
            type="search"
            name="q"
            placeholder="Type here to search"
            aria-label="search"
          />
        </div>
      </form>

      <nav class="new-item-panel">
        <div class="w-full flex-grow">
          <b-field label="Chinese">
            <b-input v-model="newItem.chinese" />
          </b-field>
        </div>

        <div class="w-full flex-grow">
          <b-field label="Pinyin">
            <b-input v-model="newItem.pinyin" />
          </b-field>
        </div>

        <div class="w-full flex-grow">
          <b-field label="English">
            <b-input v-model="newItem.english" />
          </b-field>
        </div>

        <div class="tablet:w-full">
          <button
            class="button is-success w-full"
            :disabled="!newItem.chinese || !newItem.english"
            @click="doCreate()"
            @keypress="doCreate()"
          >
            Add
          </button>
        </div>
      </nav>

      <b-table
        :data="tableData"
        :columns="tableHeader"
        checkable
        paginated
        backend-pagination
        :total="count"
        :per-page="perPage"
        :current-page.sync="page"
        backend-sorting
        :default-sort="[sort.key, sort.type]"
        @contextmenu="onTableContextmenu"
        @sort="onSort"
      />
    </div>

    <ContextMenu
      :id="selected.id"
      ref="context"
      :entry="selected.entry"
      type="extra"
      @deleted="doDelete"
    />
  </section>
</template>

<script lang="ts">
import { Component, Ref, Vue, Watch } from 'nuxt-property-decorator'
import ContextMenu from '~/components/ContextMenu.vue'

interface IExtra {
  id?: string
  chinese: string
  pinyin: string
  english: string
}

@Component<ExtraPage>({
  layout: 'logged-in',
  created() {
    this.load()
  },
})
export default class ExtraPage extends Vue {
  @Ref() context!: ContextMenu

  q0 = ''
  count = 0
  perPage = 10
  page = 1
  tableData: IExtra[] = []
  tableHeader = [
    { field: 'chinese', label: 'Chinese', sortable: true },
    { field: 'pinyin', label: 'Pinyin', sortable: true },
    { field: 'english', label: 'English', sortable: true },
  ]

  sort = {
    key: 'updatedAt',
    type: 'desc',
  }

  newItem: IExtra = {
    chinese: '',
    pinyin: '',
    english: '',
  }

  selected: {
    id?: string
    entry?: string
  } = {}

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
  async load() {
    const { result, count } = await this.$axios.$get('/api/extra/q', {
      params: {
        q: this.q,
        page: this.page,
        perPage: this.perPage,
        sort: [`${this.sort.type === 'desc' ? '-' : ''}${this.sort.key}`],
        select: ['id', 'chinese', 'pinyin', 'english'],
      },
    })

    this.tableData = result
    this.$set(this, 'tableData', this.tableData)
    this.count = count
  }

  async doCreate() {
    const { existing, id } = await this.$axios.$put('/api/extra', this.newItem)

    if (id) {
      this.selected.id = id
      this.selected.entry = this.newItem.chinese
    }

    this.newItem = {
      chinese: '',
      pinyin: '',
      english: '',
    }
    this.$set(this, 'newItem', this.newItem)

    if (id) {
      await this.context.addToQuiz()
      await this.load()
    } else if (existing) {
      const { type, entry } = existing
      await this.$axios.$put('/api/quiz', {
        entries: [entry],
        type,
      })

      this.$buefy.snackbar.open(`Added ${type}: ${entry} to quiz`)
    }
  }

  async doDelete() {
    await this.load()
  }

  async onTableContextmenu(row: any, evt: MouseEvent) {
    evt.preventDefault()

    this.selected.id = row.id
    this.selected.entry = row.chinese
    await this.context.open(evt)
  }

  async onSort(key: string, type: string) {
    this.sort.key = key
    this.sort.type = type
    await this.load()
  }
}
</script>

<style scoped>
.new-item-panel {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 0.5rem;
}

.new-item-panel > div {
  margin-top: 0;
  margin-left: 0;
}

.new-item-panel > div + div {
  margin-left: 1em;
}

tbody tr:hover {
  cursor: pointer;
  color: blue;
}

@media screen and (max-width: 1024px) {
  .new-item-panel {
    flex-direction: column;
    align-items: flex-end;
  }

  .new-item-panel > div + div {
    margin-top: 1em;
  }
}
</style>
