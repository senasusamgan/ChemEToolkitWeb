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
    'src/styles/category-cards-compact-v10.css',
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
  if (!source.includes(marker)) {
    throw new Error(
      `Missing V10 marker: ${marker}`,
    )
  }
}

requireMarker(
  app,
  "./styles/category-cards-compact-v10.css",
)

for (
  const marker of [
    '.categories-section',
    '.category-card',
    'min-height: 176px',
    '.category-number',
    '.category-mark',
    '.category-card h3',
    '.category-card button',
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
    'verify:category-cards-compact-v10'
  ]
) {
  throw new Error(
    'Missing V10 package verifier.',
  )
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:category-cards-compact-v10',
  )
) {
  throw new Error(
    'V10 verifier missing from release.',
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
    'Visible calculator verifier must remain last.',
  )
}

console.log(
  'PASS: compact category cards v10 verifier.',
)
