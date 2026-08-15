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
    'src/styles/problem-solver-experience-v7.css',
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
    "./styles/problem-solver-experience-v7.css",
    'problem-solver-lazy-shell problem-solver-v7-section',
    'className="problem-solver-v7-header"',
    'Engineering Problem Solver',
    'Start with the problem,',
    'State the target',
    'Include known values',
    'Review assumptions',
  ]
) {
  requireMarker(
    app,
    marker,
    'V7 App marker',
  )
}


for (
  const marker of [
    '.problem-solver-v7-section',
    '.problem-solver-v7-header',
    '.problem-solver-v7-heading',
    '.problem-solver-v7-guide',
    'textarea:focus',
    "button[type='submit']",
    '.problem-solver-lazy-placeholder',
    "[role='alert']",
  ]
) {
  requireMarker(
    css,
    marker,
    'V7 CSS marker',
  )
}


const pkg =
  JSON.parse(
    packageSource,
  )


if (
  !pkg.scripts[
    'verify:problem-solver-experience-v7'
  ]
) {
  throw new Error(
    'V7 verifier script missing.',
  )
}


if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:problem-solver-experience-v7',
  )
) {
  throw new Error(
    'V7 verifier missing from release chain.',
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
  'PASS: Problem Solver Experience v7 verifier.',
)
