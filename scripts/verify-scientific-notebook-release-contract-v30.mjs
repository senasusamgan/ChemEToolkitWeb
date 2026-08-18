import {
  existsSync,
  readFileSync,
} from 'node:fs'

const packageJson =
  JSON.parse(
    readFileSync(
      'package.json',
      'utf8',
    ),
  )

const scripts =
  packageJson.scripts
  ?? {}

const release =
  scripts[
    'verify:release'
  ]

if (
  typeof release !==
  'string'
) {
  console.error(
    'SCIENTIFIC NOTEBOOK RELEASE CONTRACT V30 VERIFICATION FAILED',
  )

  console.error(
    '- verify:release script missing.',
  )

  process.exit(1)
}

const releaseSteps =
  release
    .split(
      ' && ',
    )
    .map(
      (step) =>
        step.trim(),
    )
    .filter(Boolean)

const notebookVerifiers = [
  'verify:scientific-notebook-v1',
  'verify:scientific-notebook-snapshot-v2',
  'verify:scientific-notebook-compare-v3',
  'verify:scientific-notebook-management-v4',
  'verify:scientific-notebook-library-v5',
  'verify:scientific-notebook-restore-v6',
  'verify:scientific-notebook-report-v7',
  'verify:scientific-notebook-project-report-v8',
  'verify:scientific-notebook-project-sets-v9',
  'verify:scientific-notebook-workspace-backup-v10',
  'verify:scientific-notebook-project-discovery-v11',
  'verify:scientific-notebook-project-progress-v12',
  'verify:scientific-notebook-project-portfolio-v13',
  'verify:scientific-notebook-project-deadlines-v14',
  'verify:scientific-notebook-project-priority-v15',
  'verify:scientific-notebook-project-attention-v16',
  'verify:scientific-notebook-project-quick-updates-v17',
  'verify:scientific-notebook-project-next-action-v18',
  'verify:scientific-notebook-project-portfolio-export-v19',
  'verify:scientific-notebook-project-portfolio-print-v20',
  'verify:scientific-notebook-project-staleness-v21',
  'verify:scientific-notebook-project-review-v22',
  'verify:scientific-notebook-project-review-cadence-v23',
  'verify:scientific-notebook-project-review-metadata-v24',
  'verify:scientific-notebook-project-review-schedule-v25',
  'verify:scientific-notebook-review-aware-merge-v26',
  'verify:scientific-notebook-review-aware-reports-v27',
  'verify:scientific-notebook-review-calendar-v28',
  'verify:scientific-notebook-project-dashboard-v29',
  'verify:scientific-notebook-regression-v30',
]

const failures = []

let previousIndex =
  -1

for (
  const verifier
  of notebookVerifiers
) {
  if (
    typeof scripts[
      verifier
    ] !==
    'string'
  ) {
    failures.push(
      `${verifier} package script missing.`,
    )

    continue
  }

  const command =
    `npm run ${verifier}`

  const positions =
    releaseSteps
      .map(
        (
          step,
          index,
        ) =>
          step ===
            command
            ? index
            : -1,
      )
      .filter(
        (index) =>
          index >= 0,
      )

  if (
    positions.length !==
    1
  ) {
    failures.push(
      `${verifier} must appear exactly once in verify:release.`,
    )

    continue
  }

  const index =
    positions[0]

  if (
    index <=
    previousIndex
  ) {
    failures.push(
      `${verifier} is out of Scientific Notebook release order.`,
    )
  }

  previousIndex =
    index
}

const finalVerifier =
  'npm run verify:verified-calculator-copy'

if (
  releaseSteps[
    releaseSteps.length
    - 1
  ] !==
    finalVerifier
) {
  failures.push(
    'verify:verified-calculator-copy must remain the final release step.',
  )
}

if (
  releaseSteps[
    releaseSteps.length
    - 2
  ] !==
    'npm run verify:scientific-notebook-regression-v30'
) {
  failures.push(
    'Scientific Notebook v30 regression gate must run immediately before the final verified-calculator-copy gate.',
  )
}

const notebookReleaseSteps =
  releaseSteps.filter(
    (step) =>
      step.includes(
        'scientific-notebook',
      ),
  )

if (
  new Set(
    notebookReleaseSteps,
  ).size !==
    notebookReleaseSteps.length
) {
  failures.push(
    'Duplicate Scientific Notebook release steps detected.',
  )
}

const requiredFiles = [
  'src/components/ScientificNotebookLibrary.tsx',
  'src/components/ScientificNotebookProjectSets.tsx',
  'src/lib/scientificNotebookProjectSets.ts',
  'src/lib/scientificNotebookPortfolioReport.ts',
  'src/lib/scientificNotebookReviewCalendar.ts',
  'src/styles/scientific-notebook-library.css',
]

for (
  const file
  of requiredFiles
) {
  if (
    !existsSync(
      file,
    )
  ) {
    failures.push(
      `Required Scientific Notebook file missing: ${file}`,
    )
  }
}

const library =
  readFileSync(
    'src/components/ScientificNotebookLibrary.tsx',
    'utf8',
  )

const projectSets =
  readFileSync(
    'src/components/ScientificNotebookProjectSets.tsx',
    'utf8',
  )

const model =
  readFileSync(
    'src/lib/scientificNotebookProjectSets.ts',
    'utf8',
  )

if (
  !library.includes(
    'lazy(',
  )
  || !library.includes(
    "'./ScientificNotebookProjectSets'",
  )
) {
  failures.push(
    'ScientificNotebookProjectSets must remain lazy-loaded from the Notebook Library.',
  )
}

if (
  !projectSets.includes(
    "await import(\n        '../lib/scientificNotebookPortfolioReport'",
  )
) {
  failures.push(
    'Portfolio report module must remain dynamically loaded.',
  )
}

if (
  !projectSets.includes(
    "await import(\n        '../lib/scientificNotebookReviewCalendar'",
  )
) {
  failures.push(
    'Review calendar module must remain dynamically loaded.',
  )
}

if (
  projectSets.includes(
    "from '../lib/scientificNotebookPortfolioReport'",
  )
) {
  failures.push(
    'Portfolio report module must not become a static Project Sets import.',
  )
}

if (
  projectSets.includes(
    "from '../lib/scientificNotebookReviewCalendar'",
  )
) {
  failures.push(
    'Review calendar module must not become a static Project Sets import.',
  )
}

if (
  !model.includes(
    "'cheme-toolkit.notebook-project-sets.v1'",
  )
) {
  failures.push(
    'Project Set storage compatibility key changed unexpectedly.',
  )
}

if (
  !model.includes(
    'lastReviewedAt?: string',
  )
  || !model.includes(
    'reviewIntervalDays?: NotebookProjectReviewInterval',
  )
) {
  failures.push(
    'Review metadata persistence contract missing.',
  )
}

if (
  !model.includes(
    'getProjectSetActivityTimestamp',
  )
  || !model.includes(
    'mergeNotebookProjectSets',
  )
) {
  failures.push(
    'Review-aware activity or merge contract missing.',
  )
}

if (
  existsSync(
    'public/legacy',
  )
) {
  failures.push(
    'Legacy public runtime directory must remain removed.',
  )
}

if (
  failures.length
) {
  console.error(
    'SCIENTIFIC NOTEBOOK RELEASE CONTRACT V30 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK RELEASE CONTRACT V30 VERIFICATION PASSED',
)

console.log(
  `PASS: ${notebookVerifiers.length} Scientific Notebook verifier generations registered exactly once and in order.`,
)

console.log(
  'PASS: verified-calculator-copy remains final.',
)

console.log(
  'PASS: Project Sets remains lazy-loaded.',
)

console.log(
  'PASS: report and calendar modules remain dynamically loaded.',
)

console.log(
  'PASS: review metadata and storage compatibility preserved.',
)

console.log(
  'PASS: legacy runtime remains removed.',
)
