import {
  readFile,
} from 'node:fs/promises'

const [
  component,
  app,
  styles,
  tests,
  packageSource,
] =
  await Promise.all([
    readFile(
      'src/components/HomepageProblemSolverPanel.tsx',
      'utf8',
    ),
    readFile(
      'src/App.tsx',
      'utf8',
    ),
    readFile(
      'src/styles/homepage-problem-solver.css',
      'utf8',
    ),
    readFile(
      'tests/homepage-problem-solver-ui/homepage-problem-solver-ui.test.mjs',
      'utf8',
    ),
    readFile(
      'package.json',
      'utf8',
    ),
  ])

for (
  const contract
  of [
    'HomepageProblemSolverPanel',
    'Solve an engineering problem',
    'rankProblemSolvers',
    'Best calculator match',
    'Requested unknown',
    'Quick Solve',
    'Parsed symbolic inputs',
    'Solution blueprint',
    'Open calculator →',
  ]
) {
  if (
    !component.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage solver component missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'HomepageProblemSolverPanel',
    'href="#problem-solver"',
    "'#problem-solver'",
  ]
) {
  if (
    !app.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage integration missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.homepage-problem-solver',
    '.homepage-problem-solver-layout',
    '.homepage-problem-solver-result',
    '.homepage-problem-input-chips',
  ]
) {
  if (
    !styles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage solver style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'renders a visible homepage Problem Solver',
    'uses equation-aware Problem Solver data',
    'mounts the panel directly after the hero',
    'includes responsive standalone styles',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage solver test missing: ${contract}`,
    )
  }
}

const packageJson =
  JSON.parse(
    packageSource,
  )

if (
  packageJson.scripts[
    'test:homepage-problem-solver-ui'
  ] !==
  'node --test tests/homepage-problem-solver-ui/*.test.mjs'
) {
  throw new Error(
    'Homepage Problem Solver test command is missing.',
  )
}

if (
  packageJson.scripts[
    'verify:homepage-problem-solver-ui'
  ] !==
  'npm run test:homepage-problem-solver-ui && node scripts/verify-homepage-problem-solver-ui.mjs'
) {
  throw new Error(
    'Homepage Problem Solver verifier command is missing.',
  )
}

if (
  !packageJson.scripts[
    'verify:release'
  ].includes(
    'npm run verify:homepage-problem-solver-ui',
  )
) {
  throw new Error(
    'Homepage Problem Solver is missing from release verification.',
  )
}

for (
  const contract
  of [
    'function buildSolverReport()',
    'async function copySolverReport()',
    'function downloadSolverReport()',
    'function clearProblem()',
    'Copy report',
    'Download .txt',
    'Clear problem',
    'homepage-problem-result-actions',
    'homepage-problem-action-feedback',
  ]
) {
  if (
    !component.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage solver report action missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    '.homepage-problem-editor-actions',
    '.homepage-problem-result-actions',
    '.homepage-problem-action-feedback',
  ]
) {
  if (
    !styles.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage solver report style missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'provides copy download and clear result actions',
    'styles report actions and feedback responsively',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Homepage solver report test missing: ${contract}`,
    )
  }
}

console.log(
  'PASS: Standalone homepage Problem Solver verified.',
)
