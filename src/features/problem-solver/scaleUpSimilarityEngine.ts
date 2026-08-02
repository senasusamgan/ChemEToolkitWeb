import {
  replaceConstraintAssignment,
} from './constraintOperatingWindowEngine.ts'

export const
  SCALE_UP_SIMILARITY_ENGINE_VERSION =
    'scale-up-similarity-v1' as const

export type ScaleUpCriterion =
  | 'reynolds'
  | 'froude'
  | 'weber'

export interface ScaleUpInput {
  criterion:
    ScaleUpCriterion
  prototypeLength: number
  scaleLength: number
  prototypeVelocity: number
  density: number
  dynamicViscosity: number
  gravity: number
  surfaceTension: number
}

export interface DimensionlessSet {
  reynoldsNumber: number
  froudeNumber: number
  weberNumber: number
}

export interface SimilarityMetric {
  key:
    'reynolds' |
    'froude' |
    'weber'
  label: string
  prototypeValue: number
  scaleValue: number
  ratio: number
  score: number
  isPreserved: boolean
}

export interface ScaleUpSimilarityResult {
  criterion:
    ScaleUpCriterion
  scaleRatio: number
  recommendedVelocity: number
  prototype:
    DimensionlessSet
  scale:
    DimensionlessSet
  metrics:
    SimilarityMetric[]
  overallSimilarityScore: number
  preservedMetricLabel: string
}

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

export function calculateDimensionlessSet({
  length,
  velocity,
  density,
  dynamicViscosity,
  gravity,
  surfaceTension,
}: {
  length: number
  velocity: number
  density: number
  dynamicViscosity: number
  gravity: number
  surfaceTension: number
}): DimensionlessSet {
  return {
    reynoldsNumber:
      density *
      velocity *
      length /
      dynamicViscosity,
    froudeNumber:
      velocity /
      Math.sqrt(
        gravity *
        length,
      ),
    weberNumber:
      density *
      velocity **
        2 *
      length /
      surfaceTension,
  }
}

export function calculateRequiredScaleVelocity(
  input:
    ScaleUpInput,
): number | null {
  const {
    criterion,
    prototypeLength,
    scaleLength,
    prototypeVelocity,
  } =
    input

  if (
    !positiveFinite(
      prototypeLength,
    ) ||
    !positiveFinite(
      scaleLength,
    ) ||
    !positiveFinite(
      prototypeVelocity,
    )
  ) {
    return null
  }

  switch (
    criterion
  ) {
    case 'reynolds':
      return (
        prototypeVelocity *
        prototypeLength /
        scaleLength
      )

    case 'froude':
      return (
        prototypeVelocity *
        Math.sqrt(
          scaleLength /
          prototypeLength,
        )
      )

    case 'weber':
      return (
        prototypeVelocity *
        Math.sqrt(
          prototypeLength /
          scaleLength,
        )
      )
  }
}

function calculateMetricScore(
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
    SimilarityMetric['key']
  label: string
  prototypeValue: number
  scaleValue: number
  preservedCriterion:
    ScaleUpCriterion
}): SimilarityMetric {
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
      calculateMetricScore(
        ratio,
      ),
    isPreserved:
      key ===
      preservedCriterion,
  }
}

export function calculateScaleUpSimilarity(
  input:
    ScaleUpInput,
): ScaleUpSimilarityResult | null {
  const values = [
    input.prototypeLength,
    input.scaleLength,
    input.prototypeVelocity,
    input.density,
    input.dynamicViscosity,
    input.gravity,
    input.surfaceTension,
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

  const recommendedVelocity =
    calculateRequiredScaleVelocity(
      input,
    )

  if (
    recommendedVelocity ===
      null
  ) {
    return null
  }

  const prototype =
    calculateDimensionlessSet({
      length:
        input.prototypeLength,
      velocity:
        input.prototypeVelocity,
      density:
        input.density,
      dynamicViscosity:
        input.dynamicViscosity,
      gravity:
        input.gravity,
      surfaceTension:
        input.surfaceTension,
    })

  const scale =
    calculateDimensionlessSet({
      length:
        input.scaleLength,
      velocity:
        recommendedVelocity,
      density:
        input.density,
      dynamicViscosity:
        input.dynamicViscosity,
      gravity:
        input.gravity,
      surfaceTension:
        input.surfaceTension,
    })

  const metrics = [
    createMetric({
      key:
        'reynolds',
      label:
        'Reynolds number',
      prototypeValue:
        prototype
          .reynoldsNumber,
      scaleValue:
        scale
          .reynoldsNumber,
      preservedCriterion:
        input.criterion,
    }),
    createMetric({
      key:
        'froude',
      label:
        'Froude number',
      prototypeValue:
        prototype
          .froudeNumber,
      scaleValue:
        scale
          .froudeNumber,
      preservedCriterion:
        input.criterion,
    }),
    createMetric({
      key:
        'weber',
      label:
        'Weber number',
      prototypeValue:
        prototype
          .weberNumber,
      scaleValue:
        scale
          .weberNumber,
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
    scaleRatio:
      input.scaleLength /
      input.prototypeLength,
    recommendedVelocity,
    prototype,
    scale,
    metrics,
    overallSimilarityScore,
    preservedMetricLabel:
      preservedMetric
        ?.label ??
      input.criterion,
  }
}

export function createScaleUpProblem(
  baseQuery: string,
  lengthSymbol: string,
  velocitySymbol: string,
  scaleLength: number,
  scaleVelocity: number,
): string {
  let result =
    replaceConstraintAssignment(
      baseQuery,
      lengthSymbol,
      scaleLength,
    )

  result =
    replaceConstraintAssignment(
      result,
      velocitySymbol,
      scaleVelocity,
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

export function createScaleUpCsv(
  result:
    ScaleUpSimilarityResult,
): string {
  const rows = [
    [
      'Similarity criterion',
      result.criterion,
    ],
    [
      'Scale ratio',
      result.scaleRatio,
    ],
    [
      'Recommended scale velocity',
      result.recommendedVelocity,
    ],
    [
      'Overall similarity score',
      result.overallSimilarityScore,
    ],
    [],
    [
      'Dimensionless group',
      'Prototype',
      'Scale-up',
      'Scale / prototype',
      'Similarity score',
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
