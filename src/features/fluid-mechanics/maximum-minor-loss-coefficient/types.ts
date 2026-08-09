import type {
  PipeHydraulicsStateResult,
} from '../shared/pipeHydraulicsCore.ts'

export interface MaximumMinorLossCoefficientInput {
  diameter: number
  volumetricFlowRate: number
  pipeLength: number

  fluidDensity: number
  dynamicViscosity: number

  absoluteRoughness: number

  availablePressureDrop: number
}

export interface MaximumMinorLossCoefficientResult
  extends PipeHydraulicsStateResult {
  maximumMinorLossCoefficient: number

  availablePressureDrop: number

  pressureDropAvailableForMinorLosses: number

  frictionBudgetFraction: number
  minorLossBudgetFraction: number

  frictionBudgetPercent: number
  minorLossBudgetPercent: number

  pressureDropResidual: number
  pressureDropResidualPercent: number

  modelName: string
  limitationDescription: string
}
