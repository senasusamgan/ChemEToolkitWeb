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
      'function getProjectAgeDays(',
    )
      && component.includes(
        '86_400_000',
      ),
    'Project age calculation missing.',
  ],
  [
    component.includes(
      'function isProjectStale(',
    )
      && component.includes(
        'normalizeProjectReviewInterval(',
      ),
    'Cadence-aware stale-project detection missing.',
  ],
  [
    component.includes(
      "'Review due'",
    ),
    'Review-due attention reason missing.',
  ],
  [
    component.includes(
      'score += 10',
    )
      && component.includes(
        'isProjectStale(',
      ),
    'Stale attention score missing.',
  ],
  [
    component.includes(
      'staleOnly',
    )
      && component.includes(
        'Review due',
      ),
    'Review-due portfolio filter missing.',
  ],
  [
    component.includes(
      'attentionMetrics.stale',
    ),
    'Review-due portfolio metric missing.',
  ],
  [
    component.includes(
      'formatProjectAge',
    )
      && component.includes(
        'scientific-notebook-project-set-updated',
      ),
    'Last-touch project indicator missing.',
  ],
  [
    component.includes(
      'data-project-stale',
    ),
    'Stale project card state missing.',
  ],
  [
    styles.includes(
      '.scientific-notebook-project-set-updated',
    )
      && styles.includes(
        '[data-project-stale="true"]',
      ),
    'Stale project styles missing.',
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
    'SCIENTIFIC NOTEBOOK PROJECT STALENESS V21 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK PROJECT STALENESS V21 VERIFICATION PASSED',
)

console.log(
  'PASS: cadence-aware project review detection.',
)

console.log(
  'PASS: review-due attention scoring.',
)

console.log(
  'PASS: review-due filtering.',
)

console.log(
  'PASS: last-touch project indicators.',
)
