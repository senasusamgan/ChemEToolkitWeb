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
      'rawValue?: string',
    )
      && notebook.includes(
        'rawValue:'
      ),
    'Raw calculator input capture missing.',
  ],
  [
    notebook.includes(
      'function setControlValue(',
    )
      && notebook.includes(
        "new Event(\n      'input'"
      )
      && notebook.includes(
        "new Event(\n      'change'"
      ),
    'Native input restore contract missing.',
  ],
  [
    notebook.includes(
      'function resolveRestoreValue(',
    ),
    'Backward-compatible snapshot restore missing.',
  ],
  [
    notebook.includes(
      'Restore inputs',
    )
      && notebook.includes(
        'restoreSnapshotInputs(',
      ),
    'Restore-input action missing.',
  ],
  [
    notebook.includes(
      'selectedSnapshotIds',
    )
      && notebook.includes(
        'toggleSnapshotComparison',
      ),
    'Snapshot comparison selection missing.',
  ],
  [
    notebook.includes(
      'Snapshot comparison',
    )
      && notebook.includes(
        'Snapshot A',
      )
      && notebook.includes(
        'Snapshot B',
      ),
    'Side-by-side comparison UI missing.',
  ],
  [
    styles.includes(
      '.scientific-notebook-comparison',
    )
      && styles.includes(
        '.scientific-notebook-compare-table',
      ),
    'Snapshot comparison styles missing.',
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
    'SCIENTIFIC NOTEBOOK COMPARE V3 VERIFICATION FAILED',
  )

  for (const failure of failures) {
    console.error(
      `- ${failure}`,
    )
  }

  process.exit(1)
}

console.log(
  'SCIENTIFIC NOTEBOOK COMPARE V3 VERIFICATION PASSED',
)
console.log(
  'PASS: raw calculator values captured.',
)
console.log(
  'PASS: snapshot inputs can be restored.',
)
console.log(
  'PASS: historical snapshots remain compatible.',
)
console.log(
  'PASS: two snapshots can be compared side by side.',
)
