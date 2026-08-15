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
    'src/styles/responsive-accessibility-v8.css',
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
    "./styles/responsive-accessibility-v8.css",
    'className="skip-to-workbench"',
    'href="#workbench"',
    'Skip to calculator workspace',
  ]
) {
  requireMarker(
    app,
    marker,
    'V8 App marker',
  )
}


for (
  const marker of [
    '.skip-to-workbench',
    ':focus-visible',
    'pointer: coarse',
    'prefers-reduced-motion',
    'forced-colors: active',
    '@media print',
    'safe',
  ]
) {
  if (
    marker === 'safe'
  ) {
    continue
  }

  requireMarker(
    css,
    marker,
    'V8 CSS marker',
  )
}


const pkg =
  JSON.parse(
    packageSource,
  )


if (
  !pkg.scripts[
    'verify:responsive-accessibility-v8'
  ]
) {
  throw new Error(
    'V8 verifier script missing.',
  )
}


if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:responsive-accessibility-v8',
  )
) {
  throw new Error(
    'V8 verifier missing from release chain.',
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
  'PASS: Responsive & Accessibility v8 verifier.',
)
