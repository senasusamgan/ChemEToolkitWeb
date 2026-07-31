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

for (
  const contract
  of [
    'diagnoseAbsolutePressure',
    'diagnoseFlowRate',
    'diagnoseHeatExchangerTemperatures',
    'diagnoseFractionClosure',
    'diagnoseGaugePressureBasis',
    'heat-exchanger-temperature-cross',
    'gauge-pressure-conversion-missing',
  ]
) {
  if (
    !diagnosticsEngine.includes(
      contract,
    )
  ) {
    throw new Error(
      `Package 02 diagnostics contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'rejects nonpositive absolute pressure',
    'rejects nonpositive flow rate',
    'rejects heat-exchanger temperature crossing',
    'accepts physically ordered heat-exchanger temperatures',
    'rejects mole fractions whose sum exceeds one',
    'warns when supplied component fractions do not close',
    'warns when gauge pressure lacks atmospheric pressure',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Package 02 test contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'diagnoseIdealGasStateConsistency',
    'diagnoseMassVolumeDensityConsistency',
    'diagnoseFlowContinuityConsistency',
    'diagnoseDrivingForces',
    'ideal-gas-state-inconsistent',
    'density-mass-volume-inconsistent',
    'flow-area-velocity-inconsistent',
    'zero-concentration-driving-force',
  ]
) {
  if (
    !diagnosticsEngine.includes(
      contract,
    )
  ) {
    throw new Error(
      `Package 03 diagnostics contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'rejects a strongly inconsistent ideal-gas state',
    'accepts a consistent ideal-gas state',
    'warns when mass volume and density are inconsistent',
    'warns when flow rate area and velocity violate continuity',
    'accepts flow inputs that satisfy Q equals Av',
    'warns about a zero concentration driving force',
    'warns about a zero pressure driving force',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Package 03 test contract missing: ${contract}`,
    )
  }
}

console.log(
  'PASS: Problem Solver v3 diagnostics package verified.',
)
