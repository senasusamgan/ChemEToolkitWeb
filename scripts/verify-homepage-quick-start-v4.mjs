import {
  readFile,
} from 'node:fs/promises'

const [
  app,
  home,
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
  if (!source.includes(marker)) {
    throw new Error(
      `${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  "./styles/homepage-quick-start-v4.css",
  '<HomeDashboard',
  'openProblemSolver',
  'openCalculator',
  'openCategory',
]) {
  requireMarker(
    app,
    marker,
    'Quick Start App marker',
  )
}

for (const marker of [
  'className="home-workspace-hero"',
  '<HomeSearch',
  '<CalculatorStage',
  'Continue working',
  'Explore engineering',
  '<HomeProblemSolverEntry',
]) {
  requireMarker(
    home,
    marker,
    'Quick Start Home marker',
  )
}

for (const marker of [
  '.quick-start-section',
  '.quick-start-card',
  '@media (',
]) {
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
    'Quick Start verifier missing from release chain.',
  )
}

console.log(
  'PASS: homepage quick start v4 verifier.',
)
