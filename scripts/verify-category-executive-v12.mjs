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
    'src/styles/category-executive-v12.css',
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
) {
  if (
    !source.includes(marker)
  ) {
    throw new Error(
      `Missing V12 marker: ${marker}`,
    )
  }
}


for (
  const marker of [
    "./styles/category-executive-v12.css",
    'categories-executive-v12',
    'id="disciplines-title"',
    'Explore by discipline.',
    'className="category-executive-summary"',
    'category-navigation-card',
    'className="category-navigation-icon"',
    'className="category-navigation-copy"',
    'className="category-navigation-arrow"',
    'verified calculator',
  ]
) {
  requireMarker(
    app,
    marker,
  )
}


if (
  app.includes(
    'className="category-number"',
  )
) {
  throw new Error(
    'Category sequence numbers '
    + 'must not exist in the UI.',
  )
}


if (
  app.includes(
    'Eleven disciplines. One coherent toolkit.',
  )
) {
  throw new Error(
    'Legacy oversized category heading '
    + 'still exists.',
  )
}


for (
  const marker of [
    '#categories',
    'scroll-margin-top:',
    '.category-executive-header',
    '.category-executive-summary',
    '.category-executive-grid',
    '.category-navigation-card',
    'min-height:',
    '94px',
    '.category-navigation-icon',
    '.category-navigation-copy',
    '.category-navigation-arrow',
  ]
) {
  requireMarker(
    css,
    marker,
  )
}


const pkg =
  JSON.parse(
    packageSource,
  )


if (
  !pkg.scripts[
    'verify:category-executive-v12'
  ]
) {
  throw new Error(
    'V12 verifier package script missing.',
  )
}


if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:category-executive-v12',
  )
) {
  throw new Error(
    'V12 verifier missing from release chain.',
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
  'PASS: Executive Category Page V12 verifier.',
)
