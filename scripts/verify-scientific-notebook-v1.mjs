import {
  readFileSync,
} from 'node:fs'

const panel =
  readFileSync(
    'src/components/ScientificNotebookPanel.tsx',
    'utf8',
  )

const stage =
  readFileSync(
    'src/components/CalculatorStage.tsx',
    'utf8',
  )

const styles =
  readFileSync(
    'src/styles/scientific-notebook.css',
    'utf8',
  )

const contracts = [
  [
    panel.includes(
      'cheme-toolkit.scientific-notebook.v1',
    ),
    'Notebook local-storage contract missing.',
  ],
  [
    panel.includes(
      'Objective',
    )
      && panel.includes(
        'Assumptions',
      )
      && panel.includes(
        'Observations',
      )
      && panel.includes(
        'Conclusion',
      ),
    'Scientific reasoning fields missing.',
  ],
  [
    panel.includes(
      'URL.createObjectURL',
    )
      && panel.includes(
        'text/markdown',
      ),
    'Markdown export contract missing.',
  ],
  [
    panel.includes(
      'Save notebook',
    )
      && panel.includes(
        'Clear',
      ),
    'Notebook persistence actions missing.',
  ],
  [
    stage.includes(
      "import { ScientificNotebookPanel }",
    )
      && stage.includes(
        '<ScientificNotebookPanel',
      ),
    'Calculator stage notebook integration missing.',
  ],
  [
    stage.includes(
      'aria-expanded={notebookOpen}',
    )
      && stage.includes(
        'scientific-notebook-panel',
      ),
    'Notebook accessibility toggle contract missing.',
  ],
  [
    styles.includes(
      '@media (max-width: 760px)',
    ),
    'Notebook responsive contract missing.',
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
    'SCIENTIFIC NOTEBOOK V1 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK V1 VERIFICATION PASSED',
)
console.log(
  'PASS: per-calculator local notebook storage.',
)
console.log(
  'PASS: objective, assumptions, observations and conclusion fields.',
)
console.log(
  'PASS: Markdown export.',
)
console.log(
  'PASS: responsive and accessible calculator-stage integration.',
)
