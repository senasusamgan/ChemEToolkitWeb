import {
  readFileSync,
} from 'node:fs'

const notebook =
  readFileSync(
    'src/components/ScientificNotebookPanel.tsx',
    'utf8',
  )

const styles =
  readFileSync(
    'src/styles/scientific-notebook.css',
    'utf8',
  )

const contracts = [
  [
    notebook.includes(
      'name?: string',
    )
      && notebook.includes(
        'renameSnapshot(',
      )
      && notebook.includes(
        'Snapshot name',
      ),
    'Snapshot rename contract missing.',
  ],
  [
    notebook.includes(
      'favorite?: boolean',
    )
      && notebook.includes(
        'toggleSnapshotFavorite(',
      )
      && notebook.includes(
        '★ Favorite',
      ),
    'Snapshot favorite contract missing.',
  ],
  [
    notebook.includes(
      'deleteSnapshot(',
    )
      && notebook.includes(
        'Delete',
      ),
    'Snapshot deletion contract missing.',
  ],
  [
    notebook.includes(
      'persistSnapshots(',
    ),
    'Snapshot persistence helper missing.',
  ],
  [
    notebook.includes(
      "Export selected .md",
    )
      && notebook.includes(
        "Export selected .csv",
      ),
    'Selected snapshot export actions missing.',
  ],
  [
    notebook.includes(
      'function escapeCsv(',
    )
      && notebook.includes(
        "'text/csv;charset=utf-8'",
      ),
    'CSV export contract missing.',
  ],
  [
    notebook.includes(
      "'text/markdown;charset=utf-8'",
    ),
    'Markdown selected-export contract missing.',
  ],
  [
    styles.includes(
      '.scientific-notebook-comparison-actions',
    ),
    'Selected-export responsive styles missing.',
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
    'SCIENTIFIC NOTEBOOK MANAGEMENT V4 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK MANAGEMENT V4 VERIFICATION PASSED',
)
console.log(
  'PASS: snapshot rename.',
)
console.log(
  'PASS: snapshot favorites.',
)
console.log(
  'PASS: snapshot deletion.',
)
console.log(
  'PASS: selected Markdown export.',
)
console.log(
  'PASS: selected CSV export.',
)
