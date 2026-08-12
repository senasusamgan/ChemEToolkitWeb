import {
  calculateTrapezoidalCriticalControlWidth,
} from '../trapezoidal-critical-control-width/engine.ts'

import type {
  TrapezoidalMinimumContractionWidthInput,
  TrapezoidalMinimumContractionWidthResult,
} from './types.ts'

export const TRAPEZOIDAL_MINIMUM_CONTRACTION_WIDTH_ENGINE_VERSION =
  'trapezoidal-minimum-contraction-width-v1'

export type TrapezoidalMinimumContractionWidthErrorCode =
  | 'INVALID_UPSTREAM_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_UPSTREAM_DEPTH'
  | 'INVALID_DENSITY'
  | 'UPSTREAM_NOT_SUBCRITICAL'
  | 'NO_POSITIVE_WIDTH_CHOKING_LIMIT'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalMinimumContractionWidthError
  extends Error {
  readonly code:
    TrapezoidalMinimumContractionWidthErrorCode

  constructor(
    code:
      TrapezoidalMinimumContractionWidthErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalMinimumContractionWidthError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

export function calculateTrapezoidalMinimumContractionWidth(
  input:
    TrapezoidalMinimumContractionWidthInput,
): TrapezoidalMinimumContractionWidthResult {
  if (
    !Number.isFinite(
      input.upstreamBottomWidth,
    ) ||
    input.upstreamBottomWidth <= 0
  ) {
    throw new TrapezoidalMinimumContractionWidthError(
      'INVALID_UPSTREAM_WIDTH',
      'Upstream bottom width must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.sideSlopeHorizontalPerVertical,
    ) ||
    input.sideSlopeHorizontalPerVertical < 0
  ) {
    throw new TrapezoidalMinimumContractionWidthError(
      'INVALID_SIDE_SLOPE',
      'Side slope z must be a finite non-negative horizontal-to-vertical ratio.',
    )
  }

  if (
    !Number.isFinite(
      input.volumetricFlowRate,
    ) ||
    input.volumetricFlowRate <= 0
  ) {
    throw new TrapezoidalMinimumContractionWidthError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.upstreamFlowDepth,
    ) ||
    input.upstreamFlowDepth <= 0
  ) {
    throw new TrapezoidalMinimumContractionWidthError(
      'INVALID_UPSTREAM_DEPTH',
      'Upstream flow depth must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new TrapezoidalMinimumContractionWidthError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const b1 =
    input.upstreamBottomWidth

  const z =
    input.sideSlopeHorizontalPerVertical

  const y1 =
    input.upstreamFlowDepth

  const upstreamFlowArea =
    y1 *
    (
      b1 +
      z *
      y1
    )

  const upstreamTopWidth =
    b1 +
    2 *
    z *
    y1

  const upstreamHydraulicDepth =
    upstreamFlowArea /
    upstreamTopWidth

  const upstreamVelocity =
    input.volumetricFlowRate /
    upstreamFlowArea

  const upstreamVelocityHead =
    (
      upstreamVelocity *
      upstreamVelocity
    ) /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const upstreamFroudeNumber =
    upstreamVelocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      upstreamHydraulicDepth,
    )

  if (
    upstreamFroudeNumber >=
    1 -
    1e-9
  ) {
    throw new TrapezoidalMinimumContractionWidthError(
      'UPSTREAM_NOT_SUBCRITICAL',
      'The contraction-choking model requires a clearly subcritical upstream approach flow.',
    )
  }

  const upstreamSpecificEnergy =
    y1 +
    upstreamVelocityHead

  const triangularCriticalDepth =
    (
      4 /
      5
    ) *
    upstreamSpecificEnergy

  const zeroBottomWidthCapacity =
    z === 0
      ? 0
      : z *
        Math.sqrt(
          GRAVITATIONAL_ACCELERATION /
          2,
        ) *
        triangularCriticalDepth **
          (
            5 / 2
          )

  const flowTolerance =
    Math.max(
      1e-10,
      input.volumetricFlowRate *
      1e-10,
    )

  if (
    z > 0 &&
    input.volumetricFlowRate <=
      zeroBottomWidthCapacity +
      flowTolerance
  ) {
    throw new TrapezoidalMinimumContractionWidthError(
      'NO_POSITIVE_WIDTH_CHOKING_LIMIT',
      'At the available upstream specific energy, the triangular zero-bottom-width limiting section can already pass the requested discharge. Bottom-width contraction alone therefore does not reach choking at a strictly positive width.',
    )
  }

  const criticalDesign =
    calculateTrapezoidalCriticalControlWidth({
      volumetricFlowRate:
        input.volumetricFlowRate,

      availableSpecificEnergy:
        upstreamSpecificEnergy,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      fluidDensity:
        input.fluidDensity,
    })

  const minimumContractedBottomWidth =
    criticalDesign.requiredBottomWidth

  const widthTolerance =
    Math.max(
      1e-10,
      input.upstreamBottomWidth *
      1e-9,
    )

  if (
    minimumContractedBottomWidth >=
    input.upstreamBottomWidth -
    widthTolerance
  ) {
    throw new TrapezoidalMinimumContractionWidthError(
      'NUMERICAL_FAILURE',
      'The calculated choking width is not smaller than the subcritical upstream bottom width.',
    )
  }

  const bottomWidthReduction =
    input.upstreamBottomWidth -
    minimumContractedBottomWidth

  const contractionRatio =
    minimumContractedBottomWidth /
    input.upstreamBottomWidth

  const bottomWidthReductionPercent =
    (
      1 -
      contractionRatio
    ) *
    100

  const criticalThroatDepth =
    criticalDesign.criticalDepth

  const criticalThroatFlowArea =
    criticalDesign.criticalFlowArea

  const criticalThroatTopWidth =
    criticalDesign.criticalTopWidth

  const criticalThroatHydraulicDepth =
    criticalDesign.criticalHydraulicDepth

  const criticalThroatVelocity =
    criticalDesign.criticalVelocity

  const criticalThroatFroudeNumber =
    criticalDesign.criticalFroudeNumber

  const criticalThroatSpecificEnergy =
    criticalDesign.recoveredSpecificEnergy

  const waterSurfaceElevationChangeAtChoking =
    criticalThroatDepth -
    input.upstreamFlowDepth

  const flowMarginAboveTriangularLimit =
    input.volumetricFlowRate -
    zeroBottomWidthCapacity

  const reconstructedCriticalCapacity =
    criticalDesign.reconstructedMaximumFlowRate

  const flowClosureResidual =
    reconstructedCriticalCapacity -
    input.volumetricFlowRate

  const energyClosureResidual =
    criticalThroatSpecificEnergy -
    upstreamSpecificEnergy

  const criticalConditionResidual =
    criticalDesign.criticalConditionResidual

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const positiveValues = [
    upstreamFlowArea,

    upstreamTopWidth,

    upstreamHydraulicDepth,

    upstreamVelocity,

    upstreamVelocityHead,

    upstreamFroudeNumber,

    upstreamSpecificEnergy,

    minimumContractedBottomWidth,

    bottomWidthReduction,

    bottomWidthReductionPercent,

    contractionRatio,

    criticalThroatDepth,

    criticalThroatFlowArea,

    criticalThroatTopWidth,

    criticalThroatHydraulicDepth,

    criticalThroatVelocity,

    criticalThroatFroudeNumber,

    criticalThroatSpecificEnergy,

    flowMarginAboveTriangularLimit,

    reconstructedCriticalCapacity,

    massFlowRate,
  ]

  const energyTolerance =
    Math.max(
      1e-10,
      upstreamSpecificEnergy *
      1e-9,
    )

  if (
    !positiveValues.every(
      value =>
        Number.isFinite(value),
    ) ||
    positiveValues.some(
      value =>
        value <= 0,
    ) ||
    contractionRatio >=
      1 ||
    upstreamFroudeNumber >=
      1 ||
    Math.abs(
      criticalThroatFroudeNumber -
      1
    ) >
      1e-9 ||
    !Number.isFinite(
      waterSurfaceElevationChangeAtChoking,
    ) ||
    !Number.isFinite(
      zeroBottomWidthCapacity,
    ) ||
    zeroBottomWidthCapacity < 0 ||
    !Number.isFinite(
      flowClosureResidual,
    ) ||
    Math.abs(
      flowClosureResidual,
    ) >
      flowTolerance ||
    !Number.isFinite(
      energyClosureResidual,
    ) ||
    Math.abs(
      energyClosureResidual,
    ) >
      energyTolerance ||
    !Number.isFinite(
      criticalConditionResidual,
    ) ||
    Math.abs(
      criticalConditionResidual,
    ) >
      1e-9
  ) {
    throw new TrapezoidalMinimumContractionWidthError(
      'NUMERICAL_FAILURE',
      'The contraction-choking calculation failed its energy, discharge or critical-flow closure checks.',
    )
  }

  return {
    upstreamBottomWidth:
      input.upstreamBottomWidth,

    upstreamFlowDepth:
      input.upstreamFlowDepth,

    upstreamFlowArea,

    upstreamTopWidth,

    upstreamHydraulicDepth,

    upstreamVelocity,

    upstreamVelocityHead,

    upstreamFroudeNumber,

    upstreamSpecificEnergy,

    minimumContractedBottomWidth,

    bottomWidthReduction,

    bottomWidthReductionPercent,

    contractionRatio,

    criticalThroatDepth,

    criticalThroatFlowArea,

    criticalThroatTopWidth,

    criticalThroatHydraulicDepth,

    criticalThroatVelocity,

    criticalThroatFroudeNumber,

    criticalThroatSpecificEnergy,

    waterSurfaceElevationChangeAtChoking,

    zeroBottomWidthCapacity,

    flowMarginAboveTriangularLimit,

    reconstructedCriticalCapacity,

    flowClosureResidual,

    energyClosureResidual,

    criticalConditionResidual,

    massFlowRate,

    widthSolverIterations:
      criticalDesign.solverIterations,

    modelName:
      'Minimum Trapezoidal Channel Contraction Width Before Choking',

    limitationDescription:
      'Lossless one-dimensional lateral-contraction analysis for a subcritical trapezoidal-channel approach flow. The minimum contracted bottom width is the positive-width control section at which the available upstream specific energy produces critical flow. Bed elevation is assumed unchanged and local contraction losses are neglected.',
  }
}

export function createTrapezoidalMinimumContractionWidthCsv(
  input:
    TrapezoidalMinimumContractionWidthInput,
  result:
    TrapezoidalMinimumContractionWidthResult,
): string {
  const rows = [
    [
      'Minimum Trapezoidal Channel Contraction Width Before Choking',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Upstream bottom width',
      input.upstreamBottomWidth,
      'm',
    ],
    [
      'Side slope z',
      input.sideSlopeHorizontalPerVertical,
      'H:V',
    ],
    [
      'Volumetric flow rate',
      input.volumetricFlowRate,
      'm3/s',
    ],
    [
      'Upstream flow depth',
      input.upstreamFlowDepth,
      'm',
    ],
    [
      'Fluid density',
      input.fluidDensity,
      'kg/m3',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Minimum contracted bottom width',
      result.minimumContractedBottomWidth,
      'm',
    ],
    [
      'Bottom-width reduction',
      result.bottomWidthReduction,
      'm',
    ],
    [
      'Bottom-width reduction',
      result.bottomWidthReductionPercent,
      '%',
    ],
    [
      'Contraction ratio',
      result.contractionRatio,
      '-',
    ],
    [
      'Upstream specific energy',
      result.upstreamSpecificEnergy,
      'm',
    ],
    [
      'Upstream Froude number',
      result.upstreamFroudeNumber,
      '-',
    ],
    [
      'Critical throat depth',
      result.criticalThroatDepth,
      'm',
    ],
    [
      'Critical throat flow area',
      result.criticalThroatFlowArea,
      'm2',
    ],
    [
      'Critical throat top width',
      result.criticalThroatTopWidth,
      'm',
    ],
    [
      'Critical throat velocity',
      result.criticalThroatVelocity,
      'm/s',
    ],
    [
      'Critical throat Froude number',
      result.criticalThroatFroudeNumber,
      '-',
    ],
    [
      'Critical throat specific energy',
      result.criticalThroatSpecificEnergy,
      'm',
    ],
    [
      'Water-surface elevation change at choking',
      result.waterSurfaceElevationChangeAtChoking,
      'm',
    ],
    [
      'Triangular zero-width capacity',
      result.zeroBottomWidthCapacity,
      'm3/s',
    ],
    [
      'Flow margin above triangular limit',
      result.flowMarginAboveTriangularLimit,
      'm3/s',
    ],
    [
      'Reconstructed critical capacity',
      result.reconstructedCriticalCapacity,
      'm3/s',
    ],
    [
      'Flow closure residual',
      result.flowClosureResidual,
      'm3/s',
    ],
    [
      'Energy closure residual',
      result.energyClosureResidual,
      'm',
    ],
    [
      'Critical condition residual',
      result.criticalConditionResidual,
      '-',
    ],
    [
      'Mass flow rate',
      result.massFlowRate,
      'kg/s',
    ],
    [
      'Width solver iterations',
      result.widthSolverIterations,
      '-',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
