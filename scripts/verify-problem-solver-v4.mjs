import {
  readFile,
} from 'node:fs/promises'

const [
  planEngine,
  assumptionEngine,
  reportEngine,
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
      'src/features/problem-solver/problemEngineeringReportEngine.ts',
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
      `Solution-plan contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'ProblemAssumptionContext',
    'ENGINEERING_PROFILES',
    'buildProblemAssumptions',
    'buildProblemVerificationChecklist',
    'fully developed',
    'ideal-gas behavior',
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
    'EngineeringReportStatus',
    'EngineeringReportSection',
    'ProblemEngineeringReport',
    'ProblemEngineeringReportContext',
    'determineStatus',
    'buildHeadline',
    'buildSummary',
    'buildInputSection',
    'buildDiagnosticSection',
    'createSection',
    'buildProblemEngineeringReport',
    'Input readiness',
    'Engineering diagnostics',
    'Solution blueprint',
    'Engineering assumptions',
    'Verification checklist',
  ]
) {
  if (
    !reportEngine.includes(
      contract,
    )
  ) {
    throw new Error(
      `Engineering-report contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'solutionPlan: string[]',
    'assumptions: string[]',
    'verificationChecklist: string[]',
    'engineeringReport: ProblemEngineeringReport',
    'const solutionPlan =',
    'const assumptions =',
    'const verificationChecklist =',
    'const engineeringReport =',
    'Engineering report:',
    'engineeringReport,',
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
    'builds pressure-drop assumptions',
    'builds ideal-gas assumptions',
    'integrates assumptions and verification into ranked matches',
    'builds a blocked engineering report',
    'builds a missing-input engineering report',
    'builds a ready engineering report',
    'marks warning-only reports for review',
    'integrates the engineering report into ranked matches',
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
  'PASS: Problem Solver v4 structured engineering intelligence verified.',
)
