import {
  calculatePartiallyFullCircularChannelCriticalDepth,
} from '../partially-full-circular-channel-critical-depth/engine.ts'

import type {
  PartiallyFullCircularChannelHydraulicJumpInput,
  PartiallyFullCircularChannelHydraulicJumpResult,
  PartiallyFullCircularChannelHydraulicJumpState,
} from './types.ts'

export const PARTIALLY_FULL_CIRCULAR_CHANNEL_HYDRAULIC_JUMP_ENGINE_VERSION =
  'partially-full-circular-channel-hydraulic-jump-v1'

export type PartiallyFullCircularChannelHydraulicJumpErrorCode =
  | 'INVALID_DIAMETER'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_UPSTREAM_DEPTH'
  | 'INVALID_DENSITY'
  | 'UPSTREAM_NOT_SUPERCRITICAL'
  | 'NO_PARTIAL_CONJUGATE_DEPTH'
  | 'ROOT_CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'

export class PartiallyFullCircularChannelHydraulicJumpError
  extends Error {
  readonly code:
    PartiallyFullCircularChannelHydraulicJumpErrorCode

  constructor(
    code:
      PartiallyFullCircularChannelHydraulicJumpErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PartiallyFullCircularChannelHydraulicJumpError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665


function calculateState(
  input:
    PartiallyFullCircularChannelHydraulicJumpInput,
  flowDepth: number,
): PartiallyFullCircularChannelHydraulicJumpState {
  const radius =
    input.pipeDiameter /
    2

  const freeSurfaceElevationFromCenter =
    flowDepth -
    radius

  const cosineArgument =
    (
      radius -
      flowDepth
    ) /
    radius

  const boundedCosineArgument =
    Math.min(
      1,
      Math.max(
        -1,
        cosineArgument,
      ),
    )

  const centralAngleRadians =
    2 *
    Math.acos(
      boundedCosineArgument,
    )

  const centralAngleDegrees =
    centralAngleRadians *
    180 /
    Math.PI

  const flowArea =
    radius *
    radius /
    2 *
    (
      centralAngleRadians -
      Math.sin(
        centralAngleRadians,
      )
    )

  const horizontalHalfWidthSquared =
    Math.max(
      0,
      radius *
      radius -
      freeSurfaceElevationFromCenter *
      freeSurfaceElevationFromCenter,
    )

  const horizontalHalfWidth =
    Math.sqrt(
      horizontalHalfWidthSquared,
    )

  const topWidth =
    2 *
    horizontalHalfWidth

  const wettedPerimeter =
    radius *
    centralAngleRadians

  const hydraulicRadius =
    flowArea /
    wettedPerimeter

  const hydraulicDepth =
    flowArea /
    topWidth

  const meanVelocity =
    input.volumetricFlowRate /
    flowArea

  const froudeNumber =
    meanVelocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      hydraulicDepth,
    )

  const specificEnergy =
    flowDepth +
    meanVelocity *
    meanVelocity /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const hydrostaticFirstMoment =
    freeSurfaceElevationFromCenter *
    flowArea +
    (
      2 /
      3
    ) *
    horizontalHalfWidth **
      3

  const specificForce =
    input.volumetricFlowRate *
    input.volumetricFlowRate /
    (
      GRAVITATIONAL_ACCELERATION *
      flowArea
    ) +
    hydrostaticFirstMoment

  return {
    flowDepth,

    depthRatio:
      flowDepth /
      input.pipeDiameter,

    centralAngleDegrees,

    flowArea,

    topWidth,

    wettedPerimeter,

    hydraulicRadius,

    hydraulicDepth,

    meanVelocity,

    froudeNumber,

    specificEnergy,

    hydrostaticFirstMoment,

    specificForce,
  }
}


function solveConjugateDepth(
  input:
    PartiallyFullCircularChannelHydraulicJumpInput,
  criticalDepth: number,
  upstreamSpecificForce: number,
): number {
  let lower =
    criticalDepth

  let upper =
    input.pipeDiameter *
    (
      1 -
      1e-8
    )

  let lowerResidual =
    calculateState(
      input,
      lower,
    ).specificForce -
    upstreamSpecificForce

  let upperResidual =
    calculateState(
      input,
      upper,
    ).specificForce -
    upstreamSpecificForce

  const forceTolerance =
    Math.max(
      1e-12,
      Math.abs(
        upstreamSpecificForce
      ) *
      1e-11,
    )

  if (
    Math.abs(
      lowerResidual,
    ) <=
    forceTolerance
  ) {
    return lower
  }

  if (
    upperResidual <
    -forceTolerance
  ) {
    throw new PartiallyFullCircularChannelHydraulicJumpError(
      'NO_PARTIAL_CONJUGATE_DEPTH',
      'The momentum-conjugate downstream depth would exceed the circular conduit crown, so no partially full hydraulic-jump solution exists.',
    )
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
    throw new PartiallyFullCircularChannelHydraulicJumpError(
      'NO_PARTIAL_CONJUGATE_DEPTH',
      'A physically valid downstream conjugate depth could not be bracketed below the conduit crown.',
    )
  }

  for (
    let iteration = 1;
    iteration <= 240;
    iteration += 1
  ) {
    const middle =
      (
        lower +
        upper
      ) /
      2

    const middleResidual =
      calculateState(
        input,
        middle,
      ).specificForce -
      upstreamSpecificForce

    if (
      !Number.isFinite(
        middleResidual,
      )
    ) {
      throw new PartiallyFullCircularChannelHydraulicJumpError(
        'ROOT_CONVERGENCE_FAILURE',
        'Hydraulic-jump momentum residual became non-finite.',
      )
    }

    if (
      Math.abs(
        middleResidual,
      ) <=
      forceTolerance
    ) {
      return middle
    }

    if (
      lowerResidual *
      middleResidual <=
      0
    ) {
      upper =
        middle

      upperResidual =
        middleResidual
    } else {
      lower =
        middle

      lowerResidual =
        middleResidual
    }
  }

  const depth =
    (
      lower +
      upper
    ) /
      2

  const finalResidual =
    calculateState(
      input,
      depth,
    ).specificForce -
    upstreamSpecificForce

  if (
    Math.abs(
      finalResidual,
    ) >
    Math.max(
      1e-9,
      Math.abs(
        upstreamSpecificForce
      ) *
      1e-8,
    )
  ) {
    throw new PartiallyFullCircularChannelHydraulicJumpError(
      'ROOT_CONVERGENCE_FAILURE',
      'Circular-channel conjugate-depth solver did not converge.',
    )
  }

  return depth
}


export function calculatePartiallyFullCircularChannelHydraulicJump(
  input:
    PartiallyFullCircularChannelHydraulicJumpInput,
): PartiallyFullCircularChannelHydraulicJumpResult {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <=
      0
  ) {
    throw new PartiallyFullCircularChannelHydraulicJumpError(
      'INVALID_DIAMETER',
      'Circular-channel diameter must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.volumetricFlowRate,
    ) ||
    input.volumetricFlowRate <=
      0
  ) {
    throw new PartiallyFullCircularChannelHydraulicJumpError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.upstreamFlowDepth,
    ) ||
    input.upstreamFlowDepth <=
      0 ||
    input.upstreamFlowDepth >=
      input.pipeDiameter
  ) {
    throw new PartiallyFullCircularChannelHydraulicJumpError(
      'INVALID_UPSTREAM_DEPTH',
      'Upstream flow depth must satisfy 0 < y1 < D.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <=
      0
  ) {
    throw new PartiallyFullCircularChannelHydraulicJumpError(
      'INVALID_DENSITY',
      'Fluid density must be positive and finite.',
    )
  }

  const critical =
    calculatePartiallyFullCircularChannelCriticalDepth({
      pipeDiameter:
        input.pipeDiameter,

      volumetricFlowRate:
        input.volumetricFlowRate,

      fluidDensity:
        input.fluidDensity,
    })

  const upstreamState =
    calculateState(
      input,
      input.upstreamFlowDepth,
    )

  const supercriticalTolerance =
    1e-8

  if (
    upstreamState.froudeNumber <=
    1 +
    supercriticalTolerance
  ) {
    throw new PartiallyFullCircularChannelHydraulicJumpError(
      'UPSTREAM_NOT_SUPERCRITICAL',
      'A hydraulic jump requires a supercritical upstream state with Fr1 > 1.',
    )
  }

  const downstreamDepth =
    solveConjugateDepth(
      input,
      critical.criticalDepth,
      upstreamState.specificForce,
    )

  const downstreamState =
    calculateState(
      input,
      downstreamDepth,
    )

  const jumpHeight =
    downstreamDepth -
    input.upstreamFlowDepth

  const sequentDepthRatio =
    downstreamDepth /
    input.upstreamFlowDepth

  const specificEnergyLoss =
    upstreamState.specificEnergy -
    downstreamState.specificEnergy

  const energyLossPercent =
    specificEnergyLoss /
    upstreamState.specificEnergy *
    100

  const upstreamSpecificForce =
    upstreamState.specificForce

  const downstreamSpecificForce =
    downstreamState.specificForce

  const momentumClosureResidual =
    downstreamSpecificForce -
    upstreamSpecificForce

  const hydrostaticForceUpstream =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    upstreamState.hydrostaticFirstMoment

  const hydrostaticForceDownstream =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    downstreamState.hydrostaticFirstMoment

  const hydrostaticForceIncrease =
    hydrostaticForceDownstream -
    hydrostaticForceUpstream

  const momentumFluxChangeForce =
    input.fluidDensity *
    input.volumetricFlowRate *
    (
      upstreamState.meanVelocity -
      downstreamState.meanVelocity
    )

  const forceBalanceResidual =
    hydrostaticForceIncrease -
    momentumFluxChangeForce

  const hydraulicPowerDissipated =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.volumetricFlowRate *
    specificEnergyLoss

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const positiveValues = [
    upstreamState.flowDepth,

    upstreamState.flowArea,

    upstreamState.topWidth,

    upstreamState.wettedPerimeter,

    upstreamState.hydraulicRadius,

    upstreamState.hydraulicDepth,

    upstreamState.meanVelocity,

    upstreamState.froudeNumber,

    upstreamState.specificEnergy,

    upstreamState.hydrostaticFirstMoment,

    upstreamState.specificForce,

    downstreamState.flowDepth,

    downstreamState.flowArea,

    downstreamState.topWidth,

    downstreamState.wettedPerimeter,

    downstreamState.hydraulicRadius,

    downstreamState.hydraulicDepth,

    downstreamState.meanVelocity,

    downstreamState.froudeNumber,

    downstreamState.specificEnergy,

    downstreamState.hydrostaticFirstMoment,

    downstreamState.specificForce,

    critical.criticalDepth,

    critical.criticalSpecificEnergy,

    jumpHeight,

    sequentDepthRatio,

    specificEnergyLoss,

    energyLossPercent,

    hydrostaticForceUpstream,

    hydrostaticForceDownstream,

    hydrostaticForceIncrease,

    momentumFluxChangeForce,

    hydraulicPowerDissipated,

    massFlowRate,
  ]

  const forceTolerance =
    Math.max(
      1e-7,
      Math.max(
        hydrostaticForceIncrease,
        momentumFluxChangeForce,
      ) *
      1e-8,
    )

  const momentumTolerance =
    Math.max(
      1e-10,
      upstreamSpecificForce *
      1e-8,
    )

  if (
    !positiveValues.every(
      value =>
        Number.isFinite(value),
    ) ||
    positiveValues.some(
      value =>
        value <=
        0,
    ) ||
    downstreamDepth <=
      critical.criticalDepth ||
    downstreamDepth >=
      input.pipeDiameter ||
    downstreamState.froudeNumber >=
      1 ||
    jumpHeight <=
      0 ||
    specificEnergyLoss <=
      0 ||
    Math.abs(
      momentumClosureResidual,
    ) >
      momentumTolerance ||
    Math.abs(
      forceBalanceResidual,
    ) >
      forceTolerance
  ) {
    throw new PartiallyFullCircularChannelHydraulicJumpError(
      'NUMERICAL_FAILURE',
      'Circular-channel hydraulic jump failed its momentum, energy, Froude or force-balance closure checks.',
    )
  }

  return {
    upstreamState,

    downstreamState,

    criticalDepth:
      critical.criticalDepth,

    criticalSpecificEnergy:
      critical.criticalSpecificEnergy,

    jumpHeight,

    sequentDepthRatio,

    specificEnergyLoss,

    energyLossPercent,

    upstreamSpecificForce,

    downstreamSpecificForce,

    momentumClosureResidual,

    hydrostaticForceUpstream,

    hydrostaticForceDownstream,

    hydrostaticForceIncrease,

    momentumFluxChangeForce,

    forceBalanceResidual,

    hydraulicPowerDissipated,

    massFlowRate,

    modelName:
      'Hydraulic Jump in a Partially Full Circular Channel',

    limitationDescription:
      'The conjugate downstream depth is obtained from equality of the momentum-specific-force function M = Q²/(gA) + I. The upstream state must be supercritical and both states must remain below the conduit crown. Bed slope, friction and jump length are neglected across the short jump control volume.',
  }
}


export function createPartiallyFullCircularChannelHydraulicJumpCsv(
  input:
    PartiallyFullCircularChannelHydraulicJumpInput,
  result:
    PartiallyFullCircularChannelHydraulicJumpResult,
): string {
  const rows = [
    [
      'Partially Full Circular Channel Hydraulic Jump',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Pipe diameter',
      input.pipeDiameter,
      'm',
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
      'Jump Result',
      'Value',
      'Unit',
    ],
    [
      'Critical depth',
      result.criticalDepth,
      'm',
    ],
    [
      'Downstream conjugate depth',
      result.downstreamState.flowDepth,
      'm',
    ],
    [
      'Jump height',
      result.jumpHeight,
      'm',
    ],
    [
      'Sequent depth ratio',
      result.sequentDepthRatio,
      '-',
    ],
    [
      'Upstream Froude number',
      result.upstreamState.froudeNumber,
      '-',
    ],
    [
      'Downstream Froude number',
      result.downstreamState.froudeNumber,
      '-',
    ],
    [
      'Upstream specific force',
      result.upstreamSpecificForce,
      'm3',
    ],
    [
      'Downstream specific force',
      result.downstreamSpecificForce,
      'm3',
    ],
    [
      'Momentum closure residual',
      result.momentumClosureResidual,
      'm3',
    ],
    [
      'Upstream specific energy',
      result.upstreamState.specificEnergy,
      'm',
    ],
    [
      'Downstream specific energy',
      result.downstreamState.specificEnergy,
      'm',
    ],
    [
      'Specific energy loss',
      result.specificEnergyLoss,
      'm',
    ],
    [
      'Energy loss',
      result.energyLossPercent,
      '%',
    ],
    [
      'Hydrostatic force upstream',
      result.hydrostaticForceUpstream,
      'N',
    ],
    [
      'Hydrostatic force downstream',
      result.hydrostaticForceDownstream,
      'N',
    ],
    [
      'Hydrostatic force increase',
      result.hydrostaticForceIncrease,
      'N',
    ],
    [
      'Momentum-flux change force',
      result.momentumFluxChangeForce,
      'N',
    ],
    [
      'Force-balance residual',
      result.forceBalanceResidual,
      'N',
    ],
    [
      'Hydraulic power dissipated',
      result.hydraulicPowerDissipated,
      'W',
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
