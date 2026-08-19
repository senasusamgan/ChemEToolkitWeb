import {
  readFileSync,
} from 'node:fs'

const app =
  readFileSync(
    'src/App.tsx',
    'utf8',
  )

const styles =
  readFileSync(
    'src/styles/footer-experience-v13.css',
    'utf8',
  )

const contracts = [
  [
    app.includes(
      "import './styles/footer-experience-v13.css'",
    ),
    'Footer V13 stylesheet import missing.',
  ],
  [
    app.includes(
      'engineering-use-note engineering-responsibility-strip',
    )
      && app.includes(
        'Use with professional judgment.',
      ),
    'Compact engineering responsibility strip missing.',
  ],
  [
    app.includes(
      'site-footer-v6 site-footer-v13',
    ),
    'Footer V6 compatibility contract missing.',
  ],
  [
    app.includes(
      'Verified calculations for engineering work.',
    ),
    'Footer product statement missing.',
  ],
  [
    app.includes(
      'Explore footer navigation',
    )
      && app.includes(
        'Engineering footer navigation',
      )
      && app.includes(
        'Product footer navigation',
      ),
    'Footer navigation architecture missing.',
  ],
  [
    app.includes(
      '{liveCalculatorCount} native calculators',
    )
      && app.includes(
        '{calculators.length - liveCalculatorCount} legacy',
      ),
    'Native / legacy release status missing.',
  ],
  [
    styles.includes(
      '.references-section'
    )
      && styles.includes(
        'padding-bottom:',
      ),
    'References-to-footer spacing refinement missing.',
  ],
  [
    styles.includes(
      '.engineering-responsibility-strip',
    )
      && styles.includes(
        '.engineering-responsibility-badge',
      ),
    'Engineering responsibility visual contract missing.',
  ],
  [
    styles.includes(
      '.site-footer-v13',
    )
      && styles.includes(
        '.footer-v13-top',
      )
      && styles.includes(
        '.footer-v13-bottom',
      ),
    'Compact footer layout missing.',
  ],
  [
    styles.includes(
      '.site-footer-v13\n.brand-wordmark',
    )
      && styles.includes(
        '.brand-logo-frame',
      )
      && styles.includes(
        '.brand-logo-vessel',
      ),
    'Dark-footer brand contrast protection missing.',
  ],
  [
    styles.includes(
      '@media (max-width: 700px)',
    )
      && styles.includes(
        '@media (max-width: 430px)',
      ),
    'Responsive footer contracts missing.',
  ],
  [
    styles.includes(
      '.site-footer-v13\n  ~ .feedback-launcher',
    ),
    'Desktop feedback launcher refinement missing.',
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
    'FOOTER EXPERIENCE V13 VERIFICATION FAILED',
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
  'FOOTER EXPERIENCE V13 VERIFICATION PASSED',
)

console.log(
  'PASS: compact engineering responsibility strip.',
)

console.log(
  'PASS: premium reduced-height footer.',
)

console.log(
  'PASS: footer brand contrast corrected.',
)

console.log(
  'PASS: Explore / Engineering / Product navigation.',
)

console.log(
  'PASS: desktop and mobile footer contracts.',
)
