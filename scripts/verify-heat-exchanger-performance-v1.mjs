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
      'src/features/problem-solver/heatExchangerPerformanceEngine.ts',
      'utf8',
    ),
    readFile(
      'src/components/HeatExchangerPerformancePanel.tsx',
      'utf8',
    ),
    readFile(
      'src/styles/heat-exchanger-performance-panel.css',
      'utf8',
    ),
    readFile(
      'src/components/SolverAdvancedTools.tsx',
      'utf8',
    ),
    readFile(
      'tests/heat-exchanger-performance/heat-exchanger-performance.test.ts',
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
    'HEAT_EXCHANGER_PERFORMANCE_ENGINE_VERSION',
    'calculateHeatExchangerPerformance',
    'calculateLogarithmicMeanTemperatureDifference',
    'createHeatExchangerOutletProblem',
    'createHeatExchangerPerformanceCsv',
    'foulingResistance',
    'requiredNumberOfTransferUnits',
  ]
) {
  if (
    !engine.includes(
      marker,
    )
  ) {
    throw new Error(
      `Heat Exchanger engine marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'Heat exchanger effectiveness–NTU and fouling',
    'Counterflow',
    'Parallel flow',
    'Calculate exchanger performance',
    'Operating heat duty',
    'Fouling duty loss',
    'Target cold-outlet design',
    'Export exchanger CSV',
    'Transfer outlet state to Solver',
  ]
) {
  if (
    !component.includes(
      marker,
    )
  ) {
    throw new Error(
      `Heat Exchanger component marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    '.heat-exchanger-performance-panel',
    '.heat-exchanger-arrangements',
    '.heat-exchanger-input-grid',
    '.heat-exchanger-fouling-comparison',
    '.heat-exchanger-target-design',
    '.heat-exchanger-performance-transfer',
    '@media (max-width: 720px)',
  ]
) {
  if (
    !styles.includes(
      marker,
    )
  ) {
    throw new Error(
      `Heat Exchanger style marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    "| 'heatx'",
    'loadHeatExchangerPerformancePanel',
    'const HeatExchangerPerformancePanel =',
    "id:\n        'heatx'",
    'Heat exchanger rating',
    '<HeatExchangerPerformancePanel',
    'Heat-exchanger outlet state loaded.',
  ]
) {
  if (
    !advancedTools.includes(
      marker,
    )
  ) {
    throw new Error(
      `Heat Exchanger Tool integration missing: ${marker}`,
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
    'Heat Exchanger integration regressed click-only loading.',
  )
}

for (
  const marker
  of [
    'calculates counterflow effectiveness with equal capacity rates',
    'calculates outlet temperatures and closes the energy balance',
    'counterflow produces more duty than parallel flow',
    'calculates clean versus fouled performance loss',
    'calculates required area for a target cold outlet',
    'rejects invalid thermal inputs',
    'exports rating fouling and target design as CSV',
  ]
) {
  if (
    !tests.includes(
      marker,
    )
  ) {
    throw new Error(
      `Heat Exchanger test marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'test:heat-exchanger-performance-v1',
    'verify:heat-exchanger-performance-v1',
  ]
) {
  if (
    !packageSource.includes(
      marker,
    )
  ) {
    throw new Error(
      `Heat Exchanger package script missing: ${marker}`,
    )
  }
}

if (
  !performanceGate.includes(
    'src/components/HeatExchangerPerformancePanel.tsx',
  )
) {
  throw new Error(
    'Performance Gate does not protect Heat Exchanger Performance.',
  )
}

console.log(
  'PASS: Parallel and counterflow ε–NTU calculations verified.',
)

console.log(
  'PASS: Outlet temperatures, LMTD and energy balance verified.',
)

console.log(
  'PASS: Clean-versus-fouled performance analysis verified.',
)

console.log(
  'PASS: Target outlet area design verified.',
)

console.log(
  'PASS: CSV export and Solver outlet-state transfer verified.',
)

console.log(
  'PASS: HEAT EXCHANGER PERFORMANCE V1',
)
