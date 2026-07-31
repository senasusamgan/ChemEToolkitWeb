import {
  readFile,
} from 'node:fs/promises'

const [
  compositeEngine,
  solverEngine,
  tests,
  packageSource,
] =
  await Promise.all([
    readFile(
      'src/features/problem-solver/problemCompositeSolveEngine.ts',
      'utf8',
    ),
    readFile(
      'src/features/problem-solver/problemSolverEngine.ts',
      'utf8',
    ),
    readFile(
      'tests/problem-solver-v2/problem-composite-solve.test.ts',
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
    'ProblemCompositeSolution',
    'solvePipePumpChain',
    'solveHeatExchangerChain',
    'solveMassTransferChain',
    'solveNaturalConvectionChain',
    'solveCompositeProblem',
    "'pressureDrop'",
    "'pumpPower'",
    "'heatExchangerLMTD'",
    "'heatExchangerAreaSizing'",
    "'ficksFirstLaw'",
    "'massTransferCoefficient'",
    "'grashofNumber'",
    "'rayleighNumber'",
  ]
) {
  if (
    !compositeEngine.includes(
      contract,
    )
  ) {
    throw new Error(
      `Composite engine contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    "import { solveCompositeProblem }",
    'solveCompositeProblem(',
    'solveProblemQuickly(',
  ]
) {
  if (
    !solverEngine.includes(
      contract,
    )
  ) {
    throw new Error(
      `Problem Solver integration missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'chains pipe pressure drop into required pump power',
    'chains LMTD into heat-exchanger area sizing',
    'chains Ficks law into a mass-transfer coefficient',
    'chains Grashof number into Rayleigh number',
    'does not invent a composite solution for incomplete pipe data',
    'surfaces the composite solution through Problem Solver ranking',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Composite test contract missing: ${contract}`,
    )
  }
}

const packageJson =
  JSON.parse(
    packageSource,
  )

if (
  packageJson.scripts[
    'test:problem-solver-v2'
  ] !==
  'node --experimental-strip-types --test tests/problem-solver-v2/*.test.ts'
) {
  throw new Error(
    'Problem Solver v2 test command is missing.',
  )
}

if (
  packageJson.scripts[
    'verify:problem-solver-v2'
  ] !==
  'npm run test:problem-solver-v2 && node scripts/verify-problem-solver-v2.mjs'
) {
  throw new Error(
    'Problem Solver v2 verifier command is missing.',
  )
}

if (
  !packageJson.scripts[
    'verify:release'
  ].includes(
    'npm run verify:problem-solver-v2',
  )
) {
  throw new Error(
    'Problem Solver v2 is missing from the release chain.',
  )
}

for (
  const contract
  of [
    'solveTotalPumpPowerChain',
    'solveMassFlowCstrChain',
    'solveSolutionPreparationChain',
    'solveMixtureMolarFlowChain',
    "'minorLosses'",
    "'massFlowMolarFlowConversion'",
    "'massMoleConversion'",
    "'averageMolecularWeight'",
  ]
) {
  if (
    !compositeEngine.includes(
      contract,
    )
  ) {
    throw new Error(
      `Package 02 engine contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'chains major and minor losses into total pump power',
    'chains mass feed flow into CSTR volume',
    'chains solute mass into solution molarity',
    'chains binary average molecular weight into mixture molar flow',
    'does not calculate total pump power without a loss coefficient',
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

console.log(
  'PASS: Problem Solver v2 composite package verified.',
)
