export const g: {
  speak: 'web' | 'server'
} = {
  speak: 'web',
}

fetch('/server/settings')
  .then((r) => r.json())
  .then((r) => {
    Object.assign(g, r)
  })
  // eslint-disable-next-line no-console
  .catch((e) => console.error(e))
