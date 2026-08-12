import {
  calculateTrapezoidalMaximumBedRiseBeforeChoking,
} from '../trapezoidal-max-bed-rise-choking/engine.ts'

import type {
  TrapezoidalChannelBedRiseCrestDepthInput,
  TrapezoidalChannelBedRiseCrestDepthResult,
} from './types.ts'

export const TRAPEZOIDAL_CHANNEL_BED_RISE_CREST_DEPTH_ENGINE_VERSION =
  'trapezoidal-channel-bed-rise-crest-depth-v1'

export type TrapezoidalChannelBedRiseCrestDepthErrorCode =
  | 'INVALID_BOTTOM_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_UPSTREAM_DEPTH'
  | 'INVALID_BED_RISE'
  | 'INVALID_DENSITY'
  | 'UPSTREAM_NOT_SUBCRITICAL'
  | 'ROOT_BRACKETING_FAILURE'
  | 'ROOT_CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalChannelBedRiseCrestDepthError
  extends Error {
  readonly code:
    TrapezoidalChannelBedRiseCrestDepthErrorCode

  constructor(
    code:
      TrapezoidalChannelBedRiseCrestDepthErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalChannelBedRiseCrestDepthError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

interface SectionState {
  flowArea: number

  topWidth: number

  hydraulicDepth: number

  velocity: number

  froudeNumber: number

  specificEnergy: number
}

function sectionState(
  input:
    TrapezoidalChannelBedRiseCrestDepthInput,
  depth: number,
): SectionState {
  const flowArea =
    depth *
    (
      input.bottomWidth +
      input.sideSlopeHorizontalPerVertical *
      depth
    )

  const topWidth =
    input.bottomWidth +
    2 *
    input.sideSlopeHorizontalPerVertical *
    depth

  const hydraulicDepth =
    flowArea /
    topWidth

  const velocity =
    input.volumetricFlowRate /
    flowArea

  const froudeNumber =
    velocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      hydraulicDepth,
    )

  const specificEnergy =
    depth +
    (
      velocity *
      velocity
    ) /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  return {
    flowArea,

    topWidth,

    hydraulicDepth,

    velocity,

    froudeNumber,

    specificEnergy,
  }
}

function solveSpecificEnergyRoot(
  input:
    TrapezoidalChannelBedRiseCrestDepthInput,

  targetSpecificEnergy: number,

  lowerInitial: number,

  upperInitial: number,

  increasingBranch: boolean,
): number {
  let lower =
    lowerInitial

  let upper =
    upperInitial

  let lowerResidual =
    sectionState(
      input,
      lower,
    ).specificEnergy -
    targetSpecificEnergy

  let upperResidual =
    sectionState(
      input,
      upper,
    ).specificEnergy -
    targetSpecificEnergy

  if (
    increasingBranch
  ) {
    let expansions =
      0

    while (
      upperResidual <
      0
    ) {
      upper *=
        2

      expansions +=
        1

      if (
        expansions >
        100 ||
        !Number.isFinite(
          upper,
        ) ||
        upper >
        1e12
      ) {
        throw new TrapezoidalChannelBedRiseCrestDepthError(
          'ROOT_BRACKETING_FAILURE',
          'Could not bracket the subcritical crest-depth root.',
        )
      }

      upperResidual =
        sectionState(
          input,
          upper,
        ).specificEnergy -
        targetSpecificEnergy
    }
  }

  if (
    !Number.isFinite(
      lowerResidual,
    ) ||
    !Number.isFinite(
      upperResidual,
    ) ||
    lowerResidual *
    upperResidual >
    0
  ) {
    throw new TrapezoidalChannelBedRiseCrestDepthError(
      'ROOT_BRACKETING_FAILURE',
      'Could not bracket the requested specific-energy depth root.',
    )
  }

  const tolerance =
    Math.max(
      1e-13,
      targetSpecificEnergy *
      1e-12,
    )

  for (
    let iteration = 1;
    iteration <= 250;
    iteration += 1
  ) {
    const depth =
      (
        lower +
        upper
      ) /
      2

    const residual =
      sectionState(
        input,
        depth,
      ).specificEnergy -
      targetSpecificEnergy

    if (
      Math.abs(
        residual,
      ) <=
      tolerance
    ) {
      return depth
    }

    if (
      lowerResidual *
      residual <=
      0
    ) {
      upper =
        depth

      upperResidual =
        residual
    } else {
      lower =
        depth

      lowerResidual =
        residual
    }
  }

  throw new TrapezoidalChannelBedRiseCrestDepthError(
    'ROOT_CONVERGENCE_FAILURE',
    'Specific-energy crest-depth solver did not converge within 250 iterations.',
  )
}

export function calculateTrapezoidalChannelBedRiseCrestDepth(
  input:
    TrapezoidalChannelBedRiseCrestDepthInput,
): TrapezoidalChannelBedRiseCrestDepthResult {
  if (
    !Number.isFinite(
      input.bottomWidth,
    ) ||
    input.bottomWidth <= 0
  ) {
    throw new TrapezoidalChannelBedRiseCrestDepthError(
      'INVALID_BOTTOM_WIDTH',
      'Channel bottom width must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.sideSlopeHorizontalPerVertical,
    ) ||
    input.sideSlopeHorizontalPerVertical < 0
  ) {
    throw new TrapezoidalChannelBedRiseCrestDepthError(
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
    throw new TrapezoidalChannelBedRiseCrestDepthError(
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
    throw new TrapezoidalChannelBedRiseCrestDepthError(
      'INVALID_UPSTREAM_DEPTH',
      'Upstream flow depth must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.bedRise,
    ) ||
    input.bedRise < 0
  ) {
    throw new TrapezoidalChannelBedRiseCrestDepthError(
      'INVALID_BED_RISE',
      'Specified bed rise must be a finite non-negative value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new TrapezoidalChannelBedRiseCrestDepthError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const upstream =
    sectionState(
      input,
      input.upstreamFlowDepth,
    )

  if (
    upstream.froudeNumber >=
    1 -
    1e-9
  ) {
    throw new TrapezoidalChannelBedRiseCrestDepthError(
      'UPSTREAM_NOT_SUBCRITICAL',
      'This hump-analysis calculator requires a clearly subcritical upstream approach flow.',
    )
  }

  const choking =
    calculateTrapezoidalMaximumBedRiseBeforeChoking({
      bottomWidth:
        input.bottomWidth,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      volumetricFlowRate:
        input.volumetricFlowRate,

      upstreamFlowDepth:
        input.upstreamFlowDepth,

      fluidDensity:
        input.fluidDensity,
    })

  const maximumBedRiseBeforeChoking =
    choking.maximumBedRise

  const criticalDepth =
    choking.criticalDepth

  const criticalSpecificEnergy =
    choking.criticalSpecificEnergy

  const nominalCrestSpecificEnergy =
    upstream.specificEnergy -
    input.bedRise

  const remainingBedRiseMargin =
    maximumBedRiseBeforeChoking -
    input.bedRise

  const bedRiseUtilizationRatio =
    input.bedRise /
    maximumBedRiseBeforeChoking

  const thresholdTolerance =
    Math.max(
      1e-10,
      upstream.specificEnergy *
      1e-10,
    )

  const additionalSpecificEnergyRequired =
    Math.max(
      0,
      -remainingBedRiseMargin,
    )

  const requiredUpstreamSpecificEnergy =
    criticalSpecificEnergy +
    input.bedRise

  let flowStatus:
    string

  let subcriticalCrestDepth:
    number | null =
    null

  let subcriticalCrestVelocity:
    number | null =
    null

  let subcriticalCrestFroudeNumber:
    number | null =
    null

  let supercriticalAlternateDepth:
    number | null =
    null

  let supercriticalAlternateVelocity:
    number | null =
    null

  let supercriticalAlternateFroudeNumber:
    number | null =
    null

  let crestWaterSurfaceElevationChange:
    number | null =
    null

  let subcriticalEnergyResidual:
    number | null =
    null

  let alternateEnergyResidual:
    number | null =
    null

  if (
    remainingBedRiseMargin <
    -thresholdTolerance
  ) {
    flowStatus =
      'Choked — upstream adjustment required'
  } else if (
    Math.abs(
      remainingBedRiseMargin,
    ) <=
    thresholdTolerance
  ) {
    flowStatus =
      'Critical choking threshold'

    const criticalState =
      sectionState(
        input,
        criticalDepth,
      )

    subcriticalCrestDepth =
      criticalDepth

    subcriticalCrestVelocity =
      criticalState.velocity

    subcriticalCrestFroudeNumber =
      criticalState.froudeNumber

    supercriticalAlternateDepth =
      criticalDepth

    supercriticalAlternateVelocity =
      criticalState.velocity

    supercriticalAlternateFroudeNumber =
      criticalState.froudeNumber

    crestWaterSurfaceElevationChange =
      input.bedRise +
      criticalDepth -
      input.upstreamFlowDepth

    subcriticalEnergyResidual =
      criticalState.specificEnergy -
      nominalCrestSpecificEnergy

    alternateEnergyResidual =
      subcriticalEnergyResidual
  } else {
    flowStatus =
      'Unchoked — subcritical crest solution available'

    const tinyDepth =
      Math.max(
        1e-12,
        criticalDepth *
        1e-10,
      )

    const shallowDepth =
      solveSpecificEnergyRoot(
        input,
        nominalCrestSpecificEnergy,
        tinyDepth,
        criticalDepth,
        false,
      )

    const deepDepth =
      solveSpecificEnergyRoot(
        input,
        nominalCrestSpecificEnergy,
        criticalDepth,
        Math.max(
          nominalCrestSpecificEnergy *
          2,
          criticalDepth *
          2,
          1,
        ),
        true,
      )

    const shallowState =
      sectionState(
        input,
        shallowDepth,
      )

    const deepState =
      sectionState(
        input,
        deepDepth,
      )

    subcriticalCrestDepth =
      deepDepth

    subcriticalCrestVelocity =
      deepState.velocity

    subcriticalCrestFroudeNumber =
      deepState.froudeNumber

    supercriticalAlternateDepth =
      shallowDepth

    supercriticalAlternateVelocity =
      shallowState.velocity

    supercriticalAlternateFroudeNumber =
      shallowState.froudeNumber

    crestWaterSurfaceElevationChange =
      input.bedRise +
      deepDepth -
      input.upstreamFlowDepth

    subcriticalEnergyResidual =
      deepState.specificEnergy -
      nominalCrestSpecificEnergy

    alternateEnergyResidual =
      shallowState.specificEnergy -
      nominalCrestSpecificEnergy
  }

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const baseValues = [
    upstream.flowArea,

    upstream.velocity,

    upstream.froudeNumber,

    upstream.specificEnergy,

    maximumBedRiseBeforeChoking,

    criticalDepth,

    criticalSpecificEnergy,

    massFlowRate,
  ]

  if (
    !baseValues.every(
      value =>
        Number.isFinite(value),
    ) ||
    baseValues.some(
      value =>
        value <= 0,
    ) ||
    !Number.isFinite(
      nominalCrestSpecificEnergy,
    ) ||
    !Number.isFinite(
      remainingBedRiseMargin,
    ) ||
    !Number.isFinite(
      bedRiseUtilizationRatio,
    ) ||
    !Number.isFinite(
      additionalSpecificEnergyRequired,
    ) ||
    !Number.isFinite(
      requiredUpstreamSpecificEnergy,
    )
  ) {
    throw new TrapezoidalChannelBedRiseCrestDepthError(
      'NUMERICAL_FAILURE',
      'The hump-flow calculation produced a non-finite base result.',
    )
  }

  if (
    subcriticalCrestDepth !==
      null &&
    supercriticalAlternateDepth !==
      null &&
    subcriticalCrestVelocity !==
      null &&
    supercriticalAlternateVelocity !==
      null &&
    subcriticalCrestFroudeNumber !==
      null &&
    supercriticalAlternateFroudeNumber !==
      null
  ) {
    const branchValues = [
      subcriticalCrestDepth,

      supercriticalAlternateDepth,

      subcriticalCrestVelocity,

      supercriticalAlternateVelocity,

      subcriticalCrestFroudeNumber,

      supercriticalAlternateFroudeNumber,
    ]

    if (
      !branchValues.every(
        value =>
          Number.isFinite(value),
      ) ||
      branchValues.some(
        value =>
          value <= 0,
      ) ||
      subcriticalEnergyResidual ===
        null ||
      alternateEnergyResidual ===
        null ||
      Math.abs(
        subcriticalEnergyResidual,
      ) >
        1e-9 ||
      Math.abs(
        alternateEnergyResidual,
      ) >
        1e-9
    ) {
      throw new TrapezoidalChannelBedRiseCrestDepthError(
        'NUMERICAL_FAILURE',
        'The crest-depth roots failed the specific-energy closure check.',
      )
    }
  }

  return {
    upstreamFlowArea:
      upstream.flowArea,

    upstreamVelocity:
      upstream.velocity,

    upstreamFroudeNumber:
      upstream.froudeNumber,

    upstreamSpecificEnergy:
      upstream.specificEnergy,

    specifiedBedRise:
      input.bedRise,

    maximumBedRiseBeforeChoking,

    remainingBedRiseMargin,

    bedRiseUtilizationRatio,

    nominalCrestSpecificEnergy,

    criticalDepth,

    criticalSpecificEnergy,

    flowStatus,

    additionalSpecificEnergyRequired,

    requiredUpstreamSpecificEnergy,

    subcriticalCrestDepth,

    subcriticalCrestVelocity,

    subcriticalCrestFroudeNumber,

    supercriticalAlternateDepth,

    supercriticalAlternateVelocity,

    supercriticalAlternateFroudeNumber,

    crestWaterSurfaceElevationChange,

    subcriticalEnergyResidual,

    alternateEnergyResidual,

    massFlowRate,

    modelName:
      'Trapezoidal Channel Flow over Specified Bed Rise',

    limitationDescription:
      'Lossless one-dimensional hump analysis for a subcritical approach flow in a symmetric trapezoidal channel. Below the choking limit, both the physical subcritical crest depth and the alternate supercritical specific-energy root are reported. Above the choking limit, the specified upstream state cannot pass the hump without upstream adjustment.',
  }
}

export function createTrapezoidalChannelBedRiseCrestDepthCsv(
  input:
    TrapezoidalChannelBedRiseCrestDepthInput,
  result:
    TrapezoidalChannelBedRiseCrestDepthResult,
): string {
  const rows = [
    [
      'Trapezoidal Channel Flow over Specified Bed Rise',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Bottom width',
      input.bottomWidth,
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
      'Specified bed rise',
      input.bedRise,
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
      'Flow status',
      result.flowStatus,
      '-',
    ],
    [
      'Upstream specific energy',
      result.upstreamSpecificEnergy,
      'm',
    ],
    [
      'Nominal crest specific energy',
      result.nominalCrestSpecificEnergy,
      'm',
    ],
    [
      'Maximum bed rise before choking',
      result.maximumBedRiseBeforeChoking,
      'm',
    ],
    [
      'Remaining bed-rise margin',
      result.remainingBedRiseMargin,
      'm',
    ],
    [
      'Bed-rise utilization ratio',
      result.bedRiseUtilizationRatio,
      '-',
    ],
    [
      'Critical depth',
      result.criticalDepth,
      'm',
    ],
    [
      'Critical specific energy',
      result.criticalSpecificEnergy,
      'm',
    ],
    [
      'Subcritical crest depth',
      result.subcriticalCrestDepth ?? '',
      'm',
    ],
    [
      'Subcritical crest Froude number',
      result.subcriticalCrestFroudeNumber ?? '',
      '-',
    ],
    [
      'Supercritical alternate depth',
      result.supercriticalAlternateDepth ?? '',
      'm',
    ],
    [
      'Supercritical alternate Froude number',
      result.supercriticalAlternateFroudeNumber ?? '',
      '-',
    ],
    [
      'Crest water-surface elevation change',
      result.crestWaterSurfaceElevationChange ?? '',
      'm',
    ],
    [
      'Additional specific energy required',
      result.additionalSpecificEnergyRequired,
      'm',
    ],
    [
      'Required upstream specific energy',
      result.requiredUpstreamSpecificEnergy,
      'm',
    ],
    [
      'Subcritical energy residual',
      result.subcriticalEnergyResidual ?? '',
      'm',
    ],
    [
      'Alternate energy residual',
      result.alternateEnergyResidual ?? '',
      'm',
    ],
    [
      'Mass flow rate',
      result.massFlowRate,
      'kg/s',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
