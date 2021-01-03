<template>
  <section>
    <div v-if="isInit" class="QuizPage">
      <div class="columns">
        <div class="column is-4">
          <div class="field">
            <label class="label">Type</label>
            <b-field class="flex-wrap">
              <b-checkbox-button
                v-model="type"
                native-value="hanzi"
                type="is-success"
              >
                Hanzi
              </b-checkbox-button>
              <b-checkbox-button
                v-model="type"
                native-value="vocab"
                type="is-success"
              >
                Vocab
              </b-checkbox-button>
              <b-checkbox-button
                v-model="type"
                native-value="sentence"
                type="is-success"
              >
                Sentence
              </b-checkbox-button>
              <b-checkbox-button
                v-model="type"
                native-value="extra"
                type="is-success"
              >
                Extra
              </b-checkbox-button>
            </b-field>
          </div>
        </div>
        <div class="column is-4">
          <div class="field">
            <label class="label">Learning stage</label>
            <b-field class="flex-wrap">
              <b-checkbox-button
                v-model="stage"
                native-value="new"
                type="is-success"
              >
                New
              </b-checkbox-button>
              <b-checkbox-button
                v-model="stage"
                native-value="leech"
                type="is-success"
              >
                Leech
              </b-checkbox-button>
              <b-checkbox-button
                v-model="stage"
                native-value="learning"
                type="is-success"
              >
                Learning
              </b-checkbox-button>
              <b-checkbox-button
                v-model="stage"
                native-value="graduated"
                type="is-success"
              >
                Graduated
              </b-checkbox-button>
            </b-field>
          </div>
        </div>
        <div class="column is-4">
          <div class="field">
            <label class="label">Due</label>
            <div class="control">
              <b-switch v-model="isDue">Due only</b-switch>
            </div>
          </div>
        </div>
      </div>

      <div class="columns">
        <div class="column is-6">
          <div class="field">
            <label class="label">Direction</label>
            <b-field class="flex-wrap">
              <b-checkbox-button
                v-model="direction"
                native-value="se"
                type="is-success"
              >
                Simplified-English
              </b-checkbox-button>
              <b-checkbox-button
                v-model="direction"
                native-value="te"
                type="is-success"
              >
                Traditional-English
              </b-checkbox-button>
              <b-checkbox-button
                v-model="direction"
                native-value="ec"
                type="is-success"
              >
                English-Chinese
              </b-checkbox-button>
            </b-field>
          </div>
        </div>
        <div class="column is-6">
          <b-field label="Filter by tags">
            <b-taginput
              v-model="selectedTags"
              icon="tag"
              placeholder="Add a tag"
              :data="filteredTags"
              autocomplete
              :allow-new="false"
              open-on-focus
              @typing="getFilteredTags"
            />
          </b-field>
        </div>
      </div>

      <b-collapse class="card" animation="slide" :open="isQuizDashboardReady">
        <div
          slot="trigger"
          slot-scope="props"
          class="card-header"
          role="button"
        >
          <p class="card-header-title">Quiz</p>
          <a role="button" class="card-header-icon">
            <fontawesome :icon="props.open ? 'caret-down' : 'caret-up'" />
          </a>
        </div>
        <div class="card-content">
          <div class="columns">
            <div class="column is-3">
              <div v-if="!isDue">
                <span class="column-label">Pending: </span>
                <span>{{ quizArray.length | format }}</span>
              </div>
              <div v-else-if="dueItems.length">
                <span class="column-label">Due: </span>
                <span>{{ dueItems.length | format }}</span>
              </div>
              <div v-else-if="dueIn">
                <span class="column-label">Due in: </span>
                <span>{{ dueIn | duration }}</span>
              </div>
              <div v-else>
                <span>No items due</span>
              </div>
            </div>

            <div class="column is-3">
              <span class="column-label">New: </span>
              <span>{{ newItems.length | format }}</span>
            </div>
            <div class="column is-3">
              <span class="column-label">Leech: </span>
              <span>{{ leechItems.length | format }}</span>
            </div>
            <div class="column is-3 flex flex-row">
              <div class="flex-grow" />
              <b-button
                type="is-success"
                :disabled="quizArray.length === 0"
                @click="startQuiz"
              >
                Start Quiz
              </b-button>
            </div>
          </div>
        </div>
      </b-collapse>

      <b-collapse class="card" animation="slide" :open.sync="isTableShown">
        <div
          slot="trigger"
          slot-scope="props"
          class="card-header"
          role="button"
        >
          <p class="card-header-title">
            {{ props.open ? 'Hide items' : 'Show items' }}
          </p>
          <a role="button" class="card-header-icon">
            <fontawesome :icon="props.open ? 'caret-down' : 'caret-up'" />
          </a>
        </div>
        <div class="card-content">
          <b-table
            :data="tablePagedData"
            paginated
            backend-pagination
            :total="tableAllData.length"
            :per-page="perPage"
            :current-page.sync="page"
            @contextmenu="onTableContextmenu"
          >
            <b-table-column
              v-slot="props"
              field="type"
              label="Type"
              width="100"
              sortable
            >
              {{ props.row.type }}
            </b-table-column>
            <b-table-column v-slot="props" field="entry" label="Entry" sortable>
              {{ props.row.entry }}
            </b-table-column>
            <b-table-column
              v-slot="props"
              field="direction"
              label="Direction"
              sortable
            >
              <span v-if="props.row.direction === 'ec'"> English-Chinese </span>
              <span v-else-if="props.row.direction === 'te'">
                Traditional-English
              </span>
              <span v-else-if="props.row.type === 'vocab'">
                Simplified-English
              </span>
              <span v-else>Chinese-English</span>
            </b-table-column>
            <b-table-column v-slot="props" field="tag" label="Tag">
              <b-tag v-for="t in props.row.tag || []" :key="t">
                {{ t }}
              </b-tag>
            </b-table-column>
            <b-table-column
              v-slot="props"
              field="srsLevel"
              label="SRS Level"
              sortable
            >
              {{ props.row.srsLevel }}
            </b-table-column>
            <b-table-column
              v-slot="props"
              field="nextReview"
              label="Next Review"
              sortable
            >
              {{ props.row.nextReview | formatDate }}
            </b-table-column>
          </b-table>
        </div>
      </b-collapse>

      <b-modal :active.sync="isEditTagModal" @close="onEditTagModelClose">
        <div class="card">
          <div class="card-header">
            <div class="card-header-title">Edit tags</div>
          </div>
          <div class="card-content">
            <b-taginput
              v-if="selectedRow"
              v-model="selectedRow.tag"
              icon="tag"
              placeholder="Add a tag"
              :data="filteredTags"
              autocomplete
              :allow-new="true"
              open-on-focus
              @typing="getFilteredTags"
            />
            <div class="field taginput-field">
              <b-button @click="isEditTagModal = false">Close</b-button>
            </div>
          </div>
        </div>
      </b-modal>

      <QuizCard ref="quizCard" :quiz-array="quizArray" @quiz:ended="reload" />

      <b-loading :active="isLoading" />

      <client-only>
        <vue-context ref="contextmenu" lazy>
          <li>
            <a
              role="button"
              @click.prevent="speak(selectedRow.entry)"
              @keypress.prevent="speak(selectedRow.entry)"
            >
              Speak
            </a>
          </li>
          <li>
            <a
              role="button"
              @click.prevent="isEditTagModal = true"
              @keypress.prevent="isEditTagModal = true"
            >
              Edit tags
            </a>
          </li>
          <li>
            <a
              role="button"
              @click.prevent="removeItem"
              @keypress.prevent="removeItem"
            >
              Remove item
            </a>
          </li>
        </vue-context>
      </client-only>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Ref, Vue } from 'nuxt-property-decorator'

import { speak } from '~/assets/speak'
import QuizCard, { IQuizData, IQuizType } from '~/components/QuizCard.vue'

interface ITableRow {
  quizId: string
  templateId?: string
  type?: string
  entry?: string
  direction?: string
  tag: string[]
  srsLevel?: number
  nextReview?: string
}

@Component<QuizPage>({
  layout: 'logged-in',
  created() {
    this.init().then(() => {
      this.isQuizDashboardReady = true
    })
  },
  beforeDestroy() {
    window.onkeypress = null
  },
  watch: {
    type: {
      deep: true,
      handler() {
        this.reload()
      },
    },
    stage: {
      deep: true,
      handler() {
        this.reload()
      },
    },
    direction: {
      deep: true,
      handler() {
        this.reload()
      },
    },
    isDue() {
      this.reload()
    },
    isTableShown() {
      if (this.isTableShown) {
        this.updateTable()
      }
    },
    page() {
      this.updateTable()
    },
  },
})
export default class QuizPage extends Vue {
  @Ref() quizCard!: QuizCard

  isLoading = false
  isInit = false
  isQuizDashboardReady = false

  selectedTags: string[] = []
  filteredTags: string[] = []
  allTags: string[] = []

  type: IQuizType[] = ['hanzi', 'vocab', 'sentence', 'extra']
  stage = ['new', 'leech', 'learning']
  direction = ['se']
  isDue = true

  dueIn: Date | null = null

  tablePagedData: ITableRow[] = []

  perPage = 10
  page = 1
  isTableShown = false

  selectedRow: ITableRow | null = null
  isEditTagModal = false

  quizArray: string[] = []

  quizData: {
    [quizId: string]: IQuizData
  } = {}

  cache: {
    now: number
  } = {
    now: +new Date(),
  }

  get backlogItems() {
    this.cache.now = +new Date()
    return this.quizArray.filter((id) => {
      const d = this.quizData[id]
      return d && this._isBacklogSeverity
    })
  }

  get dueItems() {
    return [...this.backlogItems, ...this.newItems]
  }

  get newItems() {
    return this.quizArray.filter((id) => {
      const d = this.quizData[id]
      return d && typeof d.srsLevel === 'undefined'
    })
  }

  get leechItems() {
    return this.quizArray.filter((id) => {
      const d = this.quizData[id]
      return d && this._isLeechSeverity(d)
    })
  }

  /**
   * Between 0 - 1
   */
  _isSeverity(s: number) {
    if (s > 1 || s <= 0) {
      throw new Error('Cannot compare severity')
    }

    return s
  }

  _isBacklogSeverity(d: IQuizData) {
    if (!d.nextReview) {
      return 0
    }

    const s = (this.cache.now - +new Date(d.nextReview)) / this.cache.now
    if (s > 0) {
      return this._isSeverity(s)
    }

    return 0
  }

  _isLeechSeverity(d: IQuizData) {
    const { wrong } = (d.stat || {}).streak || {}
    if (typeof wrong === 'number' && wrong >= 3)
      return this._isSeverity(wrong / 10)

    return null
  }

  get tableAllData() {
    this.cache.now = +new Date()

    return this.quizArray
      .map((id) => this.quizData[id])
      .sort((a, b) => {
        const s = [a, b].map((el) => {
          const s1 = this._isLeechSeverity(el)
          if (s1) return s1 + 5

          const s2 = this._isBacklogSeverity(el)
          if (s2) return s2 + 3

          const s3 = el.srsLevel
          if (typeof s3 !== 'undefined') return 1 - s3 / 10

          return -(el.nextReview ? new Date(el.nextReview) : Infinity)
        })

        return s[1] - s[0]
      })
  }

  async init() {
    await Promise.all([
      (async () => {
        const {
          'settings.quiz': { type, stage, direction, isDue } = {} as any,
        } = await this.$axios.$get('/api/user', {
          params: {
            select: ['settings.quiz'],
          },
        })

        if (type) {
          this.$set(this, 'type', type)
        }

        if (stage) {
          this.$set(this, 'stage', stage)
        }

        if (direction) {
          this.$set(this, 'direction', direction)
        }

        if (typeof isDue !== 'undefined') {
          this.$set(this, 'isDue', isDue)
        }
        // eslint-disable-next-line no-console
      })().catch(console.error),
      (async () => {
        const { tags = [] } = await this.$axios.$get('/api/quiz/allTags')
        this.allTags = tags

        // eslint-disable-next-line no-console
      })().catch(console.error),
    ])

    this.isInit = true
    this.isLoading = false

    await this.reload()
  }

  async reload() {
    const {
      quiz,
      upcoming: [{ nextReview: dueIn } = {} as any] = [],
    } = await this.$axios.$get('/api/quiz/init', {
      params: {
        _: {
          type: this.type,
          stage: this.stage,
          direction: this.direction,
          isDue: this.isDue,
          tag: this.selectedTags,
        },
      },
    })

    this.quizArray = []
    // eslint-disable-next-line array-callback-return
    quiz.map(({ id, nextReview, srsLevel, stat }: any) => {
      this.quizArray.push(id)
      this.quizData[id] = { id, nextReview, srsLevel, stat }
    })

    this.$set(this, 'quizArray', this.quizArray)
    this.$set(this, 'quizData', this.quizData)

    this.dueIn = dueIn ? new Date(dueIn) : null
  }

  getFilteredTags(text: string) {
    this.filteredTags = this.allTags.filter((t) => {
      return t.toLocaleLowerCase().startsWith(text.toLocaleLowerCase())
    })
  }

  onTableContextmenu(row: any, evt: MouseEvent) {
    evt.preventDefault()

    this.selectedRow = row
    ;(this.$refs.contextmenu as any).open(evt)
  }

  removeItem() {
    const { quizId } = this.selectedRow || {}

    if (quizId) {
      this.$buefy.dialog.confirm({
        message: 'Are you sure you want to remove this item?',
        confirmText: 'Remove',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: async () => {
          await this.$axios.$delete('/api/quiz', {
            params: {
              id: quizId,
            },
          })

          delete this.quizData[quizId]
          this.$set(this, 'quizData', this.quizData)
        },
      })
    }
  }

  async onEditTagModelClose() {
    if (!this.selectedRow) {
      return
    }

    const { quizId, tag } = this.selectedRow

    await this.$axios.$patch(
      '/api/quiz',
      {
        set: { tag },
      },
      {
        params: {
          id: quizId,
        },
      }
    )

    if (this.quizData[quizId]) {
      this.$set(this.quizData[quizId], '_meta.tag', tag)
    }
  }

  async startQuiz() {
    await this.quizCard.startQuiz()
  }

  async speak(s: string) {
    if (s) {
      await speak(s)
    }
  }

  async updateTable() {
    const doLoad = () => {
      this.tablePagedData = this.tableAllData
        .slice((this.page - 1) * this.perPage, this.page * this.perPage)
        .map((q) => {
          const d = this.quizData[q.id]

          return {
            quizId: q.id,
            type: d.type,
            entry: d.entry,
            direction: d.direction,
            tag: d.tag || [],
            srsLevel: d.srsLevel,
            nextReview: d.nextReview,
          }
        })
      this.$set(this, 'tablePagedData', this.tablePagedData)
    }

    doLoad()

    if (this.tablePagedData.length > 0) {
      const { result } = await this.$axios.$get<{
        result: IQuizData[]
      }>('/api/quiz/many', {
        params: {
          ids: this.tablePagedData
            .map(({ quizId }) => {
              const q = this.quizData[quizId]
              if (!q || !q.entry || !q.type || !q.direction) {
                return quizId
              }
              return ''
            })
            .filter((id) => id),
          select: [
            'id',
            'entry',
            'type',
            'direction',
            'front',
            'back',
            'mnemonic',
            'tag',
          ],
        },
      })

      // eslint-disable-next-line array-callback-return
      result.map((r) => {
        let q = this.quizData[r.id]
        if (q) {
          Object.assign(q, r)
        } else {
          q = r
        }

        this.$set(this.quizData, r.id, q)
      })

      doLoad()
    }
  }
}
</script>

<style scoped>
.card {
  margin-bottom: 1rem;
}

.column-label {
  width: 5rem;
}

.taginput-field {
  padding-top: 1em;
  display: flex;
  flex-direction: row-reverse;
}

.quiz-modal .modal-content {
  max-width: 500px !important;
}

.quiz-modal .buttons-area {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.buttons-area .buttons {
  margin-bottom: 0;
}

.quiz-modal .card-content {
  min-height: 7.5rem;
  max-height: calc(100vh - 300px);
  overflow: scroll;
  padding-bottom: 0;
  padding-left: 0;
  padding-right: 0;
  margin-left: 1.5rem;
  margin-right: 1.5rem;
  border-bottom: 1px solid hsla(0, 0%, 50%, 0.25);
}

.buttons-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.buttons-panel .buttons {
  margin-bottom: 0;
}

.buttons-area button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background-color: currentColor;
  visibility: hidden;
  z-index: 2;
}

.buttons-area button:not(:active)::before {
  animation: ripple 0.4s cubic-bezier(0, 0, 0.2, 1);
  transition: visibility 0.4s step-end;
}

.buttons-area button:active::before {
  visibility: visible;
}

.edit-modal .card-footer {
  padding: 1rem;
}

@keyframes ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 0.5;
  }
  100% {
    width: 150px;
    height: 150px;
    opacity: 0;
  }
}
</style>
