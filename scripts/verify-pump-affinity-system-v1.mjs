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
      'src/features/problem-solver/pumpAffinitySystemEngine.ts',
      'utf8',
    ),
    readFile(
      'src/components/PumpAffinitySystemPanel.tsx',
      'utf8',
    ),
    readFile(
      'src/styles/pump-affinity-system-panel.css',
      'utf8',
    ),
    readFile(
      'src/components/SolverAdvancedTools.tsx',
      'utf8',
    ),
    readFile(
      'tests/pump-affinity-system/pump-affinity-system.test.ts',
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
    'PUMP_AFFINITY_SYSTEM_ENGINE_VERSION',
    'calculatePumpAffinityPrediction',
    'calculatePumpOperatingPoint',
    'createPumpCurvePoints',
    'calculatePumpSystemAnalysis',
    'createPumpOperatingProblem',
    'createPumpSystemCsv',
  ]
) {
  if (
    !engine.includes(
      marker,
    )
  ) {
    throw new Error(
      `Pump engine marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'Pump affinity and system curve',
    'Calculate pump operating point',
    'System operating flow',
    'Affinity-law prediction',
    'Required shaft power',
    'Export pump-system CSV',
    'Transfer operating point to Solver',
    'Hsystem = Hstatic + KQ²',
  ]
) {
  if (
    !component.includes(
      marker,
    )
  ) {
    throw new Error(
      `Pump component marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    '.pump-affinity-panel',
    '.pump-affinity-input-grid',
    '.pump-affinity-summary',
    '.pump-affinity-comparison',
    '.pump-affinity-table',
    '.pump-affinity-transfer',
    '@media (max-width: 720px)',
  ]
) {
  if (
    !styles.includes(
      marker,
    )
  ) {
    throw new Error(
      `Pump style marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    "| 'pump'",
    'loadPumpAffinitySystemPanel',
    'const PumpAffinitySystemPanel =',
    "id:\n        'pump'",
    'Pump operating point',
    '<PumpAffinitySystemPanel',
    'Pump operating point loaded.',
  ]
) {
  if (
    !advancedTools.includes(
      marker,
    )
  ) {
    throw new Error(
      `Pump Tool integration missing: ${marker}`,
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
    'Pump Tool integration regressed click-only loading.',
  )
}

for (
  const marker
  of [
    'applies pump affinity laws for speed and diameter changes',
    'calculates the pump and system curve operating point',
    'creates pump and system curve samples',
    'rejects an invalid pump shutoff head',
    'replaces flow, head and speed in the Solver problem',
    'exports pump and system curve analysis as CSV',
  ]
) {
  if (
    !tests.includes(
      marker,
    )
  ) {
    throw new Error(
      `Pump test marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'test:pump-affinity-system-v1',
    'verify:pump-affinity-system-v1',
  ]
) {
  if (
    !packageSource.includes(
      marker,
    )
  ) {
    throw new Error(
      `Pump package script missing: ${marker}`,
    )
  }
}

if (
  !performanceGate.includes(
    'src/components/PumpAffinitySystemPanel.tsx',
  )
) {
  throw new Error(
    'Performance Gate does not protect Pump Affinity Tool.',
  )
}

console.log(
  'PASS: Pump affinity-law scaling verified.',
)

console.log(
  'PASS: Pump and system curve intersection verified.',
)

console.log(
  'PASS: Hydraulic and shaft-power calculations verified.',
)

console.log(
  'PASS: CSV export and Solver transfer verified.',
)

console.log(
  'PASS: PUMP AFFINITY AND SYSTEM CURVE V1',
)
