import type {
  PipeHydraulicsStateResult,
} from '../shared/pipeHydraulicsCore.ts'

export interface NpshAvailableCavitationMarginInput {
  suctionPipeDiameter: number
  volumetricFlowRate: number
  suctionPipeLength: number

  fluidDensity: number
  dynamicViscosity: number

  absoluteRoughness: number
  suctionMinorLossCoefficient: number

  liquidSurfaceAbsolutePressure: number
  vaporPressure: number

  staticLiquidLevelAbovePump: number

  requiredNpsh: number
}

export interface NpshAvailableCavitationMarginResult
  extends PipeHydraulicsStateResult {
  liquidSurfaceAbsolutePressure: number
  vaporPressure: number

  surfacePressureHead: number
  vaporPressureHead: number
  pressureHeadAboveVapor: number

  staticLiquidLevelAbovePump: number
  suctionLineHeadLoss: number

  availableNpsh: number
  requiredNpsh: number

  npshMargin: number
  npshMarginPercent: number
  npshRatio: number

  cavitationStatus:
    | 'adequate'
    | 'insufficient'

  cavitationRisk: boolean

  modelName: string
  limitationDescription: string
}
