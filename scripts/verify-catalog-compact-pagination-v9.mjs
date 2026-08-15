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
    'src/styles/catalog-compact-pagination-v9.css',
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
    "./styles/catalog-compact-pagination-v9.css",
    'const CATALOG_PAGE_SIZE =',
    '20',
    'catalogPage',
    'setCatalogPage',
    'catalogPageCount',
    'catalogStartIndex',
    'catalogEndIndex',
    'const visibleCalculators',
    '{visibleCalculators.map((calculator, index) => (',
    'id="catalog-list-start"',
    'className="catalog-pagination"',
    'Calculator directory pagination',
    'className="catalog-page-select"',
    'changeCatalogPage(',
  ]
) {
  requireMarker(
    app,
    marker,
    'V9 App marker',
  )
}


if (
  app.includes(
    '{filteredCalculators.map((calculator, index) => (',
  )
) {
  throw new Error(
    'Catalog still renders all filtered calculators.',
  )
}


for (
  const marker of [
    '.calculators-section',
    '.catalog-top',
    '.catalog-controls',
    '.catalog-filter-chips',
    '.catalog-recent-strip',
    '.catalog-pagination',
    '.catalog-page-select',
  ]
) {
  requireMarker(
    css,
    marker,
    'V9 CSS marker',
  )
}


const pkg =
  JSON.parse(
    packageSource,
  )


if (
  !pkg.scripts[
    'verify:catalog-compact-pagination-v9'
  ]
) {
  throw new Error(
    'V9 verifier script missing.',
  )
}


if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:catalog-compact-pagination-v9',
  )
) {
  throw new Error(
    'V9 verifier missing '
    + 'from release chain.',
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
    'Visible calculator-count verifier '
    + 'must remain last.',
  )
}


console.log(
  'PASS: Compact Catalog Pagination v9 verifier.',
)
