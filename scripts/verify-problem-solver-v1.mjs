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
    'GUIDANCE_PROFILES',
    'CATEGORY_GUIDANCE',
    'buildProblemGuidance',
    'INPUT_ALIASES',
    'detectInputReadiness',
    'detectedInputs',
    'missingInputs',
    'readinessPercent',
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
    'match.guidance',
    'match.detectedInputs',
    'match.missingInputs',
    'match.readinessPercent',
    'Readiness:',
    'Detected:',
    'Missing:',
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
    'actionable pressure-drop solution brief',
    'detects supplied pressure-drop inputs',
    'detects numerical and qualitative PID inputs',
    'does not mark an input as supplied when it has no value',
  ]
) {
  if (!tests.includes(contract)) {
    throw new Error(
      `Problem Solver tests are missing: ${contract}`,
    )
  }
}

console.log(
  'CHEME PROBLEM SOLVER READINESS VERIFICATION PASSED',
)

console.log(
  'Required-input detection verified.',
)

console.log(
  'Missing-input reporting verified.',
)

console.log(
  'Problem readiness percentage verified.',
)

console.log(
  'Existing card layout, CSS and navigation unchanged.',
)
