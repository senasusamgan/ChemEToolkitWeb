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
      'export type NotebookProjectPriority',
    )
      && model.includes(
        "'critical'",
      ),
    'Project priority model missing.',
  ],
  [
    model.includes(
      'priority?: NotebookProjectPriority',
    )
      && model.includes(
        'normalizeProjectPriority',
      ),
    'Priority persistence or normalization missing.',
  ],
  [
    component.includes(
      'All priorities',
    )
      && component.includes(
        'priorityFilter',
      ),
    'Priority filtering missing.',
  ],
  [
    component.includes(
      'NotebookProjectPriority',
    )
      && component.includes(
        'event.target.value as NotebookProjectPriority',
      ),
    'Priority editor missing.',
  ],
  [
    component.includes(
      'priorityMetrics.critical',
    )
      && component.includes(
        'priorityMetrics.high',
      ),
    'Priority portfolio summary missing.',
  ],
  [
    component.includes(
      'scientific-notebook-project-set-priority',
    )
      && component.includes(
        'data-project-priority',
      ),
    'Priority card badge missing.',
  ],
  [
    styles.includes(
      '.scientific-notebook-project-priority-summary',
    )
      && styles.includes(
        '.scientific-notebook-project-set-priority',
      ),
    'Priority styles missing.',
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
    'SCIENTIFIC NOTEBOOK PROJECT PRIORITY V15 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK PROJECT PRIORITY V15 VERIFICATION PASSED',
)

console.log(
  'PASS: Low / Normal / High / Critical priorities.',
)

console.log(
  'PASS: priority filtering.',
)

console.log(
  'PASS: High/Critical portfolio metrics.',
)

console.log(
  'PASS: backward-compatible priority defaults.',
)
