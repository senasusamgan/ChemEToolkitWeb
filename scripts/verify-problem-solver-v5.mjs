import {
  readFile,
} from 'node:fs/promises'

const [
  parserEngine,
  intentEngine,
  contextEngine,
  solverEngine,
  tests,
  packageSource,
] =
  await Promise.all([
    readFile(
      'src/features/problem-solver/problemEquationInputParser.ts',
      'utf8',
    ),
    readFile(
      'src/features/problem-solver/problemEquationIntentEngine.ts',
      'utf8',
    ),
    readFile(
      'src/features/problem-solver/problemEquationContextEngine.ts',
      'utf8',
    ),
    readFile(
      'src/features/problem-solver/problemSolverEngine.ts',
      'utf8',
    ),
    readFile(
      'tests/problem-solver-v5/problem-equation-input-parser.test.ts',
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
    'ProblemEquationAssignment',
    'ProblemEquationParseResult',
    'SYMBOL_PROFILES',
    'parseEquationAwareInput',
    'fluid density',
    'dynamic viscosity',
    'pipe diameter',
    'surface roughness',
    'volumetric flow rate',
    'absolute temperature',
    'amount of gas',
  ]
) {
  if (
    !parserEngine.includes(
      contract,
    )
  ) {
    throw new Error(
      `Equation parser contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'KnownEngineeringEquationId',
    'EquationTargetSource',
    'ProblemEquationIntent',
    'EQUATION_PROFILES',
    'GLOBAL_TARGETS',
    'inferProblemEquationIntent',
    'Ideal gas law',
    'Reynolds-number relation',
    'Flow continuity relation',
    'Darcy–Weisbach equation',
    'Pump-power relation',
    'Heat-exchanger duty relation',
    "Fick's first law",
  ]
) {
  if (
    !intentEngine.includes(
      contract,
    )
  ) {
    throw new Error(
      `Equation intent contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'EquationReadinessStatus',
    'ContextualEquationAssignment',
    'ProblemEquationContext',
    'EQUATION_CONTEXT_PROFILES',
    'findProfile',
    'findVariableBySymbol',
    'findTargetVariable',
    'contextualizeAssignments',
    'conflictingVariableKeys',
    'resolveProblemEquationContext',
    'not-recognized',
    'needs-inputs',
    'ambiguous',
    'Equation readiness:',
    'Contextual equation inputs:',
  ]
) {
  if (
    !contextEngine.includes(
      contract,
    )
  ) {
    throw new Error(
      `Equation context contract missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    "import { parseEquationAwareInput }",
    "import { inferProblemEquationIntent }",
    "import { resolveProblemEquationContext }",
    'ProblemEquationAssignment',
    'ProblemEquationIntent',
    'ProblemEquationContext',
    'equationAssignments: ProblemEquationAssignment[]',
    'equationIntent: ProblemEquationIntent',
    'equationContext: ProblemEquationContext',
    'const equationParse =',
    'const equationIntent =',
    'const equationContext =',
    'equationContext.enrichedText',
    'Equation inputs ready:',
    'Equation inputs missing:',
    'equationContext,',
  ]
) {
  if (
    !solverEngine.includes(
      contract,
    )
  ) {
    throw new Error(
      `Problem Solver v5 integration missing: ${contract}`,
    )
  }
}

for (
  const contract
  of [
    'parses compact fluid-mechanics symbol assignments',
    'parses ideal-gas symbolic inputs into Quick Solve',
    'infers volume as the missing ideal-gas variable',
    'honors an explicit solve-for target',
    'infers Reynolds number from the symbolic equation',
    'interprets D as diffusivity inside Ficks law',
    'marks a complete ideal-gas equation as ready',
    'reports missing ideal-gas equation inputs',
    'detects conflicting equation assignments',
    'resolves D as diffusivity in Ficks law context',
    'marks an unknown equation as not recognized',
    'integrates equation context into ranked matches',
  ]
) {
  if (
    !tests.includes(
      contract,
    )
  ) {
    throw new Error(
      `Problem Solver v5 test missing: ${contract}`,
    )
  }
}

const packageJson =
  JSON.parse(
    packageSource,
  )

if (
  packageJson.scripts[
    'test:problem-solver-v5'
  ] !==
  'node --experimental-strip-types --test tests/problem-solver-v5/*.test.ts'
) {
  throw new Error(
    'Problem Solver v5 test command is missing.',
  )
}

if (
  packageJson.scripts[
    'verify:problem-solver-v5'
  ] !==
  'npm run test:problem-solver-v5 && node scripts/verify-problem-solver-v5.mjs'
) {
  throw new Error(
    'Problem Solver v5 verifier command is missing.',
  )
}

if (
  !packageJson.scripts[
    'verify:release'
  ].includes(
    'npm run verify:problem-solver-v5',
  )
) {
  throw new Error(
    'Problem Solver v5 is missing from the release chain.',
  )
}

console.log(
  'PASS: Problem Solver v5 equation parsing, intent and readiness verified.',
)
