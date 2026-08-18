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

const contracts = [
  [
    report.includes(
      'buildProjectPortfolioHtml',
    ),
    'Printable portfolio HTML builder missing.',
  ],
  [
    report.includes(
      'Project Portfolio Report',
    )
      && report.includes(
        'Project Register',
      )
      && report.includes(
        'Project Details',
      ),
    'Printable portfolio report structure missing.',
  ],
  [
    report.includes(
      '@media print',
    )
      && report.includes(
        'break-inside: avoid',
      ),
    'Print stylesheet contract missing.',
  ],
  [
    report.includes(
      'normalizeProjectPriority',
    )
      && report.includes(
        'normalizeProjectDueDate',
      )
      && report.includes(
        'projectProgress',
      ),
    'Printable report project metadata missing.',
  ],
  [
    component.includes(
      'async function printPortfolioReport()',
    )
      && component.includes(
        "window.open(",
      ),
    'Portfolio print workflow missing.',
  ],
  [
    component.includes(
      "await import(\n          '../lib/scientificNotebookPortfolioReport'"
    ),
    'Printable report must remain dynamically loaded.',
  ],
  [
    component.includes(
      'Print / PDF',
    ),
    'Print / PDF control missing.',
  ],
  [
    component.includes(
      'printWindow.print()',
    ),
    'Browser print invocation missing.',
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
    'SCIENTIFIC NOTEBOOK PROJECT PORTFOLIO PRINT V20 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK PROJECT PORTFOLIO PRINT V20 VERIFICATION PASSED',
)

console.log(
  'PASS: print-ready portfolio report.',
)

console.log(
  'PASS: browser Print / Save as PDF flow.',
)

console.log(
  'PASS: project register and detailed records.',
)

console.log(
  'PASS: report remains dynamically loaded.',
)
