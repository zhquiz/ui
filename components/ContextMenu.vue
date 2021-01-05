<template>
  <vue-context ref="contextmenu" lazy>
    <li v-if="reload">
      <a role="button" @click.prevent="reload" @keypress.prevent="reload">
        Reload
      </a>
    </li>
    <li v-if="entries.length === 1">
      <a role="button" @click.prevent="doSpeak()" @keypress.prevent="doSpeak()">
        Speak
      </a>
    </li>
    <li v-if="entries.length && type && !quiz.ids.length">
      <a
        role="button"
        @click.prevent="addToQuiz()"
        @keypress.prevent="addToQuiz()"
      >
        Add to quiz
      </a>
    </li>
    <li v-if="quiz.ids.length">
      <a
        role="button"
        @click.prevent="removeFromQuiz()"
        @keypress.prevent="removeFromQuiz()"
      >
        Remove from quiz
      </a>
    </li>
    <li v-if="entries.length === 1 && type != 'hanzi'">
      <nuxt-link
        :to="{ path: '/vocab', query: { q: entries[0] } }"
        target="_blank"
      >
        Search for vocab
      </nuxt-link>
    </li>
    <li v-if="entries.length === 1">
      <nuxt-link
        :to="{ path: '/hanzi', query: { q: entries[0] } }"
        target="_blank"
      >
        Search for Hanzi
      </nuxt-link>
    </li>
    <li v-if="entries.length === 1">
      <a
        :href="`https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=${
          type === 'hanzi' ? `*${entries[0]}*` : entries[0]
        }`"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open in MDBG
      </a>
    </li>
    <li v-if="id">
      <a
        role="button"
        @click.prevent="doDelete()"
        @keypress.prevent="doDelete()"
      >
        Delete
      </a>
    </li>
  </vue-context>
</template>

<script lang="ts">
import { Vue, Component, Prop, Ref } from 'nuxt-property-decorator'
import { speak } from '~/assets/speak'

@Component
export default class ContextMenu extends Vue {
  @Prop() id?: string
  @Prop() entry?: string | string[]
  @Prop() type?: string
  @Prop() reload?: () => void

  @Ref() contextmenu!: {
    open: (evt: MouseEvent) => void
  }

  quiz: {
    of?: {
      entries: string[]
      type: string
    }
    ids: string[]
  } = {
    ids: [],
  }

  get entries() {
    return Array.isArray(this.entry)
      ? this.entry
      : this.entry
      ? [this.entry]
      : []
  }

  async setQuiz() {
    if (this.entry && this.type) {
      const { result } = await this.$axios.$get<{
        result: {
          id: string
        }[]
      }>('/api/quiz/many', {
        params: {
          entries: this.entries,
          select: ['id'],
          type: this.type,
        },
      })

      this.quiz = {
        of: {
          entries: this.entries,
          type: this.type,
        },
        ids: result.map((q) => q.id),
      }
    }
  }

  open(evt: MouseEvent) {
    this.$nextTick(async () => {
      if (this.entry && this.type) {
        if (
          !(
            this.quiz.of &&
            this.quiz.of.type !== this.type &&
            this.quiz.of.entries.length === this.entries.length &&
            this.quiz.of.entries.every((el, i) => this.entries[i] === el)
          )
        ) {
          await this.setQuiz()
        }

        this.contextmenu.open(evt)
      }
    })
  }

  async doDelete() {
    if (this.id) {
      await this.$axios.$delete('/api/extra', {
        params: {
          id: this.id,
        },
      })
    }

    await this.$emit('deleted', this.id)
  }

  async doSpeak() {
    if (this.entries.length === 1) {
      await speak(this.entries[0])
    }
  }

  async addToQuiz() {
    if (this.entries.length && this.type) {
      const { ids } = await this.$axios.$put<{
        ids: string[]
      }>('/api/quiz', {
        entries: this.entries,
        type: this.type,
      })

      this.$buefy.snackbar.open(
        `Added ${this.type}: ${this.entries.slice(0, 3).join(',')}${
          this.entries.length > 3 ? '...' : ''
        } to quiz`
      )

      this.quiz = {
        ...this.quiz,
        ids,
      }

      this.$emit('quiz:added', {
        entries: this.entries,
        type: this.type,
        ids,
      })
    }
  }

  async removeFromQuiz() {
    if (this.entries.length && this.type && this.quiz.ids.length) {
      await this.$axios.$post('/api/quiz/delete', {
        ids: this.quiz.ids,
      })

      this.$buefy.snackbar.open(
        `Removed ${this.type}: ${this.entries.slice(0, 3).join(',')}${
          this.entries.length > 3 ? '...' : ''
        }  from quiz`
      )

      const { ids } = this.quiz
      this.quiz = {
        ...this.quiz,
        ids: [],
      }

      this.$emit('quiz:removed', {
        entries: this.entries,
        type: this.type,
        ids,
      })
    }
  }
}
</script>
