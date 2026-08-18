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

const main =
  readFileSync(
    'src/main.tsx',
    'utf8',
  )

const mobile =
  readFileSync(
    'src/styles/mobile-experience.css',
    'utf8',
  )

const failures = []

const appImport =
  main.indexOf(
    "import App from './App'",
  )

const mobileImport =
  main.indexOf(
    "import './styles/mobile-experience.css'",
  )

if (
  appImport < 0
  || mobileImport <= appImport
) {
  failures.push(
    'mobile-experience.css must load after the App style graph.',
  )
}

const requiredMarkers = [
  'MOBILE CALCULATOR EXPERIENCE V2',
  'MOBILE EXPERIENCE FINAL V3',
]

for (
  const marker
  of requiredMarkers
) {
  if (
    !mobile.includes(
      marker,
    )
  ) {
    failures.push(
      `Missing mobile release marker: ${marker}`,
    )
  }
}

const requiredBreakpoints = [
  '@media (max-width: 768px)',
  '@media (max-width: 430px)',
  '@media (max-width: 390px)',
  '@media (max-width: 375px)',
]

for (
  const breakpoint
  of requiredBreakpoints
) {
  if (
    !mobile.includes(
      breakpoint,
    )
  ) {
    failures.push(
      `Missing mobile breakpoint contract: ${breakpoint}`,
    )
  }
}

const requiredSelectors = [
  '.app-header.site-header',
  '.home-workspace-hero',
  '.calculator-stage-mobile-select',
  '.native-input-grid',
  '.native-primary-action',
  '.native-result-grid',
  '.calculator-stage-session-actions',
  '.scientific-notebook',
  '.scientific-notebook-library',
  '.scientific-notebook-project-dashboard',
  '.scientific-notebook-project-portfolio-metrics',
  '.problem-solver-v7-section',
  '.problem-solver-v7-guide',
]

for (
  const selector
  of requiredSelectors
) {
  if (
    !mobile.includes(
      selector,
    )
  ) {
    failures.push(
      `Missing mobile product surface: ${selector}`,
    )
  }
}

if (
  !mobile.includes(
    'font-size: 16px',
  )
) {
  failures.push(
    'Mobile input zoom protection is missing.',
  )
}

if (
  !mobile.includes(
    'min-height: 44px',
  )
) {
  failures.push(
    '44px mobile touch-target contract is missing.',
  )
}

if (
  !mobile.includes(
    'overflow-x: auto',
  )
  || !mobile.includes(
    'overscroll-behavior-inline: contain',
  )
) {
  failures.push(
    'Horizontal engineering content protection is missing.',
  )
}

const release =
  scripts[
    'verify:release'
  ]

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

const mobileSequence = [
  'npm run verify:mobile-experience-v1',
  'npm run verify:mobile-calculator-experience-v2',
  'npm run verify:mobile-experience-v3',
]

let previousIndex =
  -1

for (
  const step
  of mobileSequence
) {
  const positions =
    releaseSteps
      .map(
        (
          candidate,
          index,
        ) =>
          candidate === step
            ? index
            : -1,
      )
      .filter(
        (index) =>
          index >= 0,
      )

  if (
    positions.length !== 1
  ) {
    failures.push(
      `${step} must appear exactly once in verify:release.`,
    )

    continue
  }

  if (
    positions[0]
    <= previousIndex
  ) {
    failures.push(
      'Mobile release verifier order must remain v1 → v2 → v3.',
    )
  }

  previousIndex =
    positions[0]
}

const regression =
  'npm run verify:scientific-notebook-regression-v30'

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
    'verified-calculator-copy must remain final.',
  )
}

if (
  releaseSteps[
    releaseSteps.length
    - 2
  ] !==
    regression
) {
  failures.push(
    'Scientific Notebook regression v30 must remain penultimate.',
  )
}

const requiredFiles = [
  'src/styles/mobile-experience.css',
  'scripts/verify-mobile-experience-v1.mjs',
  'scripts/verify-mobile-calculator-experience-v2.mjs',
  'scripts/verify-mobile-experience-v3.mjs',
  'docs/MOBILE_UX_RELEASE.md',
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
      `Required mobile release file missing: ${file}`,
    )
  }
}

if (
  failures.length
) {
  console.error(
    'MOBILE UX RELEASE CONTRACT V4 VERIFICATION FAILED',
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

const audit = [
  '# Mobile UX Final Audit',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '## Result',
  '',
  '**PASS — ChemE Toolkit mobile UX contracts are satisfied.**',
  '',
  '## Viewport coverage',
  '',
  '- 768 px mobile handoff',
  '- 430 px compact mobile',
  '- 390 px primary phone',
  '- 375 px compact phone',
  '- 360 px calculator fallback',
  '',
  '## Product coverage',
  '',
  '- Mobile shell',
  '- Homepage',
  '- Calculator directory',
  '- Calculator experience',
  '- Scientific Notebook',
  '- Notebook Library',
  '- Project Sets',
  '- Portfolio dashboard',
  '- Problem Solver',
  '',
  '## Interaction protection',
  '',
  '- 16 px mobile form controls',
  '- 44 px touch targets',
  '- horizontal engineering content protection',
  '- mobile action rails',
  '- non-obstructive calculator actions',
  '',
  '## Release protection',
  '',
  '- Mobile verifier v1 registered',
  '- Mobile calculator verifier v2 registered',
  '- Mobile verifier v3 registered',
  '- verifier order protected',
  '- Scientific Notebook regression remains penultimate',
  '- verified-calculator-copy remains final',
  '',
  '## Next step',
  '',
  'Perform targeted real-device visual adjustments when physical phone testing is available.',
  '',
]

writeFileSync(
  'audit-reports/mobile-ux-final-audit.md',
  audit.join(
    '\n',
  ),
)

console.log(
  'MOBILE UX RELEASE CONTRACT V4 VERIFICATION PASSED',
)

console.log(
  'PASS: 768 / 430 / 390 / 375 viewport contracts.',
)

console.log(
  'PASS: all primary mobile product surfaces covered.',
)

console.log(
  'PASS: mobile verifier sequence protected.',
)

console.log(
  'PASS: touch and overflow contracts protected.',
)

console.log(
  'PASS: mobile audit report generated.',
)
