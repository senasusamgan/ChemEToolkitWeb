import type {
  PipeHydraulicsStateResult,
} from '../shared/pipeHydraulicsCore.ts'

export interface MaximumPipeLengthFromPressureDropInput {
  diameter: number
  volumetricFlowRate: number

  fluidDensity: number
  dynamicViscosity: number

  absoluteRoughness: number
  minorLossCoefficient: number

  availablePressureDrop: number
}

export interface MaximumPipeLengthFromPressureDropResult
  extends PipeHydraulicsStateResult {
  maximumPipeLength: number

  availablePressureDrop: number
  pressureAvailableForPipeFriction: number

  frictionPressureDropPerUnitLength: number
  minorLossBudgetFraction: number

  pressureDropResidual: number
  pressureDropResidualPercent: number

  modelName: string
  limitationDescription: string
}
