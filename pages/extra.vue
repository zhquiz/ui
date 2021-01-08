<template>
  <section>
    <div class="ExtraPage container">
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

        <button
          class="control button is-success"
          type="button"
          @click="onNewItem"
        >
          Add new item
        </button>
      </form>

      <b-table
        :data="tableData"
        :columns="tableHeader"
        paginated
        backend-pagination
        :total="count"
        :per-page="perPage"
        :current-page.sync="page"
        backend-sorting
        :default-sort="[sort.key, sort.type]"
        @contextmenu="onTableContextmenu"
        @sort="onSort"
      >
      </b-table>
    </div>

    <b-modal v-model="isEditModal">
      <div class="card">
        <header class="card-header">
          <div v-if="!selected.id" class="card-header-title">New item</div>
          <div v-else class="card-header-title">Edit item</div>
        </header>
        <div class="card-content">
          <b-field label="Chinese">
            <b-input
              v-model="selected.chinese"
              placeholder="Must not be empty"
            ></b-input>
          </b-field>
          <b-field label="Pinyin">
            <b-input
              v-model="selected.pinyin"
              placeholder="Must not be empty"
            ></b-input>
          </b-field>
          <b-field label="English">
            <b-input
              v-model="selected.english"
              type="textarea"
              placeholder="Must not be empty"
            ></b-input>
          </b-field>
          <!-- <b-field label="Type">
            <b-select>
              <option value="vocab">Vocab</option>
              <option value="sentence">Sentence</option>
              <option v-if="selected.chinese.length === 1" value="hanzi">
                Hanzi
              </option>
            </b-select>
          </b-field> -->
          <b-field label="Description">
            <b-input v-model="selected.description" type="textarea"></b-input>
          </b-field>
          <b-field label="Tag">
            <b-input v-model="selected.tag"></b-input>
          </b-field>
        </div>
        <footer class="card-footer">
          <div class="card-footer-item">
            <button
              class="button is-success"
              type="button"
              @click="selected.id ? doUpdate() : doCreate()"
            >
              Save
            </button>
            <button
              class="button is-cancel"
              type="button"
              @click="isEditModal = false"
            >
              Cancel
            </button>
          </div>
        </footer>
      </div>
    </b-modal>

    <ContextMenu
      :id="selected.id"
      ref="context"
      :entry="selected.chinese"
      type="extra"
      :additional="additionalContext"
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
  type: 'hanzi' | 'vocab' | 'sentence'
  description: string
  tag: string
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
  readonly tableHeader = [
    { field: 'chinese', label: 'Chinese', sortable: true },
    { field: 'pinyin', label: 'Pinyin', sortable: true },
    { field: 'english', label: 'English', sortable: true, width: '40vw' },
  ]

  isEditModal = false

  sort = {
    key: 'updatedAt',
    type: 'desc',
  }

  selected: IExtra = {
    id: '',
    chinese: '',
    pinyin: '',
    english: '',
    type: 'vocab',
    description: '',
    tag: '',
  }

  additionalContext = [
    {
      name: 'Edit item',
      handler: () => {
        this.openEditModal()
      },
    },
    {
      name: 'Delete item',
      handler: () => {
        this.doDelete()
      },
    },
  ]

  get q() {
    const q = this.$route.query.q
    return (Array.isArray(q) ? q[0] : q) || ''
  }

  set q(q: string) {
    this.$router.push({ query: { q } })
  }

  openEditModal() {
    this.isEditModal = true
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
    const { existing, id } = await this.$axios.$put('/api/extra', this.selected)

    if (id) {
      await this.context.addToQuiz()
      this.$buefy.snackbar.open(`Added extra: ${this.selected.chinese} to quiz`)

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

  async doUpdate() {
    await this.$axios.$patch('/api/extra', this.selected, {
      params: {
        id: this.selected.id,
      },
    })

    this.$buefy.snackbar.open(`Update extra: ${this.selected.chinese}`)

    await this.load()
  }

  async doDelete() {
    await this.$axios.$delete('/api/extra', {
      params: {
        id: this.selected.id,
      },
    })

    await this.load()
  }

  async onNewItem() {
    this.selected = {
      id: '',
      chinese: '',
      pinyin: '',
      english: '',
      type: 'vocab',
      description: '',
      tag: '',
    }

    this.isEditModal = true
  }

  async onTableContextmenu(row: IExtra, evt: MouseEvent) {
    evt.preventDefault()

    this.selected = row
    await this.context.open(evt)
  }

  async onSort(key: string, type: string) {
    this.sort.key = key
    this.sort.type = type
    await this.load()
  }
}
</script>

<style lang="scss" scoped>
.b-table ::v-deep tr:hover {
  cursor: pointer;
  color: blue;
}

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

@media screen and (max-width: 1024px) {
  .new-item-panel {
    flex-direction: column;
    align-items: flex-end;
  }

  .new-item-panel > div + div {
    margin-top: 1em;
  }
}

.button + .button {
  margin-left: 1rem;
}

.button.is-cancel {
  background-color: rgb(215, 217, 219);
}
</style>
