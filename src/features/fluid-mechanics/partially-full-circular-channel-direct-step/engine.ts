import {
  calculatePartiallyFullCircularChannelCriticalDepth,
} from '../partially-full-circular-channel-critical-depth/engine.ts'

import type {
  PartiallyFullCircularChannelDirectStepInput,
  PartiallyFullCircularChannelDirectStepResult,
  PartiallyFullCircularChannelDirectStepState,
} from './types.ts'


export const PARTIALLY_FULL_CIRCULAR_CHANNEL_DIRECT_STEP_ENGINE_VERSION =
  'partially-full-circular-channel-direct-step-v1'


export type PartiallyFullCircularChannelDirectStepErrorCode =
  | 'INVALID_DIAMETER'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_STATE_1_DEPTH'
  | 'INVALID_STATE_2_DEPTH'
  | 'IDENTICAL_DEPTHS'
  | 'CROSSES_CRITICAL_DEPTH'
  | 'NEAR_UNIFORM_DENOMINATOR'
  | 'NUMERICAL_FAILURE'


export class PartiallyFullCircularChannelDirectStepError
  extends Error {
  readonly code:
    PartiallyFullCircularChannelDirectStepErrorCode

  constructor(
    code:
      PartiallyFullCircularChannelDirectStepErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PartiallyFullCircularChannelDirectStepError'

    this.code =
      code
  }
}


const GRAVITATIONAL_ACCELERATION =
  9.80665


function calculateState(
  input:
    PartiallyFullCircularChannelDirectStepInput,
  flowDepth: number,
): PartiallyFullCircularChannelDirectStepState {
  const radius =
    input.pipeDiameter /
    2

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

  const freeSurfaceElevationFromCenter =
    flowDepth -
    radius

  const halfTopWidth =
    Math.sqrt(
      Math.max(
        0,
        radius *
        radius -
        freeSurfaceElevationFromCenter *
        freeSurfaceElevationFromCenter,
      ),
    )

  const topWidth =
    2 *
    halfTopWidth

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

  const velocityHead =
    meanVelocity *
    meanVelocity /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const specificEnergy =
    flowDepth +
    velocityHead

  const froudeNumber =
    meanVelocity /
    Math.sqrt(
      GRAVITATIONAL_ACCELERATION *
      hydraulicDepth,
    )

  const frictionSlope =
    (
      input.manningRoughness *
      input.volumetricFlowRate /
      (
        flowArea *
        hydraulicRadius **
          (
            2 /
            3
          )
      )
    ) **
    2

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

    velocityHead,

    specificEnergy,

    frictionSlope,
  }
}


export function calculatePartiallyFullCircularChannelDirectStep(
  input:
    PartiallyFullCircularChannelDirectStepInput,
): PartiallyFullCircularChannelDirectStepResult {
  if (
    !Number.isFinite(
      input.pipeDiameter,
    ) ||
    input.pipeDiameter <=
      0
  ) {
    throw new PartiallyFullCircularChannelDirectStepError(
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
    throw new PartiallyFullCircularChannelDirectStepError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.manningRoughness,
    ) ||
    input.manningRoughness <=
      0
  ) {
    throw new PartiallyFullCircularChannelDirectStepError(
      'INVALID_MANNING_ROUGHNESS',
      'Manning roughness coefficient must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.channelSlope,
    ) ||
    input.channelSlope <
      0
  ) {
    throw new PartiallyFullCircularChannelDirectStepError(
      'INVALID_CHANNEL_SLOPE',
      'Channel bed slope must be finite and non-negative.',
    )
  }

  if (
    !Number.isFinite(
      input.state1FlowDepth,
    ) ||
    input.state1FlowDepth <=
      0 ||
    input.state1FlowDepth >=
      input.pipeDiameter
  ) {
    throw new PartiallyFullCircularChannelDirectStepError(
      'INVALID_STATE_1_DEPTH',
      'State 1 flow depth must satisfy 0 < y1 < D.',
    )
  }

  if (
    !Number.isFinite(
      input.state2FlowDepth,
    ) ||
    input.state2FlowDepth <=
      0 ||
    input.state2FlowDepth >=
      input.pipeDiameter
  ) {
    throw new PartiallyFullCircularChannelDirectStepError(
      'INVALID_STATE_2_DEPTH',
      'State 2 flow depth must satisfy 0 < y2 < D.',
    )
  }

  const depthDifference =
    input.state2FlowDepth -
    input.state1FlowDepth

  const identicalDepthTolerance =
    Math.max(
      1e-12,
      input.pipeDiameter *
      1e-10,
    )

  if (
    Math.abs(
      depthDifference,
    ) <=
    identicalDepthTolerance
  ) {
    throw new PartiallyFullCircularChannelDirectStepError(
      'IDENTICAL_DEPTHS',
      'The direct-step method requires two distinct flow depths.',
    )
  }

  const critical =
    calculatePartiallyFullCircularChannelCriticalDepth({
      pipeDiameter:
        input.pipeDiameter,

      volumetricFlowRate:
        input.volumetricFlowRate,

      fluidDensity:
        1000,
    })

  const criticalTolerance =
    Math.max(
      1e-9,
      input.pipeDiameter *
      1e-7,
    )

  const state1CriticalOffset =
    input.state1FlowDepth -
    critical.criticalDepth

  const state2CriticalOffset =
    input.state2FlowDepth -
    critical.criticalDepth

  if (
    Math.abs(
      state1CriticalOffset,
    ) <=
      criticalTolerance ||
    Math.abs(
      state2CriticalOffset,
    ) <=
      criticalTolerance ||
    state1CriticalOffset *
    state2CriticalOffset <
      0
  ) {
    throw new PartiallyFullCircularChannelDirectStepError(
      'CROSSES_CRITICAL_DEPTH',
      'A single direct-step reach may not cross or terminate at critical depth. Split the profile at the control section.',
    )
  }

  const state1 =
    calculateState(
      input,
      input.state1FlowDepth,
    )

  const state2 =
    calculateState(
      input,
      input.state2FlowDepth,
    )

  const state1Subcritical =
    state1.froudeNumber <
    1

  const state2Subcritical =
    state2.froudeNumber <
    1

  if (
    state1Subcritical !==
    state2Subcritical
  ) {
    throw new PartiallyFullCircularChannelDirectStepError(
      'CROSSES_CRITICAL_DEPTH',
      'The two direct-step states lie on opposite sides of critical flow.',
    )
  }

  const averageFrictionSlope =
    (
      state1.frictionSlope +
      state2.frictionSlope
    ) /
    2

  const specificEnergyChange =
    state2.specificEnergy -
    state1.specificEnergy

  const bedSlopeMinusAverageFrictionSlope =
    input.channelSlope -
    averageFrictionSlope

  const denominatorTolerance =
    Math.max(
      1e-12,
      Math.max(
        Math.abs(
          input.channelSlope,
        ),
        Math.abs(
          averageFrictionSlope,
        ),
        1,
      ) *
      1e-11,
    )

  if (
    Math.abs(
      bedSlopeMinusAverageFrictionSlope,
    ) <=
    denominatorTolerance
  ) {
    throw new PartiallyFullCircularChannelDirectStepError(
      'NEAR_UNIFORM_DENOMINATOR',
      'S0 is too close to the average friction slope. The direct-step reach tends toward a very large distance near uniform flow.',
    )
  }

  const signedDistance =
    specificEnergyChange /
    bedSlopeMinusAverageFrictionSlope

  const reachLength =
    Math.abs(
      signedDistance,
    )

  const bedElevationChange =
    -input.channelSlope *
    signedDistance

  const waterSurfaceElevationChange =
    bedElevationChange +
    depthDifference

  const signedFrictionHeadChange =
    averageFrictionSlope *
    signedDistance

  const frictionHeadLossMagnitude =
    averageFrictionSlope *
    reachLength

  const totalHeadChange =
    bedElevationChange +
    specificEnergyChange

  const energyClosureResidual =
    totalHeadChange +
    signedFrictionHeadChange

  const flowRegime =
    state1Subcritical
      ? 'Subcritical GVF segment'
      : 'Supercritical GVF segment'

  const profileDirection =
    signedDistance >
      0
      ? 'State 2 lies downstream of State 1'
      : 'State 2 lies upstream of State 1'

  const finiteValues = [
    state1.flowArea,
    state1.topWidth,
    state1.wettedPerimeter,
    state1.hydraulicRadius,
    state1.hydraulicDepth,
    state1.meanVelocity,
    state1.froudeNumber,
    state1.velocityHead,
    state1.specificEnergy,
    state1.frictionSlope,

    state2.flowArea,
    state2.topWidth,
    state2.wettedPerimeter,
    state2.hydraulicRadius,
    state2.hydraulicDepth,
    state2.meanVelocity,
    state2.froudeNumber,
    state2.velocityHead,
    state2.specificEnergy,
    state2.frictionSlope,

    critical.criticalDepth,
    critical.criticalSpecificEnergy,

    averageFrictionSlope,
    specificEnergyChange,
    bedSlopeMinusAverageFrictionSlope,
    signedDistance,
    reachLength,
    bedElevationChange,
    waterSurfaceElevationChange,
    signedFrictionHeadChange,
    frictionHeadLossMagnitude,
    totalHeadChange,
    energyClosureResidual,
  ]

  const closureTolerance =
    Math.max(
      1e-10,
      frictionHeadLossMagnitude *
      1e-9,
    )

  if (
    !finiteValues.every(
      value =>
        Number.isFinite(
          value,
        ),
    ) ||
    state1.flowArea <=
      0 ||
    state2.flowArea <=
      0 ||
    state1.hydraulicRadius <=
      0 ||
    state2.hydraulicRadius <=
      0 ||
    state1.frictionSlope <=
      0 ||
    state2.frictionSlope <=
      0 ||
    reachLength <=
      0 ||
    frictionHeadLossMagnitude <=
      0 ||
    Math.abs(
      energyClosureResidual,
    ) >
      closureTolerance
  ) {
    throw new PartiallyFullCircularChannelDirectStepError(
      'NUMERICAL_FAILURE',
      'Circular-channel direct-step calculation failed its geometry, friction or energy-balance checks.',
    )
  }

  return {
    state1,

    state2,

    criticalDepth:
      critical.criticalDepth,

    criticalSpecificEnergy:
      critical.criticalSpecificEnergy,

    specificEnergyChange,

    averageFrictionSlope,

    bedSlopeMinusAverageFrictionSlope,

    signedDistance,

    reachLength,

    bedElevationChange,

    waterSurfaceElevationChange,

    signedFrictionHeadChange,

    frictionHeadLossMagnitude,

    totalHeadChange,

    energyClosureResidual,

    flowRegime,

    profileDirection,

    modelName:
      'Partially Full Circular Channel Direct-Step Method — GVF',

    limitationDescription:
      'The direct-step method applies Δx = (E₂ − E₁)/(S₀ − S̄f), using the arithmetic mean of the endpoint Manning friction slopes. The reach must remain entirely on one side of critical depth, the conduit must remain partially full and geometric variation is assumed gradual.',
  }
}


function csvCell(
  value: string | number,
): string {
  const text =
    String(
      value,
    )

  if (
    /[",\n]/.test(
      text,
    )
  ) {
    return (
      '"' +
      text.replaceAll(
        '"',
        '""',
      ) +
      '"'
    )
  }

  return text
}


export function createPartiallyFullCircularChannelDirectStepCsv(
  input:
    PartiallyFullCircularChannelDirectStepInput,
  result:
    PartiallyFullCircularChannelDirectStepResult,
): string {
  const rows:
    Array<
      Array<
        string | number
      >
    > = [
    [
      'Partially Full Circular Channel Direct-Step Method — GVF',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Pipe Diameter',
      input.pipeDiameter,
      'm',
    ],
    [
      'Volumetric Flow Rate',
      input.volumetricFlowRate,
      'm3/s',
    ],
    [
      'Manning Roughness',
      input.manningRoughness,
      '-',
    ],
    [
      'Channel Bed Slope',
      input.channelSlope,
      'm/m',
    ],
    [
      'State 1 Flow Depth',
      input.state1FlowDepth,
      'm',
    ],
    [
      'State 2 Flow Depth',
      input.state2FlowDepth,
      'm',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Critical Depth',
      result.criticalDepth,
      'm',
    ],
    [
      'State 1 Specific Energy',
      result.state1.specificEnergy,
      'm',
    ],
    [
      'State 2 Specific Energy',
      result.state2.specificEnergy,
      'm',
    ],
    [
      'State 1 Froude Number',
      result.state1.froudeNumber,
      '-',
    ],
    [
      'State 2 Froude Number',
      result.state2.froudeNumber,
      '-',
    ],
    [
      'State 1 Friction Slope',
      result.state1.frictionSlope,
      'm/m',
    ],
    [
      'State 2 Friction Slope',
      result.state2.frictionSlope,
      'm/m',
    ],
    [
      'Average Friction Slope',
      result.averageFrictionSlope,
      'm/m',
    ],
    [
      'Specific Energy Change',
      result.specificEnergyChange,
      'm',
    ],
    [
      'S0 - Average Sf',
      result.bedSlopeMinusAverageFrictionSlope,
      'm/m',
    ],
    [
      'Signed Distance',
      result.signedDistance,
      'm',
    ],
    [
      'Reach Length',
      result.reachLength,
      'm',
    ],
    [
      'Bed Elevation Change',
      result.bedElevationChange,
      'm',
    ],
    [
      'Water Surface Elevation Change',
      result.waterSurfaceElevationChange,
      'm',
    ],
    [
      'Friction Head Loss Magnitude',
      result.frictionHeadLossMagnitude,
      'm',
    ],
    [
      'Total Head Change',
      result.totalHeadChange,
      'm',
    ],
    [
      'Energy Closure Residual',
      result.energyClosureResidual,
      'm',
    ],
    [
      'Flow Regime',
      result.flowRegime,
      '-',
    ],
    [
      'Profile Direction',
      result.profileDirection,
      '-',
    ],
    [],
    [
      'Model',
      result.modelName,
      '',
    ],
    [
      'Limitation',
      result.limitationDescription,
      '',
    ],
  ]

  return rows
    .map(
      row =>
        row
          .map(
            csvCell,
          )
          .join(','),
    )
    .join('\n')
}
