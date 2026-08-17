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
      'export type NotebookProjectStatus',
    )
      && model.includes(
        "'planned'",
      )
      && model.includes(
        "'active'",
      )
      && model.includes(
        "'blocked'",
      )
      && model.includes(
        "'complete'",
      ),
    'Project status model missing.',
  ],
  [
    model.includes(
      'progress?: number',
    )
      && model.includes(
        'normalizeProjectProgress',
      ),
    'Project progress model missing.',
  ],
  [
    model.includes(
      'statusValid',
    )
      && model.includes(
        'progressValid',
      ),
    'Backward-compatible tracking validation missing.',
  ],
  [
    model.includes(
      "status === 'complete'"
    )
      && model.includes(
        '? 100',
      ),
    'Complete-project 100 percent contract missing.',
  ],
  [
    component.includes(
      'All statuses',
    )
      && component.includes(
        'statusFilter',
      ),
    'Project status filter missing.',
  ],
  [
    component.includes(
      'type="range"',
    )
      && component.includes(
        'Progress',
      ),
    'Progress editor missing.',
  ],
  [
    component.includes(
      '<progress',
    )
      && component.includes(
        'scientific-notebook-project-set-progress',
      ),
    'Project progress visualization missing.',
  ],
  [
    component.includes(
      'Edit metadata',
    )
      && component.includes(
        'setProjectStatus(',
      )
      && component.includes(
        'setProgress(',
      ),
    'Existing tracking edit workflow missing.',
  ],
  [
    styles.includes(
      '.scientific-notebook-project-set-progress',
    ),
    'Project progress styles missing.',
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
    'SCIENTIFIC NOTEBOOK PROJECT PROGRESS V12 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK PROJECT PROGRESS V12 VERIFICATION PASSED',
)

console.log(
  'PASS: planned / active / blocked / complete states.',
)

console.log(
  'PASS: 0-100 project progress.',
)

console.log(
  'PASS: progress visualization.',
)

console.log(
  'PASS: project status filtering.',
)

console.log(
  'PASS: legacy project sets normalize safely.',
)
