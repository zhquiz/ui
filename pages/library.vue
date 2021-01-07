<template>
  <section>
    <div class="LibraryPage">
      <h2 class="title is-2">Library</h2>
      <b-collapse
        v-for="(c, i) of collapses"
        :key="i"
        class="card"
        animation="slide"
        :open="cIndex == i"
        @open="cIndex = i"
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
            {{ c.title }}
          </p>
          <a class="card-header-icon">
            <b-icon :icon="props.open ? 'caret-down' : 'caret-up'"> </b-icon>
          </a>
        </div>
        <div class="card-content top-card-content">
          <b-collapse
            v-for="(c0, j) of c.children"
            :key="j"
            class="card"
            animation="slide"
            :open="cSubIndex == j"
            @open="cSubIndex = j"
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
                {{ c0.title }}
              </p>
              <a class="card-header-icon">
                <b-icon :icon="props.open ? 'caret-down' : 'caret-up'">
                </b-icon>
              </a>
            </div>
            <div class="card-content">
              <div>
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
    currentData() {
      this.reload(this.currentData)
    },
  },
  async created() {
    const [r1, r2] = await Promise.all([
      this.$axios.$get('/api/library/library.json'),
      fetch(
        `https://zhquiz.github.io/libraryx.json?${encodeURIComponent(
          Math.random().toString(36).substr(2)
        )}`
      ).then((r) => r.json()),
    ])

    this.collapses = [...r1, ...r2]
    const titles = this.collapses
      .map((r) => r.title)
      .filter((a, i, arr) => arr.indexOf(a) === i)

    this.collapses = this.collapses.filter(
      (a, i) => titles.indexOf(a.title) === i
    )
  },
})
export default class LibraryPage extends Vue {
  @Ref() context!: ContextMenu

  selected: string[] = []
  srsLevel: {
    [entry: string]: number
  } = {}

  readonly tagClassMap = [
    (lv: any) => (lv > 2 ? 'is-success' : ''),
    (lv: any) => (lv > 0 ? 'is-warning' : ''),
    (lv: any) => (lv === 0 ? 'is-danger' : ''),
  ]

  cIndex = 0
  cSubIndex = -1

  collapses: {
    title: string
    children: {
      title: string
      entries: string[]
    }[]
  }[] = []

  get currentData() {
    return (
      this.collapses[this.cIndex]?.children[this.cSubIndex]?.entries || []
    ).filter((a, i, arr) => arr.indexOf(a) === i)
  }

  async reload(entries: string[]) {
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

.top-card-content {
  max-height: 400px;
  overflow: scroll;
}
</style>
