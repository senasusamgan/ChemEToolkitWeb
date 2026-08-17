import {
  readFileSync,
} from 'node:fs'

const library =
  readFileSync(
    'src/components/ScientificNotebookLibrary.tsx',
    'utf8',
  )

const projectSets =
  readFileSync(
    'src/lib/scientificNotebookProjectSets.ts',
    'utf8',
  )

const contracts = [
  [
    library.includes(
      'version: 1 | 2',
    )
      && library.includes(
        'version:\n          2',
      ),
    'Workspace archive version 2 contract missing.',
  ],
  [
    library.includes(
      'projectSets?: NotebookProjectSet[]',
    ),
    'Project Sets archive model missing.',
  ],
  [
    library.includes(
      'projectSets,',
    )
      && library.includes(
        'Workspace backup exported',
      ),
    'Project Sets backup export missing.',
  ],
  [
    library.includes(
      'isProjectSet',
    )
      && library.includes(
        'Invalid ChemE Toolkit project set archive.',
      ),
    'Project Set archive validation missing.',
  ],
  [
    projectSets.includes(
      'export function isProjectSet(',
    ),
    'Reusable Project Set validator missing.',
  ],
  [
    projectSets.includes(
      'export function mergeNotebookProjectSets(',
    ),
    'Project Set merge helper missing.',
  ],
  [
    library.includes(
      'mergeNotebookProjectSets(',
    )
      && library.includes(
        'writeNotebookProjectSets(',
      ),
    'Project Set restore persistence missing.',
  ],
  [
    library.includes(
      'Existing project sets preserved from this legacy v1 backup.',
    ),
    'Legacy v1 backup compatibility missing.',
  ],
  [
    library.includes(
      "archive.projectSets !==\n        undefined",
    ),
    'Optional Project Set archive handling missing.',
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
    'SCIENTIFIC NOTEBOOK WORKSPACE BACKUP V10 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK WORKSPACE BACKUP V10 VERIFICATION PASSED',
)

console.log(
  'PASS: workspace archive v2.',
)

console.log(
  'PASS: notebooks + project sets exported together.',
)

console.log(
  'PASS: merge/replace restores project sets.',
)

console.log(
  'PASS: legacy v1 backups remain compatible.',
)
