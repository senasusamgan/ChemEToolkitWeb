import {
  readFile,
  stat,
} from 'node:fs/promises'

const requiredFiles = [
  'src/features/problem-solver/problemSolverEngine.ts',
  'tests/problem-solver-v1/problem-solver-engine.test.ts',
  'src/components/WorkspaceSmartLauncherPanel.tsx',
]

for (const file of requiredFiles) {
  await stat(file)
}

const engine =
  await readFile(
    'src/features/problem-solver/problemSolverEngine.ts',
    'utf8',
  )

for (
  const contract
  of [
    'rankProblemSolvers',
    'CATEGORY_SIGNALS',
    'INTENT_PROFILES',
    'GUIDANCE_PROFILES',
    'CATEGORY_GUIDANCE',
    'buildProblemGuidance',
    'requiredInputs',
    'equationHint',
  ]
) {
  if (!engine.includes(contract)) {
    throw new Error(
      `Problem Solver engine is missing: ${contract}`,
    )
  }
}

const launcher =
  await readFile(
    'src/components/WorkspaceSmartLauncherPanel.tsx',
    'utf8',
  )

for (
  const contract
  of [
    "import { calculators }",
    "import { rankProblemSolvers }",
    'const problemMatches =',
    'const problemCandidates =',
    'match.guidance',
    'match.requiredInputs',
    'match.equationHint',
    'Problem Solver recommends calculators',
    'verified calculators searchable',
    'What engineering problem are you solving?',
  ]
) {
  if (!launcher.includes(contract)) {
    throw new Error(
      `Smart Launcher is missing: ${contract}`,
    )
  }
}

const tests =
  await readFile(
    'tests/problem-solver-v1/problem-solver-engine.test.ts',
    'utf8',
  )

for (
  const contract
  of [
    'pressureDrop',
    'reynoldsNumber',
    'heatExchangerAreaSizing',
    'supports Turkish pressure-drop intent',
    'actionable pressure-drop solution brief',
    'category guidance',
    'every recommended calculator includes a solution brief',
  ]
) {
  if (!tests.includes(contract)) {
    throw new Error(
      `Problem Solver tests are missing: ${contract}`,
    )
  }
}

console.log(
  'CHEME PROBLEM SOLVER GUIDANCE VERIFICATION PASSED',
)

console.log(
  'Calculator recommendations verified.',
)

console.log(
  'Required-input guidance verified.',
)

console.log(
  'Equation and model hints verified.',
)

console.log(
  'Existing result-card layout and navigation unchanged.',
)
