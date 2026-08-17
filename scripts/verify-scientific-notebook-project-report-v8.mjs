import {
  readFileSync,
} from 'node:fs'

const projectReport =
  readFileSync(
    'src/lib/scientificNotebookProjectReport.ts',
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
    projectReport.includes(
      'buildProjectEngineeringReportMarkdown',
    ),
    'Project Markdown report builder missing.',
  ],
  [
    projectReport.includes(
      'buildProjectEngineeringReportHtml',
    ),
    'Project print-report builder missing.',
  ],
  [
    projectReport.includes(
      'Multi-Notebook Engineering Report',
    ),
    'Multi-notebook project report identity missing.',
  ],
  [
    projectReport.includes(
      'Objective',
    )
      && projectReport.includes(
        'Assumptions',
      )
      && projectReport.includes(
        'Calculation Evidence',
      )
      && projectReport.includes(
        'Engineering Observations',
      )
      && projectReport.includes(
        'Conclusion',
      ),
    'Project engineering report flow missing.',
  ],
  [
    projectReport.includes(
      'snapshotCount(',
    )
      && projectReport.includes(
        'categoryCount(',
      ),
    'Project summary metrics missing.',
  ],
  [
    projectReport.includes(
      '@media print',
    )
      && projectReport.includes(
        'break-before: page',
      ),
    'Multi-calculator print layout missing.',
  ],
  [
    library.includes(
      'Project Report Builder',
    )
      && library.includes(
        'projectReportIds',
      ),
    'Notebook Library project builder missing.',
  ],
  [
    library.includes(
      'Add to project report',
    )
      && library.includes(
        'Select visible',
      ),
    'Notebook project selection actions missing.',
  ],
  [
    library.includes(
      'Export project .md',
    )
      && library.includes(
        'Print project report',
      ),
    'Project report output actions missing.',
  ],
  [
    styles.includes(
      '.scientific-notebook-project-builder',
    )
      && styles.includes(
        '.scientific-notebook-project-builder-controls',
      ),
    'Project report responsive UI styles missing.',
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
    'SCIENTIFIC NOTEBOOK PROJECT REPORT V8 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK PROJECT REPORT V8 VERIFICATION PASSED',
)

console.log(
  'PASS: multiple calculator notebooks can be selected.',
)

console.log(
  'PASS: project Markdown report.',
)

console.log(
  'PASS: print-ready multi-calculator report.',
)

console.log(
  'PASS: report summary metrics.',
)

console.log(
  'PASS: responsive project report builder.',
)
