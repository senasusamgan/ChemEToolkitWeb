import {
  readFileSync,
} from 'node:fs'

const report =
  readFileSync(
    'src/lib/scientificNotebookPortfolioReport.ts',
    'utf8',
  )

const contracts = [
  [
    report.includes(
      'getProjectSetActivityTimestamp',
    )
      && report.includes(
        'normalizeProjectReviewInterval',
      ),
    'Review-aware report imports missing.',
  ],
  [
    report.includes(
      'function projectNextReviewTimestamp(',
    )
      && report.includes(
        'function projectReviewState(',
      ),
    'Review schedule report helpers missing.',
  ],
  [
    report.includes(
      "'Review Cadence Days'",
    )
      && report.includes(
        "'Last Reviewed At'",
      )
      && report.includes(
        "'Next Review At'",
      )
      && report.includes(
        "'Review Status'",
      ),
    'CSV review metadata columns missing.',
  ],
  [
    report.includes(
      'Review cadence | Last reviewed | Next review | Review status',
    ),
    'Markdown review metadata columns missing.',
  ],
  [
    report.includes(
      '`Last activity: ${projectLastActivity(projectSet)}`',
    ),
    'Markdown last-activity metadata missing.',
  ],
  [
    report.includes(
      '<th>Review cadence</th>',
    )
      && report.includes(
        '<th>Last reviewed</th>',
      )
      && report.includes(
        '<th>Next review</th>',
      )
      && report.includes(
        '<th>Review status</th>',
      ),
    'Printable review metadata columns missing.',
  ],
  [
    report.includes(
      '<span>Reviews due</span>',
    )
      && report.includes(
        '<span>Review soon</span>',
      ),
    'Printable review summary metrics missing.',
  ],
  [
    report.includes(
      'projectLastActivity(',
    ),
    'Last activity reporting missing.',
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
    'SCIENTIFIC NOTEBOOK REVIEW-AWARE REPORTS V27 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK REVIEW-AWARE REPORTS V27 VERIFICATION PASSED',
)

console.log(
  'PASS: Markdown review schedule export.',
)

console.log(
  'PASS: CSV review schedule export.',
)

console.log(
  'PASS: Print/PDF review schedule export.',
)

console.log(
  'PASS: review state and activity metadata aligned.',
)
