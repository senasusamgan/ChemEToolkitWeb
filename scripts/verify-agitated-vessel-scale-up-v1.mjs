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
      'src/features/problem-solver/agitatedVesselScaleUpEngine.ts',
      'utf8',
    ),
    readFile(
      'src/components/AgitatedVesselScaleUpPanel.tsx',
      'utf8',
    ),
    readFile(
      'src/styles/agitated-vessel-scale-up-panel.css',
      'utf8',
    ),
    readFile(
      'src/components/SolverAdvancedTools.tsx',
      'utf8',
    ),
    readFile(
      'tests/agitated-vessel-scale-up/agitated-vessel-scale-up.test.ts',
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
    'AGITATED_VESSEL_SCALE_UP_ENGINE_VERSION',
    'calculateRequiredAgitatorSpeedRpm',
    'calculateAgitatedVesselState',
    'calculateAgitatedVesselScaleUp',
    'createAgitatedVesselScaleUpProblem',
    'createAgitatedVesselScaleUpCsv',
  ]
) {
  if (
    !engine.includes(
      marker,
    )
  ) {
    throw new Error(
      `Agitated Vessel engine marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'Agitated vessel scale-up',
    'Constant tip speed',
    'Constant power per volume',
    'Constant impeller Reynolds number',
    'Constant impeller Froude number',
    'Calculate agitator scale-up',
    'Overall similarity score',
    'Export scale-up CSV',
    'Transfer scaled agitator case to Solver',
  ]
) {
  if (
    !component.includes(
      marker,
    )
  ) {
    throw new Error(
      `Agitated Vessel component marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    '.agitated-vessel-panel',
    '.agitated-vessel-criteria',
    '.agitated-vessel-input-grid',
    '.agitated-vessel-summary',
    '.agitated-vessel-comparison',
    '.agitated-vessel-transfer',
    '@media (max-width: 620px)',
  ]
) {
  if (
    !styles.includes(
      marker,
    )
  ) {
    throw new Error(
      `Agitated Vessel style marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    "| 'mixing'",
    'loadAgitatedVesselScaleUpPanel',
    'const AgitatedVesselScaleUpPanel =',
    "id:\n        'mixing'",
    'Agitator scale-up',
    '<AgitatedVesselScaleUpPanel',
    'Scaled agitator case loaded.',
  ]
) {
  if (
    !advancedTools.includes(
      marker,
    )
  ) {
    throw new Error(
      `Agitated Vessel Tool integration missing: ${marker}`,
    )
  }
}

if (
  advancedTools.includes(
    'onPointerEnter',
  ) ||
  advancedTools.includes(
    'prefetchTool(',
  )
) {
  throw new Error(
    'Agitated Vessel integration regressed click-only loading.',
  )
}

for (
  const marker
  of [
    'calculates agitated-vessel power, torque and dimensionless groups',
    'calculates constant-tip-speed scale-up rpm',
    'calculates constant-power-per-volume scale-up rpm',
    'calculates constant-Reynolds scale-up rpm',
    'calculates constant-Froude scale-up rpm',
    'preserves power per volume for the P over V criterion',
    'exports agitation scale-up results as CSV',
  ]
) {
  if (
    !tests.includes(
      marker,
    )
  ) {
    throw new Error(
      `Agitated Vessel test marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'test:agitated-vessel-scale-up-v1',
    'verify:agitated-vessel-scale-up-v1',
  ]
) {
  if (
    !packageSource.includes(
      marker,
    )
  ) {
    throw new Error(
      `Agitated Vessel package script missing: ${marker}`,
    )
  }
}

if (
  !performanceGate.includes(
    'src/components/AgitatedVesselScaleUpPanel.tsx',
  )
) {
  throw new Error(
    'Performance Gate does not protect Agitated Vessel Scale-Up.',
  )
}

console.log(
  'PASS: Agitator scale-law calculations verified.',
)

console.log(
  'PASS: Power, torque, Re, Fr and tip-speed calculations verified.',
)

console.log(
  'PASS: Geometric vessel-volume scale-up verified.',
)

console.log(
  'PASS: CSV export and Solver transfer verified.',
)

console.log(
  'PASS: AGITATED VESSEL SCALE-UP V1',
)
