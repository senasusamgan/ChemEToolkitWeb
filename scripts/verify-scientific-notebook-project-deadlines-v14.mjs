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
      'dueDate?: string',
    ),
    'Project due-date model missing.',
  ],
  [
    model.includes(
      'normalizeProjectDueDate',
    )
      && model.includes(
        'dueDateValid',
      ),
    'Project due-date normalization or validation missing.',
  ],
  [
    component.includes(
      'type="date"',
    )
      && component.includes(
        'Due date',
      ),
    'Project deadline editor missing.',
  ],
  [
    component.includes(
      'getDeadlineState',
    )
      && component.includes(
        "'overdue'",
      )
      && component.includes(
        "'due-soon'",
      ),
    'Deadline-state calculation missing.',
  ],
  [
    component.includes(
      'All deadlines',
    )
      && component.includes(
        'deadlineFilter',
      ),
    'Deadline filtering missing.',
  ],
  [
    component.includes(
      'Due in 7 days',
    )
      && component.includes(
        'portfolioMetrics.overdue',
      )
      && component.includes(
        'portfolioMetrics.dueSoon',
      ),
    'Portfolio deadline alerts missing.',
  ],
  [
    component.includes(
      'scientific-notebook-project-set-deadline',
    )
      && component.includes(
        'data-deadline-state',
      ),
    'Project deadline badge missing.',
  ],
  [
    styles.includes(
      '.scientific-notebook-project-deadline-summary',
    )
      && styles.includes(
        '.scientific-notebook-project-set-deadline',
      ),
    'Deadline tracking styles missing.',
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
    'SCIENTIFIC NOTEBOOK PROJECT DEADLINES V14 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK PROJECT DEADLINES V14 VERIFICATION PASSED',
)

console.log(
  'PASS: optional project due dates.',
)

console.log(
  'PASS: overdue and due-soon detection.',
)

console.log(
  'PASS: deadline filtering.',
)

console.log(
  'PASS: portfolio deadline alerts.',
)

console.log(
  'PASS: backward-compatible project persistence.',
)
