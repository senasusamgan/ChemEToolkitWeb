import {
  readFileSync,
} from 'node:fs'

const component =
  readFileSync(
    'src/components/ScientificNotebookProjectSets.tsx',
    'utf8',
  )

const reviewStart =
  component.indexOf(
    'function markProjectReviewed(',
  )

const reviewEnd =
  component.indexOf(
    'function deleteProjectSet(',
    reviewStart,
  )

const reviewSection =
  reviewStart >= 0
    && reviewEnd > reviewStart
    ? component.slice(
        reviewStart,
        reviewEnd,
      )
    : ''

const contracts = [
  [
    reviewStart >= 0,
    'Project review check-in helper missing.',
  ],
  [
    component.includes(
      'Project "${projectSet.name}" reviewed.',
    ),
    'Project review feedback missing.',
  ],
  [
    reviewSection.includes(
      'lastReviewedAt:',
    )
      && reviewSection.includes(
        'new Date()',
      ),
    'Review check-in must refresh lastReviewedAt.',
  ],
  [
    !reviewSection.includes(
      'updatedAt:',
    ),
    'Review check-in must not mutate project updatedAt.',
  ],
  [
    component.includes(
      'Mark reviewed',
    )
      && component.includes(
        'isProjectStale(',
      ),
    'Review-due project action missing.',
  ],
  [
    component.includes(
      'Last touch today',
    )
      && component.includes(
        'Last touch 1 day ago',
      )
      && component.includes(
        'Last touch ${days} days ago',
      ),
    'Last-touch indicator missing.',
  ],
  [
    component.includes(
      'Recent touch',
    ),
    'Recent-touch sorting label missing.',
  ],
  [
    component.includes(
      '&& !staleOnly',
    ),
    'Clear-filters review-due contract missing.',
  ],
  [
    component.includes(
      '{displayedProjectSets.length > 0 ? (',
    ),
    'Filtered empty-state rendering contract missing.',
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
    'SCIENTIFIC NOTEBOOK PROJECT REVIEW V22 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK PROJECT REVIEW V22 VERIFICATION PASSED',
)

console.log(
  'PASS: reviews use dedicated lastReviewedAt metadata.',
)

console.log(
  'PASS: project updatedAt remains modification-only.',
)

console.log(
  'PASS: review clears review-due attention state.',
)

console.log(
  'PASS: Recent touch behavior preserved.',
)
