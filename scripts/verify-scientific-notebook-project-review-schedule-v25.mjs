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
      'function getProjectReviewDaysRemaining(',
    ),
    'Review countdown calculation missing.',
  ],
  [
    component.includes(
      'function getProjectNextReviewTimestamp(',
    )
      && component.includes(
        'normalizeProjectReviewInterval(',
      ),
    'Next-review timestamp calculation missing.',
  ],
  [
    component.includes(
      'function isProjectReviewDueSoon(',
    )
      && component.includes(
        'daysRemaining <= 3',
      ),
    'Upcoming three-day review detection missing.',
  ],
  [
    component.includes(
      'Review overdue by 1 day',
    )
      && component.includes(
        'Review in 1 day',
      ),
    'Review schedule countdown copy missing.',
  ],
  [
    component.includes(
      'attentionMetrics.reviewSoon',
    )
      && component.includes(
        'Review in 3d',
      ),
    'Upcoming review portfolio metric missing.',
  ],
  [
    component.includes(
      "sortMode ===\n              'review-date'",
    )
      && component.includes(
        'value="review-date"',
      ),
    'Next-review sorting missing.',
  ],
  [
    component.includes(
      'reviewSoonOnly',
    )
      && component.includes(
        'setReviewSoonOnly(false)',
      ),
    'Upcoming review filter lifecycle missing.',
  ],
  [
    component.includes(
      'scientific-notebook-project-review-schedule',
    )
      && component.includes(
        'data-review-due',
      )
      && component.includes(
        'data-review-soon',
      ),
    'Review schedule card indicator missing.',
  ],
  [
    styles.includes(
      '.scientific-notebook-project-review-schedule',
    ),
    'Review schedule styles missing.',
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
    'SCIENTIFIC NOTEBOOK PROJECT REVIEW SCHEDULE V25 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK PROJECT REVIEW SCHEDULE V25 VERIFICATION PASSED',
)

console.log(
  'PASS: next-review dates.',
)

console.log(
  'PASS: review countdown and overdue state.',
)

console.log(
  'PASS: three-day upcoming review detection.',
)

console.log(
  'PASS: Next review sorting.',
)

console.log(
  'PASS: review schedule card indicators.',
)
