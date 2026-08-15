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
    "./styles/engineering-trust-v6.css",
    'className="reference-trust-strip"',
    'Traceable basis',
    'Verification pipeline',
    'Visible assumptions',
    'Engineering responsibility',
    'className="reference-shelf-label"',
    'className="site-footer-v6"',
    'Release verified',
    '{categories.length} disciplines',
    'Educational and preliminary',
  ]
) {
  requireMarker(
    app,
    marker,
    'Engineering Trust App marker',
  )
}


for (
  const marker of [
    '.reference-trust-strip',
    '.reference-shelf-label',
    '.reference-grid article:hover',
    '.engineering-use-note',
    '.site-footer-v6',
    '.footer-v6-top',
    '.footer-v6-status',
    '.footer-v6-links',
    '.footer-v6-bottom',
  ]
) {
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
  'PASS: engineering trust v6 verifier.',
)
