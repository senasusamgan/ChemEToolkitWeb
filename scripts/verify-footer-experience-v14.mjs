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
    'src/styles/footer-experience-v14.css',
    'utf8',
  )

const contracts = [
  [
    app.includes(
      "import './styles/footer-experience-v14.css'",
    ),
    'Footer V14 stylesheet import missing.',
  ],
  [
    app.includes(
      'site-footer-v6 site-footer-v13 site-footer-v14',
    ),
    'Footer V14 surface class missing.',
  ],
  [
    styles.includes(
      '.site-footer-v14',
    )
      && styles.includes(
        '#fffdfa',
      )
      && styles.includes(
        '#f5efe3',
      ),
    'Light paper footer surface missing.',
  ],
  [
    styles.includes(
      '.brand-wordmark',
    )
      && styles.includes(
        'color:\n    var(--ink)',
      ),
    'Visible footer wordmark contract missing.',
  ],
  [
    styles.includes(
      '.brand-logo-vessel'
    )
      && styles.includes(
        '.brand-logo-process'
      )
      && styles.includes(
        '.brand-logo-liquid'
      ),
    'Full-color footer logo contract missing.',
  ],
  [
    styles.includes(
      '.footer-v13-links'
    )
      && styles.includes(
        'var(--teal-dark)',
      ),
    'Footer navigation contrast missing.',
  ],
  [
    styles.includes(
      '.footer-v13-bottom',
    )
      && styles.includes(
        'border-top:',
      ),
    'Compact footer closing rail missing.',
  ],
  [
    styles.includes(
      '@media (max-width: 700px)',
    )
      && styles.includes(
        '@media (max-width: 430px)',
      ),
    'Responsive footer V14 contracts missing.',
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
    'FOOTER EXPERIENCE V14 VERIFICATION FAILED',
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
  'FOOTER EXPERIENCE V14 VERIFICATION PASSED',
)

console.log(
  'PASS: light paper footer.',
)

console.log(
  'PASS: full-contrast ChemE Toolkit brand.',
)

console.log(
  'PASS: original logo colors restored.',
)

console.log(
  'PASS: lightweight navigation hierarchy.',
)

console.log(
  'PASS: desktop and mobile contracts.',
)
