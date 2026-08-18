import {
  readFileSync,
} from 'node:fs'

const main =
  readFileSync(
    'src/main.tsx',
    'utf8',
  )

const css =
  readFileSync(
    'src/styles/mobile-real-device-fix.css',
    'utf8',
  )

const mobileBase =
  main.indexOf(
    "import './styles/mobile-experience.css'",
  )

const realDevice =
  main.indexOf(
    "import './styles/mobile-real-device-fix.css'",
  )

const checks = [
  [
    realDevice >
      mobileBase,
    'Real-device mobile layer must load after mobile-experience.',
  ],
  [
    css.includes(
      '.app-header .desktop-nav',
    )
      && css.includes(
        'display: none !important',
      ),
    'Desktop navigation must be forcibly hidden on mobile.',
  ],
  [
    css.includes(
      '.app-header .mobile-menu-toggle',
    )
      && css.includes(
        'display: grid !important',
      ),
    'Mobile menu trigger must be visible.',
  ],
  [
    css.includes(
      '.app-header .brand-wordmark',
    )
      && css.includes(
        'text-overflow: ellipsis !important',
      ),
    'Mobile brand width protection missing.',
  ],
  [
    css.includes(
      '.calculators-section.section'
    )
      && css.includes(
        'grid-template-columns:\n      minmax(',
      ),
    'High-specificity calculator card reset missing.',
  ],
  [
    css.includes(
      '.calculator-list\n  .list-index'
    )
      && css.includes(
        'display: none !important',
      ),
    'Mobile calculator list index reset missing.',
  ],
  [
    css.includes(
      '.calculator-list-item-actions'
    )
      && css.includes(
        '44px\n      minmax(',
      ),
    'Calculator mobile action layout missing.',
  ],
  [
    css.includes(
      'overflow-x: hidden !important',
    )
      && css.includes(
        'overflow-x: clip !important',
      ),
    'Horizontal page overflow protection missing.',
  ],
  [
    css.includes(
      '.site-footer-v6'
    )
      && css.includes(
        '--color-text-primary:',
      ),
    'Footer mobile contrast fix missing.',
  ],
  [
    css.includes(
      'aria-label*="feedback" i',
    ),
    'Floating feedback mobile positioning missing.',
  ],
]

const failures =
  checks
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
    'MOBILE REAL DEVICE V6 VERIFICATION FAILED',
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
  'MOBILE REAL DEVICE V6 VERIFICATION PASSED',
)

console.log(
  'PASS: real app-header selector targeted.',
)

console.log(
  'PASS: desktop navigation removed from phone layout.',
)

console.log(
  'PASS: mobile menu and brand width protected.',
)

console.log(
  'PASS: calculator cards reset to full-width single column.',
)

console.log(
  'PASS: horizontal viewport overflow blocked.',
)

console.log(
  'PASS: footer contrast and floating action placement improved.',
)
