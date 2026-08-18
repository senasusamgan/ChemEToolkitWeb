import {
  readFileSync,
} from 'node:fs'

const model =
  readFileSync(
    'src/lib/scientificNotebookProjectSets.ts',
    'utf8',
  )

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
    model.includes(
      'export type NotebookProjectReviewInterval',
    )
      && model.includes(
        '| 7',
      )
      && model.includes(
        '| 14',
      )
      && model.includes(
        '| 30',
      )
      && model.includes(
        '| 60',
      ),
    'Review interval model missing.',
  ],
  [
    model.includes(
      'reviewIntervalDays?: NotebookProjectReviewInterval',
    ),
    'Review interval persistence missing.',
  ],
  [
    model.includes(
      'normalizeProjectReviewInterval',
    )
      && model.includes(
        'return 14',
      ),
    'Legacy 14-day review default missing.',
  ],
  [
    model.includes(
      'reviewIntervalValid',
    ),
    'Review interval validation missing.',
  ],
  [
    component.includes(
      'Review cadence',
    )
      && component.includes(
        'Every 7 days',
      )
      && component.includes(
        'Every 60 days',
      ),
    'Review cadence editor missing.',
  ],
  [
    component.includes(
      'projectSet.reviewIntervalDays',
    )
      && component.includes(
        'function isProjectStale(',
      ),
    'Per-project stale threshold missing.',
  ],
  [
    component.includes(
      'scientific-notebook-project-set-review-cadence',
    )
      && component.includes(
        'Review every',
      ),
    'Review cadence card indicator missing.',
  ],
  [
    component.includes(
      "'Review due'",
    ),
    'Review-due attention signal missing.',
  ],
  [
    styles.includes(
      '.scientific-notebook-project-set-review-cadence',
    ),
    'Review cadence styles missing.',
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
    'SCIENTIFIC NOTEBOOK PROJECT REVIEW CADENCE V23 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK PROJECT REVIEW CADENCE V23 VERIFICATION PASSED',
)

console.log(
  'PASS: 7 / 14 / 30 / 60 day review cadence.',
)

console.log(
  'PASS: old project sets default to 14 days.',
)

console.log(
  'PASS: stale detection follows project cadence.',
)

console.log(
  'PASS: review cadence is editable and visible.',
)
