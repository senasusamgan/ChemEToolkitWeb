import {
  readFile,
} from 'node:fs/promises'

const [
  diagnosticsEngine,
  solverEngine,
  tests,
  packageSource,
] =
  await Promise.all([
    readFile(
      'src/features/problem-solver/problemInputDiagnosticsEngine.ts',
      'utf8',
    ),
    readFile(
      'src/features/problem-solver/problemSolverEngine.ts',
      'utf8',
    ),
    readFile(
      'tests/problem-solver-v3/problem-input-diagnostics.test.ts',
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
    'ProblemInputDiagnostic',
    'ProblemInputDiagnostics',
    'diagnosePositiveValues',
    'diagnoseTemperature',
    'diagnoseEfficiency',
    'diagnoseFractions',
    'diagnosePipeRoughness',
    'diagnosePressureBasis',
    'diagnoseProblemInput',
    'hasBlockingErrors',
  ]
) {
  if (
    !diagnosticsEngine.includes(
      contract,
    )
  ) {
    throw new Error(
      `Diagnostics engine contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    "import { diagnoseProblemInput }",
    'diagnostics: ProblemInputDiagnostic[]',
    'diagnostics.hasBlockingErrors',
    'diagnosticGuidance',
    'diagnostics.diagnostics',
  ]
) {
  if (
    !solverEngine.includes(
      contract,
    )
  ) {
    throw new Error(
      `Problem Solver v3 integration missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'blocks a pressure-drop solution with negative density',
    'rejects pump efficiency above 100 percent',
    'rejects conversion above 100 percent',
    'rejects nonphysical Kelvin temperature',
    'warns when ideal-gas pressure basis is ambiguous',
    'rejects pipe roughness greater than diameter',
    'allows a physically valid pressure-drop problem',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Problem Solver v3 test missing: ${contract}`,
    )
  }
}

const packageJson =
  JSON.parse(
    packageSource,
  )

if (
  packageJson.scripts[
    'test:problem-solver-v3'
  ] !==
  'node --experimental-strip-types --test tests/problem-solver-v3/*.test.ts'
) {
  throw new Error(
    'Problem Solver v3 test command is missing.',
  )
}

if (
  packageJson.scripts[
    'verify:problem-solver-v3'
  ] !==
  'npm run test:problem-solver-v3 && node scripts/verify-problem-solver-v3.mjs'
) {
  throw new Error(
    'Problem Solver v3 verifier command is missing.',
  )
}

if (
  !packageJson.scripts[
    'verify:release'
  ].includes(
    'npm run verify:problem-solver-v3',
  )
) {
  throw new Error(
    'Problem Solver v3 is missing from the release chain.',
  )
}

console.log(
  'PASS: Problem Solver v3 diagnostics package verified.',
)
