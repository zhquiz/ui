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
            placeholder="Type here to search."
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

    <client-only>
      <vue-context ref="contextmenu" lazy>
        <li>
          <a
            role="button"
            @click.prevent="speakRow()"
            @keypress.prevent="speakRow()"
          >
            Speak
          </a>
        </li>
        <li v-if="selected.row && !selected.quizIds.length">
          <a
            role="button"
            @click.prevent="addToQuiz()"
            @keypress.prevent="addToQuiz()"
          >
            Add to quiz
          </a>
        </li>
        <li v-if="selected.row && selected.quizIds.length">
          <a
            role="button"
            @click.prevent="removeFromQuiz()"
            @keypress.prevent="removeFromQuiz()"
          >
            Remove from quiz
          </a>
        </li>
        <li v-if="selected.row">
          <nuxt-link
            :to="{ path: '/vocab', query: { q: selected.row.entry } }"
            target="_blank"
          >
            Search for vocab
          </nuxt-link>
        </li>
        <li v-if="selected.row">
          <nuxt-link
            :to="{ path: '/hanzi', query: { q: selected.row.entry } }"
            target="_blank"
          >
            Search for Hanzi
          </nuxt-link>
        </li>
        <li v-if="selected.row">
          <a
            :href="`https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=*${selected.row.entry}*`"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in MDBG
          </a>
        </li>
        <li>
          <a
            role="button"
            @click.prevent="doDelete()"
            @keypress.prevent="doDelete()"
          >
            Delete
          </a>
        </li>
      </vue-context>
    </client-only>
  </section>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'nuxt-property-decorator'

import { speak } from '~/assets/speak'

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
    row?: IExtra
    quizIds: string[]
  } = {
    quizIds: [],
  }

  get q() {
    const q = this.$route.query.q
    return (Array.isArray(q) ? q[0] : q) || ''
  }

  set q(q: string) {
    this.$router.push({ query: { q } })
  }

  async speakRow() {
    if (this.selected.row) {
      await speak(this.selected.row.chinese)
    }
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
      this.selected.row = {
        ...this.newItem,
        id,
      }
      this.$set(this.selected, 'row', this.selected.row)
    }

    this.newItem = {
      chinese: '',
      pinyin: '',
      english: '',
    }
    this.$set(this, 'newItem', this.newItem)

    if (id) {
      await Promise.all([this.load(), this.addToQuiz()])
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
    if (this.selected.row && this.selected.row.id) {
      await this.$axios.$delete('/api/extra', {
        params: {
          id: this.selected.row.id,
        },
      })
      await this.load()
    }
  }

  async onTableContextmenu(row: any, evt: MouseEvent) {
    evt.preventDefault()

    this.selected.row = row
    const { result } = await this.$axios.$get('/api/quiz/many', {
      params: {
        entries: [row.entry],
        select: ['id'],
        type: 'extra',
      },
    })

    this.selected.quizIds = result.map((q: any) => q.id)
    this.$set(this.selected, 'quizIds', this.selected.quizIds)

    const contextmenu = this.$refs.contextmenu as any
    contextmenu.open(evt)
  }

  async addToQuiz() {
    if (this.selected.row) {
      await this.$axios.$put('/api/quiz', {
        entries: [this.selected.row.chinese],
        type: 'extra',
      })

      this.$buefy.snackbar.open(
        `Added extra: ${this.selected.row.chinese} to quiz`
      )
    }
  }

  async removeFromQuiz() {
    if (this.selected.row) {
      if (this.selected.quizIds.length) {
        await this.$axios.$post('/api/quiz/delete/ids', {
          ids: this.selected.quizIds,
        })
      }
      this.$buefy.snackbar.open(
        `Removed extra: ${this.selected.row.chinese} from quiz`
      )
    }
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
