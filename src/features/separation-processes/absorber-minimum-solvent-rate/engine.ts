import type {
  AbsorberMinimumSolventRateInput,
  AbsorberMinimumSolventRateResult,
  AbsorberSolventRateStatus,
} from './types.ts'

export const ABSORBER_MINIMUM_SOLVENT_RATE_ENGINE_VERSION =
  'absorber-minimum-solvent-rate-v1'

export type AbsorberMinimumSolventRateErrorCode =
  | 'INVALID_GAS_FLOW'
  | 'INVALID_GAS_COMPOSITION'
  | 'INVALID_LIQUID_COMPOSITION'
  | 'INVALID_EQUILIBRIUM_SLOPE'
  | 'INVALID_DESIGN_FACTOR'
  | 'INVALID_PINCH_CONDITION'

export class AbsorberMinimumSolventRateError
  extends Error {
  readonly code:
    AbsorberMinimumSolventRateErrorCode

  constructor(
    code:
      AbsorberMinimumSolventRateErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'AbsorberMinimumSolventRateError'

    this.code =
      code
  }
}

function requirePositive(
  value: number,
  code:
    AbsorberMinimumSolventRateErrorCode,
  label: string,
): void {
  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    throw new AbsorberMinimumSolventRateError(
      code,
      `${label} must be a positive finite number.`,
    )
  }
}

function requireGasFraction(
  value: number,
  code:
    AbsorberMinimumSolventRateErrorCode,
  label: string,
): void {
  if (
    !Number.isFinite(value) ||
    value <= 0 ||
    value >= 1
  ) {
    throw new AbsorberMinimumSolventRateError(
      code,
      `${label} must be between 0 and 1.`,
    )
  }
}

function requireLiquidFraction(
  value: number,
): void {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value >= 1
  ) {
    throw new AbsorberMinimumSolventRateError(
      'INVALID_LIQUID_COMPOSITION',
      'Inlet liquid solute mole fraction must be at least 0 and below 1.',
    )
  }
}

function determineStatus(
  designFactor: number,
): AbsorberSolventRateStatus {
  return (
    Math.abs(
      designFactor - 1,
    ) <= 1e-12
      ? 'minimum'
      : 'above-minimum'
  )
}

export function calculateAbsorberMinimumSolventRate(
  input:
    AbsorberMinimumSolventRateInput,
): AbsorberMinimumSolventRateResult {
  requirePositive(
    input.gasMolarFlowRate,
    'INVALID_GAS_FLOW',
    'Gas molar flow rate',
  )

  requireGasFraction(
    input.inletGasSoluteMoleFraction,
    'INVALID_GAS_COMPOSITION',
    'Inlet gas solute mole fraction',
  )

  requireGasFraction(
    input.outletGasSoluteMoleFraction,
    'INVALID_GAS_COMPOSITION',
    'Outlet gas solute mole fraction',
  )

  if (
    input.outletGasSoluteMoleFraction >=
    input.inletGasSoluteMoleFraction
  ) {
    throw new AbsorberMinimumSolventRateError(
      'INVALID_GAS_COMPOSITION',
      'Outlet gas solute mole fraction must be lower than inlet composition.',
    )
  }

  requireLiquidFraction(
    input.inletLiquidSoluteMoleFraction,
  )

  requirePositive(
    input.equilibriumSlope,
    'INVALID_EQUILIBRIUM_SLOPE',
    'Equilibrium slope',
  )

  if (
    !Number.isFinite(
      input.solventDesignFactor,
    ) ||
    input.solventDesignFactor < 1
  ) {
    throw new AbsorberMinimumSolventRateError(
      'INVALID_DESIGN_FACTOR',
      'Solvent design factor must be at least 1.0 times the minimum solvent rate.',
    )
  }

  const gasFlow =
    input.gasMolarFlowRate

  const yIn =
    input.inletGasSoluteMoleFraction

  const yOut =
    input.outletGasSoluteMoleFraction

  const xIn =
    input.inletLiquidSoluteMoleFraction

  const m =
    input.equilibriumSlope

  const pinchLiquidMoleFraction =
    yIn / m

  if (
    !Number.isFinite(
      pinchLiquidMoleFraction,
    ) ||
    pinchLiquidMoleFraction <= xIn ||
    pinchLiquidMoleFraction >= 1
  ) {
    throw new AbsorberMinimumSolventRateError(
      'INVALID_PINCH_CONDITION',
      'The bottom-pinch liquid composition must be greater than the entering-liquid composition and below unity.',
    )
  }

  const soluteRemovalRate =
    gasFlow *
    (yIn - yOut)

  const minimumLiquidToGasRatio =
    (
      yIn - yOut
    ) /
    (
      pinchLiquidMoleFraction -
      xIn
    )

  const minimumSolventMolarFlowRate =
    minimumLiquidToGasRatio *
    gasFlow

  const designSolventMolarFlowRate =
    minimumSolventMolarFlowRate *
    input.solventDesignFactor

  const designLiquidToGasRatio =
    designSolventMolarFlowRate /
    gasFlow

  const minimumAbsorptionFactor =
    minimumLiquidToGasRatio /
    m

  const designAbsorptionFactor =
    designLiquidToGasRatio /
    m

  const outletLiquidSoluteMoleFraction =
    xIn +
    (
      gasFlow /
      designSolventMolarFlowRate
    ) *
    (
      yIn - yOut
    )

  const operatingLineSlope =
    designLiquidToGasRatio

  const operatingLineIntercept =
    yOut -
    operatingLineSlope *
    xIn

  const bottomEquilibriumGasMoleFraction =
    m *
    outletLiquidSoluteMoleFraction

  const bottomDrivingForce =
    yIn -
    bottomEquilibriumGasMoleFraction

  const solventMarginPercent =
    (
      input.solventDesignFactor -
      1
    ) * 100

  return {
    modelName:
      'Absorber Minimum Solvent Rate & Operating Line',
    limitationDescription:
      'This calculator uses a dilute constant-molar-flow absorber model with linear equilibrium y*=mx and a bottom pinch to estimate minimum solvent rate. Rigorous design may require solute-free ratios, nonlinear equilibrium data, heat effects, pressure effects, stage efficiency, hydraulics and rate-based mass-transfer calculations.',
    status:
      determineStatus(
        input.solventDesignFactor,
      ),
    soluteRemovalRate,
    pinchLiquidMoleFraction,
    minimumLiquidToGasRatio,
    minimumSolventMolarFlowRate,
    designSolventMolarFlowRate,
    designLiquidToGasRatio,
    minimumAbsorptionFactor,
    designAbsorptionFactor,
    outletLiquidSoluteMoleFraction,
    operatingLineSlope,
    operatingLineIntercept,
    bottomEquilibriumGasMoleFraction,
    bottomDrivingForce,
    solventMarginPercent,
  }
}

export function createAbsorberMinimumSolventRateCsv(
  input:
    AbsorberMinimumSolventRateInput,
  result:
    AbsorberMinimumSolventRateResult,
): string {
  const rows = [
    [
      'Absorber Minimum Solvent Rate & Operating Line',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Gas molar flow rate',
      input.gasMolarFlowRate,
      'kmol/h',
    ],
    [
      'Inlet gas solute mole fraction',
      input.inletGasSoluteMoleFraction,
      '-',
    ],
    [
      'Outlet gas solute mole fraction',
      input.outletGasSoluteMoleFraction,
      '-',
    ],
    [
      'Inlet liquid solute mole fraction',
      input.inletLiquidSoluteMoleFraction,
      '-',
    ],
    [
      'Equilibrium slope',
      input.equilibriumSlope,
      '-',
    ],
    [
      'Solvent design factor',
      input.solventDesignFactor,
      'x Lmin',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Minimum solvent molar flow rate',
      result.minimumSolventMolarFlowRate,
      'kmol/h',
    ],
    [
      'Design solvent molar flow rate',
      result.designSolventMolarFlowRate,
      'kmol/h',
    ],
    [
      'Design absorption factor',
      result.designAbsorptionFactor,
      '-',
    ],
    [
      'Outlet liquid solute mole fraction',
      result.outletLiquidSoluteMoleFraction,
      '-',
    ],
    [
      'Bottom driving force',
      result.bottomDrivingForce,
      'mole fraction',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
