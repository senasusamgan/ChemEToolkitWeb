import type {
  PipeHydraulicsStateResult,
} from '../shared/pipeHydraulicsCore.ts'

export interface DarcyWeisbachPipeDiameterSizingInput {
  volumetricFlowRate: number
  pipeLength: number

  fluidDensity: number
  dynamicViscosity: number

  absoluteRoughness: number
  minorLossCoefficient: number

  targetPressureDrop: number
}

export interface DarcyWeisbachPipeDiameterSizingResult
  extends PipeHydraulicsStateResult {
  requiredDiameter: number
  requiredDiameterMillimeters: number
  requiredDiameterInches: number

  targetPressureDrop: number
  pressureDropResidual: number
  pressureDropResidualPercent: number

  iterationCount: number

  modelName: string
  limitationDescription: string
}
