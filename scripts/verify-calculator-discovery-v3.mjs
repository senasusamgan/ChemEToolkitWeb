import {
  readFile,
} from 'node:fs/promises'

const [
  app,
  css,
  packageSource,
] = await Promise.all([
  readFile(
    'src/App.tsx',
    'utf8',
  ),

  readFile(
    'src/styles/calculator-discovery-v3.css',
    'utf8',
  ),

  readFile(
    'package.json',
    'utf8',
  ),
])

function requireMarker(
  source,
  marker,
  label,
) {
  if (
    !source.includes(marker)
  ) {
    throw new Error(
      `${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    "./styles/calculator-discovery-v3.css",
    'showFavoritesOnly',
    'const searchTerms =',
    'searchTerms.every',
    'function clearCatalogFilters()',
    'catalog-filter-chips',
    'catalog-favorites-filter',
    'catalog-recent-strip',
    'catalog-result-bar',
    'catalog-empty-state',
    'href="#your-toolkit"',
  ]
) {
  requireMarker(
    app,
    marker,
    'App discovery marker',
  )
}

for (
  const marker of [
    '.catalog-filter-chips',
    ".catalog-favorites-filter[",
    '.catalog-recent-strip',
    '.catalog-result-bar',
    '.catalog-reset-button',
    '.catalog-empty-state',
    '#your-toolkit',
  ]
) {
  requireMarker(
    css,
    marker,
    'Discovery CSS marker',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

if (
  !pkg.scripts[
    'verify:calculator-discovery-v3'
  ]
) {
  throw new Error(
    'Missing calculator discovery verifier.',
  )
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:calculator-discovery-v3',
  )
) {
  throw new Error(
    'Discovery verifier missing from release chain.',
  )
}

if (
  !pkg.scripts[
    'verify:release'
  ].endsWith(
    'npm run verify:verified-calculator-copy',
  )
) {
  throw new Error(
    'Visible calculator count verifier must remain last.',
  )
}

console.log(
  'PASS: calculator discovery v3 verifier.',
)
