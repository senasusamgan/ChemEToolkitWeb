import {
  readFile,
} from 'node:fs/promises'

const [
  app,
  primitives,
  css,
  packageSource,
] = await Promise.all([
  readFile(
    'src/App.tsx',
    'utf8',
  ),

  readFile(
    'src/features/mass-transfer/shared/NativeCalculatorPrimitives.tsx',
    'utf8',
  ),

  readFile(
    'src/styles/calculator-experience-v2.css',
    'utf8',
  ),

  readFile(
    'package.json',
    'utf8',
  ),
])

function marker(
  source,
  value,
  label,
) {
  if (
    !source.includes(value)
  ) {
    throw new Error(
      `${label} missing: ${value}`,
    )
  }
}

marker(
  app,
  "./styles/calculator-experience-v2.css",
  'App CSS import',
)

marker(
  primitives,
  'Chemical Engineering · {code}',
  'shared calculator header',
)

if (
  primitives.includes(
    'Mass Transfer · {code}',
  )
) {
  throw new Error(
    'Old hard-coded Mass Transfer header remains.',
  )
}

for (
  const value of [
    'Governing relation',
    '.native-input-shell:focus-within',
    '.native-primary-action',
    '.native-result-heading',
    '.native-result-grid article',
    '.native-limitation',
    '.active-favorite-button',
    'safe-area-inset-bottom',
  ]
) {
  marker(
    css,
    value,
    'calculator experience CSS',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

if (
  !pkg.scripts[
    'verify:calculator-experience-v2'
  ]
) {
  throw new Error(
    'Calculator experience verifier script missing.',
  )
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:calculator-experience-v2',
  )
) {
  throw new Error(
    'Calculator experience verifier missing from release chain.',
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
  'PASS: calculator experience v2 verifier.',
)
