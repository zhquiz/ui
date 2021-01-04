import { fetchSettings } from '~/assets/shared'

if (
  typeof window !== 'undefined' &&
  !location.origin.includes('://localhost')
) {
  fetchSettings().then((g) => {
    if (g.plausible) {
      document.head.append(
        Object.assign(document.createElement('script'), {
          async: true,
          defer: true,
          'data-domain': g.plausible,
          src: 'https://plausible.io/js/plausible.js',
        })
      )
    }
  })
}
