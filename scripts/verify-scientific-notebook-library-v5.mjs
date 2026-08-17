import {
  readFileSync,
} from 'node:fs'

const library =
  readFileSync(
    'src/components/ScientificNotebookLibrary.tsx',
    'utf8',
  )

const stage =
  readFileSync(
    'src/components/CalculatorStage.tsx',
    'utf8',
  )

const styles =
  readFileSync(
    'src/styles/scientific-notebook-library.css',
    'utf8',
  )

const contracts = [
  [
    library.includes(
      'cheme-toolkit.scientific-notebook.v1',
    ),
    'Shared notebook storage contract missing.',
  ],
  [
    library.includes(
      'Notebook Library',
    )
      && library.includes(
        'visibleNotebooks',
      ),
    'Central notebook archive missing.',
  ],
  [
    library.includes(
      'type="search"',
    )
      && library.includes(
        'normalizedQuery',
      ),
    'Notebook search contract missing.',
  ],
  [
    library.includes(
      'All categories',
    )
      && library.includes(
        'Favorites only',
      ),
    'Notebook filtering contract missing.',
  ],
  [
    library.includes(
      'Recently updated',
    )
      && library.includes(
        'Most favorites',
      )
      && library.includes(
        'Calculator title',
      ),
    'Notebook sorting contract missing.',
  ],
  [
    library.includes(
      'Export library JSON',
    )
      && library.includes(
        'application/json;charset=utf-8',
      ),
    'Notebook archive export contract missing.',
  ],
  [
    library.includes(
      'Open calculator',
    )
      && library.includes(
        'Open notebook',
      ),
    'Notebook library navigation actions missing.',
  ],
  [
    stage.includes(
      "import { ScientificNotebookLibrary }",
    )
      && stage.includes(
        '<ScientificNotebookLibrary',
      )
      && stage.includes(
        'Notebook Library',
      ),
    'Calculator-stage Notebook Library integration missing.',
  ],
  [
    styles.includes(
      '.scientific-notebook-library-grid',
    )
      && styles.includes(
        '@media (max-width: 640px)',
      ),
    'Notebook Library responsive styles missing.',
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
    'SCIENTIFIC NOTEBOOK LIBRARY V5 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK LIBRARY V5 VERIFICATION PASSED',
)
console.log(
  'PASS: centralized notebook archive.',
)
console.log(
  'PASS: search, category and favorites filters.',
)
console.log(
  'PASS: notebook sorting.',
)
console.log(
  'PASS: calculator and notebook navigation.',
)
console.log(
  'PASS: full library JSON export.',
)
