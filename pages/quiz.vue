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
            <template slot-scope="props">
              <b-table-column field="type" label="Type" width="100" sortable>
                {{ (props.row || {}).type }}
              </b-table-column>
              <b-table-column field="entry" label="Entry" sortable>
                {{ (props.row || {}).entry }}
              </b-table-column>
              <b-table-column field="direction" label="Direction" sortable>
                <span v-if="(props.row || {}).direction === 'ec'">
                  English-Chinese
                </span>
                <span v-else-if="(props.row || {}).direction === 'te'">
                  Traditional-English
                </span>
                <span v-else-if="(props.row || {}).type === 'vocab'">
                  Simplified-English
                </span>
                <span v-else>Chinese-English</span>
              </b-table-column>
              <b-table-column field="tag" label="Tag">
                <b-tag v-for="t in (props.row || {}).tag || []" :key="t">
                  {{ t }}
                </b-tag>
              </b-table-column>
              <b-table-column field="srsLevel" label="SRS Level" sortable>
                {{ (props.row || {}).srsLevel }}
              </b-table-column>
              <b-table-column field="nextReview" label="Next Review" sortable>
                {{ (props.row || {}).nextReview | formatDate }}
              </b-table-column>
            </template>
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

      <b-modal class="quiz-modal" :active.sync="isQuizModal" @close="endQuiz">
        <div class="card">
          <div v-if="quizCurrentId" class="card-content">
            <div
              v-show="!isQuizShownAnswer"
              ref="quizFront"
              class="content"
              v-html="templateRender('front')"
            />
            <div
              v-show="isQuizShownAnswer"
              ref="quizBack"
              class="content"
              v-html="templateRender('back')"
            />
            <b-loading :active="!isQuizItemReady" :is-full-page="false" />
          </div>

          <div class="buttons-area">
            <div v-if="!quizCurrentId" class="buttons">
              <button
                ref="btnEndQuiz"
                class="button is-warning"
                @click="endQuiz"
                @keypress="endQuiz"
              >
                End quiz
              </button>
            </div>
            <div v-else-if="!isQuizShownAnswer" class="buttons">
              <button
                ref="btnShowAnswer"
                class="button is-warning"
                @click="isQuizShownAnswer = true"
                @keypress="isQuizShownAnswer = true"
              >
                Show answer
              </button>
            </div>
            <div v-else class="buttons-panel">
              <div class="buttons">
                <button
                  ref="btnMarkRight"
                  class="button is-success"
                  @click="doMark('right')"
                  @keypress="doMark('right')"
                >
                  Right
                </button>
                <button
                  ref="btnMarkWrong"
                  class="button is-danger"
                  @click="doMark('wrong')"
                  @keypress="doMark('wrong')"
                >
                  Wrong
                </button>
                <button
                  ref="btnMarkRepeat"
                  class="button is-warning"
                  @click="doMark('repeat')"
                  @keypress="doMark('repeat')"
                >
                  Repeat
                </button>
              </div>

              <div class="buttons">
                <button
                  ref="btnHideAnswer"
                  class="button is-warning"
                  @click="isQuizShownAnswer = false"
                  @keypress="isQuizShownAnswer = false"
                >
                  Hide answer
                </button>
                <button
                  ref="btnEditModal"
                  class="button is-info"
                  @click="openEditModal(quizCurrentId)"
                  @keypress="openEditModal(quizCurrentId)"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </b-modal>

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
import { Component, Vue } from 'nuxt-property-decorator'
import ejs from 'ejs'
import makePinyin from 'chinese-to-pinyin'

import { doClick, doMapKeypress } from '~/assets/keypress'
import { speak } from '~/assets/speak'

export type IQuizType = 'hanzi' | 'vocab' | 'sentence' | 'extra'
export type ISide = 'front' | 'back'

interface IQuizData {
  id: string
  type?: IQuizType
  direction?: string
  srsLevel?: number
  nextReview?: string
  stat?: any
  entry?: string
  _meta?: {
    tag?: string[]
  }
}

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

  isQuizModal = false
  quizArray: string[] = []
  quizIndex = 0
  isQuizShownAnswer = false
  isQuizItemReady = false

  quizData: {
    [quizId: string]: IQuizData
  } = {}

  quizRendered: {
    [entry: string]: {
      [type in IQuizType]: {
        [direction: string]: {
          [side in ISide]: string
        }
      }
    }
  } = {}

  dictionaryData = {
    hanzi: {} as Record<
      string,
      {
        pinyin: string
        english: string
      }
    >,
    vocab: {} as Record<
      string,
      {
        traditional: string[]
        pinyin: string[]
        english: string[]
      }
    >,
    sentence: {} as Record<
      string,
      {
        [id: string]: {
          pinyin: string
          english: string
        }
      }
    >,
    extra: {} as Record<
      string,
      {
        pinyin: string
        english: string
      }
    >,
  }

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

  get quizCurrentId() {
    return this.quizArray[this.quizIndex] as string | undefined
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

  renderContext(entry: string, type: IQuizType) {
    const data = this.dictionaryData[type][entry] || {}

    return {
      item: entry,
      raw: data,
    }
  }

  templateRender(side: ISide, relativePosition = 0) {
    const it = this.quizData[this.quizArray[this.quizIndex + relativePosition]]

    if (!it) {
      return ''
    }

    const { entry, type, direction } = it

    if (!entry || !type || !direction) {
      return ''
    }

    let html = ''
    try {
      // Use try/catch instead of nullish Elvis operator
      html = this.quizRendered[entry][type][direction][side]
    } catch (_) {}

    if (!html) {
      // Do not await
      this.cacheQuizItem({ quizId: it.id })
    }

    return html
  }

  async init() {
    await Promise.all([
      (async () => {
        const {
          settings: {
            quiz: { type, stage, direction, isDue } = {} as any,
          } = {},
        } = await this.$axios.$get('/api/user', {
          params: {
            select: ['quiz'],
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
    const { quiz, upcoming: [dueIn] = [] as string[] } = await this.$axios.$get(
      '/api/quiz/init',
      {
        params: {
          _: {
            type: this.type,
            stage: this.stage,
            direction: this.direction,
            isDue: this.isDue,
            tag: this.selectedTags,
          },
        },
      }
    )

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
    this.quizIndex = -1
    await this.initNextQuizItem()

    window.onkeypress = this.onQuizKeypress.bind(this)
    this.isQuizModal = true
  }

  endQuiz() {
    window.onkeypress = null
    this.isQuizModal = false
    this.reload()
  }

  async initNextQuizItem() {
    this.quizIndex++
    this.isQuizShownAnswer = false

    Array(2)
      .fill(null)
      // eslint-disable-next-line array-callback-return
      .map((_, i) => {
        const front = this.templateRender('front', i + 1)
        // const back = this.templateRender('back', i + 1)

        if (!front) {
          this.cacheQuizItem({
            relativePosition: i + 1,
          })
        }
      })

    if (this.quizCurrentId) {
      await this.cacheQuizItem({ relativePosition: 0 })

      this.templateRender('front')
      this.templateRender('back')
    }
  }

  async cacheQuizItem(params: { quizId?: string; relativePosition?: number }) {
    const { relativePosition = 0 } = params
    let { quizId } = params
    quizId = quizId || this.quizArray[this.quizIndex + relativePosition]

    if (!quizId) {
      return
    }

    let q = this.quizData[quizId]
    if (!q || !q.entry || !q.type || !q.direction) {
      const r = await this.$axios.$get('/api/quiz', {
        params: {
          id: quizId,
          select: ['entry', 'type', 'direction', 'front', 'back', 'mnemonic'],
        },
      })
      q = Object.assign(q, r)

      q.id = quizId
      q.type = q.type as IQuizType
      q.entry = q.entry as string

      this.$set(this.quizData, quizId, q)
    }

    const { entry } = q
    const data = this.dictionaryData[q.type][entry]

    if (!data) {
      const mask = (s: string, ...ws: string[]) => {
        // eslint-disable-next-line array-callback-return
        ws.map((w) => {
          s = s.replace(
            new RegExp(
              `(^| |[^a-z])(${w
                .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                .replace(/\d/g, '\\d?')
                .replace(/\s+/g, '\\s*')})($| |[^a-z])`,
              'gi'
            ),
            '$1<span class="gray-box">$2</span>$3'
          )
        })

        return s
      }

      const setTemplate: {
        [type in IQuizType]: () => Promise<void>
      } = {
        hanzi: async () => {
          if (this.quizRendered[entry].hanzi) {
            return
          }

          const { pinyin, english } =
            this.dictionaryData.hanzi[entry] ||
            (await this.$axios
              .$get<{
                pinyin: string
                english: string
              }>('/api/hanzi/match', {
                params: {
                  entry,
                  select: 'pinyin,english',
                },
              })
              .then((r) => this.$set(this.dictionaryData.hanzi, entry, r)))

          this.quizRendered[entry].hanzi = {
            se: {
              front: ejs.render(
                `
              <h4>Hanzi Chinese-English</h4>
              <div class="font-chinese text-w-normal" style="font-size: 3rem;">
                <%= entry %>
              </div>
              `,
                {
                  entry,
                  pinyin,
                  english,
                }
              ),
              back: ejs.render(
                `
              <div class="inline-block mr-4">
                <%= pinyin %>
              </div>
              <x-speak-button class="speak-item--1">
                <%= entry %>
              </x-speak-button>

              <%= english %>
              `,
                {
                  entry,
                  pinyin,
                  english,
                }
              ),
            },
            ec: {
              front: ejs.render(
                `
              <h4>Hanzi English-Chinese</h4>

              <%= mask(english, entry) %>
              `,
                {
                  mask,
                  entry,
                  english,
                }
              ),
              back: ejs.render(
                `
              <div class="hanzi-display">
                <%= entry %>
              </div>
              <x-speak-button class="speak-item--1">
                <%= entry %>
              </x-speak-button>

              <%= pinyin %>
              `,
                {
                  entry,
                  pinyin,
                }
              ),
            },
          }

          this.$set(
            this.quizRendered,
            `${entry}.hanzi`,
            this.quizRendered[entry].hanzi
          )
        },
        vocab: async () => {
          if (this.quizRendered[entry].vocab) {
            return
          }

          const { traditional, pinyin, english } =
            this.dictionaryData.vocab[entry] ||
            (await this.$axios
              .$get<{
                result: {
                  traditional?: string
                  pinyin: string
                  english: string
                }[]
              }>('/api/vocab/match', {
                params: {
                  entry,
                  select: 'traditional,pinyin,english',
                },
              })
              .then(({ result }) =>
                this.$set(this.dictionaryData.vocab, entry, {
                  traditional: result
                    .map(({ traditional }) => traditional!)
                    .filter((r) => r),
                  pinyin: result.map(({ pinyin }) => pinyin),
                  english: result.map(({ english }) => english),
                })
              ))

          const sentences = await this.$axios
            .$get<{
              result: {
                id: string
                chinese: string
                english: string
              }[]
            }>('/api/sentence/q', {
              params: {
                entry,
                select: 'id,chinese,english',
              },
            })
            .then(({ result }) => {
              return result.map((r) => {
                const out = this.dictionaryData.sentence[r.chinese] || {}
                out[r.id] = {
                  pinyin: makePinyin(r.chinese, {
                    keepRest: true,
                  }),
                  english: r.english,
                }

                this.$set(
                  this.dictionaryData.sentence,
                  r.chinese,
                  this.dictionaryData.sentence[r.chinese]
                )

                return {
                  chinese: r.chinese,
                  english: r.english,
                }
              })
            })

          this.quizRendered[entry].vocab = {
            se: {
              front: ejs.render(
                `
              <h4>Vocab Simplified-English</h4>

              <div class="font-zh-simp text-w-normal" style="font-size: 2rem;">
                <%= entry %>
              </div>
              `,
                { entry }
              ),
              back: ejs.render(
                `
              <% if (traditional.length) { %>
                <div>
                  <div class="font-zh-trad text-w-normal inline-block mr-4" style="font-size: 1.7rem;">
                    <%= traditional.join(' | ') %>
                  </div>

                  <x-speak-button class="speak-item--1">
                    <%= entry %>
                  </x-speak-button>
                </div>
              <% } %>

              <div>
                <div class="inline-block mr-4">
                  <%= pinyin.join(' | ') %>
                </div>

                <% if (!traditional.length) { %>
                  <x-speak-button class="speak-item--1">
                    <%= entry %>
                  </x-speak-button>
                <% } %>
              </div>

              <ul>
                <% english.map(it => { %>
                  <li><%= it %></li>
                <% }) %>
              </ul>

              <% if (sentences.length) { %>
                <ul>
                  <% sentences.map(it => { %>
                    <li>
                      <%= it.chinese %>
                      <ul>
                        <li>
                          <%= it.english %>
                        </li>
                      </ul>
                    </li>
                  <% }) %>
                </ul>
              <% } %>
              `,
                {
                  entry,
                  traditional,
                  pinyin,
                  english,
                  sentences,
                }
              ),
            },
            te: {
              front: ejs.render(
                `
              <h4>Vocab Traditional-English</h4>

              <div class="font-zh-trad text-w-normal" style="font-size: 1.7rem">
                <%= traditional.join(' | ') %>
              </div>
              `,
                {
                  traditional,
                }
              ),
              back: ejs.render(
                `
              <div>
                <div class="font-zh-simp text-w-normal inline-block mr-4" style="font-size: 2rem;">
                  <%= entry %>
                </div>

                <x-speak-button class="speak-item--1">
                  <%= entry %>
                </x-speak-button>
              </div>

              <div>
                <%= pinyin.join(' | ') %>
              </div>

              <ul>
                <% english.map(it => { %>
                  <li><%= it %></li>
                <% }) %>
              </ul>

              <% if (sentences.length) { %>
                <ul>
                  <% sentences.map(it => { %>
                    <li>
                      <%= it.chinese %>
                      <ul>
                        <li>
                          <%= it.english %>
                        </li>
                      </ul>
                    </li>
                  <% }) %>
                </ul>
              <% } %>
              `,
                {
                  entry,
                  traditional,
                  pinyin,
                  english,
                  sentences,
                }
              ),
            },
            ec: {
              front: ejs.render(
                `
              <h4>Vocab English-Chinese</h4>

              <ul>
                <% english.map(it => { %>
                  <%= mask(it, entry, ...pinyin, ...traditional) %>
                <% }) %>
              </ul>
              `,
                {
                  entry,
                  english,
                  pinyin,
                  traditional,
                }
              ),
              back: ejs.render(
                `
              <div>
                <div class="font-zh-simp text-w-normal inline-block mr-4" style="font-size: 2rem;">
                  <%= entry %>
                </div>

                <x-speak-button class="speak-item--1">
                  <%= entry %>
                </x-speak-button>
              </div>

              <% if (traditional.length) { %>
                <div>
                  <div class="font-zh-trad text-w-normal inline-block mr-4" style="font-size: 1.7rem;">
                    <%= traditional.join(' | ') %>
                  </div>
                </div>
              <% } %>

              <div>
                <%= pinyin.join(' | ') %>
              </div>

              <% if (sentences.length) { %>
                <ul>
                  <% sentences.map(it => { %>
                    <li>
                      <%= it.chinese %>
                      <ul>
                        <li>
                          <%= it.english %>
                        </li>
                      </ul>
                    </li>
                  <% }) %>
                </ul>
              <% } %>
              `,
                {
                  entry,
                  traditional,
                  pinyin,
                  english,
                  sentences,
                }
              ),
            },
          }

          this.$set(
            this.quizRendered,
            `${entry}.vocab`,
            this.quizRendered[entry].vocab
          )
        },
        sentence: async () => {
          if (this.quizRendered[entry].sentence) {
            return
          }

          const sentences =
            this.dictionaryData.sentence[entry] ||
            (await this.$axios
              .$get<{
                result: {
                  id: string
                  chinese: string
                  english: string
                }[]
              }>('/api/sentence/match', {
                params: {
                  entry,
                  select: 'id,english',
                },
              })
              .then(({ result }) => {
                return result.map((r) => {
                  const out = this.dictionaryData.sentence[r.chinese] || {}
                  out[r.id] = {
                    pinyin: makePinyin(r.chinese, {
                      keepRest: true,
                    }),
                    english: r.english,
                  }

                  this.$set(
                    this.dictionaryData.sentence,
                    r.chinese,
                    this.dictionaryData.sentence[r.chinese]
                  )

                  return {
                    chinese: r.chinese,
                    english: r.english,
                  }
                })
              }))

          this.quizRendered[entry].sentence = {
            se: {
              front: ejs.render(
                `
              <h4>Sentence Chinese-English</h4>

              <h2 class="font-zh-simp text-w-normal">
                <%= entry %>
              </h2>
              `,
                { entry }
              ),
              back: ejs.render(
                `
              <div>
                <h2 class="font-zh-simp text-w-normal inline-block">
                  <%= entry %>
                </h2>
                <x-speak-button class="speak-item--1">
                  <%= entry %>
                </x-speak-button>
              </div>

              <ul>
                <% Object.values(sentences).map(({ pinyin }) => %>
                  <li>
                    <%= pinyin %>
                  </li>
                <% }) %>
              </ul>

              <ul>
                <% Object.values(sentences).map(({ english }) => %>
                  <li>
                    <%= english %>
                  </li>
                <% }) %>
              </ul>
              `,
                {
                  entry,
                  sentences,
                }
              ),
            },
            ec: {
              front: ejs.render(
                `
              <h4>Sentence English-Chinese</h4>

              <ul>
                <% Object.values(sentences).map(({ english }) => %>
                  <li>
                    <%= english %>
                  </li>
                <% }) %>
              </ul>
              `,
                {
                  sentences,
                }
              ),
              back: ejs.render(
                `
              <div>
                <h2 class="font-zh-simp text-w-normal inline-block">
                  <%= entry %>
                </h2>
                <x-speak-button class="speak-item--1">
                  <%= entry %>
                </x-speak-button>
              </div>

              <ul>
                <% Object.values(sentences).map(({ pinyin }) => %>
                  <li>
                    <%= pinyin %>
                  </li>
                <% }) %>
              </ul>
              `,
                {
                  entry,
                  sentences,
                }
              ),
            },
          }

          this.$set(
            this.quizRendered,
            `${entry}.sentence`,
            this.quizRendered[entry].sentence
          )
        },
        extra: async () => {
          if (this.quizRendered[entry].extra) {
            return
          }

          const { pinyin, english } =
            this.dictionaryData.extra[entry] ||
            (await this.$axios
              .$get<{
                pinyin: string
                english: string
              }>('/api/vocab/match', {
                params: {
                  entry,
                  select: 'pinyin,english',
                },
              })
              .then((r) => this.$set(this.dictionaryData.extra, entry, r)))

          const sentences = await this.$axios
            .$get<{
              result: {
                id: string
                chinese: string
                english: string
              }[]
            }>('/api/sentence/q', {
              params: {
                entry,
                select: 'id,chinese,english',
              },
            })
            .then(({ result }) => {
              return result.map((r) => {
                const out = this.dictionaryData.sentence[r.chinese] || {}
                out[r.id] = {
                  pinyin: makePinyin(r.chinese, {
                    keepRest: true,
                  }),
                  english: r.english,
                }

                this.$set(
                  this.dictionaryData.sentence,
                  r.chinese,
                  this.dictionaryData.sentence[r.chinese]
                )

                return {
                  chinese: r.chinese,
                  english: r.english,
                }
              })
            })

          this.quizRendered[entry].extra = {
            se: {
              front: ejs.render(
                `
              <h4>Extra Chinese-English</h4>

              <div class="font-zh-simp text-w-normal" style="font-size: 2rem;">
                <%= entry %>
              </div>
              `,
                { entry }
              ),
              back: ejs.render(
                `
              <div>
                <div class="inline-block mr-4">
                  <%= pinyin %>
                </div>

                <x-speak-button class="speak-item--1">
                  <%= entry %>
                </x-speak-button>
              </div>

              <p>
                <%= english %>
              </p>

              <% if (sentences.length) { %>
                <ul>
                  <% sentences.map(it => { %>
                    <li>
                      <%= it.chinese %>
                      <ul>
                        <li>
                          <%= it.english %>
                        </li>
                      </ul>
                    </li>
                  <% }) %>
                </ul>
              <% } %>
              `,
                {
                  entry,
                  pinyin,
                  english,
                  sentences,
                }
              ),
            },
            ec: {
              front: ejs.render(
                `
              <h4>Extra English-Chinese</h4>

              <p>
                <%= english %>
              </p>
              `,
                {
                  entry,
                  english,
                  pinyin,
                }
              ),
              back: ejs.render(
                `
              <div>
                <div class="font-zh-simp text-w-normal inline-block mr-4" style="font-size: 2rem;">
                  <%= entry %>
                </div>

                <x-speak-button class="speak-item--1">
                  <%= entry %>
                </x-speak-button>
              </div>

              <div>
                <%= pinyin %>
              </div>

              <% if (sentences.length) { %>
                <ul>
                  <% sentences.map(it => { %>
                    <li>
                      <%= it.chinese %>
                      <ul>
                        <li>
                          <%= it.english %>
                        </li>
                      </ul>
                    </li>
                  <% }) %>
                </ul>
              <% } %>
              `,
                {
                  entry,
                  pinyin,
                  english,
                  sentences,
                }
              ),
            },
          }

          this.$set(
            this.quizRendered,
            `${entry}.extra`,
            this.quizRendered[entry].extra
          )
        },
      }

      await setTemplate[q.type]
    }

    this.isQuizItemReady = true
  }

  async doMark(type: 'right' | 'wrong' | 'repeat') {
    if (this.quizCurrentId) {
      this.isQuizItemReady = false
      await this.$axios.$patch('/api/quiz/mark', undefined, {
        params: {
          id: this.quizCurrentId,
          type,
        },
      })
      this.isQuizItemReady = true
    }
    this.initNextQuizItem()
  }

  onQuizKeypress(evt: KeyboardEvent) {
    if (!this.isQuizModal) {
      return
    }

    if (this.isEditTagModal) {
      return
    }

    if (
      evt.target instanceof HTMLTextAreaElement ||
      evt.target instanceof HTMLInputElement
    ) {
      return
    }

    if (!this.quizCurrentId) {
      doMapKeypress(evt, {
        ' ': this.$refs.btnEndQuiz as HTMLButtonElement,
      })
    } else if (!this.isQuizShownAnswer) {
      doMapKeypress(evt, {
        ' ': this.$refs.btnShowAnswer as HTMLButtonElement,
      })
    } else {
      const speakItemN = (n: number) => {
        const quizContent = (this.isQuizShownAnswer
          ? this.$refs.quizBack
          : this.$refs.quizFront) as HTMLDivElement | null

        if (!quizContent) {
          return
        }

        doClick(quizContent.querySelector(`.speak-item-${n}`))
      }

      doMapKeypress(evt, {
        '1': this.$refs.btnMarkRight as HTMLButtonElement,
        '2': this.$refs.btnMarkWrong as HTMLButtonElement,
        '3': this.$refs.btnMarkRepeat as HTMLButtonElement,
        q: this.$refs.btnHideAnswer as HTMLButtonElement,
        ' ': 'q',
        e: this.$refs.btnEditModal as HTMLButtonElement,
        s: () => speakItemN(-1),
        d: () => speakItemN(0),
        f: () => speakItemN(1),
        g: () => speakItemN(2),
        h: () => speakItemN(3),
        j: () => speakItemN(4),
        k: () => speakItemN(5),
        l: () => speakItemN(6),
        ';': () => speakItemN(7),
        "'": () => speakItemN(8),
      })
    }
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
            tag: d._meta?.tag || [],
            srsLevel: d.srsLevel,
            nextReview: d.nextReview,
          }
        })
      this.$set(this, 'tablePagedData', this.tablePagedData)
    }

    doLoad()

    if (this.tablePagedData.length > 0) {
      const getQuizMeta = async (quizIds: string[]) => {
        quizIds = quizIds.filter(
          (id) => this.quizData[id] && !this.quizData[id]._meta
        )

        const { result } = (await this.$axios.$post('/api/quiz/ids', {
          ids: quizIds,
          select: ['id', 'tag'],
        })) as {
          result: {
            id: string
            tag?: string[]
          }[]
        }

        // eslint-disable-next-line array-callback-return
        result.map(({ id, ..._meta }) => {
          if (this.quizData[id]) {
            this.quizData[id]._meta = _meta
            this.$set(this.quizData[id], '_meta', _meta)
          }
        })
      }

      await Promise.all([
        Promise.all(
          this.tablePagedData.map(({ quizId }) =>
            this.cacheQuizItem({ quizId })
          )
        ),
        getQuizMeta(this.tablePagedData.map(({ quizId }) => quizId)),
      ])

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
