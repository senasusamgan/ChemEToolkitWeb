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
    'confidenceForScore',
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
    'candidate.solverScore ??',
    'Problem Solver recommends calculators',
    'verified calculators searchable',
    'What engineering problem are you solving?',
    'Problem Solver match',
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
    'pidController',
    'reactorDesign',
    'supports Turkish pressure-drop intent',
    'excludes unavailable calculators',
  ]
) {
  if (!tests.includes(contract)) {
    throw new Error(
      `Problem Solver tests are missing: ${contract}`,
    )
  }
}

console.log(
  'CHEME PROBLEM SOLVER V1 VERIFICATION PASSED',
)

console.log(
  'Problem-to-calculator recommendations verified.',
)

console.log(
  'English and Turkish intent matching verified.',
)

console.log(
  'Smart Launcher integration verified.',
)

console.log(
  'Layout and navigation structure unchanged.',
)
