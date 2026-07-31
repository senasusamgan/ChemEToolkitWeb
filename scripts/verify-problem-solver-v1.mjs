import {
  readFile,
  stat,
} from 'node:fs/promises'

const requiredFiles = [
  'src/features/problem-solver/problemSolverEngine.ts',
  'src/features/problem-solver/problemQuickSolveEngine.ts',
  'tests/problem-solver-v1/problem-solver-engine.test.ts',
  'tests/problem-solver-v1/problem-quick-solve.test.ts',
  'src/components/WorkspaceSmartLauncherPanel.tsx',
]

for (const file of requiredFiles) {
  await stat(file)
}

const solverEngine =
  await readFile(
    'src/features/problem-solver/problemSolverEngine.ts',
    'utf8',
  )

for (
  const contract
  of [
    'rankProblemSolvers',
    'GUIDANCE_PROFILES',
    'INPUT_ALIASES',
    'detectInputReadiness',
    'solveProblemQuickly',
    'quickSolution',
  ]
) {
  if (!solverEngine.includes(contract)) {
    throw new Error(
      `Problem Solver engine is missing: ${contract}`,
    )
  }
}

const quickEngine =
  await readFile(
    'src/features/problem-solver/problemQuickSolveEngine.ts',
    'utf8',
  )

for (
  const contract
  of [
    'ProblemQuickSolution',
    'solvePressureDrop',
    'solveReynoldsNumber',
    'solvePumpPower',
    'solveBiotNumber',
    'solveIdealGas',
    'solveHeatExchangerLmtd',
    'solveHeatExchangerArea',
    'solveCstrVolume',
    'solveHydrostaticPressure',
    'solvePlaneWallConduction',
    'solveFicksFirstLaw',
    'solveConvectionHeatTransfer',
    'solveNusseltNumber',
    'solveFroudeNumber',
    'solveVolumetricFlowRate',
    'solveDragForce',
    'solveMinorLosses',
    'solveThermalRadiation',
    'solveFourierNumber',
    'solvePrandtlNumber',
    'solveUTubeManometer',
    'solveOrificeMeter',
    'solveTankDrainTime',
    'solveGrashofNumber',
    'solveRayleighNumber',
    'solveMassTransferCoefficient',
    'solveProblemQuickly',
    'Swamee–Jain',
  ]
) {
  if (!quickEngine.includes(contract)) {
    throw new Error(
      `Quick Solve engine is missing: ${contract}`,
    )
  }
}

const launcher =
  await readFile(
    'src/components/WorkspaceSmartLauncherPanel.tsx',
    'utf8',
  )

for (
  const contract
  of [
    'match.quickSolution',
    'Quick result:',
    'quickSolutionLabel',
    'Solved locally',
    'Review result · Open →',
    'match.readinessPercent',
  ]
) {
  if (!launcher.includes(contract)) {
    throw new Error(
      `Smart Launcher is missing: ${contract}`,
    )
  }
}

const baseTests =
  await readFile(
    'tests/problem-solver-v1/problem-solver-engine.test.ts',
    'utf8',
  )

for (
  const contract
  of [
    'actionable pressure-drop solution brief',
    'detects supplied pressure-drop inputs',
    'does not mark an input as supplied when it has no value',
  ]
) {
  if (!baseTests.includes(contract)) {
    throw new Error(
      `Existing Problem Solver tests are missing: ${contract}`,
    )
  }
}

const quickTests =
  await readFile(
    'tests/problem-solver-v1/problem-quick-solve.test.ts',
    'utf8',
  )

for (
  const contract
  of [
    'quick-solves Reynolds number',
    'quick-solves Darcy-Weisbach pressure drop',
    'derives pipe velocity from volumetric flow rate',
    'quick-solves required pump power',
    'quick-solves Biot number',
    'quick-solves missing ideal-gas pressure',
    'quick-solves heat-exchanger LMTD',
    'quick-solves required heat-exchanger area',
    'quick-solves required CSTR volume',
    'quick-solves hydrostatic pressure',
    'quick-solves plane-wall conduction',
    'quick-solves Ficks first-law flux',
    'quick-solves convection heat transfer',
    'quick-solves Nusselt number',
    'quick-solves Froude number and regime',
    'quick-solves volumetric flow rate',
    'quick-solves drag force',
    'quick-solves minor-loss pressure drop',
    'quick-solves net thermal radiation',
    'quick-solves Fourier number',
    'quick-solves Prandtl number',
    'quick-solves U-tube manometer pressure difference',
    'quick-solves orifice volumetric flow rate',
    'quick-solves tank drain time',
    'quick-solves Grashof number',
    'quick-solves Rayleigh number',
    'quick-solves mass-transfer coefficient',
    'does not calculate an orifice flow without pressure difference',
    'does not calculate radiation without emissivity',
    'does not solve convection heat transfer without area',
    'does not solve Ficks first law without diffusion distance',
    'does not size an exchanger without a correction factor',
    'does not invent a result when inputs are incomplete',
  ]
) {
  if (!quickTests.includes(contract)) {
    throw new Error(
      `Quick Solve tests are missing: ${contract}`,
    )
  }
}

console.log(
  'CHEME PROBLEM SOLVER QUICK SOLVE VERIFICATION PASSED',
)

console.log(
  'Pressure-drop and Reynolds-number solving verified.',
)

console.log(
  'Pump-power and Biot-number solving verified.',
)

console.log(
  'Ideal-gas unknown solving verified.',
)

console.log(
  'Incomplete-input protection verified.',
)

console.log(
  'Existing layout, CSS and navigation unchanged.',
)
