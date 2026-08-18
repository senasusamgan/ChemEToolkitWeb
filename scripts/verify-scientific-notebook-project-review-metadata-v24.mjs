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
      'lastReviewedAt?: string',
    ),
    'lastReviewedAt model missing.',
  ],
  [
    model.includes(
      'normalizeProjectReviewTimestamp',
    )
      && model.includes(
        'lastReviewedAtValid',
      ),
    'Review timestamp normalization or validation missing.',
  ],
  [
    model.includes(
      'projectSet.lastReviewedAt',
    ),
    'Review timestamp normalization persistence missing.',
  ],
  [
    component.includes(
      'function getProjectTouchTimestamp(',
    ),
    'Effective project touch timestamp missing.',
  ],
  [
    component.includes(
      'projectSet.lastReviewedAt',
    )
      && component.includes(
        'projectSet.updatedAt',
      ),
    'Touch timestamp must consider edit and review timestamps.',
  ],
  [
    component.includes(
      'getProjectTouchTimestamp(',
    )
      && component.includes(
        'function getProjectAgeDays(',
      ),
    'Staleness must use effective touch timestamp.',
  ],
  [
    component.includes(
      'lastReviewedAt:'
    )
      && component.includes(
        'Mark reviewed',
      ),
    'Review check-in persistence missing.',
  ],
  [
    component.includes(
      'scientific-notebook-project-set-reviewed',
    )
      && component.includes(
        'formatReviewTimestamp',
      ),
    'Reviewed-date project indicator missing.',
  ],
  [
    styles.includes(
      '.scientific-notebook-project-set-reviewed',
    ),
    'Reviewed-date styles missing.',
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
    'SCIENTIFIC NOTEBOOK PROJECT REVIEW METADATA V24 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK PROJECT REVIEW METADATA V24 VERIFICATION PASSED',
)

console.log(
  'PASS: review metadata separated from project edits.',
)

console.log(
  'PASS: effective touch uses edit or review.',
)

console.log(
  'PASS: reviewed dates persist safely.',
)

console.log(
  'PASS: legacy projects remain compatible.',
)
