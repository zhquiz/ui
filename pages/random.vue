<template>
  <section class="desktop:overflow-visible">
    <div class="RandomPage">
      <div class="columns w-full">
        <div class="column is-6">
          <div class="item-display item-display-top">
            <b-tooltip :label="hanzi.english">
              <div
                class="font-han hanzi clickable"
                @contextmenu.prevent="(evt) => openContext(evt, 'hanzi')"
              >
                {{ hanzi.entry }}
              </div>
            </b-tooltip>
            <b-loading :active="!hanzi.entry" :is-full-page="false"></b-loading>
          </div>
          <center>Hanzi of the day</center>
        </div>

        <div class="column is-6">
          <div class="item-display item-display-top">
            <b-tooltip :label="vocab.english">
              <div
                class="font-zh-simp hanzi clickable"
                @contextmenu.prevent="(evt) => openContext(evt, 'vocab')"
              >
                {{ vocab.entry }}
              </div>
            </b-tooltip>
            <b-loading :active="!vocab.entry" :is-full-page="false"></b-loading>
          </div>
          <center>Vocab of the day</center>
        </div>
      </div>

      <div class="item-display item-display-bottom">
        <b-tooltip :label="sentence.english">
          <div
            class="font-zh-simp hanzi clickable text-center"
            @contextmenu.prevent="(evt) => openContext(evt, 'sentence')"
          >
            {{ sentence.entry }}
          </div>
        </b-tooltip>
        <b-loading :active="!sentence.entry" :is-full-page="false" />
      </div>
      <center>Sentence of the day</center>
    </div>

    <ContextMenu
      ref="context"
      :entry="selected.entry"
      :type="selected.type"
      :reload="selected.reload"
    />
  </section>
</template>

<script lang="ts">
import { Component, Ref, Vue } from 'nuxt-property-decorator'

import ContextMenu from '~/components/ContextMenu.vue'

@Component<RandomPage>({
  layout: 'logged-in',
  mounted() {
    Promise.all([
      this.hanzi.reload(),
      this.vocab.reload(),
      this.sentence.reload(),
    ])
  },
})
export default class RandomPage extends Vue {
  @Ref() context!: ContextMenu

  hanzi = {
    type: 'hanzi',
    entry: '',
    english: '',
    reload: async () => {
      const { result, english = '' } = await this.$axios.$get(
        '/api/hanzi/random',
        {
          params: {
            levelMin: this.$accessor.settings.levelMin,
            level: this.$accessor.settings.level,
          },
        }
      )

      this.hanzi.entry = result
      this.hanzi.english = english
    },
  }

  vocab = {
    type: 'vocab',
    entry: '',
    english: '',
    reload: async () => {
      const { result, english = '' } = await this.$axios.$get(
        '/api/vocab/random',
        {
          params: {
            levelMin: this.$accessor.settings.levelMin,
            level: this.$accessor.settings.level,
          },
        }
      )

      this.vocab.entry = result
      this.vocab.english = english
    },
  }

  sentence = {
    type: 'sentence',
    entry: '',
    english: '',
    reload: async () => {
      const { result, english = '' } = await this.$axios.$get(
        '/api/sentence/random',
        {
          params: {
            levelMin: this.$accessor.settings.levelMin,
            level: this.$accessor.settings.level,
          },
        }
      )
      this.sentence.entry = result
      this.sentence.english = english
    },
  }

  selected: {
    type?: string
    entry?: string
    reload?: () => void
  } = {}

  openContext(evt: MouseEvent, type: 'hanzi' | 'vocab' | 'sentence') {
    this.selected = this[type]
    this.context.open(evt)
  }
}
</script>

<style scoped>
.RandomPage {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.item-display {
  min-height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 1em;
  position: relative;
}

.item-display-top .hanzi {
  font-size: 50px;
  min-height: 60px;
}

.item-display-bottom .hanzi {
  font-size: 30px;
  min-width: 3em;
  min-height: 40px;
}

@media screen and (min-width: 1025px) {
  .desktop\:overflow-visible {
    overflow: visible;
  }
}
</style>
