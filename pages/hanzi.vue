<template>
  <section>
    <div class="HanziPage container">
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

      <div class="columns">
        <div class="column is-6 entry-display">
          <div
            class="hanzi-display clickable font-han"
            @contextmenu.prevent="
              (evt) => {
                selected = { entry: current, type: 'hanzi' }
                $refs.context.open(evt)
              }
            "
          >
            {{ current }}
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
          </div>
        </div>

        <div class="column is-6">
          <b-collapse class="card" animation="slide" :open="!!sub.length">
            <div
              slot="trigger"
              slot-scope="props"
              class="card-header"
              role="button"
            >
              <h2 class="card-header-title">Subcompositions</h2>
              <a role="button" class="card-header-icon">
                <fontawesome :icon="props.open ? 'caret-down' : 'caret-up'" />
              </a>
            </div>

            <div class="card-content">
              <span
                v-for="h in sub"
                :key="h"
                class="font-han clickable"
                @contextmenu.prevent="
                  (evt) => {
                    selected = { entry: h, type: 'hanzi' }
                    $refs.context.open(evt)
                  }
                "
              >
                {{ h }}
              </span>
            </div>
          </b-collapse>

          <b-collapse class="card" animation="slide" :open="!!sup.length">
            <div
              slot="trigger"
              slot-scope="props"
              class="card-header"
              role="button"
            >
              <h2 class="card-header-title">Supercompositions</h2>
              <a role="button" class="card-header-icon">
                <fontawesome :icon="props.open ? 'caret-down' : 'caret-up'" />
              </a>
            </div>

            <div class="card-content">
              <span
                v-for="h in sup"
                :key="h"
                class="font-han clickable"
                @contextmenu.prevent="
                  (evt) => {
                    selected = { entry: h, type: 'hanzi' }
                    $refs.context.open(evt)
                  }
                "
              >
                {{ h }}
              </span>
            </div>
          </b-collapse>

          <b-collapse class="card" animation="slide" :open="!!variants.length">
            <div
              slot="trigger"
              slot-scope="props"
              class="card-header"
              role="button"
            >
              <h2 class="card-header-title">Variants</h2>
              <a role="button" class="card-header-icon">
                <fontawesome :icon="props.open ? 'caret-down' : 'caret-up'" />
              </a>
            </div>

            <div class="card-content">
              <span
                v-for="h in variants"
                :key="h"
                class="font-han clickable"
                @contextmenu.prevent="
                  (evt) => {
                    selected = { entry: h, type: 'hanzi' }
                    $refs.context.open(evt)
                  }
                "
              >
                {{ h }}
              </span>
            </div>
          </b-collapse>

          <b-collapse class="card" animation="slide" :open="!!vocabs.length">
            <div
              slot="trigger"
              slot-scope="props"
              class="card-header"
              role="button"
            >
              <h2 class="card-header-title">Vocabularies</h2>
              <a role="button" class="card-header-icon">
                <fontawesome :icon="props.open ? 'caret-down' : 'caret-up'" />
              </a>
            </div>

            <div class="card-content">
              <div v-for="(v, i) in vocabs" :key="i" class="long-item">
                <span
                  class="clickable"
                  @contextmenu.prevent="
                    (evt) => {
                      selected = { entry: v.simplified, type: 'vocab' }
                      $refs.context.open(evt)
                    }
                  "
                >
                  {{ v.simplified }}
                </span>

                <span
                  v-if="v.traditional"
                  class="clickable"
                  @contextmenu.prevent="
                    (evt) => {
                      selected = { entry: v.traditional, type: 'vocab' }
                      $refs.context.open(evt)
                    }
                  "
                >
                  {{ v.traditional }}
                </span>

                <span class="pinyin">[{{ v.pinyin }}]</span>

                <span>{{ v.english }}</span>
              </div>
            </div>
          </b-collapse>

          <b-collapse class="card" animation="slide" :open="!!sentences.length">
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
              <div v-for="(s, i) in sentences" :key="i" class="long-item">
                <span
                  class="clickable"
                  @contextmenu.prevent="
                    (evt) => {
                      selected = { entry: s.chinese, type: 'sentence' }
                      $refs.context.open(evt)
                    }
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

    <ContextMenu
      ref="context"
      :entry="selected.entry"
      :type="selected.type"
      :additional="additionalContext"
    />
  </section>
</template>

<script lang="ts">
import XRegExp from 'xregexp'
import { Component, Ref, Vue } from 'nuxt-property-decorator'
import ContextMenu from '~/components/ContextMenu.vue'

@Component<HanziPage>({
  layout: 'logged-in',
  watch: {
    q() {
      this.onQChange(this.q)
    },
    current() {
      this.load()
    },
  },
})
export default class HanziPage extends Vue {
  @Ref() context!: ContextMenu

  entries: string[] = []
  i: number = 0

  sub: string[] = []
  sup: string[] = []
  variants: string[] = []
  vocabs: any[] = []
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
    return this.entries[this.i]
  }

  async created() {
    this.q0 = this.q

    if (this.additionalContext[0]) {
      await this.additionalContext[0].handler()
    }

    await this.onQChange(this.q0)
  }

  get additionalContext() {
    if (!this.q) {
      return [
        {
          name: 'Reload',
          handler: async () => {
            const { result } = await this.$axios.$get<{
              result: string
            }>('/api/hanzi/random', {
              params: {
                levelMin: this.$accessor.levelMin,
                level: this.$accessor.level,
              },
            })

            this.q0 = result
          },
        },
      ]
    }

    return []
  }

  onQChange(q: string) {
    const qs = q.split('').filter((h) => XRegExp('\\p{Han}').test(h))
    this.$set(
      this,
      'entries',
      qs.filter((h, i) => qs.indexOf(h) === i)
    )
    this.i = 0
    this.load()
  }

  load() {
    if (this.current) {
      this.loadHanzi()
      this.loadVocab()
      this.loadSentences()
    } else {
      this.sub = []
      this.sup = []
      this.variants = []
      this.vocabs = []
      this.sentences = []
    }
  }

  async loadHanzi() {
    const r = await this.$axios.$get('/api/hanzi', {
      params: {
        entry: this.current,
      },
    })

    this.sub = [...r.sub]
    this.sup = [...r.sup]
    this.variants = [...r.variants]
  }

  async loadVocab() {
    const { result } = await this.$axios.$get('/api/vocab/q', {
      params: {
        q: this.current,
      },
    })

    this.$set(this, 'vocabs', result)
  }

  async loadSentences() {
    const { result } = await this.$axios.$get<{
      result: {
        chinese: string
        english: string
      }[]
    }>('/api/sentence/q', {
      params: {
        q: this.current,
        type: 'hanzi',
        generate: 10,
        select: 'chinese,english',
      },
    })

    this.$set(
      this,
      'sentences',
      result.map((r) => ({
        chinese: r.chinese,
        english: r.english.split('\x1f')[0],
      }))
    )
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

.card-content {
  max-height: 250px;
  overflow: scroll;
}

.card-content .font-han {
  font-size: 50px;
  display: inline-block;
}

.long-item > span + span {
  margin-left: 1rem;
}

.long-item > .pinyin {
  min-width: 8rem;
}
</style>
