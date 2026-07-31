import {
  readFile,
} from 'node:fs/promises'

const [
  parserEngine,
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
    'normalizeSymbol',
    'normalizeUnit',
    'findProfile',
    'unitIsAccepted',
    'createCanonicalText',
    'deduplicateAssignments',
    'parseEquationAwareInput',
    'fluid density',
    'dynamic viscosity',
    'pipe diameter',
    'surface roughness',
    'volumetric flow rate',
    'pressure difference',
    'absolute temperature',
    'amount of gas',
    'molecular weight',
    'specific heat capacity',
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
    "import { parseEquationAwareInput }",
    'ProblemEquationAssignment',
    'equationAssignments: ProblemEquationAssignment[]',
    'const equationParse =',
    'const solverQuery =',
    'Parsed symbolic inputs:',
    'equationParse.enrichedQuery',
    'equationAssignments:',
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
    'preserves uppercase V as volume and lowercase v as velocity',
    'parses ideal-gas symbolic inputs into Quick Solve',
    'parses symbolic pressure-drop inputs into Quick Solve',
    'parses dimensionless efficiency and conversion',
    'ignores unsupported symbols and invalid units',
    'supports colon assignment syntax',
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
  'PASS: Problem Solver v5 equation-aware parser verified.',
)
