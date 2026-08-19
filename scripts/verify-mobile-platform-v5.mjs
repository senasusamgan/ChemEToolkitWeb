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
    !html.includes(
      '380 calculators',
    )
      && html.includes(
        '474 calculators',
      ),
    'HTML calculator count metadata is stale.',
  ],
  [
    manifest.description.includes(
      '474 calculators',
    ),
    'Manifest calculator count is stale.',
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
  'PASS: 474 calculator metadata synchronized.',
)

console.log(
  'PASS: touch interaction contract.',
)
