import {
  readFileSync,
} from 'node:fs'

const html =
  readFileSync(
    'index.html',
    'utf8',
  )

const manifest =
  JSON.parse(
    readFileSync(
      'public/site.webmanifest',
      'utf8',
    ),
  )

const mobile =
  readFileSync(
    'src/styles/mobile-experience.css',
    'utf8',
  )

const calculatorSource =
  readFileSync(
    'src/data/calculators.ts',
    'utf8',
  )

const catalogCalculatorCount =
  calculatorSource.match(
    /\{\s*id\s*:/g,
  )?.length ?? 0

if (
  catalogCalculatorCount <= 0
) {
  console.error(
    'MOBILE PLATFORM V5 VERIFICATION FAILED',
  )

  console.error(
    '- Unable to determine calculator catalog count.',
  )

  process.exit(1)
}

const calculatorCountLabel =
  `${catalogCalculatorCount} calculators`

const contracts = [
  [
    html.includes(
      'viewport-fit=cover',
    ),
    'viewport-fit=cover missing.',
  ],
  [
    html.includes(
      'name="mobile-web-app-capable"',
    )
      && html.includes(
        'name="apple-mobile-web-app-capable"',
      ),
    'Mobile standalone metadata missing.',
  ],
  [
    html.includes(
      'name="apple-mobile-web-app-title"',
    ),
    'Apple mobile app title missing.',
  ],
  [
    html.includes(
      calculatorCountLabel,
    ),
    `HTML calculator count metadata is stale; expected ${calculatorCountLabel}.`,
  ],
  [
    typeof manifest.description ===
      'string'
      && manifest.description.includes(
        calculatorCountLabel,
      ),
    `Manifest calculator count is stale; expected ${calculatorCountLabel}.`,
  ],
  [
    manifest.id === '/',
    'Stable PWA application id missing.',
  ],
  [
    mobile.includes(
      '--mobile-safe-top:',
    )
      && mobile.includes(
        '--mobile-safe-bottom:',
      ),
    'Safe-area variables missing.',
  ],
  [
    mobile.includes(
      'safe-area-inset-top',
    )
      && mobile.includes(
        'safe-area-inset-bottom',
      ),
    'Safe-area environment usage missing.',
  ],
  [
    mobile.includes(
      'padding-top:\n      var(--mobile-safe-top)',
    ),
    'Header notch protection missing.',
  ],
  [
    mobile.includes(
      'padding-bottom:\n      var(--mobile-safe-bottom)',
    ),
    'Home-indicator protection missing.',
  ],
  [
    mobile.includes(
      'touch-action: manipulation',
    ),
    'Touch interaction optimization missing.',
  ],
  [
    mobile.includes(
      'MOBILE PLATFORM POLISH V5',
    ),
    'Mobile platform V5 marker missing.',
  ],
]

const failures =
  contracts
    .filter(
      ([passed]) =>
        !passed,
    )
    .map(
      ([, message]) =>
        message,
    )

if (failures.length) {
  console.error(
    'MOBILE PLATFORM V5 VERIFICATION FAILED',
  )

  for (
    const failure
    of failures
  ) {
    console.error(
      `- ${failure}`,
    )
  }

  process.exit(1)
}

console.log(
  'MOBILE PLATFORM V5 VERIFICATION PASSED',
)

console.log(
  'PASS: notch and home-indicator safe areas.',
)

console.log(
  'PASS: viewport-fit mobile shell.',
)

console.log(
  'PASS: standalone mobile metadata.',
)

console.log(
  `PASS: ${catalogCalculatorCount} calculator metadata synchronized.`,
)

console.log(
  'PASS: touch interaction contract.',
)
