const allVoices: Record<string, string> = {}

if (process.client) {
  window.addEventListener('keydown', (ev) => {
    if (
      ev.target instanceof HTMLElement &&
      ['INPUT', 'TEXTAREA'].includes(ev.target.tagName.toLocaleUpperCase())
    ) {
      return
    }

    if (ev.key === 's') {
      const s = window.getSelection()!.toString()
      if (s) {
        speak(s)
      }
    }
  })

  // eslint-disable-next-line array-callback-return
  speechSynthesis.getVoices().map((v) => {
    allVoices[v.lang] = v.lang
  })

  speechSynthesis.onvoiceschanged = () => {
    // eslint-disable-next-line array-callback-return
    speechSynthesis.getVoices().map((v) => {
      allVoices[v.lang] = v.lang
    })
  }
}

export async function speak(s: string) {
  if (navigator.onLine) {
    const audio = new Audio(`/api/chinese/speak?q=${encodeURIComponent(s)}`)
    audio.play()
    return
  }

  const voices = Object.keys(allVoices)
  const stage1 = () => voices.filter((v) => v === 'zh' || v === 'cmn')[0]
  const stage2 = () => {
    return voices.filter((v) => /^zh[-_]?/i.test(v))[0]
  }

  const lang = stage1() || stage2() || ''

  if (lang) {
    const utterance = new SpeechSynthesisUtterance(s)
    utterance.lang = lang
    speechSynthesis.speak(utterance)

    return new Promise<void>((resolve) => {
      utterance.onend = () => {
        resolve()
      }
    })
  }
}
