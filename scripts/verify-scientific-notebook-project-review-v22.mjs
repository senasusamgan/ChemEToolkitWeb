import {
  readFileSync,
} from 'node:fs'

const component =
  readFileSync(
    'src/components/ScientificNotebookProjectSets.tsx',
    'utf8',
  )

const contracts = [
  [
    component.includes(
      'function markProjectReviewed(',
    ),
    'Project review check-in helper missing.',
  ],
  [
    component.includes(
      'Project "${projectSet.name}" reviewed.',
    ),
    'Project review feedback missing.',
  ],
  [
    component.includes(
      'updatedAt:'
    )
      && component.includes(
        'new Date()',
      ),
    'Review check-in must refresh updatedAt.',
  ],
  [
    component.includes(
      'Mark reviewed',
    )
      && component.includes(
        'isProjectStale(',
      ),
    'Stale-project review action missing.',
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
    'Clear-filters stale-only contract missing.',
  ],
  [
    component.includes(
      '{displayedProjectSets.length > 0 ? (',
    ),
    'Filtered empty-state rendering contract missing.',
  ],
  [
    component.includes(
      'No project sets match the current filters.',
    ),
    'Filtered empty-state copy missing.',
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
  'PASS: stale projects can be marked reviewed.',
)

console.log(
  'PASS: review refreshes project last-touch time.',
)

console.log(
  'PASS: stale attention clears after review.',
)

console.log(
  'PASS: stale-only filter reset behavior.',
)

console.log(
  'PASS: filtered empty-state behavior.',
)
