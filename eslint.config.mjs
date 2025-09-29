import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  vue: true,

  ignores: [
    'examples/**',
    'dist/**',
    'docs/**',
    'coverage/>**',
    'dist-ssr/**',
    '*.local',
    'stats.html',
    '*.log',
    'README.md',
  ],
})
