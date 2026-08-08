export type AbsorberSolventRateStatus =
  | 'minimum'
  | 'above-minimum'

export interface AbsorberMinimumSolventRateInput {
  gasMolarFlowRate: number
  inletGasSoluteMoleFraction: number
  outletGasSoluteMoleFraction: number
  inletLiquidSoluteMoleFraction: number
  equilibriumSlope: number
  solventDesignFactor: number
}

export interface AbsorberMinimumSolventRateResult {
  modelName: string
  limitationDescription: string
  status: AbsorberSolventRateStatus
  soluteRemovalRate: number
  pinchLiquidMoleFraction: number
  minimumLiquidToGasRatio: number
  minimumSolventMolarFlowRate: number
  designSolventMolarFlowRate: number
  designLiquidToGasRatio: number
  minimumAbsorptionFactor: number
  designAbsorptionFactor: number
  outletLiquidSoluteMoleFraction: number
  operatingLineSlope: number
  operatingLineIntercept: number
  bottomEquilibriumGasMoleFraction: number
  bottomDrivingForce: number
  solventMarginPercent: number
}
