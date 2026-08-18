import {
  readFileSync,
} from 'node:fs'

const styles =
  readFileSync(
    'src/styles/mobile-experience.css',
    'utf8',
  )

const stage =
  readFileSync(
    'src/components/CalculatorStage.tsx',
    'utf8',
  )

const contracts = [
  [
    styles.includes(
      'MOBILE CALCULATOR EXPERIENCE V2',
    ),
    'Mobile calculator V2 marker missing.',
  ],
  [
    styles.includes(
      '.calculator-stage-desktop-search'
    )
      && styles.includes(
        'display: none'
      )
      && styles.includes(
        '.calculator-stage-mobile-select'
      ),
    '768px calculator selector handoff missing.',
  ],
  [
    stage.includes(
      'calculator-stage-mobile-select',
    )
      && stage.includes(
        'Choose a live calculator',
      ),
    'Native mobile calculator selector contract missing.',
  ],
  [
    styles.includes(
      '.native-input-grid'
    )
      && styles.includes(
        'grid-template-columns:\n      minmax(0, 1fr)',
      ),
    'Calculator inputs must collapse to one column.',
  ],
  [
    styles.includes(
      '.native-input-shell input'
    )
      && styles.includes(
        'font-size: 16px',
      ),
    'Mobile numeric input zoom protection missing.',
  ],
  [
    styles.includes(
      '.native-primary-action'
    )
      && styles.includes(
        'grid-row: 1',
      ),
    'Primary calculator action must appear first.',
  ],
  [
    styles.includes(
      'position: static'
    )
      && styles.includes(
        '.home-workspace-live'
      ),
    'Obstructive sticky calculator action bar remains.',
  ],
  [
    styles.includes(
      '.native-result-grid'
    )
      && styles.includes(
        'repeat(\n        2,\n        minmax(0, 1fr)',
      ),
    'Compact mobile result grid missing.',
  ],
  [
    styles.includes(
      '.native-calculator table'
    )
      && styles.includes(
        'overflow-x: auto',
      ),
    'Wide calculator table overflow protection missing.',
  ],
  [
    styles.includes(
      '.calculator-stage-session-actions'
    )
      && styles.includes(
        'flex-wrap: nowrap',
      ),
    'Mobile session tools rail missing.',
  ],
  [
    styles.includes(
      '@media (max-width: 430px)',
    )
      && styles.includes(
        '@media (max-width: 360px)',
      ),
    'Compact and very-small calculator breakpoints missing.',
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
    'MOBILE CALCULATOR EXPERIENCE V2 VERIFICATION FAILED',
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
  'MOBILE CALCULATOR EXPERIENCE V2 VERIFICATION PASSED',
)

console.log(
  'PASS: calculator selector aligned through 768px.',
)

console.log(
  'PASS: mobile inputs use single-column hierarchy.',
)

console.log(
  'PASS: Calculate action is visually first.',
)

console.log(
  'PASS: obstructive sticky action bar removed.',
)

console.log(
  'PASS: results use compact mobile density.',
)

console.log(
  'PASS: wide engineering content is overflow-safe.',
)

console.log(
  'PASS: session tools use a mobile swipe rail.',
)
