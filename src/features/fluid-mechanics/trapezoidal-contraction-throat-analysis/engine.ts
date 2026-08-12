import {
  calculateTrapezoidalChannelCriticalDepth,
} from '../trapezoidal-channel-critical-depth/engine.ts'

import {
  calculateTrapezoidalMaximumDischargeSpecificEnergy,
} from '../trapezoidal-max-discharge-specific-energy/engine.ts'

import {
  calculateTrapezoidalMinimumContractionWidth,
} from '../trapezoidal-min-contraction-width/engine.ts'

import type {
  TrapezoidalContractionThroatAnalysisInput,
  TrapezoidalContractionThroatAnalysisResult,
} from './types.ts'

export const TRAPEZOIDAL_CONTRACTION_THROAT_ANALYSIS_ENGINE_VERSION =
  'trapezoidal-contraction-throat-analysis-v1'

export type TrapezoidalContractionThroatAnalysisErrorCode =
  | 'INVALID_UPSTREAM_WIDTH'
  | 'INVALID_CONTRACTED_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_UPSTREAM_DEPTH'
  | 'INVALID_DENSITY'
  | 'UPSTREAM_NOT_SUBCRITICAL'
  | 'ROOT_BRACKETING_FAILURE'
  | 'ROOT_CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalContractionThroatAnalysisError
  extends Error {
  readonly code:
    TrapezoidalContractionThroatAnalysisErrorCode

  constructor(
    code:
      TrapezoidalContractionThroatAnalysisErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalContractionThroatAnalysisError'

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
  bottomWidth: number,

  sideSlopeHorizontalPerVertical: number,

  volumetricFlowRate: number,

  depth: number,
): SectionState {
  const flowArea =
    depth *
    (
      bottomWidth +
      sideSlopeHorizontalPerVertical *
      depth
    )

  const topWidth =
    bottomWidth +
    2 *
    sideSlopeHorizontalPerVertical *
    depth

  const hydraulicDepth =
    flowArea /
    topWidth

  const velocity =
    volumetricFlowRate /
    flowArea

  const froudeNumber =
    velocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      hydraulicDepth,
    )

  const specificEnergy =
    depth +
    velocity *
    velocity /
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

function solveEnergyRoot(
  input:
    TrapezoidalContractionThroatAnalysisInput,

  targetSpecificEnergy: number,

  lowerInitial: number,

  upperInitial: number,

  expandingUpper: boolean,
): number {
  let lower =
    lowerInitial

  let upper =
    upperInitial

  const residualAt =
    (
      depth: number,
    ) =>
      sectionState(
        input.contractedBottomWidth,
        input.sideSlopeHorizontalPerVertical,
        input.volumetricFlowRate,
        depth,
      ).specificEnergy -
      targetSpecificEnergy

  let lowerResidual =
    residualAt(lower)

  let upperResidual =
    residualAt(upper)

  if (
    expandingUpper
  ) {
    let expansions =
      0

    while (
      upperResidual <
      0
    ) {
      upper *= 2

      expansions += 1

      if (
        expansions >
        100 ||
        !Number.isFinite(upper) ||
        upper >
        1e12
      ) {
        throw new TrapezoidalContractionThroatAnalysisError(
          'ROOT_BRACKETING_FAILURE',
          'Could not bracket the subcritical throat-depth root.',
        )
      }

      upperResidual =
        residualAt(upper)
    }
  }

  if (
    !Number.isFinite(lowerResidual) ||
    !Number.isFinite(upperResidual) ||
    lowerResidual *
      upperResidual >
      0
  ) {
    throw new TrapezoidalContractionThroatAnalysisError(
      'ROOT_BRACKETING_FAILURE',
      'Could not bracket the requested throat specific-energy root.',
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
      residualAt(depth)

    if (
      Math.abs(residual) <=
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

  throw new TrapezoidalContractionThroatAnalysisError(
    'ROOT_CONVERGENCE_FAILURE',
    'Throat specific-energy root solver did not converge within 250 iterations.',
  )
}

export function calculateTrapezoidalContractionThroatAnalysis(
  input:
    TrapezoidalContractionThroatAnalysisInput,
): TrapezoidalContractionThroatAnalysisResult {
  if (
    !Number.isFinite(
      input.upstreamBottomWidth,
    ) ||
    input.upstreamBottomWidth <= 0
  ) {
    throw new TrapezoidalContractionThroatAnalysisError(
      'INVALID_UPSTREAM_WIDTH',
      'Upstream bottom width must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.contractedBottomWidth,
    ) ||
    input.contractedBottomWidth <= 0 ||
    input.contractedBottomWidth >=
      input.upstreamBottomWidth
  ) {
    throw new TrapezoidalContractionThroatAnalysisError(
      'INVALID_CONTRACTED_WIDTH',
      'Contracted bottom width must be positive and smaller than the upstream bottom width.',
    )
  }

  if (
    !Number.isFinite(
      input.sideSlopeHorizontalPerVertical,
    ) ||
    input.sideSlopeHorizontalPerVertical < 0
  ) {
    throw new TrapezoidalContractionThroatAnalysisError(
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
    throw new TrapezoidalContractionThroatAnalysisError(
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
    throw new TrapezoidalContractionThroatAnalysisError(
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
    throw new TrapezoidalContractionThroatAnalysisError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const upstream =
    sectionState(
      input.upstreamBottomWidth,

      input.sideSlopeHorizontalPerVertical,

      input.volumetricFlowRate,

      input.upstreamFlowDepth,
    )

  if (
    upstream.froudeNumber >=
    1 -
    1e-9
  ) {
    throw new TrapezoidalContractionThroatAnalysisError(
      'UPSTREAM_NOT_SUBCRITICAL',
      'The specified-contraction model requires a clearly subcritical upstream approach flow.',
    )
  }

  const critical =
    calculateTrapezoidalChannelCriticalDepth({
      bottomWidth:
        input.contractedBottomWidth,

      volumetricFlowRate:
        input.volumetricFlowRate,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      fluidDensity:
        input.fluidDensity,
    })

  const throatCriticalDepth =
    critical.criticalDepth

  const throatCriticalSpecificEnergy =
    critical.specificEnergy

  const capacity =
    calculateTrapezoidalMaximumDischargeSpecificEnergy({
      bottomWidth:
        input.contractedBottomWidth,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      availableSpecificEnergy:
        upstream.specificEnergy,

      fluidDensity:
        input.fluidDensity,
    })

  const maximumPassableFlowAtAvailableEnergy =
    capacity.maximumVolumetricFlowRate

  const flowCapacityMargin =
    maximumPassableFlowAtAvailableEnergy -
    input.volumetricFlowRate

  const availableSpecificEnergyMargin =
    upstream.specificEnergy -
    throatCriticalSpecificEnergy

  const additionalSpecificEnergyRequired =
    Math.max(
      0,
      -availableSpecificEnergyMargin,
    )

  const z =
    input.sideSlopeHorizontalPerVertical

  const triangularCriticalDepth =
    (
      4 /
      5
    ) *
    upstream.specificEnergy

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

  let minimumContractedBottomWidth =
    0

  if (
    input.volumetricFlowRate >
    zeroBottomWidthCapacity +
    flowTolerance
  ) {
    minimumContractedBottomWidth =
      calculateTrapezoidalMinimumContractionWidth({
        upstreamBottomWidth:
          input.upstreamBottomWidth,

        sideSlopeHorizontalPerVertical:
          input.sideSlopeHorizontalPerVertical,

        volumetricFlowRate:
          input.volumetricFlowRate,

        upstreamFlowDepth:
          input.upstreamFlowDepth,

        fluidDensity:
          input.fluidDensity,
      }).minimumContractedBottomWidth
  }

  const remainingWidthMargin =
    input.contractedBottomWidth -
    minimumContractedBottomWidth

  const contractionRatio =
    input.contractedBottomWidth /
    input.upstreamBottomWidth

  const widthLimitUtilizationPercent =
    minimumContractedBottomWidth >
    0
      ? (
          (
            input.upstreamBottomWidth -
            input.contractedBottomWidth
          ) /
          (
            input.upstreamBottomWidth -
            minimumContractedBottomWidth
          )
        ) *
        100
      : (
          (
            input.upstreamBottomWidth -
            input.contractedBottomWidth
          ) /
          input.upstreamBottomWidth
        ) *
        100

  const thresholdTolerance =
    Math.max(
      1e-9,
      input.upstreamBottomWidth *
      1e-8,
    )

  let throatStatus =
    ''

  let subcriticalThroatDepth:
    number | null =
    null

  let subcriticalThroatVelocity:
    number | null =
    null

  let subcriticalThroatFroudeNumber:
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

  let waterSurfaceElevationChange:
    number | null =
    null

  let subcriticalEnergyResidual:
    number | null =
    null

  let alternateEnergyResidual:
    number | null =
    null

  if (
    availableSpecificEnergyMargin <
    -1e-9
  ) {
    throatStatus =
      'Choked — upstream adjustment required'
  } else if (
    Math.abs(
      availableSpecificEnergyMargin,
    ) <=
      1e-9 ||
    (
      minimumContractedBottomWidth >
      0 &&
      Math.abs(
        remainingWidthMargin,
      ) <=
        thresholdTolerance
    )
  ) {
    throatStatus =
      'Critical contraction threshold'

    const state =
      sectionState(
        input.contractedBottomWidth,

        input.sideSlopeHorizontalPerVertical,

        input.volumetricFlowRate,

        throatCriticalDepth,
      )

    subcriticalThroatDepth =
      throatCriticalDepth

    subcriticalThroatVelocity =
      state.velocity

    subcriticalThroatFroudeNumber =
      state.froudeNumber

    supercriticalAlternateDepth =
      throatCriticalDepth

    supercriticalAlternateVelocity =
      state.velocity

    supercriticalAlternateFroudeNumber =
      state.froudeNumber

    waterSurfaceElevationChange =
      throatCriticalDepth -
      input.upstreamFlowDepth

    subcriticalEnergyResidual =
      state.specificEnergy -
      upstream.specificEnergy

    alternateEnergyResidual =
      subcriticalEnergyResidual
  } else {
    throatStatus =
      'Unchoked — two throat-depth roots available'

    const tinyDepth =
      Math.max(
        1e-12,
        throatCriticalDepth *
        1e-10,
      )

    const shallowDepth =
      solveEnergyRoot(
        input,

        upstream.specificEnergy,

        tinyDepth,

        throatCriticalDepth,

        false,
      )

    const deepDepth =
      solveEnergyRoot(
        input,

        upstream.specificEnergy,

        throatCriticalDepth,

        Math.max(
          upstream.specificEnergy *
          2,
          throatCriticalDepth *
          2,
          1,
        ),

        true,
      )

    const shallowState =
      sectionState(
        input.contractedBottomWidth,

        input.sideSlopeHorizontalPerVertical,

        input.volumetricFlowRate,

        shallowDepth,
      )

    const deepState =
      sectionState(
        input.contractedBottomWidth,

        input.sideSlopeHorizontalPerVertical,

        input.volumetricFlowRate,

        deepDepth,
      )

    subcriticalThroatDepth =
      deepDepth

    subcriticalThroatVelocity =
      deepState.velocity

    subcriticalThroatFroudeNumber =
      deepState.froudeNumber

    supercriticalAlternateDepth =
      shallowDepth

    supercriticalAlternateVelocity =
      shallowState.velocity

    supercriticalAlternateFroudeNumber =
      shallowState.froudeNumber

    waterSurfaceElevationChange =
      deepDepth -
      input.upstreamFlowDepth

    subcriticalEnergyResidual =
      deepState.specificEnergy -
      upstream.specificEnergy

    alternateEnergyResidual =
      shallowState.specificEnergy -
      upstream.specificEnergy
  }

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const positiveValues = [
    upstream.flowArea,

    upstream.topWidth,

    upstream.hydraulicDepth,

    upstream.velocity,

    upstream.froudeNumber,

    upstream.specificEnergy,

    throatCriticalDepth,

    throatCriticalSpecificEnergy,

    maximumPassableFlowAtAvailableEnergy,

    contractionRatio,

    massFlowRate,
  ]

  if (
    !positiveValues.every(
      value =>
        Number.isFinite(value),
    ) ||
    positiveValues.some(
      value =>
        value <= 0,
    ) ||
    contractionRatio >= 1 ||
    !Number.isFinite(
      minimumContractedBottomWidth,
    ) ||
    minimumContractedBottomWidth < 0 ||
    !Number.isFinite(
      remainingWidthMargin,
    ) ||
    !Number.isFinite(
      widthLimitUtilizationPercent,
    ) ||
    !Number.isFinite(
      flowCapacityMargin,
    ) ||
    !Number.isFinite(
      availableSpecificEnergyMargin,
    ) ||
    !Number.isFinite(
      additionalSpecificEnergyRequired,
    )
  ) {
    throw new TrapezoidalContractionThroatAnalysisError(
      'NUMERICAL_FAILURE',
      'The specified contraction analysis produced a non-finite base result.',
    )
  }

  if (
    subcriticalThroatDepth !==
      null &&
    supercriticalAlternateDepth !==
      null &&
    subcriticalThroatFroudeNumber !==
      null &&
    supercriticalAlternateFroudeNumber !==
      null &&
    subcriticalEnergyResidual !==
      null &&
    alternateEnergyResidual !==
      null
  ) {
    if (
      !Number.isFinite(
        subcriticalThroatDepth,
      ) ||
      !Number.isFinite(
        supercriticalAlternateDepth,
      ) ||
      !Number.isFinite(
        subcriticalThroatFroudeNumber,
      ) ||
      !Number.isFinite(
        supercriticalAlternateFroudeNumber,
      ) ||
      Math.abs(
        subcriticalEnergyResidual,
      ) >
        1e-8 ||
      Math.abs(
        alternateEnergyResidual,
      ) >
        1e-8
    ) {
      throw new TrapezoidalContractionThroatAnalysisError(
        'NUMERICAL_FAILURE',
        'The throat depth roots failed their specific-energy closure checks.',
      )
    }
  }

  return {
    upstreamFlowArea:
      upstream.flowArea,

    upstreamTopWidth:
      upstream.topWidth,

    upstreamHydraulicDepth:
      upstream.hydraulicDepth,

    upstreamVelocity:
      upstream.velocity,

    upstreamFroudeNumber:
      upstream.froudeNumber,

    upstreamSpecificEnergy:
      upstream.specificEnergy,

    minimumContractedBottomWidth,

    remainingWidthMargin,

    contractionRatio,

    widthLimitUtilizationPercent,

    throatStatus,

    throatCriticalDepth,

    throatCriticalSpecificEnergy,

    availableSpecificEnergyMargin,

    maximumPassableFlowAtAvailableEnergy,

    flowCapacityMargin,

    additionalSpecificEnergyRequired,

    subcriticalThroatDepth,

    subcriticalThroatVelocity,

    subcriticalThroatFroudeNumber,

    supercriticalAlternateDepth,

    supercriticalAlternateVelocity,

    supercriticalAlternateFroudeNumber,

    waterSurfaceElevationChange,

    subcriticalEnergyResidual,

    alternateEnergyResidual,

    massFlowRate,

    modelName:
      'Specified Trapezoidal Contraction Throat & Choking Analysis',

    limitationDescription:
      'Lossless one-dimensional contraction analysis for a symmetric trapezoidal channel with unchanged bed elevation. The calculator compares available upstream specific energy with the contracted-section critical energy. Local transition loss, separation, three-dimensional effects and abrupt-contraction loss are excluded.',
  }
}

export function createTrapezoidalContractionThroatAnalysisCsv(
  input:
    TrapezoidalContractionThroatAnalysisInput,
  result:
    TrapezoidalContractionThroatAnalysisResult,
): string {
  const rows = [
    [
      'Specified Trapezoidal Contraction Throat & Choking Analysis',
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
      'Contracted bottom width',
      input.contractedBottomWidth,
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
      'Throat status',
      result.throatStatus,
      '-',
    ],
    [
      'Minimum contracted bottom width',
      result.minimumContractedBottomWidth,
      'm',
    ],
    [
      'Remaining width margin',
      result.remainingWidthMargin,
      'm',
    ],
    [
      'Contraction ratio',
      result.contractionRatio,
      '-',
    ],
    [
      'Width limit utilization',
      result.widthLimitUtilizationPercent,
      '%',
    ],
    [
      'Upstream specific energy',
      result.upstreamSpecificEnergy,
      'm',
    ],
    [
      'Throat critical depth',
      result.throatCriticalDepth,
      'm',
    ],
    [
      'Throat critical specific energy',
      result.throatCriticalSpecificEnergy,
      'm',
    ],
    [
      'Available specific-energy margin',
      result.availableSpecificEnergyMargin,
      'm',
    ],
    [
      'Maximum passable flow at available energy',
      result.maximumPassableFlowAtAvailableEnergy,
      'm3/s',
    ],
    [
      'Flow-capacity margin',
      result.flowCapacityMargin,
      'm3/s',
    ],
    [
      'Additional specific energy required',
      result.additionalSpecificEnergyRequired,
      'm',
    ],
    [
      'Subcritical throat depth',
      result.subcriticalThroatDepth ?? '',
      'm',
    ],
    [
      'Subcritical throat Froude number',
      result.subcriticalThroatFroudeNumber ?? '',
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
      'Water-surface elevation change',
      result.waterSurfaceElevationChange ?? '',
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
