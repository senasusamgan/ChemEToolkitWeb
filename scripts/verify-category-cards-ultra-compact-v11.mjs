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
    'src/styles/category-cards-ultra-compact-v11.css',
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
      `Missing V11 marker: ${marker}`,
    )
  }
}


requireMarker(
  app,
  "./styles/category-cards-ultra-compact-v11.css",
)


if (
  app.includes(
    'className="category-number"',
  )
) {
  throw new Error(
    'Category sequence numbers '
    + 'were not removed.',
  )
}


for (
  const marker of [
    '.category-card',
    'min-height: 118px',
    '.category-number',
    'display: none',
    '.category-mark',
    '.category-card h3',
    '.category-card p',
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
    'verify:category-cards-ultra-compact-v11'
  ]
) {
  throw new Error(
    'Missing V11 package verifier.',
  )
}


if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:category-cards-ultra-compact-v11',
  )
) {
  throw new Error(
    'V11 verifier missing from release.',
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
    'Visible calculator verifier '
    + 'must remain last.',
  )
}


console.log(
  'PASS: ultra compact category cards v11 verifier.',
)
