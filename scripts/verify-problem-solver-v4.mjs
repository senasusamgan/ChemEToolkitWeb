import {
  readFile,
} from 'node:fs/promises'

const [
  planEngine,
  assumptionEngine,
  solverEngine,
  tests,
  packageSource,
] =
  await Promise.all([
    readFile(
      'src/features/problem-solver/problemSolutionPlanEngine.ts',
      'utf8',
    ),
    readFile(
      'src/features/problem-solver/problemAssumptionEngine.ts',
      'utf8',
    ),
    readFile(
      'src/features/problem-solver/problemSolverEngine.ts',
      'utf8',
    ),
    readFile(
      'tests/problem-solver-v4/problem-solution-plan.test.ts',
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
    'ProblemSolutionPlanContext',
    'PLAN_PROFILES',
    'profileMatches',
    'formatInputStep',
    'formatDiagnosticStep',
    'formatEquationStep',
    'deduplicateSteps',
    'buildProblemSolutionPlan',
    'pressureDrop',
    'pumpPower',
    'PV = nRT',
    'Reaction Engineering',
    'Mass Transfer',
  ]
) {
  if (
    !planEngine.includes(
      contract,
    )
  ) {
    throw new Error(
      `Solution-plan engine contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'ProblemAssumptionContext',
    'ENGINEERING_PROFILES',
    'profileMatches',
    'deduplicate',
    'findProfile',
    'buildProblemAssumptions',
    'buildProblemVerificationChecklist',
    'fully developed',
    'ideal-gas behavior',
    'VerificationChecklist',
  ]
) {
  if (
    !assumptionEngine.includes(
      contract,
    )
  ) {
    throw new Error(
      `Assumption-engine contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    "import { buildProblemSolutionPlan }",
    'solutionPlan: string[]',
    'const solutionPlan =',
    'const plannedGuidance =',
    "buildProblemAssumptions",
    "buildProblemVerificationChecklist",
    'assumptions: string[]',
    'verificationChecklist: string[]',
    'const assumptions =',
    'const verificationChecklist =',
    'const enrichedGuidance =',
    'Assumptions:',
    'Verification checklist:',
  ]
) {
  if (
    !solverEngine.includes(
      contract,
    )
  ) {
    throw new Error(
      `Problem Solver v4 integration missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'builds a pressure-drop engineering plan',
    'places blocking diagnostics before calculation',
    'builds an ideal-gas-specific plan',
    'adds Quick Solve verification when a result exists',
    'integrates the solution plan into ranked matches',
    'builds pressure-drop assumptions',
    'builds ideal-gas assumptions',
    'adds missing-input and diagnostic verification checks',
    'adds an independent Quick Solve check',
    'integrates assumptions and verification into ranked matches',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Problem Solver v4 test missing: ${contract}`,
    )
  }
}

const packageJson =
  JSON.parse(
    packageSource,
  )

if (
  packageJson.scripts[
    'test:problem-solver-v4'
  ] !==
  'node --experimental-strip-types --test tests/problem-solver-v4/*.test.ts'
) {
  throw new Error(
    'Problem Solver v4 test command is missing.',
  )
}

if (
  packageJson.scripts[
    'verify:problem-solver-v4'
  ] !==
  'npm run test:problem-solver-v4 && node scripts/verify-problem-solver-v4.mjs'
) {
  throw new Error(
    'Problem Solver v4 verifier command is missing.',
  )
}

if (
  !packageJson.scripts[
    'verify:release'
  ].includes(
    'npm run verify:problem-solver-v4',
  )
) {
  throw new Error(
    'Problem Solver v4 is missing from the release chain.',
  )
}

console.log(
  'PASS: Problem Solver v4 solution intelligence verified.',
)
