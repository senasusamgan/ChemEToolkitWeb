import type {
  RiddersRootFinderInput,
  RiddersRootFinderResult,
} from './types.ts'

export type RiddersRootFinderErrorCode =
  | 'nonFiniteInput'
  | 'invalidBracket'
  | 'rootNotBracketed'
  | 'invalidTolerance'
  | 'invalidMaximumIterations'
  | 'numericalFailure'

const messages: Record<RiddersRootFinderErrorCode, string> = {
  nonFiniteInput:
    'All Ridders-method inputs must be finite.',
  invalidBracket:
    'Upper bound must be greater than lower bound.',
  rootNotBracketed:
    'The endpoint function values must have opposite signs or include an endpoint root.',
  invalidTolerance:
    'Tolerance must be greater than zero.',
  invalidMaximumIterations:
    'Maximum iterations must be a positive integer.',
  numericalFailure:
    'The Ridders iteration produced a non-finite result.',
}

export class RiddersRootFinderCalculationError extends Error {
  readonly code: RiddersRootFinderErrorCode

  constructor(code: RiddersRootFinderErrorCode) {
    super(messages[code])
    this.name = 'RiddersRootFinderCalculationError'
    this.code = code
  }
}

function polynomial(
  x: number,
  input: RiddersRootFinderInput,
): number {
  return (
    input.coefficient3 * x ** 3 +
    input.coefficient2 * x ** 2 +
    input.coefficient1 * x +
    input.coefficient0
  )
}

export function calculateRiddersRootFinder(
  input: RiddersRootFinderInput,
): RiddersRootFinderResult {
  const values = Object.values(input)

  if (!values.every(Number.isFinite)) {
    throw new RiddersRootFinderCalculationError(
      'nonFiniteInput',
    )
  }

  if (input.upperBound <= input.lowerBound) {
    throw new RiddersRootFinderCalculationError(
      'invalidBracket',
    )
  }

  if (input.tolerance <= 0) {
    throw new RiddersRootFinderCalculationError(
      'invalidTolerance',
    )
  }

  if (
    !Number.isInteger(input.maximumIterations) ||
    input.maximumIterations <= 0
  ) {
    throw new RiddersRootFinderCalculationError(
      'invalidMaximumIterations',
    )
  }

  let lower = input.lowerBound
  let upper = input.upperBound
  let fLower = polynomial(lower, input)
  let fUpper = polynomial(upper, input)

  const initialFunctionLower = fLower
  const initialFunctionUpper = fUpper

  if (fLower === 0) {
    return {
      root: lower,
      functionAtRoot: 0,
      iterations: 0,
      converged: true,
      finalBracketWidth: upper - lower,
      initialFunctionLower,
      initialFunctionUpper,
      modelName:
        'Ridders bracketing root finder for a cubic polynomial',
      limitationDescription:
        'The method requires an initial sign-changing bracket. Multiple roots without a sign change are not detected.',
    }
  }

  if (fUpper === 0) {
    return {
      root: upper,
      functionAtRoot: 0,
      iterations: 0,
      converged: true,
      finalBracketWidth: upper - lower,
      initialFunctionLower,
      initialFunctionUpper,
      modelName:
        'Ridders bracketing root finder for a cubic polynomial',
      limitationDescription:
        'The method requires an initial sign-changing bracket. Multiple roots without a sign change are not detected.',
    }
  }

  if (fLower * fUpper > 0) {
    throw new RiddersRootFinderCalculationError(
      'rootNotBracketed',
    )
  }

  let root = Number.NaN
  let functionAtRoot = Number.NaN
  let iterations = 0
  let converged = false
  let previousRoot = Number.NaN

  while (iterations < input.maximumIterations) {
    const midpoint = 0.5 * (lower + upper)
    const fMid = polynomial(midpoint, input)

    const radicand = fMid ** 2 - fLower * fUpper

    if (radicand < 0) {
      throw new RiddersRootFinderCalculationError(
        'numericalFailure',
      )
    }

    const denominator = Math.sqrt(radicand)

    if (denominator === 0) {
      root = midpoint
      functionAtRoot = fMid
      converged =
        Math.abs(functionAtRoot) <= input.tolerance
      break
    }

    const sign =
      fLower - fUpper < 0 ? -1 : 1

    root =
      midpoint +
      (midpoint - lower) *
      sign *
      fMid /
      denominator

    functionAtRoot = polynomial(root, input)
    iterations += 1

    if (
      ![root, functionAtRoot].every(Number.isFinite)
    ) {
      throw new RiddersRootFinderCalculationError(
        'numericalFailure',
      )
    }

    if (
      Math.abs(functionAtRoot) <= input.tolerance ||
      (
        Number.isFinite(previousRoot) &&
        Math.abs(root - previousRoot) <=
          input.tolerance *
          Math.max(1, Math.abs(root))
      )
    ) {
      converged = true
      break
    }

    if (fMid * functionAtRoot < 0) {
      lower = midpoint
      fLower = fMid
      upper = root
      fUpper = functionAtRoot
    } else if (fLower * functionAtRoot < 0) {
      upper = root
      fUpper = functionAtRoot
    } else {
      lower = root
      fLower = functionAtRoot
    }

    previousRoot = root
  }

  const finalBracketWidth = Math.abs(upper - lower)

  return {
    root,
    functionAtRoot,
    iterations,
    converged,
    finalBracketWidth,
    initialFunctionLower,
    initialFunctionUpper,
    modelName:
      'Ridders bracketing root finder for a cubic polynomial',
    limitationDescription:
      'The method requires an initial sign-changing bracket. Multiple roots without a sign change are not detected.',
  }
}
