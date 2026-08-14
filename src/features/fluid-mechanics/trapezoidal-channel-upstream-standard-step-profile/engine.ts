import {
  calculateTrapezoidalChannelCriticalDepth,
} from '../trapezoidal-channel-critical-depth/engine.ts'

import type {
  TrapezoidalChannelUpstreamStandardStepProfileInput,
  TrapezoidalChannelUpstreamStandardStepProfilePoint,
  TrapezoidalChannelUpstreamStandardStepProfileResult,
} from './types.ts'

export const TRAPEZOIDAL_CHANNEL_UPSTREAM_STANDARD_STEP_PROFILE_ENGINE_VERSION =
  'trapezoidal-channel-upstream-standard-step-profile-v1'

export type TrapezoidalChannelUpstreamStandardStepProfileErrorCode =
  | 'INVALID_BOTTOM_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_DOWNSTREAM_DEPTH'
  | 'INVALID_REACH_LENGTH'
  | 'INVALID_NUMBER_OF_STEPS'
  | 'INVALID_DENSITY'
  | 'NORMAL_DEPTH_FAILURE'
  | 'BOUNDARY_AT_ASYMPTOTE'
  | 'NEAR_UNIFORM_BOUNDARY'
  | 'NO_SAME_ZONE_SOLUTION'
  | 'AMBIGUOUS_STANDARD_STEP'
  | 'ROOT_CONVERGENCE_FAILURE'
  | 'PROFILE_ZONE_CHANGE'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalChannelUpstreamStandardStepProfileError
  extends Error {
  readonly code:
    TrapezoidalChannelUpstreamStandardStepProfileErrorCode

  constructor(
    code:
      TrapezoidalChannelUpstreamStandardStepProfileErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalChannelUpstreamStandardStepProfileError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

interface SectionState {
  depth: number

  flowArea: number

  topWidth: number

  wettedPerimeter: number

  hydraulicRadius: number

  hydraulicDepth: number

  velocity: number

  froudeNumber: number

  specificEnergy: number

  frictionSlope: number

  localDepthGradient: number
}

interface DepthRoot {
  depth: number

  iterations: number

  residual: number
}

interface ProfileBounds {
  lower: number

  upper: number | null
}

interface ReverseStation {
  distanceFromDownstream: number

  state: SectionState
}


function sectionState(
  input:
    TrapezoidalChannelUpstreamStandardStepProfileInput,
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
    velocity *
    velocity /
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

  const gvfDenominator =
    1 -
    froudeNumber *
    froudeNumber

  const localDepthGradient =
    (
      input.channelSlope -
      frictionSlope
    ) /
    gvfDenominator

  return {
    depth,

    flowArea,

    topWidth,

    wettedPerimeter,

    hydraulicRadius,

    hydraulicDepth,

    velocity,

    froudeNumber,

    specificEnergy,

    frictionSlope,

    localDepthGradient,
  }
}


function manningFlowAtDepth(
  input:
    TrapezoidalChannelUpstreamStandardStepProfileInput,
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
    TrapezoidalChannelUpstreamStandardStepProfileInput,
): {
  normalDepth: number
  iterations: number
} {
  let lower =
    1e-10

  let upper =
    Math.max(
      1,
      input.downstreamControlDepth,
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
      throw new TrapezoidalChannelUpstreamStandardStepProfileError(
        'NORMAL_DEPTH_FAILURE',
        'Could not bracket Manning normal depth.',
      )
    }

    upperFlow =
      manningFlowAtDepth(
        input,
        upper,
      )
  }

  const tolerance =
    Math.max(
      1e-12,
      input.volumetricFlowRate *
      1e-11,
    )

  for (
    let iteration = 1;
    iteration <= 220;
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
      tolerance
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

  throw new TrapezoidalChannelUpstreamStandardStepProfileError(
    'NORMAL_DEPTH_FAILURE',
    'Manning normal-depth solver did not converge.',
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


function profileBounds(
  zone: string,
  normalDepth: number,
  criticalDepth: number,
): ProfileBounds {
  if (
    zone ===
    'M1'
  ) {
    return {
      lower:
        normalDepth,

      upper:
        null,
    }
  }

  if (
    zone ===
    'M2'
  ) {
    return {
      lower:
        criticalDepth,

      upper:
        normalDepth,
    }
  }

  if (
    zone ===
    'M3'
  ) {
    return {
      lower:
        0,

      upper:
        criticalDepth,
    }
  }

  if (
    zone ===
    'S1'
  ) {
    return {
      lower:
        criticalDepth,

      upper:
        null,
    }
  }

  if (
    zone ===
    'S2'
  ) {
    return {
      lower:
        normalDepth,

      upper:
        criticalDepth,
    }
  }

  if (
    zone ===
    'S3'
  ) {
    return {
      lower:
        0,

      upper:
        normalDepth,
    }
  }

  if (
    zone ===
    'C1'
  ) {
    return {
      lower:
        criticalDepth,

      upper:
        null,
    }
  }

  return {
    lower:
      0,

    upper:
      criticalDepth,
  }
}


function bisectRoot(
  residual:
    (
      depth: number,
    ) => number,
  lower: number,
  upper: number,
): DepthRoot {
  let lo =
    lower

  let hi =
    upper

  let flo =
    residual(
      lo,
    )

  let fhi =
    residual(
      hi,
    )

  if (
    !Number.isFinite(
      flo,
    ) ||
    !Number.isFinite(
      fhi,
    ) ||
    flo *
    fhi >
      0
  ) {
    throw new TrapezoidalChannelUpstreamStandardStepProfileError(
      'ROOT_CONVERGENCE_FAILURE',
      'Upstream standard-step root bracket is invalid.',
    )
  }

  for (
    let iteration = 1;
    iteration <= 220;
    iteration += 1
  ) {
    const mid =
      (
        lo +
        hi
      ) /
      2

    const fm =
      residual(
        mid,
      )

    if (
      !Number.isFinite(
        fm,
      )
    ) {
      throw new TrapezoidalChannelUpstreamStandardStepProfileError(
        'ROOT_CONVERGENCE_FAILURE',
        'Upstream standard-step residual became non-finite.',
      )
    }

    if (
      Math.abs(
        fm,
      ) <=
      1e-13
    ) {
      return {
        depth:
          mid,

        iterations:
          iteration,

        residual:
          fm,
      }
    }

    if (
      flo *
      fm <=
      0
    ) {
      hi =
        mid

      fhi =
        fm
    } else {
      lo =
        mid

      flo =
        fm
    }
  }

  const depth =
    (
      lo +
      hi
    ) /
    2

  const finalResidual =
    residual(
      depth,
    )

  if (
    Math.abs(
      finalResidual,
    ) >
      1e-9
  ) {
    throw new TrapezoidalChannelUpstreamStandardStepProfileError(
      'ROOT_CONVERGENCE_FAILURE',
      'Upstream standard-step depth root did not converge.',
    )
  }

  return {
    depth,

    iterations:
      220,

    residual:
      finalResidual,
  }
}


function collectRoots(
  residual:
    (
      depth: number,
    ) => number,
  start: number,
  end: number,
  samples: number,
): DepthRoot[] {
  if (
    !(end > start)
  ) {
    return []
  }

  const roots:
    DepthRoot[] =
    []

  let previousDepth =
    start

  let previousResidual =
    residual(
      previousDepth,
    )

  for (
    let index = 1;
    index <= samples;
    index += 1
  ) {
    const depth =
      start +
      (
        end -
        start
      ) *
      (
        index /
        samples
      )

    const currentResidual =
      residual(
        depth,
      )

    if (
      Number.isFinite(
        previousResidual,
      ) &&
      Number.isFinite(
        currentResidual,
      ) &&
      previousResidual *
      currentResidual <
        0
    ) {
      const root =
        bisectRoot(
          residual,
          previousDepth,
          depth,
        )

      const duplicate =
        roots.some(
          existing =>
            Math.abs(
              existing.depth -
              root.depth
            ) <=
            Math.max(
              1e-9,
              root.depth *
              1e-8,
            ),
        )

      if (
        !duplicate
      ) {
        roots.push(
          root,
        )
      }
    }

    previousDepth =
      depth

    previousResidual =
      currentResidual
  }

  return roots
}


function solveUpstreamDepth(
  input:
    TrapezoidalChannelUpstreamStandardStepProfileInput,
  downstreamDepth: number,
  stepLength: number,
  normalDepth: number,
  criticalDepth: number,
  profileClassification: string,
): DepthRoot {
  const downstream =
    sectionState(
      input,
      downstreamDepth,
    )

  const denominator =
    1 -
    downstream.froudeNumber *
    downstream.froudeNumber

  if (
    Math.abs(
      denominator,
    ) <=
    1e-8
  ) {
    throw new TrapezoidalChannelUpstreamStandardStepProfileError(
      'BOUNDARY_AT_ASYMPTOTE',
      'Current downstream station is too close to critical flow.',
    )
  }

  const downstreamGradient =
    downstream.localDepthGradient

  if (
    Math.abs(
      downstreamGradient,
    ) <=
    Math.max(
      1e-12,
      input.channelSlope *
      1e-8,
    )
  ) {
    throw new TrapezoidalChannelUpstreamStandardStepProfileError(
      'NEAR_UNIFORM_BOUNDARY',
      'Current station is effectively at normal depth, making upstream marching ill-conditioned.',
    )
  }

  const residual =
    (
      upstreamDepth: number,
    ) => {
      const upstream =
        sectionState(
          input,
          upstreamDepth,
        )

      const averageFrictionSlope =
        (
          upstream.frictionSlope +
          downstream.frictionSlope
        ) /
        2

      return (
        downstream.specificEnergy -
        upstream.specificEnergy -
        (
          input.channelSlope -
          averageFrictionSlope
        ) *
        stepLength
      )
    }

  const bounds =
    profileBounds(
      profileClassification,
      normalDepth,
      criticalDepth,
    )

  const depthScale =
    Math.max(
      downstreamDepth,
      normalDepth,
      criticalDepth,
      1,
    )

  const epsilon =
    Math.max(
      1e-10,
      depthScale *
      1e-8,
    )

  let roots:
    DepthRoot[] =
    []

  /*
   * dy/dx > 0:
   * depth increases downstream,
   * so upstream depth must be smaller.
   *
   * dy/dx < 0:
   * depth decreases downstream,
   * so upstream depth must be larger.
   */
  if (
    downstreamGradient >
    0
  ) {
    const lower =
      bounds.lower >
      0
        ? bounds.lower +
          epsilon
        : Math.max(
            1e-10,
            downstreamDepth *
            1e-8,
          )

    const upper =
      downstreamDepth -
      epsilon

    roots =
      collectRoots(
        residual,
        lower,
        upper,
        1800,
      )
  } else {
    const lower =
      downstreamDepth +
      epsilon

    if (
      bounds.upper !==
      null
    ) {
      const upper =
        bounds.upper -
        epsilon

      roots =
        collectRoots(
          residual,
          lower,
          upper,
          1800,
        )
    } else {
      let segmentStart =
        lower

      let segmentEnd =
        Math.max(
          downstreamDepth *
          1.5,
          downstreamDepth +
          Math.max(
            0.1,
            Math.abs(
              downstreamGradient
            ) *
            stepLength *
            2,
          ),
        )

      for (
        let expansion = 0;
        expansion < 40;
        expansion += 1
      ) {
        const segmentRoots =
          collectRoots(
            residual,
            segmentStart,
            segmentEnd,
            400,
          )

        roots.push(
          ...segmentRoots,
        )

        if (
          roots.length >
          0
        ) {
          break
        }

        segmentStart =
          segmentEnd

        segmentEnd *=
          1.8

        if (
          !Number.isFinite(
            segmentEnd,
          ) ||
          segmentEnd >
          1e10
        ) {
          break
        }
      }
    }
  }

  const uniqueRoots:
    DepthRoot[] =
    []

  for (
    const root of roots
  ) {
    const duplicate =
      uniqueRoots.some(
        existing =>
          Math.abs(
            existing.depth -
            root.depth
          ) <=
          Math.max(
            1e-8,
            root.depth *
            1e-7,
          ),
      )

    if (
      !duplicate
    ) {
      uniqueRoots.push(
        root,
      )
    }
  }

  if (
    uniqueRoots.length ===
    0
  ) {
    throw new TrapezoidalChannelUpstreamStandardStepProfileError(
      'NO_SAME_ZONE_SOLUTION',
      'No upstream standard-step depth exists inside the current GVF profile zone. Use shorter steps or a closer downstream boundary.',
    )
  }

  if (
    uniqueRoots.length >
    1
  ) {
    throw new TrapezoidalChannelUpstreamStandardStepProfileError(
      'AMBIGUOUS_STANDARD_STEP',
      'The upstream standard step produced multiple same-zone roots. Increase the number of steps.',
    )
  }

  return uniqueRoots[
    0
  ]
}


export function calculateTrapezoidalChannelUpstreamStandardStepProfile(
  input:
    TrapezoidalChannelUpstreamStandardStepProfileInput,
): TrapezoidalChannelUpstreamStandardStepProfileResult {
  if (
    !Number.isFinite(
      input.bottomWidth,
    ) ||
    input.bottomWidth <=
      0
  ) {
    throw new TrapezoidalChannelUpstreamStandardStepProfileError(
      'INVALID_BOTTOM_WIDTH',
      'Channel bottom width must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.sideSlopeHorizontalPerVertical,
    ) ||
    input.sideSlopeHorizontalPerVertical <
      0
  ) {
    throw new TrapezoidalChannelUpstreamStandardStepProfileError(
      'INVALID_SIDE_SLOPE',
      'Side slope z must be a finite non-negative ratio.',
    )
  }

  if (
    !Number.isFinite(
      input.volumetricFlowRate,
    ) ||
    input.volumetricFlowRate <=
      0
  ) {
    throw new TrapezoidalChannelUpstreamStandardStepProfileError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.manningRoughness,
    ) ||
    input.manningRoughness <=
      0
  ) {
    throw new TrapezoidalChannelUpstreamStandardStepProfileError(
      'INVALID_MANNING_ROUGHNESS',
      'Manning roughness coefficient must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.channelSlope,
    ) ||
    input.channelSlope <=
      0
  ) {
    throw new TrapezoidalChannelUpstreamStandardStepProfileError(
      'INVALID_CHANNEL_SLOPE',
      'Channel bed slope must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.downstreamControlDepth,
    ) ||
    input.downstreamControlDepth <=
      0
  ) {
    throw new TrapezoidalChannelUpstreamStandardStepProfileError(
      'INVALID_DOWNSTREAM_DEPTH',
      'Downstream control depth must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.upstreamReachLength,
    ) ||
    input.upstreamReachLength <=
      0
  ) {
    throw new TrapezoidalChannelUpstreamStandardStepProfileError(
      'INVALID_REACH_LENGTH',
      'Upstream reach length must be positive and finite.',
    )
  }

  if (
    !Number.isFinite(
      input.numberOfSteps,
    ) ||
    !Number.isInteger(
      input.numberOfSteps,
    ) ||
    input.numberOfSteps <
      1 ||
    input.numberOfSteps >
      2000
  ) {
    throw new TrapezoidalChannelUpstreamStandardStepProfileError(
      'INVALID_NUMBER_OF_STEPS',
      'Number of standard steps must be an integer from 1 to 2000.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <=
      0
  ) {
    throw new TrapezoidalChannelUpstreamStandardStepProfileError(
      'INVALID_DENSITY',
      'Fluid density must be positive and finite.',
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
      input.downstreamControlDepth,
    )

  const depthTolerance =
    Math.max(
      1e-10,
      depthScale *
      1e-8,
    )

  if (
    Math.abs(
      input.downstreamControlDepth -
      criticalDepth,
    ) <=
      depthTolerance ||
    Math.abs(
      input.downstreamControlDepth -
      normalDepth,
    ) <=
      depthTolerance
  ) {
    throw new TrapezoidalChannelUpstreamStandardStepProfileError(
      'BOUNDARY_AT_ASYMPTOTE',
      'Downstream control depth must not lie at the critical- or normal-depth asymptote.',
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

  const profileClassification =
    classifyProfileZone(
      input.downstreamControlDepth,
      normalDepth,
      criticalDepth,
      channelSlopeClass,
    )

  const stepLength =
    input.upstreamReachLength /
    input.numberOfSteps

  const reverseStations:
    ReverseStation[] = [
      {
        distanceFromDownstream:
          0,

        state:
          sectionState(
            input,
            input.downstreamControlDepth,
          ),
      },
    ]

  let currentDepth =
    input.downstreamControlDepth

  let cumulativeDepthSolverIterations =
    0

  let cumulativeSegmentEnergyResidual =
    0

  for (
    let stepIndex = 1;
    stepIndex <=
      input.numberOfSteps;
    stepIndex += 1
  ) {
    const root =
      solveUpstreamDepth(
        input,
        currentDepth,
        stepLength,
        normalDepth,
        criticalDepth,
        profileClassification,
      )

    const upstreamState =
      sectionState(
        input,
        root.depth,
      )

    const upstreamZone =
      classifyProfileZone(
        root.depth,
        normalDepth,
        criticalDepth,
        channelSlopeClass,
      )

    if (
      upstreamZone !==
      profileClassification
    ) {
      throw new TrapezoidalChannelUpstreamStandardStepProfileError(
        'PROFILE_ZONE_CHANGE',
        `Upstream profile crossed from ${profileClassification} to ${upstreamZone} at reverse step ${stepIndex}.`,
      )
    }

    cumulativeDepthSolverIterations +=
      root.iterations

    cumulativeSegmentEnergyResidual +=
      root.residual

    reverseStations.push({
      distanceFromDownstream:
        stepIndex *
        stepLength,

      state:
        upstreamState,
    })

    currentDepth =
      root.depth
  }

  const orderedStations =
    reverseStations
      .slice()
      .reverse()

  const profilePoints:
    TrapezoidalChannelUpstreamStandardStepProfilePoint[] =
    []

  let totalFrictionHeadLoss =
    0

  let maximumAbsoluteDepthGradient =
    0

  for (
    let index = 0;
    index <
      orderedStations.length;
    index += 1
  ) {
    const station =
      orderedStations[
        index
      ]

    maximumAbsoluteDepthGradient =
      Math.max(
        maximumAbsoluteDepthGradient,
        Math.abs(
          station.state.localDepthGradient,
        ),
      )

    if (
      index >
      0
    ) {
      const previous =
        orderedStations[
          index -
          1
        ]

      totalFrictionHeadLoss +=
        (
          previous.state.frictionSlope +
          station.state.frictionSlope
        ) /
        2 *
        stepLength
    }

    const distanceFromUpstream =
      index *
      stepLength

    profilePoints.push({
      stationIndex:
        index,

      distanceFromUpstream,

      distanceFromDownstream:
        input.upstreamReachLength -
        distanceFromUpstream,

      flowDepth:
        station.state.depth,

      flowArea:
        station.state.flowArea,

      velocity:
        station.state.velocity,

      froudeNumber:
        station.state.froudeNumber,

      specificEnergy:
        station.state.specificEnergy,

      frictionSlope:
        station.state.frictionSlope,

      localDepthGradient:
        station.state.localDepthGradient,

      cumulativeFrictionHeadLoss:
        totalFrictionHeadLoss,
    })
  }

  const upstream =
    orderedStations[
      0
    ].state

  const downstream =
    orderedStations[
      orderedStations.length -
      1
    ].state

  const upstreamBoundaryDepth =
    upstream.depth

  const downstreamControlDepth =
    downstream.depth

  const downstreamDepthChange =
    downstreamControlDepth -
    upstreamBoundaryDepth

  const profileTrendDownstream =
    downstreamDepthChange >
    0
      ? 'Flow depth increases downstream'
      : downstreamDepthChange <
        0
        ? 'Flow depth decreases downstream'
        : 'Flow depth is effectively unchanged'

  const minimumFlowDepth =
    Math.min(
      ...profilePoints.map(
        point =>
          point.flowDepth,
      ),
    )

  const maximumFlowDepth =
    Math.max(
      ...profilePoints.map(
        point =>
          point.flowDepth,
      ),
    )

  const averageFrictionSlope =
    totalFrictionHeadLoss /
    input.upstreamReachLength

  const bedElevationChangeDownstream =
    -input.channelSlope *
    input.upstreamReachLength

  const waterSurfaceElevationChangeDownstream =
    bedElevationChangeDownstream +
    downstreamDepthChange

  const energyGradeLineChangeDownstream =
    -totalFrictionHeadLoss

  const totalEnergyClosureResidual =
    (
      downstream.specificEnergy -
      upstream.specificEnergy
    ) -
    (
      input.channelSlope *
      input.upstreamReachLength -
      totalFrictionHeadLoss
    )

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const hydraulicPowerDissipated =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.volumetricFlowRate *
    totalFrictionHeadLoss

  const positiveValues = [
    criticalDepth,

    normalDepth,

    upstreamBoundaryDepth,

    downstreamControlDepth,

    input.upstreamReachLength,

    stepLength,

    upstream.flowArea,

    downstream.flowArea,

    upstream.velocity,

    downstream.velocity,

    upstream.froudeNumber,

    downstream.froudeNumber,

    upstream.specificEnergy,

    downstream.specificEnergy,

    upstream.frictionSlope,

    downstream.frictionSlope,

    totalFrictionHeadLoss,

    averageFrictionSlope,

    maximumAbsoluteDepthGradient,

    hydraulicPowerDissipated,

    massFlowRate,
  ]

  const finiteValues = [
    downstreamDepthChange,

    bedElevationChangeDownstream,

    waterSurfaceElevationChangeDownstream,

    energyGradeLineChangeDownstream,

    cumulativeSegmentEnergyResidual,

    totalEnergyClosureResidual,
  ]

  const energyTolerance =
    Math.max(
      1e-8,
      Math.max(
        upstream.specificEnergy,
        downstream.specificEnergy,
      ) *
      1e-7,
    )

  const distanceTolerance =
    Math.max(
      1e-9,
      input.upstreamReachLength *
      1e-10,
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
    !finiteValues.every(
      value =>
        Number.isFinite(value),
    ) ||
    profilePoints.length !==
      input.numberOfSteps +
      1 ||
    Math.abs(
      profilePoints[
        profilePoints.length -
        1
      ].distanceFromUpstream -
      input.upstreamReachLength
    ) >
      distanceTolerance ||
    Math.abs(
      profilePoints[
        0
      ].distanceFromDownstream -
      input.upstreamReachLength
    ) >
      distanceTolerance ||
    Math.abs(
      cumulativeSegmentEnergyResidual,
    ) >
      energyTolerance ||
    Math.abs(
      totalEnergyClosureResidual,
    ) >
      energyTolerance
  ) {
    throw new TrapezoidalChannelUpstreamStandardStepProfileError(
      'NUMERICAL_FAILURE',
      'The upstream standard-step profile failed its station-count, distance, energy or hydraulic-state closure checks.',
    )
  }

  return {
    criticalDepth,

    normalDepth,

    channelSlopeClass,

    profileClassification,

    profileTrendDownstream,

    upstreamBoundaryDepth,

    downstreamControlDepth,

    downstreamDepthChange,

    minimumFlowDepth,

    maximumFlowDepth,

    upstreamReachLength:
      input.upstreamReachLength,

    numberOfSteps:
      input.numberOfSteps,

    stepLength,

    upstreamFlowArea:
      upstream.flowArea,

    downstreamFlowArea:
      downstream.flowArea,

    upstreamVelocity:
      upstream.velocity,

    downstreamVelocity:
      downstream.velocity,

    upstreamFroudeNumber:
      upstream.froudeNumber,

    downstreamFroudeNumber:
      downstream.froudeNumber,

    upstreamSpecificEnergy:
      upstream.specificEnergy,

    downstreamSpecificEnergy:
      downstream.specificEnergy,

    upstreamFrictionSlope:
      upstream.frictionSlope,

    downstreamFrictionSlope:
      downstream.frictionSlope,

    totalFrictionHeadLoss,

    averageFrictionSlope,

    bedElevationChangeDownstream,

    waterSurfaceElevationChangeDownstream,

    energyGradeLineChangeDownstream,

    cumulativeSegmentEnergyResidual,

    totalEnergyClosureResidual,

    maximumAbsoluteDepthGradient,

    hydraulicPowerDissipated,

    massFlowRate,

    cumulativeDepthSolverIterations,

    normalDepthSolverIterations:
      normalSolution.iterations,

    profilePoints,

    modelName:
      'Upstream Standard-Step GVF Profile from a Downstream Boundary',

    limitationDescription:
      'Reverse standard-step gradually varied flow analysis. A known downstream control depth is marched upstream through equal reach segments while remaining in the same GVF profile zone. The method is especially useful for backwater calculations and does not integrate through hydraulic jumps, normal-depth asymptotes or the critical-depth singularity.',
  }
}


export function createTrapezoidalChannelUpstreamStandardStepProfileCsv(
  input:
    TrapezoidalChannelUpstreamStandardStepProfileInput,
  result:
    TrapezoidalChannelUpstreamStandardStepProfileResult,
): string {
  const rows: Array<
    Array<
      string |
      number
    >
  > = [
    [
      'Upstream Standard-Step GVF Profile from a Downstream Boundary',
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
      '-',
    ],
    [
      'Channel slope',
      input.channelSlope,
      '-',
    ],
    [
      'Downstream control depth',
      input.downstreamControlDepth,
      'm',
    ],
    [
      'Upstream reach length',
      input.upstreamReachLength,
      'm',
    ],
    [
      'Number of standard steps',
      input.numberOfSteps,
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
      'GVF profile',
      result.profileClassification,
      '-',
    ],
    [
      'Upstream boundary depth',
      result.upstreamBoundaryDepth,
      'm',
    ],
    [
      'Downstream control depth',
      result.downstreamControlDepth,
      'm',
    ],
    [
      'Downstream depth change',
      result.downstreamDepthChange,
      'm',
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
      'Total friction head loss',
      result.totalFrictionHeadLoss,
      'm',
    ],
    [
      'Average friction slope',
      result.averageFrictionSlope,
      '-',
    ],
    [
      'Water-surface elevation change',
      result.waterSurfaceElevationChangeDownstream,
      'm',
    ],
    [
      'Total energy closure residual',
      result.totalEnergyClosureResidual,
      'm',
    ],
    [
      'Hydraulic power dissipated',
      result.hydraulicPowerDissipated,
      'W',
    ],
    [],
    [
      'Station',
      'Distance from Upstream (m)',
      'Distance from Downstream (m)',
      'Depth (m)',
      'Area (m2)',
      'Velocity (m/s)',
      'Froude',
      'Specific Energy (m)',
      'Friction Slope',
      'dy/dx',
      'Cumulative Friction Head (m)',
    ],
  ]

  for (
    const point of
      result.profilePoints
  ) {
    rows.push([
      point.stationIndex,

      point.distanceFromUpstream,

      point.distanceFromDownstream,

      point.flowDepth,

      point.flowArea,

      point.velocity,

      point.froudeNumber,

      point.specificEnergy,

      point.frictionSlope,

      point.localDepthGradient,

      point.cumulativeFrictionHeadLoss,
    ])
  }

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
