if (
  typeof window !== 'undefined' &&
  !location.origin.includes('://localhost')
) {
  document.head.append(
    Object.assign(document.createElement('script'), {
      async: true,
      defer: true,
      'data-domain': 'zhquiz.cc',
      src: 'https://plausible.io/js/plausible.js',
    })
  )
}
