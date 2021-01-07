<template>
  <section>
    <div class="LibraryPage">
      <h2 class="title is-2">HSK</h2>
      <b-collapse
        v-for="(collapse, index) of collapses"
        :key="index"
        class="card"
        animation="slide"
        :open="openIndex == index"
        @open="openIndex = index"
      >
        <div
          slot="trigger"
          slot-scope="props"
          class="card-header"
          role="button"
        >
          <p
            class="card-header-title"
            @contextmenu.prevent="
              (evt) => {
                selected = currentData
                $refs.context.open(evt)
              }
            "
          >
            {{ collapse.title }}
          </p>
          <a class="card-header-icon">
            <b-icon :icon="props.open ? 'caret-down' : 'caret-up'"> </b-icon>
          </a>
        </div>
        <div class="card-content">
          <div class="content">
            <span
              v-for="t in currentData"
              :key="t"
              class="tag clickable"
              :class="getTagClass(t)"
              @contextmenu.prevent="
                (evt) => {
                  selected = [t]
                  $refs.context.open(evt)
                }
              "
            >
              {{ t }}
            </span>
          </div>
        </div>
      </b-collapse>
    </div>

    <ContextMenu
      ref="context"
      type="vocab"
      :entry="selected"
      @quiz:added="(evt) => reload(evt.entries)"
      @quiz:removed="(evt) => reload(evt.entries)"
    />
  </section>
</template>

<script lang="ts">
import { Component, Ref, Vue } from 'nuxt-property-decorator'
import ContextMenu from '~/components/ContextMenu.vue'

@Component<LibraryPage>({
  layout: 'logged-in',
  watch: {
    q() {
      this.currentData = []
      this.reload([])
    },
  },
  created() {
    this.reload([])
  },
})
export default class LibraryPage extends Vue {
  @Ref() context!: ContextMenu

  openIndex = 0
  selected: string[] = []
  srsLevel: {
    [entry: string]: number
  } = {}

  readonly tagClassMap = [
    (lv: any) => (lv > 2 ? 'is-success' : ''),
    (lv: any) => (lv > 0 ? 'is-warning' : ''),
    (lv: any) => (lv === 0 ? 'is-danger' : ''),
  ]

  readonly collapses = [
    {
      title: 'HSK1',
      q: 'tag:HSK1',
    },
    {
      title: 'HSK2',
      q: 'tag:HSK2',
    },
    {
      title: 'HSK3',
      q: 'tag:HSK3',
    },
    {
      title: 'HSK4 (Set 1)',
      q: 'tag:HSK4 tag:HSK4_set1',
    },
    {
      title: 'HSK4 (Set 2)',
      q: 'tag:HSK4 NOT tag:HSK4_set1',
    },
    {
      title: 'HSK5 (Set 1)',
      q: 'tag:HSK5 tag:HSK5_set1',
    },
    {
      title: 'HSK5 (Set 2)',
      q: 'tag:HSK5 tag:HSK5_set2',
    },
    {
      title: 'HSK5 (Set 3)',
      q: 'tag:HSK5 tag:HSK5_set3',
    },
    {
      title: 'HSK5 (Set 4)',
      q: 'tag:HSK5 NOT (tag:HSK5_set1 OR tag:HSK5_set2 OR tag:HSK5_set3)',
    },
    {
      title: 'HSK6 (Set 1)',
      q: 'tag:HSK6 tag:HSK6_set1',
    },
    {
      title: 'HSK6 (Set 2)',
      q: 'tag:HSK6 tag:HSK6_set2',
    },
    {
      title: 'HSK6 (Set 3)',
      q: 'tag:HSK6 tag:HSK6_set3',
    },
    {
      title: 'HSK6 (Set 4)',
      q: 'tag:HSK6 tag:HSK6_set4',
    },
    {
      title: 'HSK6 (Set 5)',
      q:
        'tag:HSK6 NOT (tag:HSK6_set1 OR tag:HSK6_set2 OR tag:HSK6_set3 OR tag:HSK6_set4)',
    },
  ]

  currentData: string[] = []

  get q() {
    return this.collapses[this.openIndex].q
  }

  async reload(entries: string[]) {
    if (this.currentData.length === 0) {
      const { result } = await this.$axios.$get<{
        result: {
          entry: string
        }[]
      }>('/api/library/q', {
        params: {
          q: this.q,
        },
      })

      this.currentData = result.map((r) => r.entry)
      entries = this.currentData
    }

    if (entries.length > 0) {
      const {
        result = [],
      }: {
        result: {
          entry: string
          srsLevel: number | null
        }[]
      } = await this.$axios.$post('/api/quiz/srsLevel', {
        entries,
        type: 'vocab',
        select: ['entry', 'srsLevel'],
      })

      // eslint-disable-next-line array-callback-return
      entries.map((entry) => {
        delete this.srsLevel[entry]
      })

      // eslint-disable-next-line array-callback-return
      result.map(({ entry, srsLevel }) => {
        this.srsLevel[entry] = typeof srsLevel === 'number' ? srsLevel : -1
      })

      this.$set(this, 'srsLevel', this.srsLevel)
      this.$forceUpdate()
    }
  }

  getTagClass(item: string) {
    const srsLevel = this.srsLevel[item]

    if (typeof srsLevel !== 'undefined') {
      if (srsLevel === -1) {
        return 'is-info'
      }

      for (const fn of this.tagClassMap) {
        const c = fn(srsLevel)
        if (c) {
          return c
        }
      }
    }

    return 'is-light'
  }
}
</script>

<style scoped>
.tag {
  margin-right: 0.5rem;
}
</style>
