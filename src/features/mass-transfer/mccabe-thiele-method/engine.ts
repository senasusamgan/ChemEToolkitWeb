import {
  DistillationOperatingLinesCalculationError,
  calculateDistillationLineGeometry,
  inverseEquilibriumX,
} from '../distillation-operating-lines/engine.ts'
import type {
  McCabeThieleMethodInput,
  McCabeThieleMethodResult,
} from './types.ts'

export type McCabeThieleMethodErrorCode =
  | 'nonConvergentStageStepping'

export class McCabeThieleMethodCalculationError extends Error {
  readonly code: McCabeThieleMethodErrorCode

  constructor(code: McCabeThieleMethodErrorCode) {
    super(
      'McCabe–Thiele stepping did not converge to a physical stage sequence.',
    )
    this.name = 'McCabeThieleMethodCalculationError'
    this.code = code
  }
}

const TOLERANCE = 1e-10

export { DistillationOperatingLinesCalculationError }

export function calculateMcCabeThieleMethod(
  input: McCabeThieleMethodInput,
): McCabeThieleMethodResult {
  const geometry = calculateDistillationLineGeometry(input)

  let currentY = input.distillateLightMoleFraction
  let previousX = input.distillateLightMoleFraction
  const stageLiquidCompositions: number[] = []
  let feedStageNumber: number | null = null
  let continuousTheoreticalStageCount: number | null = null
  let finalStageFraction = 1

  for (let stage = 1; stage <= 200; stage += 1) {
    const equilibriumX = inverseEquilibriumX(
      currentY,
      input.relativeVolatility,
    )

    if (
      !Number.isFinite(equilibriumX) ||
      equilibriumX >= previousX - TOLERANCE
    ) {
      throw new McCabeThieleMethodCalculationError(
        'nonConvergentStageStepping',
      )
    }

    stageLiquidCompositions.push(equilibriumX)

    if (
      equilibriumX <=
      input.bottomsLightMoleFraction
    ) {
      const denominator = previousX - equilibriumX

      if (denominator <= TOLERANCE) {
        throw new McCabeThieleMethodCalculationError(
          'nonConvergentStageStepping',
        )
      }

      finalStageFraction = Math.min(
        1,
        Math.max(
          0,
          (previousX -
            input.bottomsLightMoleFraction) /
            denominator,
        ),
      )

      continuousTheoreticalStageCount =
        stage - 1 + finalStageFraction
      break
    }

    if (
      feedStageNumber === null &&
      equilibriumX < geometry.feedX
    ) {
      feedStageNumber = stage
    }

    const nextY =
      equilibriumX >= geometry.feedX
        ? geometry.mr * equilibriumX + geometry.br
        : geometry.ms * equilibriumX + geometry.bs

    if (
      !Number.isFinite(nextY) ||
      nextY <= 0 ||
      nextY >= 1
    ) {
      throw new McCabeThieleMethodCalculationError(
        'nonConvergentStageStepping',
      )
    }

    currentY = nextY
    previousX = equilibriumX
  }

  if (
    continuousTheoreticalStageCount === null ||
    continuousTheoreticalStageCount <= 0
  ) {
    throw new McCabeThieleMethodCalculationError(
      'nonConvergentStageStepping',
    )
  }

  const requiredWholeStageCount = Math.max(
    1,
    Math.ceil(continuousTheoreticalStageCount - 1e-12),
  )

  return {
    continuousTheoreticalStageCount,
    requiredWholeStageCount,
    feedStageNumber:
      feedStageNumber ??
      Math.min(
        requiredWholeStageCount,
        stageLiquidCompositions.length,
      ),
    minimumRefluxRatio: geometry.rmin,
    actualToMinimumRefluxRatio:
      input.refluxRatio / geometry.rmin,
    rectifyingSlope: geometry.mr,
    strippingSlope: geometry.ms,
    feedIntersectionLiquidMoleFraction:
      geometry.feedX,
    feedIntersectionVaporMoleFraction:
      geometry.feedY,
    finalStageFraction,
    stageLiquidCompositions,
    countingConvention:
      'Stages include the partial reboiler and exclude the total condenser.',
    modelName:
      'Binary McCabe–Thiele method with constant relative volatility and constant molar overflow',
  }
}
