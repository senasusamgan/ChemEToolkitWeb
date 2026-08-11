import {
  calculateTrapezoidalChannelGvfSlope,
} from '../trapezoidal-channel-gvf-slope/engine.ts'

import type {
  TrapezoidalChannelGvfProfilePoint,
  TrapezoidalChannelGvfProfileRk4Input,
  TrapezoidalChannelGvfProfileRk4Result,
} from './types.ts'

export const TRAPEZOIDAL_CHANNEL_GVF_PROFILE_RK4_ENGINE_VERSION =
  'trapezoidal-channel-gvf-profile-rk4-v1'

export type TrapezoidalChannelGvfProfileRk4ErrorCode =
  | 'INVALID_BOTTOM_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_INITIAL_DEPTH'
  | 'INVALID_REACH_LENGTH'
  | 'INVALID_INTEGRATION_STEPS'
  | 'INVALID_DENSITY'
  | 'NON_POSITIVE_DEPTH'
  | 'CRITICAL_DEPTH_SINGULARITY'
  | 'PROFILE_BOUNDARY_CROSSING'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalChannelGvfProfileRk4Error
  extends Error {
  readonly code:
    TrapezoidalChannelGvfProfileRk4ErrorCode

  constructor(
    code:
      TrapezoidalChannelGvfProfileRk4ErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalChannelGvfProfileRk4Error'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

interface LocalState {
  flowArea: number

  topWidth: number

  wettedPerimeter: number

  hydraulicRadius: number

  hydraulicDepth: number

  velocity: number

  froudeNumber: number

  specificEnergy: number

  frictionSlope: number

  depthGradient: number
}

function localState(
  input:
    TrapezoidalChannelGvfProfileRk4Input,
  depth: number,
): LocalState {
  if (
    !Number.isFinite(
      depth,
    ) ||
    depth <= 0
  ) {
    throw new TrapezoidalChannelGvfProfileRk4Error(
      'NON_POSITIVE_DEPTH',
      'RK4 integration produced a non-positive or non-finite flow depth.',
    )
  }

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

  const denominator =
    1 -
    froudeNumber *
    froudeNumber

  if (
    !Number.isFinite(
      denominator,
    ) ||
    Math.abs(
      denominator,
    ) <=
      1e-8
  ) {
    throw new TrapezoidalChannelGvfProfileRk4Error(
      'CRITICAL_DEPTH_SINGULARITY',
      'The RK4 profile approached the critical-depth singularity where 1 − Fr² is approximately zero.',
    )
  }

  const depthGradient =
    (
      input.channelSlope -
      frictionSlope
    ) /
    denominator

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

    depthGradient,
  }
}

function classifyProfile(
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

function assertSameProfileZone(
  depth: number,
  startProfile:
    string,
  normalDepth: number,
  criticalDepth: number,
  channelSlopeClass: string,
): void {
  const depthScale =
    Math.max(
      depth,
      normalDepth,
      criticalDepth,
    )

  const tolerance =
    Math.max(
      1e-10,
      depthScale *
      1e-8,
    )

  if (
    Math.abs(
      depth -
      criticalDepth,
    ) <=
      tolerance ||
    Math.abs(
      depth -
      normalDepth,
    ) <=
      tolerance
  ) {
    throw new TrapezoidalChannelGvfProfileRk4Error(
      'PROFILE_BOUNDARY_CROSSING',
      'The integrated profile approached a normal- or critical-depth asymptote.',
    )
  }

  const profile =
    classifyProfile(
      depth,
      normalDepth,
      criticalDepth,
      channelSlopeClass,
    )

  if (
    profile !==
    startProfile
  ) {
    throw new TrapezoidalChannelGvfProfileRk4Error(
      'PROFILE_BOUNDARY_CROSSING',
      `The RK4 integration crossed a GVF profile boundary (${startProfile} → ${profile}). Reduce the reach length or integrate the adjacent profile separately.`,
    )
  }
}

export function calculateTrapezoidalChannelGvfProfileRk4(
  input:
    TrapezoidalChannelGvfProfileRk4Input,
): TrapezoidalChannelGvfProfileRk4Result {
  if (
    !Number.isFinite(
      input.bottomWidth,
    ) ||
    input.bottomWidth <= 0
  ) {
    throw new TrapezoidalChannelGvfProfileRk4Error(
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
    throw new TrapezoidalChannelGvfProfileRk4Error(
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
    throw new TrapezoidalChannelGvfProfileRk4Error(
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
    throw new TrapezoidalChannelGvfProfileRk4Error(
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
    throw new TrapezoidalChannelGvfProfileRk4Error(
      'INVALID_CHANNEL_SLOPE',
      'Channel bed slope must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.initialFlowDepth,
    ) ||
    input.initialFlowDepth <= 0
  ) {
    throw new TrapezoidalChannelGvfProfileRk4Error(
      'INVALID_INITIAL_DEPTH',
      'Initial flow depth must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.downstreamReachLength,
    ) ||
    input.downstreamReachLength <= 0
  ) {
    throw new TrapezoidalChannelGvfProfileRk4Error(
      'INVALID_REACH_LENGTH',
      'Downstream reach length must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.integrationSteps,
    ) ||
    !Number.isInteger(
      input.integrationSteps,
    ) ||
    input.integrationSteps < 4 ||
    input.integrationSteps > 5000
  ) {
    throw new TrapezoidalChannelGvfProfileRk4Error(
      'INVALID_INTEGRATION_STEPS',
      'RK4 integration steps must be an integer from 4 to 5000.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new TrapezoidalChannelGvfProfileRk4Error(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  const startSlope =
    calculateTrapezoidalChannelGvfSlope({
      bottomWidth:
        input.bottomWidth,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      volumetricFlowRate:
        input.volumetricFlowRate,

      manningRoughness:
        input.manningRoughness,

      channelSlope:
        input.channelSlope,

      flowDepth:
        input.initialFlowDepth,

      fluidDensity:
        input.fluidDensity,
    })

  const criticalDepth =
    startSlope.criticalDepth

  const normalDepth =
    startSlope.normalDepth

  const channelSlopeClass =
    startSlope.channelSlopeClass

  const startProfileClassification =
    startSlope.profileClassification

  const integrationStepLength =
    input.downstreamReachLength /
    input.integrationSteps

  let depth =
    input.initialFlowDepth

  let integratedFrictionHeadLoss =
    0

  let minimumFlowDepth =
    depth

  let maximumFlowDepth =
    depth

  let maximumAbsoluteDepthGradient =
    Math.abs(
      startSlope.depthGradient,
    )

  const profilePoints:
    TrapezoidalChannelGvfProfilePoint[] =
    []

  const startState =
    localState(
      input,
      depth,
    )

  profilePoints.push({
    distance:
      0,

    flowDepth:
      depth,

    froudeNumber:
      startState.froudeNumber,

    frictionSlope:
      startState.frictionSlope,

    specificEnergy:
      startState.specificEnergy,

    depthGradient:
      startState.depthGradient,
  })

  for (
    let step = 0;
    step <
      input.integrationSteps;
    step += 1
  ) {
    assertSameProfileZone(
      depth,
      startProfileClassification,
      normalDepth,
      criticalDepth,
      channelSlopeClass,
    )

    const h =
      integrationStepLength

    const state1 =
      localState(
        input,
        depth,
      )

    const k1 =
      state1.depthGradient

    const depth2 =
      depth +
      h *
      k1 /
      2

    assertSameProfileZone(
      depth2,
      startProfileClassification,
      normalDepth,
      criticalDepth,
      channelSlopeClass,
    )

    const state2 =
      localState(
        input,
        depth2,
      )

    const k2 =
      state2.depthGradient

    const depth3 =
      depth +
      h *
      k2 /
      2

    assertSameProfileZone(
      depth3,
      startProfileClassification,
      normalDepth,
      criticalDepth,
      channelSlopeClass,
    )

    const state3 =
      localState(
        input,
        depth3,
      )

    const k3 =
      state3.depthGradient

    const depth4 =
      depth +
      h *
      k3

    assertSameProfileZone(
      depth4,
      startProfileClassification,
      normalDepth,
      criticalDepth,
      channelSlopeClass,
    )

    const state4 =
      localState(
        input,
        depth4,
      )

    const k4 =
      state4.depthGradient

    const nextDepth =
      depth +
      h *
      (
        k1 +
        2 *
        k2 +
        2 *
        k3 +
        k4
      ) /
      6

    assertSameProfileZone(
      nextDepth,
      startProfileClassification,
      normalDepth,
      criticalDepth,
      channelSlopeClass,
    )

    integratedFrictionHeadLoss +=
      h *
      (
        state1.frictionSlope +
        2 *
        state2.frictionSlope +
        2 *
        state3.frictionSlope +
        state4.frictionSlope
      ) /
      6

    maximumAbsoluteDepthGradient =
      Math.max(
        maximumAbsoluteDepthGradient,

        Math.abs(k1),

        Math.abs(k2),

        Math.abs(k3),

        Math.abs(k4),
      )

    minimumFlowDepth =
      Math.min(
        minimumFlowDepth,

        depth2,

        depth3,

        depth4,

        nextDepth,
      )

    maximumFlowDepth =
      Math.max(
        maximumFlowDepth,

        depth2,

        depth3,

        depth4,

        nextDepth,
      )

    depth =
      nextDepth

    const pointState =
      localState(
        input,
        depth,
      )

    profilePoints.push({
      distance:
        (
          step +
          1
        ) *
        h,

      flowDepth:
        depth,

      froudeNumber:
        pointState.froudeNumber,

      frictionSlope:
        pointState.frictionSlope,

      specificEnergy:
        pointState.specificEnergy,

      depthGradient:
        pointState.depthGradient,
    })
  }

  const finalState =
    localState(
      input,
      depth,
    )

  const finalSlope =
    calculateTrapezoidalChannelGvfSlope({
      bottomWidth:
        input.bottomWidth,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      volumetricFlowRate:
        input.volumetricFlowRate,

      manningRoughness:
        input.manningRoughness,

      channelSlope:
        input.channelSlope,

      flowDepth:
        depth,

      fluidDensity:
        input.fluidDensity,
    })

  const endProfileClassification =
    finalSlope.profileClassification

  if (
    endProfileClassification !==
    startProfileClassification
  ) {
    throw new TrapezoidalChannelGvfProfileRk4Error(
      'PROFILE_BOUNDARY_CROSSING',
      'The final profile classification differs from the starting profile classification.',
    )
  }

  const depthChange =
    depth -
    input.initialFlowDepth

  const averageFrictionSlope =
    integratedFrictionHeadLoss /
    input.downstreamReachLength

  const bedElevationChange =
    -input.channelSlope *
    input.downstreamReachLength

  const waterSurfaceElevationChange =
    bedElevationChange +
    depthChange

  const energyGradeLineChange =
    -integratedFrictionHeadLoss

  const energyClosureResidual =
    (
      startState.specificEnergy +
      input.channelSlope *
      input.downstreamReachLength
    ) -
    (
      finalState.specificEnergy +
      integratedFrictionHeadLoss
    )

  const hydraulicPowerDissipated =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.volumetricFlowRate *
    integratedFrictionHeadLoss

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const positiveValues = [
    criticalDepth,

    normalDepth,

    depth,

    integrationStepLength,

    startState.flowArea,

    finalState.flowArea,

    startState.hydraulicRadius,

    finalState.hydraulicRadius,

    startState.velocity,

    finalState.velocity,

    startState.froudeNumber,

    finalState.froudeNumber,

    startState.frictionSlope,

    finalState.frictionSlope,

    startState.specificEnergy,

    finalState.specificEnergy,

    integratedFrictionHeadLoss,

    averageFrictionSlope,

    minimumFlowDepth,

    maximumFlowDepth,

    maximumAbsoluteDepthGradient,

    hydraulicPowerDissipated,

    massFlowRate,
  ]

  const energyTolerance =
    Math.max(
      1e-8,
      Math.max(
        startState.specificEnergy,
        finalState.specificEnergy,
      ) *
      1e-8,
    )

  if (
    !positiveValues.every(
      Number.isFinite,
    ) ||
    positiveValues.some(
      value =>
        value <= 0,
    ) ||
    profilePoints.length !==
      input.integrationSteps +
      1 ||
    !Number.isFinite(
      depthChange,
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
      energyClosureResidual,
    ) ||
    Math.abs(
      energyClosureResidual,
    ) >
      energyTolerance
  ) {
    throw new TrapezoidalChannelGvfProfileRk4Error(
      'NUMERICAL_FAILURE',
      'The RK4 GVF profile failed its integration, energy-closure or finite-value checks.',
    )
  }

  return {
    criticalDepth,

    normalDepth,

    channelSlopeClass,

    startProfileClassification,

    endProfileClassification,

    initialFlowDepth:
      input.initialFlowDepth,

    finalFlowDepth:
      depth,

    depthChange,

    downstreamReachLength:
      input.downstreamReachLength,

    integrationSteps:
      input.integrationSteps,

    integrationStepLength,

    startFlowArea:
      startState.flowArea,

    finalFlowArea:
      finalState.flowArea,

    startHydraulicRadius:
      startState.hydraulicRadius,

    finalHydraulicRadius:
      finalState.hydraulicRadius,

    startVelocity:
      startState.velocity,

    finalVelocity:
      finalState.velocity,

    startFroudeNumber:
      startState.froudeNumber,

    finalFroudeNumber:
      finalState.froudeNumber,

    startFrictionSlope:
      startState.frictionSlope,

    finalFrictionSlope:
      finalState.frictionSlope,

    startSpecificEnergy:
      startState.specificEnergy,

    finalSpecificEnergy:
      finalState.specificEnergy,

    integratedFrictionHeadLoss,

    averageFrictionSlope,

    bedElevationChange,

    waterSurfaceElevationChange,

    energyGradeLineChange,

    energyClosureResidual,

    minimumFlowDepth,

    maximumFlowDepth,

    maximumAbsoluteDepthGradient,

    hydraulicPowerDissipated,

    massFlowRate,

    profilePoints,

    modelName:
      'Trapezoidal Channel GVF Profile Integration — RK4',

    limitationDescription:
      'Finite-reach gradually varied flow integration using the classical fourth-order Runge–Kutta method and Manning friction. Integration proceeds downstream over a prismatic trapezoidal channel and must remain within a single GVF profile zone. Critical-depth singularities, normal-depth asymptote crossings, hydraulic jumps, lateral inflow and varying geometry or roughness are excluded.',
  }
}

export function createTrapezoidalChannelGvfProfileRk4Csv(
  input:
    TrapezoidalChannelGvfProfileRk4Input,
  result:
    TrapezoidalChannelGvfProfileRk4Result,
): string {
  const rows:
    Array<Array<string | number>> =
    [
      [
        'Trapezoidal Channel GVF Profile Integration — RK4',
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
        'Initial flow depth',
        input.initialFlowDepth,
        'm',
      ],
      [
        'Downstream reach length',
        input.downstreamReachLength,
        'm',
      ],
      [
        'Integration steps',
        input.integrationSteps,
        '-',
      ],
      [
        'Fluid density',
        input.fluidDensity,
        'kg/m3',
      ],
      [],
      [
        'Summary Result',
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
        'Start GVF profile',
        result.startProfileClassification,
        '-',
      ],
      [
        'End GVF profile',
        result.endProfileClassification,
        '-',
      ],
      [
        'Final flow depth',
        result.finalFlowDepth,
        'm',
      ],
      [
        'Depth change',
        result.depthChange,
        'm',
      ],
      [
        'Integrated friction head loss',
        result.integratedFrictionHeadLoss,
        'm',
      ],
      [
        'Average friction slope',
        result.averageFrictionSlope,
        'm/m',
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
      [],
      [
        'Profile Distance',
        'Flow Depth',
        'Froude Number',
        'Friction Slope',
        'Specific Energy',
        'dy/dx',
      ],
    ]

  for (
    const point of
    result.profilePoints
  ) {
    rows.push([
      point.distance,

      point.flowDepth,

      point.froudeNumber,

      point.frictionSlope,

      point.specificEnergy,

      point.depthGradient,
    ])
  }

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
