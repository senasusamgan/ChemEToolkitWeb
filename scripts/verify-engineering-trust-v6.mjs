import {
  readFile,
} from 'node:fs/promises'

const [
  app,
  home,
  stage,
  css,
  packageSource,
] = await Promise.all([
  readFile(
    'src/App.tsx',
    'utf8',
  ),
  readFile(
    'src/components/home/HomeDashboard.tsx',
    'utf8',
  ),
  readFile(
    'src/components/CalculatorStage.tsx',
    'utf8',
  ),
  readFile(
    'src/styles/engineering-trust-v6.css',
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
  if (!source.includes(marker)) {
    throw new Error(
      `${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  "./styles/engineering-trust-v6.css",
  'liveCalculatorCount',
  'categories.length',
]) {
  requireMarker(
    app,
    marker,
    'Engineering Trust App marker',
  )
}

for (const marker of [
  'verified calculators across',
  'engineering disciplines.',
  '<CalculatorStage',
]) {
  requireMarker(
    home,
    marker,
    'Engineering Trust Home marker',
  )
}

for (const marker of [
  'Verified engineering engine',
  'Reference basis ↘',
  'activeCalculator.category',
]) {
  requireMarker(
    stage,
    marker,
    'Engineering Trust Stage marker',
  )
}

for (const marker of [
  '.reference-trust-strip',
  '.engineering-use-note',
  '.site-footer-v6',
  '.footer-v6-status',
]) {
  requireMarker(
    css,
    marker,
    'Engineering Trust CSS marker',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

if (
  !pkg.scripts[
    'verify:engineering-trust-v6'
  ]
) {
  throw new Error(
    'V6 verifier script missing.',
  )
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:engineering-trust-v6',
  )
) {
  throw new Error(
    'V6 verifier missing from release chain.',
  )
}

console.log(
  'PASS: engineering trust v6 verifier.',
)
