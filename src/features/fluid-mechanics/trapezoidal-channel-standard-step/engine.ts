import {
  calculateTrapezoidalChannelCriticalDepth,
} from '../trapezoidal-channel-critical-depth/engine.ts'

import type {
  TrapezoidalChannelStandardStepInput,
  TrapezoidalChannelStandardStepResult,
} from './types.ts'

export const TRAPEZOIDAL_CHANNEL_STANDARD_STEP_ENGINE_VERSION =
  'trapezoidal-channel-standard-step-v1'

export type TrapezoidalChannelStandardStepErrorCode =
  | 'INVALID_BOTTOM_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_MANNING_ROUGHNESS'
  | 'INVALID_CHANNEL_SLOPE'
  | 'INVALID_START_DEPTH'
  | 'INVALID_REACH_LENGTH'
  | 'INVALID_DENSITY'
  | 'NORMAL_DEPTH_FAILURE'
  | 'START_AT_PROFILE_ASYMPTOTE'
  | 'NEAR_UNIFORM_START'
  | 'NO_SAME_ZONE_SOLUTION'
  | 'AMBIGUOUS_STANDARD_STEP'
  | 'ROOT_CONVERGENCE_FAILURE'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalChannelStandardStepError
  extends Error {
  readonly code:
    TrapezoidalChannelStandardStepErrorCode

  constructor(
    code:
      TrapezoidalChannelStandardStepErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalChannelStandardStepError'

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

interface DepthRoot {
  depth: number

  iterations: number
}

interface ProfileBounds {
  lower: number

  upper: number | null
}

function sectionState(
  input:
    TrapezoidalChannelStandardStepInput,
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
    TrapezoidalChannelStandardStepInput,
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
    TrapezoidalChannelStandardStepInput,
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
      throw new TrapezoidalChannelStandardStepError(
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

  throw new TrapezoidalChannelStandardStepError(
    'NORMAL_DEPTH_FAILURE',
    'Manning normal-depth solver did not converge within 220 iterations.',
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
    throw new TrapezoidalChannelStandardStepError(
      'ROOT_CONVERGENCE_FAILURE',
      'Standard-step root bracket is invalid.',
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
      throw new TrapezoidalChannelStandardStepError(
        'ROOT_CONVERGENCE_FAILURE',
        'Standard-step depth residual became non-finite.',
      )
    }

    if (
      Math.abs(
        fm,
      ) <=
      1e-12
    ) {
      return {
        depth:
          mid,

        iterations:
          iteration,
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

  if (
    Math.abs(
      residual(
        depth,
      )
    ) >
      1e-9
  ) {
    throw new TrapezoidalChannelStandardStepError(
      'ROOT_CONVERGENCE_FAILURE',
      'Standard-step depth root did not converge within 220 iterations.',
    )
  }

  return {
    depth,

    iterations:
      220,
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
      !Number.isFinite(
        currentResidual,
      )
    ) {
      previousDepth =
        depth

      previousResidual =
        currentResidual

      continue
    }

    if (
      Number.isFinite(
        previousResidual,
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

function solveEndDepth(
  input:
    TrapezoidalChannelStandardStepInput,
  startState:
    SectionState,
  normalDepth: number,
  criticalDepth: number,
  profileZone: string,
): DepthRoot {
  const residual =
    (
      depth: number,
    ) => {
      const endState =
        sectionState(
          input,
          depth,
        )

      const averageFrictionSlope =
        (
          startState.frictionSlope +
          endState.frictionSlope
        ) /
        2

      return (
        endState.specificEnergy -
        startState.specificEnergy -
        (
          input.channelSlope -
          averageFrictionSlope
        ) *
        input.downstreamReachLength
      )
    }

  const denominator =
    1 -
    startState.froudeNumber *
    startState.froudeNumber

  if (
    Math.abs(
      denominator,
    ) <=
    1e-8
  ) {
    throw new TrapezoidalChannelStandardStepError(
      'START_AT_PROFILE_ASYMPTOTE',
      'Starting depth is too close to the critical-flow asymptote.',
    )
  }

  const localGradient =
    (
      input.channelSlope -
      startState.frictionSlope
    ) /
    denominator

  if (
    Math.abs(
      localGradient,
    ) <=
    Math.max(
      1e-12,
      input.channelSlope *
      1e-8,
    )
  ) {
    throw new TrapezoidalChannelStandardStepError(
      'NEAR_UNIFORM_START',
      'Starting flow is effectively uniform, so a finite standard-step depth change is ill-conditioned.',
    )
  }

  const bounds =
    profileBounds(
      profileZone,
      normalDepth,
      criticalDepth,
    )

  const depthScale =
    Math.max(
      input.startDepth,
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

  if (
    localGradient >
    0
  ) {
    const lower =
      input.startDepth +
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
          1200,
        )
    } else {
      let segmentStart =
        lower

      let segmentEnd =
        Math.max(
          input.startDepth *
          1.5,
          input.startDepth +
          Math.max(
            0.1,
            Math.abs(
              localGradient
            ) *
            input.downstreamReachLength *
            2,
          ),
        )

      for (
        let expansion = 0;
        expansion < 40;
        expansion += 1
      ) {
        roots.push(
          ...collectRoots(
            residual,
            segmentStart,
            segmentEnd,
            300,
          ),
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
  } else {
    const upper =
      input.startDepth -
      epsilon

    const lower =
      bounds.lower >
      0
        ? bounds.lower +
          epsilon
        : Math.max(
            1e-10,
            input.startDepth *
            1e-8,
          )

    roots =
      collectRoots(
        residual,
        lower,
        upper,
        1600,
      )
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
    throw new TrapezoidalChannelStandardStepError(
      'NO_SAME_ZONE_SOLUTION',
      'No downstream standard-step depth exists within the starting GVF profile zone for the specified reach length.',
    )
  }

  if (
    uniqueRoots.length >
    1
  ) {
    throw new TrapezoidalChannelStandardStepError(
      'AMBIGUOUS_STANDARD_STEP',
      'The selected standard-step reach is too long and produces multiple same-zone depth roots. Reduce the reach length and solve in smaller steps.',
    )
  }

  return uniqueRoots[
    0
  ]
}

export function calculateTrapezoidalChannelStandardStep(
  input:
    TrapezoidalChannelStandardStepInput,
): TrapezoidalChannelStandardStepResult {
  if (
    !Number.isFinite(
      input.bottomWidth,
    ) ||
    input.bottomWidth <=
      0
  ) {
    throw new TrapezoidalChannelStandardStepError(
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
    throw new TrapezoidalChannelStandardStepError(
      'INVALID_SIDE_SLOPE',
      'Side slope z must be a finite non-negative horizontal-to-vertical ratio.',
    )
  }

  if (
    !Number.isFinite(
      input.volumetricFlowRate,
    ) ||
    input.volumetricFlowRate <=
      0
  ) {
    throw new TrapezoidalChannelStandardStepError(
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
    throw new TrapezoidalChannelStandardStepError(
      'INVALID_MANNING_ROUGHNESS',
      'Manning roughness coefficient must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.channelSlope,
    ) ||
    input.channelSlope <=
      0
  ) {
    throw new TrapezoidalChannelStandardStepError(
      'INVALID_CHANNEL_SLOPE',
      'Channel bed slope must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.startDepth,
    ) ||
    input.startDepth <=
      0
  ) {
    throw new TrapezoidalChannelStandardStepError(
      'INVALID_START_DEPTH',
      'Starting flow depth must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.downstreamReachLength,
    ) ||
    input.downstreamReachLength <=
      0
  ) {
    throw new TrapezoidalChannelStandardStepError(
      'INVALID_REACH_LENGTH',
      'Downstream reach length must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <=
      0
  ) {
    throw new TrapezoidalChannelStandardStepError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
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
      input.startDepth -
      normalDepth,
    ) <=
      depthTolerance
  ) {
    throw new TrapezoidalChannelStandardStepError(
      'START_AT_PROFILE_ASYMPTOTE',
      'Starting depth must not lie at the critical-depth or normal-depth asymptote.',
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
      input.startDepth,
      normalDepth,
      criticalDepth,
      channelSlopeClass,
    )

  const start =
    sectionState(
      input,
      input.startDepth,
    )

  const root =
    solveEndDepth(
      input,
      start,
      normalDepth,
      criticalDepth,
      profileClassification,
    )

  const endDepth =
    root.depth

  const endZone =
    classifyProfileZone(
      endDepth,
      normalDepth,
      criticalDepth,
      channelSlopeClass,
    )

  if (
    endZone !==
    profileClassification
  ) {
    throw new TrapezoidalChannelStandardStepError(
      'NO_SAME_ZONE_SOLUTION',
      `Standard-step result crossed a GVF profile boundary (${profileClassification} → ${endZone}).`,
    )
  }

  const end =
    sectionState(
      input,
      endDepth,
    )

  const depthChange =
    endDepth -
    input.startDepth

  const profileTrend =
    depthChange >
    0
      ? 'Flow depth increases downstream'
      : 'Flow depth decreases downstream'

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

  const standardStepEnergyResidual =
    specificEnergyChange -
    slopeDifference *
    input.downstreamReachLength

  if (
    Math.abs(
      slopeDifference,
    ) <=
    Math.max(
      1e-14,
      input.channelSlope *
      1e-10,
    )
  ) {
    throw new TrapezoidalChannelStandardStepError(
      'NUMERICAL_FAILURE',
      'Solved average friction slope is too close to bed slope for a stable distance closure.',
    )
  }

  const equivalentDirectStepDistance =
    specificEnergyChange /
    slopeDifference

  const distanceClosureResidual =
    equivalentDirectStepDistance -
    input.downstreamReachLength

  const bedElevationChange =
    -input.channelSlope *
    input.downstreamReachLength

  const waterSurfaceElevationChange =
    bedElevationChange +
    depthChange

  const frictionHeadLoss =
    averageFrictionSlope *
    input.downstreamReachLength

  const energyGradeLineChange =
    -frictionHeadLoss

  const startDenominator =
    1 -
    start.froudeNumber *
    start.froudeNumber

  const endDenominator =
    1 -
    end.froudeNumber *
    end.froudeNumber

  const localGvfDepthGradientAtStart =
    (
      input.channelSlope -
      start.frictionSlope
    ) /
    startDenominator

  const localGvfDepthGradientAtEnd =
    (
      input.channelSlope -
      end.frictionSlope
    ) /
    endDenominator

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

    input.startDepth,

    endDepth,

    start.flowArea,

    end.flowArea,

    start.topWidth,

    end.topWidth,

    start.hydraulicRadius,

    end.hydraulicRadius,

    start.hydraulicDepth,

    end.hydraulicDepth,

    start.velocity,

    end.velocity,

    start.froudeNumber,

    end.froudeNumber,

    start.specificEnergy,

    end.specificEnergy,

    start.frictionSlope,

    end.frictionSlope,

    averageFrictionSlope,

    input.downstreamReachLength,

    equivalentDirectStepDistance,

    frictionHeadLoss,

    hydraulicPowerDissipated,

    massFlowRate,
  ]

  const finiteValues = [
    depthChange,

    specificEnergyChange,

    localGvfDepthGradientAtStart,

    localGvfDepthGradientAtEnd,

    distanceClosureResidual,

    bedElevationChange,

    waterSurfaceElevationChange,

    energyGradeLineChange,

    standardStepEnergyResidual,
  ]

  const energyTolerance =
    Math.max(
      1e-9,
      Math.max(
        start.specificEnergy,
        end.specificEnergy,
      ) *
      1e-8,
    )

  const distanceTolerance =
    Math.max(
      1e-6,
      input.downstreamReachLength *
      1e-7,
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
    Math.abs(
      standardStepEnergyResidual,
    ) >
      energyTolerance ||
    Math.abs(
      distanceClosureResidual,
    ) >
      distanceTolerance ||
    profileClassification !==
      endZone
  ) {
    throw new TrapezoidalChannelStandardStepError(
      'NUMERICAL_FAILURE',
      'The standard-step solution failed its energy, distance or GVF profile-zone closure checks.',
    )
  }

  return {
    criticalDepth,

    normalDepth,

    channelSlopeClass,

    profileClassification,

    profileTrend,

    startDepth:
      input.startDepth,

    endDepth,

    depthChange,

    startFlowArea:
      start.flowArea,

    endFlowArea:
      end.flowArea,

    startTopWidth:
      start.topWidth,

    endTopWidth:
      end.topWidth,

    startHydraulicRadius:
      start.hydraulicRadius,

    endHydraulicRadius:
      end.hydraulicRadius,

    startHydraulicDepth:
      start.hydraulicDepth,

    endHydraulicDepth:
      end.hydraulicDepth,

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

    localGvfDepthGradientAtStart,

    localGvfDepthGradientAtEnd,

    downstreamReachLength:
      input.downstreamReachLength,

    equivalentDirectStepDistance,

    distanceClosureResidual,

    bedElevationChange,

    waterSurfaceElevationChange,

    frictionHeadLoss,

    energyGradeLineChange,

    standardStepEnergyResidual,

    hydraulicPowerDissipated,

    massFlowRate,

    normalDepthSolverIterations:
      normalSolution.iterations,

    depthSolverIterations:
      root.iterations,

    modelName:
      'Trapezoidal Channel Standard-Step Method for Gradually Varied Flow',

    limitationDescription:
      'Single-reach standard-step GVF solution using Manning friction and the average endpoint friction slope. The downstream depth is solved implicitly within the same GVF profile zone as the starting section. Long reaches that produce multiple roots or cross critical/normal-depth asymptotes must be subdivided.',
  }
}

export function createTrapezoidalChannelStandardStepCsv(
  input:
    TrapezoidalChannelStandardStepInput,
  result:
    TrapezoidalChannelStandardStepResult,
): string {
  const rows = [
    [
      'Trapezoidal Channel Standard-Step Method - GVF',
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
      'Starting flow depth',
      input.startDepth,
      'm',
    ],
    [
      'Downstream reach length',
      input.downstreamReachLength,
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
      'Profile classification',
      result.profileClassification,
      '-',
    ],
    [
      'Channel slope class',
      result.channelSlopeClass,
      '-',
    ],
    [
      'Profile trend',
      result.profileTrend,
      '-',
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
      'Starting depth',
      result.startDepth,
      'm',
    ],
    [
      'Ending depth',
      result.endDepth,
      'm',
    ],
    [
      'Depth change',
      result.depthChange,
      'm',
    ],
    [
      'Starting velocity',
      result.startVelocity,
      'm/s',
    ],
    [
      'Ending velocity',
      result.endVelocity,
      'm/s',
    ],
    [
      'Starting Froude number',
      result.startFroudeNumber,
      '-',
    ],
    [
      'Ending Froude number',
      result.endFroudeNumber,
      '-',
    ],
    [
      'Starting specific energy',
      result.startSpecificEnergy,
      'm',
    ],
    [
      'Ending specific energy',
      result.endSpecificEnergy,
      'm',
    ],
    [
      'Starting friction slope',
      result.startFrictionSlope,
      '-',
    ],
    [
      'Ending friction slope',
      result.endFrictionSlope,
      '-',
    ],
    [
      'Average friction slope',
      result.averageFrictionSlope,
      '-',
    ],
    [
      'Equivalent direct-step distance',
      result.equivalentDirectStepDistance,
      'm',
    ],
    [
      'Distance closure residual',
      result.distanceClosureResidual,
      'm',
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
      'Friction head loss',
      result.frictionHeadLoss,
      'm',
    ],
    [
      'Standard-step energy residual',
      result.standardStepEnergyResidual,
      'm',
    ],
    [
      'Hydraulic power dissipated',
      result.hydraulicPowerDissipated,
      'W',
    ],
    [
      'Depth solver iterations',
      result.depthSolverIterations,
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
