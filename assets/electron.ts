/* global NodeJS */

declare global {
  interface Window {
    require: NodeJS.Require
  }
}

export function openInNewTab(url: string, title?: string) {
  if (window.require) {
    try {
      window
        .require('electron')
        .remote.getGlobal('win')
        .webContents.send('open-url', { url, title })
    } catch (e) {
      alert(e)
    }
  } else {
    open(url, '_blank', 'noopener noreferrer')
  }
}
