import {
  readFileSync,
} from 'node:fs'

const report =
  readFileSync(
    'src/lib/scientificNotebookReport.ts',
    'utf8',
  )

const library =
  readFileSync(
    'src/components/ScientificNotebookLibrary.tsx',
    'utf8',
  )

const contracts = [
  [
    report.includes(
      'buildNotebookEngineeringReportMarkdown',
    ),
    'Markdown report builder missing.',
  ],
  [
    report.includes(
      'buildNotebookEngineeringReportHtml',
    ),
    'Print-ready HTML report builder missing.',
  ],
  [
    report.includes(
      '## 1. Objective',
    )
      && report.includes(
        '## 2. Assumptions',
      )
      && report.includes(
        '## 3. Calculation Record',
      )
      && report.includes(
        '## 4. Engineering Observations',
      )
      && report.includes(
        '## 5. Conclusion',
      ),
    'Engineering report section flow missing.',
  ],
  [
    report.includes(
      '#### Inputs',
    )
      && report.includes(
        '#### Formula / Model',
      )
      && report.includes(
        '#### Results',
      )
      && report.includes(
        '#### Reference',
      ),
    'Calculation evidence sections missing.',
  ],
  [
    report.includes(
      'function escapeHtml(',
    ),
    'Print-report HTML escaping missing.',
  ],
  [
    report.includes(
      "@media print",
    ),
    'Print stylesheet contract missing.',
  ],
  [
    report.includes(
      "'text/markdown;charset=utf-8'",
    ),
    'Markdown report download missing.',
  ],
  [
    report.includes(
      "'text/html;charset=utf-8'",
    )
      && report.includes(
        'reportWindow.print()',
      ),
    'Print-preview contract missing.',
  ],
  [
    library.includes(
      'Export report .md',
    )
      && library.includes(
        'Print report',
      ),
    'Notebook Library report actions missing.',
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
    'SCIENTIFIC NOTEBOOK REPORT V7 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK REPORT V7 VERIFICATION PASSED',
)
console.log(
  'PASS: structured engineering report.',
)
console.log(
  'PASS: calculation inputs, formula, results and references.',
)
console.log(
  'PASS: Markdown export.',
)
console.log(
  'PASS: print-ready HTML report.',
)
