<template>
  <section>
    <div class="SettingsPage">
      <form class="container" @submit.prevent="doSave">
        <div class="flex flex-row items-center">
          <b-field label="Level Range" class="flex-grow">
            <b-slider v-model="lv" :min="lvRange[0]" :max="lvRange[1]" lazy>
              <b-slider-tick :value="lvRange[0]">{{
                lvRange[0]
              }}</b-slider-tick>
              <template
                v-for="val in Array(lvRange[1] / 10)
                  .fill(10)
                  .map((el, i) => el * (i + 1))"
              >
                <b-slider-tick :key="val" :value="val">{{ val }}</b-slider-tick>
              </template>
            </b-slider>
          </b-field>
          <div class="label-level">{{ lv[0] }} - {{ lv[1] }}</div>
        </div>

        <div class="flex flex-row items-center">
          <b-field label="Sentence Length" class="flex-grow">
            <b-slider
              v-model="sentenceLength"
              :min="sentenceLengthRange[0]"
              :max="sentenceLengthRange[1]"
              lazy
            >
              <b-slider-tick :value="sentenceLengthRange[0]">{{
                sentenceLengthRange[0]
              }}</b-slider-tick>
              <template
                v-for="val in Array(sentenceLengthRange[1] / 5 - 1)
                  .fill(5)
                  .map((el, i) => el * (i + 1))"
              >
                <b-slider-tick :key="val" :value="val">{{ val }}</b-slider-tick>
              </template>
              <b-slider-tick :value="sentenceLengthRange[1]">
                Inf
              </b-slider-tick>
            </b-slider>
          </b-field>
          <div class="label-level">
            {{ sentenceLength[0] }} -
            {{
              sentenceLength[1] === sentenceLengthRange[1]
                ? 'Inf'
                : sentenceLength[1]
            }}
          </div>
        </div>

        <div class="flex flex-row">
          <button
            class="button is-success"
            :disabled="!email"
            type="submit"
            aria-label="save"
          >
            Save
          </button>
        </div>
      </form>

      <div v-if="isSignedIn" class="container w-full danger-zone">
        <h3 class="title is-4 is-danger">Danger Zone</h3>

        <form
          class="flex flex-row items-center"
          @submit.prevent="isDeleteAccountModal = true"
        >
          <p class="flex">Delete my account</p>
          <div class="flex-grow" />
          <button class="button is-danger" aria-label="delete-account">
            Delete
          </button>
        </form>
      </div>

      <b-modal :active.sync="isDeleteAccountModal" :width="500">
        <form
          class="card delete-account-form"
          @submit.prevent="doDeleteAccount"
        >
          <div class="card-content">
            <div class="flex flex-row items-center">
              <div class="icon has-text-danger">
                <fontawesome icon="exclamation-circle" />
              </div>

              <div class="flex-grow content">
                <div>Type your <b>email</b> to delete your account.</div>

                <input
                  v-model="deleteAccountEmail"
                  class="input control"
                  type="email"
                  aria-label="delete-account-email"
                />

                <div class="flex flex-row items-center">
                  <div class="flex-grow" />
                  <button
                    type="submit"
                    class="button is-danger"
                    :disabled="deleteAccountEmail !== email"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </b-modal>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { cotter, logOut } from '~/service/auth'

@Component({
  layout: 'logged-in',
})
export default class SettingsPage extends Vue {
  isDeleteAccountModal = false
  deleteAccountEmail = ''

  readonly lvRange = [1, 60]
  readonly sentenceLengthRange = [2, 20]

  lv = this.clone(this.lvRange)
  sentenceLength = this.clone(this.sentenceLengthRange)

  get email() {
    return this.$accessor.user || null
  }

  async created() {
    this.lv = [
      this.$accessor.settings.levelMin || this.lvRange[0],
      this.$accessor.settings.level || this.lvRange[1],
    ]
    this.sentenceLength = [
      this.$accessor.settings.sentenceMin || this.sentenceLengthRange[0],
      this.$accessor.settings.sentenceMax || this.sentenceLengthRange[1],
    ]
  }

  clone<T = any>(o: T): T {
    return JSON.parse(JSON.stringify(o))
  }

  async doSave() {
    await this.$axios.$patch('/api/user/', {
      levelMin: this.lv[0],
      level: this.lv[1],
      sentenceMin: this.sentenceLength[0],
      sentenceMax:
        this.sentenceLength[1] === this.sentenceLengthRange[1]
          ? 0
          : this.sentenceLength[1],
    })
    this.$accessor.SET_SETTINGS({
      levelMin: this.lv[0],
      level: this.lv[1],
      sentenceMin: this.sentenceLength[0],
      sentenceMax:
        this.sentenceLength[1] === this.sentenceLengthRange[1]
          ? null
          : this.sentenceLength[1],
    })
    this.$buefy.snackbar.open('Saved')
  }

  isSignedIn() {
    return !!cotter
  }

  async doDeleteAccount() {
    logOut(this.$router)
  }
}
</script>

<style scoped>
.SettingsPage {
  padding-top: 1rem;
}

.SettingsPage > :not(.modal) {
  margin-bottom: 2rem;
}

.label-level {
  text-align: right;
  width: 5em;
  word-break: keep-all;
  margin-left: 1rem;
}

.danger-zone {
  min-height: 150px;
  border: 1px solid red;
  border-radius: 0.25rem;
  padding: 1.5rem;
}

.danger-zone .title {
  color: red;
}

.delete-account-form .icon {
  margin-right: 1.5rem;
  padding: 1.5rem;
}

.delete-account-form .icon > svg {
  --size: 3rem;

  width: var(--size);
  height: var(--size);
}

.delete-account-form .content > * + * {
  margin-top: 1rem;
}
</style>
