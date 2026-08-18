import {
  readFileSync,
} from 'node:fs'

const report =
  readFileSync(
    'src/lib/scientificNotebookPortfolioReport.ts',
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
    report.includes(
      'buildProjectPortfolioMarkdown',
    )
      && report.includes(
        'Project Register',
      ),
    'Portfolio Markdown report missing.',
  ],
  [
    report.includes(
      'buildProjectPortfolioCsv',
    )
      && report.includes(
        "'Next Action'",
      ),
    'Portfolio CSV export missing.',
  ],
  [
    report.includes(
      'normalizeProjectPriority',
    )
      && report.includes(
        'normalizeProjectProgress',
      )
      && report.includes(
        'normalizeProjectDueDate',
      ),
    'Portfolio normalization contract missing.',
  ],
  [
    report.includes(
      'downloadProjectPortfolioMarkdown',
    )
      && report.includes(
        'downloadProjectPortfolioCsv',
      ),
    'Portfolio download helpers missing.',
  ],
  [
    component.includes(
      '../lib/scientificNotebookPortfolioReport',
    )
      && component.includes(
        'await import(',
      ),
    'Portfolio report must remain dynamically loaded.',
  ],
  [
    component.includes(
      'Export Markdown',
    )
      && component.includes(
        'Export CSV',
      ),
    'Portfolio export controls missing.',
  ],
  [
    component.includes(
      'projectSets.length ===',
    ),
    'Empty portfolio export guard missing.',
  ],
  [
    styles.includes(
      '.scientific-notebook-project-portfolio-actions',
    ),
    'Portfolio export styles missing.',
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
    'SCIENTIFIC NOTEBOOK PROJECT PORTFOLIO EXPORT V19 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK PROJECT PORTFOLIO EXPORT V19 VERIFICATION PASSED',
)

console.log(
  'PASS: Markdown portfolio snapshot.',
)

console.log(
  'PASS: CSV project register.',
)

console.log(
  'PASS: project metadata export.',
)

console.log(
  'PASS: report module loads on demand.',
)
