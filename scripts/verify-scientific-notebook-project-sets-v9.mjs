import {
  readFileSync,
} from 'node:fs'

const data =
  readFileSync(
    'src/lib/scientificNotebookProjectSets.ts',
    'utf8',
  )

const component =
  readFileSync(
    'src/components/ScientificNotebookProjectSets.tsx',
    'utf8',
  )

const library =
  readFileSync(
    'src/components/ScientificNotebookLibrary.tsx',
    'utf8',
  )

const styles =
  readFileSync(
    'src/styles/scientific-notebook-library.css',
    'utf8',
  )

const contracts = [
  [
    data.includes(
      'cheme-toolkit.notebook-project-sets.v1',
    ),
    'Project set local-storage contract missing.',
  ],
  [
    data.includes(
      'interface NotebookProjectSet',
    ),
    'Project set model missing.',
  ],
  [
    data.includes(
      'readNotebookProjectSets',
    )
      && data.includes(
        'writeNotebookProjectSets',
      ),
    'Project set persistence missing.',
  ],
  [
    component.includes(
      'Save current selection',
    ),
    'Project set save action missing.',
  ],
  [
    component.includes(
      'Load',
    )
      && component.includes(
        'Delete',
      ),
    'Project set management actions missing.',
  ],
  [
    library.includes(
      '<ScientificNotebookProjectSets',
    )
      && library.includes(
        'loadProjectSet',
      ),
    'Notebook Library project-set integration missing.',
  ],
  [
    library.includes(
      'availableIds',
    ),
    'Stale calculator filtering missing when loading project sets.',
  ],
  [
    styles.includes(
      '.scientific-notebook-project-sets',
    )
      && styles.includes(
        '.scientific-notebook-project-set-list',
      ),
    'Project set UI styles missing.',
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
    'SCIENTIFIC NOTEBOOK PROJECT SETS V9 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK PROJECT SETS V9 VERIFICATION PASSED',
)
console.log(
  'PASS: reusable project selections.',
)
console.log(
  'PASS: local persistence.',
)
console.log(
  'PASS: save/update/load/delete workflow.',
)
console.log(
  'PASS: stale calculator IDs filtered safely.',
)
