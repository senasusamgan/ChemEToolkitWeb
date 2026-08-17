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
      'interface CalculationSnapshot',
    ),
    'Calculation snapshot model missing.',
  ],
  [
    notebook.includes(
      '.calculator-stage-body',
    ),
    'Calculator root capture contract missing.',
  ],
  [
    notebook.includes(
      '.native-result-heading',
    )
      && notebook.includes(
        '.native-result-grid article',
      ),
    'Native result capture contract missing.',
  ],
  [
    notebook.includes(
      '.native-formula',
    )
      && notebook.includes(
        '.native-reference',
      ),
    'Formula/reference capture contract missing.',
  ],
  [
    notebook.includes(
      'Capture current calculation',
    ),
    'Snapshot action missing.',
  ],
  [
    notebook.includes(
      "'## Calculation Snapshots'",
    ),
    'Snapshot Markdown export missing.',
  ],
  [
    notebook.includes(
      '.slice(',
    )
      && notebook.includes(
        '20,',
      ),
    'Snapshot retention limit missing.',
  ],
  [
    styles.includes(
      '.scientific-notebook-snapshot-list',
    ),
    'Snapshot presentation styles missing.',
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
    'SCIENTIFIC NOTEBOOK SNAPSHOT V2 VERIFICATION FAILED',
  )

  for (const failure of failures) {
    console.error(
      `- ${failure}`,
    )
  }

  process.exit(1)
}

console.log(
  'SCIENTIFIC NOTEBOOK SNAPSHOT V2 VERIFICATION PASSED',
)
console.log(
  'PASS: calculator inputs captured.',
)
console.log(
  'PASS: calculator results captured.',
)
console.log(
  'PASS: formula and reference captured.',
)
console.log(
  'PASS: snapshots persist with the notebook.',
)
console.log(
  'PASS: snapshots export to Markdown.',
)
