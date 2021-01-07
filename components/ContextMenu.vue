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
    <li v-if="type && quiz.db.length < entries.length">
      <a
        role="button"
        @click.prevent="addToQuiz()"
        @keypress.prevent="addToQuiz()"
      >
        Add to quiz
      </a>
    </li>
    <li v-if="quiz.db.length">
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
    db: {
      ids: string[]
    }[]
  } = {
    db: [],
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
      const { result } = await this.$axios.$post<{
        result: {
          id: string
          entry: string
        }[]
      }>('/api/quiz/many', {
        entries: this.entries,
        select: ['id', 'entry'],
        type: this.type,
      })

      const entryMap = new Map<string, string[]>()
      result.map(({ id, entry }) => {
        const c = entryMap.get(entry) || []
        c.push(id)
        return entryMap.set(entry, c)
      })

      this.quiz = {
        of: {
          entries: this.entries,
          type: this.type,
        },
        db: Array.from(entryMap.values()).map((ids) => ({ ids })),
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
      const { result } = await this.$axios.$put<{
        result: {
          ids: string[]
          entry: string
        }[]
      }>('/api/quiz', {
        entries: this.entries,
        type: this.type,
      })

      this.$buefy.snackbar.open(
        `Added ${this.type}: ${this.entries.slice(0, 3).join(', ')}${
          this.entries.length > 3 ? '...' : ''
        } to quiz`
      )

      this.quiz = {
        ...this.quiz,
        db: result,
      }

      this.$emit('quiz:added', {
        entries: this.entries,
        type: this.type,
        db: result,
      })
    }
  }

  async removeFromQuiz() {
    const ids = this.quiz.db.reduce(
      (prev, c) => [...prev, ...c.ids],
      [] as string[]
    )

    if (this.entries.length && this.type && ids.length) {
      await this.$axios.$post('/api/quiz/delete', {
        ids,
      })

      this.$buefy.snackbar.open(
        `Removed ${this.type}: ${this.entries.slice(0, 3).join(', ')}${
          this.entries.length > 3 ? '...' : ''
        }  from quiz`
      )

      const { db } = this.quiz
      this.quiz = {
        ...this.quiz,
        db: [],
      }

      this.$emit('quiz:removed', {
        entries: this.entries,
        type: this.type,
        db,
      })
    }
  }
}
</script>
