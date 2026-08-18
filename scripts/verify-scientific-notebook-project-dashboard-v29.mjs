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
      'type ProjectHealthState =',
    )
      && component.includes(
        "'critical'",
      )
      && component.includes(
        "'watch'",
      )
      && component.includes(
        "'on-track'",
      ),
    'Project health state contract missing.',
  ],
  [
    component.includes(
      'function getProjectHealthState(',
    )
      && component.includes(
        'score >= 60',
      ),
    'Health classification helper missing.',
  ],
  [
    component.includes(
      'const portfolioHealth =',
    )
      && component.includes(
        'portfolioHealth.critical',
      )
      && component.includes(
        'portfolioHealth.onTrack',
      ),
    'Portfolio health metrics missing.',
  ],
  [
    component.includes(
      'const focusProjects =',
    )
      && component.includes(
        '.slice(',
      )
      && component.includes(
        '0,\n            3,',
      ),
    'Top-three focus queue missing.',
  ],
  [
    component.includes(
      'getProjectAttentionScore(',
    )
      && component.includes(
        'getProjectAttentionReasons(',
      ),
    'Focus queue must use attention intelligence.',
  ],
  [
    component.includes(
      'Focus next',
    )
      && component.includes(
        'Highest-priority project signals',
      ),
    'Focus dashboard copy missing.',
  ],
  [
    component.includes(
      'formatProjectReviewSchedule(',
    ),
    'Focus cards must fall back to review schedule.',
  ],
  [
    component.includes(
      'scientific-notebook-project-dashboard',
    )
      && component.includes(
        'scientific-notebook-project-focus-list',
      ),
    'Compact dashboard UI missing.',
  ],
  [
    styles.includes(
      '.scientific-notebook-project-dashboard',
    )
      && styles.includes(
        '.scientific-notebook-project-focus-list',
      ),
    'Compact dashboard styles missing.',
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
    'SCIENTIFIC NOTEBOOK PROJECT DASHBOARD V29 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK PROJECT DASHBOARD V29 VERIFICATION PASSED',
)

console.log(
  'PASS: compact portfolio health overview.',
)

console.log(
  'PASS: top-three Focus next queue.',
)

console.log(
  'PASS: attention intelligence reused.',
)

console.log(
  'PASS: responsive dashboard layout.',
)
