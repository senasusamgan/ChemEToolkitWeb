import {
  readFileSync,
} from 'node:fs'

const styles =
  readFileSync(
    'src/styles/mobile-experience.css',
    'utf8',
  )

const notebook =
  readFileSync(
    'src/styles/scientific-notebook.css',
    'utf8',
  )

const library =
  readFileSync(
    'src/styles/scientific-notebook-library.css',
    'utf8',
  )

const solver =
  readFileSync(
    'src/styles/problem-solver-experience-v7.css',
    'utf8',
  )

const contracts = [
  [
    styles.includes(
      'MOBILE EXPERIENCE FINAL V3',
    ),
    'Final mobile V3 marker missing.',
  ],
  [
    styles.includes(
      '.scientific-notebook,'
    )
      && styles.includes(
        '.scientific-notebook-library',
      ),
    'Notebook mobile surfaces missing.',
  ],
  [
    notebook.includes(
      '.scientific-notebook-grid',
    )
      && styles.includes(
        'font-size: 16px',
      ),
    'Notebook mobile form protection missing.',
  ],
  [
    library.includes(
      '.scientific-notebook-project-dashboard',
    )
      && styles.includes(
        '.scientific-notebook-project-health-overview',
      ),
    'Project dashboard mobile contract missing.',
  ],
  [
    styles.includes(
      '.scientific-notebook-project-portfolio-metrics'
    )
      && styles.includes(
        'scroll-snap-type: x proximity',
      ),
    'Project metrics mobile rail missing.',
  ],
  [
    styles.includes(
      '.scientific-notebook-project-quick-actions'
    )
      && styles.includes(
        'flex-wrap: nowrap',
      ),
    'Project quick-action mobile rail missing.',
  ],
  [
    solver.includes(
      '.problem-solver-v7-section',
    )
      && styles.includes(
        '.problem-solver-v7-guide',
      ),
    'Problem Solver mobile override missing.',
  ],
  [
    styles.includes(
      '.problem-solver-v7-section button[type="submit"]'
    )
      && styles.includes(
        'width: 100%',
      ),
    'Problem Solver primary mobile action missing.',
  ],
  [
    styles.includes(
      '@media (max-width: 430px)',
    ),
    '430px mobile contract missing.',
  ],
  [
    styles.includes(
      '@media (max-width: 390px)',
    ),
    '390px mobile contract missing.',
  ],
  [
    styles.includes(
      '@media (max-width: 375px)',
    ),
    '375px mobile contract missing.',
  ],
  [
    styles.includes(
      'overscroll-behavior-inline: contain',
    ),
    'Horizontal engineering content protection missing.',
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
    'MOBILE EXPERIENCE V3 VERIFICATION FAILED',
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
  'MOBILE EXPERIENCE V3 VERIFICATION PASSED',
)

console.log(
  'PASS: Scientific Notebook mobile layout.',
)

console.log(
  'PASS: Notebook Library mobile density.',
)

console.log(
  'PASS: Project Sets mobile action rails.',
)

console.log(
  'PASS: portfolio metrics mobile rail.',
)

console.log(
  'PASS: Problem Solver mobile hierarchy.',
)

console.log(
  'PASS: 375 / 390 / 430 viewport contracts.',
)
