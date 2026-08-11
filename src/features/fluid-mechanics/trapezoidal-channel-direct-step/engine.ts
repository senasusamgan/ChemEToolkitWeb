import {
  calculateTrapezoidalChannelCriticalDepth,
} from '../trapezoidal-channel-critical-depth/engine.ts'

import type {
  TrapezoidalChannelDirectStepInput,
  TrapezoidalChannelDirectStepResult,
} from './types.ts'

export const TRAPEZOIDAL_CHANNEL_DIRECT_STEP_ENGINE_VERSION =
  'trapezoidal-channel-direct-step-v1'

export type TrapezoidalChannelDirectStepErrorCode =
  | 'INVALID_BOTTOM_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_START_DEPTH'
  | 'INVALID_END_DEPTH'
  | 'INVALID_DENSITY'
  | 'IDENTICAL_DEPTHS'
  | 'NORMAL_DEPTH_FAILURE'
  | 'PROFILE_ZONE_CROSSING'
  | 'NEAR_UNIFORM_REACH'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalChannelDirectStepError
  extends Error {
  readonly code:
    TrapezoidalChannelDirectStepErrorCode

  constructor(
    code:
      TrapezoidalChannelDirectStepErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalChannelDirectStepError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

interface SectionState {
  flowArea: number

  topWidth: number

  wettedPerimeter: number

  hydraulicRadius: number

  hydraulicDepth: number

  velocity: number

  froudeNumber: number

  specificEnergy: number

  frictionSlope: number
}

function sectionState(
  input:
    TrapezoidalChannelDirectStepInput,
  depth: number,
): SectionState {
  const b =
    input.bottomWidth

  const z =
    input.sideSlopeHorizontalPerVertical

  const flowArea =
    depth *
    (
      b +
      z *
      depth
    )

  const topWidth =
    b +
    2 *
    z *
    depth

  const wettedPerimeter =
    b +
    2 *
    depth *
    Math.sqrt(
      1 +
      z *
      z,
    )

  const hydraulicRadius =
    flowArea /
    wettedPerimeter

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

  const frictionSlope =
    (
      input.volumetricFlowRate *
      input.manningRoughness /
      (
        flowArea *
        hydraulicRadius **
          (
            2 / 3
          )
      )
    ) **
    2

  return {
    flowArea,

    topWidth,

    wettedPerimeter,

    hydraulicRadius,

    hydraulicDepth,

    velocity,

    froudeNumber,

    specificEnergy,

    frictionSlope,
  }
}

function manningFlowAtDepth(
  input:
    TrapezoidalChannelDirectStepInput,
  depth: number,
): number {
  const state =
    sectionState(
      input,
      depth,
    )

  return (
    1 /
    input.manningRoughness
  ) *
  state.flowArea *
  state.hydraulicRadius **
    (
      2 / 3
    ) *
  Math.sqrt(
    input.channelSlope,
  )
}

function solveNormalDepth(
  input:
    TrapezoidalChannelDirectStepInput,
): {
  normalDepth: number
  iterations: number
} {
  let lower =
    1e-10

  let upper =
    Math.max(
      1,
      input.startDepth,
      input.endDepth,
    )

  let upperFlow =
    manningFlowAtDepth(
      input,
      upper,
    )

  let expansions =
    0

  while (
    upperFlow <
    input.volumetricFlowRate
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
      throw new TrapezoidalChannelDirectStepError(
        'NORMAL_DEPTH_FAILURE',
        'Could not bracket the Manning normal depth.',
      )
    }

    upperFlow =
      manningFlowAtDepth(
        input,
        upper,
      )
  }

  const flowTolerance =
    Math.max(
      1e-12,
      input.volumetricFlowRate *
      1e-11,
    )

  for (
    let iteration = 1;
    iteration <= 200;
    iteration += 1
  ) {
    const depth =
      (
        lower +
        upper
      ) /
      2

    const flow =
      manningFlowAtDepth(
        input,
        depth,
      )

    const residual =
      flow -
      input.volumetricFlowRate

    if (
      Math.abs(
        residual,
      ) <=
      flowTolerance
    ) {
      return {
        normalDepth:
          depth,

        iterations:
          iteration,
      }
    }

    if (
      residual <
      0
    ) {
      lower =
        depth
    } else {
      upper =
        depth
    }
  }

  throw new TrapezoidalChannelDirectStepError(
    'NORMAL_DEPTH_FAILURE',
    'Manning normal-depth solver did not converge within 200 iterations.',
  )
}

function classifyProfileZone(
  depth: number,
  normalDepth: number,
  criticalDepth: number,
  channelSlopeClass: string,
): string {
  if (
    channelSlopeClass ===
    'mild'
  ) {
    if (
      depth >
      normalDepth
    ) {
      return 'M1'
    }

    if (
      depth >
      criticalDepth
    ) {
      return 'M2'
    }

    return 'M3'
  }

  if (
    channelSlopeClass ===
    'steep'
  ) {
    if (
      depth >
      criticalDepth
    ) {
      return 'S1'
    }

    if (
      depth >
      normalDepth
    ) {
      return 'S2'
    }

    return 'S3'
  }

  if (
    depth >
    criticalDepth
  ) {
    return 'C1'
  }

  return 'C3'
}

export function calculateTrapezoidalChannelDirectStep(
  input:
    TrapezoidalChannelDirectStepInput,
): TrapezoidalChannelDirectStepResult {
  if (
    !Number.isFinite(
      input.bottomWidth,
    ) ||
    input.bottomWidth <= 0
  ) {
    throw new TrapezoidalChannelDirectStepError(
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
    throw new TrapezoidalChannelDirectStepError(
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
    throw new TrapezoidalChannelDirectStepError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.manningRoughness,
    ) ||
    input.manningRoughness <= 0
  ) {
    throw new TrapezoidalChannelDirectStepError(
      'INVALID_MANNING_ROUGHNESS',
      'Manning roughness coefficient must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.channelSlope,
    ) ||
    input.channelSlope <= 0
  ) {
    throw new TrapezoidalChannelDirectStepError(
      'INVALID_CHANNEL_SLOPE',
      'Channel bed and energy-reference slope must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.startDepth,
    ) ||
    input.startDepth <= 0
  ) {
    throw new TrapezoidalChannelDirectStepError(
      'INVALID_START_DEPTH',
      'Starting flow depth must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.endDepth,
    ) ||
    input.endDepth <= 0
  ) {
    throw new TrapezoidalChannelDirectStepError(
      'INVALID_END_DEPTH',
      'Ending flow depth must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new TrapezoidalChannelDirectStepError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const depthDifference =
    input.endDepth -
    input.startDepth

  if (
    Math.abs(
      depthDifference,
    ) <=
    Math.max(
      1e-12,
      Math.max(
        input.startDepth,
        input.endDepth,
      ) *
      1e-12,
    )
  ) {
    throw new TrapezoidalChannelDirectStepError(
      'IDENTICAL_DEPTHS',
      'Direct-step analysis requires two distinct flow depths.',
    )
  }

  const critical =
    calculateTrapezoidalChannelCriticalDepth({
      bottomWidth:
        input.bottomWidth,

      volumetricFlowRate:
        input.volumetricFlowRate,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      fluidDensity:
        input.fluidDensity,
    })

  const criticalDepth =
    critical.criticalDepth

  const normalSolution =
    solveNormalDepth(
      input,
    )

  const normalDepth =
    normalSolution.normalDepth

  const depthScale =
    Math.max(
      criticalDepth,
      normalDepth,
      input.startDepth,
      input.endDepth,
    )

  const depthTolerance =
    Math.max(
      1e-10,
      depthScale *
      1e-8,
    )

  if (
    Math.abs(
      input.startDepth -
      criticalDepth,
    ) <=
      depthTolerance ||
    Math.abs(
      input.endDepth -
      criticalDepth,
    ) <=
      depthTolerance ||
    Math.abs(
      input.startDepth -
      normalDepth,
    ) <=
      depthTolerance ||
    Math.abs(
      input.endDepth -
      normalDepth,
    ) <=
      depthTolerance
  ) {
    throw new TrapezoidalChannelDirectStepError(
      'PROFILE_ZONE_CROSSING',
      'Direct-step endpoints must not lie at the critical or normal-depth asymptotes.',
    )
  }

  const channelSlopeClass =
    Math.abs(
      normalDepth -
      criticalDepth,
    ) <=
    depthTolerance
      ? 'critical'
      : normalDepth >
        criticalDepth
        ? 'mild'
        : 'steep'

  const startZone =
    classifyProfileZone(
      input.startDepth,
      normalDepth,
      criticalDepth,
      channelSlopeClass,
    )

  const endZone =
    classifyProfileZone(
      input.endDepth,
      normalDepth,
      criticalDepth,
      channelSlopeClass,
    )

  if (
    startZone !==
    endZone
  ) {
    throw new TrapezoidalChannelDirectStepError(
      'PROFILE_ZONE_CROSSING',
      `The selected depths cross a GVF profile boundary (${startZone} → ${endZone}). Use separate direct-step reaches within one profile zone.`,
    )
  }

  const start =
    sectionState(
      input,
      input.startDepth,
    )

  const end =
    sectionState(
      input,
      input.endDepth,
    )

  const specificEnergyChange =
    end.specificEnergy -
    start.specificEnergy

  const averageFrictionSlope =
    (
      start.frictionSlope +
      end.frictionSlope
    ) /
    2

  const slopeDifference =
    input.channelSlope -
    averageFrictionSlope

  const slopeTolerance =
    Math.max(
      1e-12,
      input.channelSlope *
      1e-8,
    )

  if (
    Math.abs(
      slopeDifference,
    ) <=
    slopeTolerance
  ) {
    throw new TrapezoidalChannelDirectStepError(
      'NEAR_UNIFORM_REACH',
      'The average friction slope is effectively equal to the bed slope, so the direct-step reach length tends toward the normal-depth asymptote.',
    )
  }

  const signedDistance =
    specificEnergyChange /
    slopeDifference

  const reachLength =
    Math.abs(
      signedDistance,
    )

  const reachDirection =
    signedDistance >
    0
      ? 'Section 2 is downstream of Section 1'
      : 'Section 2 is upstream of Section 1'

  const bedElevationChange =
    -input.channelSlope *
    signedDistance

  const waterSurfaceElevationChange =
    bedElevationChange +
    depthDifference

  const signedFrictionHeadChange =
    averageFrictionSlope *
    signedDistance

  const frictionHeadLoss =
    averageFrictionSlope *
    reachLength

  const energyGradeLineChange =
    -signedFrictionHeadChange

  const energyClosureResidual =
    (
      start.specificEnergy +
      input.channelSlope *
      signedDistance
    ) -
    (
      end.specificEnergy +
      averageFrictionSlope *
      signedDistance
    )

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const hydraulicPowerDissipated =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.volumetricFlowRate *
    frictionHeadLoss

  const positiveValues = [
    criticalDepth,

    normalDepth,

    start.flowArea,

    end.flowArea,

    start.hydraulicRadius,

    end.hydraulicRadius,

    start.velocity,

    end.velocity,

    start.froudeNumber,

    end.froudeNumber,

    start.specificEnergy,

    end.specificEnergy,

    start.frictionSlope,

    end.frictionSlope,

    averageFrictionSlope,

    reachLength,

    frictionHeadLoss,

    hydraulicPowerDissipated,

    massFlowRate,
  ]

  const energyTolerance =
    Math.max(
      1e-11,
      Math.max(
        start.specificEnergy,
        end.specificEnergy,
      ) *
      1e-10,
    )

  if (
    !positiveValues.every(
      Number.isFinite,
    ) ||
    positiveValues.some(
      value =>
        value <= 0,
    ) ||
    !Number.isFinite(
      signedDistance,
    ) ||
    !Number.isFinite(
      specificEnergyChange,
    ) ||
    !Number.isFinite(
      slopeDifference,
    ) ||
    !Number.isFinite(
      bedElevationChange,
    ) ||
    !Number.isFinite(
      waterSurfaceElevationChange,
    ) ||
    !Number.isFinite(
      energyGradeLineChange,
    ) ||
    !Number.isFinite(
      signedFrictionHeadChange,
    ) ||
    !Number.isFinite(
      energyClosureResidual,
    ) ||
    Math.abs(
      energyClosureResidual,
    ) >
      energyTolerance
  ) {
    throw new TrapezoidalChannelDirectStepError(
      'NUMERICAL_FAILURE',
      'The direct-step calculation failed its geometric, hydraulic or energy-closure checks.',
    )
  }

  return {
    criticalDepth,

    normalDepth,

    channelSlopeClass,

    profileClassification:
      startZone,

    startFlowArea:
      start.flowArea,

    endFlowArea:
      end.flowArea,

    startHydraulicRadius:
      start.hydraulicRadius,

    endHydraulicRadius:
      end.hydraulicRadius,

    startVelocity:
      start.velocity,

    endVelocity:
      end.velocity,

    startFroudeNumber:
      start.froudeNumber,

    endFroudeNumber:
      end.froudeNumber,

    startSpecificEnergy:
      start.specificEnergy,

    endSpecificEnergy:
      end.specificEnergy,

    specificEnergyChange,

    startFrictionSlope:
      start.frictionSlope,

    endFrictionSlope:
      end.frictionSlope,

    averageFrictionSlope,

    slopeDifference,

    signedDistance,

    reachLength,

    reachDirection,

    bedElevationChange,

    waterSurfaceElevationChange,

    energyGradeLineChange,

    signedFrictionHeadChange,

    frictionHeadLoss,

    energyClosureResidual,

    hydraulicPowerDissipated,

    massFlowRate,

    normalDepthSolverIterations:
      normalSolution.iterations,

    modelName:
      'Trapezoidal Channel Direct-Step Method — Gradually Varied Flow',

    limitationDescription:
      'One-dimensional gradually varied flow using the direct-step method with arithmetic-average Manning friction slope between two specified depths. The reach must remain within one GVF profile zone and away from normal- and critical-depth asymptotes. Rapid transitions, hydraulic jumps, lateral inflow and spatially varying geometry or roughness are not modeled.',
  }
}

export function createTrapezoidalChannelDirectStepCsv(
  input:
    TrapezoidalChannelDirectStepInput,
  result:
    TrapezoidalChannelDirectStepResult,
): string {
  const rows = [
    [
      'Trapezoidal Channel Direct-Step Method — Gradually Varied Flow',
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
      'Manning roughness',
      input.manningRoughness,
      's/m^(1/3)',
    ],
    [
      'Channel slope',
      input.channelSlope,
      'm/m',
    ],
    [
      'Start depth',
      input.startDepth,
      'm',
    ],
    [
      'End depth',
      input.endDepth,
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
      'Critical depth',
      result.criticalDepth,
      'm',
    ],
    [
      'Normal depth',
      result.normalDepth,
      'm',
    ],
    [
      'Channel slope class',
      result.channelSlopeClass,
      '-',
    ],
    [
      'GVF profile classification',
      result.profileClassification,
      '-',
    ],
    [
      'Start specific energy',
      result.startSpecificEnergy,
      'm',
    ],
    [
      'End specific energy',
      result.endSpecificEnergy,
      'm',
    ],
    [
      'Specific energy change',
      result.specificEnergyChange,
      'm',
    ],
    [
      'Start friction slope',
      result.startFrictionSlope,
      'm/m',
    ],
    [
      'End friction slope',
      result.endFrictionSlope,
      'm/m',
    ],
    [
      'Average friction slope',
      result.averageFrictionSlope,
      'm/m',
    ],
    [
      'Slope difference S0-Sf',
      result.slopeDifference,
      'm/m',
    ],
    [
      'Signed direct-step distance',
      result.signedDistance,
      'm',
    ],
    [
      'Reach length',
      result.reachLength,
      'm',
    ],
    [
      'Reach direction',
      result.reachDirection,
      '-',
    ],
    [
      'Bed elevation change',
      result.bedElevationChange,
      'm',
    ],
    [
      'Water-surface elevation change',
      result.waterSurfaceElevationChange,
      'm',
    ],
    [
      'Energy-grade-line change',
      result.energyGradeLineChange,
      'm',
    ],
    [
      'Friction head loss',
      result.frictionHeadLoss,
      'm',
    ],
    [
      'Energy closure residual',
      result.energyClosureResidual,
      'm',
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
    [
      'Normal-depth solver iterations',
      result.normalDepthSolverIterations,
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
