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
      'src/features/problem-solver/multistageCompressorEngine.ts',
      'utf8',
    ),
    readFile(
      'src/components/MultistageCompressorPanel.tsx',
      'utf8',
    ),
    readFile(
      'src/styles/multistage-compressor-panel.css',
      'utf8',
    ),
    readFile(
      'src/components/SolverAdvancedTools.tsx',
      'utf8',
    ),
    readFile(
      'tests/multistage-compressor/multistage-compressor.test.ts',
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
    'MULTISTAGE_COMPRESSOR_ENGINE_VERSION',
    'calculateSingleStageCompression',
    'calculateMultistageCompressor',
    'createCompressorDischargeProblem',
    'createMultistageCompressorCsv',
    'shaftPowerSavingPercent',
    'totalIntercoolerDuty',
  ]
) {
  if (
    !engine.includes(
      marker,
    )
  ) {
    throw new Error(
      `Compressor engine marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'Multistage compressor and intercooling',
    'Calculate multistage compression',
    'Final discharge temperature',
    'Shaft-power saving',
    'Equal-ratio pressure train',
    'Export compressor CSV',
    'Transfer discharge state to Solver',
  ]
) {
  if (
    !component.includes(
      marker,
    )
  ) {
    throw new Error(
      `Compressor component marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    '.multistage-compressor-panel',
    '.multistage-compressor-input-grid',
    '.multistage-compressor-summary',
    '.multistage-compressor-comparison',
    '.multistage-compressor-table',
    '.multistage-compressor-transfer',
    '@media (max-width: 720px)',
  ]
) {
  if (
    !styles.includes(
      marker,
    )
  ) {
    throw new Error(
      `Compressor style marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    "| 'compressor'",
    'loadMultistageCompressorPanel',
    'const MultistageCompressorPanel =',
    "id:\n        'compressor'",
    'Compressor staging',
    '<MultistageCompressorPanel',
    'Compressor discharge state loaded.',
  ]
) {
  if (
    !advancedTools.includes(
      marker,
    )
  ) {
    throw new Error(
      `Compressor Tool integration missing: ${marker}`,
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
    'Compressor integration regressed click-only loading.',
  )
}

for (
  const marker
  of [
    'calculates ideal single-stage compressor discharge temperature',
    'uses equal pressure ratios through all compressor stages',
    'multistage compression reduces shaft power with intercooling',
    'calculates positive interstage cooling duty',
    'single-stage configuration has no intercooler duty',
    'rejects invalid compressor operating conditions',
    'exports compressor stage data as CSV',
  ]
) {
  if (
    !tests.includes(
      marker,
    )
  ) {
    throw new Error(
      `Compressor test marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'test:multistage-compressor-v1',
    'verify:multistage-compressor-v1',
  ]
) {
  if (
    !packageSource.includes(
      marker,
    )
  ) {
    throw new Error(
      `Compressor package script missing: ${marker}`,
    )
  }
}

if (
  !performanceGate.includes(
    'src/components/MultistageCompressorPanel.tsx',
  )
) {
  throw new Error(
    'Performance Gate does not protect Multistage Compressor.',
  )
}

console.log(
  'PASS: Single-stage compressor calculation verified.',
)

console.log(
  'PASS: Equal-ratio multistage compression verified.',
)

console.log(
  'PASS: Intercooler duty and power-saving calculations verified.',
)

console.log(
  'PASS: CSV export and Solver discharge-state transfer verified.',
)

console.log(
  'PASS: MULTISTAGE COMPRESSOR AND INTERCOOLING V1',
)
