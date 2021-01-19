import 'buefy/dist/buefy.css'

import './etabs.scss'

declare global {
  interface Window {
    openExternal?: (url: string) => void;
  }
}

const tabEl = document.querySelector('nav > ul') as HTMLUListElement
const mainEl = document.querySelector('main') as HTMLElement
const originalOpen = window.open

window.open = function (url = '', title = '') {
  if (!url.startsWith('/#/')) {
    if (window.openExternal) {
      window.openExternal(url)
      return null
    }

    return originalOpen(url, '_blank', 'noopener noreferrer')
  }

  const li = document.createElement('li')
  li.className = 'is-active'

  const liA = document.createElement('a')
  li.append(liA)
  liA.innerText = title
  liA.setAttribute('role', 'button')
  liA.onclick = () => {
    const index = Array.from(tabEl.querySelectorAll('li > a')).indexOf(liA)

    tabEl.querySelectorAll('li').forEach((el, i) => {
      if (i !== index) {
        el.classList.remove('is-active')
      } else {
        el.classList.add('is-active')
      }
    })

    mainEl.querySelectorAll('iframe').forEach((el, i) => {
      if (i !== index) {
        el.style.display = 'none'
      } else {
        el.style.display = 'block'
      }
    })
  }

  if (tabEl.querySelector('li')) {
    const liAClose = document.createElement('a')
    liAClose.className = 'delete is-small'
    liAClose.onclick = () => {
      let i = Array.from(tabEl.querySelectorAll('li > a')).indexOf(liA)
      if (i < 1) {
        return
      }
      i++

      const li = tabEl.querySelector(`li:nth-child(${i})`)
      if (li) {
        if (li.classList.contains('is-active')) {
          setTimeout(() => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            tabEl.querySelector('li')!.classList.add('is-active')
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            mainEl.querySelector('iframe')!.style.display = ''
          }, 10)
        }

        li.remove()
      }

      const iframe = mainEl.querySelector(`iframe:nth-child(${i})`)
      if (iframe) {
        iframe.remove()
      }
    }

    liA.append(liAClose)
  }

  tabEl.querySelectorAll('li').forEach((el) => {
    el.classList.remove('is-active')
  })

  tabEl.append(li)

  const iframe = document.createElement('iframe')
  iframe.src = url

  mainEl.querySelectorAll('iframe').forEach((el) => {
    el.style.display = 'none'
  })

  mainEl.append(iframe)

  return iframe.contentWindow
}

open('/#/', 'Home')
