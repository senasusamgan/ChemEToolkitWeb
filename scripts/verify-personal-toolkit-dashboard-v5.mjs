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
    "./styles/personal-toolkit-dashboard-v5.css",
    'className="personal-toolkit-dashboard"',
    'Current workspace',
    '{activeCalculator.title}',
    'Continue working',
    '{favoriteCalculators.length}',
    '{recentCalculators.length}',
    'new Set(',
    'Favorite disciplines',
    'Find a calculator',
    'Solve a problem',
    'Open workbench',
  ]
) {
  requireMarker(
    app,
    marker,
    'Toolkit dashboard App marker',
  )
}


for (
  const marker of [
    '.personal-toolkit-dashboard',
    '.toolkit-dashboard-primary',
    '.toolkit-dashboard-stats',
    '.toolkit-dashboard-actions',
    '.toolkit-dashboard-continue',
    '.personal-toolkit-panel',
  ]
) {
  requireMarker(
    css,
    marker,
    'Toolkit dashboard CSS marker',
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
  'PASS: personal toolkit dashboard v5 verifier.',
)
