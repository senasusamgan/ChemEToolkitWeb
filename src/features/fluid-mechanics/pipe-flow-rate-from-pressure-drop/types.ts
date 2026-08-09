import type {
  PipeHydraulicsStateResult,
} from '../shared/pipeHydraulicsCore.ts'

export interface PipeFlowRateFromPressureDropInput {
  diameter: number
  pipeLength: number

  fluidDensity: number
  dynamicViscosity: number

  absoluteRoughness: number
  minorLossCoefficient: number

  availablePressureDrop: number
}

export interface PipeFlowRateFromPressureDropResult
  extends PipeHydraulicsStateResult {
  volumetricFlowRate: number
  volumetricFlowRateCubicMetersPerHour: number
  volumetricFlowRateLitersPerSecond: number

  massFlowRate: number

  availablePressureDrop: number
  pressureDropResidual: number
  pressureDropResidualPercent: number

  iterationCount: number

  modelName: string
  limitationDescription: string
}
