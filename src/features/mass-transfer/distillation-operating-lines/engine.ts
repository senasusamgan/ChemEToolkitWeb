import type {
  DistillationLineGeometry,
  DistillationOperatingLinesInput,
  DistillationOperatingLinesResult,
} from './types.ts'

export type DistillationOperatingLinesErrorCode =
  | 'nonFiniteInput'
  | 'relativeVolatilityNotGreaterThanOne'
  | 'invalidCompositionOrdering'
  | 'nonPositiveRefluxRatio'
  | 'feedQualityOutOfRange'
  | 'minimumRefluxUnavailable'
  | 'refluxAtOrBelowMinimum'
  | 'invalidOperatingLineIntersection'

const ERROR_MESSAGES: Record<
  DistillationOperatingLinesErrorCode,
  string
> = {
  nonFiniteInput: 'All inputs must be finite.',
  relativeVolatilityNotGreaterThanOne:
    'Relative volatility must be greater than one.',
  invalidCompositionOrdering:
    'Compositions must satisfy 0 < xB < zF < xD < 1 for the selected light component.',
  nonPositiveRefluxRatio:
    'Reflux ratio must be greater than zero.',
  feedQualityOutOfRange:
    'Feed quality q must lie between −1 and 2 for the implemented operating-line model.',
  minimumRefluxUnavailable:
    'A physical q-line/equilibrium pinch could not be identified.',
  refluxAtOrBelowMinimum:
    'Reflux ratio must be greater than the calculated minimum reflux ratio.',
  invalidOperatingLineIntersection:
    'The operating lines do not form a physical feed intersection between xB and xD.',
}

export class DistillationOperatingLinesCalculationError extends Error {
  readonly code: DistillationOperatingLinesErrorCode

  constructor(code: DistillationOperatingLinesErrorCode) {
    super(ERROR_MESSAGES[code])
    this.name = 'DistillationOperatingLinesCalculationError'
    this.code = code
  }
}

const TOLERANCE = 1e-10

export function equilibriumY(x: number, alpha: number): number {
  return (alpha * x) / (1 + (alpha - 1) * x)
}

export function inverseEquilibriumX(
  y: number,
  alpha: number,
): number {
  return y / (alpha - (alpha - 1) * y)
}

function validate(input: DistillationOperatingLinesInput): void {
  const values = [
    input.relativeVolatility,
    input.distillateLightMoleFraction,
    input.bottomsLightMoleFraction,
    input.feedLightMoleFraction,
    input.refluxRatio,
    input.feedQuality,
  ]

  if (!values.every(Number.isFinite)) {
    throw new DistillationOperatingLinesCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.relativeVolatility <= 1) {
    throw new DistillationOperatingLinesCalculationError(
      'relativeVolatilityNotGreaterThanOne',
    )
  }

  if (
    !(
      input.bottomsLightMoleFraction > 0 &&
      input.bottomsLightMoleFraction <
        input.feedLightMoleFraction &&
      input.feedLightMoleFraction <
        input.distillateLightMoleFraction &&
      input.distillateLightMoleFraction < 1
    )
  ) {
    throw new DistillationOperatingLinesCalculationError(
      'invalidCompositionOrdering',
    )
  }

  if (input.refluxRatio <= 0) {
    throw new DistillationOperatingLinesCalculationError(
      'nonPositiveRefluxRatio',
    )
  }

  if (input.feedQuality < -1 || input.feedQuality > 2) {
    throw new DistillationOperatingLinesCalculationError(
      'feedQualityOutOfRange',
    )
  }
}

function qLineY(
  x: number,
  input: DistillationOperatingLinesInput,
): number {
  if (Math.abs(input.feedQuality - 1) <= TOLERANCE) {
    return Number.NaN
  }

  const slope = input.feedQuality / (input.feedQuality - 1)
  const intercept =
    -input.feedLightMoleFraction / (input.feedQuality - 1)

  return slope * x + intercept
}

function solvePinchX(
  input: DistillationOperatingLinesInput,
): number {
  if (Math.abs(input.feedQuality - 1) <= TOLERANCE) {
    return input.feedLightMoleFraction
  }

  if (Math.abs(input.feedQuality) <= TOLERANCE) {
    return inverseEquilibriumX(
      input.feedLightMoleFraction,
      input.relativeVolatility,
    )
  }

  const functionValue = (x: number) =>
    equilibriumY(x, input.relativeVolatility) -
    qLineY(x, input)

  const candidates: Array<[number, number]> = []
  const segments = 2000
  let previousX = 0
  let previousValue = functionValue(previousX)

  for (let index = 1; index <= segments; index += 1) {
    const x = index / segments
    const value = functionValue(x)

    if (Number.isFinite(value) && Math.abs(value) <= TOLERANCE) {
      candidates.push([x, x])
    } else if (
      Number.isFinite(previousValue) &&
      Number.isFinite(value) &&
      previousValue * value < 0
    ) {
      candidates.push([previousX, x])
    }

    previousX = x
    previousValue = value
  }

  const physicalCandidates = candidates
    .map(([lowerInitial, upperInitial]) => {
      if (lowerInitial === upperInitial) {
        return lowerInitial
      }

      let lower = lowerInitial
      let upper = upperInitial
      let lowerValue = functionValue(lower)

      for (let iteration = 0; iteration < 200; iteration += 1) {
        const midpoint = 0.5 * (lower + upper)
        const midpointValue = functionValue(midpoint)

        if (Math.abs(midpointValue) <= 1e-13) {
          return midpoint
        }

        if (lowerValue * midpointValue <= 0) {
          upper = midpoint
        } else {
          lower = midpoint
          lowerValue = midpointValue
        }
      }

      return 0.5 * (lower + upper)
    })
    .filter(
      (x) =>
        x > input.bottomsLightMoleFraction - TOLERANCE &&
        x < input.distillateLightMoleFraction + TOLERANCE,
    )

  if (physicalCandidates.length === 0) {
    throw new DistillationOperatingLinesCalculationError(
      'minimumRefluxUnavailable',
    )
  }

  return physicalCandidates.reduce((best, candidate) =>
    Math.abs(candidate - input.feedLightMoleFraction) <
    Math.abs(best - input.feedLightMoleFraction)
      ? candidate
      : best,
  )
}

export function calculateDistillationLineGeometry(
  input: DistillationOperatingLinesInput,
): DistillationLineGeometry {
  validate(input)

  const mr = input.refluxRatio / (input.refluxRatio + 1)
  const br =
    input.distillateLightMoleFraction /
    (input.refluxRatio + 1)

  let feedLineSlope: number | null
  let feedLineDescription: string
  let feedX: number
  let feedY: number

  if (Math.abs(input.feedQuality - 1) <= TOLERANCE) {
    feedLineSlope = null
    feedLineDescription =
      'Saturated-liquid feed: the q-line is vertical at x = zF.'
    feedX = input.feedLightMoleFraction
    feedY = mr * feedX + br
  } else {
    feedLineSlope =
      input.feedQuality / (input.feedQuality - 1)
    const feedLineIntercept =
      -input.feedLightMoleFraction /
      (input.feedQuality - 1)

    if (Math.abs(input.feedQuality) <= TOLERANCE) {
      feedLineDescription =
        'Saturated-vapor feed: the q-line is horizontal at y = zF.'
    } else if (input.feedQuality > 1) {
      feedLineDescription =
        'Subcooled-liquid feed: q > 1 and the q-line has positive slope greater than one.'
    } else if (input.feedQuality > 0) {
      feedLineDescription =
        'Partially vaporized feed: 0 < q < 1 and the q-line has negative slope.'
    } else {
      feedLineDescription =
        'Superheated-vapor feed: q < 0 and the q-line has positive slope below one.'
    }

    const denominator = mr - feedLineSlope

    if (Math.abs(denominator) <= TOLERANCE) {
      throw new DistillationOperatingLinesCalculationError(
        'invalidOperatingLineIntersection',
      )
    }

    feedX = (feedLineIntercept - br) / denominator
    feedY = mr * feedX + br
  }

  if (
    !Number.isFinite(feedX) ||
    !Number.isFinite(feedY) ||
    feedX <= input.bottomsLightMoleFraction + TOLERANCE ||
    feedX >= input.distillateLightMoleFraction - TOLERANCE ||
    feedY <= 0 ||
    feedY >= 1
  ) {
    throw new DistillationOperatingLinesCalculationError(
      'invalidOperatingLineIntersection',
    )
  }

  const strippingDenominator =
    feedX - input.bottomsLightMoleFraction

  if (strippingDenominator <= TOLERANCE) {
    throw new DistillationOperatingLinesCalculationError(
      'invalidOperatingLineIntersection',
    )
  }

  const ms =
    (feedY - input.bottomsLightMoleFraction) /
    strippingDenominator
  const bs =
    input.bottomsLightMoleFraction * (1 - ms)

  const pinchX = solvePinchX(input)
  const pinchY = equilibriumY(
    pinchX,
    input.relativeVolatility,
  )
  const minimumRefluxDenominator = pinchY - pinchX

  if (
    !Number.isFinite(pinchX) ||
    !Number.isFinite(pinchY) ||
    minimumRefluxDenominator <= TOLERANCE
  ) {
    throw new DistillationOperatingLinesCalculationError(
      'minimumRefluxUnavailable',
    )
  }

  const rmin =
    (input.distillateLightMoleFraction - pinchY) /
    minimumRefluxDenominator

  if (!Number.isFinite(rmin) || rmin <= 0) {
    throw new DistillationOperatingLinesCalculationError(
      'minimumRefluxUnavailable',
    )
  }

  if (input.refluxRatio <= rmin * (1 + TOLERANCE)) {
    throw new DistillationOperatingLinesCalculationError(
      'refluxAtOrBelowMinimum',
    )
  }

  return {
    mr,
    br,
    feedLineSlope,
    feedLineDescription,
    feedX,
    feedY,
    ms,
    bs,
    rmin,
    pinchX,
    pinchY,
  }
}

export function calculateDistillationOperatingLines(
  input: DistillationOperatingLinesInput,
): DistillationOperatingLinesResult {
  const geometry = calculateDistillationLineGeometry(input)

  return {
    rectifyingSlope: geometry.mr,
    rectifyingIntercept: geometry.br,
    feedLineSlope: geometry.feedLineSlope,
    feedLineDescription: geometry.feedLineDescription,
    feedIntersectionLiquidMoleFraction: geometry.feedX,
    feedIntersectionVaporMoleFraction: geometry.feedY,
    strippingSlope: geometry.ms,
    strippingIntercept: geometry.bs,
    minimumRefluxRatio: geometry.rmin,
    actualToMinimumRefluxRatio:
      input.refluxRatio / geometry.rmin,
    minimumRefluxPinchLiquidMoleFraction:
      geometry.pinchX,
    minimumRefluxPinchVaporMoleFraction:
      geometry.pinchY,
    modelName:
      'Binary distillation operating lines with constant relative volatility and constant molar overflow',
  }
}
