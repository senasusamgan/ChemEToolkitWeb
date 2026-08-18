import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
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

const failures = []

if (
  typeof release !==
  'string'
) {
  failures.push(
    'verify:release script missing.',
  )
}

const releaseSteps =
  typeof release ===
    'string'
    ? release
        .split(
          ' && ',
        )
        .map(
          (step) =>
            step.trim(),
        )
        .filter(Boolean)
    : []

const notebookSteps =
  releaseSteps.filter(
    (step) =>
      step.startsWith(
        'npm run verify:scientific-notebook',
      ),
  )

if (
  notebookSteps.length <
  30
) {
  failures.push(
    `Expected at least 30 Scientific Notebook release gates, found ${notebookSteps.length}.`,
  )
}

if (
  releaseSteps[
    releaseSteps.length
    - 1
  ] !==
    'npm run verify:verified-calculator-copy'
) {
  failures.push(
    'verified-calculator-copy is not the final release gate.',
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
    'Scientific Notebook regression v30 is not immediately before the final release gate.',
  )
}

const requiredFiles = [
  'src/components/ScientificNotebookLibrary.tsx',
  'src/components/ScientificNotebookProjectSets.tsx',
  'src/lib/scientificNotebookProjectSets.ts',
  'src/lib/scientificNotebookPortfolioReport.ts',
  'src/lib/scientificNotebookReviewCalendar.ts',
  'src/styles/scientific-notebook-library.css',
  'tests/scientific-notebook-regression-v30/project-set-integrity.test.ts',
  'scripts/verify-scientific-notebook-release-contract-v30.mjs',
  'docs/SCIENTIFIC_NOTEBOOK_V2_RELEASE.md',
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
      `Required release file missing: ${file}`,
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

const reports =
  readFileSync(
    'src/lib/scientificNotebookPortfolioReport.ts',
    'utf8',
  )

const calendar =
  readFileSync(
    'src/lib/scientificNotebookReviewCalendar.ts',
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
    'Project Sets lazy-loading boundary missing.',
  )
}

if (
  !projectSets.includes(
    "await import(\n        '../lib/scientificNotebookPortfolioReport'",
  )
) {
  failures.push(
    'Portfolio reports are not dynamically loaded.',
  )
}

if (
  !projectSets.includes(
    "await import(\n        '../lib/scientificNotebookReviewCalendar'",
  )
) {
  failures.push(
    'Review calendar is not dynamically loaded.',
  )
}

if (
  !model.includes(
    "'cheme-toolkit.notebook-project-sets.v1'",
  )
) {
  failures.push(
    'Project Set storage compatibility key changed.',
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
    'Review metadata model missing.',
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
    'Review-aware merge/activity model missing.',
  )
}

if (
  !reports.includes(
    "'Review Cadence Days'",
  )
  || !reports.includes(
    "'Last Reviewed At'",
  )
  || !reports.includes(
    "'Next Review At'",
  )
) {
  failures.push(
    'Review-aware portfolio export contract missing.',
  )
}

if (
  !calendar.includes(
    'BEGIN:VCALENDAR',
  )
  || !calendar.includes(
    'DTSTART;VALUE=DATE:',
  )
) {
  failures.push(
    'iCalendar review export contract missing.',
  )
}

if (
  !projectSets.includes(
    'scientific-notebook-project-dashboard',
  )
  || !projectSets.includes(
    'Focus next',
  )
) {
  failures.push(
    'Portfolio dashboard contract missing.',
  )
}

if (
  existsSync(
    'public/legacy',
  )
) {
  failures.push(
    'Legacy public runtime directory exists.',
  )
}

if (
  failures.length
) {
  console.error(
    'SCIENTIFIC NOTEBOOK V2 FINAL AUDIT FAILED',
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

mkdirSync(
  'audit-reports',
  {
    recursive:
      true,
  },
)

const report = [
  '# Scientific Notebook v2 Final Audit',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '## Result',
  '',
  '**PASS — Scientific Notebook v2 production contracts are satisfied.**',
  '',
  '## Release contracts',
  '',
  `- Scientific Notebook gates in verify:release: ${notebookSteps.length}`,
  '- Behavioral regression v30: registered',
  '- verified-calculator-copy: final release step',
  '- Project Sets lazy loading: preserved',
  '- Portfolio report dynamic import: preserved',
  '- Review calendar dynamic import: preserved',
  '- Project Set storage key: preserved',
  '- Review cadence metadata: preserved',
  '- Dedicated review timestamps: preserved',
  '- Review-aware merge behavior: present',
  '- Review-aware portfolio reporting: present',
  '- iCalendar review export: present',
  '- Portfolio health dashboard: present',
  '- Legacy public runtime: absent',
  '',
  '## Production release',
  '',
  'The Phase 55 workflow runs the complete npm verify:release pipeline before this final audit is accepted.',
  '',
  '## Closure',
  '',
  'Scientific Notebook v2 numbered implementation phases are complete.',
  '',
]

writeFileSync(
  'audit-reports/scientific-notebook-v2-final-audit.md',
  report.join(
    '\n',
  ),
)

console.log(
  'SCIENTIFIC NOTEBOOK V2 FINAL AUDIT PASSED',
)

console.log(
  `PASS: ${notebookSteps.length} Scientific Notebook release gates.`,
)

console.log(
  'PASS: final release ordering protected.',
)

console.log(
  'PASS: lazy-loading boundaries protected.',
)

console.log(
  'PASS: review data integrity protected.',
)

console.log(
  'PASS: reporting and calendar contracts protected.',
)

console.log(
  'PASS: legacy runtime remains removed.',
)

console.log(
  'PASS: final audit report generated.',
)
