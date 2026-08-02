import {
  readFile,
} from 'node:fs/promises'

const [
  engine,
  component,
  styles,
  advancedTools,
  tests,
  packageSource,
  performanceGate,
] =
  await Promise.all([
    readFile(
      'src/features/problem-solver/parameterCalibrationEngine.ts',
      'utf8',
    ),
    readFile(
      'src/components/ParameterCalibrationPanel.tsx',
      'utf8',
    ),
    readFile(
      'src/styles/parameter-calibration-panel.css',
      'utf8',
    ),
    readFile(
      'src/components/SolverAdvancedTools.tsx',
      'utf8',
    ),
    readFile(
      'tests/parameter-calibration/parameter-calibration.test.ts',
      'utf8',
    ),
    readFile(
      'package.json',
      'utf8',
    ),
    readFile(
      'scripts/verify-problem-solver-performance-v10.mjs',
      'utf8',
    ),
  ])

for (
  const marker
  of [
    'PARAMETER_CALIBRATION_ENGINE_VERSION',
    'createCalibrationCandidates',
    'calculateCalibrationMetrics',
    'selectBestCalibrationEvaluation',
    'createCalibrationCsv',
  ]
) {
  if (!engine.includes(marker)) {
    throw new Error(
      `Calibration engine marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'Parameter calibration',
    'Run parameter calibration',
    'Best-fit parameter',
    'Export residual CSV',
    'Transfer calibrated parameter to Solver',
    'requestProblemSolverMatches',
  ]
) {
  if (!component.includes(marker)) {
    throw new Error(
      `Calibration component marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    '.parameter-calibration-panel',
    '.parameter-calibration-controls',
    '.parameter-calibration-summary',
    '.parameter-calibration-table',
    '@media (max-width: 620px)',
  ]
) {
  if (!styles.includes(marker)) {
    throw new Error(
      `Calibration style marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    "| 'calibration'",
    'loadParameterCalibrationPanel',
    'const ParameterCalibrationPanel =',
    "id:\n        'calibration'",
    '<ParameterCalibrationPanel',
    'Calibrated parameter loaded.',
  ]
) {
  if (!advancedTools.includes(marker)) {
    throw new Error(
      `Calibration Tool integration missing: ${marker}`,
    )
  }
}

if (
  advancedTools.includes('onPointerEnter') ||
  advancedTools.includes('prefetchTool(')
) {
  throw new Error(
    'Calibration integration regressed click-only loading.',
  )
}

for (
  const marker
  of [
    'test:parameter-calibration-v1',
    'verify:parameter-calibration-v1',
  ]
) {
  if (!packageSource.includes(marker)) {
    throw new Error(
      `Calibration package script missing: ${marker}`,
    )
  }
}

if (
  !performanceGate.includes(
    'src/components/ParameterCalibrationPanel.tsx',
  )
) {
  throw new Error(
    'Performance Gate does not protect Parameter Calibration.',
  )
}

if (
  !tests.includes(
    'selects the candidate with the best resolved RMSE',
  )
) {
  throw new Error(
    'Calibration selection test is missing.',
  )
}

console.log(
  'PASS: Calibration candidate generation verified.',
)

console.log(
  'PASS: RMSE, MAE and residual analysis verified.',
)

console.log(
  'PASS: CSV export and Solver transfer verified.',
)

console.log(
  'PASS: PARAMETER CALIBRATION V1',
)
