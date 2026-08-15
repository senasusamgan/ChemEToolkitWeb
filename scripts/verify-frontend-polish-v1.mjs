import {
  readFile,
} from 'node:fs/promises'

const [
  app,
  style,
  packageSource,
] = await Promise.all([
  readFile(
    'src/App.tsx',
    'utf8',
  ),
  readFile(
    'src/styles/frontend-polish-v1.css',
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
    !source.includes(
      marker,
    )
  ) {
    throw new Error(
      `Frontend polish ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    "./styles/frontend-polish-v1.css",
    'data-selected={',
    'selectedCategory === category.name',
    'className="status-strip status-strip-v2"',
    '{liveCalculatorCount} verified calculators',
    'across {categories.length} engineering disciplines',
    'Search all ${calculators.length} calculators',
    'Showing {filteredCalculators.length} of {calculators.length} calculators',
    'Verified · ready to calculate',
  ]
) {
  requireMarker(
    app,
    marker,
    'App marker',
  )
}

for (
  const marker of [
    '--site-header-height: 76px',
    ".category-pill[data-selected='true']",
    '.status-strip-v2',
    '.calculator-list article:hover',
    '.calculator-list-favorite',
    '.search-box:focus-within',
    '@media (',
  ]
) {
  requireMarker(
    style,
    marker,
    'CSS marker',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

if (
  !pkg.scripts[
    'verify:frontend-polish-v1'
  ]
) {
  throw new Error(
    'Missing verify:frontend-polish-v1 package script.',
  )
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:frontend-polish-v1',
  )
) {
  throw new Error(
    'Frontend polish verifier is missing from verify:release.',
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
  'PASS: frontend polish v1 verifier.',
)
