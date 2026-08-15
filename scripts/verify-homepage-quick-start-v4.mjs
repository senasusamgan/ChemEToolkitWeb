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
    'src/styles/homepage-quick-start-v4.css',
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
    "./styles/homepage-quick-start-v4.css",
    'className="quick-start-section"',
    'id="quick-start-heading"',
    'recentCalculators[0] ??',
    'activeCalculator',
    'Calculator directory',
    'Problem Solver',
    'favoriteCalculators.length',
    'href="#your-toolkit"',
  ]
) {
  requireMarker(
    app,
    marker,
    'Quick Start App marker',
  )
}


for (
  const marker of [
    '.quick-start-section',
    '.quick-start-inner',
    '.quick-start-grid',
    '.quick-start-card',
    '.quick-start-card-primary',
    '.quick-start-card-icon',
    '@media (',
  ]
) {
  requireMarker(
    css,
    marker,
    'Quick Start CSS marker',
  )
}


const pkg =
  JSON.parse(
    packageSource,
  )


if (
  !pkg.scripts[
    'verify:homepage-quick-start-v4'
  ]
) {
  throw new Error(
    'Quick Start verifier script missing.',
  )
}


if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:homepage-quick-start-v4',
  )
) {
  throw new Error(
    'Quick Start verifier missing '
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
    'Visible calculator count verifier '
    + 'must remain last.',
  )
}


console.log(
  'PASS: homepage quick start v4 verifier.',
)
