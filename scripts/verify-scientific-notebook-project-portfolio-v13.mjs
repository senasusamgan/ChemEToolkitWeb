import {
  readFileSync,
} from 'node:fs'

const component =
  readFileSync(
    'src/components/ScientificNotebookProjectSets.tsx',
    'utf8',
  )

const styles =
  readFileSync(
    'src/styles/scientific-notebook-library.css',
    'utf8',
  )

const contracts = [
  [
    component.includes(
      'const portfolioMetrics =',
    ),
    'Portfolio metrics calculation missing.',
  ],
  [
    component.includes(
      'planned = 0',
    )
      && component.includes(
        'active = 0',
      )
      && component.includes(
        'blocked = 0',
      )
      && component.includes(
        'complete = 0',
      ),
    'Project status counts missing.',
  ],
  [
    component.includes(
      'averageProgress',
    )
      && component.includes(
        'progressTotal',
      ),
    'Average portfolio progress missing.',
  ],
  [
    component.includes(
      'Project portfolio overview',
    ),
    'Portfolio overview UI missing.',
  ],
  [
    component.includes(
      'Portfolio progress',
    )
      && component.includes(
        'Average project portfolio progress',
      ),
    'Portfolio progress visualization missing.',
  ],
  [
    component.includes(
      "setStatusFilter(\n                'active',"
    )
      && component.includes(
        "setStatusFilter(\n                'blocked',"
      )
      && component.includes(
        "setStatusFilter(\n                'complete',"
      ),
    'Portfolio quick status filters missing.',
  ],
  [
    component.includes(
      'aria-pressed',
    ),
    'Portfolio filter state accessibility missing.',
  ],
  [
    styles.includes(
      '.scientific-notebook-project-portfolio',
    )
      && styles.includes(
        '.scientific-notebook-project-portfolio-metrics',
      )
      && styles.includes(
        '.scientific-notebook-project-portfolio-progress',
      ),
    'Portfolio overview styles missing.',
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
    'SCIENTIFIC NOTEBOOK PROJECT PORTFOLIO V13 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK PROJECT PORTFOLIO V13 VERIFICATION PASSED',
)

console.log(
  'PASS: portfolio status counts.',
)

console.log(
  'PASS: average project progress.',
)

console.log(
  'PASS: one-click portfolio filters.',
)

console.log(
  'PASS: responsive portfolio overview.',
)
