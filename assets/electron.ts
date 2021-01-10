/* global NodeJS */

import type ElectronTabs from 'electron-tabs'

declare global {
  interface Window {
    require: NodeJS.Require
  }
}

let tabGroup: ElectronTabs

export function openInNewTab(url: string, title?: string) {
  // @ts-ignore
  if (window.require) {
    if (!tabGroup) {
      const TabGroup = window.require(
        'electron-tabs'
      ) as typeof import('electron-tabs')

      tabGroup = new TabGroup()

      const electron = require('electron')
      const ipc = electron.ipcRenderer

      ipc.on('app-close', () => {
        tabGroup.eachTab((t) => {
          t.close(true)
        })

        ipc.send('closed')
      })
    }

    tabGroup.addTab({
      title,
      src: url,
      active: true,
    })
  } else {
    open(url, '_blank', 'noopener noreferrer')
  }
}
