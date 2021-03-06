<template>
  <b-modal class="quiz-modal" :active.sync="isQuizModal" @close="endQuiz">
    <div class="card">
      <div v-if="current.id" class="card-content">
        <div v-show="!isQuizShownAnswer" class="content">
          <div v-if="current.type === 'hanzi'">
            <div v-if="current.direction === 'ec'">
              <h4>Hanzi English-Chinese</h4>

              <div v-html="doMask(current.english, current.entry)"></div>
            </div>
            <div v-else>
              <h4>Hanzi Chinese-English</h4>
              <div class="font-chinese text-w-normal" style="font-size: 3rem">
                {{ current.entry }}
              </div>
            </div>
          </div>

          <div v-else-if="current.type === 'vocab'">
            <div v-if="current.direction === 'te'">
              <h4>Vocab Traditional-English</h4>

              <div class="font-zh-trad text-w-normal" style="font-size: 1.7rem">
                <span
                  v-for="(it, i) in current.traditional"
                  :key="i"
                  class="traditional"
                >
                  {{ it }}
                </span>
              </div>
            </div>
            <div v-else-if="current.direction === 'ec'">
              <h4>Vocab English-Chinese</h4>

              <ul>
                <li
                  v-for="(it, i) in current.english"
                  :key="i"
                  v-html="
                    doMask(
                      it,
                      current.entry,
                      ...current.pinyin,
                      ...current.traditional
                    )
                  "
                ></li>
              </ul>
            </div>
            <div v-else>
              <h4>Vocab Simplified-English</h4>

              <div class="font-zh-simp text-w-normal" style="font-size: 2rem">
                {{ current.entry }}
              </div>
            </div>
          </div>

          <div v-else-if="current.type === 'sentence'">
            <div v-if="current.direction === 'ec'">
              <h4>Sentence English-Chinese</h4>

              {{ current.english }}
            </div>
            <div v-else>
              <h4>Sentence Chinese-English</h4>

              <h2 class="font-zh-simp text-w-normal">
                {{ current.entry }}
              </h2>
            </div>
          </div>

          <div v-else>
            <div v-if="current.direction === 'ec'">
              <h4>Extra English-Chinese</h4>

              <div v-html="doMask(current.english, current.entry)"></div>
            </div>
            <div v-else>
              <h4>Extra Chinese-English</h4>

              <div class="font-zh-simp text-w-normal" style="font-size: 2rem">
                {{ current.entry }}
              </div>
            </div>
          </div>
        </div>

        <div v-show="isQuizShownAnswer" class="content">
          <div v-if="current.type === 'hanzi'">
            <div
              class="hanzi-display has-context"
              @contextmenu.prevent="openContext"
            >
              {{ current.entry }}
            </div>

            <div>
              {{ current.pinyin }}
            </div>

            <div>
              {{ current.english }}
            </div>
          </div>

          <div v-else-if="current.type === 'vocab'">
            <div
              class="font-zh-simp text-w-normal has-context"
              style="font-size: 2rem"
              @contextmenu.prevent="openContext"
            >
              {{ current.entry }}
            </div>

            <div
              v-if="current.traditional.length"
              class="font-zh-trad text-w-normal"
              style="font-size: 1.7rem"
            >
              <span
                v-for="(it, i) in current.traditional"
                :key="i"
                class="traditional has-context"
                @contextmenu.prevent="(ev) => openContext(ev, it)"
              >
                {{ it }}
              </span>
            </div>

            <div>
              {{ current.pinyin.join(' | ') }}
            </div>

            <ul>
              <li v-for="(it, i) in current.english" :key="i">
                {{ it }}
              </li>
            </ul>

            <ul v-if="current.sentences.length">
              <li v-for="(it, i) in current.sentences" :key="i">
                <span
                  class="has-context"
                  :title="it.pinyin"
                  @contextmenu.prevent="
                    (ev) => openContext(ev, it.chinese, 'sentence')
                  "
                >
                  {{ it.chinese }}
                </span>
                <ul>
                  <li>
                    {{ it.english }}
                  </li>
                </ul>
              </li>
            </ul>
          </div>

          <div v-else-if="current.type === 'sentence'">
            <h2
              class="font-zh-simp text-w-normal has-context"
              @contextmenu.prevent="openContext"
            >
              {{ current.entry }}
            </h2>

            <ul>
              <li>
                {{ current.pinyin }}
              </li>
            </ul>

            <ul>
              <li>
                {{ current.english }}
              </li>
            </ul>
          </div>

          <div v-else>
            <div
              class="font-zh-simp text-w-normal has-context"
              style="font-size: 2rem"
              @contextmenu.prevent="openContext"
            >
              {{ current.entry }}
            </div>

            <div>
              {{ current.pinyin }}
            </div>

            <p>
              {{ current.english }}
            </p>

            <ul v-if="current.sentences.length">
              <li v-for="(it, i) in current.sentences" :key="i">
                <span
                  class="has-context"
                  :title="it.pinyin"
                  @contextmenu.prevent="
                    (ev) => openContext(ev, it.chinese, 'sentence')
                  "
                >
                  {{ it.chinese }}
                </span>
                <ul>
                  <li>
                    {{ it.english }}
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>

        <b-loading :active="!isQuizItemReady" :is-full-page="false" />
      </div>

      <div class="buttons-area">
        <div v-if="quizIndex >= quizArray.length" class="buttons">
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
            <!-- <button
              ref="btnEditModal"
              class="button is-info"
              @click="openEditModal(quizCurrentId)"
              @keypress="openEditModal(quizCurrentId)"
            >
              Edit
            </button> -->
          </div>
        </div>
      </div>
    </div>

    <ContextMenu ref="context" :entry="ctxEntry" :type="ctxType" />
  </b-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Ref } from 'nuxt-property-decorator'
import makePinyin from 'chinese-to-pinyin'
import ContextMenu from './ContextMenu.vue'

export type IQuizType = 'hanzi' | 'vocab' | 'sentence' | 'extra'

export interface IQuizData {
  id: string
  type?: IQuizType
  direction?: string
  srsLevel?: number
  nextReview?: string
  wrongStreak?: number
  stat?: any
  entry?: string
  source?: string
  tag?: string[]
}

@Component
export default class QuizCard extends Vue {
  @Prop({ required: true }) quizArray!: string[]

  @Ref() context!: ContextMenu

  ctxEntry = ''
  ctxType = ''

  isQuizShownAnswer = false
  isQuizItemReady = false
  isQuizModal = false
  quizIndex = -1

  quizData: {
    [quizId: string]: IQuizData
  } = {}

  dictionaryData = {
    hanzi: {} as Record<string, any>,
    vocab: {} as Record<string, any>,
    sentence: {} as Record<string, any>,
    extra: {} as Record<string, any>,
  }

  current: any = {}

  async startQuiz() {
    this.quizIndex = -1
    await this.initNextQuizItem()

    this.isQuizModal = true
  }

  endQuiz() {
    this.isQuizModal = false
    this.$emit('quiz:ended')
  }

  async doMark(type: 'right' | 'wrong' | 'repeat') {
    const id = this.quizArray[this.quizIndex] as string | undefined

    if (id) {
      this.isQuizItemReady = false
      await this.$axios.$patch('/api/quiz/mark', undefined, {
        params: {
          id,
          type,
        },
      })
      this.isQuizItemReady = true
    }
    this.initNextQuizItem()
  }

  async initNextQuizItem() {
    this.isQuizShownAnswer = false

    Array(2)
      .fill(null)
      // eslint-disable-next-line array-callback-return
      .map((_, i) => {
        const front = this.checkFront(i + 1)

        if (!front) {
          this.cacheQuizItem({
            relativePosition: i + 1,
          })
        }
      })

    if (this.quizArray[this.quizIndex + 1]) {
      await this.cacheQuizItem({ relativePosition: 0 })
    }

    this.current = (() => {
      const it = this.quizData[this.quizArray[this.quizIndex + 1]]

      if (!it) {
        return {}
      }

      const entry = it.entry
      const type = (it.source as 'extra') || it.type
      if (!entry || !type) {
        return {}
      }

      return {
        ...it,
        ...this.dictionaryData[type][entry],
        entry,
        type,
      }
    })()

    this.quizIndex++
  }

  checkFront(relativePosition: number): boolean {
    relativePosition++
    const it = this.quizData[this.quizArray[this.quizIndex + relativePosition]]

    if (!it) {
      return false
    }

    const { entry, type, direction } = it

    if (!entry || !type || !direction) {
      return false
    }

    return !!this.dictionaryData[type][entry]
  }

  async openContext(ev: MouseEvent, entry?: string, type?: string) {
    this.ctxEntry = entry || this.current.entry || ''
    this.ctxType = type || this.current.type || ''

    await this.context.open(ev)
  }

  doMask(s: string, ...ws: string[]) {
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

  async cacheQuizItem(params: { quizId?: string; relativePosition?: number }) {
    let { relativePosition = 0 } = params
    relativePosition++

    let { quizId } = params
    quizId = quizId || this.quizArray[this.quizIndex + relativePosition]

    if (!quizId) {
      return
    }

    let q = this.quizData[quizId]
    if (!q || !q.entry || !q.type || !q.direction) {
      const {
        result: [r],
      } = await this.$axios.$get<{
        result: IQuizData[]
      }>('/api/quiz/many', {
        params: {
          ids: [quizId],
          select: [
            'entry',
            'type',
            'source',
            'direction',
            'front',
            'back',
            'mnemonic',
          ],
        },
      })

      if (r) {
        if (q) {
          Object.assign(q, r)
        } else {
          q = r
        }

        q.id = quizId
        q.type = q.type as IQuizType
        q.entry = q.entry as string
        q.source = q.source as string

        this.$set(this.quizData, quizId, q)
      }
    }

    const type = (q.source as 'extra') || q.type
    const entry = q.entry

    if (!entry || !type) {
      return
    }

    if (!this.dictionaryData[type][entry]) {
      const setTemplate: {
        [type in IQuizType]: () => Promise<void>
      } = {
        hanzi: async () => {
          const { pinyin, english } = await this.$axios.$get<{
            pinyin: string
            english: string
          }>('/api/hanzi', {
            params: {
              entry,
              select: 'pinyin,english',
            },
          })

          this.dictionaryData[type][entry] = {
            pinyin,
            english,
          }
        },
        vocab: async () => {
          const { traditional, pinyin, english } =
            this.dictionaryData.vocab[entry] ||
            (await this.$axios
              .$get<{
                result: {
                  traditional?: string
                  pinyin: string
                  english: string
                }[]
              }>('/api/vocab', {
                params: {
                  entry,
                  select: 'traditional,pinyin,english',
                },
              })
              .then(({ result }) => {
                return {
                  traditional: result
                    .map(({ traditional }) => traditional!)
                    .filter((r) => r)
                    .filter((a, i, arr) => arr.indexOf(a) === i),
                  pinyin: result
                    .map(({ pinyin }) => pinyin)
                    .filter((a, i, arr) => arr.indexOf(a) === i),
                  english: result.map(({ english }) => english),
                }
              }))

          const sentences = await this.$axios
            .$get<{
              result: {
                id: string
                chinese: string
                english: string
              }[]
            }>('/api/sentence/q', {
              params: {
                q: entry,
                select: 'chinese,english',
                generate: 10,
              },
            })
            .then(({ result }) => {
              return result.map((r) => {
                return {
                  chinese: r.chinese,
                  pinyin: makePinyin(r.chinese, {
                    keepRest: true,
                  }),
                  english: r.english.split('\x1f')[0],
                }
              })
            })

          this.dictionaryData[type][entry] = {
            traditional,
            pinyin,
            english,
            sentences,
          }
        },
        sentence: async () => {
          const ss = await this.$axios
            .$get<{
              id: string
              chinese: string
              english: string
            }>('/api/sentence', {
              params: {
                entry,
                select: 'chinese,english',
              },
            })
            .then((r) => {
              return {
                pinyin: makePinyin(r.chinese, {
                  keepRest: true,
                }),
                english: r.english.split('\x1f')[0],
              }
            })

          this.dictionaryData.sentence[entry] = ss
        },
        extra: async () => {
          const { pinyin, english } = await this.$axios.$get<{
            pinyin: string
            english: string
          }>('/api/extra', {
            params: {
              entry,
              select: 'pinyin,english',
            },
          })

          const sentences = await this.$axios
            .$get<{
              result: {
                id: string
                chinese: string
                english: string
              }[]
            }>('/api/sentence/q', {
              params: {
                q: entry,
                select: 'chinese,english',
                generate: 10,
              },
            })
            .then(({ result }) => {
              return result.map((r) => {
                return {
                  chinese: r.chinese,
                  pinyin: makePinyin(r.chinese, {
                    keepRest: true,
                  }),
                  english: r.english.split('\x1f')[0],
                }
              })
            })

          this.dictionaryData.extra[entry] = {
            pinyin,
            english,
            sentences,
          }
        },
      }

      await setTemplate[type]()
    }

    this.isQuizItemReady = true
  }
}
</script>

<style lang="scss" scoped>
.has-context {
  cursor: pointer;

  &:hover {
    color: blue;
  }
}

.traditional {
  & + &::before {
    content: ' | ';
    display: inline-block;
  }
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

  scrollbar-width: none; /* For Firefox */
  -ms-overflow-style: none; /* For Internet Explorer and Edge */

  &::-webkit-scrollbar {
    width: 0px; /* For Chrome, Safari, and Opera */
  }
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
