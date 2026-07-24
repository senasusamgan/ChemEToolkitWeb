export interface CentrifugeSigmaScaleUpInput {
  laboratoryThroughput: number
  laboratorySigma: number
  industrialSigma: number
  laboratoryEfficiency: number
  industrialEfficiency: number
}

export interface CentrifugeSigmaScaleUpResult {
  sigmaRatio: number
  efficiencyRatio: number
  predictedIndustrialThroughput: number
  equivalentClarificationVelocity: number
  requiredSigmaForTargetThroughput: number
  modelName: string
  limitationDescription: string
}
