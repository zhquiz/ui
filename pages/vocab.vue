<template>
  <section>
    <div class="VocabPage contain">
      <form class="field" @submit.prevent="q = q0">
        <div class="control">
          <input
            v-model="q0"
            type="search"
            class="input"
            name="q"
            placeholder="Type here to search."
            aria-label="search"
          />
        </div>
      </form>

      <div class="columns">
        <div class="column is-6 entry-display">
          <div class="vocab-display">
            <div
              class="clickable text-center font-zh-simp"
              @contextmenu.prevent="
                (evt) => openContext(evt, simplified, 'vocab')
              "
            >
              {{ simplified }}
            </div>
          </div>

          <div class="buttons has-addons">
            <button
              class="button"
              :disabled="i < 1"
              @click="i--"
              @keypress="i--"
            >
              Previous
            </button>
            <button
              class="button"
              :disabled="i > entries.length - 2"
              @click="i++"
              @keypress="i++"
            >
              Next
            </button>

            <b-dropdown hoverable aria-role="list">
              <button slot="trigger" class="button">
                <fontawesome icon="caret-down" />
              </button>

              <b-dropdown-item aria-role="listitem">
                Search in MDBG
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </div>

        <div class="column is-6">
          <b-collapse
            class="card"
            animation="slide"
            style="margin-bottom: 1em"
            :open="typeof current === 'object'"
          >
            <div
              slot="trigger"
              slot-scope="props"
              class="card-header"
              role="button"
            >
              <h2 class="card-header-title">Reading</h2>
              <a role="button" class="card-header-icon">
                <fontawesome :icon="props.open ? 'caret-down' : 'caret-up'" />
              </a>
            </div>

            <div class="card-content">
              <span>{{ current.pinyin }}</span>
            </div>
          </b-collapse>

          <b-collapse
            class="card"
            animation="slide"
            :open="!!current.traditional"
          >
            <div
              slot="trigger"
              slot-scope="props"
              class="card-header"
              role="button"
            >
              <h2 class="card-header-title">Traditional</h2>
              <a role="button" class="card-header-icon">
                <fontawesome :icon="props.open ? 'caret-down' : 'caret-up'" />
              </a>
            </div>

            <div class="card-content">
              <div
                class="font-zh-trad clickable"
                @contextmenu.prevent="
                  (evt) => openContext(evt, current.traditional, 'vocab')
                "
              >
                {{ current.traditional }}
              </div>
            </div>
          </b-collapse>

          <b-collapse class="card" animation="slide" :open="!!current.english">
            <div
              slot="trigger"
              slot-scope="props"
              class="card-header"
              role="button"
            >
              <h2 class="card-header-title">English</h2>
              <a role="button" class="card-header-icon">
                <fontawesome :icon="props.open ? 'caret-down' : 'caret-up'" />
              </a>
            </div>

            <div class="card-content">
              <span>{{ current.english }}</span>
            </div>
          </b-collapse>

          <b-collapse
            class="card"
            animation="slide"
            :open="sentences.length > 0"
          >
            <div
              slot="trigger"
              slot-scope="props"
              class="card-header"
              role="button"
            >
              <h2 class="card-header-title">Sentences</h2>
              <a role="button" class="card-header-icon">
                <fontawesome :icon="props.open ? 'caret-down' : 'caret-up'" />
              </a>
            </div>

            <div class="card-content">
              <div v-for="(s, i) in sentences" :key="i" class="sentence-entry">
                <span
                  class="clickable"
                  @contextmenu.prevent="
                    (evt) => openContext(evt, s.chinese, 'sentence')
                  "
                >
                  {{ s.chinese }}
                </span>
                <span>{{ s.english }}</span>
              </div>
            </div>
          </b-collapse>
        </div>
      </div>
    </div>

    <ContextMenu ref="context" :entry="selected.entry" :type="selected.type" />
  </section>
</template>

<script lang="ts">
import XRegExp from 'xregexp'
import { Component, Ref, Vue } from 'nuxt-property-decorator'
import makePinyin from 'chinese-to-pinyin'
import ContextMenu from '~/components/ContextMenu.vue'

@Component<VocabPage>({
  layout: 'logged-in',
  watch: {
    q() {
      this.onQChange(this.q)
    },
    current() {
      this.loadContent()
    },
  },
})
export default class VocabPage extends Vue {
  @Ref() context!: ContextMenu

  entries: (
    | string
    | {
        simplified: string
        traditional?: string
        pinyin: string
        english?: string
      }
  )[] = []

  i: number = 0

  sentences: any[] = []

  selected: {
    entry?: string
    type?: string
  } = {}

  q0 = ''

  get q() {
    const q = this.$route.query.q
    return (Array.isArray(q) ? q[0] : q) || ''
  }

  set q(q: string) {
    this.$router.push({ query: { q } })
  }

  get current() {
    return this.entries[this.i] || ('' as any)
  }

  get simplified() {
    return typeof this.current === 'string'
      ? this.current
      : this.current.simplified
  }

  async created() {
    this.q0 = this.q
    if (!this.q0) {
      const { result } = await this.$axios.$get<{
        result: string
      }>('/api/vocab/random', {
        params: {
          levelMin: this.$accessor.levelMin,
          level: this.$accessor.level,
        },
      })

      this.q0 = result
    }

    await this.onQChange(this.q0)
  }

  openContext(
    evt: MouseEvent,
    entry = this.selected.entry,
    type = this.selected.type
  ) {
    this.selected = { entry, type }
    this.context.open(evt)
  }

  async onQChange(q: string) {
    if (q) {
      let qs = (await this.$axios.$get('/api/chinese/jieba', { params: { q } }))
        .result as string[]
      qs = qs
        .filter((h) => XRegExp('\\p{Han}+').test(h))
        .filter((h, i, arr) => arr.indexOf(h) === i)

      this.entries = qs
      this.$set(this, 'entries', qs)
      this.loadContent()
    }

    this.i = 0
  }

  async loadContent() {
    const entry = this.current

    if (typeof entry === 'string') {
      ;(async () => {
        const { result } = await this.$axios.$get('/api/vocab', {
          params: {
            entry,
          },
          transformResponse: [(r) => JSON.parse(r)],
        })

        if (result.length > 0) {
          this.entries = [
            ...this.entries.slice(0, this.i),
            ...result,
            ...this.entries.slice(this.i + 1),
          ]
        } else {
          this.entries = [
            ...this.entries.slice(0, this.i),
            {
              simplified: entry,
              pinyin: makePinyin(entry, { keepRest: true, toneToNumber: true }),
            },
            ...this.entries.slice(this.i + 1),
          ]
        }
      })()
    }

    ;(async () => {
      const r = await this.$axios.$get('/api/sentence/q', {
        params: {
          q: entry.simplified || entry,
          type: 'vocab',
        },
        transformResponse: [(r) => JSON.parse(r)],
      })

      this.$set(this, 'sentences', r.result)
    })()
  }
}
</script>

<style scoped>
.entry-display {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.entry-display .clickable {
  min-height: 1.5em;
  display: block;
}

.card {
  margin-bottom: 1rem;
}

.card [class^='font-'] {
  font-size: 60px;
  height: 80px;
}

.card-content {
  max-height: 250px;
  overflow: scroll;
}

.sentence-entry {
  margin-right: 1rem;
}
</style>
