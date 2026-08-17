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
    'src/styles/personal-toolkit-dashboard-v5.css',
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
  "./styles/personal-toolkit-dashboard-v5.css",
  'favoriteCalculatorIds',
  'recentCalculatorIds',
  'activeCalculatorId',
  'toggleFavorite',
]) {
  requireMarker(
    app,
    marker,
    'Toolkit App marker',
  )
}

for (const marker of [
  'activeCalculator={activeCalculator}',
  'recentCalculators={recentCalculators}',
  'favoriteCalculators={favoriteCalculators}',
  'Continue working',
  'View toolkit →',
  'Explore engineering',
  'onOpenProblemSolver',
]) {
  requireMarker(
    home,
    marker,
    'Toolkit Home marker',
  )
}

for (const marker of [
  '.personal-toolkit-dashboard',
  '.toolkit-dashboard-primary',
  '.toolkit-dashboard-stats',
  '.personal-toolkit-panel',
]) {
  requireMarker(
    css,
    marker,
    'Toolkit CSS marker',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

if (
  !pkg.scripts[
    'verify:personal-toolkit-dashboard-v5'
  ]
) {
  throw new Error(
    'V5 verifier script missing.',
  )
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:personal-toolkit-dashboard-v5',
  )
) {
  throw new Error(
    'V5 verifier missing from release chain.',
  )
}

console.log(
  'PASS: personal toolkit dashboard v5 verifier.',
)
