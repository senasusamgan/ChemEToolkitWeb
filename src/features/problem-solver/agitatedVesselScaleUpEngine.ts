import {
  replaceConstraintAssignment,
} from './constraintOperatingWindowEngine.ts'

export const
  AGITATED_VESSEL_SCALE_UP_ENGINE_VERSION =
    'agitated-vessel-scale-up-v1' as const

export type AgitatorScaleUpCriterion =
  | 'tipSpeed'
  | 'powerPerVolume'
  | 'reynolds'
  | 'froude';

export type AgitatedVesselScaleUpInput = {
  criterion:
    AgitatorScaleUpCriterion
  prototypeImpellerDiameter: number
  scaleImpellerDiameter: number
  prototypeSpeedRpm: number
  prototypeVesselVolume: number
  density: number
  dynamicViscosity: number
  powerNumber: number
  gravity: number
};

export type AgitatedVesselState = {
  impellerDiameter: number
  speedRpm: number
  speedPerSecond: number
  vesselVolume: number
  tipSpeed: number
  impellerReynoldsNumber: number
  impellerFroudeNumber: number
  power: number
  powerPerVolume: number
  torque: number
};

export type AgitatorSimilarityMetric = {
  key:
    AgitatorScaleUpCriterion
  label: string
  prototypeValue: number
  scaleValue: number
  ratio: number
  score: number
  isPreserved: boolean
};

export type AgitatedVesselScaleUpResult = {
  criterion:
    AgitatorScaleUpCriterion
  diameterScaleRatio: number
  volumeScaleRatio: number
  recommendedSpeedRpm: number
  prototype:
    AgitatedVesselState
  scale:
    AgitatedVesselState
  metrics:
    AgitatorSimilarityMetric[]
  overallSimilarityScore: number
  preservedMetricLabel: string
  powerIncreaseRatio: number
  torqueIncreaseRatio: number
};

function positiveFinite(
  value: number,
): boolean {
  return (
    Number.isFinite(
      value,
    ) &&
    value >
      0
  )
}

export function calculateRequiredAgitatorSpeedRpm(
  input:
    AgitatedVesselScaleUpInput,
): number | null {
  const {
    criterion,
    prototypeImpellerDiameter,
    scaleImpellerDiameter,
    prototypeSpeedRpm,
  } =
    input

  if (
    !positiveFinite(
      prototypeImpellerDiameter,
    ) ||
    !positiveFinite(
      scaleImpellerDiameter,
    ) ||
    !positiveFinite(
      prototypeSpeedRpm,
    )
  ) {
    return null
  }

  const diameterRatio =
    prototypeImpellerDiameter /
    scaleImpellerDiameter

  switch (
    criterion
  ) {
    case 'tipSpeed':
      return (
        prototypeSpeedRpm *
        diameterRatio
      )

    case 'powerPerVolume':
      return (
        prototypeSpeedRpm *
        diameterRatio **
          (
            2 /
            3
          )
      )

    case 'reynolds':
      return (
        prototypeSpeedRpm *
        diameterRatio **
          2
      )

    case 'froude':
      return (
        prototypeSpeedRpm *
        Math.sqrt(
          diameterRatio,
        )
      )
  }
}

export function calculateAgitatedVesselState({
  impellerDiameter,
  speedRpm,
  vesselVolume,
  density,
  dynamicViscosity,
  powerNumber,
  gravity,
}: {
  impellerDiameter: number
  speedRpm: number
  vesselVolume: number
  density: number
  dynamicViscosity: number
  powerNumber: number
  gravity: number
}): AgitatedVesselState {
  const speedPerSecond =
    speedRpm /
    60

  const tipSpeed =
    Math.PI *
    impellerDiameter *
    speedPerSecond

  const impellerReynoldsNumber =
    density *
    speedPerSecond *
    impellerDiameter **
      2 /
    dynamicViscosity

  const impellerFroudeNumber =
    speedPerSecond **
      2 *
    impellerDiameter /
    gravity

  const power =
    powerNumber *
    density *
    speedPerSecond **
      3 *
    impellerDiameter **
      5

  const powerPerVolume =
    power /
    vesselVolume

  const angularVelocity =
    2 *
    Math.PI *
    speedPerSecond

  const torque =
    power /
    angularVelocity

  return {
    impellerDiameter,
    speedRpm,
    speedPerSecond,
    vesselVolume,
    tipSpeed,
    impellerReynoldsNumber,
    impellerFroudeNumber,
    power,
    powerPerVolume,
    torque,
  }
}

function similarityScore(
  ratio: number,
): number {
  if (
    !positiveFinite(
      ratio,
    )
  ) {
    return 0
  }

  return (
    Math.min(
      ratio,
      1 /
        ratio,
    ) *
    100
  )
}

function createMetric({
  key,
  label,
  prototypeValue,
  scaleValue,
  preservedCriterion,
}: {
  key:
    AgitatorSimilarityMetric['key']
  label: string
  prototypeValue: number
  scaleValue: number
  preservedCriterion:
    AgitatorScaleUpCriterion
}): AgitatorSimilarityMetric {
  const ratio =
    scaleValue /
    prototypeValue

  return {
    key,
    label,
    prototypeValue,
    scaleValue,
    ratio,
    score:
      similarityScore(
        ratio,
      ),
    isPreserved:
      key ===
      preservedCriterion,
  }
}

export function calculateAgitatedVesselScaleUp(
  input:
    AgitatedVesselScaleUpInput,
): AgitatedVesselScaleUpResult | null {
  const values = [
    input.prototypeImpellerDiameter,
    input.scaleImpellerDiameter,
    input.prototypeSpeedRpm,
    input.prototypeVesselVolume,
    input.density,
    input.dynamicViscosity,
    input.powerNumber,
    input.gravity,
  ]

  if (
    values.some(
      (
        value,
      ) =>
        !positiveFinite(
          value,
        ),
    )
  ) {
    return null
  }

  const recommendedSpeedRpm =
    calculateRequiredAgitatorSpeedRpm(
      input,
    )

  if (
    recommendedSpeedRpm ===
      null
  ) {
    return null
  }

  const diameterScaleRatio =
    input.scaleImpellerDiameter /
    input.prototypeImpellerDiameter

  const volumeScaleRatio =
    diameterScaleRatio **
      3

  const scaleVesselVolume =
    input.prototypeVesselVolume *
    volumeScaleRatio

  const commonProperties = {
    density:
      input.density,
    dynamicViscosity:
      input.dynamicViscosity,
    powerNumber:
      input.powerNumber,
    gravity:
      input.gravity,
  }

  const prototype =
    calculateAgitatedVesselState({
      ...commonProperties,
      impellerDiameter:
        input.prototypeImpellerDiameter,
      speedRpm:
        input.prototypeSpeedRpm,
      vesselVolume:
        input.prototypeVesselVolume,
    })

  const scale =
    calculateAgitatedVesselState({
      ...commonProperties,
      impellerDiameter:
        input.scaleImpellerDiameter,
      speedRpm:
        recommendedSpeedRpm,
      vesselVolume:
        scaleVesselVolume,
    })

  const metrics = [
    createMetric({
      key:
        'tipSpeed',
      label:
        'Impeller tip speed',
      prototypeValue:
        prototype.tipSpeed,
      scaleValue:
        scale.tipSpeed,
      preservedCriterion:
        input.criterion,
    }),
    createMetric({
      key:
        'powerPerVolume',
      label:
        'Power per vessel volume',
      prototypeValue:
        prototype.powerPerVolume,
      scaleValue:
        scale.powerPerVolume,
      preservedCriterion:
        input.criterion,
    }),
    createMetric({
      key:
        'reynolds',
      label:
        'Impeller Reynolds number',
      prototypeValue:
        prototype
          .impellerReynoldsNumber,
      scaleValue:
        scale
          .impellerReynoldsNumber,
      preservedCriterion:
        input.criterion,
    }),
    createMetric({
      key:
        'froude',
      label:
        'Impeller Froude number',
      prototypeValue:
        prototype
          .impellerFroudeNumber,
      scaleValue:
        scale
          .impellerFroudeNumber,
      preservedCriterion:
        input.criterion,
    }),
  ]

  const overallSimilarityScore =
    metrics.reduce(
      (
        total,
        metric,
      ) =>
        total +
        metric.score,
      0,
    ) /
    metrics.length

  const preservedMetric =
    metrics.find(
      (
        metric,
      ) =>
        metric.isPreserved,
    )

  return {
    criterion:
      input.criterion,
    diameterScaleRatio,
    volumeScaleRatio,
    recommendedSpeedRpm,
    prototype,
    scale,
    metrics,
    overallSimilarityScore,
    preservedMetricLabel:
      preservedMetric
        ?.label ??
      input.criterion,
    powerIncreaseRatio:
      scale.power /
      prototype.power,
    torqueIncreaseRatio:
      scale.torque /
      prototype.torque,
  }
}

export function createAgitatedVesselScaleUpProblem(
  baseQuery: string,
  diameterSymbol: string,
  speedSymbol: string,
  scaleDiameter: number,
  scaleSpeedRpm: number,
): string {
  let result =
    replaceConstraintAssignment(
      baseQuery,
      diameterSymbol,
      scaleDiameter,
    )

  result =
    replaceConstraintAssignment(
      result,
      speedSymbol,
      scaleSpeedRpm,
    )

  return result
}

function csvCell(
  value:
    string | number | boolean,
): string {
  const text =
    String(
      value,
    )

  return `"${text.replace(
    /"/g,
    '""',
  )}"`
}

export function createAgitatedVesselScaleUpCsv(
  result:
    AgitatedVesselScaleUpResult,
): string {
  const rows:
    (
      string |
      number |
      boolean
    )[][] = [
      [
        'Scale-up criterion',
        result.criterion,
      ],
      [
        'Diameter scale ratio',
        result.diameterScaleRatio,
      ],
      [
        'Volume scale ratio',
        result.volumeScaleRatio,
      ],
      [
        'Recommended scale speed, rpm',
        result.recommendedSpeedRpm,
      ],
      [
        'Overall similarity score, %',
        result.overallSimilarityScore,
      ],
      [
        'Power increase ratio',
        result.powerIncreaseRatio,
      ],
      [
        'Torque increase ratio',
        result.torqueIncreaseRatio,
      ],
      [],
      [
        'Quantity',
        'Prototype',
        'Scale-up',
        'Scale / prototype',
        'Similarity score, %',
        'Preserved criterion',
      ],
      ...result.metrics.map(
        (
          metric,
        ) => [
          metric.label,
          metric.prototypeValue,
          metric.scaleValue,
          metric.ratio,
          metric.score,
          metric.isPreserved,
        ],
      ),
      [],
      [
        'Prototype power, W',
        result.prototype.power,
      ],
      [
        'Scale-up power, W',
        result.scale.power,
      ],
      [
        'Prototype torque, N m',
        result.prototype.torque,
      ],
      [
        'Scale-up torque, N m',
        result.scale.torque,
      ],
      [
        'Prototype vessel volume, m3',
        result.prototype.vesselVolume,
      ],
      [
        'Scale-up vessel volume, m3',
        result.scale.vesselVolume,
      ],
    ]

  return rows
    .map(
      (
        row,
      ) =>
        row
          .map(
            csvCell,
          )
          .join(','),
    )
    .join('\n')
}
